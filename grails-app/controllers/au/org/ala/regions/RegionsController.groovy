package au.org.ala.regions

import grails.converters.JSON
import grails.util.GrailsUtil
import org.apache.commons.lang.StringEscapeUtils
import org.springframework.core.io.support.PathMatchingResourcePatternResolver

import java.util.regex.Pattern

class RegionsController {

    def metadataService

    static defaultAction = 'regions'

    /**
     * Do logouts through this app so we can invalidate the session.
     *
     * @param casUrl the url for logging out of cas
     * @param appUrl the url to redirect back to after the logout
     */
    def logout = {
        session.invalidate()
        redirect(url: "${params.casUrl}?url=${params.appUrl}")
    }

    def clearCache = {
        metadataService.clearCaches()
        render "<div>All caches cleared.</div>"
    }

    def clearTemplateCache = {
        hf.clearCache()
        render "<div>Template cache cleared.</div>"
    }

    /**
     * Display the top-level regions page.
     */
    def regions = {
        [ "menu": metadataService.getMenu()]
    }

    def documents = {
        render "Not implemented yet"
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
    def regionList = {

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

    /**
     * Show the descriptive page for a region.
     *
     * @param regionType type of region eg states, ibras - 'layer' indicates the region is a layer of its own
     * @param regionName the name of the object in the layer eg Tasmania
     * @param pid the id of the object - optional
     */
    def region = {
        def region = [:]
        // This decoding process is required because some region names contain a lot of unsafe characters
        region.name = URLDecoder.decode(params.regionName.replace("%253B", "%3B"), 'UTF-8')
        region.name = StringEscapeUtils.unescapeHtml(region.name)
        log.debug("Requested Region name = $region.name")

        region.type = params.regionType
        region.pid = params.pid ?: metadataService.lookupPid(region.type, region.name)
        region.bbox = metadataService.lookupBoundingBox(region.type, region.name)

        def error = ""
        def emblemGuids = [:]
        def subRegions = [:]
        region.gid = 0  // in case none other specified

        //get the menu item for the regionType
        def menu = null
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
                            println message
                        } else {
                            subRegions.put(r.label, [list: list, name: name])
                        }
                    }
                }
            }

            region.q = URLEncoder.encode(metadataService.buildRegionFacet(region.fid, region.type, region.name, region.pid), "UTF-8")
        } else {
            region.q = URLEncoder.encode(metadataService.buildRegionFacet(region.fid, region.type, region.name, region.pid), "UTF-8")
        }

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

        // Documents will render under the map on the layer page. They were previously used by the GER region page, currently unused.
        def docs = [:]
        // render
        [
                region: region, emblems: emblemGuids, subRegions: subRegions,
                documents: docs, useReflect: params.reflect == 'false' ? false : true,
                alertsUrl: metadataService.buildAlertsUrl(region)
        ]
    }

    def reloadConfig = {
        // clear cached external config
        clearCache()

        // reload system config
        def resolver = new PathMatchingResourcePatternResolver()
        def resource = resolver.getResource(grailsApplication.config.reloadable.cfgs[0])
        def stream

        try {
            stream = resource.getInputStream()
            ConfigSlurper configSlurper = new ConfigSlurper(GrailsUtil.getEnvironment())
            if (resource.filename.endsWith('.groovy')) {
                def newConfig = configSlurper.parse(stream.text)
                grailsApplication.getConfig().merge(newConfig)
            } else if (resource.filename.endsWith('.properties')) {
                def props = new Properties()
                props.load(stream)
                def newConfig = configSlurper.parse(props)
                grailsApplication.getConfig().merge(newConfig)
            }
            String res = "<ul>"
            grailsApplication.config.each { key, value ->
                if (value instanceof Map) {
                    res += "<p>" + key + "</p>"
                    res += "<ul>"
                    value.each { k1, v1 ->
                        res += "<li>" + k1 + " = " + v1 + "</li>"
                    }
                    res += "</ul>"
                } else {
                    res += "<li>${key} = ${value}</li>"
                }
            }
            render res + "</ul>"
        }
        catch (GroovyRuntimeException gre) {
            println "Unable to reload configuration. Please correct problem and try again: " + gre.getMessage()
            render "Unable to reload configuration - " + gre.getMessage()
        }
        finally {
            stream?.close()
        }

    }

}
