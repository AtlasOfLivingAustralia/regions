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
 * behaviour for taxa box
 *******************************************************************************************************/
var speciesGroup = "ALL_SPECIES",  // the currently selected species group
    regionType, regionName, layerName, regionPid, layerFid,  // the region this page describes
    taxon, taxonGuid,   // hold the currently selected species (if any)
    config = {};  // urls and other config

/**
 * Called by owner page with region type and name
 * @param rt region type
 * @param rn region name
 * @param options injected config
 */
function initTaxaBox(rt, rn, options) {
    config = options;
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
    var urlGroup = $.bbq.getState('group');
    if (urlGroup) { speciesGroup = urlGroup }

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
    $('#viewRecords').html(speciesGroup == 'ALL_SPECIES' ? 'View all records' : 'View records for ' + speciesGroup);
    $('#downloadLink').html(speciesGroup == 'ALL_SPECIES' ? 'Downloads' : 'Downloads for ' + speciesGroup);
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
                    '"><img src="'+ config.biocacheWebappUrl +'/static/images/page_white_go.png" alt="species page icon" style="margin-bottom:-3px;" class="no-rounding"/>'+
                    ' species profile</a> | ';
            }
            speciesInfo = speciesInfo + "<a href='" + config.biocacheWebappUrl + '/occurrences/search?q=' +
                    buildTaxonFacet(data[i].name, data[i].rank) +
                    '&fq=' + buildRegionFacet(regionType, regionName) + "'" + ' title="'+
                    recsTitle+'"><img src="'+ config.biocacheWebappUrl +'/static/images/database_go.png" '+
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
        // hide previous selected spceies info box
        $(this).addClass("activeRow2"); // highlight current taxon

        // redraw the occurrences on the map
        drawRecordsOverlay();
    });

    // Register onClick for "load more species" link
    $('#loadMoreSpecies a').click(
        function(e) {
            e.preventDefault(); // ignore the href text - used for data
            var thisTaxon = $('#taxa-level-0 tr.activeRow').find('a.taxonBrowse').attr('id');
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
            if (n.name == 'ALL_SPECIES') {
                notifyTotalRecords(n.count);
            }
        });

        // Dynamically set height of #taxaDiv (to match containing div height)
        var tableHeight = $('#taxa-level-0').height();
        $('.tableContainer').height(tableHeight+8);
        var tbodyHeight = $('#taxa-level-0 tbody').height();
        $('#rightList tbody').height(tbodyHeight);
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
        var url = config.biocacheWebappUrl + '/occurrences/search?q=' + buildRegionFacet(regionType, regionName);
        if (group != 'ALL_SPECIES') {
            url += '&fq=species_group:' + group;
        }
        document.location.href = url;
    });
    $('#viewImages').click(function() {
        // check what group is active
        var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
        var url = 'http://diasbtest1.ala.org.au:8080/bie-webapp/images/search/?q=' + buildRegionFacet(regionType, regionName);
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
        'width': '500',
        'height': '300',
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
        var url = config.biocacheWebappUrl + '/occurrences/fieldguide/download?' + buildQueryForSelectedGroup() +
            "&facets=species_guid";

        window.open(url);

        $.fancybox.close();
    });
}

/*******************************************************************************************************\
 * behaviour for taxonomy chart
 *******************************************************************************************************/
var currentRank = "";
var currentRankName = "";


/*********************************************************************************************************************\
 * Map - shows the current region and occurrence records based on the selections in the taxa box
 *********************************************************************************************************************/

// some metadata for known layers
var layers = {
    states: {layer: 'states', name: 'aus1', displayName: 'name_1', bieContext: 'aus_states'},
    lgas: {layer: 'lgas', name: 'aus2', displayName: 'name_2', bieContext: 'gadm_admin'},
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

//var overlayFormat = ($.browser.msie && $.browser.version.slice(0,1) == '6') ? "image/gif" : "image/png";

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
    google.maps.event.addListener(map, 'mousemove', mouseMove);
    google.maps.event.addListener(map, 'mouseout', mouseOut);
    google.maps.event.addListener(map, 'zoom_changed', function() {
        $('#zoom').html("" + map.getZoom());
    });

    // layer toggling
    $("#toggleOccurrences").click(function() {
        toggleOverlay(1, this.checked);
    });
    $("#toggleRegion").click(function() {
        toggleOverlay(0, this.checked);
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
        var url = urlConcat(config.biocacheServiceUrl, 'webportal/bounds?q="Alinytjara%20Wilurara"');
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
        /* this uses feature data to draw the region as a polygon */
        /*$.ajax({
            url: baseUrl + "/proxy/coords",
            dataType: 'json',
            success: function(data) {

                // process JSON data from request
                $.each(data.geometries[0].coordinates, function(i,obj) {
                    var polyCoords = [];
                    var poly = [];
                    $.each(obj[0], function(i,coord) {
                        polyCoords.push(new google.maps.LatLng(coord[1],coord[0]));
                    });
                    var color;
                    switch(i) {
                        case 0: color = "#0000FF"; break;
                        case 1: color = "#00FF00"; break;
                        default: color = "#00FF00";
                    }
                    poly[i] = new google.maps.Polygon({
                      paths: polyCoords,
                      strokeColor: color,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      fillColor: color,
                      fillOpacity: 0.35
                    });

                    poly[i].setMap(map);

                });

            }
        });*/

        /* this uses KML to draw the region */
        // THIS WON'T WORK UNLESS THE URL IS PUBLICLY AVAILABLE (data is harvested server-side by Google)
        //var gerLayer = new google.maps.KmlLayer(baseUrl + "/proxy/kmltest.kml");
        //var gerLayer = new google.maps.KmlLayer("http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml");
        //gerLayer.setMap(map);

        /* this draws the region as a WMS layer */
        var layerParams = [
            "FORMAT=image/png8",
            "LAYERS=ALA:" + layerName,
            "STYLES=polygon"
        ];
        overlays[0] = new WMSTileLayer(layerName, config.spatialCacheUrl, layerParams, wmsTileLoaded, getRegionOpacity());
        map.overlayMapTypes.setAt(0, overlays[0]);

    }
    else {
        var params = [
            "FORMAT=image/png8",
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
    var url = "http://biocache.ala.org.au/ws/webportal/wms/reflect?";
    var query = buildBiocacheQuery();
    query.fq = "geospatial_kosher:true";
    var prms = [
        "FORMAT=image/png",
        "LAYERS=ALA%3Aoccurrences",
        "STYLES=",
        "BGCOLOR=0xFFFFFF",
        'q=' + encodeURI(query.q),
        "fq=" + encodeURI(query.fq),
        'CQL_FILTER=',
        "symsize=3",
        "ENV=color:3366CC;name:circle;size:3;opacity:" + getOccurrenceOpacity(),
        //"ENV=color:22a467;name:circle;size:4;opacity:0.8",
        "EXCEPTIONS=application-vnd.ogc.se_inimage"
    ];

    var fqParam = "";
    if ($byTaxonomyLink.hasClass('current')) {
        // show records based on taxonomy chart
        if (currentRank && currentRankName) {
            fqParam = "fq=" + currentRank + ":" + currentRankName;
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
*/
function drawRecordsOverlay() {

    if (useReflectService) {
        drawRecordsOverlay2();
        return;
    }

    var customParams = [
        "FORMAT=image/png8",
        "colourby=3368652",
        "symsize=4"
    ];

    //Add query string params to custom params
    var query = buildBiocacheQuery();
    query.fq = "geospatial_kosher:true";
    var searchParam = encodeURI("?q=" + query.q + "&fq=" + query.fq);

    var fqParam = "";
    if ($byTaxonomyLink.hasClass('current')) {
        // show records based on taxonomy chart
        if (currentRank && currentRankName) {
            fqParam = "&fq=" + currentRank + ":" + currentRankName;
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
    currentRank = rank;
    currentRankName = name;
//    $.bbq.pushState({rank:rank,name:name});
    drawRecordsOverlay();
}

function taxonomySelected() {
    // save state for back button
    $.bbq.pushState({tab:'taxonomy'});
    // don't redraw if both tabs are showing all records (saves a map flash in the default page)
    if (speciesGroup != "ALL_SPECIES" || currentRankName != undefined) {
        drawRecordsOverlay();
    }
}

function speciesSelected() {
    // save state for back button
    $.bbq.pushState({tab:'species'});
    // don't redraw if both tabs are showing all records
    if (speciesGroup != "ALL_SPECIES" || currentRankName != undefined) {
        drawRecordsOverlay();
    }
}

function resetAll() {
    // taxo chart
    resetTaxonomyChart();
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
    var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
    var query = 'q=' + buildRegionFacet(regionType, regionName);
    if (group != 'ALL_SPECIES') {
        query += '&fq=species_group:' + group;
    }
    return query;
}

/**
 * Builds the query as a map that can be passed directly as data in an ajax call
 * @param start optional start parameter for paging results
 */
function buildBiocacheQuery(start) {
    var params = {q:buildRegionFacet(regionType, regionName), pageSize: 50};
    if (start) {
        params.start = start
    }
    return params;
}

/**
 * Builds the query phrase for a region based on its type and name.
 */
function buildRegionFacet(regionType, regionName) {
    if (regionType == 'layer') {
        return layerFid + ":[* TO *]";
    }
    else {
        return facetNameFromRegionType(regionType) + ':"' + regionName + '"';
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