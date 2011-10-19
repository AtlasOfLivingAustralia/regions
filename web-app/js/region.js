/******************************\
 * state emblems
 ******************************/

/******************************\
 * behaviour for taxa box
 ******************************/
var speciesGroup = "ALL_SPECIES";
var taxon, taxonGuid;
var regionType, regionName;

var speciesPageUrl = "http://bie.ala.org.au/species/"; // configify
var biocacheServiceUrl = "http://biocache.ala.org.au/ws";
var contextPath = "http://biocache.ala.org.au"; // hack

function initTaxaBox(rt, rn) {
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
 */
function groupClicked(el) {
    // Change the global var speciesGroup
    speciesGroup = $(el).find('a.taxonBrowse').attr('id');

    // save state for back button
    if (speciesGroup == "ALL_SPECIES") {
        // only clear if necessary, otherwise we add a history state for no reason, ie puts in a #
        if($.bbq.getState('group')) {
            $.bbq.removeState('group');
        }
    }
    else {
        $.bbq.pushState({group:speciesGroup});
    }

    // change link text
    $('#viewRecords').html(speciesGroup == 'ALL_SPECIES' ? 'View all records' : 'View records for ' + speciesGroup);
    $('#viewImages').html(speciesGroup == 'ALL_SPECIES' ? 'View images for all species' : 'View images for ' + speciesGroup);

    // update species list
    taxon = null; // clear any species click
    taxonGuid = null;
    $('#taxa-level-0 tr').removeClass("activeRow");
    $(el).addClass("activeRow");
    $('#taxa-level-1 tbody tr').addClass("activeRow");
    // load records layer on map
    //if (map) loadRecordsLayer();
    // AJAX...
    var uri = biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?callback=?";
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
 */
function processSpeciesJsonData(data, appendResults) {
    // clear right list unless we're paging
    if (!appendResults) {
        //$('#loadMoreSpecies').detach();
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
                speciesInfo = speciesInfo + '<a title="'+infoTitle+'" href="'+speciesPageUrl + data[i].guid+
                    '"><img src="'+ contextPath +'/static/images/page_white_go.png" alt="species page icon" style="margin-bottom:-3px;" class="no-rounding"/>'+
                    ' species profile</a> | ';
            }
            speciesInfo = speciesInfo + "<a href='" + contextPath + '/occurrences/search?q=' +
                    buildTaxonFacet(data[i].name) +
                    '&fq=' + buildRegionFacet() + "'" + ' title="'+
                    recsTitle+'"><img src="'+ contextPath +'/static/images/database_go.png" '+
                    'alt="search list icon" style="margin-bottom:-3px;" class="no-rounding"/> list of records</a></div>';

            tr = tr + speciesInfo;
            // add number of records
            tr = tr + '</td><td class="rightCounts">'+data[i].count+' </td></tr>';
            // write list item to page
            $('#rightList tbody').append(tr);
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

    // Register clicks for the list of species links so that map changes
    $('#rightList tbody tr').click(function(e) {
        e.preventDefault(); // ignore the href text - used for data
        var thisTaxonA = $(this).find('a.taxonBrowse2').attr('href').split('/');
        var thisTaxon = thisTaxonA[thisTaxonA.length-1].replace(/%20/g, ' ');
        var guid = $(this).find('a.taxonBrowse2').attr('id');
        taxonGuid = guid;
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
        // show the links for current selected species
        //loadRecordsLayer();
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
            var uri = biocacheServiceUrl + "/explore/group/"+speciesGroup+".json?callback=?";
            $('#loadMoreSpecies').detach(); // delete it
            $.ajax({
                url: uri,
                dataType: 'jsonp',
                data: buildBiocacheQuery(),
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

/*
 * Perform normal spatial searcj for spceies groups and species counts
 */
function loadGroups() {
    var url = biocacheServiceUrl +"/explore/groups.json";
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

/*
 * Populate the species group column (via callback from AJAX)
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

function addGroupRow(group, speciesCount, indent, count) {
    var label = group;
    if (group == "ALL_SPECIES") label = "All Species";
    var rc = (group == speciesGroup) ? " class='activeRow'" : ""; // highlight active group
    var h = "<tr"+rc+" title='click to show species list'><td class='indent"+indent+"'><a href='#' id='"+group+"' class='taxonBrowse' title='click to show species list'>"+label+"</a></td><td>"+speciesCount+"</td></tr>";
    $("#taxa-level-0 tbody").append(h);
}

function notifyTotalRecords(count) {
    $('#occurrenceRecords').html('Occurrence records (' + format(count) + ')');
}
/******************************\
 * taxa box links
 ******************************/
function activateLinks() {
    $('#viewRecords').click(function() {
        // check what group is active
        var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
        var url = contextPath + '/occurrences/search?q=' + buildRegionFacet();
        if (group != 'ALL_SPECIES') {
            url += '&fq=species_group:' + group;
        }
        document.location.href = url;
    });
    $('#viewImages').click(function() {
        // check what group is active
        var group = $('#leftList tr.activeRow').find('a.taxonBrowse').attr('id');
        var url = 'http://diasbtest1.ala.org.au:8080/bie-webapp/images/search/?q=' + buildRegionFacet();
        if (group != 'ALL_SPECIES') {
            url += '&fq=species_group:' + group;
        }
        document.location.href = url;
    });
}

/******************************\
 * map
 ******************************/
// the map
var map;

// the spherical mercator projection
var proj = new OpenLayers.Projection("EPSG:900913");
//var proj = new OpenLayers.Projection("EPSG:4326");

// projection options for interpreting GeoJSON data
var proj_options;

// the data layer
var vectors;

// the server base url
var baseUrl;

var info;

var extent; // = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);

// centre point for map of Australia - this value is transformed
// to the map projection once the map is created.
var centrePoint = new OpenLayers.LonLat(133.7, -28.5).transform(new OpenLayers.Projection("EPSG:4326"),proj);

var overlayFormat = ($.browser.msie && $.browser.version.slice(0,1) == '6') ? "image/gif" : "image/png";

// initialise the map
function initMap(layer, minLat, maxLat, minLon, maxLon) {

//    alert(minLat + " " + maxLat + " " + minLon + " " + maxLon);
    proxy = baseUrl + "/proxy?url=";
    OpenLayers.ProxyHost= proxy;

    extent = new OpenLayers.Bounds(minLon, minLat, maxLon, maxLat).transform(new OpenLayers.Projection("EPSG:4326"),proj);

    // create the map
    map = new OpenLayers.Map('region-map', {
        projection: 'EPSG:900913',
        maxExtent: extent,
        maxResolution: 156543.0339,
        units: 'm',
        //maxResolution: 2468,
        /*maxExtent: new OpenLayers.Bounds(-10037508.34, -10037508.34, 10037508.34, 10037508.34),*/
        controls: []
    });

    // restrict mouse wheel chaos
    map.addControl(new OpenLayers.Control.Navigation({zoomWheelEnabled:false}));
    map.addControl(new OpenLayers.Control.ZoomPanel());
    map.addControl(new OpenLayers.Control.PanPanel());
    map.addControl(new OpenLayers.Control.Graticule({ numPoints: 2, labelled: true }));

    // create base layer
    var wms = new OpenLayers.Layer.WMS(
              "OpenLayers WMS",
              "http://vmap0.tiles.osgeo.org/wms/vmap0",
              {'layers':'basic'} );
    map.addLayer(wms);

    // create google terrain layer
    var gTerrain = new OpenLayers.Layer.Google(
        "Google Physical",
        {type: google.maps.MapTypeId.TERRAIN}
    );
    map.addLayer(gTerrain);

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
    var ger = new OpenLayers.Layer.WMS(
          "ger",
          //"http://spatial.ala.org.au/geoserver/gwc/service/wms",
          "http://spatial.ala.org.au/geoserver/ALA/wms",
          {
              layers: layer,
              transparent: "true",
              format: overlayFormat
          },
          {isBaseLayer: false,
           opacity: 0.7} );
    map.addLayer(ger);
}

// zoom
function resetZoom() {
    // centre the map on Australia
    // note that the point has already been transformed
//    map.setCenter(centrePoint);
    map.zoomTo(5);
}

/******************************\
 * utility
 ******************************/
function makeId(str) {
    str = str.replace(/(\ [a-z])/g, function(s){return s.toUpperCase().replace(' ','');});
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function facetNameFromRegionType(rt) {
    switch (rt) {
        case 'states': return 'state';
        case 'ibras': return 'ibra';
        case 'nrms': return 'nrm';
        default: return rt.substr(0,rt.length - 1);
    }
}

function makeBreakdownQuery(rt, region) {
    if (rt == 'layer') {
        return lookupIdForLayer(region) + ":[* TO *]";
    }
    else {
        return facetNameFromRegionType(rt) + ':"' + region + '"';
    }
}

function lookupIdForLayer(region) {
    switch (region) {
        case "Great Eastern Ranges": return "cl904";
        case "Hunter": return "cl905";
        case "Border Ranges": return "cl903";
        case "Kosciuszko to coast": return "cl909";
        case "Slopes to summit": return "cl912";
        case "K2C Management Regions": return "cl908";
        case "S2S Priority Area Billabong Creek": return "cl910";
        case "S2S Priority Areas": return "cl911";
        case "Hunter Areas of Interest": return "cl907";
        case "Upper Hunter Focus Area": return "cl913";
        case "Myrtle Rust Observations": return "cl934";
        default: return "noCode";
    }
}

function buildBiocacheQuery() {
    return {q:buildRegionFacet(), fq: "geospatial_kosher:true", pageSize: 50}
}

function buildRegionFacet() {
    if (regionType == 'layer') {
        return lookupIdForLayer(regionName) + ":[* TO *]";
    }
    else {
        return facetNameFromRegionType(regionType) + ':"' + regionName + '"';
    }
}

function buildTaxonFacet(name) {
    if (name.split(' ').length > 1) {
        // assume species
        return 'species:"' + name + '"';
    }
    else {
        // assume genus
        return 'genus:"' + name + '"';
    }
}

// formats numbers as human readable
function format(count) {
    if (count >= 1000000) {
        return count.numberFormat("#,#0,,.00 million");
    }
    return addCommas(count);
}
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