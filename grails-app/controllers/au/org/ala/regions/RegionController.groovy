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
     * @param regionFid
     * @param regionType
     * @param regionName
     * @param from
     * @param to
     */
    def showGroups() {
        def groups = metadataService.getGroups(params.regionFid, params.regionType, params.regionName, params.from, params.to)

        render template: 'groups', model: [groups: groups]
    }
}
