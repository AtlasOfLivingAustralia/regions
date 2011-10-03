<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="ala" />
        <title>${region.name} | Atlas of Living Australia</title>
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
        <div id="breadcrumb"><a href="${ConfigurationHolder.config.ala.baseURL}">Home</a> <a href="${ConfigurationHolder.config.ala.baseURL}/explore/">Explore</a><a href="${ConfigurationHolder.config.grails.serverURL}/region/regions">Regions</a><span class="current">${region.name}</span></div>
        <div class="section full-width">
          <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
          </g:if>
          <div class="hrgroup">
            <h1>${region.name}</h1>
            <p>Stuff here.
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
          <div class="region-info">
              <p>Area: 983,482 km<sup>2</sup></p>
              <p>Total occurrence records held by the Atlas: 2.3 million</p>
          </div>
          <div class='region-charts'>
            <p>Charts go here</p>
          </div>
          <div class='dev-only'><b>Dev only</b><br/>
              <span id='dev-notes-link'>Still to do</span>
          </div>
          <div id='dev-notes'>
              <p><b>Stuff to do</b></p>
              <ul>
                  <li>lots</li>
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
                    <span>Click the list button to show the species recorded in this region.</span>
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