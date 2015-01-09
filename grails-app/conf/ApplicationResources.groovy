// resource bundles
modules = {
    regions {
        dependsOn  'jquery-ui','jquery-migration', 'map', 'font-awesome'

        resource url: '/js/regions.js'
        resource url: '/css/regions.css', attrs:[media:'all']
    }

    'jquery-ui' {
        dependsOn 'jquery'

        resource url: '/js/jquery-ui-1.8.14.custom-notabs.min.js'
        resource url: '/css/smoothness/jquery-ui-1.8.14.custom.css', attrs:[media:'all']
    }

    'jquery-migration' {
        dependsOn 'jquery'

        resource url: '/js/jquery-migrate-1.2.1.min.js', disposition: 'head'
    }

    'map' {
        dependsOn 'google-maps-api'

        resource url: '/js/keydragzoom.js'
        resource url: '/js/wms.js'
        resource url: '/js/jquery.cookie.js'
        resource url: '/js/jquery.ba-bbq.min.js'

    }

    'google-maps-api' {
        resource  url: 'http://maps.google.com/maps/api/js?sensor=false', attrs: [type: "js"], disposition: 'head'
    }



}

