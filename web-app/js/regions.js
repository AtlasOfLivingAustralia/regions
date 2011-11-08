/*
 *  Copyright (C) 2011 Atlas of Living Australia
 *  All Rights Reserved.
 *
 *  The contents of this file are subject to the Mozilla Public
 *  License Version 1.1 (the "License"); you may not use this file
 *  except in compliance with the License. You may obtain a copy of
 *  the License at http://www.mozilla.org/MPL/
 *
 *  Software distributed under the License is distributed on an "AS
 *  IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 *  implied. See the License for the specific language governing
 *  rights and limitations under the License.
 */

/* TODO: these should be injected from config */
var spatialWmsUrl = "http://spatial.ala.org.au/geoserver/ALA/wms?";
var spatialCacheUrl = "http://spatial.ala.org.au/geoserver/gwc/service/wms?";
var spatialServiceUrl = "http://spatial.ala.org.au/layers-service";
var baseUrl;

// the map
var map;

var defaultOccurrenceOpacity = 0.7;
var defaultRegionOpacity = 0.8;
var defaultLayerOpacity = 0.55;
var initialBounds;
var overlays = [];
var initialRegion;

// the currently selected region type - should always be defined
var selectedRegionType = 'states';
// the currently selected region - will be null if no region is selected
var selectedRegion = null;
// the pid of a selected 'sub-region' of an 'other' layer - will be null if no sub-region is selected
var selectedSubregionPid = null;

function clearSelectedRegion() {
    selectedRegion = null; // new
    removeRegion();
    $.bbq.removeState('region');
    clearHighlights();
    hideInfo();
    disableRegionsSlider();
}
function setSelectedRegion(region, pid) {
    clearSelectedRegion();
    selectedRegion = region;
    $.bbq.pushState({region:region});
    if ($('#toggleRegion').is(':checked')) {
        displayRegion(region, pid);
    }
    highlightInList(region);
    setMapLinks(region);
    enableRegionsSlider();
}
function setSubregion(region, pid) {
    selectedSubregionPid = pid;
    displayRegion(region, pid);
    setMapLinks(region);
    enableRegionsSlider();
}
function clearSubregion() {
    removeRegion();
    disableRegionsSlider();
    $('#extra').html("");
}
function setOtherRegion(region) {
    removeRegion();
    clearHighlights();
    disableRegionsSlider();
    selectedRegion = region;
    $.bbq.pushState({region:region});
    // other regions draw as a full layer
    drawLayer('other');
    highlightInList(region);
    setMapLinks();
}
function isOther() {
    return selectedRegionType == 'other'
}
/*
 * regionsList is a js object with a property for each region type.
 * The value of each region type is a js object with these properties:
 *   names: an alphabetical list of the names of the objects in the layer
 *   objects: a map of the object properties keyed by the name - includes pid, bbox, area
 */
var regionsList = {};

var layers = {
    states: {layer: 'states', name: 'aus1', displayName: 'name_1', fid: 'cl22' /*'id_1'*/, bieContext: 'aus_states', accordionOrder: 0},
    lgas: {layer: 'lgas', name: 'aus2', displayName: 'name_2', fid: 'cl23' /*'id_2'*/, bieContext: 'gadm_admin', accordionOrder: 1},
    ibras: {layer: 'ibras', name: 'ibra_merged', displayName: 'reg_name', fid: 'cl20' /*'reg_no'*/, bieContext: 'ibra_no_states', accordionOrder: 2},
    imcras: {layer: 'imcras', name: 'imcra4_pb', displayName: 'pb_name', fid: 'cl21' /*'pb_num'*/, bieContext: 'imcra', accordionOrder: 3},
    nrms: {layer: 'nrms', name: 'nrm_regions_2010', displayName: 'nrm_region', fid: 'cl916', bieContext: 'nrm', accordionOrder: 4},
    other: {layer: 'other', name: '', displayName: '', fid: '', bieContext: '', accordionOrder: 5},
    /*hunter: {layer: 'hunter', name: 'ger_hunter', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
    k2c: {layer: 'k2c', name: 'ger_kosciuszko_to_coast', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
    border: {layer: 'border_ranges', name: 'ger_border_ranges', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
    slopes: {layer: 'slopes_to_summit', name: 'ger_slopes_to_summit', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},*/
    ger: {layer: 'ger', name: 'ger_geri_boundary_v102_australia', displayName: 'ala_id', fid: 'cl904', bieContext: 'ger'}
};

/************************************************************\
* initialise the map
* note this must be called from body.onload() not jQuery document.ready() as the latter is too early
\************************************************************/
function initMap() {

    initialBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(-41.5, 114),
            new google.maps.LatLng(-13.5, 154));

    var myOptions = {
        scrollwheel: false,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        scaleControl: true,
        scaleControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        panControl: false,
        draggableCursor: 'pointer',
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    map.fitBounds(initialBounds);
    map.enableKeyDragZoom();

    drawLayer(selectedRegionType);

    google.maps.event.addListener(map, 'click', function(event) {
        clickedAt(event.latLng);
    });

}

/**
 * Draws the specified layer.
 * Will generate new wms if the tile layer's opacity is different to the currently selected capacity
 * or if the tile layer does not exist.
 *
 * @param regionType
 */
function drawLayer(regionType) {
    if (regionType == 'other') {
        drawOtherLayer();
    }
    else {
        var layer = layers[regionType];
        var redraw = false;
        if (layer.wms == undefined) {
            redraw = true;
        }
        else {
            redraw = (layer.wms.opacity != getLayerOpacity());
        }
        if (redraw) {
            var layerParams = [
                "FORMAT=image/png8",
                "LAYERS=ALA:" + layer.name,
                "STYLES=polygon"
            ];
            layer.wms = new WMSTileLayer(
                    layer.name, spatialCacheUrl, layerParams, wmsTileLoaded, getLayerOpacity());
        }
        map.overlayMapTypes.setAt(0, layer.wms);
    }
}

/**
 * Draws the currently selected 'other' region as a layer.
 *
 * Doesn't cache these.
 */
function drawOtherLayer() {
    if (selectedRegion == null) return;
    var layerName = regionsList['other'].objects[selectedRegion].layerName;
    var layerParams = [
        "FORMAT=image/png8",
        "LAYERS=ALA:" + layerName,
        "STYLES=polygon"
    ];
    var wms = new WMSTileLayer(layerName, spatialCacheUrl, layerParams, wmsTileLoaded, getLayerOpacity());
    map.overlayMapTypes.setAt(0, wms);
}

/**
 * Map has been clicked.
 * @param location google.maps.LatLng
 */
function clickedAt(location) {
    var fid;
    if (isOther()) {
        fid = regionsList['other'].objects[selectedRegion].fid;
    }
    else {
        fid = layers[selectedRegionType].fid;
    }
    $.ajax({
        url: baseUrl + "/proxy?format=json&url=" + spatialServiceUrl + "/intersect/" + fid + "/" +
                location.lat() + "/" + location.lng(),
        dataType: 'json',
        success: function(data) {
            if (data.length == 0) { return; }

            // find out how many features have real data
            var features = [];
            $.each(data, function(i, obj) {
                if (obj.value) {
                    features.push(obj);
                }
            });

            switch (features.length) {
                case 0:
                    if (isOther()) {
                        clearSubregion();
                    }
                    else {
                        clearSelectedRegion();
                    }
                    break;
                default:  // treat one or many as just one for now
                    if (isOther()) {
                        setSubregion(features[0].value, features[0].pid);
                    }
                    else {
                        setSelectedRegion(features[0].value);
                    }
            }
        }
    });

}

/**
 * Called when the overlays are loaded. Not currently used
 * @param numtiles
 */
function wmsTileLoaded(numtiles) {
    $('#maploading').fadeOut("slow");
}

/**
 * Returns the value of the opacity slider for the region overlay.
 */
function getRegionOpacity() {
    var opacity = $('#regionOpacity').slider("value");
    return isNaN(opacity) ? defaultRegionOpacity : opacity / 100;
}

/**
 * Returns the value of the opacity slider for the region overlay.
 */
function getLayerOpacity() {
    var opacity = $('#layerOpacity').slider("value");
    return isNaN(opacity) ? defaultLayerOpacity : opacity / 100;
}

function setMapLinks(clickedRegion) {
    if (isOther()) {
        var extra = "";
        if (clickedRegion) {
            extra = "<span id='extra'>(" + clickedRegion + ")</span>";
        }
        showInfo("<a href='" + baseUrl + "/layer/" + selectedRegion + "'>" + selectedRegion + "</a>" +
                "<span id='zoomTo'>Zoom to region</span>" + extra);
    }
    else {
        showInfo("<a href='" + baseUrl + "/" + getSelectedLayer().layer + "/" + selectedRegion + "'>" +
                selectedRegion + "</a>" + "<span id='zoomTo'>Zoom to region</span>");
    }
}
/**
 * Writes the list of regions in a layer, using ajax to get the data if it is not cached.
 *
 * @param regionType
 * @param callback optional function to call when the list is ready
 */
function showRegionsList(regionType, callback) {
    if (regionsList[regionType] == undefined) {
        // load the data
        var listUrl = baseUrl + "/regions/regionList?type=" + regionType;
        $.getJSON(listUrl, function(data) {
            // add to cache
            regionsList[regionType] = data;
            writeRegionsList(regionType);
            if (callback) window[callback]();
        }).error(function(data, textStatus) {
            $('#filtered-list').html("An error occurred: " + textStatus);
        });
    }
    else {
        writeRegionsList(regionType);
        if (callback) window[callback]();
    }
}
/**
 * Writes the list of regions for the specified type - if they are not already present.
 *
 * The data is assumed to be present in regionsList. Should be called via showRegionsList to ensure this.
 * @param regionType
 */
function writeRegionsList(regionType) {
    var list = regionsList[regionType].names;
    var props = regionsList[regionType].objects;

    var $content = $('#' + regionType);
    if ($content.find('ul').length == 0) {
        var html = "<ul>";
        $.each(list, function(i, name) {
            var id = regionType == 'other' ? props[name].layerName : props[name].pid;
            html += "<li class='regionLink' id='" + id + "'>" + name + "</li>";
        });
        html += "</ul>";
        $content.find('span.loading').remove();
        $content.append(html);
    }
}

function highlightInList(regionName) {
    // find the currently open pane
    var $pane = $('#' + getSelectedFilter());
    // highlight the specified region
    var $selected = $pane.find('li:contains("' + regionName + '")');
    $selected.addClass('selected');
    // scroll to it
    /*$pane.animate({
        scrollTop: $selected.offset().top
    }, 2000);*/
}

function clearHighlights() {
    $('li.regionLink').removeClass('selected');
}

/************************************************************\
*   Change display to the specified region type
\************************************************************/
function selectRegionType(type, callback) {

    selectedRegionType = type;

    // clear any selected regions
    clearSelectedRegion();

    // show the selected layer
    if (isOther()) {
        // there is no default layer to display in the 'other regions' group
        removeLayer();
    } else {
        drawLayer(type);
    }

    // add content to the region type pane if empty
    showRegionsList(type, callback);

    // store last selected region type in hash params
    $.bbq.pushState({'region_type':type});

}

function getSelectedFilter() {
    return $('div.ui-accordion-content-active').attr('id') ? $('div.ui-accordion-content-active').attr('id') : 'states';
}

function getSelectedLayer() {
    return layers[selectedRegionType];
}

function disableRegionsSlider() {
    $('#toggleRegion').attr('disabled', true);
    $('#regionOpacity').slider('option', 'disabled', true);
}

function enableRegionsSlider() {
    $('#toggleRegion').attr('disabled', false);
    $('#regionOpacity').slider('option', 'disabled', false);
}

function hideInfo() {
    $('#click-info').html("Click on the map to select an area.");
}

function showInfo(text) {
    $('#click-info').html(text);
}

function removeLayer() {
    map.overlayMapTypes.setAt(0, null);
}

function removeRegion() {
    map.overlayMapTypes.setAt(1, null);
}

/**
 * Draws a region on the map.
 *
 * @param regionName optional, default is the currently selected region
 * @param pid optional, passed if known else looked up
 */
function displayRegion(regionName, pid) {

    var layer = getSelectedLayer();

    // this wizardry allows us to use the current region where the method is called from a handler
    // or to specify a region for the special case of displaying a selected part of an 'other' layer.
    var name = regionName == undefined ? selectedRegion : regionName;

    if (pid == undefined) {
        pid = isOther() ? selectedSubregionPid : regionsList[layer.layer].objects[name].pid
    }
    var params = [
        "FORMAT=image/png8",
        "LAYERS=ALA:Objects",
        "viewparams=s:" + pid,
        "STYLES=polygon"
    ];
    var ov = new WMSTileLayer(name, spatialWmsUrl, params, wmsTileLoaded, getRegionOpacity());
    map.overlayMapTypes.setAt(1, ov);
}

function initHelp() {
    $('#showHelp').click(function() {
        var height = $('#mainHelp').css('height');
        $('#mainHelp').animate({height: height == '0px' ? 280 : 0}, 'slow');
        $('#showHelp').html(height == '0px' ? "Hide help" : "Show me how");
        return false;
    });
}

function setDefaultRegion() {
    if (initialRegion) {
        if (isOther()) {setOtherRegion(initialRegion)} else {setSelectedRegion(initialRegion)}
    }
}

function init(serverUrl) {
    baseUrl = serverUrl;

    selectedRegionType = $.bbq.getState('region_type') ? $.bbq.getState('region_type') : 'states';
    initialRegion = $.bbq.getState('region');

    // set up accordion and handle changes
    $('#accordion').accordion({
        fillSpace: true,
        change: function(event, ui) {
            selectRegionType($(ui.newContent).attr('id'));
        },
        active: layers[selectedRegionType].accordionOrder
    });

    // handle region clicks
    $('li.regionLink').live('click', function(event) {
        if (isOther()) {
            setOtherRegion($(this).html());
        }
        else {
            // normal types display the selected region
            setSelectedRegion($(this).html(), $(this).attr('id'));
        }
    });

    // handle map reset
    $('#reset-map').click(function() {
        map.fitBounds(initialBounds);
    });

    // handle zoom to
    $('#zoomTo').live('click', function() {
        // get the region
        var region = $(this).prev().html();
        // lookup the bbox from the regions cache
        var objects = regionsList[selectedRegionType].objects;
        var bbox = objects[region].bbox;
        if (bbox != undefined) {
            var bounds = new google.maps.LatLngBounds(
                    new google.maps.LatLng(bbox.minLat, bbox.minLng),
                    new google.maps.LatLng(bbox.maxLat, bbox.maxLng));
            map.fitBounds(bounds);
        }
    });

    /*****************************************\
    | Handle layer toggles
    \*****************************************/
    $('#toggleLayer').change(function() {
        if ($(this).is(':checked')) {
            drawLayer(selectedRegionType);
        }
        else {
            removeLayer();
        }
    });
    $('#toggleRegion').change(function() {
        if ($(this).is(':checked')) {
            displayRegion();
        }
        else {
            removeRegion();
        }
    });

    initMap();

    selectRegionType(selectedRegionType, "setDefaultRegion");

    /*****************************************\
    | Set up opacity sliders
    \*****************************************/
    $('#layerOpacity').slider({
        min: 0,
        max: 100,
        value: defaultOccurrenceOpacity * 100,
        change: function(event, ui) {
            drawLayer(selectedRegionType);
        }
    });
    $('#regionOpacity').slider({
        min: 0,
        max: 100,
        disabled: true,
        value: defaultRegionOpacity * 100,
        change: function(event, ui) {
            displayRegion();
        }
    });

    initHelp();

}
