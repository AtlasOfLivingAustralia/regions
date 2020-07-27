/*
 * Copyright (C) 2018 Atlas of Living Australia
 * All Rights Reserved.
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 */
package au.org.ala.regions

import groovy.util.logging.Log4j
import org.grails.spring.context.support.ReloadableResourceBundleMessageSource
/**
 * Custom message source to expose all message for i18n controller
 * as required for jQuery.i18n.properties plugin.
 *
 * @author "Nick dos Remedios <Nick.dosRemedios@csiro.au>"
 * @author "Vicente Ruiz <vjrj@gbif.es>"
 */
// 2020-Mar: Vicente copied and adapted Nick class in Regions

@Log4j
class CustomResourceBundleMessageSource extends ReloadableResourceBundleMessageSource {

    /**
     * Provide a complete listing of properties for a given locale, as a Map
     * Client app properties override those from this plugin
     *
     * @param locale
     * @return
     */
    Properties listMessageCodes(Locale locale) {
        // For now we only use regions messages
        this.getMergedProperties(locale).getProperties()
    }
}
