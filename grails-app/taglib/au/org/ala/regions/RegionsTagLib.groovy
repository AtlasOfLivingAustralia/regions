package au.org.ala.regions

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
}
