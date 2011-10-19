<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="ala" />
        <title>Regions | Atlas of Living Australia</title>
        <g:javascript src="OpenLayers/OpenLayers.js" />
        <g:javascript library="jquery.cookie" />
        <script type="text/javascript">
        </script>
        <g:javascript library="map" />
        <script type="text/javascript">
          var altMap = true;
          $(document).ready(function() {
            $('#dev-notes').dialog({autoOpen: false, show: 'blind', hide: 'blind'});
            $('#dev-notes-link').click(function() {
                $('#dev-notes').dialog('open');
                return false;
            });
            $('#nav-tabs > ul').tabs();
            greyInitialValues();
          });
        </script>
        <g:javascript library="jquery.ba-bbq.min" />
    </head>
    <body onload="init('${ConfigurationHolder.config.grails.serverURL}')">
    <div id="content">
      <div id="header">
        <!--Breadcrumbs-->
        <div id="breadcrumb"><a href="${ConfigurationHolder.config.ala.baseURL}">Home</a> <a href="${ConfigurationHolder.config.ala.baseURL}/explore/">Explore</a><span class="current">Natural History Collections</span></div>
        <div class="section full-width">
          <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
          </g:if>
          <div class="hrgroup">
            <h1>Select a region to explore</h1>
            <p>Select a region then explore occurrence records, images and documents associated with that region.
            <span id='showHelp'>Show me how.</span></p>
          </div><!--close hrgroup-->
          <div id="mainHelp" style="height:0;">
            <img src="${resource(dir:'images/help',file:'help1.png')}"/>
            <img src="${resource(dir:'images/help',file:'help2.png')}"/>
            <img src="${resource(dir:'images/help',file:'help3.png')}"/>
          </div>
        </div><!--close section-->
      </div><!--close header-->

      <div class="map-alt"><!-- wrap map and list-->

        <div id="column-one" class="fudge" style="float:left;">
          <p style="padding: 0 0 0 8px;">Click a button to select the type of region displayed.</p>
          <div class="section filter-buttons">
            <div class="all selected" id="states" onclick="toggleButton(this);return false;">
              <h2><a href="#">States<span id="allButtonTotal">Show states and territories.</span></a></h2>
            </div>
            <div class="fauna" id="lgas" onclick="toggleButton(this);return false;">
              <h2><a href="#">Local Government<span>Show local government areas (LGA).</span></a></h2>
            </div>
            <div class="insects" id="ibras" onclick="toggleButton(this);return false;">
              <h2><a href="#">Biogeographic Regions<span>Interim Biogeographic Regionalisation of Australia (IBRA).</span></a></h2>
            </div>
            <div class="microbes" id="imcras" onclick="toggleButton(this);return false;">
              <h2><a href="#">Marine Regions<span>Integrated Marine and Coastal Regionalisation of Australia (IMCRA).</span></a></h2>
            </div>
            <div class="plants" id="nrms" onclick="toggleButton(this);return false;">
              <h2><a href="#">Management Regions<span>Natural Resource Management (NRM) regions.</span></a></h2>
            </div>
          </div><!--close buttons-->
          <div class='region-search'>
            <label for="regionSearch">Type any part of a region's name and select from the list: </label><br/>
	        <input id="regionSearch">
          </div>
          <div class='dev-only'><b>Dev only</b><br/>
              <span onclick="showGer();">Show GER</span><br/>
              <span id='dev-notes-link'>Still to do</span>
          </div>
          <div id='dev-notes'>
              <p><b>Stuff to do</b></p>
              <ul>
                  <li>work out how to show GER and sub-regions</li>
                  <li>zoom to selection</li>
                  <li>IE6: start with help closed</li>
              </ul>
          </div>
          <!--div>
              <label for="freeSearch">Type any part of a region's name and search for all matches:</label>
              <input id="freeSearch">
          </div-->
        </div><!--close column-one-->

        <div id='right-side'>
            <div>
                <div id="listMapToggle" class="row">
                    <button class="rounded" id="listMapButton" style="display: inline-block; ">
                        <span id="listMapLink">List</span>
                    </button>
                </div>
                <div id="resultsReturned">
                    <span>Click the list button to show a text list of regions.</span>
                </div>
            </div>
            <div id="mapListOuter" style="height:740px;width:650px;position:relative;overflow:hidden;">
                <div id="map" style="left:0;position:absolute;top:0;width:650px;">
                  <div class="map-column">
                      <div id="map-container">
                        <div id="map_canvas"></div>
                      </div>
                      <div id="selectedRegion">
                      </div>
                  </div><!--close column-two-->
                </div><!--close map-->

                <div id="showList" style="left:650px;position:absolute;top:0;width:650px;">
                  <div class="list-column">
                      <p style="padding-left:4px;">Click a region name to explore the region. Click the info icon for more options.</p>
                      <div id="filtered-list">Loading..</div>
                  </div><!--close column-one-->
                </div><!--close list-->
            </div>
        </div>
      </div><!--close map/list div-->

    </div><!--close content-->
  </body>
</html>