package au.org.ala

import au.org.ala.regions.MetadataService
import org.codehaus.groovy.grails.web.json.JSONArray
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
            String regionFid = "cl22"
        when:
            List result = metadataService.getEmblemsMetadata(regionType, regionName)
        then:
            result.size() == 4

    }

    void "test url building mechanism for biocache web services"() {
        given:
            String regionName = "New South Wales"
            String regionType = "states"
            String regionFid = "cl22"
            String from = "1900-01-01T00:00:00Z"
            String to = "1999-12-31T23:59:59Z"
        when:
            String url = metadataService.buildBiocacheUrl(regionFid, regionType, regionName)
        then:
            url == "http://biocache.ala.org.au/ws/explore/groups.json?q=cl22:\"New South Wales\""
        when:
            url = metadataService.buildBiocacheUrl(regionFid, regionType, regionName, from, to)
        then:
            url == "http://biocache.ala.org.au/ws/explore/groups.json?q=cl22:\"New South Wales\"&fq=occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]"
    }

    void "test groups info retrieval"() {
        given:
            String regionName = "New South Wales"
            String regionType = "states"
            String regionFid = "cl22"
            String from = "1900-01-01T00:00:00Z"
            String to = "1999-12-31T23:59:59Z"
        when:
            def result = metadataService.getGroups(regionFid, regionType, regionName)
            def result2 = metadataService.getGroups(regionFid, regionType, regionName, from, to)

        then:
            [result, result2].each {it instanceof JSONArray}
            result[0].speciesCount > 0
            result[0].speciesCount > result2[0].speciesCount
    }
}
