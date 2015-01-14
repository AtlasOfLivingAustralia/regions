// resource bundles
modules = {
    regions {
        dependsOn  'jquery', 'jquery-ui', 'map', 'font-awesome'
        resource url: '/js/regions.js'
        resource url: '/css/regions.css', attrs:[media:'all']
    }

    region {
        dependsOn 'jquery','jquery-ui', 'map', 'fancybox', 'charts', 'jsonp', 'number-functions', 'font-awesome'

        resource url: '/js/region.js', disposition: 'head'
        resource url: '/css/regions.css', attrs:[media:'all']
    }

    'jquery-ui' {
        dependsOn 'jquery'

        resource url: '/js/jquery-ui-1.8.14.custom-notabs.min.js', disposition: 'head'
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
        resource url: '/js/jquery.ba-bbq.min.js', disposition: 'head'

    }

    'google-maps-api' {
        resource  url: 'http://maps.google.com/maps/api/js?sensor=false', attrs: [type: "js"], disposition: 'head'
    }

    fancybox {
        dependsOn 'jquery'

        resource url: '/js/fancybox/jquery.fancybox-1.3.4.pack.js', disposition: 'head'
        resource url: '/js/fancybox/jquery.fancybox-1.3.4.css'
    }

    charts {
        resource url: 'https://www.google.com/jsapi', attrs: [type: 'js'], disposition: 'head'
        resource url: '/js/charts2.js', disposition: 'head'
    }

    jsonp {
        resource url: '/js/jquery.jsonp-2.1.4.min.js', disposition: 'head'
    }

    'number-functions' {
        resource url: '/js/number-functions.js', disposition: 'head'
    }

}

