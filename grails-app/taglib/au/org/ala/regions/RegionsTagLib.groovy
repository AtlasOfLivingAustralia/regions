package au.org.ala.regions

import org.codehaus.groovy.grails.commons.ConfigurationHolder

class RegionsTagLib {

    static namespace = 'rg'

    def loggedInUsername = { attrs ->
        if (request.getUserPrincipal()) {
        	out << request.getUserPrincipal().name
        }
        else if (AuthenticationCookieUtils.cookieExists(request, AuthenticationCookieUtils.ALA_AUTH_COOKIE)) {
            out << AuthenticationCookieUtils.getUserName(request)
        }
        else {
            out << ""
        }
    }

    /**
     * Write the appropriate breadcrumb trail.
     *
     * Checks the config for skin to choose the correct hierarchy.
     *
     * @attr home the root of the page - defaults to collections
     * @attr atBase true if the page is the base page of the root (no link is added)
     */
    def breadcrumbTrail = {attrs ->
        if (ConfigurationHolder.config.ala.skin == 'ala') {
            out << "<li><a href='${ConfigurationHolder.config.ala.baseURL}'>Home</a></li>" +
                "<li> <a href='${ConfigurationHolder.config.ala.baseURL}/explore/'>Explore</a></li>"
        }
        else {
            out << "<li><a href='${ConfigurationHolder.config.ala.baseURL}'>Home</a></li>" +
                "<li> <a href='${ConfigurationHolder.config.ala.baseURL}/species-by-location/'>Locations</a></li>"
        }
    }

}
