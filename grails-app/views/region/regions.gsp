<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="ala" />
        <!--meta name="viewport" content="initial-scale=1.0, user-scalable=no" /-->
        <title>Regions | Atlas of Living Australia</title>
        <g:javascript src="OpenLayers/OpenLayers.js" />
        <script type="text/javascript" src="${resource(dir:'js', file: 'map-old.js')}"></script>

        <script type="text/javascript">
          var altMap = true;
          $(document).ready(function() {
            $('#nav-tabs > ul').tabs();
            greyInitialValues();
          });
        </script>
    </head>
    <body id="page-collections-map" onload="initMap('${ConfigurationHolder.config.grails.serverURL}')">
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
            <p>Select a region (or drill down to sub-regions) then explore occurrence records, images and documents associated with that region.</p>
          </div><!--close hrgroup-->
        </div><!--close section-->
      </div><!--close header-->

      <div class="map-alt"><!-- wrap map and list-->

        <div id="column-one" class="fudge">
          <div class="section" style="padding-bottom:0;">
            <p style="padding-bottom:0;padding-left:10px;padding-top:10px;">Click a button to select the type of region displayed.</p>
          </div>
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
          </div><!--close section-->
        </div><!--close column-one-->

        <div id="map">
          <div id="column-two" class="map-column">
            <div class="section">
              <p style="width:588px;padding-bottom:8px;padding-left:30px;"> </p>
              <div id="map-container">
                <div id="map_canvas"></div>
              </div>
            </div><!--close section-->
          </div><!--close column-two-->
        </div><!--close map-->

        <div id="list">
          <div id="column-two" class="list-column">
            <div class="nameList section" id="names">
              <p> </p>
              <ul id="filtered-list" style="padding-left:15px;">
                <g:each var="c" in="${collections}" status="i">
                  <li>
                    <g:link controller="public" action="show" id="${c.uid}">${fieldValue(bean: c, field: "name")}</g:link>
                  </li>
                </g:each>
              </ul>
            </div><!--close nameList-->
          </div><!--close column-one-->
        </div><!--close list-->

      </div><!--close map/list div-->

    </div><!--close content-->
  </body>
</html>