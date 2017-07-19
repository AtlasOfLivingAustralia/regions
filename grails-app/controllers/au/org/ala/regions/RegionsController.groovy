package au.org.ala.regions

import grails.converters.JSON
import org.apache.commons.lang.StringEscapeUtils

import java.util.regex.Pattern

class RegionsController {

    def metadataService

    /**
     * Display the top-level regions page.
     */
    def regions() {
        [ "menu": metadataService.getMenu()]
    }

    /**
     * Returns a JSON object describing the regions (aka objects) in the specified type of region (aka field).
     *
     * Note the data is returned as both a list of names (so sort order is maintained) and a map of objects with
     * properties (so they can be looked up efficiently).
     *
     * @param type the type of region - states, lgas, ibras, imcrs, nrms, other
     * @return
     * names is an alphabetically sorted list of the names of the regions
     *  objects is a map of objects holding the properties of the region, keyed by name
     */
    def regionList() {

        // get the list
        def map = metadataService.getMenuItems(params.type)

        def result

        if (map.error) {
            // render error
            result = map
        } else {
            // render as a list and a map
            result = [names: map.keySet().sort(), objects: map]
        }

        render result as JSON
    }

    def region() {
        loadRegion(params)
    }

    def habitat() {
        def model = loadRegion(params)
        model.enableRegionOverlay = false
        model.isHabitat = true
        render(view: 'region', model: model)
    }

    /**
     * Show the descriptive page for a region.
     *
     * @param regionType type of region eg states, ibras - 'layer' indicates the region is a layer of its own
     * @param regionName the name of the object in the layer eg Tasmania
     * @param pid the id of the object - optional
     */
    def loadRegion(params) {

        def region = [:]
        def menu = [:]

        if(params.pid){
            def metadata = metadataService.getObjectByPid(params.pid)
            region.name = metadata.name
            region.pid = metadata.pid
            region.type = "layer"
            region.bbox = metadataService.parseBbox(metadata.bbox)
            menu.fid = metadata.fid
        } else {
            // This decoding process is required because some region names contain a lot of unsafe characters
            region.name = URLDecoder.decode(params.regionName.replace("%253B", "%3B"), 'UTF-8')
            region.name = StringEscapeUtils.unescapeHtml(region.name)
            log.debug("Requested Region name = $region.name")

            region.type = params.regionType
            region.pid = params.pid ?: metadataService.lookupPid(region.type, region.name)
            region.bbox = metadataService.lookupBoundingBox(region.type, region.name)
        }

        def emblemGuids = [:]
        def subRegions = [:]
        region.gid = 0  // in case none other specified

        //get the menu item for the regionType
        metadataService.getMenu().each { v ->
            if (v.label.equals(region.type)) {
                menu = v
            }
        }

        //get submenu menu item if applicable
        if (menu.submenu != null) {
            menu.submenu.each { v ->
                if (v.label.equals(region.name) || v.label.equals(params.parent)) {
                    menu = v
                }
            }
        }

        //get subregion menu item if applicable
        if (params.parent != null && menu.subregions != null) {
            menu.subregions.each { v ->
                v.regions_within.each { rw ->
                    rw.regions.each { r ->
                        if (r.label.equals(region.name)) {
                            menu = r
                        }
                    }
                }
            }

            region.parent = [:]
            region.parent.name = params.parent
            region.parent.type = region.type
        }

        region.layerName = metadataService.getLayerNameForFid(menu.fid)
        region.fid = menu.fid

        if (menu.source) {
            region.source = menu.source
        }

        if (menu.notes) {
            region.notes = menu.notes
        }

        if (menu.description) {
            region.description = menu.description
        }

        if (menu != null && menu.subregions) {
            menu.subregions.each { v ->
                if (Pattern.matches(v.match_exp, region.name)) {
                    v.regions_within.each { r ->
                        def list = []
                        r.regions.each { i ->
                            list.add(i.label)
                        }
                        def name = null
                        metadataService.getMenu().each { m ->
                            if (m.fid.equals(r.fid)) {
                                name = m.label
                            }
                        }
                        if (name == null) {
                            def message = "Failed to get layer name for fid=" + r.fid
                            log.warn message
                        } else {
                            subRegions.put(r.label, [list: list, name: name])
                        }
                    }
                }
            }
        }

        region.q = URLEncoder.encode(metadataService.buildRegionFacet(region.fid, region.type, region.name, region.pid), "UTF-8")

        if (region.type == 'states') {
            // lookup state emblems
            def emblems = metadataService.getStateEmblems()[region.name]
            if (emblems) {
                ['animal', 'plant', 'marine', 'bird'].each {
                    if (emblems[it]) {
                        emblemGuids[it + 'Emblem'] = emblems."${it}".guid
                    }
                }
            }
        }
        [
                region    : region,
                emblems   : emblemGuids,
                subRegions: subRegions,
                useReflect: params.reflect != 'false',
                alertsUrl : metadataService.buildAlertsUrl(region)
        ]
    }
}
