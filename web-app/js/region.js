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

var region = {
    /**
     * Builds the query as a map that can be passed directly as data in an ajax call
     * @param regionType
     * @param regionName
     * @param regionFid
     * @param start [optional] start parameter for paging results
     * @param useTime
     * @returns {{q: *, pageSize: number}}
     */
    buildBiocacheQuery: function(regionType, regionName, regionFid, start, useTime) {
        var params = {q:region.buildRegionFacet(regionType, regionName, regionFid), pageSize: 50},
            timeFacet = region.buildTimeFacet();
        if (start) {
            params.start = start
        }

        if (timeFacet) {
            params.fq = timeFacet;
        }
        return params;
    },

    /**
     * Builds the query phrase for a range of dates - returns nothing for the default date range.
     */
    buildTimeFacet: function () {
        return "";
        // TODO
    },

    queryString: function () {
        if (!this.isInit()) { return "" }
        var fromPhrase = this.from() === this.defaultFrom ? '*' : this.from() + "-01-01T00:00:00Z",
            toPhrase = this.to() === this.defaultTo ? "*" : (this.to() - 1) + "-12-31T23:59:59Z";
        return "occurrence_year:[" + fromPhrase + " TO " + toPhrase + "]";
    },

    /**
     * Builds the query phrase for a region based on its type and name.
     */
    buildRegionFacet: function(regionType, regionName, regionFid) {
        if (regionType == 'layer') {
            return regionFid + ":[* TO *]";
        }
        else {
            return regionFid + ':"' + regionName + '"';
        }
    }
};

var RegionWidget = function (config) {

    var defaultFromYear = 1850;
    var defaultToYear = new Date().getFullYear();
    var defaultTab = 'speciesTab';
    var regionMap;

    /**
     * Essential values to maintain the state of the widget when the user interacts with it
     * @type {{regionName: null, regionType: null, regionFid: null, regionPid: null, regionLayerName: null, playState: null, group: null, subgroup: null, guid: null, from: null, to: null, tab: null}}
     */
    var state = {
        regionName: '',
        regionType: '',
        regionFid: '',
        regionPid: '',
        regionLayerName: '',
        playState: '',
        group: '',
        subgroup: '',
        guid: '',
        from: '',
        to: '',
        tab: ''
    };

    var urls = {};

    /**
     * Constructor
     * @param config
     */
    var init =  function(config) {
        state.regionName = config.regionName;
        state.regionType = config.regionType;
        state.regionFid = config.regionFid;
        state.regionPid = config.regionPid;
        state.regionLayerName = config.regionLayerName;
        // We check if there if previous state has been preserved to be loaded
        state.group = state.group ? state.group : 'ALL_SPECIES';
        state.from = state.from ? state.from : defaultFromYear;
        state.to = state.to ? state.to : defaultToYear;
        state.tab = state.tab ? state.tab : defaultTab;

        urls = config.urls;

        $(document).ajaxStart(
            function (e) {
                showTabSpinner();
            }).ajaxComplete(function () {
                hideTabSpinner();
            });

        $(document).on('click', "#species tbody tr.link", function() {
            selectSpecies(this);

        });
    };

    /**
     * Updates state with new values and preserve state for when reloading page
     * @param newPartialState
     */
    var updateState = function(newPartialState) {
        $.extend(state, newPartialState);
        //TODO persist current state

    };

    /**
     * Function called when the user selects a species
     * @param row
     */
    var selectSpecies = function(row) {
        $("#species tbody tr.link").removeClass('speciesSelected')
        $("#species tbody tr.infoRowLinks").hide();
        var nextTr = $(row).next('tr');
        $(row).addClass('speciesSelected');
        $(nextTr).addClass('speciesSelected');
        $(row).next('tr').show();
        // Update state
        updateState({guid: $(row).attr('id')});
        regionMap.reloadRecordsOnMap();
    };

    /**
     * Hides the tab spinners
     * @param tabId
     */
    var hideTabSpinner = function (tabId) {
        if ($.active == 1) {
            if (tabId) {
                $('#' + tabId + ' i').addClass('hidden');
            } else {
                $('#' + state.tab + ' i').addClass('hidden');
            }
        }
    };

    /**
     * Shows the tab spinners
     * @param tabId
     */
    var showTabSpinner = function (tabId) {
        if (tabId) {
            $('#' + tabId + ' i').removeClass('hidden');
        } else {
            $('#' + state.tab + ' i').removeClass('hidden');
        }
    };

    /**
     *
     */
    var selectGroup = function(group) {

        $('.group-row').removeClass('groupSelected');
        $("tr[parent]").hide();
        if (group != state.group) {
            $('#' + state.group + '-row i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        }
        var groupId = group.replace(/[^A-Za-z0-9\\d_]/g, "") + '-row';

        var isAlreadyExpanded = $('#' + groupId + ' i').hasClass('fa-chevron-down');
        if (isAlreadyExpanded) {
            $("tr[parent='" + groupId + "']").hide();
            $('#' + groupId + ' i').removeClass('fa-chevron-down').addClass('fa-chevron-right');
        } else {
            $("tr[parent='" + groupId + "']").show();
            $('#' + groupId + ' i').removeClass('fa-chevron-right').addClass('fa-chevron-down');
        }

        // Update widget state
        updateState({group: group, subgroup:'', guid: ''});
        // Mark as selected
        $('#' + groupId).addClass('groupSelected');

        // Last
        if (regionMap) {
            regionMap.reloadRecordsOnMap();
        }
        AjaxAnywhere.dynamicParams=state;
    };

    var selectSubgroup = function(subgroup) {
        $('.group-row').removeClass('groupSelected');
        var subgroupId = subgroup.replace(/[^A-Za-z\\d_]/g, "") + '-row';

        //    var parent = $('#' + $('#' + subgroupId).attr('parent'));
        //    if (!$(parent).is(":visible")) {
        //        //TODO
        //    }

        // Update widget state
        updateState({subgroup: subgroup, guid: ''});
        // Mark as selected
        $('#' + subgroupId).addClass('groupSelected');

        // Last
        if (regionMap) {
            regionMap.reloadRecordsOnMap();
        }
        AjaxAnywhere.dynamicParams=state;
    }

    var _public = {

        getDefaultFromYear: function() {
            return defaultFromYear;
        },

        getDefaultToYear: function() {
            return defaultToYear;
        },

        getUrls: function() {
            return urls;
        },

        getCurrentState: function() {
            return state;
        },

        groupsLoaded: function() {
            $('#groups').effect('highlight', 2000);
            selectGroup(state.group);
            this.loadSpecies();
        },

        selectGroupHandler: function(group, isSubgroup) {
            if (isSubgroup) {
                selectSubgroup(group);
            } else {
                selectGroup(group);
            }
        },

        loadSpecies: function() {
            $('#' + state.group + '-row').click();
        },

        speciesLoaded: function() {
            $('#species').effect('highlight', 2000);
        },

        showMoreSpecies: function() {
            $('#showMoreSpeciesButton').html("<i class='fa fa-cog fa-spin'></i>");
            AjaxAnywhere.dynamicParams=this.getCurrentState();
        },

        setMap: function(map) {
            regionMap = map;
        }
    };

    init(config);
    return _public;
};

//RegionWidget.prototype.

/**
 *
 * @param config
 * @returns
 * @constructor
 */
var RegionMap = function (config) {

    var layers = {
        states: {layer: 'states', name: 'aus1', displayName: 'name_1', bieContext: 'aus_states'},
        lgas: {layer: 'lgas', name: 'lga_aust', displayName: 'name_2', bieContext: 'gadm_admin'},
        ibras: {layer: 'ibras', name: 'ibra_merged', displayName: 'reg_name', bieContext: 'ibra_no_states'},
        imcras: {layer: 'imcras', name: 'imcra4_pb', displayName: 'pb_name', bieContext: 'imcra'},
        nrms: {layer: 'nrms', name: 'nrm_regions_2010', displayName: 'nrm_region', bieContext: 'nrm'}
        /*hunter: {layer: 'hunter', name: 'ger_hunter', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
         k2c: {layer: 'k2c', name: 'ger_kosciuszko_to_coast', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
         border: {layer: 'border_ranges', name: 'ger_border_ranges', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
         slopes: {layer: 'slopes_to_summit', name: 'ger_slopes_to_summit', displayName: 'ala_id', fid: 'gid', bieContext: 'ger'},
         ger: {layer: 'ger', name: 'ger_geri_boundary_v102_australia', displayName: 'ala_id', bieContext: 'ger'}*/
    };
    var map, marker;
    var points = [];
    var overlays = [null,null];  // first is the region, second is the occurrence data
    var defaultOccurrenceOpacity = 0.7;
    var defaultRegionOpacity = 0.5;
    var initialBounds;
    var infoWindow;
    var useReflectService = true;
    var overlayFormat = "image/png";


    var init = function (config) {
        initialBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(config.bbox.sw.lat, config.bbox.sw.lng),
            new google.maps.LatLng(config.bbox.ne.lat, config.bbox.ne.lng));

        useReflectService = config.useReflectService;

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
            draggableCursor: 'crosshair',
            mapTypeId: google.maps.MapTypeId.TERRAIN  /*google.maps.MapTypeId.TERRAIN*/
        };

        map = new google.maps.Map(document.getElementById("region-map"), myOptions);
        map.fitBounds(initialBounds);
        map.enableKeyDragZoom();

        /*****************************************\
         | Set up opacity sliders
         \*****************************************/
        $('#occurrencesOpacity').slider({
            min: 0,
            max: 100,
            value: defaultOccurrenceOpacity * 100,
            change: function (event, ui) {
                drawRecordsOverlay();
            }
        });
        $('#regionOpacity').slider({
            min: 0,
            max: 100,
            value: defaultRegionOpacity * 100,
            change: function (event, ui) {
                drawRegionOverlay();
            }
        });

        /*****************************************\
         | Overlay the region shape
         \*****************************************/
        drawRegionOverlay();

        /*****************************************\
         | Overlay the occurrence data
         \*****************************************/
        drawRecordsOverlay();

        // layer toggling
        $("#toggleOccurrences").click(function () {
            toggleOverlay(1, this.checked);
        });
        $("#toggleRegion").click(function () {
            toggleOverlay(0, this.checked);
        });

        // map controls toggling
        var $controlsToggle = $('#controls-toggle');
        $controlsToggle.click(function () {
            $controlsToggle.toggle();
            $('#controls').toggle('slideDown');
        });
        $('#hide-controls').click(function () {
            $('#controls').toggle('slideDown', function () {
                $controlsToggle.toggle();
            });
        });

        google.maps.event.addListener(map, 'click', function (event) {
            info(event.latLng);
        });



        /*******************************************************\
         | Hack the viewport if we don't have good bbox data
         \*******************************************************/
        // fall-back attempt at bounding box if all of Oz
//        if (initialBounds.equals(new google.maps.LatLngBounds(
//                new google.maps.LatLng(-42, 113),
//                new google.maps.LatLng(-14, 153)))) {
//            // try the bounds of the occurrence records (TEMP: until we get proper bbox's)
//            //var url = urlConcat(config.biocacheServiceUrl, "webportal/bounds?q=") + buildRegionFacet(regionType, regionName);
//            //var url = urlConcat(config.biocacheServiceUrl, 'webportal/bounds?q="Alinytjara%20Wilurara"');
//            $.ajax({
//                url: baseUrl + "/proxy/bbox?q=" + buildRegionFacet(regionType, regionName),
//                //url: url,
//                dataType: 'json',
//                success: function(data) {
//                    if (data[0] != 0.0) {
//                        initialBounds = new google.maps.LatLngBounds(
//                            new google.maps.LatLng(data[1], data[0]),
//                            new google.maps.LatLng(data[3], data[2]));
//                        map.fitBounds(initialBounds);
//                        $('#using-bbox-hack').html("Using occurrence bounds")
////                    $('#bbox').html("Using bbox " + newBbox.toString());
//                    }
//                }
//            });
//        }
    }

   /**
    * Called when the overlays are loaded. Not currently used
    * @param numtiles
    */
    var wmsTileLoaded = function(numtiles) {
        $('#maploading').fadeOut("slow");
    };

    /**
    * Returns the value of the opacity slider for the region overlay.
    */
    var getRegionOpacity = function() {
        var opacity = $('#regionOpacity').slider("value");
        return isNaN(opacity) ? defaultRegionOpacity : opacity / 100;
    };

    /**
     * Returns the value of the opacity slider for the occurrence overlay.
     */
    var getOccurrenceOpacity = function() {
        var opacity = $('#occurrencesOpacity').slider("value");
        return isNaN(opacity) ? defaultOccurrenceOpacity : opacity / 100;
    };

    /**
     * Load the region as a WMS overlay.
     */
    var drawRegionOverlay = function () {

        var currentState = regionWidget.getCurrentState();
        var urls = regionWidget.getUrls();

        if (currentState.regionType == 'layer') {
            /* this draws the region as a WMS layer */
            var layerParams = [
                "FORMAT=" + overlayFormat,
                "LAYERS=ALA:" + currentState.regionLayerName,
                "STYLES=polygon"
            ];
            overlays[0] = new WMSTileLayer(currentState.regionLayerName, urls.spatialCacheUrl, layerParams, wmsTileLoaded, getRegionOpacity());
            map.overlayMapTypes.setAt(0, overlays[0]);

        } else {
            var params = [
                "FORMAT=" + overlayFormat,
                "LAYERS=ALA:Objects",
                "viewparams=s:" + currentState.regionPid,
                "STYLES=polygon"
            ];
            overlays[0] = new WMSTileLayer(currentState.regionLayerName, urls.spatialWmsUrl, params, wmsTileLoaded, getRegionOpacity());
            map.overlayMapTypes.setAt(0, overlays[0]);
        }
    };

    /**
     * Load occurrence data as a wms overlay based on the current selection:
     * - if taxa box is visible, show the selected species group or species
     * - if taxonomy chart is selected, show the current named rank
     * - use date restriction specified by the time slider
     */
    var drawRecordsOverlay = function () {

        var currentState = regionWidget.getCurrentState();
        var urls = regionWidget.getUrls();

        if (useReflectService) {
            drawRecordsOverlay2();
            return;
        }

        var customParams = [
            "FORMAT=" + overlayFormat,
            "colourby=3368652",
            "symsize=4"
        ];

        //Add query string params to custom params
        var query = region.buildBiocacheQuery(currentState.regionType, currentState.regionName, currentState.regionFid,0, true);
        var searchParam = encodeURI("?q=" + query.q + "&fq=" + query.fq + "&fq=geospatial_kosher:true");

        var fqParam = "";
        if ($("#taxonomyTab").hasClass('active')) {
            // show records based on taxonomy chart
            if (taxonomyChart.rank && taxonomyChart.name) {
                fqParam = "&fq=" + taxonomyChart.rank + ":" + taxonomyChart.name;
            }
        }
        else {
            // show records based on taxa box
            if (currentState.guid) {
                fqParam = "&fq=taxon_concept_lsid:" + currentState.guid;
            }
            else if (currentState.group != "ALL_SPECIES") {
                if (currentState.subgroup) {
                    fqParam = "&fq=species_subgroup:" + currentState.subgroup;
                } else {
                    fqParam = "&fq=species_group:" + currentState.group;
                }
            }
        }

        searchParam += fqParam;

        var pairs = searchParam.substring(1).split('&');
        for (var j = 0; j < pairs.length; j++) {
            customParams.push(pairs[j]);
        }
        overlays[1] = new WMSTileLayer("Occurrences",
            urlConcat(urls.biocacheServiceUrl, "occurrences/wms?"), customParams, wmsTileLoaded, getOccurrenceOpacity());

        map.overlayMapTypes.setAt(1, $('#toggleOccurrences').is(':checked') ? overlays[1] : null);
    };

    var drawRecordsOverlay2 = function() {
        var currentState = regionWidget.getCurrentState();
        var urls = regionWidget.getUrls();

        var url = urls.biocacheWebappUrl + "/ws/webportal/wms/reflect?",
            query = region.buildBiocacheQuery(currentState.regionType, currentState.regionName, currentState.regionFid,0, true);
        var prms = [
            "FORMAT=" + overlayFormat,
            "LAYERS=ALA%3Aoccurrences",
            "STYLES=",
            "BGCOLOR=0xFFFFFF",
            'q=' + encodeURI(query.q),
            "fq=geospatial_kosher:true",
            'CQL_FILTER=',
            "symsize=3",
            "ENV=color:3366CC;name:circle;size:3;opacity:" + getOccurrenceOpacity(),
            //"ENV=color:22a467;name:circle;size:4;opacity:0.8",
            "EXCEPTIONS=application-vnd.ogc.se_inimage"
        ];

        if (query.fq) {
            prms.push("&fq=" + query.fq);
        }

        var fqParam = "";
        if ($("#taxonomyTab").hasClass('active')) {
            // show records based on taxonomy chart
            if (taxonomyChart.rank && taxonomyChart.name) {
                fqParam = "fq=" + taxonomyChart.rank + ":" + taxonomyChart.name;
            }
        }
        else {
            // show records based on taxa box
            if (currentState.guid) {
                fqParam = "fq=taxon_concept_lsid:" + currentState.guid;
            }
            else if (currentState.group != "ALL_SPECIES") {
                if (currentState.subgroup) {
                    fqParam = "&fq=species_subgroup:" + currentState.subgroup;
                } else {
                    fqParam = "&fq=species_group:" + currentState.group;
                }
            }
        }

        if (fqParam != "") {
            prms.push(fqParam);
        }

        overlays[1] = new WMSTileLayer("Occurrences (by reflect service)", url, prms, wmsTileLoaded, 0.8);

        map.overlayMapTypes.setAt(1, $('#toggleOccurrences').is(':checked') ? overlays[1] : null);
    };

    /**
     * Show information about the current layer at the specified location.
     * @param location
     */
    info = function(location) {
        var currentState = regionWidget.getCurrentState();
        var urls = regionWidget.getUrls();

        $.ajax({
            url: urls.proxyUrl + "?format=json&url=" + urls.spatialServiceUrl + "/intersect/" + currentState.regionFid + "/" +
            location.lat() + "/" + location.lng(),
            dataType: 'json',
            success: function(data) {
                if (data.length == 0) { return; }
                if (infoWindow) { infoWindow.close(); }

                var anyInfo = false;  // keep track of whether we actually add anything
                var desc = '<ol>';
                $.each(data, function(i, obj) {
                    if (obj.value) {
                        anyInfo = true;
                        var lyr = obj.layername == obj.value ? "" : " (" + obj.layername + ")";
                        desc += "<li>" + obj.value + lyr + "</li>";
                    }
                });
                desc += "</ol>";
                if (anyInfo) {
                    infoWindow = new google.maps.InfoWindow({
                        content: "<div style='font-size:90%;padding-right:15px;'>" + desc + "</div>",
                        position: location
                    });
                    infoWindow.open(map);
                }
            }
        });
    };

    var _public = {
        reloadRecordsOnMap: function () {
            drawRecordsOverlay();
        }
    };

    init(config);
    return _public;
};
