package au.org.ala.regions

import au.org.ala.regions.binding.DownloadParams
import au.org.ala.web.AuthService
import grails.converters.JSON
import grails.util.Holders
import groovyx.net.http.RESTClient
import groovyx.net.http.URIBuilder
import org.apache.commons.lang.StringEscapeUtils

import javax.annotation.PostConstruct

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

    static logReasonCache =loadLoggerReasons()

    /* cache management */
    def clearCaches = {
        regionsMetadataCache = null
        regionCache = [:]

        logReasonCache=loadLoggerReasons()
        layersServiceFields = [:]
        layersServiceLayers = [:]
        menu = null
    }

    def grailsApplication

    AuthService authService

    static final Map DOWNLOAD_OPTIONS = [
            0: 'Download All Records',
            1: 'Download Species Checklist',
            2: 'Download Species FieldGuide'
    ]


    final static String WS_DATE_FROM_PREFIX = "-01-01T00:00:00Z"
    final static String WS_DATE_TO_PREFIX = "-12-31T23:59:59Z"
    final static String WS_DATE_FROM_DEFAULT = "1850"
    final static String PAGE_SIZE = "50"

    String BIE_URL, BIOCACHE_URL, ALERTS_URL, DEFAULT_IMG_URL
    String CONFIG_DIR

    @PostConstruct
    def init() {
        BIE_URL = grailsApplication.config.bie.baseURL
        BIOCACHE_URL = grailsApplication.config.biocache.baseURL
        DEFAULT_IMG_URL = "${BIE_URL}/static/images/noImage85.jpg"
        ALERTS_URL = grailsApplication.config.alerts.baseURL
        CONFIG_DIR = grailsApplication.config.config_dir
    }

    /**
     *
     * @param regionName
     * @return List<Map< with format: [[imgUrl: ...,<br/>
     * scientificName: ...,<br/>
     * commonName: ..., <br/>
     * speciesUrl: ..., <br/>
     * emblemType: ...], ...]
     */
    List<Map> getEmblemsMetadata(String regionName) {
        Map emblemGuids = [:]

        // lookup state emblems
        def emblems = getStateEmblems()[regionName]
        if (emblems) {
            ['animal','plant','marine','bird'].each {
                if (emblems[it]) {
                    emblemGuids[it] = emblems."${it}".guid
                }
            }
        }

        List<Map> emblemMetadata = []

        emblemGuids.sort({it.key}).each {key, guid ->
            String emblemInfoUrl = "${BIE_URL}/ws/species/moreInfo/${guid}.json"
            def emblemInfo = new RESTClient(emblemInfoUrl).get([:]).data
            emblemMetadata << [
                "imgUrl":  emblemInfo?.images && emblemInfo?.images[0]?.thumbnail ? emblemInfo?.images[0]?.thumbnail : DEFAULT_IMG_URL,
                "scientificName": emblemInfo?.taxonConcept?.nameString,
                "commonName": emblemInfo?.commonNames && emblemInfo?.commonNames?.size() > 0 ? emblemInfo?.commonNames[0]?.nameString : "",
                "speciesUrl": "${BIE_URL}/species/${guid}",
                "emblemType": "${key.capitalize()} emblem"
            ]
        }

        return emblemMetadata
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @return
     */
    List getGroups(String regionFid, String regionType, String regionName, String regionPid) {
        def responseGroups = new RESTClient("${BIOCACHE_URL}/ws/explore/hierarchy").get([:]).data
        Map subgroupsWithRecords = getSubgroupsWithRecords(regionFid, regionType, regionName, regionPid)

        List groups = [] << [name: 'ALL_SPECIES', commonName: 'ALL_SPECIES']
        responseGroups.each {group ->
            groups << [name: group.speciesGroup, commonName: group.speciesGroup]
            group.taxa.each {subgroup ->
                if (subgroupsWithRecords[subgroup.common]) {
                    groups << [name: subgroup.name, commonName: subgroup.common, parent: group.speciesGroup]
                }
            }
        }
        return groups
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @return
     */
    Map getSubgroupsWithRecords(String regionFid, String regionType, String regionName, String regionPid) {
        String url = new URIBuilder("${BIOCACHE_URL}/ws/occurrences/search").with {
            query = [
                    q: buildRegionFacet(regionFid, regionType, regionName, regionPid),
                    facets: 'species_subgroup',
                    flimit: '-1',
                    pageSize: 0
            ]

            return it
        }.toString()

        log.debug("URL to retrieve subgroups with records = $url")

        def response = new RESTClient(url).get([:]).data

        Map subgroups = [:]
        response?.facetResults[0]?.fieldResult.each {subgroup ->
            subgroups << [(subgroup.label): subgroup.count]
        }

        return subgroups
    }
/**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param groupName
     * @param isSubgroup
     * @param from
     * @param to
     * @return
     */
    def getSpecies(String regionFid, String regionType, String regionName, String regionPid, String groupName, Boolean isSubgroup = false, String from = null, String to = null, String pageIndex = '0') {
        def response = new RESTClient(buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName == 'ALL_SPECIES' ? null : groupName, isSubgroup, from, to, pageIndex)).get([:]).data
        return [
                totalRecords: response.totalRecords,
                records: response.facetResults[0]?.fieldResult.collect {result ->
                    List info = Arrays.asList(result.label.split('\\|'))
                    return [
                            name: info.get(0),
                            guid: info.get(1),
                            commonName: info.size() == 5 ? info.get(2) : '',
                            count: result.count
                    ]
                }
        ]
    }

    /**
     *
     * @param region
     * @return
     */
    String buildAlertsUrl(Map region) {
        URLDecoder.decode(new URIBuilder("${ALERTS_URL}/webservice/createBiocacheNewRecordsAlert").with {
            query = [
                    webserviceQuery: "/occurrences/search?q=${buildRegionFacet(region.fid, region.type, region.name, region.pid)}",
                    uiQuery: "/occurrences/search?q=${buildRegionFacet(region.fid, region.type, region.name, region.pid)}",
                    queryDisplayName: region.name,
                    baseUrlForWS: "${BIOCACHE_URL}/ws",
                    baseUrlForUI: "${BIOCACHE_URL}&resourceName=Atlas"
            ]
            return it
        }.toString(), 'UTF-8')
    }

    /**
     *
     * @param guid
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param from
     * @param to
     * @return
     */
    String buildSpeciesRecordListUrl(String guid, String regionFid, String regionType, String regionName, String regionPid, String from, String to) {
        StringBuilder sb = new StringBuilder("${BIOCACHE_URL}/occurrences/search?q=lsid:\"${guid}\"" +
                "&fq=${buildRegionFacet(regionFid, regionType, regionName, regionPid)}")
        if (isValidTimeRange(from, to)) {
            " AND ${buildTimeFacet(from, to)}"
        }

        return sb.toString()
    }

    /**
     *
     * @param downloadParams
     * @return
     */
    String buildDownloadRecordsUrl(DownloadParams downloadParams,String regionFid, String regionType, String regionName, String regionPid, String groupName = null, Boolean isSubgroup = false, String from = null, String to = null) {
        String url
        Map params = buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, isSubgroup, from, to)
        String wsUrl
        switch (downloadParams.downloadOption) {
            case '0':
                // Download All Records
                wsUrl = "${BIOCACHE_URL}/ws/occurrences/index/download"
                params << [
                        email: downloadParams.email,
                        reasonTypeId: downloadParams.downloadReason,
                        file: downloadParams.fileName
                ]
                break
            case '1':
                // Download Species Checklist
                wsUrl = "${BIOCACHE_URL}/ws/occurrences/facets/download"
                params << [
                        facets: "species_guid",
                        lookup: true,
                        file: downloadParams.fileName
                ]
                break

            case '2':
                // Download Species FieldGuide
                wsUrl = "${BIOCACHE_URL}/occurrences/fieldguide/download"
                params << [
                        facets: "species_guid"
                ]
                break
        }

        url = new URIBuilder(wsUrl).with {
            query = params
            return it
        }.toString()
        log.debug "Download Records (${downloadParams.downloadOption}) - REST URL generated = ${url}"
        return url
    }

    /**
     *
     * @return
     */
    String buildDownloadRecordsUrlPrefix(int option, String regionFid, String regionType, String regionName, String regionPid, String groupName = null, Boolean isSubgroup = false, String from = null, String to = null) {
        String url
        Map params = buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, isSubgroup, from, to)
        String wsUrl
        switch (option) {
            case '0':
                // Download All Records
                wsUrl = "${BIOCACHE_URL}/ws/occurrences/index/download"
                break
            case '1':
                // Download Species Checklist
                wsUrl = "${BIOCACHE_URL}/ws/occurrences/facets/download"
                params << [
                        facets: "species_guid",
                        lookup: true
                ]
                break

            case '2':
                // Download Species FieldGuide
                wsUrl = "${BIOCACHE_URL}/occurrences/fieldguide/download"
                params << [
                        facets: "species_guid"
                ]
                break
        }

        url = new URIBuilder(wsUrl).with {
            query = params
            return it
        }.toString()
        log.debug "Download Records prefix (${option}) - REST URL generated = ${url}"
        return url
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param groupName
     * @param isSubgroup
     * @param from
     * @param to
     * @return
     */
    private Map buildCommonDownloadRecordsParams(String regionFid, String regionType, String regionName, String regionPid, String groupName = null, Boolean isSubgroup = false, String from = null, String to = null) {
        Map params = [
                q : buildRegionFacet(regionFid, regionType, regionName, regionPid),
        ]

        if (groupName && isSubgroup) {
            params << [fq: "species_subgroup:\"${groupName}\""]
        } else if (groupName && groupName != 'ALL_SPECIES') {
            params << [fq: "species_group:\"${groupName}\""]
        }

        if (isValidTimeRange(from, to)) {
            params << [fq: params.fq + ' AND ' + buildTimeFacet(from, to)]
        }

        return params
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param groupName
     * @param isSubgroup
     * @param from
     * @param to
     * @param pageIndex
     * @return
     */
    String buildBiocacheSearchOccurrencesWsUrl(String regionFid, String regionType, String regionName, String regionPid, String groupName = null, Boolean isSubgroup = false, String from = null, String to = null, String pageIndex = '0') {
        String url = new URIBuilder("${BIOCACHE_URL}/ws/occurrences/search").with {
            query = buildSearchOccurrencesWsParams(regionFid, regionType, regionName, regionPid, groupName, isSubgroup, from, to, pageIndex)
            return it
        }.toString()
        log.debug "REST URL generated = ${url}"
        return url
    }


    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param groupName
     * @param isSubgroup
     * @param from
     * @param to
     * @param pageIndex
     * @return
     */
    private Map buildSearchOccurrencesWsParams(String regionFid, String regionType, String regionName, String regionPid, String groupName = null, Boolean isSubgroup = false, String from = null, String to = null, String pageIndex = "0") {
        Map params =  [
                q : buildRegionFacet(regionFid, regionType, regionName, regionPid),
                facets: 'names_and_lsid',
                fsort: 'taxon_name',
                pageSize : 0,
                flimit: PAGE_SIZE,
                foffset: Integer.parseInt(pageIndex) * Integer.parseInt(PAGE_SIZE),
                fq: 'rank:(species OR subspecies)'
        ]

        if (groupName && isSubgroup) {
            params << [fq: params.fq + ' AND ' + "species_subgroup:\"${groupName}\""]
        } else if (groupName) {
            params << [fq: params.fq + ' AND ' + "species_group:\"${groupName}\""]
        }

        if (isValidTimeRange(from, to)) {
            params << [fq: params.fq + ' AND ' + buildTimeFacet(from, to)]
        }

        return params
    }

    private boolean isValidTimeRange(String from, String to) {
        return from && to && (from != WS_DATE_FROM_DEFAULT|| to != Calendar.getInstance().get(Calendar.YEAR).toString())
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @return
     */
    public String buildRegionFacet(String regionFid, String regionType, String regionName, String regionPid) {
        //unescape regionName for q term creation
        def name = StringEscapeUtils.unescapeHtml(regionName)

        regionPid == null || regionPid.isEmpty() ? "-${regionFid}:n/a AND ${regionFid}:*" : "${regionFid}:\"${name}\""
    }

    /**
     *
     * @param from
     * @param to
     * @return
     */
    public String buildTimeFacet(String from, String to) {
        from = from.equals(WS_DATE_FROM_DEFAULT) ? "*" : from + WS_DATE_FROM_PREFIX
        to = to.equals(Calendar.getInstance().get(Calendar.YEAR).toString()) ? "*" : to + WS_DATE_TO_PREFIX
        "occurrence_year:[${from} TO ${to}]"
    }

    static def loadLoggerReasons(){
        println("Refreshing the download reasons")
        String url = "${Holders.config.logger.baseURL}/service/logger/reasons"
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
            return defaultLoggerReasons
        }
        return map
    }



    /**
     * Get some metadata for a region (top level menu).
     *
     * If name is defined then just return metadata for that named region
     * else for all regions of the specified type.
     *
     * @param type type of region
     * @param name optional name of the region (the 'object')
     * @return name, area, pid and bbox as a map for the named region or a map of all objects if no name supplied
     */
    def regionMetadata(type, name) {
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
            log.debug("clearing cache for ${fid}")
            regionCacheLastRefreshed[fid] = new Date()
            //println "new cache date is ${regionCacheLastRefreshed[fid]}"
            def url = grailsApplication.config.layersService.baseURL + '/field/' + fid
            def conn = new URL(url).openConnection()
            try {
                conn.setConnectTimeout(10000)
                conn.setReadTimeout(50000)
                def json = conn.content.text
                def result = JSON.parse(json)
                result.objects.each {
                    regionCache[fid].put it.name,
                            [name: it.name, pid: it.pid, bbox: parseBbox(it.bbox), area_km: it.area_km]
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
     * Get the fid (field id) of the layer that represents the specified region type.
     * @param regionType
     * @return
     */
    def fidFor(regionType) {
        return getRegionsMetadata()[regionType].fid
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
        if (regionsMetadataCache != null) {
            return regionsMetadataCache
        }

        //update
        def md = [:]
        int i = 0
        getMenu().each{ v ->
            md.put(v.label, [
                    name: v.label,
                    layerName: v.layerName,
                    fid: v.fid,
                    bieContext: "not in use",
                    order: i
            ])

            i++
        }
        regionsMetadataCache = md
        return regionsMetadataCache
    }

    def layersServiceLayers = [:]
    def getLayersServiceLayers() {
        if (layersServiceLayers.size() > 0) {
            return layersServiceLayers
        }

        def results = [:]
        def url = grailsApplication.config.layersService.baseURL + '/layers'
        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            def result = JSON.parse(json)
            def map = [:]
            result.each { v ->
                map.put String.valueOf(v.id), v
            }
            layersServiceLayers = map
        } catch (SocketTimeoutException e) {
            log.warn "Timed out looking up fid. URL= ${url}."
            println "Timed out looking up fid. URL= ${url}."
        } catch (Exception e) {
            log.warn "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            println "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
        }

        return layersServiceLayers
    }

    def layersServiceFields = [:]
    def getLayersServiceFields() {
        if (layersServiceFields.size() > 0) {
            return layersServiceFields
        }

        def results = [:]
        def url = grailsApplication.config.layersService.baseURL + '/fields'
        def conn = new URL(url).openConnection()
        try {
            conn.setConnectTimeout(10000)
            conn.setReadTimeout(50000)
            def json = conn.content.text
            def result = JSON.parse(json)
            def map = [:]
            result.each { v ->
                map.put v.id, v
            }
            layersServiceFields = map
        } catch (SocketTimeoutException e) {
            log.warn "Timed out looking up fid. URL= ${url}."
            println "Timed out looking up fid. URL= ${url}."
        } catch (Exception e) {
            log.warn "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            println "Failed to lookup fid. ${e.getClass()} ${e.getMessage()} URL= ${url}."
        }

        return layersServiceFields
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

    def getStateEmblems() {
        def json = JSON.parse(new FileInputStream(CONFIG_DIR + "/state-emblems.json"), "UTF-8")
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
        def url = grailsApplication.config.layersService.baseURL + '/field/' + fid
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

    def getLayerNameForFid(String fid) {
        def layerName = null
        def layer = getLayerForFid(fid)
        if (layer != null) {
            layerName = layer.name
        }
        layerName
    }

    def getLayerForFid(String fid) {
        def layer = null
        def lsf = getLayersServiceFields().get(fid)
        if (lsf != null) {
            layer = getLayersServiceLayers().get(lsf.spid)
        }
        layer
    }

    def menu
    def getMenu() {
        if (menu == null) {
            // use external file if available
            def md = new File(CONFIG_DIR + "/menu-config.json")?.text
            if (!md) {
                //use default resource
                md = new File(this.class.classLoader.getResource('default/menu-config.json').toURI())?.text
            }
            if (md) {
                menu = JSON.parse(md)

                menu.each { v ->
                    def layerName = getLayerNameForFid(v.fid)

                    if (layerName == null) {
                        log.warn "Failed to find layer name for fid= ${v.fid}"
                        println "Failed to find layer name for fid= ${v.fid}"
                        layerName = v.label.replace(" ", "")
                    }

                    v.layerName = layerName
                }
            }
        }

        menu
    }

    def getMenuItems(type) {
        def map = [:]

        //init
        getMenu()

        menu.each { v ->
            if (v.label.equals(type)) {
                if (v.fid) {
                    def objects = getRegionMetadata(v.fid)
                    if (v.exclude) {
                        objects.each{ k, o ->
                            if (!v.exclude.contains(k)) {
                                map.put(k, o)
                            }
                        }
                    } else {
                        map = objects
                    }
                } else if (v.submenu) {
                    v.submenu.each { v2 ->
                        if (v2.fid) {
                            def layer = getLayerForFid(v2.fid)

                            if (layer == null) {
                                def message = "Failed to find layer for fid=" + v2.fid
                                log.warn message
                                println message
                            } else {
                                map.put(v2.label, [
                                        name : v2.label, layerName: layer.name, id: layer.id, fid: v2.fid,
                                        bbox : parseBbox(layer.bbox),
                                        source: null,
                                        notes: "todo: notes"
                                ])
                            }
                        }
                    }
                }
            }
        }

        map
    }
}
