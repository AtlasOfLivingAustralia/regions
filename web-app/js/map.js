/*
 * Mapping - plot collection locations
 */

/* some globals */
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

var extent = new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34);

var selectedRegionLayer;

// an array of the currently selected regions
var selectedRegions = [];
function emptySelectedRegions() {
    selectedRegions = [];
    $.bbq.removeState('regions');
}
function setSelectedRegions(regions) {
    selectedRegions = regions;
    $.bbq.pushState({regions:selectedRegions.join(',')});
}
function addToSelectedRegions(region) {
    if ($.inArray(region, selectedRegions) == -1) {
        selectedRegions.push(region);
    }
    $.bbq.pushState({regions:selectedRegions.join(',')});
}
function removeFromSelectedRegions(region) {
    var idx = $.inArray(region, selectedRegions);
    selectedRegions.splice(idx,1);
    $.bbq.pushState({regions:selectedRegions.join(',')});
}

// centre point for map of Australia - this value is transformed
// to the map projection once the map is created.
var centrePoint = new OpenLayers.LonLat(133.7, -28.5).transform(new OpenLayers.Projection("EPSG:4326"),proj);

var bieUrl = "http://bie.ala.org.au/regions/";

/*
 * regionsList is a js object with a property for each region type.
 * The value of each region type is a js object with these properties:
 *   total: the total number of features (ie regions of that type)
 *   pageMap: a map of pages of features with keys 'p1' to 'pn' - each page contains a list of features
 */
var regionsList = {};

// the number of regions displayed per page
var pageSize = 60;

var layers = {
    states: {layer: 'states', name: 'aus1', displayName: 'name_1', keyField: 'gid' /*'id_1'*/, bieContext: 'aus_states'},
    lgas: {layer: 'lgas', name: 'aus2', displayName: 'name_2', keyField: 'gid' /*'id_2'*/, bieContext: 'gadm_admin'},
    ibras: {layer: 'ibras', name: 'ibra_merged', displayName: 'reg_name', keyField: 'gid' /*'reg_no'*/, bieContext: 'ibra_no_states'},
    imcras: {layer: 'imcras', name: 'imcra4_pb', displayName: 'pb_name', keyField: 'gid' /*'pb_num'*/, bieContext: 'imcra'},
    nrms: {layer: 'nrms', name: 'nrm_regions_2010', displayName: 'nrm_region', keyField: 'gid', bieContext: 'nrm'},
    /*hunter: {layer: 'hunter', name: 'ger_hunter', displayName: 'ala_id', keyField: 'gid', bieContext: 'ger'},
    k2c: {layer: 'k2c', name: 'ger_kosciuszko_to_coast', displayName: 'ala_id', keyField: 'gid', bieContext: 'ger'},
    border: {layer: 'border_ranges', name: 'ger_border_ranges', displayName: 'ala_id', keyField: 'gid', bieContext: 'ger'},
    slopes: {layer: 'slopes_to_summit', name: 'ger_slopes_to_summit', displayName: 'ala_id', keyField: 'gid', bieContext: 'ger'},*/
    ger: {layer: 'ger', name: 'ger_geri_boundary_v102_australia', displayName: 'ala_id', keyField: 'gid', bieContext: 'ger'}
};

var sld = "<?xml version=\"1.0\" encoding=\"ISO-8859-1\"?><StyledLayerDescriptor version=\"1.0.0\" xsi:schemaLocation=\"http://www.opengis.net/sld%20http://schemas.opengis.net/sld/1.1.0/StyledLayerDescriptor.xsd\" xmlns=\"http://www.opengis.net/sld\" xmlns:ogc=\"http://www.opengis.net/ogc\" xmlns:se=\"http://www.opengis.net/se\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"><NamedLayer><Name>region</Name><UserStyle><Title>xxx</Title><FeatureTypeStyle><Rule><PolygonSymbolizer><Fill><CssParameter name=\"fill\">#ff0000</CssParameter></Fill></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>";

//var theSLD_BODY= '<?xml version="1.0" encoding="utf-8"?>' + '<StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/sld+http://schemas.opengeospatial.net/sld/1.0.0/StyledLayerDescriptor.xsd"><NamedLayer><Name>COUNTRY</Name><UserStyle><FeatureTypeStyle><Rule><PolygonSymbolizer><Fill><CssParameter name="fill">#5599DD</CssParameter></Fill><Stroke><CssParameter name="stroke">#FF0000</CssParameter></Stroke></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';

var proxy;

var startingType;

var overlayFormat = ($.browser.msie && $.browser.version.slice(0,1) == '6') ? "image/gif" : "image/png";

/************************************************************\
* initialise the map
* note this must be called from body.onload() not jQuery document.ready() as the latter is too early
\************************************************************/
function initMap() {

    //hideInfoPanel();

    proxy = baseUrl + "/proxy?url=";
    OpenLayers.ProxyHost= proxy;

    // create the map
    map = new OpenLayers.Map('map_canvas', {
        projection: 'EPSG:900913',
        maxExtent: extent, //new OpenLayers.Bounds(12000000, -6037508, 15537508, -1100000),
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

    // create base layer
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
    $.each(layers, function(index, value) {
        window[value.layer] = new OpenLayers.Layer.WMS(
              "Aus " + value.layer,
              "http://spatial.ala.org.au/geoserver/gwc/service/wms",
              //"http://spatial.ala.org.au/geoserver/ALA/wms",
              {
                  layers: 'ALA:' + value.name,
                  transparent: "true",
                  format: overlayFormat
              },
              {isBaseLayer: false,
               opacity: 0.7} );
        map.addLayer(window[value.layer]);
        if (value.layer != startingType) {
            window[value.layer].setVisibility(false);
        }
    });

    // create control to collect map clicks and turn them into feature info requests
    info = new OpenLayers.Control.WMSGetFeatureInfo({
        //url: 'http://spatial.ala.org.au/geoserver/gwc/service/wms',
        url: 'http://spatial.ala.org.au/geoserver/ALA/wms',
        layerUrls: ['http://spatial.ala.org.au/geoserver/gwc/service/wms'],
        title: 'Identify features by clicking',
        queryVisible: true,
        click: true,
        layer: 'ibras',
        maxFeatures: 1,
        hover: false,
        infoFormat: 'text/plain',
        eventListeners: {
            getfeatureinfo: function(event) {
                clearSelectedRegions();
                if (event.text == 'no features were found\n') {
                    hideInfoPanel();
                    //clear selections
                    return;
                }
                var layer = getSelectedLayer();
                var text = buildInfoText(event.text, layer);
                addToSelectedRegions(extractValue(event.text, layer.displayName));
                highlightSelectedRegionsInList(selectedRegions);

                if (text != 'empty') {
                    $('#selectedRegion').html(text);
                    showInfoPanel();
                }
                var gid = extractValue(event.text, layer.keyField);
                if (gid == "") {
                    // received an unexpected response
                    alert("Bad response from server: " + event.text)
                    return;
                }
                selectedRegionLayer = new OpenLayers.Layer.WMS(
                    "Aus selected",
                    //"http://spatial.ala.org.au/geoserver/gwc/service/wms",
                    "http://spatial.ala.org.au/geoserver/ALA/wms", // gwc doesn't support cql filters
                    {
                        layers: 'ALA:' + layer.name,
                        transparent: "true",
                        CQL_FILTER: layer.keyField + ' EQ ' + gid,
                        format: overlayFormat,
                        "version": "1.1.1",
                        styles: 'polygon'
                        //SLD: 'http://woodfired.ala.org.au:8070/pt/gis/sel_style.sld'
                        //SLD_BODY: theSLD_BODY
                    },
                    {
                        singleTile: true
                    });
                map.addLayer(selectedRegionLayer);
            }
        }
    });
    map.addControl(info);
    info.activate();
}

/***************************************************************\
*   Display a page of the list of regions for the specified type
\***************************************************************/
function showRegionsList(regionType, page) {
    $('#filtered-list').html('Loading...');
    var pageList = getPage(regionType, page);
    if (pageList == null) {
        // load the page
        var listUrl = baseUrl + "/proxy/regions?pageSize=60&page=" + page + "&type=" + regionType;
        $.getJSON(listUrl, function(data) {
            pageList = data.features;
            // add to cache
            addPage(regionType, pageList, page, data.total);

            displayRegionsList(regionType, page);

        }).error(function(data, textStatus) {
            $('#filtered-list').html("An error occurred: " + textStatus);
        });
    }
    else {
        displayRegionsList(regionType, page);
    }
}

/************************************************************************\
*   gets the list of regions of the specified type for the specified page
\************************************************************************/
function getPage(regionType, page) {
    var regionList = regionsList[regionType];
    if (regionList == undefined || regionList.pageMap == undefined || regionList.total == undefined) {
        return null;
    }
    var pageKey = "p" + page;
    var pageList = regionList.pageMap[pageKey];
    if (pageList == undefined) {
        return null;
    }
    else {
        return pageList;
    }
}

/************************************************************\
*   adds a page of regions to the cache
\************************************************************/
function addPage(regionType, pageList, page, total) {
    var regionList = regionsList[regionType];
    if (regionList == undefined) {
        regionList = {}
        regionsList[regionType] = regionList
    }
    regionList.total = total;  // should we check?
    if (regionList.pageMap == undefined) {
        regionList.pageMap = {}
    }
    var pageKey = "p" + page;
    regionList.pageMap[pageKey] = pageList;
}

/************************************************************\
*   show list of regions for the specified type
\************************************************************/
function displayRegionsList(regionType, page) {
    var list = getPage(regionType, page);
    var bieLink = bieUrl + layers[regionType].bieContext + "/";
    var snippet = "<table width='100%'>";
    $.each(list, function(index, value) {
        var link = "<a href='" + bieLink + value + "'>" + value + "</a> ";
        var nameHash = value.replace(/ /g,'_');
        var info = "<img id='" + nameHash + "' class='info' src='" + baseUrl + "/images/skin/information.png'/>";
        if ((index % 3) == 0) {
            snippet += "<tr><td>" + info + link + "</td>";
        }
        else if ((index % 3) == 1) {
            snippet += "<td>" + info + link + "</td>";
        }
        else {
            snippet += "<td>" + info + link + "</td></tr>";
        }
    });
    snippet += "</table>";

    snippet += buildPaginationLinks(regionType, page);

    $('#filtered-list').html(snippet);

    // add dialogs
    $('img.info').each(function() {
        $(this).click(function() {
            // get the region name
            var $a = $(this).next("a");
            var name = $a.html();
            var nameHash = name.replace(/ /g,'_');

            // create the dialog content
            var show = "<span class='pseudolink' id='" + nameHash + "-show'>Show on map</span> (clears other regions)<br/>";
            var add; // insert 'add' or 'remove' link depending on the selected state
            if ($(this).parent().hasClass('selected')) {
                add = "<span class='pseudolink' id='" + nameHash + "-remove'>Remove from map</span><br/>";
            }
            else {
                add = "<span class='pseudolink' id='" + nameHash + "-add'>Add to map</span><br/>";
            }
            var explore = "<a href='" + $a.attr('href') + "'>Explore</a>";

            // create the dialog
            var $dialog = $('<div>' + show + add + explore + '</div>')
                .dialog({autoOpen: false, width:250, height:120, resizable:false, title:name,  position: {
                        my: 'right',
                        at: 'left top',
                        of: $(this) }
                });

            // add the click handlers
            $('#' + nameHash + '-show').click(function(event) {
                $dialog.dialog('destroy');
                $dialog.remove();  // created elements must be removed from DOM so that subsequent handlers work
                showRegion(name);
            });
            $('#' + nameHash + '-add').click(function() {
                $dialog.dialog('destroy');
                $dialog.remove();
                addRegion(name);
            });
            $('#' + nameHash + '-remove').click(function() {
                $dialog.dialog('destroy');
                $dialog.remove();
                removeRegion(name);
            });

            // open the dialog
            $dialog.dialog('open');

            return false;
        });
    });

    // show the selected regions
    highlightSelectedRegionsInList(selectedRegions);
    
    initSearch();  // ?? where should this go ??

}

/************************************************************\
*   build the html to link to other pages of the regions list
\************************************************************/
function buildPaginationLinks(regionType, page) {
    // assume there must be at least one page in the cache
    var region = regionsList[regionType];

    // no nav needed if all regions < 1 page
    if (region.total <= pageSize) {
        return "";
    }

    var navHtml = "<div class='pageNav'><ul>";
    var pages = Math.ceil(region.total / pageSize);
    var func;

    // add previous link
    if (page > 0) {
        // add prev link
        func = "showRegionsList('" + regionType + "'," + (page - 1) + ")";
        navHtml += '<li class="active" onclick="' + func + '">« Previous</li>';
    }
    else {
        navHtml += '<li class="disable">« Previous</li>';
    }

    // add number links
    for (var i = 0; i < pages; i++) {
        // allow for big lists
        if (i % 25 == 24) {
            navHtml += '<br/>';
        }
        if (i == page) {
            navHtml += '<li class="current">' + i + '</li>';
        }
        else {
            func = "showRegionsList('" + regionType + "'," + i + ")";
            navHtml += '<li class="active" onclick="' + func + '">' + i + '</li>';
        }
    }

    // add next link
    if (page < pages - 1) {
        // add next link
        func = "showRegionsList('" + regionType + "'," + (page + 1) + ")";
        navHtml += '<li class="active" onclick="' + func + '">Next »</li>';
    }
    else {
        navHtml += '<li class="disable">Next »</li>';
    }

    return navHtml;
}

/************************************************************\
*   highlights the selected region in the region list
\************************************************************/
function highlightSelectedRegionsInList(regionNames) {
    // clear any that are currently selected
    $('td').removeClass('selected');
    if (regionNames != []) {
        $("td").filter(function(){
            return ($.inArray($(this).find('a').html(), regionNames)) > -1;
        }).addClass('selected');
    }
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
*   build the text for an info popup based on the feature info and the visible layer
\************************************************************/
function buildInfoText(payload, layer) {
    switch (layer.layer) {
        case 'states':
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName)) +
                    /*"<p style='display:none'>" + payload*/ "</p>";
        case 'lgas':
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    "<p>" +
                    (extractValue(payload,'type_2') != 'Unknown' ?
                            extractValue(payload,'type_2') + " in " + extractValue(payload, 'name_1') :
                            extractValue(payload,'name_1')) + "</p>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName)) +
                    /*"<p style='display:none'>" + payload +*/ "</p>";
        case 'ibras':
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName));
        case 'imcras':
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    "<p>"+extractValue(payload,'water_type') + "</p>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName));
        case 'nrms':
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    "<p>"+extractValue(payload,'nrm_body') +
                    " - "+extractValue(payload,'area_desc') + "</p>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName));
        case 'ger':
            //alert(payload);
            return "<h3>" + extractValue(payload, layer.displayName) + "</h3>" +
                    buildRegionLink(layer, extractValue(payload, layer.displayName));
        default:
            return "No info available";
    }

}

function buildRegionLink(layer, name) {
    // start directing some of the links to the new region pages
    if (name == 'South Australia') {
        return "<a href='" + baseUrl + "/" + layer.layer + "/" + name + "'>Explore region</a>"
    }
    else {
        return "<a href='" + bieUrl + layer.bieContext + "/" + name + "'>Explore region</a>"
    }
}

/************************************************************\
*   extract the value of the specified tag from the feature info
\************************************************************/
function extractValue(payload, tag) {
    var nameTag = tag + ' = ';
    var nameStart = payload.indexOf(nameTag);
    var nameEnd = payload.indexOf('\n',nameStart);
//    alert('start=' + nameStart + ' end=' + nameEnd);
    if (nameStart > -1) {
        return payload.substring(nameStart + nameTag.length, nameEnd);
    } else {
        return payload;
    }
}

/************************************************************\
*   handle filter button click
\************************************************************/
function toggleButton(button) {
    // if already selected do nothing
    if ($(button).hasClass('selected')) {
        return;
    }

    // re-configure the display
    selectRegionType(button.id, true);
}

/************************************************************\
*   change display to the specified region type
\************************************************************/
function selectRegionType(type, clearRegions) {

    // de-select all buttons
    $('div.filter-buttons div').toggleClass('selected',false);

    // select the button that was clicked
    $('div#'+type).toggleClass("selected", true);

    if (clearRegions) {
        // clear any selected regions
        clearSelectedRegions();
        hideInfoPanel();
    }

    clearSearchInput();

    // show the selected layer
    window[type].setVisibility(true);

    // zoom out for marine regions
    if (type == 'imcras') {
        map.zoomTo(3);
    } else {
        map.zoomTo(4);
    }

    // hide others
    $.each(layers, function(index, value) {
        if (value.layer != type) {
            window[value.layer].setVisibility(false);
        }
    });

    // update the regions list to new type at first page
    showRegionsList(type, 0);

    // store last selected region type in cookie
    //$.cookie('region_type',type);
    $.bbq.pushState({'region_type':type});

    initSearch();
}

function addRegion(regionName) {
    displayRegion(regionName);
}

function removeRegion(regionName) {
    removeFromSelectedRegions(regionName);
    displayRegion(selectedRegions);
}

function showRegion(regionName) {
    clearSelectedRegions();
    displayRegion(regionName);
    showMap();
}

function getSelectedFilter() {
    return $('div.selected').attr('id') ? $('div.selected').attr('id') : 'ger';
}

function getSelectedLayer() {
    return layers[getSelectedFilter()];
}

function hideInfoPanel() {
    $('#selectedRegion').filter(':visible').hide("slide", { direction: "up" });
}

function showInfoPanel() {
    $('#selectedRegion').filter(':hidden').show('slide',{direction: 'up'});
}

function clearSelectedRegions() {
    removeSelectedLayer();
    emptySelectedRegions();
    $("#filtered-list td").removeClass('selected');
}

function removeSelectedLayer() {
    if (selectedRegionLayer != undefined) {
        selectedRegionLayer.destroy();
    }
}

/* MAP - LIST tabbing   */
function showList() {
    $('div#map').animate({
        left: -$('div#map').outerWidth()},
        {duration: "slow"}
    );
    $('div#showList').animate({
        left: 0},
        {duration: "slow"}
    );
    // change the button text
    changeTabText('Map');
    // set url
    $.bbq.pushState({'view':'list'});
    // set cookie for list view
    //$.cookie('tab_state', 'list');
}
function showMap() {
    $('div#showList').animate({
        left: $('div#showList').outerWidth()},
        {duration: "slow"}
    );
    $('div#map').animate({
        left: 0},
        {duration: "slow"}
    );
    // change the button text
    changeTabText('List');
    // set url
    $.bbq.removeState('view');
    // set cookie for map view
    //$.cookie('tab_state', 'map');
}

/************************************************************\
*   change the tab slider button text
\************************************************************/
function changeTabText(newText) {
    if (arguments.length == 0) {
        // treat as a toggle
        newText = $("#listMapLink").html();
    }

    // fade out and change the text when faded
    $("#listMapButton").fadeOut('slow', function() {
        // Animation complete
        $("#listMapLink").html(newText);
    });

    // fade back in
    $("#listMapButton").fadeIn('slow');

}

function initTabbing() {
    // animate the transition from map to list
    $("#listMapButton").click(function(e) {
        // move the tabs
        var spanText = $("#listMapLink").html();
        if (spanText == 'Map') {
            showMap();
        } else {
            showList();
        }
    });

    // page load - detect if list is requested via cookies or location hash
    if ($.bbq.getState('view') == 'list') {
        $("div#map").css("left", -$('div#showList').outerWidth());
        $("div#showList").css("left", 0);
        $("#listMapLink").html('Map');
    }
}

function clearSearchInput() {
    $('#regionSearch').attr('value','');
}

function displayRegion(regionName) {
    removeSelectedLayer();
    var layer = getSelectedLayer();
    if (regionName instanceof Array) {

        // just clean up if the list is empty
        if (regionName.length == 0) {
            hideInfoPanel();
            highlightSelectedRegionsInList(selectedRegions);
            return;
        }

        // set the whole list to regionName
        setSelectedRegions(regionName);
    }
    else {
        // append to selected regions
        addToSelectedRegions(regionName);
    }

    // highlight in list
    highlightSelectedRegionsInList(selectedRegions);

    // show in info panel
    if (selectedRegions.length > 1) {
        $('#selectedRegion').html("<h3>Multiple regions</h3>" + selectedRegions.join(", "));
    }
    else {
        $('#selectedRegion').html("<h3>" + selectedRegions[0] + "</h3>" + buildRegionLink(layer, selectedRegions[0]));
    }
    showInfoPanel();

    // create and show in map layer
    var filter = "";
    $.each(selectedRegions, function(index, value) {
        if (filter != "") {
            filter += " OR ";
        }
        filter += layer.displayName + " EQ '" + value + "'";
    });
    selectedRegionLayer = new OpenLayers.Layer.WMS(
        "Aus selected",
        "http://spatial.ala.org.au/geoserver/ALA/wms", // gwc doesn't support cql filters
        {
            layers: 'ALA:' + layer.name,
            transparent: "true",
            CQL_FILTER: filter,
            format: overlayFormat,
            "version": "1.1.1",
            styles: 'polygon'
            //SLD: 'http://woodfired.ala.org.au:8070/pt/gis/sel_style.sld'
            //SLD_BODY: theSLD_BODY
        });
    map.addLayer(selectedRegionLayer);
}

function setHash(key, value) {
    $.bbq.pushState(key + "=" + value);
}

function initSearch() {
    $( "#regionSearch" ).autocomplete({
		source: baseUrl + "/proxy/regionSearch.json?type=" + getSelectedFilter(),
        minLength: 2,
        select: function(event, ui) {
            displayRegion([ui.item.value]);
            $("#regionSearch").val("");
            return false;
        }
	});

    /*$("#regionSearch").bind('autocompleteselect', function(event, ui) {
        displayRegion(ui.item.value);
    });
*/
}

function initHelp() {
    $('#showHelp').click(function() {
        var height = $('#mainHelp').css('height');
        $('#mainHelp').animate({height: height == '0px' ? 280 : 0}, 'slow');
        $('#showHelp').html(height == '0px' ? "Hide help" : "Show me how");
        return false;
    });
}

function loadSelectedRegionsFromCookie() {
    var regions = $.bbq.getState('regions');
    if (regions) {
        var list = decodeURI(regions).split(',');
        displayRegion(list);
    }
    else {
        hideInfoPanel();
    }
}

function init(serverUrl) {
    // serverUrl is the base url for the site eg http://collections.ala.org.au in production
    // cannot use relative url as the context path varies with environment
    baseUrl = serverUrl;

    initMap();

    startingType = $.bbq.getState('region_type') ? $.bbq.getState('region_type') : 'states';

    selectRegionType(startingType, false);

    loadSelectedRegionsFromCookie();

    initTabbing();

    initHelp();
}

/*  DEV stuff */
function showMulti() {
    clearSelectedRegions();
    var layer = layers['ibras'];
    selectedRegionLayer = new OpenLayers.Layer.WMS(
        "Aus selected",
        "http://spatial.ala.org.au/geoserver/ALA/wms", // gwc doesn't support cql filters
        {
            layers: 'ALA:' + layer.name,
            transparent: "true",
            CQL_FILTER: layer.displayName + " EQ 'Gibson Desert' OR " + layer.displayName + " EQ 'Great Sandy Desert' OR " +
            layer.displayName + " EQ 'Little Sandy Desert' OR " + layer.displayName + " EQ 'Great Victoria Desert'",
            format: overlayFormat,
            "version": "1.1.1",
            styles: 'polygon'
            //SLD: 'http://woodfired.ala.org.au:8070/pt/gis/sel_style.sld'
            //SLD_BODY: theSLD_BODY
        });
    map.addLayer(selectedRegionLayer);
}

function showGer() {
    selectRegionType('ger', true);
}

function examine(obj) {
    var $dialog = $('<div>' + inspect(obj) + '</div>')
        .dialog({close: function() {$dialog.dialog('destroy')} });
}

function inspect(obj, maxLevels, level) {
  var str = '', type, msg;

    // Start Input Validations
    // Don't touch, we start iterating at level zero
    if(level == null)  level = 0;

    // At least you want to show the first level
    if(maxLevels == null) maxLevels = 1;
    if(maxLevels < 1)
        return '<font color="red">Error: Levels number must be > 0</font>';

    // We start with a non null object
    if(obj == null)
    return '<font color="red">Error: Object <b>NULL</b></font>';
    // End Input Validations

    // Each Iteration must be indented
    str += '<ul>';

    // Start iterations for all objects in obj
    for(property in obj)
    {
      try
      {
          // Show "property" and "type property"
          type =  typeof(obj[property]);
          str += '<li>(' + type + ') ' + property +
                 ( (obj[property]==null)?(': <b>null</b>'):(': ' + obj[property])) + '</li>';

          // We keep iterating if this property is an Object, non null
          // and we are inside the required number of levels
          if((type == 'object') && (obj[property] != null) && (level+1 < maxLevels))
          str += inspect(obj[property], maxLevels, level+1);
      }
      catch(err)
      {
        // Is there some properties in obj we can't access? Print it red.
        if(typeof(err) == 'string') msg = err;
        else if(err.message)        msg = err.message;
        else if(err.description)    msg = err.description;
        else                        msg = 'Unknown';

        str += '<li><font color="red">(Error) ' + property + ': ' + msg +'</font></li>';
      }
    }

      // Close indent
      str += '</ul>';

    return str;
}