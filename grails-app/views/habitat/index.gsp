<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="layout" content="${grailsApplication.config.skin.layout?:'main'}"/>
    <title>Habitats | ${grailsApplication.config.orgNameLong}</title>
    <r:require modules="regions,leaflet"/>
    <style type="text/css">
    .habitatNode  { cursor: pointer; cursor: hand; }
    .selectedNode {  font-weight: bold; }
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
        margin-left:2px;
        margin-right:2px;
        opacity:1;
        filter:alpha(opacity=100);
    }
    .leaflet-control-layers-overlays label span { font-size: 12px; }
    </style>
</head>
<body class="nav-locations">
<div class="row-fluid">
    <div class="span12">
        <ul class="breadcrumb">
            <rg:breadcrumbTrail/>
            <li class="active">Habitats</li>
        </ul>
    </div>
</div>

<div class="row-fluid" style="margin-top:10px;">
    <div class="span4">
        <h1>Select a habitat to explore</h1>
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
    <div class="span8" id="rightPanel">
        <div class="actions pull-right">
            <a id="viewRecordsLink" class='btn hide' href='#'><i class="icon icon-list"></i> View records</a>
        </div>
        <span id="click-info"><i class="fa fa-info-circle"></i> Select a habitat from the tree to view on map.</span>
        <a id="selected-habitat" class='btn hide' href='#'> View habitat</a>
        <div id="map-canvas" style="width:100%; height:600px; margin-top:10px;">
        </div>
    </div>
</div>

<r:script>
    var REGION_CONF = {
        server: '${grailsApplication.config.grails.serverURL}',
        spatialService: "${grailsApplication.config.layersService.baseURL}/",
        spatialWms: "${grailsApplication.config.geoserver.baseURL}/ALA/wms?",
        spatialCache: "${grailsApplication.config.geoserver.baseURL}/ALA/wms?",
        accordionPanelMaxHeight: '${grailsApplication.config.accordion.panel.maxHeight}',
        mapBounds: JSON.parse('${grailsApplication.config.map.bounds?:[]}'),
        mapHeight: '${grailsApplication.config.map.height}',
        mapContainer: 'map_canvas'
    };
</r:script>

<r:script>

    var colours = [
        "0xFF0000","0x0000FF",
        "0x0000A0","0xFFA500",
        "0x800080","0xA52A2A",
        "0xFFFF00","0x800000",
        "0x00FF00","0x008000",
        "0xFF00FF","0x808000"
    ]

    var recordsUrl = "${createLink(controller:'habitat', action:'viewRecords')}/";
    var regionUrl = "${createLink(mapping: 'habitatByFeature')}";

    var HABITAT_MAP = { map: null, activeLayers: {}, habitatTree: null, layerControl: null };

    var mapBounds = JSON.parse('${grailsApplication.config.map.bounds?:[]}');
    var mapHeight = '${grailsApplication.config.map.height}';
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

        console.log('Pushing selected habitat: ' + selectedHabitatName + " with ID " + $habitatNode.data('id'))

        numericIDs.push({ id: $habitatNode.data('rasterid'), name: $habitatNode.data('name') });

        var $childNodes = $habitatNode.find('li.habitatNode');

        console.log('Child nodes: ' + $childNodes.length);

        $.each($childNodes, function( index, value ) {

            var numericID = $(value).data('rasterid');
            var habitatName = $(value).data('name');

            console.log('Found numeric ID: ' + numericID + " for name " + habitatName);
            if(!isNaN(numericID)){
                numericIDs.push({id: numericID, name: habitatName})
            }
        });

        return numericIDs;
    }

    function resetMap(){

        $.each(HABITAT_MAP.activeLayers, function(index, layer){
            HABITAT_MAP.map.removeLayer(layer);
            HABITAT_MAP.layerControl.removeLayer(layer);
        });

        HABITAT_MAP.activeLayers = [L.tileLayer.wms(REGION_CONF.spatialWms, {
            layers: 'ALA:eunis_land_cover_scotland',
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

       var sld_head =  '<?xml version="1.0" encoding="UTF-8"?>'+
            '<StyledLayerDescriptor xmlns="http://www.opengis.net/sld">'+
                '<NamedLayer>'+
                    '<Name>ALA:${config.layerName}</Name>'+
                    '<UserStyle>'+
                        '<FeatureTypeStyle>'+
                            '<Rule>'+
                                '<RasterSymbolizer>'+
                                '<Geometry />'+
                                    '<ColorMap>';
        var sld = sld_head;
        sld = sld + addColorFrag(numericHabitatID, colour);
        var sld_tail =  '</ColorMap>'+
                                '</RasterSymbolizer>'+
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
</r:script>


<r:script>

    $(function(){

        $( ".habitatNode" ).click(function(event) {

            var $this = $(this);

            $('.habitatNode').removeClass('selectedNode');

            $this.addClass('selectedNode');

            if($this.hasClass('habitatRootNode')){
                //hide any visible subtrees
                $('.subTree').hide();
            }

            //show subtrees
            $this.find('.subTree').show();

            $('#viewRecordsLink').attr('href', recordsUrl + $this.data('id'));
            $('#viewRecordsLink').show();

            $('#click-info').hide();

            //set title
            $('#selected-habitat').html($this.data("name"))
            $('#selected-habitat').attr('href', regionUrl + '/' +  $this.data("pid"));
            $('#selected-habitat').show();

            $.each(HABITAT_MAP.activeLayers, function(index, layer){
                HABITAT_MAP.map.removeLayer(layer);
                HABITAT_MAP.layerControl.removeLayer(layer);
            });

            HABITAT_MAP.activeLayers = [];

            //get the child IDs
            var numericIDs = getNumericIDs(this);

            //add a layer for each
            for(var i = 0; i < numericIDs.length; i++){

                var selectedColour = colours[i % colours.length];

                var newLayer = L.tileLayer.wms(REGION_CONF.spatialWms, {
                    layers: 'ALA:${config.layerName}',
                    format: 'image/png',
                    transparent: true,
                    version: '1.1.0',
                    attribution: "myattribution",
                    sld_body: getSLD(numericIDs[i].id, selectedColour)
                });

                HABITAT_MAP.activeLayers.push(newLayer);
                HABITAT_MAP.layerControl.addOverlay(newLayer,
                    '<i class="legendColour" style="background-color:#' + selectedColour.substring(2) + ';"></i>&nbsp;' + numericIDs[i].name);
                newLayer.addTo(HABITAT_MAP.map);
            }

            //open layer control to show the various layers
            $(".leaflet-control-layers").addClass("leaflet-control-layers-expanded");

            event.stopPropagation();
        });
    });

</r:script>
</body>

</html>