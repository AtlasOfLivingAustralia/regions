package au.org.ala.regions

import grails.converters.JSON
import groovy.xml.StreamingMarkupBuilder

class DataController {

    def metadataService

    def index() {}

    def regionsMetadata() {
        response.contentType = 'application/json'
        render metadataService.regionsMetadata as JSON
    }

    def regionsMetadataJavascript() {
        response.contentType = 'application/json'
        render metadataService.getRegionsMetadataAsJavascript()
    }

    def sitemap() {
        def xml = new StreamingMarkupBuilder()
        xml.encoding = "UTF-8"
        response.contentType = 'text/xml'
        render xml.bind {
            mkp.xmlDeclaration()
            urlset(xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9") {
                url {
                    loc(g.createLink(absolute: true, controller: 'regions'))
                    changefreq('weekly')
                    priority(1.0)
                }
                metadataService.getRegionTypes().each { regionType ->
                    if (regionType == 'other') {
                        metadataService.getOtherRegions().each { other, otherValue ->
                            url {
                                loc(grailsApplication.config.grails.serverURL + "/layer/" + other.encodeAsURL())
                                changefreq('weekly')
                            }
                        }
                    }
                    else {
                        metadataService.getObjectsForALayer(metadataService.fidFor(regionType)).each { key, obj ->
                            url {
                                loc(grailsApplication.config.grails.serverURL + "/${regionType}/" + obj.name.encodeAsURL())
                                changefreq('weekly')
                            }
                        }
                    }
                }
            }
        }.toString()
    }

}
