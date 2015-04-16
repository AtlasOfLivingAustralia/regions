package au.org.ala.regions

import au.org.ala.regions.binding.DownloadParams

class RegionController {

    MetadataService metadataService

    /**
     *
     * @param regionType
     * @param regionName
     * @return
     */
    def showEmblems(final String regionType, final String regionName) {
        List emblemsMetadata = metadataService.getEmblemsMetadata(regionName)

        render template: 'emblems', model: [emblems: emblemsMetadata]
    }

    /**
     *
     * @return
     */
    def showGroups(final String regionFid, final String regionType, final String regionName, final String regionPid) {
        def groups = metadataService.getGroups(regionFid, regionType, regionName, regionPid)

        render template: 'groups', model: [groups: groups]
    }

    /**
     *
     * @return
     */
    def showSpecies() {
        def species = metadataService.getSpecies(params.regionFid, params.regionType, params.regionName, params.regionPid, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to, params.pageIndex ?: "0")

        render template: 'species', model: [species        : species,
                                            speciesPageUrl : "${metadataService.BIE_URL}/species",
                                            regionFid      : params.regionFid,
                                            regionType     : params.regionType,
                                            regionName     : params.regionName,
                                            regionPid      : params.regionPid,
                                            pageIndex      : params.pageIndex ? Integer.parseInt(params.pageIndex) : 0,
                                            from           : params.from,
                                            to             : params.to]
    }

    /**
     *  TODO: provide additional params to this function; to, from, group, subgroup
     *
     * @return
     */
    def showDownloadDialog() {
        DownloadParams downloadParams = params.downloadParams
        String downloadUrl = params.downloadUrl
        downloadParams = downloadParams?:new DownloadParams(email: params.email)

        render template: 'downloadRecordsDialog', model: [
                downloadParams: downloadParams, downloadReasons:MetadataService.logReasonCache,
                downloadOptions: MetadataService.DOWNLOAD_OPTIONS,
                downloadUrl: downloadUrl,
                downloadRecordsUrl: URLEncoder.encode(metadataService.buildDownloadRecordsUrlPrefix(0, params.regionFid, params.regionType, params.regionName, params.regionPid, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to), "UTF-8"),
                downloadChecklistUrl: URLEncoder.encode(metadataService.buildDownloadRecordsUrlPrefix(1, params.regionFid, params.regionType, params.regionName, params.regionPid, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to), "UTF-8"),
                downloadFieldguideUrl: URLEncoder.encode(metadataService.buildDownloadRecordsUrlPrefix(2, params.regionFid, params.regionType, params.regionName, params.regionPid, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to), "UTF-8"),
                region: [regionType: params.regionType, regionName: params.regionName, regionFid: params.regionFid, regionPid: params.regionPid]
        ]
    }
}
