package au.org.ala.regions

import grails.test.mixin.integration.Integration
import spock.lang.Specification

/**
 *
 */
@Integration
class MetadataServiceSpec extends Specification {

    MetadataService metadataService

    def setup() {
    }

    def cleanup() {
    }

    void "test retrieveEmblemsMetadata method"() {
        given:
        String regionName = "New South Wales"
        when:
        List result = metadataService.getEmblemsMetadata(regionName)
        then:
        result.size() == 4

    }

    void "test species groups retrieval"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
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
        String regionFid = "cl22"
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
        URLDecoder.decode(url, 'UTF-8') == "https://biocache.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl22:\"New South Wales\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species second page
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, null, null, "1")
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=50&q=cl22:\"New South Wales\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species within a timeframe
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl22:\"New South Wales\"&fq=occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"

        when:
        // Retrieving all species for a given group
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName, null, null, null, '0', false, 'species_group:\"Mammals\"')
        then:
        URLDecoder.decode(url, 'UTF-8') == "https://biocache.ala.org.au/ws/occurrences/search?facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&q=cl22:\"New South Wales\"&fq=species_group:\"Mammals\"&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*"
    }

    void "test species retrieval"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
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
        String regionFid = "cl22"
        String regionPid = "1"
        String from = "1912"
        String to = "2015"
        String guid = "urn:lsid:biodiversity.org.au:afd.taxon:4163e0ea-afaf-456c-8926-7ec37e79d380"

        when:
        String url = metadataService.buildSpeciesRecordListUrl(guid, regionFid, regionType, regionName, regionPid, null, null, from, to, false, null)

        then:
        url == "https://biocache.ala.org.au/occurrences/search?q=cl22:\"New South Wales\"&fq=occurrence_year:[1912-01-01T00:00:00Z TO 2015-12-31T23:59:59Z]&fq=rank:(species OR subspecies)&fq=-occurrence_status_s:absent&fq=geospatial_kosher:true&fq=occurrence_year:*&fq=lsid:\"urn:lsid:biodiversity.org.au:afd.taxon:4163e0ea-afaf-456c-8926-7ec37e79d380\""
    }


    void "test getSubgroupsWithRecords"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
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
