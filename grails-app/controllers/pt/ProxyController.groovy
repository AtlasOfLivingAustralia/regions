package pt

import grails.converters.JSON
import java.sql.Timestamp

class ProxyController {

    def allowedHosts = ['v2.suite.opengeo.org','spatial.ala.org.au']

    def badRequest = {text ->
        render(status:400, text: text)
    }

    def success = { text ->
        render(status:200, text: text)
    }

    def notFound = { text ->
        render(status:404, text: text)
    }

    def notAllowed = {
        response.addHeader 'allow','POST'
        render(status:405, text: 'Only POST supported')
    }

    def badGateway = { host ->
        response.addHeader 'Content-Type','text/plain'
        render(status:502, text: "This proxy does not allow you to access that location (${host}).")
    }

    /**
     * This is a simple mindless proxy to subvert origin access control.
     */
    def index = {
        //println "Method = ${request.getMethod()}"
        //params.each { println it }

        def content = request.reader.text
        def url = params.url ?: "http://v2.suite.opengeo.org/geoserver/ows"
        println request.method + url + content
        def host = url.tokenize('/')[1]
        //println "Host = ${host}"

        if (!(host in allowedHosts)) {
            badGateway host
            return
        }

        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            badRequest 'Illegal request'
            return
        }

        if (request.method == 'OPTIONS') {
            response.addHeader('Allow','GET, HEAD, POST, PUT, DELETE, TRACE, OPTIONS')
            response.addHeader('Content-Type','text/plain')
            success ""
            return
        }
        else if (request.post) {
            def u = new URL(url)
            HttpURLConnection conn = (HttpURLConnection)u.openConnection();
            conn.setRequestMethod('POST')
            conn.setAllowUserInteraction(false); // no user interact [like pop up]
            conn.setDoOutput(true); // want to send
            conn.setRequestProperty( "Content-type", "text/xml" );
            conn.setRequestProperty( "Content-length", Integer.toString(content.length()));
            OutputStream ost = conn.getOutputStream();
            PrintWriter pw = new PrintWriter(ost);
            pw.print(content); // here we "send" our body!
            pw.flush();
            pw.close();
            render conn.getInputStream().text
        }
        else {
            def resp = new URL( params.url ).getText()
            //println "Response = ${resp}"
            //response.addHeader 'Content-Type','text/plain'
            render resp
        }
    }

    static regionListCache = [:]
    static Date cacheLastRefreshed = new Date() - 2;

    /**
     * Returns a page of results for the specified type of region.
     *
     * @param type the type of region - states, lgas, ibras, imcrs, nrms
     * @param pageSize the chunk size for pagination
     * @param page that page to start at (zero-based)
     */
    def regions = {
        // pagination
        int pageSize = params.pageSize as int ?: 60
        int page = params.page as int ?: 0

        // test age of cache
        if (new Date().after(cacheLastRefreshed + 1)) {
            // older than 1 day so dump cache
            regionListCache = [:]
            println "cleared region cache"
        }

        // try cache first
        def featuresList = regionListCache[params.type]

        // else get from source
        if (!featuresList) {
            def type = 'state'
            switch (params.type) {
                case 'states': type = 'state'; break
                case 'lgas': type = 'lga'; break
                case 'ibras': type = 'ibra'; break
                case 'imcras': type = 'imcra'; break
                case 'nrms': type = 'nrm'; break
            }
            def prefix = "http://spatial.ala.org.au/gazetteer/${type}/"
            def url = prefix + "features.json"
            try {
                // calls service recursively until all pages are retrieved
                def list = getRegionList(type, 0, true)

                // add to cache
                regionListCache[params.type] = list.sort()

                // record the timestamp
                cacheLastRefreshed = new Date()

                featuresList = regionListCache[params.type]

            } catch (SocketTimeoutException e) {
                println "Timed out. URL= ${url}."
                def error = [error:"Timed out.", totalRecords: 0, decades: null]
                render error
            } catch (Exception e) {
                println "Failed. ${e.getClass()} ${e.getMessage()} URL= ${url}."
                def error = ["error":"Failed. ${e.getClass()} ${e.getMessage()} URL= ${url}."]
                render error
            }
        }

        assert featuresList
        
        // pagination
        int pages = Math.ceil(featuresList.size() / pageSize)
        if (page > pages - 1) {
            page = pages - 1
        }
        int start = page * pageSize
        int end = Math.min(start + pageSize, featuresList.size() as int) - 1

        // if in query mode
        /*if (params.q) {
            // filter by query
            list = list.findAll { it.toLowerCase() =~ params.q}
        }*/

        // render the page of regions
        def result = [total: featuresList.size(), pageSize: pageSize, start: start, features: featuresList[start..end]]

        render result as JSON

    }

    def regionSearch = {
        // assume cache loaded for now
        def featuresList = regionListCache[params.type]
        assert featuresList

        // filter by query
        def list = featuresList.findAll { it.toLowerCase() =~ params.term}

        render list as JSON
    }

    int lastPage(List list, int pageSize) {
        return Math.floor(list.size()/pageSize) * pageSize
    }

    List getRegionList(String type, int page, boolean recursive) {
        def prefix = "http://spatial.ala.org.au/gazetteer/${type}/"
        def url = prefix + "features/${page + 1}.json"
        def conn = new URL(url).openConnection()
        conn.setConnectTimeout(10000)
        conn.setReadTimeout(50000)
        def json = JSON.parse(conn.content.text)
        def result = []
        json.features.each {
            String name = it[prefix.size()..-6].replaceAll('_',' ')
            if (name[-1] == ')') {
                // remove trailing state in parentheses
                name = name[0..name.lastIndexOf('(')-2]
            }
            result << name
        }
        if (json.next != null && json.next.toString() != "" && page < 100 && recursive) {
            //println json.next
            page++
            //println "getting page ${page}"
            result += getRegionList(type, page, recursive)
        }
        return result
    }

    def refreshCache = {
        regionListCache = [:]
        render 'Done.'
    }
}
