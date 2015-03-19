<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="layout" content="${grailsApplication.config.layout.skin?:'main'}"/>
    <title>Regions | Atlas of Living Australia</title>
    <script src="${g.createLink(controller: 'data',action: 'regionsMetadataJavascript')}"></script>
    <r:require modules="regions"/>

</head>
<body class="nav-locations">
<div class="row">
    <div class="span12">
        <ul class="breadcrumb">
            <rg:breadcrumbTrail/>
            <li class="active">Regions</li>
        </ul>
    </div>
</div>

<div class="row">
    <div class="span12">
        <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
        </g:if>

        <h1>Select a region to explore</h1>

        <p>Select the type of region on the left. Click a name or click on the map to select a region.
        Use map controls or shift-drag with your mouse to zoom the map.<br/>
        Click the region button
        to explore occurrence records, images and documents associated with the region.
        </p>

    </div>
</div>

<div class="row">
    <div class="span4">
        <p style="font-size:15px;margin-left:15px;padding-bottom:0"><i class="fa fa-info-circle"></i> Click on a region name to select an area.</p>
        <div id="accordion">
            <h2><a href="#">States and territories</a></h2>
            <div id="states"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Local government</a></h2>
            <div id="lgas"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Biogeographic regions</a></h2>
            <div id="ibras"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Marine regions</a></h2>
            <div id="imcras"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Management regions</a></h2>
            <div id="nrms"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Indigenous protected areas</a></h2>
            <div id="ipa_7aug13"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Indigenous land use agreements</a></h2>
            <div id="ilua"><span class="loading">Loading..</span>
            </div>
            <h2><a href="#">Other regions</a></h2>
            <div id="other"><span class="loading">Loading..</span>
            </div>
        </div>
    </div>

    <div class="span8" id="rightPanel">
            <span id="click-info"><i class="fa fa-info-circle"></i> Click on the map to select an area.</span>
            <span class="btn" id="reset-map"><i class="fa fa-refresh"></i> Reset map</span>
            <div id="map">
                <div id="map-container">
                    <div id="map_canvas"></div>
                </div>
                <div id="controls">

                    <div>
                        <div class="tish">
                            <label class="checkbox" for="toggleLayer">
                                <input type="checkbox" name="layer" id="toggleLayer" value="1" checked/>
                                All regions</label></div>

                        <div id="layerOpacity"></div>
                    </div>

                    <div>
                        <div class="tish">
                            <label class="checkbox" for="toggleRegion">
                                <input type="checkbox" name="region" id="toggleRegion" value="1" checked disabled/>
                                Selected region</label></div>

                        <div id="regionOpacity"></div>
                    </div>
                </div>
            </div><!--close map-->
        </div>
</div>

<r:script>
    var altMap = true;
    $(function() {

        $('#dev-notes').dialog({autoOpen: false, show: 'blind', hide: 'blind'});
        $('#dev-notes-link').click(function() {
            $('#dev-notes').dialog('open');
            return false;
        });

        init_regions({
            server: '${grailsApplication.config.grails.serverURL}',
            spatialService: "${grailsApplication.config.spatial.baseURL}/layers-service",
            spatialWms: "${grailsApplication.config.spatial.baseURL}/geoserver/ALA/wms?",
            spatialCache: "${grailsApplication.config.spatial.baseURL}/geoserver/gwc/service/wms?",
            accordionPanelMaxHeight: '${grailsApplication.config.accordion.panel.maxHeight}',
            mapBounds: JSON.parse('${grailsApplication.config.map.bounds?:[]}'),
            mapHeight: '${grailsApplication.config.map.height}',
            mapContainer: 'map_canvas'
        });
    })
</r:script>
</body>
</html>