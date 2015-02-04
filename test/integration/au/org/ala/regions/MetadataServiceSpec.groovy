package au.org.ala.regions

import spock.lang.Specification

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
        when:
        List result = metadataService.getEmblemsMetadata(regionType, regionName)
        then:
        result.size() == 4

    }

    void "test species groups retrieval" () {

        when:
        def results = metadataService.getGroups()

        then:
        results instanceof List
        results.each {it.size() == 3}
    }

    void "test biocache search occurrences url generation"() {

        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
        String from = "1900"
        String to = "1999"
        String groupName = "Mammals"
        String subgroup = "Diprotodont Marsupials"
        String subgroupWithOtherCharacters = "Marsupials, Dasyuroid & Carnivores"

        when:
        // Retrieving all species
        String url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies)"

        when:
        // Retrieving all species second page
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, null, null, null, null, "1")
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=50&fq=rank:(species OR subspecies)"

        when:
        // Retrieving all species within a timeframe
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, null, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]"

        when:
        // Retrieving all species for a given group
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, groupName)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_group:\"Mammals\""

        when:
        // Retrieving all species for a given group within a time frame
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, groupName, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_group:\"Mammals\" AND occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]"

        when:
        // Retrieving all species for a given subgroup
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, subgroup, true)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_subgroup:\"Diprotodont Marsupials\""

        when:
        // Retrieving all species for a given subgroup whose name contains non alphanumeric characters
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, subgroupWithOtherCharacters, true)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_subgroup:\"Marsupials, Dasyuroid & Carnivores\""
    }

    void "test species retrieval"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
        String from = "1900"
        String to = "2014"
        String groupName = "Mammals"
        String subgroup = "Diprotodont Marsupials"
        String subgroupWithOtherCharacters = "Marsupials, Dasyuroid & Carnivores"
        String emptySubgroup = "Marsupial Moles"

        when:
        // Retrieving a group
        Map species = metadataService.getSpecies(regionFid, regionType, regionName, groupName)
        then:
        species.totalRecords > 0
        species.records.size() == 50

        when:
        // Retrieving a subgroup with non alphanumeric characters
        species = metadataService.getSpecies(regionFid, regionType, regionName, subgroupWithOtherCharacters, true)
        then:
        species.totalRecords > 0

        when:
        // Retrieving a subgroup with no records
        species = metadataService.getSpecies(regionFid, regionType, regionName, emptySubgroup, true)
        then:
        species.totalRecords == 0
        species.records.size() == 0

    }

    void "test species record list url"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
        String from = "1912"
        String to = "2015"
        String name = "ACENTROPINAE"
        String rank = "subfamily"

        when:
        String url = metadataService.buildSpeciesRecordListUrl(name, rank, regionFid, regionType, regionName, from, to)

        then:
        url == "http://biocache.ala.org.au/occurrences/search?q=subfamily:\"ACENTROPINAE\"&fq=cl22:\"New South Wales\"&fq=occurrence_year:[1912-01-01T00:00:00Z TO *]"
    }
}
