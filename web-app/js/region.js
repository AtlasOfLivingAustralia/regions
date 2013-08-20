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
        defaultTo: 2010,
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
 * Called by owner page with region type and name
 * @param rt region type
 * @param rn region name
 * @param options injected config
 */
function initTaxaBox(rt, rn, options) {
    $.extend(config, options);
    regionType = rt;
    regionName = rn;
    // Register events for the species_group column
    $('#taxa-level-0 tbody tr').live("mouseover mouseout", function() {
        // mouse hover on groups
        if ( event.type == "mouseover" ) {
            $(this).addClass('hoverRow');
        } else {
            $(this).removeClass('hoverRow');
        }
    }).live("click", function(e) {
        // catch the link on the taxon groups table
        e.preventDefault(); // ignore the href text - used for data
        groupClicked(this);
    });

    // get any previous state from url
    var urlGroup = $.bbq.getState('group'),
        fromDate = $.bbq.getState('from'),
        toDate = $.bbq.getState('to');
    if (urlGroup) {
        speciesGroup = urlGroup;
    }
    if (fromDate || toDate) {
        timeSlider.set(fromDate, toDate, true);
    }

    // load it up
    loadGroups();

    activateLinks();
}

/**
 * Species group was clicked
 * @param el the element that was clicked
 */
function groupClicked(el) {
    // Change the global var speciesGroup
    speciesGroup = $(el).find('a.taxonBrowse').attr('id');
    // clear any selected species
    taxon = null;
    taxonGuid = null;

    // save state for back button
    if (speciesGroup != "ALL_SPECIES" || $.bbq.getState('group')) {
        // don't add ALL_SPECIES unless there is a group selected, otherwise we add a history state for no reason
        $.bbq.pushState({group:speciesGroup});
    }

    // change link text
    if ($('#viewRecords').length == 0) {
        // don't create these until the taxa box is populated - so they get laid out correctly
        $('#taxaBox').append('<div style="clear:both;"><span id="viewRecords" class="link under"> </span>' +
                        '<span id="viewImages" class="link under"> </span>' +
                        '<span id="downloadLink" class="link under">Download records</span></div>');

    }
    $('#viewRecords').html(speciesGroup == 'ALL_SPECIES' && timeSlider.isDefault() ? 'View all records' : 'View selected records');
    $('#downloadLink').html(speciesGroup == 'ALL_SPECIES' && timeSlider.isDefault() ? 'Download all' : 'Downloads for current selection');
    //$('#viewImages').html(speciesGroup == 'ALL_SPECIES' ? 'View images for all species' : 'View images for ' + speciesGroup);

    // update species list
    $('#taxa-level-0 tr').removeClass("activeRow");
    $(el).addClass("activeRow");
    $('#taxa-level-1 tbody tr').addClass("activeRow");

    // load records layer on map
    if (map) drawRecordsOverlay();

    // load species for selected group
    var uri = config.biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?callback=?";
    $('#taxaDiv').html('[loading...]');
    $.ajax({
        url: uri,
        dataType: 'jsonp',
        data: buildBiocacheQuery(),
        success: function(data) {
            // process JSON data from request
            if (data) processSpeciesJsonData(data);
        }
    });
}

/**
 * Process the JSON data from an Species list AJAX request
 * @param data the returned json
 * @param appendResults true if the items should be appended to the existing list
 */
function processSpeciesJsonData(data, appendResults) {
    // clear right list unless we're paging
    if (!appendResults) {
        $('#rightList tbody').empty();
    }
    // process JSON data
    if (data.length > 0) {
        var lastRow = $('#rightList tbody tr').length;
        var linkTitle = "show species/records links";
        var infoTitle = "view species page";
        var recsTitle = "view list of records";
        // iterate over list of species from search
        for (i=0;i<data.length;i++) {
            // create new table row
            var count = i + lastRow;
            // add count
            var tr = '<tr><td>'+(count+1)+'.</td>';
            // add scientific name
            tr = tr + '<td class="sciName"><a id="' + data[i].guid + '" class="taxonBrowse2" title="'+linkTitle+'" href="'+ // id=taxon_name
                data[i].name+'"><i>'+data[i].name+'</i></a>';
            // add common name
            if (data[i].commonName) {
                tr = tr + ' : '+data[i].commonName+'';
            }
            // add links to species page and occurrence search (inside hidden div)
            var speciesInfo = '<div class="speciesInfo">';
            if (data[i].guid) {
                speciesInfo = speciesInfo + '<a title="'+infoTitle+'" href="'+ config.speciesPageUrl + data[i].guid+
                    '"><img src="'+ config.urlConcat(config.biocacheWebappUrl, '/static/images/page_white_go.png') + '" alt="species page icon" style="margin-bottom:-3px;" class="no-rounding"/>'+
                    ' species profile</a> | ';
            }
            speciesInfo = speciesInfo + "<a href='" + config.urlConcat(config.biocacheWebappUrl, '/occurrences/search?q=') +
                    buildTaxonFacet(data[i].name, data[i].rank) +
                    '&fq=' + buildRegionFacet(regionType, regionName) + timeFacetAsFq() + "'" + ' title="'+
                    recsTitle+'"><img src="'+ config.urlConcat(config.biocacheWebappUrl, '/static/images/database_go.png') + '" ' +
                    'alt="search list icon" style="margin-bottom:-3px;" class="no-rounding"/> list of records</a></div>';

            tr = tr + speciesInfo;
            // add number of records
            tr = tr + '</td><td class="rightCounts">'+data[i].count+' </td></tr>';
            // add data
            var $tr = $(tr);
            $tr.data('taxon',{guid: data[i].guid, rank: data[i].rank});
            // write list item to page
            $('#rightList tbody').append($tr);
            //if (console) console.log("tr = "+tr);
        }

        if (data.length == 50) {
            // add load more link
            var newStart = $('#rightList tbody tr').length;
            $('#rightList tbody').append('<tr id="loadMoreSpecies"><td>&nbsp;</td><td colspan="2"><a href="'+newStart+
                '">Show more species</a></td></tr>');
        }

    } else if (appendResults) {
        // do nothing
    } else {
        // no species were found (either via paging or clicking on taxon group)
        var text = '<tr><td></td><td colspan="2">[no species found]</td></tr>';
        $('#rightList tbody').append(text);
    }

    // Register clicks for the list of species
    $('#rightList tbody tr').click(function(e) {
        e.preventDefault(); // ignore the href text - used for data
        if (this.id != 'loadMoreSpecies') {  // don't act on the 'more species' link
            var thisTaxonA = $(this).find('a.taxonBrowse2').attr('href').split('/');
            var thisTaxon = thisTaxonA[thisTaxonA.length-1].replace(/%20/g, ' ');
            taxonGuid = $(this).data('taxon').guid;
            taxon = thisTaxon; // global var so map can show just this taxon
            $('#rightList tbody tr').removeClass("activeRow2"); // un-highlight previous current taxon
            // remove previous species info row
            $('#rightList tbody tr#info').detach();
            var info = $(this).find('.speciesInfo').html();
            // copy contents of species into a new (tmp) row
            if (info) {
                $(this).after('<tr id="info"><td><td>'+info+'<td></td></tr>');
            }
            // hide previous selected species info box
            $(this).addClass("activeRow2"); // highlight current taxon

            // redraw the occurrences on the map
            drawRecordsOverlay();
        }
    });

    // Register onClick for "load more species" link
    $('#loadMoreSpecies a').click(
        function(e) {
            e.preventDefault(); // ignore the href text - used for data
            var thisTaxon = $('#taxa-level-0 tr.activeRow').find('a.taxonBrowse').attr('id'),
            taxa = []; // array of taxa
            taxa = (thisTaxon.indexOf("|") > 0) ? thisTaxon.split("|") : thisTaxon;
            var start = $(this).attr('href');
            // AJAX...
            var uri = config.biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?callback=?";
            $('#loadMoreSpecies').detach(); // delete it
            $.ajax({
                url: uri,
                dataType: 'jsonp',
                data: buildBiocacheQuery(start),
                success: function(data) {
                    // process JSON data from request
                    processSpeciesJsonData(data, true);
                }
            });
        }
    );

    // add hover effect to table cell with scientific names
    $('#rightList tbody tr').hover(
        function() {
            $(this).addClass('hoverCell');
        },
        function() {
            $(this).removeClass('hoverCell');
        }
    );
}

/**
 * Perform spatial search for species groups and species counts
 */
function loadGroups() {
    var url = config.biocacheServiceUrl +"/explore/groups.json";
    $.ajax({
        url: url,
        dataType: 'jsonp',
        data: buildBiocacheQuery(),
        success: function(data) {
            if (data) {
                populateSpeciesGroups(data);
            }
        }
    });
}

/**
 * Populate the species group column (via callback from AJAX)
 * @param data json listing the species-group breakdown for the region
 */
function populateSpeciesGroups(data) {
    if (data.length > 0) {
         $("#taxa-level-0 tbody").empty(); // clear existing values
        $.each(data, function (i, n) {
            addGroupRow(n.name, n.speciesCount, n.level, n.count)
            if (n.name == 'ALL_SPECIES' && timeSlider.isDefault()) {
                notifyTotalRecords(n.count);
            }
        });

        // Dynamically set height of #taxaDiv (to match containing div height)
        var tableHeight = $('#taxa-level-0').height(),
            tbodyHeight = $('#taxa-level-0 tbody').height();
        if ($.browser.mozilla) {
            $('.tableContainer').height(tableHeight+4);
            $('#rightList tbody').height(tbodyHeight - 3);
        }
        /*else if ($.browser.msie) {
            $('.tableContainer').height(tableHeight+8);
            $('#rightList tbody').height(tbodyHeight - 5);
            //alert(tableHeight + " -> " + $('.tableContainer').height());
        }*/
        else {
            $('.tableContainer').height(tableHeight+8);
            $('#rightList tbody').height(tbodyHeight);
        }
        $('#taxa-level-0 tbody tr.activeRow').click();
    }
}

/**
 * Add a species group row
 * @param group the species group
 * @param speciesCount the number of distinct species
 * @param indent if it's a sub-group
 * @param count the number of occurrence records
 */
function addGroupRow(group, speciesCount, indent, count) {
    var label = group;
    if (group == "ALL_SPECIES") label = "All Species";
    var rc = (group == speciesGroup) ? " class='activeRow'" : ""; // highlight active group
    var h = "<tr"+rc+" title='click to show species list'><td class='indent"+indent+"'><a href='#' id='"+group+"' class='taxonBrowse' title='click to show species list'>"+label+"</a></td><td>"+speciesCount+"</td></tr>";
    $("#taxa-level-0 tbody").append(h);
}

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
        var url = biocacheServicesUrl + '/occurrences/download?' + buildQueryForSelectedGroup();
        var reason = $("#reason").val();
        if(typeof reason == "undefined")
            reason = "";
        url += "&type=&email="+$("#email").val()+"&reason="+encodeURIComponent(reason)+"&file="+$("#filename").val();
        //alert("downloadUrl = " + url);
        window.location.href = url;
        $.fancybox.close();
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
 * Initialise the map - called by owner page
 * @param type eg states, lgas, layer
 * @param name of the region (object) being described
 * @param layer name of the layer in geoserver
 * @param pid of the region (object) being described
 * @param bbox bounding box for the region
 * @param fid id of the field (almost = layer)
 */
function initRegionMap(type, name, layer, pid, bbox) {

    regionType = type;
    regionName = name;
    layerName = layer;
    regionPid = pid;

    /*****************************************\
    | Create the map
    \*****************************************/
    /*var centreLatlng;
    if (extent != undefined) {
        centreLatlng = new google.maps.LatLng(extent.lat, extent.lon);
    }
    else {
        centreLatlng = new google.maps.LatLng(-28.8,144);
    }
    var zoom = extent == undefined ? 4 : extent.zoom;*/

    initialBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(bbox.sw.lat, bbox.sw.lng),
            new google.maps.LatLng(bbox.ne.lat, bbox.ne.lng));

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

    /*****************************************\
    | Bind some events
    \*****************************************/
    /*google.maps.event.addListener(map, 'mousemove', mouseMove);
    google.maps.event.addListener(map, 'mouseout', mouseOut);
    google.maps.event.addListener(map, 'zoom_changed', function() {
        $('#zoom').html("" + map.getZoom());
    });*/

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
    if (initialBounds.equals(new google.maps.LatLngBounds(
            new google.maps.LatLng(-42, 113),
            new google.maps.LatLng(-14, 153)))) {
        // try the bounds of the occurrence records (TEMP: until we get proper bbox's)
        //var url = urlConcat(config.biocacheServiceUrl, "webportal/bounds?q=") + buildRegionFacet(regionType, regionName);
        //var url = urlConcat(config.biocacheServiceUrl, 'webportal/bounds?q="Alinytjara%20Wilurara"');
        $.ajax({
            url: baseUrl + "/proxy/bbox?q=" + buildRegionFacet(regionType, regionName),
            //url: url,
            dataType: 'json',
            success: function(data) {
                if (data[0] != 0.0) {
                    initialBounds = new google.maps.LatLngBounds(
                        new google.maps.LatLng(data[1], data[0]),
                        new google.maps.LatLng(data[3], data[2]));
                    map.fitBounds(initialBounds);
                    $('#using-bbox-hack').html("Using occurrence bounds")
//                    $('#bbox').html("Using bbox " + newBbox.toString());
                }
            }
        });
    }
}

/**
 * Load the region as a WMS overlay.
 */
function drawRegionOverlay() {

    if (regionType == 'layer') {
        /* this draws the region as a WMS layer */
        var layerParams = [
            "FORMAT=" + overlayFormat,
            "LAYERS=ALA:" + layerName,
            "STYLES=polygon"
        ];
        overlays[0] = new WMSTileLayer(layerName, config.spatialCacheUrl, layerParams, wmsTileLoaded, getRegionOpacity());
        map.overlayMapTypes.setAt(0, overlays[0]);

    }
    else {
        var params = [
            "FORMAT=" + overlayFormat,
            "LAYERS=ALA:Objects",
            "viewparams=s:" + regionPid,
            "STYLES=polygon"
        ];
        overlays[0] = new WMSTileLayer(layerName, config.spatialWmsUrl, params, wmsTileLoaded, getRegionOpacity());
        map.overlayMapTypes.setAt(0, overlays[0]);
    }
}

/**
 * Show information about the current layer at the specified location.
 * @param location
 */
function info(location) {
    $.ajax({
        url: baseUrl + "/proxy?format=json&url=" + config.spatialServiceUrl + "/intersect/" + layerFid + "/" +
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
function drawRecordsOverlay2() {
    var url = "http://biocache.ala.org.au/ws/webportal/wms/reflect?",
        query = buildBiocacheQuery(0, true);
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
    if ($byTaxonomyLink.hasClass('current')) {
        // show records based on taxonomy chart
        if (taxonomyChart.rank && taxonomyChart.name) {
            fqParam = "fq=" + taxonomyChart.rank + ":" + taxonomyChart.name;
        }
    }
    else {
        // show records based on taxa box
        if (taxonGuid) {
            fqParam = "fq=taxon_concept_lsid:" + taxonGuid;
        }
        else if (speciesGroup != "ALL_SPECIES") {
            fqParam = "fq=species_group:" + speciesGroup;
        }
    }

    if (fqParam != "") {
        prms.push(fqParam);
    }

    overlays[1] = new WMSTileLayer("Occurrences (by reflect service)", url, prms, wmsTileLoaded, 0.8);

    map.overlayMapTypes.setAt(1, $('#toggleOccurrences').is(':checked') ? overlays[1] : null);
}

/**
* Load occurrence data as a wms overlay based on the current selection:
* - if taxa box is visible, show the selected species group or species
* - if taxonomy chart is selected, show the current named rank
* - use date restriction specified by the time slider
*/
function drawRecordsOverlay() {

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
    var query = buildBiocacheQuery(0, true);
    var searchParam = encodeURI("?q=" + query.q + "&fq=" + query.fq + "&fq=geospatial_kosher:true");

    var fqParam = "";
    if ($byTaxonomyLink.hasClass('current')) {
        // show records based on taxonomy chart
        if (taxonomyChart.rank && taxonomyChart.name) {
            fqParam = "&fq=" + taxonomyChart.rank + ":" + taxonomyChart.name;
        }
    }
    else {
        // show records based on taxa box
        if (taxonGuid) {
            fqParam = "&fq=taxon_concept_lsid:" + taxonGuid;
        }
        else if (speciesGroup != "ALL_SPECIES") {
            fqParam = "&fq=species_group:" + speciesGroup;
        }
    }

    searchParam += fqParam;
    alert(searchParam);

    var pairs = searchParam.substring(1).split('&');
    for (var j = 0; j < pairs.length; j++) {
        customParams.push(pairs[j]);
    }
    overlays[1] = new WMSTileLayer("Occurrences",
            urlConcat(config.biocacheServiceUrl,"occurrences/wms?"), customParams, wmsTileLoaded, getOccurrenceOpacity());

    map.overlayMapTypes.setAt(1, $('#toggleOccurrences').is(':checked') ? overlays[1] : null);
}

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
 * Builds the query as a map that can be passed directly as data in an ajax call
 * @param start optional start parameter for paging results
 */
function buildBiocacheQuery(start, useTime) {
    var params = {q:buildRegionFacet(regionType, regionName), pageSize: 50},
        timeFacet = buildTimeFacet();
    if (start) {
        params.start = start
    }

    if (timeFacet) {
        params.fq = timeFacet;
        //$('#debugTime').html(timeFacet);
    }
    return params;
}

/**
 * Returns the time query component as an &fq= string or nothing if default dates are set.
 */
function timeFacetAsFq() {
    var facet = buildTimeFacet();
    return facet === "" ? "" : "&fq=" + facet;
}

/**
 * Builds the query phrase for a range of dates - returns nothing for the default date range.
 */
function buildTimeFacet() {
    return timeSlider.isDefault() ? "" : timeSlider.queryString();
}

/**
 * Builds the query phrase for a region based on its type and name.
 */
function buildRegionFacet(regionType, regionName) {
    if (regionType == 'layer') {
        return layerFid + ":[* TO *]";
    }
    else {
        return layerFid + ':"' + regionName + '"';
        //return facetNameFromRegionType(regionType) + ':"' + regionName + '"';
    }
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
