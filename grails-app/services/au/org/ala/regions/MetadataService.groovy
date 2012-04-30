package au.org.ala.regions

import grails.converters.JSON
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class MetadataService {

    static transactional = true

    static regionMetadata = [
            states: [name: 'states', layerName: 'aus1', fid: 'cl22', bieContext: 'aus_states', order: 0],
            lgas: [name: 'lgas', layerName: 'lga_aust', fid: 'cl959', bieContext: 'gadm_admin', order: 1],
            ibras: [name: 'ibras', layerName: 'ibra_merged', fid: 'cl20', bieContext: 'ibra_no_states', order: 2],
            imcras: [name: 'imcras', layerName: 'imcra4_pb', fid: 'cl21', bieContext: 'imcra', order: 3],
            nrms: [name: 'nrms', layerName: 'nrm_regions_2010', fid: 'cl916', bieContext: 'nrm', order: 4],
            other: [name: 'other', layerName: '', fid: 'other', bieContext: '', order: 5]
    ]

    static otherRegions = [
            'Great Eastern Ranges': [
                    name: 'Great Eastern Ranges',
                    layerName: 'ger_geri_boundary_v102_australia'
            ],
            'RAMSAR wetland regions': [
                    name: 'RAMSAR wetland regions',
                    layerName: 'ramsar'
            ],
            'Directory of Important Wetlands': [
                    name: 'Directory of Important Wetlands',
                    layerName: 'diwa_type_criteria'
            ],
            'Areas for Further Assessment within the East Marine Region': [
                    name: 'Areas for Further Assessment within the East Marine Region',
                    layerName: 'east_afa_final'
            ],
            'Australian Coral Ecoregions': [
                    name: 'Australian Coral Ecoregions',
                    layerName: 'australian_coral_ecoregions'
            ],
            'Collaborative Australian Protected Areas Database': [
                    name: 'Collaborative Australian Protected Areas Database',
                    layerName: 'capad08_ext'
            ],
            'Exclusive Economic Zone': [
                    name: 'Exclusive Economic Zone',
                    layerName: 'eez_poly'
            ],
            'Myrtle Rust Observations': [
                    name: 'Myrtle Rust Observations',
                    layerName: 'myrtle_rust'
            ]
    ]

    def getRegionTypes() {
        return regionMetadata.collect {k,v -> v.name}
    }

    def getRegionFid(name) {
        return regionMetadata[name]?.fid
    }

    def getMetadataAsJson() {
        return (regionMetadata as JSON).toString()
    }

    def getMetadataAsJavascript() {
        return "var REGIONS = {metadata: " + getMetadataAsJson() + "}"
    }

    def getOtherRegions() {
        return otherRegions.clone();
    }

    def getStateEmblems() {
        def json = JSON.parse(new FileInputStream("/data/regions/config/state-emblems.json"), "UTF-8")
        return json
    }

    /**
     * Get a list of the objects in a layer and the available metadata.
     *
     * @param fid id of the 'field' (type of region)
     * @return name, area, pid and bbox as a map for all objects
     */
   def getObjectsForALayer(fid) {
        def results = [:]
        def url = ConfigurationHolder.config.spatial.baseURL + 'layers-service/field/' + fid
        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            def result = JSON.parse(json)
            result.objects.each {
                results.put it.name,
                        [name: it.name, pid: it.pid, bbox: parseBbox(it.bbox), area_km: it.area_km]
            }
        } catch (SocketTimeoutException e) {
            log.warn "Timed out looking up fid. URL= ${url}."
            println "Timed out looking up fid. URL= ${url}."
        } catch (Exception e) {
            log.warn "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            println "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
        }
        return results
    }

    /**
     * Converts a bounding box from a polygon format to min/max*lat/lng format.
     *
     * @param bbox as polygon eg bbox: POLYGON((158.684997558594 -55.116943359375,158.684997558594 -54.4854164123535,
     * 158.950012207031 -54.4854164123535,158.950012207031 -55.116943359375,158.684997558594 -55.116943359375))
     * @return
     */
    def parseBbox(String bbox) {
        //println "bbox = ${bbox}"
        if (!bbox) return [:]

        def coords = bbox[9..-3]
        def corners = coords.tokenize(',')
        def sw = corners[0].tokenize(' ')
        def ne = corners[2].tokenize(' ')
        return [minLat: sw[1], minLng: sw[0], maxLat: ne[1], maxLng: ne[0]]
    }

}
