package au.org.ala.regions

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

        render template: 'emblems', model: [emblems: emblemsMetadata], contentType: 'text/xml'
    }

    /**
     *
     * @return
     */
    def showGroups(
            final String regionFid,
            final String regionType, final String regionName, final String regionPid, final Boolean showHubData) {
        def groups = metadataService.getGroups(regionFid, regionType, regionName, regionPid, showHubData)

        render template: 'groups', model: [groups: groups], contentType: 'text/xml'
    }

    /**
     *
     * @return
     */
    def showSpecies() {
        Boolean showHubData = params.boolean('showHubData', false)
        def species = metadataService.getSpecies(params.regionFid, params.regionType, params.regionName, params.regionPid, params.group, params.subgroup, showHubData, params.from, params.to, params.pageIndex ?: "0", params.fq)

        render template: 'species', model: [species       : species,
                                            speciesPageUrl: "${metadataService.BIE_URL}/species",
                                            regionFid     : params.regionFid,
                                            regionType    : params.regionType,
                                            regionName    : params.regionName,
                                            regionPid     : params.regionPid,
                                            pageIndex     : params.pageIndex ? Integer.parseInt(params.pageIndex) : 0,
                                            from          : params.from,
                                            to            : params.to,
                                            group         : params.group,
                                            subgroup      : params.subgroup,
                                            showHubData   : showHubData,
                                            fq            : params.fq], contentType: 'text/xml'
    }
}
