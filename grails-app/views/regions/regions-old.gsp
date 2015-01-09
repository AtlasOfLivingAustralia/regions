<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="main" />
        <title>Regions | Atlas of Living Australia</title>
        <r:require modules="regions"/>
        <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
        <g:javascript src="keydragzoom.js" />
        <g:javascript src="wms.js" />
        <g:javascript src="jquery.cookie.js" />
        <script type="text/javascript">
        </script>
        <script src="${ConfigurationHolder.config.grails.serverURL}/data/regionsMetadataJavascript.js"></script>
        <g:javascript src="regions.js" />
        %{--<g:javascript library="datadumper" />--}%
        <script type="text/javascript">
          var altMap = true;
          $(document).ready(function() {
            $('#dev-notes').dialog({autoOpen: false, show: 'blind', hide: 'blind'});
            $('#dev-notes-link').click(function() {
                $('#dev-notes').dialog('open');
                return false;
            });
            //greyInitialValues();
          });
        </script>
        <g:javascript src="jquery.ba-bbq.min.js" />
    </head>
    <body class='regions'>
    <div id="content" class="clearfix inner">
      <div id="header">
        <!--Breadcrumbs-->
        <nav id="breadcrumb"><ol>
          <rg:breadcrumbTrail/>
          <li class="last">Regions</li></ol></nav>
        <div class="section full-width">
          <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
          </g:if>
          <header class="hrgroup">
            <h1>Select a region to explore</h1>
            <p>Select the type of region on the left. Click a name or click on the map to select a region.
            Use map controls or shift-drag with your mouse to zoom the map. Click the region link
            to explore occurrence records, images and documents associated with the region.
            </p>
          </header><!--close hrgroup-->
        </div><!--close section-->
      </div><!--close header-->

      <div class="map-alt"><!-- wrap map and list-->

        <div id="column-one" class="fudge" style="float:left;">
          <p style="font-size:15px;margin-left:15px;padding-bottom:0">Click on a region name to select an area.</p>
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
          </div><!--close accordion-->
          %{--<div style="clear:both;" class='region-search'>
            <label for="regionSearch">Type any part of a region's name and select from the list: </label><br/>
	        <input id="regionSearch">
          </div>--}%
        </div><!--close column-one-->

        <div id='right-side'>
            <div>
                <div>
                    <span id="click-info">Click on the map to select an area.</span>
                    <span style="float:right;" id="reset-map">Reset map</span>
                </div>
            </div>
            <div id="mapListOuter" style="height:560px;width:650px;position:relative;overflow:hidden;">
                <div id="map" style="left:0;position:absolute;top:0;width:650px;">
                  <div class="map-column">
                      <div id="map-container">
                        <div id="map_canvas"></div>
                      </div>
                      <div id="controls">

                          <div>
                              <div class="tish">
                                  <label for="toggleLayer">
                                      <input type="checkbox" name="layer" id="toggleLayer" value="1" checked/>
                                      All regions</label></div>

                              <div id="layerOpacity"></div>
                          </div>

                          <div>
                              <div class="tish">
                                  <label for="toggleRegion">
                                      <input type="checkbox" name="region" id="toggleRegion" value="1" checked disabled/>
                                      Selected region</label></div>

                              <div id="regionOpacity"></div>
                          </div>
                      </div>
                  </div><!--close column-two-->
                </div><!--close map-->
            </div>
        </div>
      </div><!--close map/list div-->
    </div><!--close content-->
    <script type="text/javascript">
        $(function() {
            init_regions({
                server: '${ConfigurationHolder.config.grails.serverURL}',
                spatialService: '${ConfigurationHolder.config.spatial.layers.service.url}',
                spatialWms: '${ConfigurationHolder.config.spatial.wms.url}',
                spatialCache: '${ConfigurationHolder.config.spatial.wms.cache.url}',
                mapContainer: 'map_canvas'
            });
        })
    </script>
  </body>
</html>