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
        List emblemsMetadata = metadataService.getEmblemsMetadata(regionType, regionName)

        render template: 'emblems', model: [emblems: emblemsMetadata]
    }

    /**
     *
     * @return
     */
    def showGroups(final String regionFid, final String regionType, final String regionName) {
        def groups = metadataService.getGroups(regionFid, regionType, regionName)

        render template: 'groups', model: [groups: groups]
    }

    /**
     *
     * @return
     */
    def showSpecies() {
        def species = metadataService.getSpecies(params.regionFid, params.regionType, params.regionName, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to, params.pageIndex ?: "0")

        render template: 'species', model: [species        : species,
                                            speciesPageUrl : "${metadataService.BIE_URL}/species",
                                            regionFid      : params.regionFid,
                                            regionType     : params.regionType,
                                            regionName     : params.regionName,
                                            pageIndex      : params.pageIndex ? Integer.parseInt(params.pageIndex) : 0,
                                            from           : params.from,
                                            to             : params.to]
    }

    /**
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
                downloadUrl: downloadUrl
        ]
    }

    /**
     *
     * @param downloadParams
     * @return
     */
    def download(DownloadParams downloadParams) {
        if (!downloadParams.hasErrors()) {
            params << [downloadUrl : metadataService.buildDownloadRecordsUrl(downloadParams, params.regionFid, params.regionType, params.regionName, params.subgroup?:params.group, params.subgroup ? true : false, params.from, params.to)]
        }

        params << [downloadParams: downloadParams]
        forward action: 'showDownloadDialog'
    }
}
