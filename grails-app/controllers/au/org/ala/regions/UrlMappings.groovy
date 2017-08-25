package au.org.ala.regions

class UrlMappings {

    static mappings = {

        "/logout/logout"(controller: "logout", action: 'logout')
        "/feature/$pid"(controller: 'regions', action: 'region')

        "/habitats"(controller: 'habitat', action: 'index')
        "/habitats/"(controller: 'habitat', action: 'index')
        "/habitat/?$pid"(controller: 'regions', action: 'habitat')
        "/habitats/sld"(controller: 'habitat', action: 'sld')
        "/habitats/records/$habitatID"(controller: 'habitat', action: 'viewRecords')

        name regionByFeature: "/feature/$pid"(controller: 'regions', action: 'region')
        name habitatByFeature: "/habitat?/$pid"(controller: 'regions', action: 'habitat')
        name habitatByFeature: "/habitats?/$pid"(controller: 'regions', action: 'habitat')

        "/$regionType/$regionName"(controller: 'regions', action: 'region') {
            constraints {
                //do not match controllers
                regionType(matches: '(?!(^data\$|^proxy\$|^region\$|^regions\$|^alaAdmin\$)).*')
            }
        }

        "/$regionType"(controller: 'regions', action: 'regions') {
            constraints {
                //do not match controllers
                regionType(matches: '(?!(^data\$|^proxy\$|^region\$|^regions\$|^alaAdmin\\$)).*')
            }
        }

        "/$controller/$action?/$id?(.$format)?" {
            constraints {
                // apply constraints here
            }
        }

        "/"(controller: 'regions', action: 'regions')
        "500"(view: '/error')
    }
}
