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
/*
 Javascript to support the top level regions page.

 The page has a map and an accordion widget that groups regions by their type. Regions can be selected on the map
 or from the widget list.

 The 2 main 'classes' represent region types and regions.

 Region types (RegionSet class) are groups of regions such as states or ibras. A bucket for other regions holds
 miscellaneous regions or sets of regions such as GER.

 Regions (Region class) are usually a specific object in a layer (or field) such as Victoria but, in the case of
 regions in the 'other' bucket, may be layers themselves some of which may contain multiple objects. (This creates
 some contention between the UI with 2 clear levels and the data model with effectively 3 levels.)

 */
(function (windows) {
    "use strict";

var
    // represents the map and its associated properties and events
    map,
    
    //  Urls are injected from config
    config = {},

    // the currently selected region type - an instance of RegionSet
    selectedRegionType,

    // restrict accordion regions to those which intersect bounds (optional)
    mapBounds,

    // the currently selected region - will be null if no region is selected else an instance of Region
    selectedRegion = null;

// helper method
function clearSelectedRegion() {
    if (selectedRegion) { selectedRegion.clear(); }
}

/**
 * Returns the value of the opacity slider for the region overlay.
 */
function getRegionOpacity () {
    var opacity = $('#regionOpacity').slider("value");
    return isNaN(opacity) ? map.defaultRegionOpacity : opacity / 100;
}

/**
 * Returns the value of the opacity slider for the region overlay.
 */
function getLayerOpacity () {
    var opacity = $('#layerOpacity').slider("value");
    return isNaN(opacity) ? map.defaultLayerOpacity : opacity / 100;
}

/**
 * Disables the toggle and opacity slider for the regions overlay.
 */
function disableRegionsSlider () {
    $('#toggleRegion').attr('disabled', true);
    $('#regionOpacity').slider('option', 'disabled', true);
}

/**
 * Enables the toggle and opacity slider for the regions overlay.
 */
function enableRegionsSlider () {
    $('#toggleRegion').attr('disabled', false);
    $('#regionOpacity').slider('option', 'disabled', false);
}

/**
 * Clears all highlighted names in all region lists.
 */
function clearHighlights() {
    $('li.regionLink').removeClass('selected');
}

/**
 * Removes region-specific info from the map title. Replaces with generic text.
 */
function hideInfo() {
    $('#click-info').html("Click on the map to select an area.");
}

/**
 * Sets the specified text to the map title.
 * @param text
 */
function showInfo(text) {
    $('#click-info').html(text);
}

/*** RegionSet represents a set of regions such as all states ********************************************************/
// assumes this is a single field of a single layer
var RegionSet = function (name, layerName, fid, bieContext, order, displayName) {
    this.name = name;
    this.layerName = layerName;
    this.fid = fid;
    this.bieContext = bieContext;
    this.order = order;
    this.displayName = displayName;
    this.objects = {};
    this.sortedList = [];
    this.error = null;
    this.other = fid == null;
};
RegionSet.prototype = {
    /* Set this instance as the selected set */
    set: function (callbacks) {
        var prevSelection = selectedRegion
        selectedRegionType = this;

        // clear any selected region
        clearSelectedRegion();

        // show the selected layer
        if (this.other) {
            // there is no default layer to display in the 'other regions' group
            map.removeLayerOverlay();
        } else {
            this.drawLayer();
        }

        // add content to the region type pane if empty
        this.writeList(callbacks);

        // store last selected region type in hash params
        if (this.name == 'states') {
            if ($.bbq.getState('rt') != undefined) {
                $.bbq.removeState('rt');
            }
        } else {
            $.bbq.pushState({'rt': this.name});
        }
    },
    /* Return the number of regions in the set */
    size: function () {
        return this.sortedList.length;
    },
    /* Return the field id for this set (or the selected sub-set of 'other') */
    getFid: function () {
        return this.other ? (selectedRegion ? selectedRegion.id : '') : this.fid;
    },
    /* Return the pid for the specified object in this set (or for the subregion of a sub-set)
     * @param name of the object */
    getPid: function (name) {
        return this.other ? selectedRegion.subregionPid :
              (this.objects[name] ? this.objects[name].pid : null);
    },
    /* Return metadata for the region in this set with the specified name
     * @param name of the region */
    getRegion: function (name) {
        return this.objects[name.replace( '&amp;', '&' )];
    },
    /* Is the content loaded? */
    loaded: function () {
        return this.size() > 0;
    },
    /* Load the content asynchronously
     * @param callbackOnSuccess optional callback on complete
     * @param optional param for callback */
    load: function (callbackOnSuccess, callbackParam) {
        $.ajax({
            url: config.baseUrl + "/regions/regionList?type=" + this.name,
            dataType: 'json',
            context: this,
            success: function (data) {
                // check for errors
                if (data.error === true) {
                    this.error = data.errorMessage;
                    $('#' + this.name).html(this.error);
                } else {
                    // optionally filter regions (lats are -ve in AUS)
                    if (mapBounds) {
                        var i, name, obj, bbox, names = [], objs = {};
                        for (i = 0; i < data.names.length; i++) {
                            obj = data.objects[name = data.names[i]];
                            bbox = obj.bbox;
                            if (!bbox) continue;
                            if (bbox.minLat > mapBounds[0]) continue; // too north
                            if (bbox.maxLng < mapBounds[1]) continue; // too west
                            if (bbox.maxLat < mapBounds[2]) continue; // too south
                            if (bbox.minLng > mapBounds[3]) continue; // too east
                            names.push(name);
                            objs[name] = obj;
                        }
                        data.names = names;
                        data.objects = objs;
                    }
                    // add to cache
                    this.objects = data.objects;
                    this.sortedList = data.names;
                    this[callbackOnSuccess](callbackParam);
                }
            },
            error: function (jqXHR, textStatus) {
                this.error = textStatus;
                $('#' + this.name).html(this.error);
            }
        });
    },
    /* Write the list of regions to the regionSet's DOM container - loading first if required
     * @param callbackOnComplete a global-scope function to call when the list is written */
    writeList: function (callbackOnComplete) {
        var $content = $('#' + layers[this.name].layerName), html = "<ul>", me = this,
            id;
        if (!this.loaded()) {
            // load content asynchronously and execute this method when complete
            this.load('writeList', callbackOnComplete);
            return;
        }
        if ($content.find('ul').length === 0) {
            $.each(this.sortedList, function (i, name) {
                id = me.other ? me.objects[name].layerName : me.objects[name].id;
                html += "<li class='regionLink' id='" + id + "'>" + name + "</li>";
            });
            html += "</ul>";
            $content.find('span.loading').remove();
            $content.append(html);
        }
        if (callbackOnComplete) {
            // assume global scope
            callbackOnComplete();// TODO: fix this - pass in function itself?
        }
    },
    /* Draw the layer for this set (or sub-set) */
    drawLayer: function () {
        var redraw = false,
            layerParams;
        if (this.other) {
            this.drawOtherLayers();
        }
        else {
            if (this.wms === undefined) {
                redraw = true;
            }
            else {
                redraw = (this.wms.opacity !== getLayerOpacity());
            }
            if (redraw) {
                layerParams = [
                    "FORMAT=image/png8",
                    "LAYERS=ALA:" + this.layerName,
                    "STYLES=polygon"
                ];
                this.wms = new WMSTileLayer(
                        this.layerName, config.spatialCacheUrl, layerParams, map.wmsTileLoaded, getLayerOpacity());
            }
            map.setLayerOverlay(this.wms);
        }
    },
    /* Draw the currently selected 'other' region as a layer */
    drawOtherLayers: function () {
        if (selectedRegion === null) { return; }
        var layerName = this.objects[selectedRegion.name].layerName,
            layerParams = [
                "FORMAT=image/png8",
                "LAYERS=ALA:" + layerName,
                "STYLES=polygon"
            ],
            wms = new WMSTileLayer(layerName, config.spatialCacheUrl, layerParams, map.wmsTileLoaded,
                    getLayerOpacity());
        if ($('#toggleLayer').is(':checked')) {
            map.setLayerOverlay(wms);
        }
    },
    /* Highlight the specified region name in the list of regions for this set
     * @param regionName the name to highlight */
    highlightInList: function (regionName) {
        // highlight the specified region
        var $selected = $('#' + this.name + ' li').filter(function (index) {
            return $(this).html() === regionName;
        });
        $selected.addClass('selected');
        // scroll to it
        /*$pane.animate({
            scrollTop: $selected.offset().top
        }, 2000);*/
    }
};

/* Create the regions sets to be displayed */
var layers = {};

// (name, layerName, fid, bieContext, order, displayName)
function createRegionTypes() {
    if (REGIONS == undefined) { REGIONS = {}}
    for (var rtype in REGIONS.metadata) {
        if (REGIONS.metadata.hasOwnProperty(rtype)) {
            var md = REGIONS.metadata[rtype];
            layers[rtype] = new RegionSet(md.name, md.layerName, md.fid, md.bieContext, md.order, "");
        }
    }
}

/*** Region represents a single region *******************************************************************************\
 * May be an object in a field, eg an individual state, OR
 * a region in 'Other regions' which is really a layer/field with 1 or more sub-regions
 */
var Region = function (name) {
    // the name of the region
    this.name = name;
    // the id - this may be a pid if it's an object in a field or a fid if it's an 'other' region
    this.id = null;
    // this represents the state of the selectedRegionType when the region is created
    this.other = selectedRegionType.other;
    // the selected 'sub-region' of an 'other' layer - will be null if no sub-region is selected
    this.subregion = null;
    // the pid of a selected 'sub-region'
    this.subregionPid = null;
};
Region.prototype = {
    /* Set this instance as the currently selected region */
    set: function () {
        clearSelectedRegion();
        var prevSelection = selectedRegion
        selectedRegion = this;
        if (this.name.toLowerCase() !== 'n/a') {
            $.bbq.pushState({region: this.name});
            selectedRegionType.highlightInList(this.name);
        }
        this.setLinks();
        if (this.other) {
            this.id = layers[selectedRegionType.name].objects[this.name].fid;
            // other regions draw as a full layer
            layers[selectedRegionType.name].drawLayer();
        }
        else {
            this.id = selectedRegionType.getPid(this.name);
            if ($('#toggleRegion').is(':checked')) {
                this.displayRegion();
            }
            enableRegionsSlider();
        }
    },
    /* Deselect this instance and remove its screen artifacts */
    clear: function () {
        map.removeRegionOverlay();
        clearHighlights();
        disableRegionsSlider();
        selectedRegion = null;
        if (!this.other) {
            $.bbq.removeState('region');
            hideInfo();
        }
    },
    /* Set the selected sub-region for this region
     * @param region the name of the subregion
     * @param pid the pid of the subregion */
    // this has meaning when the region is a layer/field in the 'other' set and an object within that
    // layer has been selected.
    setSubregion: function (region, pid) {
        this.subregion = region;
        this.subregionPid = pid;
        this.displayRegion();
        this.setLinks(region);
        enableRegionsSlider();
    },
    /* Deselect the selected subregion for this region */
    clearSubregion: function () {
        map.removeRegionOverlay();
        disableRegionsSlider();
        $('#extra').html("");
    },
    /* Draw this region on the map */
    displayRegion: function () {
        var params = [
            "FORMAT=image/png8",
            "LAYERS=ALA:Objects",
            "viewparams=s:" + (this.other ? this.subregionPid : this.id),
            "STYLES=polygon"
        ],
        ov = new WMSTileLayer('regionLayer', config.spatialWmsUrl, params, map.wmsTileLoaded, getRegionOpacity());
        map.setRegionOverlay(ov);
    },
    /* Build the url to view the current region */
    urlToViewRegion: function () {
        return config.baseUrl + "/" + encodeURI(selectedRegionType.name) + "/" + encodeURIComponent(he.encode(encodeURIComponent(this.name))).replace("%3B", "%253B");
    },
    /* Write the region link and optional subregion name and zoom link at the top of the map.
     * @param subregion the name of the subregion */
    setLinks: function (subregion) {
        var extra = "";
        if (this.name.toLowerCase() === 'n/a') {
            showInfo("N/A");
        } else {
            if (this.other) {
                if (subregion) {
                    extra = "<span class='btn' id='extra'>(" + subregion + ")</span>";
                }
                showInfo("<a class='btn btn-ala' href='" + this.urlToViewRegion() + "' title='Go to " + this.name + "'>" +
                        this.name + "</a>" + "<span id='zoomTo' class='btn'><i class='fa fa-search-plus'></i> Zoom to region</span>" + extra);
            } else {
                showInfo("<a class='btn btn-ala' href='" + this.urlToViewRegion() + "' title='Go to " + this.name + "'>" +
                        this.name + "</a>" + "<span id='zoomTo' class='btn'><i class='fa fa-search-plus'></i> Zoom to region</span>");
            }
        }
    }
};


/*** map represents the map and its associated properties and events ************************************************/
map = {
    // the google map object
    gmap: null,
    // the DOM contain to draw the map in
    containerId: "some_default",
    // default opacity for the overlay showing the selected region
    defaultRegionOpacity: 0.8,
    // default opacity for the overlay showing the selected layer
    defaultLayerOpacity: 0.55,
    // the default bounds for the map
    initialBounds: new google.maps.LatLngBounds(
            new google.maps.LatLng(-41.5, 114),
            new google.maps.LatLng(-13.5, 154)),
    clickedRegion: "",
    init: function () {
        var options = {
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
            disableDoubleClickZoom: true,
            draggableCursor: 'pointer',
            mapTypeId: google.maps.MapTypeId.TERRAIN
        };

        this.gmap = new google.maps.Map(document.getElementById(this.containerId), options);
        this.gmap.fitBounds(this.initialBounds);
        this.gmap.enableKeyDragZoom();

        google.maps.event.addListener(this.gmap, 'click', this.clickHandler);
    },
    /* Set the layer overlay */
    setLayerOverlay: function (wms) {
        this.gmap.overlayMapTypes.setAt(0, wms);
    },
    /* Clear the layer overlay */
    removeLayerOverlay: function () {
        this.gmap.overlayMapTypes.setAt(0, null);
    },
    /* Set the region overlay */
    setRegionOverlay: function (wms) {
        this.gmap.overlayMapTypes.setAt(1, wms);
        this.clickedRegion = null;
    },
    /* Clear the region overlay */
    removeRegionOverlay: function () {
        this.gmap.overlayMapTypes.setAt(1, null);
    },
    /* Reset the map to the default bounds */
    resetViewport: function () {
        this.gmap.fitBounds(this.initialBounds);
    },
    /* Zoom to the bbox of the specified region */
    zoomToRegion: function (regionName) {
        // lookup the bbox from the regions cache
        var bbox = selectedRegionType.getRegion(regionName).bbox;
        if (bbox !== undefined) {
             this.gmap.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(bbox.minLat, bbox.minLng),
                    new google.maps.LatLng(bbox.maxLat, bbox.maxLng)));
        }
    },
    /* Handle user clicks on the map */
    clickHandler: function (event) {
        var location = event.latLng,
            fid = selectedRegionType.getFid(),
            features = [],
            that = this;
        this.clickedRegion = null;
        $.ajax({
            url: config.baseUrl + "/proxy?format=json&url=" + config.spatialServiceUrl + "/intersect/" + fid + "/" +
                    location.lat() + "/" + location.lng(),
            dataType: 'json',
            success: function (data) {
                if (data.length === 0) {
                    return;
                }

                // find out how many features have real data
                $.each(data, function (i, obj) {
                    if (obj.value) {
                        features.push(obj);
                    }
                });

                switch (features.length) {
                    case 0:
                        if (selectedRegion && selectedRegion.other) {
                            selectedRegion.clearSubregion();
                        }
                        else {
                            clearSelectedRegion();
                        }
                        break;
                    default:  // treat one or many as just one for now
                        if (selectedRegion && selectedRegion.other) {
                            selectedRegion.setSubregion(features[0].value, features[0].pid);
                        }
                        else {
                            that.clickedRegion = features[0].value;
                            var name = features[0].value;
                            if (selectedRegion !== null && name === selectedRegion.name &&
                                    name.toLowerCase() !== 'n/a') {
                                document.location.href = selectedRegion.urlToViewRegion();
                            }
                            var region = new Region(name).set();
                        }
                }
            }
        });
    },
    /**
     * Called when the overlays are loaded. Currently does nothing.
     * @param numtiles
     */
    wmsTileLoaded: function () {
        //$('#maploading').fadeOut("slow");
    }

};

/*function delayNewRegion(region) {
    new Region(region).set();
}*/

/**
 * Activates the help link.
 */
function initHelp() {
    $('#showHelp').click(function () {
        var height = $('#mainHelp').css('height');
        $('#mainHelp').animate({height: height === '0px' ? 280 : 0}, 'slow');
        $('#showHelp').html(height === '0px' ? "Hide help" : "Show me how");
        return false;
    });
}

/**
 * A callback function to set the initial region once the data and lists are loaded.
 */
function setDefaultRegion () {
    if (Region.initialRegion) {
        new Region(Region.initialRegion).set();
    }
}

/**
 * Initialises everything including the map.
 *
 * @param options object specifier with the following members:
 * - server: url of the server the app is running on
 * - spatialService:
 * - spatialWms:
 * - spatialCache:
 * - mapContainer: id of the html element to hold the map
 */
function init (options) {
    var initialRegionTypeStr;

    config.baseUrl = options.server;
    config.spatialServiceUrl = options.spatialService;
    config.spatialWmsUrl = options.spatialWms;
    config.spatialCacheUrl = options.spatialCache;

    /*****************************************\
    | Create the region types from metadata
    \*****************************************/
    if (options.mapBounds && options.mapBounds.length == 4)
        mapBounds = options.mapBounds;
    createRegionTypes();

    /*****************************************\
    | Set state from hash params
    \*****************************************/
    initialRegionTypeStr = $.bbq.getState('rt') || Object.keys(layers)[0];
    selectedRegionType = layers[initialRegionTypeStr];
    Region.initialRegion = $.bbq.getState('region');

    /*****************************************\
    | Set up accordion and handle changes
    \*****************************************/
    $('#accordion').accordion({
        activate: function (event, ui) {
            layers[$(ui.newPanel).attr('layer')].set();
        },
        active: selectedRegionType.order
    });
    if (options.accordionPanelMaxHeight)
        $('#accordion .ui-accordion-content').css('max-height', options.accordionPanelMaxHeight);

    /*****************************************\
     | Set up opacity sliders
     \*****************************************/
    $('#layerOpacity').slider({
        min: 0,
        max: 100,
        value: map.defaultLayerOpacity * 100,
        change: function () {
            selectedRegionType.drawLayer();
        }
    });
    $('#regionOpacity').slider({
        min: 0,
        max: 100,
        disabled: true,
        value: map.defaultRegionOpacity * 100,
        change: function () {
            selectedRegion.displayRegion();
        }
    });

    /*****************************************\
    | Handle region clicks
    \*****************************************/
    $('li.regionLink').live('click', function () {
        var name = $(this).html();
        if (selectedRegion !== null && name === selectedRegion.name) {
            document.location.href = selectedRegion.urlToViewRegion();
        }
        new Region(name).set();
    });

    /*****************************************\
    | Handle layer toggles
    \*****************************************/
    $('#toggleLayer').change(function () {
        if ($(this).is(':checked')) {
            selectedRegionType.drawLayer();
        }
        else {
            map.removeLayerOverlay();
        }
    });
    $('#toggleRegion').change(function () {
        if ($(this).is(':checked')) {
            selectedRegion.displayRegion();
        }
        else {
            map.removeRegionOverlay();
        }
    });

    /*****************************************\
    | Create map
    \*****************************************/
    map.containerId = options.mapContainer;
    if (options.mapHeight)
        $('#'+map.containerId).height(options.mapHeight);
    if (options.mapBounds && options.mapBounds.length == 4)
        map.initialBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(options.mapBounds[0], options.mapBounds[1]),
            new google.maps.LatLng(options.mapBounds[2], options.mapBounds[3]));
    map.init();

    /*****************************************\
    | Handle map reset
    \*****************************************/
    $('#reset-map').click(function () {
        map.resetViewport();
    });

    /*****************************************\
    | Handle zoom to region
    \*****************************************/
    $('#zoomTo').live('click', function () {
        var name = $(this).prev().html();
        map.zoomToRegion(name);
    });

    /*****************************************\
    | Set the region type
    \*****************************************/
    // also sets the region from the hash params once the region type data has been retrieved
    selectedRegionType.set(setDefaultRegion);



    /*****************************************\
    | Activate the help link
    \*****************************************/
    //initHelp();

}

    windows.init_regions = init;
}(this));

