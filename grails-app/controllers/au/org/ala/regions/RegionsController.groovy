package au.org.ala.regions

import grails.converters.JSON
import org.codehaus.groovy.grails.commons.ConfigurationHolder

import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import grails.util.GrailsUtil

class RegionsController {

    def metadataService
    
    static defaultAction = 'regions'

    /**
     * Do logouts through this app so we can invalidate the session.
     *
     * @param casUrl the url for logging out of cas
     * @param appUrl the url to redirect back to after the logout
     */
    def logout = {
        session.invalidate()
        redirect(url:"${params.casUrl}?url=${params.appUrl}")
    }

    def clearCache = {
        metadataService.clearCaches()
        render "<div>All caches cleared.</div>"
    }
    
    def clearTemplateCache = {
        hf.clearCache()
        render "<div>Template cache cleared.</div>"
    }

    /**
     * Display the top-level regions page.
     */
    def regions = {}

    def documents = {
        render "Not implemented yet"
    }

    /**
     * Returns a JSON object describing the regions (aka objects) in the specified type of region (aka field).
     *
     * Note the data is returned as both a list of names (so sort order is maintained) and a map of objects with
     * properties (so they can be looked up efficiently).
     *
     * @param type the type of region - states, lgas, ibras, imcrs, nrms, other
     * @return
     *  names is an alphabetically sorted list of the names of the regions
     *  objects is a map of objects holding the properties of the region, keyed by name
     */
    def regionList = {

        // get the list
        def map = metadataService.regionMetadata(params.type, null)
        
        def result
        
        if (map.error) {
            // render error
            result = map
        }
        else {
            // render as a list and a map
            result = [names: map.keySet().sort(), objects: map]
        }

        render result as JSON
    }

    /*def regionSearch = {
        def featuresList = metadataService.regionMetadata(params.type, null)
        assert featuresList

        // filter by query
        def list = featuresList.findAll { it.name.toLowerCase() =~ params.term}

        render list.collect {it.name} as JSON
    }*/

    /**
     * Show the descriptive page for a region.
     *
     * @param regionType type of region eg states, ibras - 'layer' indicates the region is a layer of its own
     * @param regionName the name of the object in the layer eg Tasmania
     * @param pid the id of the object - optional
     */
    def region = {
        def region = [:]
        region.name = params.regionName
        region.type = params.regionType
        region.pid = params.pid ?: metadataService.lookupPid(region.type, region.name)
        region.bbox = metadataService.lookupBoundingBox(region.type, region.name)

        def error = ""
        def emblemGuids = [:]
        def subRegions = [:]
        region.gid = 0  // in case none other specified
        /* hack to inject some sub-region content */
        switch (region.name) {
            case "Australian Capital Territory":
                subRegions.ibras = ['Australian Alps','South Eastern Highlands','Sydney Basin']
                subRegions.imcras = ['Southeast Shelf Transition']
                subRegions.nrms = ['ACT']
                break
            case "Great Eastern Ranges":
                subRegions.subs = ['Hunter','Border Ranges', 'Kosciuszko to coast','Slopes to summit',
                                   'Southern Highlands','Kanangra Wyangala','Jaliigirr','Illawarra Shoalhaven']
                break
            //case "Hunter":
            //    subRegions.subs = ['Hunter Areas of Interest','Upper Hunter Focus Area']
            //    break
            //case "Slopes to summit":
            //    subRegions.subs = ['S2S Priority Areas','S2S Priority Area Billabong Creek']
            //    break
            //case "Kosciuszko to coast":
            //    subRegions.subs = ['K2C Management Regions']
            //    break
        }
        /* end hack */

        if (region.type == 'layer') {
            region.fid = metadataService.getLayerMetadata(region.name, 'fid')
            region.layerName = metadataService.getLayerMetadata(region.name, 'layerName')
            // hack for sub-regions
            if (!region.layerName) {
                region.layerName = metadataService.lookupLayerName(region.name)
            }
            region.id = region.fid //??
            region.source = metadataService.getLayerMetadata(region.name, 'source')
            region.description = metadataService.lookupDescription(region.name)
            region.notes = metadataService.getLayerMetadata(region.name, 'notes')
            region.parent = metadataService.lookupParentChain(region.name)

        }
        else {
            region.layerName = metadataService.layerNameForType(region.type)
            region.fid = metadataService.fidFor(region.type)
        }

        if (region.type == 'states') {
            // lookup state emblems
            def emblems = metadataService.getStateEmblems()[region.name]
            println emblems
            if (emblems) {
                ['animal','plant','marine','bird'].each {
                    if (emblems[it]) {
                        emblemGuids[it + 'Emblem'] = emblems."${it}".guid
                    }
                }
            }
        }
        println emblemGuids

        def docs = [:]
        // hack - to inject some document info - this should come from a bie service
        if (region.name == 'Great Eastern Ranges') {
            docs.factSheets = [
                    [linkText: 'What is Connectivity Conservation?', otherText: '[PDF 951KB]',url: 'http://www.greateasternranges.org.au/images/stories/downloads/connectivity-conservation.pdf', type: 'fact-sheet'],
                    [linkText: 'Fast Facts: Why the Great Eastern Ranges Are Important', otherText: '[PDF 690KB]',url: 'http://www.greateasternranges.org.au/images/stories/downloads/fast-facts.pdf', type: 'fact-sheet']
            ]
            docs.publications = [
                    [linkText: 'High Country Heritage Report', otherText: '',url: 'http://www.greateasternranges.org.au/images/stories/downloads/high-country-heritage-v4-web-nov-10.pdf', type: 'publication']
            ]
            docs.links = [
                    [linkText: 'Great Eastern Ranges Initiative website', otherText: '[PDF 3.5 MB]',url: 'http://www.greateasternranges.org.au/', type: 'link']
            ]
        }

        // render
        [region: region, emblems: emblemGuids, subRegions: subRegions,
                documents: docs, useReflect: params.reflect == 'false' ? false : true, downloadReasons:MetadataService.logReasonCache]
    }

    def reloadConfig = {
        // clear cached external config
        clearCache()

        // reload system config
        def resolver = new PathMatchingResourcePatternResolver()
        def resource = resolver.getResource(ConfigurationHolder.config.reloadable.cfgs[0])
        def stream

        try {
            stream = resource.getInputStream()
            ConfigSlurper configSlurper = new ConfigSlurper(GrailsUtil.getEnvironment())
            if(resource.filename.endsWith('.groovy')) {
                def newConfig = configSlurper.parse(stream.text)
                ConfigurationHolder.getConfig().merge(newConfig)
            }
            else if(resource.filename.endsWith('.properties')) {
                def props = new Properties()
                props.load(stream)
                def newConfig = configSlurper.parse(props)
                ConfigurationHolder.getConfig().merge(newConfig)
            }
            String res = "<ul>"
            ConfigurationHolder.config.each { key, value ->
                if (value instanceof Map) {
                    res += "<p>" + key + "</p>"
                    res += "<ul>"
                    value.each { k1, v1 ->
                        res += "<li>" + k1 + " = " + v1 + "</li>"
                    }
                    res += "</ul>"
                }
                else {
                    res += "<li>${key} = ${value}</li>"
                }
            }
            render res + "</ul>"
        }
        catch (GroovyRuntimeException gre) {
            println "Unable to reload configuration. Please correct problem and try again: " + gre.getMessage()
            render "Unable to reload configuration - " + gre.getMessage()
        }
        finally {
            stream?.close()
        }

    }
    
    def loadEmblems = {
        render metadataService.getStateEmblems() as JSON
    }
}
