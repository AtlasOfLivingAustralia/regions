package au.org.ala.regions

import org.codehaus.groovy.grails.web.json.JSONArray

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
    def showGroups() {
        def groups = metadataService.getGroups(params.regionFid, params.regionType, params.regionName, params.from, params.to)

        render template: 'groups', model: [groups: groups]
    }

    /**
     *
     * @return
     */
    def showSpecies() {
        def species = metadataService.getSpecies(params.regionFid, params.regionType, params.regionName, params.group, params.pageIndex?:"0", params.from, params.to)

        render template: 'species', model: [species        : species,
                                            speciesPageUrl : "${metadataService.BIE_URL}/species",
                                            regionFid      : params.regionFid,
                                            regionType     : params.regionType,
                                            regionName     : params.regionName,
                                            pageIndex      : params.pageIndex ? Integer.parseInt(params.pageIndex) : 0,
                                            from           : params.from,
                                            to             : params.to]
    }
}
