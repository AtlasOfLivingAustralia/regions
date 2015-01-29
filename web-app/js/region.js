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
        return timeSlider.isDefault() ? "" : timeSlider.queryString();
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

    var state = {
        regionName: null,
        regionType: null,
        regionFid: null,
        regionPid: null,
        regionLayerName: null,
        playState: null,
        group: null,
        guid: null,
        from: null,
        to: null,
        tab: null
    };

    var urls = {};

    /**
     *
     * @param config
     */
    var init =  function(config) {
        state.regionName = config.regionName;
        state.regionType = config.regionType;
        state.regionFid = config.regionFid;
        state.regionPid = config.regionPid;
        state.regionLayerName = config.regionLayerName;
        state.group = $.bbq.getState('group');
        state.group = state.group ? state.group : 'ALL_SPECIES';
        state.guid = $.bbq.getState('guid');
        state.from = $.bbq.getState('from');
        state.from = state.from ? state.from : defaultFromYear;
        state.to = $.bbq.getState('to');
        state.to = state.to ? state.to : defaultToYear;
        state.tab = $.bbq.getState('tab');
        state.tab = state.tab ? state.tab : defaultTab;

        if (state.from || state.to) {
            timeSlider.set(state.from, state.to, true);
        }

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

    var selectSpecies = function(row) {
        $("#species tbody tr.link").removeClass('speciesSelected')
        $("#species tbody tr.infoRowLinks").hide();
        var nextTr = $(row).next('tr');
        $(row).addClass('speciesSelected');
        $(nextTr).addClass('speciesSelected');
        $(row).next('tr').show();
        // Update state
        state.guid = $(row).attr('id');
        regionMap.reloadRecordsOnMap();
    };

    /**
     *
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
     *
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
    var selectCurrentGroup = function() {
        $('.group-row').removeClass('groupSelected');
        $('#' + state.group + '-row').addClass('groupSelected');
    };

    var _public = {

        getUrls: function() {
            return urls;
        },

        getCurrentState: function() {
            return state;
        },

        updateState: function(newPartialState) {
            $.extend(state, newPartialState);
        },

        groupsLoaded: function() {
            $('#groups').show('highlight', 2000);
            selectCurrentGroup();
            this.loadSpecies();
        },

        selectGroup: function(group) {
            if (group) {
                this.updateState({group: group, guid: null});
                selectCurrentGroup();
            }
            regionMap.reloadRecordsOnMap();
            AjaxAnywhere.dynamicParams=this.getCurrentState();
        },

        loadSpecies: function() {
            $('#' + state.group + '-row').click();
        },

        speciesLoaded: function() {
            $('#species').show('highlight', 2000);
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
            scrollwheel: true,
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
         | Overlay the region shape
         \*****************************************/
        drawRegionOverlay();

        /*****************************************\
         | Overlay the occurrence data
         \*****************************************/
        drawRecordsOverlay();

        /*****************************************\
         | Set up opacity sliders
         \*****************************************/
        $('#occurrencesOpacity').slider({
            min: 0,
            max: 100,
            value: defaultOccurrenceOpacity * 100,
            change: function(event, ui) {
                drawRecordsOverlay();
            }
        });
        $('#regionOpacity').slider({
            min: 0,
            max: 100,
            value: defaultRegionOpacity * 100,
            change: function(event, ui) {
                drawRegionOverlay();
            }
        });


        // layer toggling
        $("#toggleOccurrences").click(function() {
            toggleOverlay(1, this.checked);
        });
        $("#toggleRegion").click(function() {
            toggleOverlay(0, this.checked);
        });

        // map controls toggling
        var $controlsToggle = $('#controls-toggle');
        $controlsToggle.click(function () {
            $controlsToggle.toggle();
            $('#controls').toggle('slideDown');
        });
        $('#hide-controls').click(function () {
            $('#controls').toggle('slideDown', function() {
                $controlsToggle.toggle();
            });
        });

        google.maps.event.addListener(map, 'click', function(event) {
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
                fqParam = "&fq=species_group:" + currentState.group;
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
                fqParam = "fq=species_group:" + currentState.group;
            }
        }

        if (fqParam != "") {
            prms.push(fqParam);
        }

        overlays[1] = new WMSTileLayer("Occurrences (by reflect service)", url, prms, wmsTileLoaded, 0.8);

        map.overlayMapTypes.setAt(1, $('#toggleOccurrences').is(':checked') ? overlays[1] : null);
    };

    var _public = {
        reloadRecordsOnMap: function () {
            drawRecordsOverlay();
        }
    };

    init(config);
    return _public;
};



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

/*******************************************************************************************************\
 * vars
 *******************************************************************************************************/
var speciesGroup = "ALL_SPECIES",  // the currently selected species group
    regionType, regionName, layerName, regionPid, layerFid,  // the region this page describes
    taxon, taxonGuid,   // hold the currently selected species (if any)
    config = {},  // urls and other config
    /**
     * timeSlider encapsulates the data and functions of the date range widget.
     */
    timeSlider = {
        defaultFrom: 1850,
        defaultTo: new Date().getFullYear(),
        slider: $('#timeSlider'),
        eventsEnabled: true,
        isInit: function () {
            return $('#timeSlider').hasClass('ui-slider');
        },
        from: function () {
            return this.isInit() ? $('#timeSlider').slider('values')[0] : this.defaultFrom;
        },
        to: function () {
            return this.isInit() ? $('#timeSlider').slider('values')[1] : this.defaultTo;
        },
        set: function (from, to, noEvents) {
            if (this.isInit()) {
                if (noEvents === true) {
                    this.eventsEnabled = false;
                }
                if (from == undefined) { from = this.from();}
                if (to === undefined) { to = this.to(); }
                $('#timeSlider').slider('values',[from, to]);
                this.updateLabels(from, to);
                this.eventsEnabled = true;
            }
        },
        updateLabels: function (from, to) {
            if (from == undefined) { from = this.from();}
            if (to === undefined) { to = this.to(); }
            $('#from').html(from);
            $('#to').html(to);
            var fromPos = (from - this.defaultFrom) * 2.8,
                toPos = (to - this.defaultFrom) * 2.8,
                diff = toPos - fromPos,
                fromSpacing = diff < 28 ? (28 - diff) * 0.5 : 0,
                toSpacing = diff < 28 ? (28 - diff) * 0.5 : 0;
            if (fromPos - fromSpacing < 0) {
                toSpacing += (fromSpacing - fromPos);
                fromSpacing -= (fromSpacing - fromPos);
            }
            if (toPos + toSpacing > 448) {
                fromSpacing += (toSpacing - (448 - toPos));
                toSpacing -= (toSpacing - (448 - toPos));
            }
            $('#from').css('left', fromPos - fromSpacing);
            $('#to').css('left', toPos - 40 + toSpacing);
        },
        queryString: function () {
            if (!this.isInit()) { return "" }
            var fromPhrase = this.from() === this.defaultFrom ? '*' : this.from() + "-01-01T00:00:00Z",
                toPhrase = this.to() === this.defaultTo ? "*" : (this.to() - 1) + "-12-31T23:59:59Z";
            return "occurrence_year:[" + fromPhrase + " TO " + toPhrase + "]";
        },
        staticQueryString: function (from, to) {
            // defensive stuff
            if (!from && !to) { return ""; }
            if (from && from.match(/[12]\d\d\d/) === null) { return ""; }
            if (to && !to.match(/[12]\d\d\d/) === null) { return ""; }
            var fromPhrase = (!from || from === this.defaultFrom) ? '*' : from + "-01-01T00:00:00Z",
                toPhrase = (!to || to === this.defaultTo) ? "*" : (to - 1) + "-12-31T23:59:59Z";
            return "occurrence_year:[" + fromPhrase + " TO " + toPhrase + "]";
        },
        isDefault: function() {
            if (!this.isInit()) { return true }
            return (this.from() === this.defaultFrom || this.from() === undefined) &&
                    (this.to() === this.defaultTo || this.to() === undefined);
        },
        reset: function () {
            this.set(this.defaultFrom, this.defaultTo, true);
            // align state
            this.saveState();
            // stop play
            this.stop();
        },
        playIndex: 1850,
        playState: 'stopped',
        playDouble: true,
        playTimer: null,
        startPlay: function () {
            if (this.playState !== 'paused') {
                this.stop();   // in case already playing
                this.playIndex = this.defaultFrom;
            }
            this.playDouble = 0;
            this.playState = 'playing';
            this.play();
        },
        play: function() {
            this.set(this.playIndex, this.playIndex + 10);
            this.playIndex = this.playIndex + 10;
            if (this.playIndex < this.defaultTo) {
                    this.playTimer = setTimeout('timeSlider.play()', 1500);
            } else {
                this.playState = 'stopped';
            }
        },
        pause: function () {
            if (this.playState === 'playing') {
                clearTimeout(this.playTimer);
                this.playState = 'paused';
            } else if (this.playState === 'paused') {
                // restart
                this.startPlay();
            }
        },
        stop: function () {
            if (this.playState === 'playing') {
                clearTimeout(this.playTimer);
                this.playState = 'stopped';
            }
        },
        saveState: function () {
            if (this.from() !== this.defaultFrom) {
                $.bbq.pushState({from:this.from()});
            } else {
                $.bbq.removeState('from');
            }
            if (this.to() !== this.defaultTo) {
                $.bbq.pushState({to:this.to()});
            } else {
                $.bbq.removeState('to');
            }
        }
    };

/************************************************************\
* Method to concatenate url fragments handling stray slashes
\************************************************************/
config.urlConcat = function (base, context, more) {
    // remove any trailing slash from base
    base = base.replace(/\/$/, '');
    // remove any leading slash from context
    context = context.replace(/^\//, '');
    // join
    return base + "/" + context + (more === undefined ? "" : more);
};

/**
 * Set the destination for the links associated with the taxa box based on the state of the box
 */
function activateLinks() {

    $('#viewRecords').click(function() {
        // check what group is active
        var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
        var url = config.urlConcat(config.biocacheWebappUrl, '/occurrences/search?q=') +
                buildRegionFacet(regionType, regionName) + timeFacetAsFq();
        if (group != 'ALL_SPECIES') {
            url += '&fq=species_group:' + group;
        }
        document.location.href = url;
    });
    $('#viewImages').click(function() {
        // check what group is active
        var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
        var url = 'http://diasbtest1.ala.org.au:8080/bie-webapp/images/search/?q=' +
                buildRegionFacet(regionType, regionName) + timeFacetAsFq();
        if (group != 'ALL_SPECIES') {
            url += '&fq=species_group:' + group;
        }
        document.location.href = url;
    });

    // download link
    $("#downloadLink").fancybox({
        'hideOnContentClick' : false,
        'hideOnOverlayClick': true,
        'showCloseButton': true,
        'titleShow' : false,
        'autoDimensions' : false,
        'width': '510',
        'height': $.browser.mozilla ? '400' : ($.browser.msie ? '385' : '375'),
        'padding': 15,
        'margin': 10
    });

    // catch download submit button
    $("#downloadSubmitButton").click(function(e) {
        e.preventDefault();
        //check to see if the download provides a reason
        if($("#reasonTypeId option:selected").val()){
            var url = biocacheServicesUrl + '/occurrences/index/download?' + buildQueryForSelectedGroup();
            var reason = $("#reasonTypeId").val();

            url += "&type=&email="+$("#email").val()+"&reasonTypeId="+encodeURIComponent(reason)+"&file="+$("#filename").val();
            //alert("downloadUrl = " + url);
            window.location.href = url;
            $.fancybox.close();
        } else{
            alert("Please select a \"download reason\" from the drop-down list");
        }
    });
    // catch checklist download submit button
    $("#downloadCheckListSubmitButton").click(function(e) {
        e.preventDefault();
        var url = biocacheServicesUrl + '/occurrences/facets/download?' + buildQueryForSelectedGroup();
        url += "&facets=species_guid&lookup=true&file="+$("#filename").val();
        //alert("downloadUrl = " + url);
        window.location.href = url;
        $.fancybox.close();
    });
    // catch checklist download submit button
    $("#downloadFieldGuideSubmitButton").click(function(e) {
        e.preventDefault();
        var url = config.urlConcat(config.biocacheWebappUrl, '/occurrences/fieldguide/download?') + buildQueryForSelectedGroup() +
            "&facets=species_guid";

        window.open(url);

        $.fancybox.close();
    });
}

/*********************************************************************************************************************\
 * Map - shows the current region and occurrence records based on the selections in the taxa box
 *********************************************************************************************************************/

// some metadata for known layers
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

var overlayFormat = /*($.browser.msie && $.browser.version.slice(0,1) == '6') ? "image/gif" :*/ "image/png";





/**
 * Show information about the current layer at the specified location.
 * @param location
 */
function info(location) {
    $.ajax({
        url: baseUrl + "/proxy?format=json&url=" + regionWidget.getUrls().spatialServiceUrl + "/intersect/" + layerFid + "/" +
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
}

/**
 * Returns the value of the opacity slider for the region overlay.
 */
function getRegionOpacity() {
    var opacity = $('#regionOpacity').slider("value");
    return isNaN(opacity) ? defaultRegionOpacity : opacity / 100;
}

/**
 * Displays the current lat/long of the mouse position
 * @param mousePt
 */
function mouseMove(mousePt) {
    $('#location').html(mousePt.latLng.toString());
}

/**
 * Mouse has left the house!
 */
function mouseOut() {
    $('#location').html("");
}

/******************************\
 * show records on map
 ******************************/


/**
 * Turns the overlay layers on or off
 * @param n index of the overlay in the overlays list
 * @param show true to show; false to hide
 */
function toggleOverlay(n, show) {
    map.overlayMapTypes.setAt(n, show ? overlays[n] : null);
}

/**
 * Returns the value of the opacity slider for the occurrence overlay.
 */
function getOccurrenceOpacity() {
    var opacity = $('#occurrencesOpacity').slider("value");
    return isNaN(opacity) ? defaultOccurrenceOpacity : opacity / 100;
}

/**
 * Called when the overlays are loaded. Not currently used
 * @param numtiles
 */
function wmsTileLoaded(numtiles) {
    $('#maploading').fadeOut("slow");
}


/******************************\
 * alerts
 ******************************/

// only deal with the whole region for now
function initAlerts(username) {
    //console.log("user = " + username);
    if (username) {
        // find current alerts
        $.ajax({
            url: "http://alerts.ala.org.au/webservice/regionAlerts",
            dataType: 'jsonp',
            jsonp: false,
            data: {layerId: layerFid, regionName: regionName},
            jsonpCallback: 'alertsCallback',
            success: function(data) {
                //console.log(data);
                if (data.alertExists){
                    $('#alerts').html('<p>You have an alert setup for new records in <strong>'+data.name+'</strong>. ' +
                            '<a href="' + data.link + '">Click here to manage your alerts</a></p>');
                } else {
                    data.link = data.link.slice(0,data.link.length - 4) + document.location.href;
                    $('#alerts').html('<p><a href="' + data.link + '">Notify me when new records come online for ' +
                            '<strong>'+data.name+'</strong></a></p>');
                }
            }
        });
    }
    else {
        $('#alerts').parent().css('display', 'none');
    }
}

/******************************\
 * event handlers
 ******************************/

/**
 * Do something with the total record count
 * @param count
 */
function notifyTotalRecords(count) {
    $('#occurrenceRecords').html('Occurrence records (' + format(count) + ')');
}

function taxonChartChange(rank, name) {
    //taxonomyChart.rank = rank;
    //taxonomyChart.name = name;
//    $.bbq.pushState({rank:rank,name:name});
    drawRecordsOverlay();
}

function taxonomySelected() {
    // save state for back button
    $.bbq.pushState({tab:'taxonomy'});
    // don't redraw if both tabs are showing all records (saves a map flash in the default page)
    if (speciesGroup != "ALL_SPECIES" || taxonomyChart.name != undefined) {
        drawRecordsOverlay();
    }
}

function speciesSelected() {
    // save state for back button
    $.bbq.pushState({tab:'species'});
    // don't redraw if both tabs are showing all records
    if (speciesGroup != "ALL_SPECIES" || taxonomyChart.name != undefined) {
        drawRecordsOverlay();
    }
}

/**
 * This happens for every value change when the sliders are being moved.
 *
 * @param event
 * @param ui
 */
function slideHandler(event, ui) {
    var from = ui.values[0],
        to = ui.values[1];
    // don't allow one slider to overlap the other
    if (from === to) {
        return false;  // prevents slide
    }
    // update display - value and position
    timeSlider.updateLabels(from, to);
    //$('#from').html(from).css('left', timeSlider.calculateFromPosition(from));
    //$('#to').html(to).css('left', timeSlider.calculateToPosition(to));
    return true;
}

/**
 * This happens on mouseup when sliding or on programmatic change.
 *
 * Note that calling set fires this twice.
 * @param event
 * @param ui
 */
function dateRangeChanged(event, ui) {
    $('#from').html(ui.values[0]);
    $('#to').html(ui.values[1]);
    //Dumper.alert(event);
    // only react if slider events are enabled
    if (timeSlider.eventsEnabled) {
        // this code limits page updates to once per set event, ie when changing both values
        // only update after the second value is set
        if (timeSlider.playState === 'playing') {
            if (timeSlider.playDouble === 0) {
                timeSlider.playDouble = 1;
                return
            } else {
                timeSlider.playDouble = 0;
            }
        } else {
            // save state unless playing a time sequence
            timeSlider.saveState();
        }
        // update both tabs based on new range
        loadGroups();
        taxonomyChart.updateQuery(query + timeFacetAsFq());
    }
}

/**
 * Revert chart, taxa box, map opacities, map bounds, and date range.
 */
function resetAll() {
    timeSlider.reset();
    // taxo chart
    taxonomyChart.reset();
    // taxa box
    $('#taxa-level-0 tr:first-child').click();
    // records opacity
    $('#occurrencesOpacity').slider("value",defaultOccurrenceOpacity * 100);
    // region opacity
    $('#regionOpacity').slider("value", defaultRegionOpacity * 100);
    // map
    map.fitBounds(initialBounds);
    // tab
    $bySpecies.click();
}

/******************************\
 * utility
 ******************************/

/**
 * Builds a valid html id from names that may include spaces.
 * @param str the name
 */
function makeId(str) {
    str = str.replace(/(\ [a-z])/g, function(s){return s.toUpperCase().replace(' ','');});
    return str.charAt(0).toLowerCase() + str.slice(1);
}

/**
 * Returns the name to use in q & fq expressions in biocache searches
 * @param rt
 */
function facetNameFromRegionType(rt) {
    switch (rt) {
        case 'states': return 'state';
        case 'ibras': return 'ibra';
        case 'imcras': return 'imcra';
        case 'lgas': return 'places';
        case 'nrms': return 'cl916';
        default: return rt.substr(0,rt.length - 1);
    }
}

/**
 * Builds the query as a string of params based on the current selections in the taxa box.
 */
function buildQueryForSelectedGroup() {
    var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id'),
        query = 'q=' + buildRegionFacet(regionType, regionName) + timeFacetAsFq();
    if (group != 'ALL_SPECIES') {
        query += '&fq=species_group:' + group;
    }
    return query;
}



/**
 * Returns the time query component as an &fq= string or nothing if default dates are set.
 */
function timeFacetAsFq() {
    var facet = buildTimeFacet();
    return facet === "" ? "" : "&fq=" + facet;
}



/**
 * Chooses the right facet name based on the supplied rank
 * @param name
 */
function buildTaxonFacet(name, rank) {
    var facetName = rank == "subspecies" ? "subspecies_name" : rank;
    return facetName + ':"' + name + '"';
}

/**
 * Formats numbers as human readable. Handles numbers in the millions.
 * @param count the number
 */
function format(count) {
    if (count >= 1000000) {
        return count.numberFormat("#,#0,,.00 million");
    }
    return addCommas(count);
}

/**
 * Inserts commas into a number for display.
 * @param nStr
 */
function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}
