package au.org.ala.regions

import au.org.ala.regions.binding.DownloadParams
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
        String regionName = "New South Wales"
        when:
        List result = metadataService.getEmblemsMetadata(regionName)
        then:
        result.size() == 4

    }

    void "test species groups retrieval" () {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
        String regionPid = "1"

        when:
        def results = metadataService.getGroups(regionFid, regionType, regionName, regionPid)

        then:
        results instanceof List
        results.each {it.size() == 3}
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
        String url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies)"

        when:
        // Retrieving all species second page
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, null, null, "1")
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=50&fq=rank:(species OR subspecies)"

        when:
        // Retrieving all species within a timeframe
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, null, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]"

        when:
        // Retrieving all species for a given group
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_group:\"Mammals\""

        when:
        // Retrieving all species for a given group within a time frame
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, groupName, null, from, to)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_group:\"Mammals\" AND occurrence_year:[1900-01-01T00:00:00Z TO 1999-12-31T23:59:59Z]"

        when:
        // Retrieving all species for a given subgroup
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, subgroup, true)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_subgroup:\"Diprotodont Marsupials\""

        when:
        // Retrieving all species for a given subgroup whose name contains non alphanumeric characters
        url = metadataService.buildBiocacheSearchOccurrencesWsUrl(regionFid, regionType, regionName, regionPid, subgroupWithOtherCharacters, true)
        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/search?q=cl22:\"New South Wales\"&facets=names_and_lsid&fsort=taxon_name&pageSize=0&flimit=50&foffset=0&fq=rank:(species OR subspecies) AND species_subgroup:\"Marsupials, Dasyuroid & Carnivores\""
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
        Map species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, groupName)
        then:
        species.totalRecords > 0
        species.records.size() == 50

        when:
        // Retrieving a subgroup with non alphanumeric characters
        species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, subgroupWithOtherCharacters, true)
        then:
        species.totalRecords > 0

        when:
        // Retrieving a subgroup with no records
        species = metadataService.getSpecies(regionFid, regionType, regionName, regionPid, emptySubgroup, true)
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
        String url = metadataService.buildSpeciesRecordListUrl(guid, regionFid, regionType, regionName, regionPid, from, to)

        then:
        url == "http://biocache.ala.org.au/occurrences/search?q=lsid:\"urn:lsid:biodiversity.org.au:afd.taxon:4163e0ea-afaf-456c-8926-7ec37e79d380\"&fq=cl22:\"New South Wales\""
    }

    void "test buildDownloadRecordsUrl"() {
        given:
        String regionName = "New South Wales"
        String regionType = "states"
        String regionFid = "cl22"
        String regionPid = "1"
        String from = "1900"
        String to = "2009"
        String groupName = "Mammals"
        String subgroup = "Diprotodont Marsupials"
        DownloadParams downloadParams = new DownloadParams(
                email: 'angel.ruiz@csiro.au',
                fileName: 'data',
                downloadReason: 0,
                downloadOption: 0
        )

        when:
        String url = metadataService.buildDownloadRecordsUrl(downloadParams, regionFid, regionType, regionName, regionPid, groupName, false)

        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/index/download?q=cl22:\"New South Wales\"&fq=species_group:\"Mammals\"&email=angel.ruiz@csiro.au&reasonTypeId=0&file=data"

        when:
        url = metadataService.buildDownloadRecordsUrl(downloadParams, regionFid, regionType, regionName, regionPid, groupName, false, from, to)

        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/index/download?q=cl22:\"New South Wales\"&fq=species_group:\"Mammals\" AND occurrence_year:[1900-01-01T00:00:00Z TO 2009-12-31T23:59:59Z]&email=angel.ruiz@csiro.au&reasonTypeId=0&file=data"

        when:
        url = metadataService.buildDownloadRecordsUrl(downloadParams, regionFid, regionType, regionName, regionPid, subgroup, true)

        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/index/download?q=cl22:\"New South Wales\"&fq=species_subgroup:\"Diprotodont Marsupials\"&email=angel.ruiz@csiro.au&reasonTypeId=0&file=data"

        when:
        downloadParams.downloadOption = 1
        url = metadataService.buildDownloadRecordsUrl(downloadParams, regionFid, regionType, regionName, regionPid, groupName, false)

        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/ws/occurrences/facets/download?q=cl22:\"New South Wales\"&fq=species_group:\"Mammals\"&facets=species_guid&lookup=true&file=data"

        when:
        downloadParams.downloadOption = 2
        url = metadataService.buildDownloadRecordsUrl(downloadParams, regionFid, regionType, regionName, regionPid, groupName, false)

        then:
        URLDecoder.decode(url, 'UTF-8') == "http://biocache.ala.org.au/occurrences/fieldguide/download?q=cl22:\"New South Wales\"&fq=species_group:\"Mammals\"&facets=species_guid"
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
