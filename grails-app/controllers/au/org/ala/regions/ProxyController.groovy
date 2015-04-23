package au.org.ala.regions

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
     *
     * The target domains must match the declared list of allowed hosts so we don't help hackers too much.
     *
     * @param url the url to proxy
     * not needed?  (@param format any grails mime type - used for GET requests)
     */
    def index = {
        //println "Method = ${request.getMethod()}"
        //params.each { println it }

        def content = request.reader.text
        def url = params.url ?: "http://v2.suite.opengeo.org/geoserver/ows"
        //println request.method + url + content
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
            //response.addHeader 'Content-Type', lookupContentType(params.format)
            render resp
        }
    }

    def lookupContentType(mimeType) {
        def mimeTypes = grailsApplication.config.grails.mime.types[mimeType]
        if (mimeTypes instanceof String) {
            // only one
            return mimeTypes
        }
        else if (mimeTypes.size() > 0) {
            // return the first
            return mimeTypes[0]
        }
        return "text/plain"
    }

    def kml = {

        def pid = params.pid ?: 5388062 // ger
        def baseUrl = grailsApplication.config.layersService.baseURL
        def url = baseUrl + "/shape/kml/" + pid

        def conn = new URL(url).openConnection()
        def kml = conn.content.text

        response.setHeader('Content-Type','application/vnd.google-earth.kml+xml');
        response.setHeader('Content-Length',String.valueOf(kml.size()));
        render kml
    }

    def bbox = {
        def baseUrl = grailsApplication.config.biocache.baseURL + "/ws/"
        def url = baseUrl + "webportal/bounds?q=" + URLEncoder.encode(params.q.trim(), 'UTF-8')
        def conn = new URL(url).openConnection()
        def box = conn.content.text
        render box
    }
}
