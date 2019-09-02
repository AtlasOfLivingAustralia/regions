package au.org.ala.regions

import au.org.ala.cas.util.AuthenticationCookieUtils
import grails.util.Environment
import groovy.xml.MarkupBuilder

class RegionsTagLib {

    static namespace = 'rg'

    MetadataService metadataService

    /**
     * Returns the username of the user if logged in else blank
     *
     * @attrs noCookie if true the helper cookie will not be used, ie the user must actually be logged in
     */
    def loggedInUsername = { attrs ->
        def useCookie = attrs.noCookie != "true"
        if (request.getUserPrincipal()) {
        	out << request.getUserPrincipal().name
        }
        else if (useCookie && AuthenticationCookieUtils.cookieExists(request, AuthenticationCookieUtils.ALA_AUTH_COOKIE)) {
            out << AuthenticationCookieUtils.getUserName(request)
        }
        else {
            out << ""
        }
    }

    /**
     * Generate the login link for the banner.
     *
     * Will be to log in or out based on current auth status.
     *
     * @attr fixedAppUrl if supplied will be used for logout instead of the current page
     *
     * @deprecated use HeaderFooterTagLib
     */
    def loginoutLink2011 = { attrs ->
        def requestUri = grailsApplication.config.security.cas.serverName + request.forwardURI
        if (AuthenticationCookieUtils.cookieExists(request, AuthenticationCookieUtils.ALA_AUTH_COOKIE)) {
            // currently logged in
            out << link(controller: 'regions', action: 'logout',
                    params: [casUrl: grailsApplication.config.security.cas.logoutUrl,
                            appUrl: attrs.fixedAppUrl ?: requestUri]) {'Logout'}
        } else {
            // currently logged out
            out << "<a href='https://auth.ala.org.au/cas/login?service=${requestUri}'><span>Log in</span></a>"
        }
    }

    /**
     * Write the appropriate breadcrumb trail.
     *
     * Checks the config for skin to choose the correct hierarchy.
     * A skin can define the breadcrumb using the properties:
     *
     * skin.breadcrumb.level1.title=
     * skin.breadcrumb.level1.path=
     * skin.breadcrumb.level2.title=
     * skin.breadcrumb.level2.path=
     * etc
     *
     * Note that only 9 levels are supported as the levels are sorted alphabetically.
     * All paths are considered to be relative to the skin.homeUrl URL.
     *
     * If these properties are not specified, the defaults are used. breadcrumb.default.level1.title etc.
     * See config.groovy for these defaults.
     */
    def breadcrumbTrail = {attrs ->

        String homeURL = grailsApplication.config.skin.homeURL ?: grailsApplication.config.ala.baseURL
        SortedMap breadcrumbConfig = new TreeMap(grailsApplication.config.skin.breadcrumb ?: grailsApplication.config.breadcrumb.default)

        breadcrumbConfig.each { String level, Map config ->
            out << """<li><a href='${homeURL+config.path}'>${config.title}</a> <span class="divider"><i class="fa fa-arrow-right"></i></span></li>"""
        }

        return out
    }

    /**
     * Build a URL string for link to biocache records results
     *
     * @attr guid REQUIRED
     * @attr regionFid REQUIRED
     * @attr regionType REQUIRED
     * @attr regionName REQUIRED
     * @attr from REQUIRED
     * @attr to REQUIRED
     */
    def speciesRecordListUrl = {attrs ->
        out << metadataService.buildSpeciesRecordListUrl(attrs.guid, attrs.regionFid, attrs.regionType, attrs.regionName, attrs.regionPid, attrs.group, attrs.subgroup, attrs.from, attrs.to, attrs.showHubData, attrs.fq)
    }

    /**
     * Build a URL string for link to biocache download page
     *
     * @attr guid REQUIRED
     * @attr regionFid REQUIRED
     * @attr regionType REQUIRED
     * @attr regionName REQUIRED
     * @attr from REQUIRED
     * @attr to REQUIRED
     * @attr totalRecords REQUIRED
     */
    def downloadRecordListUrl = { attrs ->
        out << metadataService.buildDownloadRecordListUrl(attrs.guid, attrs.regionFid, attrs.regionType, attrs.regionName, attrs.regionPid, attrs.group, attrs.subgroup, attrs.from, attrs.to, attrs.showHubData,
                "${request.getHeader('referer')}", attrs.fq, attrs.totalRecords)
    }

    /**
     * Output the meta tags (HTML head section) for the build meta data in application.properties
     * E.g.
     * <meta name="svn.revision" content="${g.meta(name:'svn.revision')}"/>
     * etc.
     *
     * Updated to use properties provided by build-info plugin
     */
    def addApplicationMetaTags = { attrs ->
        def metaList = ['app.version', 'app.grails.version', 'build.date', 'scm.version', 'environment.BUILD_NUMBER', 'environment.BUILD_ID', 'environment.BUILD_TAG', 'environment.GIT_BRANCH', 'environment.GIT_COMMIT']
        def mb = new MarkupBuilder(out)

        mb.meta(name:'grails.env', content: "${Environment.current}")
        metaList.each {
            mb.meta(name:it, content: g.meta(name:it))
        }
        mb.meta(name:'java.version', content: "${System.getProperty('java.version')}")
    }

}
