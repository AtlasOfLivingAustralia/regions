package au.org.ala.regions

import groovyx.net.http.*
import static groovyx.net.http.ContentType.*
import static groovyx.net.http.Method.*


class HabitatController {

    def metadataService

    def index = {
        [config : metadataService.getHabitatConfig()]
    }

    def findNode(node, habitatID){
        log.debug("finding habitat ID: " + habitatID)
        def nodeToReturn = null
        if(node.containsKey(habitatID)){
            nodeToReturn = node.get(habitatID)
        } else {
            if(node.children){
                nodeToReturn = findNode(node.children, habitatID)
            }
        }
        nodeToReturn
    }

    def flattenNode(node){
        def nodes = [node.name]
        node.children.each { key, value ->
            nodes << value.name
        }
        nodes
    }

    /**
     * Takes a habitat ID and constructs a biocache query for one or more habitats.
     *
     * @return
     */
    def viewRecords(){

        def habitatID = params.habitatID
        def config = metadataService.getHabitatConfig()

        //find the node
        def node = findNode(config.tree, habitatID)
        def flattenValues = flattenNode(node)
        def fqParam = "("
        def title = ""

        //retrieve child IDs and construct a query
        flattenValues.eachWithIndex { habitat, idx ->
            if(idx > 0){
                fqParam = fqParam + " OR "
                title = title + ", "
            }

            fqParam = fqParam + grailsApplication.config.habitat.layerId + ":\"" + habitat + "\""
            title = title + habitat
        }

        fqParam = fqParam + ")"

        def http = new HTTPBuilder( grailsApplication.config.biocacheService.baseURL + '/webportal/params' )
        http.request( POST, URLENC ) { req ->
            body = [
                    q: fqParam,
                    title: title
            ]
            response.success = { resp, json ->
                def qid = json.keySet().first()
                redirect(url: grailsApplication.config.biocache.baseURL  + "/occurrences/search?q=qid:" + qid)
            }

            response.failure = { resp, reader ->
                [response:resp, reader:reader]
            }
        }
    }
}