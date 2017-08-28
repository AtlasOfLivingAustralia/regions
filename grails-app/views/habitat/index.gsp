%{--<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>--}%
<!DOCTYPE html>
<html>
<head>
    <meta name="breadcrumbParent" content="${grailsApplication.config.breadcrumbParent}"/>
    <meta name="breadcrumb" content="Habitats"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="layout" content="${grailsApplication.config.getProperty('skin.layout') ?: 'main'}"/>
    <title>Habitats | ${grailsApplication.config.orgNameLong}</title>

    <asset:javascript src="application"/>
    <asset:stylesheet src="application"/>
    %{--<asset:javascript src="regions_app" asset-defer="true" />--}%
    %{--<asset:javascript src="region_page" asset-defer="true" />--}%

    <asset:javascript src="leaflet"/>
    <asset:stylesheet src="leaflet"/>

    <style type="text/css">
    .habitatNode {
        cursor: pointer;
    }

    .fa {
        padding-right: 10px;
    }

    .fa-circle {
        font-size: 8px;
        position: relative;
        top: -2px;
    }

    .selectedNode {
        font-weight: bold;
    }

    i.legendColour {
        -webkit-background-clip: border-box;
        -webkit-background-origin: padding-box;
        -webkit-background-size: auto;
        background-attachment: scroll;
        background-clip: border-box;
        background-image: none;
        background-origin: padding-box;
        background-size: auto;
        display: inline-block;
        height: 12px;
        line-height: 12px;
        width: 14px;
        margin-bottom: -5px;
        margin-left: 2px;
        margin-right: 2px;
        opacity: 1;
        filter: alpha(opacity=100);
    }

    .leaflet-control-layers-overlays label span {
        font-size: 12px;
    }
    </style>
</head>

<body class="nav-locations">

<div class="row" style="margin-top:10px;">
    <div class="col-md-4">
        <h2>Select a habitat to explore</h2>
        <ul id="habitatTree"></ul>

        <hab:habitatTree />

        <div class="well" style="margin-top:20px;">
            <h4>About these habitats</h4>

            <p>
                ${config.description}
                <br/>
                <a href="${config.metadataLink}">View metadata</a>
            </p>
        </div>

    </div>

    <div class="col-md-8" id="rightPanel">
        <div class="actions pull-right">
            <a id="viewRecordsLink" class='btn hide' href='#'><i class="fa fa-share-square-o"></i> View Records</a>
        </div>
        <span id="click-info"><i class="fa fa-info-circle"></i> Select a habitat from the tree to view on map.</span>
        <a id="selected-habitat" class='btn hide' href='#'>View habitat</a>

        <div id="map-canvas" style="width:100%; height:600px; margin-top:10px;">
        </div>
    </div>
</div>

<asset:script type="text/javascript">

    var REGION_CONF = {
        server: '${grailsApplication.config.grails.serverURL}',
        spatialService: "${grailsApplication.config.layersService.baseURL}/",
        spatialWms: "${grailsApplication.config.geoserver.baseURL}/ALA/wms?",
        spatialCache: "${grailsApplication.config.geoserver.baseURL}/ALA/wms?",
        accordionPanelMaxHeight: '${grailsApplication.config.accordion.panel.maxHeight}',
        mapBounds: JSON.parse('${grailsApplication.config.getProperty('map.bounds')?.size() > 2 ? grailsApplication.config.getProperty('map.bounds') : "[-44, 112, -9, 154]"}'), // Note: map.bounds is a string NOT a List
        mapHeight: '${grailsApplication.config.map.height}',
        mapContainer: 'map_canvas',
        biocacheUrl: '${grailsApplication.config.getProperty('biocache.baseURL')}',
        layerField: 'cl1918'
    };

    var colours = [
        "0xFF0000","0x0000FF",
        "0x0000A0","0xFFA500",
        "0x800080","0xA52A2A",
        "0xFFFF00","0x800000",
        "0x00FF00","0x008000",
        "0xFF00FF","0x808000"
    ]

     var recordsUrl = "${createLink(controller: 'habitat', action: 'viewRecords')}/";
     var regionUrl = "${createLink(controller: 'habitat', action: 'index')}";

    var HABITAT_MAP = { map: null, activeLayers: {}, habitatTree: null, layerControl: null };

    var mapBounds = REGION_CONF.mapBounds;
    var mapHeight = REGION_CONF.mapHeight;
    HABITAT_MAP.map = L.map('map-canvas');
    HABITAT_MAP.map .fitBounds([
        [mapBounds[0], mapBounds[1]],
        [mapBounds[2], mapBounds[3]]
    ]);

    L.tileLayer('http://a.tiles.mapbox.com/v3/nickdos.kf2g7gpb/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(HABITAT_MAP.map);

    function addColorFrag(numericID, colour){
      return '<ColorMapEntry color="0xFFFFFF" opacity="0.0" quantity="'+ (numericID-1)+'"/>'+
            '<ColorMapEntry color="' + colour + '" opacity="0.7" quantity="' + numericID+ '"/>'+
            '<ColorMapEntry color="0xFFFFFF" opacity="0.0" quantity="'+ (numericID+1)+'"/>';
    }

    /**
     * Takes a value like "A1.2" -> [1,33,11] which are values used in the raster.
     */
    function getNumericIDs(habitatNode){

        //get child IDs ?
        var numericIDs = [];

        var $habitatNode = $(habitatNode);

        var selectedHabitatName = $habitatNode.data('name');

        //console.log('Pushing selected habitat: ' + selectedHabitatName + " with ID " + $habitatNode.data('id'))

        if ($habitatNode.data('rasterid')) {
            numericIDs.push({ id: $habitatNode.data('rasterid'), name: $habitatNode.data('name') });
        }

        var $childNodes = $habitatNode.find('li.habitatNode');

        //console.log('Child nodes: ' + $childNodes.length);

        $.each($childNodes, function( index, value ) {

            var numericID = $(value).data('rasterid');
            var habitatName = $(value).data('name');

            //console.log('Found numeric ID: ' + numericID + " for name " + habitatName);
            if(numericID){
                numericIDs.push({id: numericID, name: habitatName})
            }
        });

        return numericIDs;
    }

    function getSearchValue(habitatNode){

        //get child IDs ?
        var searchValue = '';

        var $habitatNode = $(habitatNode);

        var selectedHabitatName = $habitatNode.data('name');

        //console.log('Pushing selected habitat: ' + selectedHabitatName + " with ID " + $habitatNode.data('id'))

        var prefix = $habitatNode.data('name')

        var $childNodes = $habitatNode.find('li.habitatNode');

        //console.log('Child nodes: ' + $childNodes.length);

        if($childNodes.length > 0) {
            $.each($childNodes, function( index, value ) {
                searchValue = newSearchValue(searchValue, value)
            });
        } else {
            searchValue = newSearchValue(searchValue, $habitatNode)
        }

        return searchValue;
    }

    function newSearchValue(searchValue, value) {
        var numericID = $(value).data('rasterid');
        var habitatName = $(value).data('name');

        //console.log('Found numeric ID: ' + numericID + " for name " + habitatName);
        if(numericID){

            var parent = $(value).parent().parent();
            while ($(parent).data('name')) {
                habitatName = $(parent).data('name') + ' ' + habitatName
                parent = $(parent).parent().parent();
            }

            if (searchValue.length == 0) {
                searchValue = '"' + habitatName + '"'
            } else {
                searchValue += ' OR "' + habitatName + '"'
            }

        }

        return searchValue
    }

    function getName(habitatNode){

            var numericID = $(habitatNode).data('rasterid');
            var habitatName = $(habitatNode).data('name');

            //console.log('Found numeric ID: ' + numericID + " for name " + habitatName);
            if(numericID){

                var parent = $(habitatNode).parent().parent();
                while ($(parent).data('name')) {
                    habitatName = $(parent).data('name') + ' ' + habitatName
                    parent = $(parent).parent().parent()
                }

                return habitatName
            }
    }

    function resetMap(){

        $.each(HABITAT_MAP.activeLayers, function(index, layer){
            HABITAT_MAP.map.removeLayer(layer);
            HABITAT_MAP.layerControl.removeLayer(layer);
        });

        HABITAT_MAP.activeLayers = [L.tileLayer.wms(REGION_CONF.spatialWms, {
            layers: 'ALA:${config.layerName}',
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            attribution: "myattribution"
        })];

        HABITAT_MAP.activeLayers.push(HABITAT_MAP.activeLayers[0]);
        HABITAT_MAP.activeLayers[0].addTo(HABITAT_MAP.map);
    }

    /**
     * Generates an SLD.
     *
     * @param numericHabitatID
     * @param colour
     * @returns {string}
     */
    function getSLD(numericHabitatID, colour){
        var colourMap = []
        $.getJSON(REGION_CONF.spatialService + '/object/' + numericHabitatID, function( data ) {
            //return decodeURIComponent(sld.replace("color%3D%220xff0000", "color%3D%22" + colour)).replace(/.*sld_body=(.*)/,'$1').replace('+', ' ')

            var sld = data.wmsurl
            sld = sld.replace(/color%3D%220xff0000/g, "color%3D%22" + colour)

            $.each(sld.replace(/.*%3CColorMap%3E(.*?)%3C%2FColorMap%3E.*/g, '$1').split('%3CColorMapEntry+'), function(i, v) {
                var quantity = Number(v.replace(/.*quantity%3D%22([\-0-9]*).*/, '$1'))
                var opacity = Number(v.replace(/.*opacity%3D%22([0-9\.]*).*/, '$1'))

                if (v.length > 0) {
                    colourMap.push({ quantity: quantity, inArea: opacity > 0, data: v })
                }
            });

            colourMap
          });

        return colourMap
    }

//   $( "<ul/>", {
//     "class": "my-new-list",
//     html: items.join( "" )
//   }).appendTo( "body" );
// });

    function fillSld(sldItems) {
       var sld_head =  '<?xml version="1.0" encoding="UTF-8"?>'+
            '<StyledLayerDescriptor xmlns="http://www.opengis.net/sld">'+
'<NamedLayer>'+
'<Name>ALA:${config.layerName}</Name>'+
'<UserStyle>'+
'<FeatureTypeStyle>'+
'<Rule>'+
'<RasterSymbolizer>'+
'<Geometry/><ColorMap>';
var sld = sld_head;
sld = sld + decodeURIComponent('%3CColorMapEntry+' + sldItems.join('%3CColorMapEntry+')).replace(/\+/g, ' ')
var sld_tail = '</ColorMap></RasterSymbolizer>'+
'</Rule>'+
'</FeatureTypeStyle>'+
'</UserStyle>'+
'</NamedLayer>'+
'</StyledLayerDescriptor>';
       sld = sld + sld_tail;
       return sld;
    }

    HABITAT_MAP.layerControl = L.control.layers({},null,{collapsed:true});
    HABITAT_MAP.layerControl.addTo(HABITAT_MAP.map);


    $(function(){

        $( ".habitatNode" ).click(function(event) {
            event.stopPropagation();

            var $this = $(this);

            $('.habitatNode').removeClass('selectedNode');

            $this.addClass('selectedNode');

            // if($this.hasClass('habitatRootNode')){
                //hide any visible subtrees
                $('.subTree').hide();
                $('.fa-chevron-right').show();
                $('.fa-chevron-down').hide();
            // }

            //show subtrees
            $this.children('.subTree').show();
            $this.children('.fa-chevron-right').hide();
            $this.children('.fa-chevron-down').show();
            var parent = $this.parent('.subTree').parent();
            while(parent.children('.subTree').length > 0) {
                parent.children('.subTree').show();
                parent.children('.fa-chevron-right').hide();
                parent.children('.fa-chevron-down').show();
                parent = parent.parent('.subTree').parent();
            }

            $('#viewRecordsLink').removeClass('hide');

            $('#click-info').hide();

            //set title
            $('#selected-habitat').html(getName(this))
            $('#selected-habitat').attr('href','');
            $('#selected-habitat').show();
            $('#selected-habitat').removeClass('hide')

            $.each(HABITAT_MAP.activeLayers, function(index, layer){
                HABITAT_MAP.map.removeLayer(layer);
                HABITAT_MAP.layerControl.removeLayer(layer);
            });

            HABITAT_MAP.activeLayers = [];

            $.ajaxSetup({ async: false });

            //get the child IDs
            if ($(this).children('.subTree')[0]) {
                $.each($(this).children('.subTree')[0].children, function (idx, v) {
                    addLayer(v, colours[idx % colours.length]);
                })
            } else {
                addLayer(this, colours[0]);
            }

            //open layer control to show the various layers
            $(".leaflet-control-layers").addClass("leaflet-control-layers-expanded");

            $("#viewRecordsLink").attr('href', REGION_CONF.biocacheUrl + '/occurrences/search?q=' + encodeURIComponent(REGION_CONF.layerField + ':(' + getSearchValue($this) + ')'));

            $.ajaxSetup({ async: false });
        });
    })

    function addLayer(v, selectedColour) {
        var numericIDs = getNumericIDs(v);
        var group = []
        var sldItems = []

        //add a layer for each
        for(var i = 0; i < numericIDs.length; i++){
            var name = numericIDs[i].name;

            $.each(getSLD(numericIDs[i].id, selectedColour), function(i, v) {
                sldItems.push(v);
            });
        }

        sldItems.sort(function(a, b) {
            if (isNaN(a.quantity) && isNaN(b.quantity)) {
                return 0;
            } else if (isNaN(a.quantity)) {
                return -1;
            } else if (isNaN(b.quantity)) {
                return 0;
            } else if (a.quantity < b.quantity) {
                return -1
            } else if (a.quantity > b.quantity) {
                return 1;
            } else if (a.isArea) {
                return -1;
            } else if (b.isArea) {
                return 1;
            } else {
                return 0;
            }
        });

        var uniqueSldItems = []
        for (var j = 0;j<sldItems.length; j++) {
            if (j == 0 || sldItems[j].quantity != sldItems[j-1].quantity) {
                uniqueSldItems.push(sldItems[j].data);
            }
        }

        var completeSld = fillSld(uniqueSldItems)

        // $.getJSON(REGION_CONF.spatialService + '/object/' + numericIDs[i].id, function( data ) {
        //     var sld = decodeURIComponent(data.wmsurl.replace(/color%3D%220xff0000/g, "color%3D%22" + selectedColour)).replace(/.*sld_body=(.*)/,'$1').replace(/\+/g, ' ')

            var newLayer = L.tileLayer.wms(REGION_CONF.spatialWms, {
                    layers: 'ALA:${config.layerName}',
                    format: 'image/png',
                    transparent: true,
                    version: '1.1.0',
                    attribution: "myattribution",
                    sld_body: completeSld
                });

                group.push(newLayer)

            // });
        // }

        var groupLayer = L.layerGroup(group);
        HABITAT_MAP.activeLayers.push(groupLayer);
        HABITAT_MAP.layerControl.addOverlay(groupLayer,
            '<i class="legendColour" style="background-color:#' + selectedColour.substring(2) + ';"></i>&nbsp;' + $(v).attr('data-name'));
        groupLayer.addTo(HABITAT_MAP.map);
    }
</asset:script>

</body>

</html>