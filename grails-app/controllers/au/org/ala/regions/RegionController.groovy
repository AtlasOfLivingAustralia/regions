package au.org.ala.regions

class RegionController {

    MetadataService metadataService

    def showEmblems(final String regionType, final String regionName) {
        List emblemsMetadata = metadataService.getEmblemsMetadata(regionType, regionName)

        render template: 'emblems', model: [emblems: emblemsMetadata]
    }

    def showSpecies() {

    }
}
