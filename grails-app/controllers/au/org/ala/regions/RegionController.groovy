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
    def showGroups(final String regionFid, final String regionType, final String regionName, final String from, final String to) {
        List groups = metadataService.getGroups(regionFid, regionType, regionName, from, to)

        render template: 'groups', model: [groups: groups]
    }
}
