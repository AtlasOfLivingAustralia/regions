// resource bundles
modules = {

    regions {
        dependsOn  'jquery', 'jquery-ui', 'map', 'font-awesome'
        resource url: '/assets/js/regions.js'
        resource url: '/assets/css/regions.css', attrs:[media:'all']
    }

    region {
        dependsOn 'jquery', 'jquery-ui', 'ajaxanywhere', 'map', 'charts', 'jsonp', 'number-functions', 'font-awesome'

        resource url: '/assets/js/region.js'
        resource url: '/assets/css/regions.css', attrs:[media:'all']
    }

    jquery {
        resource url: '/vendor/jquery/jquery-1.11.2.js'
    }

    'jquery-ui' {
        dependsOn 'jquery'

        resource url: '/vendor/jquery-ui/jquery-ui-1.11.2-no-autocomplete.js'
        resource url: '/vendor/jquery-ui/themes/smoothness/jquery-ui.css', attrs:[media:'all']
    }

    'map' {
        dependsOn 'google-maps-api'

        resource url: '/assets/js/keydragzoom.js'
        resource url: '/assets/js/wms.js'
    }

    'google-maps-api' {
        resource  url: 'http://maps.google.com/maps/api/js?sensor=false', attrs: [type: "js"], disposition: 'head'
    }

    charts {
        resource url: 'https://www.google.com/jsapi', attrs: [type: 'js']
        resource url: '/assets/js/charts2.js'
    }

    jsonp {
        resource url: '/vendor/jquery-jsonp/jquery.jsonp-2.1.4.min.js'
    }

    'number-functions' {
        resource url: '/vendor/number-functions/number-functions.js'
    }
}

