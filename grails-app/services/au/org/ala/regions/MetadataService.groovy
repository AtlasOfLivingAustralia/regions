package au.org.ala.regions

import grails.converters.JSON
import grails.plugin.cache.Cacheable
import grails.util.Metadata
import groovyx.net.http.URIBuilder
import org.apache.commons.lang.StringEscapeUtils

import javax.annotation.PostConstruct

class MetadataService {

    static transactional = false

    def grailsApplication

    final static String WS_DATE_FROM_PREFIX = "-01-01T00:00:00Z"
    final static String WS_DATE_TO_PREFIX = "-12-31T23:59:59Z"
    final static String WS_DATE_FROM_DEFAULT = "1850"
    final static String PAGE_SIZE = "50"

    String BIE_URL, BIE_SERVICE_URL, BIOCACHE_URL, BIOCACHE_SERVICE_URL, ALERTS_URL, DEFAULT_IMG_URL, QUERY_CONTEXT,
           HUB_FILTER, INTERSECT_OBJECT
    Boolean ENABLE_HUB_DATA, ENABLE_QUERY_CONTEXT, ENABLE_OBJECT_INTERSECTION
    String CONFIG_DIR

    @PostConstruct
    def init() {
        BIE_URL = grailsApplication.config.bie.baseURL
        BIE_SERVICE_URL = grailsApplication.config.bieService.baseURL
        BIOCACHE_URL = grailsApplication.config.biocache.baseURL
        BIOCACHE_SERVICE_URL = grailsApplication.config.biocacheService.baseURL
        DEFAULT_IMG_URL = "${BIE_URL}/static/images/noImage85.jpg"
        ALERTS_URL = grailsApplication.config.alerts.baseURL
        CONFIG_DIR = grailsApplication.config.config_dir
        ENABLE_HUB_DATA = grailsApplication.config.hub.enableHubData?.toBoolean() ?: false
        HUB_FILTER = grailsApplication.config.hub.hubFilter
        ENABLE_QUERY_CONTEXT = grailsApplication.config.biocache.enableQueryContext?.toBoolean() ?: false
        QUERY_CONTEXT = grailsApplication.config.biocache.queryContext
        ENABLE_OBJECT_INTERSECTION = grailsApplication.config.layers.enableObjectIntersection?.toBoolean() ?: false
        INTERSECT_OBJECT = grailsApplication.config.layers.intersectObject

        //add biocache.filter to HUB_FILTER
        if (ENABLE_HUB_DATA) {
            HUB_FILTER += grailsApplication.config.biocache.filter
        } else {
            HUB_FILTER = grailsApplication.config.biocache.filter
        }
    }

    /**
     *
     * @param regionName
     * @return List < Map < with format: [ [ imgUrl: . . . , < br / >
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
            ['animal', 'plant', 'marine', 'bird'].each {
                if (emblems[it]) {
                    emblemGuids[it] = emblems."${it}".guid
                }
            }
        }

        List<Map> emblemMetadata = []

        emblemGuids.sort({ it.key }).each { key, guid ->
            String url = "${BIE_SERVICE_URL}/species/${guid}.json"
            def emblemInfo = getJSON(url)
            if (!(emblemInfo instanceof Map && emblemInfo?.error)) {
                emblemMetadata << [
                        "imgUrl"        : emblemInfo?.imageIdentifier ? "${grailsApplication.config.images.baseURL}/image/proxyImageThumbnail?imageId=${emblemInfo.imageIdentifier}" : DEFAULT_IMG_URL,
                        "scientificName": emblemInfo?.taxonConcept?.nameString,
                        "commonName"    : emblemInfo?.commonNames && emblemInfo?.commonNames?.size() > 0 ? emblemInfo?.commonNames[0]?.nameString : "",
                        "speciesUrl"    : "${BIE_URL}/species/${guid}",
                        "emblemType"    : "${key.capitalize()} emblem"
                ]
            }
        }

        emblemMetadata
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @return
     */
    List getGroups(String regionFid, String regionType, String regionName, String regionPid, Boolean showHubData = false) {
        List groups = [] << [name: 'ALL_SPECIES', commonName: 'ALL_SPECIES']

        def responseGroups = getJSON("${BIOCACHE_SERVICE_URL}/explore/hierarchy")
        if (!(responseGroups instanceof Map && responseGroups?.error)) {
            Map subgroupsWithRecords = getSubgroupsWithRecords(regionFid, regionType, regionName, regionPid, showHubData)

            // subgroup.name is valid for species_subgroup:subgroup.name biocache-service queries
            // group.speciesGroup is not valid for searching.
            responseGroups.each { group ->
                def groupfq = ''
                group.taxa.each { subgroup ->
                    if (subgroupsWithRecords[subgroup.common]) {
                        if (groupfq.length() == 0) {
                            groupfq += "species_subgroup:(\"${subgroup.common.encodeAsJs()}\""
                        } else {
                            groupfq += " OR \"${subgroup.common.encodeAsJs()}\""
                        }
                    }
                }
                if (groupfq) {
                    groupfq += ')'
                } else {
                    // exclude all results when there are no subgroups with records
                    groupfq = '-*:*'
                }

                groups << [name: group.speciesGroup, commonName: group.speciesGroup, fq: groupfq]
                group.taxa.each { subgroup ->
                    if (subgroupsWithRecords[subgroup.common]) {
                        groups << [name: subgroup.name, commonName: subgroup.common, parent: group.speciesGroup,
                                   fq  : "species_subgroup:\"${subgroup.common}\""]
                    }
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
    Map getSubgroupsWithRecords(String regionFid, String regionType, String regionName, String regionPid, Boolean showHubData = false) {
        String url = new URIBuilder("${BIOCACHE_SERVICE_URL}/occurrences/search").with {
            query = [
                    facets  : 'species_subgroup',
                    flimit  : '-1',
                    pageSize: 0
            ] + buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, null, null, null, null, showHubData)

            it
        }.toString()

        log.debug("URL to retrieve subgroups with records = $url")

        Map subgroups = [:]
        def response = getJSON(url)
        if (!(response instanceof Map && response?.error)) {
            response?.facetResults[0]?.fieldResult.each { subgroup ->
                subgroups << [(subgroup.label): subgroup.count]
            }
        }

        subgroups
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
    def getSpecies(String regionFid, String regionType, String regionName, String regionPid, String groupName, String subgroup, Boolean showHubData, String from = null, String to = null, String pageIndex = '0', String filter = null) {
        def params = buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName, subgroup, from, to, pageIndex, showHubData, filter)
        def response = getJSON(params)

        //species count
        String url = new URIBuilder("${BIOCACHE_SERVICE_URL}/occurrence/facets").with {
            query = [
                    facets: 'names_and_lsid',
                    flimit: '0'
            ] + buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, subgroup, from, to, showHubData, filter)
            it
        }.toString()
        def speciesCountResult = getJSON(url)
        def speciesCount = 0
        if (speciesCountResult && speciesCountResult instanceof List && speciesCountResult.size() > 0) {
            speciesCount = speciesCountResult[0]?.count
        }

        if (response instanceof Map && response?.error) {
            [totalRecords: 0, speciesCount: 0, records: []]
        } else {
            [
                    totalRecords: response.totalRecords,
                    speciesCount: speciesCount,
                    records     : response.facetResults[0]?.fieldResult.findAll {
                        it.label.split('\\|').size() >= 2
                    }.collect { result ->
                        List info = Arrays.asList(result.label.split('\\|'))
                        [
                                name      : info.get(0),
                                guid      : info.get(1),
                                commonName: info.size() == 5 ? info.get(2) : '',
                                count     : result.count
                        ]
                    }
            ]
        }
    }

    /**
     *
     * @param region
     * @return
     */
    String buildAlertsUrl(Map region) {
        URLDecoder.decode(new URIBuilder("${ALERTS_URL}/webservice/createBiocacheNewRecordsAlert").with {
            String searchTerms = paramsToString(buildCommonDownloadRecordsParams(region.fid, region.type, region.name, region.pid))

            query = [
                    webserviceQuery : "/occurrences/search?${searchTerms}",
                    uiQuery         : "/occurrences/search?${searchTerms}",
                    queryDisplayName: region.name,
                    baseUrlForWS    : "${BIOCACHE_SERVICE_URL}",
                    baseUrlForUI    : "${BIOCACHE_URL}&resourceName=Atlas"
            ]

            it
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
    String buildSpeciesRecordListUrl(String guid, String regionFid, String regionType, String regionName, String regionPid, String groupName, String isSubgroup, String from, String to, Boolean showHubData, String filter) {
        Map params = buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, isSubgroup, from, to, showHubData, filter)
        if (guid) {
            params.fq << "lsid:\"${guid}\""
        }

        "${BIOCACHE_URL}/occurrences/search?${paramsToString(params)}"
    }

    String buildDownloadRecordListUrl(String guid, String regionFid, String regionType, String regionName, String regionPid, String groupName, String isSubgroup, String from, String to, Boolean showHubData, String source = null, String filter = null) {
        Map params = buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, isSubgroup, from, to, showHubData, filter)
        if (guid) {
            params.fq << "lsid:\"${guid}\""
        }
        // offline downloads require double encoding (for now)
        "${BIOCACHE_URL}/download?searchParams=${URLEncoder.encode("?"+paramsToString(params, true), "UTF-8")}&targetUri=${source}"
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
    private Map buildCommonDownloadRecordsParams(String regionFid, String regionType, String regionName, String regionPid, String groupName = null, String subgroup = null, String from = null, String to = null, Boolean showHubData = false, String filter = null) {
        Map params = [
                q: buildRegionFacet(regionFid, regionType, regionName, regionPid)
        ]

        def fq = []

        if (filter) {
            fq << filter
        }

        if (isValidTimeRange(from, to)) {
            fq << buildTimeFacet(from, to)
        }

        if (ENABLE_QUERY_CONTEXT) {
            params << [qc: QUERY_CONTEXT]
        }

        if (HUB_FILTER) {
            fq.addAll(HUB_FILTER.split("&fq=").findAll { (it) }.collect { URLDecoder.decode(it, "UTF-8") })
        }

        if (fq) {
            params << [fq: fq]
        }

        return params
    }

    String paramsToString(Map params, encodeValue = false) {
        StringBuilder sb = new StringBuilder()
        params.each { k, v ->
            if (v instanceof List) {
                v.each {
                    if (sb.length() > 0) {
                        sb.append('&')
                    }
                    sb.append(k).append('=').append((encodeValue) ? "${it.encodeAsURL()}"  : it)
                }
            } else {
                if (sb.length() > 0) {
                    sb.append('&')
                }
                sb.append(k).append('=').append((encodeValue) ? "${v.encodeAsURL()}"  : v)
            }

        }

        sb.toString()
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
    String buildBiocacheSearchOccurrencesWsUrl(String regionFid, String regionType, String regionName, String regionPid, String groupName, String subgroup, String from = null, String to = null, String pageIndex = '0', Boolean showHubData = false, String filter = null) {
        String url = new URIBuilder("${BIOCACHE_SERVICE_URL}/occurrences/search").with {
            query = buildSearchOccurrencesWsParams(regionFid, regionType, regionName, regionPid, groupName, subgroup, from, to, pageIndex, showHubData, filter)
            it
        }.toString()
        log.debug "REST URL generated = ${url}"

        url
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
    private Map buildSearchOccurrencesWsParams(String regionFid, String regionType, String regionName, String regionPid, String groupName = null, String subgroup, String from = null, String to = null, String pageIndex = "0", Boolean showHubData = false, String filter = null) {
        Map params = [
                facets  : 'names_and_lsid',
                fsort   : 'taxon_name',
                pageSize: 0,
                flimit  : PAGE_SIZE,
                foffset : Integer.parseInt(pageIndex) * Integer.parseInt(PAGE_SIZE)
        ]

        params << buildCommonDownloadRecordsParams(regionFid, regionType, regionName, regionPid, groupName, subgroup, from, to, showHubData, filter)

        return params
    }

    boolean isValidTimeRange(String from, String to) {
        return from && to && (from != WS_DATE_FROM_DEFAULT || to != Calendar.getInstance().get(Calendar.YEAR))
    }

    /**
     *
     * @param regionFid
     * @param regionType
     * @param regionName
     * @return
     */
    String buildRegionFacet(String regionFid, String regionType, String regionName, String regionPid) {
        // unescape regionName for q term creation
        def name = StringEscapeUtils.unescapeHtml(regionName)
        def qParam = regionPid == null || regionPid.isEmpty() ? "-${regionFid}:n/a AND ${regionFid}:*" : "${regionFid}:\"${name}\""

        qParam
    }


    /**
     *
     * @param from
     * @param to
     * @return
     */
    String buildTimeFacet(String from, String to) {
        from = from.equals(WS_DATE_FROM_DEFAULT) ? "*" : from + WS_DATE_FROM_PREFIX
        to = to.equals(Calendar.getInstance().get(Calendar.YEAR)) ? "*" : to + WS_DATE_TO_PREFIX
        "occurrence_year:[${from} TO ${to}]"
    }

    /**
     * Get some metadata for a region (top level menu).
     *
     * If name is defined then just return metadata for that named region
     * else for all regions of the specified type.
     *
     * @param type type of region
     * @param name optional name of the region (the 'object')
     * @return name , area, pid and bbox as a map for the named region or a map of all objects if no name supplied
     */
    def regionMetadata(type, name) {
        def fid = fidFor(type)
        def regionMd = getRegionMetadata(fid)
        if (name) {
            // if a specific region is named, then return that
            regionMd[name]
        } else if (regionMd.values().size == 1) {
            // if there is only one object in the field, return it
            regionMd.values().iterator().next()
        } else {
            // return all objects in the field
            regionMd
        }
    }

    /**
     * Return metadata for the specified field.
     * Use cached metadata if available and fresh.
     *
     * @param fid
     * @return
     */
    @Cacheable(value = 'metadata', key = { fid })
    def getRegionMetadata(fid) {

        def metadata = new TreeMap()

        log.debug("setting cached value ${fid}")

        def url = grailsApplication.config.layersService.baseURL + (ENABLE_OBJECT_INTERSECTION ?
                '/intersect/object/' + fid + '/' + INTERSECT_OBJECT : '/field/' + fid)

        def result = getJSON(url)

        if (result instanceof Map && result?.error) {
            result
        } else {
            if (result?.objects) {
                result = result.objects
            }
            result.each {
                metadata.put it.name, [name: it.name, pid: it.pid, bbox: parseBbox(it.bbox), area_km: it.area_km]
            }

            metadata
        }
    }

    def getJSON(url) {
        try {
            JSON.parse(new URL(url).text)
        } catch (SocketTimeoutException e) {
            def message = "Timed out looking up URL= ${url}."
            log.warn message
            [error: true, errorMessage: message]
        } catch (Exception e) {
            def message = "Failed to lookup. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            log.warn message
            [error: true, errorMessage: message]
        }
    }

    /**
     * Get the fid (field id) of the layer that represents the specified region type.
     * @param regionType
     * @return
     */
    def fidFor(regionType) {
        getRegionsMetadata()[regionType]?.fid
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
        def bbox = regionMetadata(regionType, regionName)?.bbox
        bbox ?: [minLat: -42, minLng: 113, maxLat: -14, maxLng: 153]
    }

    /**
     * Returns list of types of regions.
     * @return
     */
    def getRegionTypes() {
        getRegionsMetadata().collect { k, v -> v.name }
    }

    /**
     * Return metadata for region types.
     *
     * Uses cache if available
     * else external config
     * else the default set.
     * @return
     */
    @Cacheable(value = 'metadata', key = { 'getRegionsMetadata' })
    def getRegionsMetadata() {

        //update
        def md = [:]
        int i = 0
        getMenu().each { v ->
            md.put(v.label, [
                    name      : v.label,
                    layerName : v.layerName,
                    fid       : v.fid,
                    bieContext: "not in use",
                    order     : i
            ])

            i++
        }

        md
    }

    @Cacheable(value = 'metadata', key = { pid })
    def getObjectByPid(pid) {
        getJSON(grailsApplication.config.layersService.baseURL + '/object/' + pid)
    }

    @Cacheable(value = 'metadata', key = { 'getLayersServiceLayers' })
    Map getLayersServiceLayers() {
        getLayersServiceList('/layers')
    }

    @Cacheable(value = 'metadata', key = { 'getLayersServiceFields' })
    Map getLayersServiceFields() {
        getLayersServiceList('/fields')
    }

    Map getLayersServiceList(path) {
        def url = grailsApplication.config.layersService.baseURL + path

        def map = [:]

        try {
            def result = getJSON(url)
            if (result instanceof Map && result?.error) {
                map = (Map) result
            } else {
                result.each { v ->
                    map.put String.valueOf(v.id), v
                }
            }
        } catch (Exception e) {
            log.warn "Failed to lookup. ${e.getClass()} ${e.getMessage()} URL= ${url}."
            map = [error: true, message: "failed to parse ${url}"]
        }

        map
    }

    /**
     * Returns the metadata for regions as a javascript object literal.
     * @return
     */
    def getRegionsMetadataAsJavascript() {
        return "var REGIONS = {metadata: " + (regionsMetadata as JSON) + "}"
    }

    @Cacheable(value = "metadata", key = { '"getStateEmblems"' })
    def getStateEmblems() {
        def file = new File(CONFIG_DIR + "/state-emblems.json")
        if (!file.exists()) {
            file = new File(this.class.classLoader.getResource('default/state-emblems.json').toURI())
        }
        if (file.exists()) {
            JSON.parse(file.text)
        } else {
            []
        }
    }

    /**
     * Get a list of the objects in a layer and the available metadata.
     *
     * @param fid id of the 'field' (type of region)
     * @return name , area, pid and bbox as a map for all objects
     */
    @Cacheable(value = 'metadata', key = { "objects_${fid}" })
    def getObjectsForALayer(fid) {
        def map = [:]
        def url = grailsApplication.config.layersService.baseURL + '/field/' + fid

        try {
            def result = getJSON(url)
            if (result instanceof Map && result?.error) {
                map = result
            } else {
                result.objects.each {
                    map.put it.name,
                            [name: it.name, pid: it.pid, bbox: parseBbox(it.bbox), area_km: it.area_km]
                }
            }
        } catch (Exception e) {
            log.warn "Failed to lookup ${e.getClass()} ${e.getMessage()} URL= ${url}."
            map = [error: true, message: "failed to parse ${url}"]
        }

        map
    }

    /**
     * Converts a bounding box from a polygon format to min/max*lat/lng format.
     *
     * @param bbox as polygon eg bbox: POLYGON((158.684997558594 -55.116943359375,158.684997558594 -54.4854164123535,
     * 158.950012207031 -54.4854164123535,158.950012207031 -55.116943359375,158.684997558594 -55.116943359375))
     * @return
     */
    def parseBbox(String bbox) {
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
            ''
        } else {
            regionMetadata(regionType, regionName)?.pid
        }
    }

    static defaultLoggerReasons = [
            0 : "conservation management/planning",
            1 : "biosecurity management",
            2 : "environmental impact, site assessment",
            3 : "education",
            4 : "scientific research",
            5 : "collection management",
            6 : "other",
            7 : "ecological research",
            8 : "systematic research",
            9 : "other scientific research",
            10: "testing"
    ]

    def getLayerNameForFid(String fid) {
        getLayerForFid(fid)?.name
    }

    def getLayerForFid(String fid) {
        def lsf = layersServiceFields.get(fid)
        if (lsf?.spid) {
            layersServiceLayers.get(lsf.spid)
        } else {
            null
        }
    }

    @Cacheable(value = 'metadata', key = { 'getMenu' })
    def getMenu() {

        def menu = []

        // use external file if available
        def f = new File(CONFIG_DIR + "/menu-config.json")
        def md = f.exists() ? f.text : ''
        if (!md) {
            //use default resource
            md = new File(this.class.classLoader.getResource('default/menu-config.json').toURI())?.text
        }
        if (md) {
            menu = JSON.parse(md)

            menu.each { v ->
                def layerName = getLayerNameForFid(v.fid)

                if (!layerName) {
                    if (v.fid) {
                        log.warn "Failed to find layer name for fid= ${v.fid}"
                    }
                    layerName = v.label.replace(" ", "")
                }

                v.layerName = layerName
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
                        objects.each { k, o ->
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
                            } else {
                                map.put(v2.label, [
                                        name  : v2.label, layerName: layer.name, id: layer.id, fid: v2.fid,
                                        bbox  : [minLat: layer.minlatitude, minLng: layer.minlongitude,
                                                 maxLat: layer.maxlatitude, maxLng: layer.maxlongitude],
                                        source: null,
                                        notes : "todo: notes"
                                ])
                            }
                        }
                    }
                }
            }
        }

        map
    }

    @Cacheable(value = 'metadata', key = { 'getHabitatConfig' })
    def getHabitatConfig() {
        def appName = Metadata.current.'app.name'
        def file = new File("/data/${appName}/config/habitats.json")
        if (!file.exists()) {
            file = new File(this.class.classLoader.getResource('default/habitats.json').toURI())
        }
        if (file.exists()) {
            JSON.parse(file.text)
        } else {
            file =
                    null
        }
    }
}
