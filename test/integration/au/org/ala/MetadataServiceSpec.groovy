package au.org.ala

import au.org.ala.regions.MetadataService
import spock.lang.*

/**
 *
 */
class MetadataServiceSpec extends Specification {

    MetadataService metadataService

    def setup() {
    }

    def cleanup() {
    }

    void "test retrieveEmblemsMetadata method"() {
        given:
            String regionType = "states"
            String regionName = "New South Wales"
            List result
        when:
            result = metadataService.getEmblemsMetadata(regionType, regionName)

        then:
            result.size() == 4

    }
}
