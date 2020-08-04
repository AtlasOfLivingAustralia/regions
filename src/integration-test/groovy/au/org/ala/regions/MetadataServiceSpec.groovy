package au.org.ala.regions

import grails.test.mixin.integration.Integration
import groovyx.net.http.RESTClient
import spock.lang.Shared
import spock.lang.Specification
import org.grails.web.json.JSONObject
import spock.lang.Unroll

/**
 *
 */
@Integration
class MetadataServiceSpec extends Specification {

    MetadataService metadataService

    @Shared
    def client = new RESTClient("https://bie.ala.org.au/")

    def setup() {
    }

    def cleanup() {
    }

    @Unroll("#state of #group should have a valid guid")
    void "test state-emblems guids"() {
        given:
        JSONObject stateEmblems = metadataService.getStateEmblems()

        when:
        def emblems = stateEmblems[state];
        def response;
        if (emblems[group]) {
            def guid = emblems."${group}".guid
            response = client.get(path: "/ws/species/${guid}.json")
        }

        then: 'server returns 200 code (ok)'
        if (response != null)
            assert response.status == 200 : 'response code should be 200'

        where:
        [state, group] << [
                ["AUSTRALIAN CAPITAL TERRITORY", "NEW SOUTH WALES", "NORTHERN TERRITORY", "QUEENSLAND",
                 "SOUTH AUSTRALIA", "TASMANIA", "VICTORIA", "WESTERN AUSTRALIA", "NEW SOUTH WALES"],
                ["animal", "plant", "marine", "bird"]
                ].combinations()
    }

    void "test retrieveEmblemsMetadata method"() {
        given:
        String regionName = "NEW SOUTH WALES"
        when:
        List result = metadataService.getEmblemsMetadata(regionName)
        then:
        result.size() == 4

    }

    void "test species groups retrieval"() {
        given:
        String regionName = "NEW SOUTH WALES"
        String regionType = "states"
        String regionFid = "cl10925"
        String regionPid = "1"

        when:
        def results = metadataService.getGroups(regionFid, regionType, regionName, regionPid)

        then:
        results instanceof List
        results.each { it.size() == 3 }
    }

    void "test biocache search occurrences url generation"() {

        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl10925"
        String regionPid = "1"
        String from = "1900"
        String to = "1999"
        String groupName = "Mammals"
        String subgroup = "Diprotodont Marsupials"
        String subgroupWithOtherCharacters = "Marsupials, Dasyuroid & Carnivores"

        when:
        // Retrieving all species
        String url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null)
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache-ws.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl10925:\"New South Wales\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species second page
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, null, null, "1")
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache-ws.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=50&q=cl10925:\"New South Wales\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species within a timeframe
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache-ws.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl10925:\"New South Wales\"&fq=occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species for a given group
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName, null, null, null, '0', false, 'species_group:\"Mammals\"')
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache-ws.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl10925:\"New South Wales\"&fq=species_group:\"Mammals\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"
    }

    void "test species retrieval"() {
        given:
        String regionName = "NEW SOUTH WALES"
        String regionType = "states"
        String regionFid = "cl10925"
        String regionPid = "1"
        String from = "1900"
        String to = "2014"
        String groupName = "Mammals"
        String subgroup = "Diprotodont Marsupials"
        String subgroupWithOtherCharacters = "Marsupials, Dasyuroid & Carnivores"
        String emptySubgroup = "Marsupial Moles"

        when:
        // Retrieving a group
        Map species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, groupName, null, false)
        then:
        species.totalRecords > 0
        species.records.size() == 50

        when:
        // Retrieving a subgroup with non alphanumeric characters
        species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, null, subgroupWithOtherCharacters, true)
        then:
        species.totalRecords > 0

        when:
        // Retrieving a subgroup with no records
        species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, null, emptySubgroup, true, null, null, "0", "-*:*")
        then:
        species.totalRecords == 0
        species.records.size() == 0

    }

    void "test species record list url"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl10925"
        String regionPid = "1"
        String from = "1912"
        String to = "2015"
        String guid = "urn:lsid:biodiversity.org.au:afd.taxon:4163e0ea-afaf-456c-8926-7ec37e79d380"

        when:
        String url = metadataService.buildSpeciesRecordListUrl(guid, regionFid, regionType, regionName, regionPid, null, null, from, to, false, null)

        then:
          url == "https://biocache.ala.org.au/occurrences/search?q=cl10925%3A%22New+South+Wales%22&fq=occurrence_year%3A%5B1912-01-01T00%3A00%3A00Z+TO+2015-12-31T23%3A59%3A59Z%5D&fq=rank%3A%28species+OR+subspecies%29&fq=-occurrence_status_s%3Aabsent&fq=geospatial_kosher%3Atrue&fq=occurrence_year%3A*&fq=lsid%3A%22urn%3Alsid%3Abiodiversity.org.au%3Aafd.taxon%3A4163e0ea-afaf-456c-8926-7ec37e79d380%22"
    }


    void "test getSubgroupsWithRecords"() {
        given:
        String regionName = "NEW SOUTH WALES"
        String regionType = "states"
        String regionFid = "cl10925"
        String regionPid = "1"

        when:
        Map subgroups = metadataService.getSubgroupsWithRecords(regionFid, regionType, regionName, regionPid)
        then:
        subgroups.size() > 0
        def oneSubgroup = subgroups.iterator().next()
        oneSubgroup.key instanceof String
        oneSubgroup.value instanceof Integer


    }
}
