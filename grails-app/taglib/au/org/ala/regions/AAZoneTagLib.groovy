/*
   Copyright 2013  nerdErg Pty Ltd (info@nerderg.com)
   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at
       http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   https://github.com/nerdErg/AjaxAnywhere-grails-plugin
*/
package au.org.ala.regions

import com.nerderg.ajaxanywhere.AAUtils

/**
 * The Grails equivalent to the Java taglib ZoneTag included in the AjaxAnywhere JAR file.<br/>
 * We thought this might be more convenient for Grails developers.
 *
 * @author Angel Ruiz (aruizca@gmail.com)
 */
class AAZoneTagLib {

    static namespace = "aa"

    /**
     * @attr id REQUIRED DOM id of the div element that will get updated
     * @attr tag html inline or block element tag to be generated instead of the default 'div' block tag
     * @attr @deprecated fragmentUrl url to get content when page is loaded
     * @attr href url to get content when page is loaded
     * @attr jsBefore javascript that will get evaluated before the Ajax request
     * @attr jsAfter javascript that will get evaluated after the successful Ajax request
     */
    def zone = { attrs, body ->
        // TODO Remove fragmentUrl attr next version
        String hrefOrFragmentUrl = attrs.fragmentUrl ?: attrs.href
        out << "${hrefOrFragmentUrl ? AAUtils.getZoneStartDelimiter(attrs.id, attrs.tag ?: 'zone', hrefOrFragmentUrl, attrs.jsBefore, attrs.jsAfter) : AAUtils.getZoneStartDelimiter(attrs.id, attrs.tag ?: 'div')}"
        out << body()
        out << AAUtils.getZoneEndDelimiter(attrs.id, attrs.tag ?: 'zone')
    }
}