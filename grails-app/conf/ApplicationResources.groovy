// resource bundles
modules = {

    regions {
        dependsOn  'jquery', 'jquery-ui', 'jquery-bbq', 'map', 'font-awesome', 'he'

        resource url: '/js/regions.js'
        resource url: '/css/regions.css', attrs:[media:'all']
    }

    region {
        dependsOn 'jquery', 'jquery-ui', 'jquery-ui-slider-pips', 'jquery-bbq', 'ajaxanywhere', 'map', 'charts', 'number-functions', 'font-awesome'

        resource url: '/js/region.js'
        resource url: '/css/regions.css', attrs:[media:'all']
    }

    jquery {
        resource url: '/vendor/jquery/jquery-1.11.2.js'
    }

    'jquery-ui' {
        dependsOn 'jquery'

        resource url: '/vendor/jquery-ui/jquery-ui-1.11.2-no-autocomplete.js'
        resource url: '/vendor/jquery-ui/themes/smoothness/jquery-ui.css', attrs:[media:'all']
    }

    'jquery-ui-slider-pips' {
        dependsOn 'jquery-ui'

        resource url: '/vendor/jquery-ui-slider-pips/jquery-ui-slider-pips.js'
        resource url: '/vendor/jquery-ui-slider-pips/jquery-ui-slider-pips.css', attrs:[media:'all']
    }

    'jquery-bbq' {
        dependsOn 'jquery'

        resource url: '/vendor/jquery-bbq/jquery.ba-bbq-1.2.1.js'
    }

    'map' {
        dependsOn 'google-maps-api'

        resource url: '/js/keydragzoom.js'
        resource url: '/js/wms.js'
    }

    'google-maps-api' {
        resource  url: 'https://maps.google.com/maps/api/js?sensor=false', attrs: [type: "js"], disposition: 'head'
    }

    charts {
        resource url: 'https://www.google.com/jsapi', attrs: [type: 'js']
        resource url: '/js/charts2.js'
    }

    'number-functions' {
        resource url: '/vendor/number-functions/number-functions.js'
    }

    he {
        resource url: '/vendor/he/he-0.5.0.js'
    }
}

