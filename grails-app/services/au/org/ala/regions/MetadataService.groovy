package au.org.ala.regions

import grails.converters.JSON
import org.codehaus.groovy.grails.commons.ConfigurationHolder

class MetadataService {

    static transactional = true

    /**
     * Cache for metadata about 'objects' in 'fields' (eg individual states within the 'states' field).
     * This is populated by spatial services calls.
     */
    static regionCache = [:]
    static regionCacheLastRefreshed = [:]

    /**
     * Cache for metadata about region types (eg fid, layer name).
     * This is populated from external 'static' config.
     */
    static regionsMetadataCache = null

    /**
     * Cache for metadata about region objects that are layers rather than objects - the 'other' regions
     * This is populated from external 'static' config AND then enriched by spatial services calls.
     */
    static otherRegions = null
    //static otherRegionsCacheLastRefreshed = [:]

    static logReasonCache =loadLoggerReasons()

    /* cache management */
    def clearCaches = {
        regionsMetadataCache = null
        regionCache = [:]
        otherRegions = null
        logReasonCache=loadLoggerReasons()
    }

    static def loadLoggerReasons(){
        println("Refreshing the download reasons")
        String url = "http://logger.ala.org.au/service/logger/reasons"
        def conn = new URL(url).openConnection()
        def map = [:]
        try{
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            def result = JSON.parse(json)
            println("JSON :: " + json)
            println(result)
            result.each{
                map[it.id] = it.name
            }
            println("log reason map::" + map)
        } catch (Exception e){
            //load the default
            println("Using the default list...")
            return defaultRegionsMetadata
        }
        return map
    }



    /**
     * Get some metadata for a region.
     *
     * If name is defined then just return metadata for that named region
     * else for all regions of the specified type.
     *
     * @param type type of region
     * @param name optional name of the region (the 'object')
     * @return name, area, pid and bbox as a map for the named region or a map of all objects if no name supplied
     */
    def regionMetadata(type, name) {
        if (type == 'other') {
            return getOtherRegions()
        }
        def fid = fidFor(type)
        //println "MS: ${type} - ${fid}"
        def regionMd = getRegionMetadata(fid)
        if (name) {
            // if a specific region is named, then return that
            return regionMd[name]
        }
        else if (regionMd.values().size == 1){
            // if there is only one object in the field, return it
            return regionMd.values().iterator().next()
        }
        else {
            // return all objects in the field
            return regionMd
        }
    }

    /**
     * Return metadata for the specified field.
     * Use cached metadata if available and fresh.
     *
     * @param fid
     * @return
     */
    def getRegionMetadata(fid) {
        //println "checking cache for ${fid}: cache date is ${regionCacheLastRefreshed[fid]}; current date is ${new Date()}"
        if (!regionCache[fid] || new Date().after(regionCacheLastRefreshed[fid] + 2)) {
            regionCache[fid] = new TreeMap() // clear any stale content
            println "clearing cache for ${fid}"
            regionCacheLastRefreshed[fid] = new Date()
            //println "new cache date is ${regionCacheLastRefreshed[fid]}"
            def url = ConfigurationHolder.config.spatial.baseURL + 'ws/field/' + fid
            def conn = new URL(url).openConnection()
            try {
                conn.setConnectTimeout(10000)
                conn.setReadTimeout(50000)
                def json = conn.content.text
                def result = JSON.parse(json)
                result.objects.each {
                    // TODO: write type-specific closures to do this filtering
                    if (!(it.name in ['Unknown1', 'Macquarie Island', 'Ashmore and Cartier Islands', 'Coral Sea Islands'])) {
                        regionCache[fid].put it.name,
                                [name: it.name, pid: it.pid, bbox: parseBbox(it.bbox), area_km: it.area_km]
                    }
                }
            } catch (SocketTimeoutException e) {
                def message = "Timed out looking up pid. URL= ${url}."
                log.warn message
                println message
                return [error: true, errorMessage: message]
            } catch (Exception e) {
                def message = "Failed to lookup pid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
                log.warn message
                println message
                return [error: true, errorMessage: message]
            }
        }
        return regionCache[fid]
    }

    /**
     * Retrieve the specified property value for the specified layer.
     *
     * Will cause a service lookup if the property is not in the cache.
     *
     * @param name the human readable name of the layer (displayname)
     * @param property to be retrieved
     * @return the value of the specified property
     */
    def getLayerMetadata(name, property) {
        if (!getOtherRegions()[name]) {
            // we don't know about it
            // do hack lookup for now
            if (property == 'fid') {
                return fidForLayer(name)
            }
            else if (property == 'bbox') {
                return [minLat: -42, minLng: 113, maxLat: -14, maxLng: 153]
            }
            else {
                return null
            }
        }
        // check cache first
        def value = getOtherRegions()[name][property]
        //println "value of ${property} for ${name} is ${value}"
        if (!value) {
            // else lookup and load all properties
            getOtherRegions()[name] += lookupLayerMetadata(getOtherRegions()[name].layerName)
        }
        return getOtherRegions()[name][property]
    }

    /**
     * Uses the 'layers/more/<layerName>' service to retrieve metadata for a layer.
     *
     * @param layerName the name of the layer in geoserver
     * @return a map of available properties
     */
    def lookupLayerMetadata(layerName) {
        println "getting metadata for " + layerName
        def url = ConfigurationHolder.config.spatial.baseURL + "layers/more/" +
                layerName.encodeAsURL() + ".json"

        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            def more = JSON.parse(json).layer
            return [id: more.id, layerName: more.name, source: more.sourcelink, notes: more.notes,fid: "cl"+more.id,
                    bbox: [minLat: more.minlatitude, minLng: more.minlongitude,
                            maxLat: more.maxlatitude, maxLng: more.maxlongitude] ]
        } catch (SocketTimeoutException e) {
            log.warn "Timed out looking up layer details. URL= ${url}."
            [error: "Timed out looking up layer details."]
        } catch (Exception e) {
            log.warn "Failed to lookup layer details. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            [error: "Failed to lookup layer details. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
        }
    }

    /**
     * Get the fid (field id) of the layer that represents the specified region type.
     * @param regionType
     * @return
     */
    def fidFor(regionType) {
        switch (regionType) {
            case 'other': return 'other'
            default: return getRegionsMetadata()[regionType].fid
        }
    }

    /**
     * Get the bounding box for the specified region if known
     * else a sensible default.
     *
     * @param regionType
     * @param regionName
     * @return
     */
    Map lookupBoundingBox(regionType, regionName) {
        //println "MS: regionType=${regionType} regionName=${regionName}"
        if (regionType == 'layer') {
            return getLayerMetadata(regionName, 'bbox') as Map
        }
        def bbox = regionMetadata(regionType, regionName)?.bbox
        return bbox ?: [minLat: -42, minLng: 113, maxLat: -14, maxLng: 153]
    }

    /**
     * Returns list of types of regions.
     * @return
     */
    def getRegionTypes() {
        return getRegionsMetadata().collect {k,v -> v.name}
    }

    /**
     * Return metadata for region types.
     *
     * Uses cache if available
     * else external config
     * else the default set.
     * @return
     */
    def getRegionsMetadata() {
        // use cache if loaded
        if (regionsMetadataCache) {
            return regionsMetadataCache
        }
        // use external file if available
        def md = new File("/data/regions/config/regions-metadata.json")?.text
        if (md) {
            regionsMetadataCache = JSON.parse(md)
            return regionsMetadataCache
        }
        // last resort - use static metadata
        else {
            return defaultRegionsMetadata
        }
    }

    /**
     * Returns the metadata for region types as json.
     * @return
     */
    def getRegionsMetadataAsJson() {
        return getRegionsMetadata() as JSON
    }

    /**
     * Returns the metadata for regions as a javascript object literal.
     * @return
     */
    def getRegionsMetadataAsJavascript() {
        return "var REGIONS = {metadata: " + getRegionsMetadataAsJson() + "}"
    }

    /**
     * Use spatial services calls to inject additional metadata to the 'other' regions metadata.
     * @return
     */
    def populateOtherRegions() {
        otherRegions.each { key, obj ->
            //println "MS: ${key} " + lookupLayerMetadata(obj.layerName).bbox
            otherRegions[key] += lookupLayerMetadata(obj.layerName)
        }
//        otherRegionCacheLastRefreshed['other'] = new Date()
    }

    /**
     * Returns fully-populated metadata for 'other' regions.
     *
     * @return
     */
    def getOtherRegions() {
        // seed list of other regions if needed
        if (!otherRegions) {
            // use external file if available
            def md = new File("/data/regions/config/layer-regions-metadata.json")?.text
            if (md) {
                otherRegions = JSON.parse(md)
            }
            // last resort - use static metadata
            else {
                otherRegions = defaultOtherRegions.clone()
            }
            populateOtherRegions()
        }

        return otherRegions;
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

    /**
     * Returns the PID for a named region.
     * @param regionType
     * @param regionName
     * @return
     */
    def lookupPid(regionType, regionName) {
        if (regionType == 'layer') {
            return ""
        }
        return regionMetadata(regionType, regionName)?.pid
    }

    /**
     * Returns the layerName for the specified region type.
     * @param regionType
     * @return
     */
    String layerNameForType(regionType) {
        return getRegionsMetadata()[regionType]?.layerName
    }

    /**
     * Backup regions metadata - for when all other sources are unavailable
     */
    static defaultRegionsMetadata = [
            states: [name: 'states', layerName: 'aus1', fid: 'cl22', bieContext: 'aus_states', order: 0],
            lgas: [name: 'lgas', layerName: 'lga_aust', fid: 'cl959', bieContext: 'gadm_admin', order: 1],
            ibras: [name: 'ibras', layerName: 'ibra_merged', fid: 'cl20', bieContext: 'ibra_no_states', order: 2],
            imcras: [name: 'imcras', layerName: 'imcra4_pb', fid: 'cl21', bieContext: 'imcra', order: 3],
            nrms: [name: 'nrms', layerName: 'nrm_regions_2010', fid: 'cl916', bieContext: 'nrm', order: 4],
            other: [name: 'other', layerName: '', fid: 'other', bieContext: '', order: 5]
    ]

    static defaultLoggerReasons =[
            0: "conservation management/planning",
            1: "biosecurity management",
            2: "environmental impact, site assessment",
            3: "education",
            4: "scientific research",
            5: "collection management",
            6: "other",
            7: "ecological research",
            8: "systematic research",
            9: "other scientific research",
            10: "testing"
    ]

    /**
     * Backup other regions metadata - for when all other sources are unavailable
     */
    static defaultOtherRegions = [
            'Great Eastern Ranges': [
                    name: 'Great Eastern Ranges',
                    layerName: 'ger_national_corridor_20121031'
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

    /*********************************************************************************************************
     * The following methods supply metadata for 'sub-regions'. These are GER areas that are not directly
     * accessible from the regions front page. They are currently included to show the potential for region
     * exploration.
     *
     * We need a plan for dealing with these 'sub-areas' before we can externalise the config properly.
     ********************************************************************************************************/

    /**
     * Returns the layer name for a specified 'other' region.
     *
     * @param name
     * @return
     */
    String lookupLayerName(name) {
        switch (name.toLowerCase()) {
            case "great eastern ranges": return "ger_national_corridor_20121031" //replaces ger_geri_boundary_v102_australia
            case "ramsar wetland regions": return "ramsar"
            case "hunter": return "ger_hunter_valley_20121031" //replaces ger_hunter
            case "slopes to summit": return "ger_slopes_to_summit_20121031" //replaces ger_slopes_to_summit
            case "kosciuszko to coast": return "ger_kosciuszko2coast_20121031" //replaces ger_kosciuszko_to_coast
            case "border ranges": return "ger_border_ranges_20121031" //replaces ger_border_ranges
            //case "k2c management regions": return "ger_k2c_management_regions_oct2009"
            //case "s2s priority area billabong creek": return "ger_s2s_priority_area_billabong_creek_v01";
            //case "s2s priority areas": return "ger_s2s_priority_areas_v05";
            //case "hunter areas of interest": return "ger_hunter_areas_of_interest";
            //case "upper hunter focus area": return "ger_upper_hunter_focus_area_v2";
            case "myrtle rust observations": return "myrtle_rust";
            case "kanangra wyangala": return "ger_kanangra_wyangala_20121031";
            case "jaliigirr": return "ger_jaliigirr_20121031";
            case "illawarra shoalhaven": return "ger_illawarra_shoalhaven_20121031";
            case "southern highlands": return "ger_southern_highlands_20121031";
            default: return metadataService.regionMetadata('other',null)[name]?.layerName
        }
    }

    /**
     * Defines a hierarchy for GER sub-regions.
     *
     * @param name
     * @return
     */
    Map lookupParentChain(name) {
        switch (name.toLowerCase()) {
            case "hunter": return [type:'layer',name:'Great Eastern Ranges']
            case "slopes to summit": return [type:'layer',name:'Great Eastern Ranges']
            case "kosciuszko to coast": return [type:'layer',name:'Great Eastern Ranges']
            case "border ranges": return [type:'layer',name:'Great Eastern Ranges']
            //case "k2c management regions": return [type:'layer',name:'Great Eastern Ranges', child: [type:'layer',name:'Kosciuszko to coast']]
            //case "s2s priority area billabong creek": return [type:'layer',name:'Great Eastern Ranges', child: [type:'layer',name:'Slopes to summit']]
            //case "s2s priority areas": return [type:'layer',name:'Great Eastern Ranges', child: [type:'layer',name:'Slopes to summit']]
            //case "hunter areas of interest": return [type:'layer',name:'Great Eastern Ranges', child: [type:'layer',name:'Hunter']]
            //case "upper hunter focus area": return [type:'layer',name:'Great Eastern Ranges', child: [type:'layer',name:'Hunter']]
            case "kanangra wyangala": return [type:'layer',name:'Great Eastern Ranges']
            case "jaliigirr": return [type:'layer',name:'Great Eastern Ranges']
            case "illawarra shoalhaven": return [type:'layer',name:'Great Eastern Ranges']
            case "southern highlands": return [type:'layer',name:'Great Eastern Ranges']
            default: return [:]
        }
    }

    /**
     * Returns a description for GER sub-regions to simulate richer region metadata.
     * @param name
     * @return
     */
    String lookupDescription(name) {
        switch (name.toLowerCase()) {
            case "great eastern ranges": return "The 1,200 km New South Wales section of the Great Eastern Ranges will help protect water supplies for over 93% of eastern Australia's population, our richest assemblages of plants and animals, and significant nature-based tourism assets."
            case "hunter": return 'The Hunter Valley is one of only 3 areas on the eastern seaboard where inland ecosystems extend over the ranges toward the coast. It contains a mix of rich ecosystems at risk from urban and industrial development and coal mining.'
            case "slopes to summit": return 'The S2S area connects inland temperate woodland and grassland ecosystems with intact and well-conserved mountain forests and alpine ecosystems.'
            case "kosciuszko to coast": return 'The Kosciusko to Coast region links the Australian Alps National Parks through natural temperate grasslands and woodlands to tablelands, forests and coastal ecosystems.'
            case "border ranges": return "The Border Ranges is one of Australia's most biologically diverse regions, a spectacular backdrop to local communities, and home to many unique plants and animals. It is part of the World Heritage listed Gondwana Rainforests of Australia."
            //case "k2c management regions": return ''
            //case "s2s priority area billabong creek": return ''
            //case "s2s priority areas": return ''
            //case "hunter areas of interest": return ''
            case "southern highlands": return 'Although many parts of the Southern Highlands have been extensively cleared for agriculture and urban expansion. It contains 4 north-south habitat links and is significant for coastal wetland birds travelling inland during wetter seasons.'
            case "kanangra wyangala": return ''
            case "jaliigirr": return ''
            case "illawarra shoalhaven": return ''
            default: return ""
        }
    }

    /**
     * Returns the fid (field identifier) for GER sub-regions.
     *
     * @param region
     */
    private fidForLayer(region) {
        switch (region) {
            case "Great Eastern Ranges": return "cl1068" //replaces cl904;
            case "RAMSAR wetland regions": return "cl935";
            case "Hunter": return "cl1063"; //replaces cl905
            case "Border Ranges": return "cl1062"; //replaces cl903
            case "Kosciuszko to coast": return "cl1067"; //replaces cl909
            case "Slopes to summit": return "cl1069"; //replaces cl912
            //case "K2C Management Regions": return "cl908";
            //case "S2S Priority Area Billabong Creek": return "cl910";
            //case "S2S Priority Areas": return "cl911";
            //case "Hunter Areas of Interest": return "cl907";
            //case "Upper Hunter Focus Area": return "cl913";
            case "Myrtle Rust Observations": return "cl934";
            case "Southern Highlands": return 'cl1070';
            case "Kanangra Wyangala": return 'cl1066';
            case "Jaliigirr": return 'cl1065';
            case "Illawarra Shoalhaven": return 'cl1064';
            default: return metadataService.regionMetadata('other',null)[region]?.fid
        }
    }

}
