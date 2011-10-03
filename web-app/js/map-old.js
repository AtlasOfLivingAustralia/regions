/*
 * Mapping - plot collection locations
 */

/* some globals */
// the map
var map;

// the spherical mercator projection
//var proj = new OpenLayers.Projection("EPSG:900913");
var proj = new OpenLayers.Projection("EPSG:4326");

// projection options for interpreting GeoJSON data
var proj_options;

// the data layer
var vectors;

// the server base url
var baseUrl;

var info;

var extent = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);

// centre point for map of Australia - this value is transformed
// to the map projection once the map is created.
var centrePoint = new OpenLayers.LonLat(133.7, -26.5);

var states, lgas, ibras, imcras, nrms;

var layersList = ['states','lgas','ibras','imcras','nrms'];
var layersNameList = ['aus1','aus2','ibra_merged','imcra4_pb','nrm_regions_2010'];

/************************************************************\
* initialise the map
* note this must be called from body.onload() not jQuery document.ready() as the latter is too early
\************************************************************/
function initMap(serverUrl) {

    // serverUrl is the base url for the site eg http://collections.ala.org.au in production
    // cannot use relative url as the context path varies with environment
    baseUrl = serverUrl;

    OpenLayers.ProxyHost= "http://woodfired.ala.org.au:8070/pt/proxy?url=";

    // create the map
    map = new OpenLayers.Map('map_canvas', {
        //maxResolution: 2468,
        /*maxExtent: new OpenLayers.Bounds(-10037508.34, -10037508.34, 10037508.34, 10037508.34),*/
        controls: []
    });

    // restrict mouse wheel chaos
    map.addControl(new OpenLayers.Control.Navigation({zoomWheelEnabled:false}));
    map.addControl(new OpenLayers.Control.ZoomPanel());
    map.addControl(new OpenLayers.Control.PanPanel());

    // create Google base layers
    var wms = new OpenLayers.Layer.WMS(
              "OpenLayers WMS",
              "http://vmap0.tiles.osgeo.org/wms/vmap0",
              {'layers':'basic'} );
    map.addLayer(wms);

    // zoom map
    map.zoomToMaxExtent();

    // add layer switcher for now - review later
    map.addControl(new OpenLayers.Control.LayerSwitcher());

    // centre the map on Australia
    resetZoom();
    //map.setCenter(centrePoint.transform(proj, map.getProjectionObject()), 4);

    // set projection options
    proj_options = {
        'internalProjection': map.baseLayer.projection,
        'externalProjection': proj
    };

    // create custom button to zoom extents to Australia
    var button = new OpenLayers.Control.Button({
        displayClass: "resetZoom",
        title: "Zoom to Australia",
        trigger: resetZoom
    });
    var panel = new OpenLayers.Control.Panel({defaultControl: button});
    panel.addControls([button]);
    map.addControl(panel);

    // overlays
    for (var i = 0; i < layersList.length; i++) {
        window[layersList[i]] = new OpenLayers.Layer.WMS(
              "Aus " + layersList[i],
              "http://spatial.ala.org.au/geoserver/ALA/wms",
              //"http://spatial.ala.org.au/geoserver/gwc/service/wms",
              {
                  layers:'ALA:' + layersNameList[i],
                  transparent: "true",
                  format: "image/png"
              },
              {isBaseLayer: false} );
        map.addLayer(window[layersList[i]]);
        if (i > 0) {
            window[layersList[i]].setVisibility(false);
        }
    }

    /*var highlight = new OpenLayers.Layer.Vector("Highlighted Features", {
        displayInLayerSwitcher: false,
        isBaseLayer: false
    });
    map.addLayer(highlight);*/

    /*info = new OpenLayers.Control.WMSGetFeatureInfo({
        url: 'http://spatial.ala.org.au/geoserver/ALA/wms',
        title: 'Identify features by clicking',
        queryVisible: true,
        eventListeners: {
            getfeatureinfo: function(event) {
                alert(event.text);
                *//*map.addPopup(new OpenLayers.Popup.FramedCloud(
                    "chicken",
                    map.getLonLatFromPixel(event.xy),
                    null,
                    event.text,
                    null,
                    true
                ));*//*
            }
        }
    });
    map.addControl(info);
    info.activate();*/

    var select = new OpenLayers.Layer.Vector("Selection", {styleMap:
        new OpenLayers.Style(OpenLayers.Feature.Vector.style["select"])
    });
    //var hover = new OpenLayers.Layer.Vector("Hover");
    map.addLayers([select]);

    var control = new OpenLayers.Control.GetFeature({
        protocol: OpenLayers.Protocol.WFS.fromWMSLayer(lgas),
        box: false,
        click: true,
        single: true,
        hover: false,
        multipleKey: "shiftKey",
        toggleKey: "ctrlKey"
    });
    control.events.register("featureselected", this, function(e) {
        select.addFeatures([e.feature]);
    });
    control.events.register("featuresselected", this, function(e) {
        select.addFeatures([e.feature]);
    });
    control.events.register("featureunselected", this, function(e) {
        select.removeFeatures([e.feature]);
    });
    control.events.register("clickout", this, function(e) {
        alert('clickout');
    });
    map.addControl(control);
    control.activate();


}

/************************************************************\
*   reset map to initial view of Australia
\************************************************************/
function resetZoom() {
    // centre the map on Australia
    // note that the point has already been transformed
    map.setCenter(centrePoint);
    map.zoomTo(4);
}

/************************************************************\
*   handle filter button click
\************************************************************/
function toggleButton(button) {
    // if already selected do nothing
    if ($(button).hasClass('selected')) {
        return;
    }

    // de-select all
    $('div.filter-buttons div').toggleClass('selected',false);

    // select the one that was clicked
    $(button).toggleClass("selected", true);

    // show the selected layer
    var clicked = button.id
    window[clicked].setVisibility(true);

    // hide others
    for (var i = 0; i < layersList.length; i++) {
        if (layersList[i] != clicked) {
            window[layersList[i]].setVisibility(false);
        }
    }
}

/* END filter buttons */
