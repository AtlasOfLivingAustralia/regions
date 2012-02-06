<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="layout" content="${ConfigurationHolder.config.ala.skin}" />
        <title>${region.name} | Atlas of Living Australia</title>
        <link rel="stylesheet" href="${ConfigurationHolder.config.grails.serverURL}/css/regions.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="${ConfigurationHolder.config.grails.serverURL}/css/base.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="http://biocache.ala.org.au/static/css/ala/biocache.css" type="text/css" media="screen" />
        <link rel="stylesheet" href="http://biocache.ala.org.au/static/js/fancybox/jquery.fancybox-1.3.4.css" type="text/css" media="screen">
        <script type="text/javascript" language="javascript" src="http://www.google.com/jsapi"></script>
        %{--<script type="text/javascript" src="http://collections.ala.org.au/js/charts.js"></script>--}%
        <script type="text/javascript" src="http://biocache.ala.org.au/static/js/fancybox/jquery.fancybox-1.3.4.pack.js"></script>
        <g:javascript library="charts2"/>
        <g:javascript library="jquery.jsonp-2.1.4.min"/>
        <g:javascript library="jquery.cookie" />
        <g:javascript library="region" />
        <g:javascript library="wms" />
        %{--<g:javascript library="datadumper" />--}%
        <g:javascript library="number-functions" />
        <g:javascript library="jquery.ba-bbq.min" />
        <script src="http://maps.google.com/maps/api/js?v=3.5&sensor=false"></script>
        <g:javascript library="keydragzoom" />
        <script type="text/javascript">
          var altMap = true;
        </script>
    </head>
    <body>
    <div id="content" class="clearfix">
      <div id="header">
        <!--Breadcrumbs-->
        <div id="breadcrumb">
          <a href="${ConfigurationHolder.config.ala.baseURL}">Home</a>
          <a href="${ConfigurationHolder.config.ala.baseURL}/explore/">Explore</a>
          <a href="${ConfigurationHolder.config.grails.serverURL}#rt=${region.type}">Regions</a>
          %{--TODO: do the following in a tag to support any depth --}%
          <g:if test="${region.parent}">
              <a href="${ConfigurationHolder.config.grails.serverURL}/${region.parent.type}/${region.parent.name}">${region.parent.name}</a>
              <g:if test="${region.parent.child}">
                  <a href="${ConfigurationHolder.config.grails.serverURL}/${region.parent.child.type}/${region.parent.child.name}">${region.parent.child.name}</a>
              </g:if>
          </g:if>
          <span class="current">${region.name}</span></div>
        <div class="section full-width">
          <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
          </g:if>
          <header class="hrgroup">
            <h1>${region.name}</h1>
            <div id="emblems"></div>
          </header><!--close hrgroup header-->

        </div><!--close section-->
      </div><!--close header-->

        <g:if test="${region.description || region.notes}">
            <section class="section">
              <h2>Description</h2>
              <g:if test="${region.description}"><p>${region.description}</p></g:if>
              <g:if test="${region.notes}"><h3>Notes on the map layer</h3><p>${region.notes}</p></g:if>
            </section>
        </g:if>

        <section class="section">
            <h2 id="occurrenceRecords">Occurrence records</h2>

            <div id="explore">
                <ul class='explore-tabs'>
                    <li><a href="#" class="current">Explore by species</a></li>
                    <li><a href="#">Explore by taxonomy</a></li>
                </ul>
                <div id="slider-pane">
                    <div id="species">
                        <div id="taxaBox">
                            <div id="rightList" class="tableContainer">
                                <table>
                                    <thead class="fixedHeader">
                                    <tr>
                                        <th>&nbsp;</th>
                                        <th>Species</th>
                                        <th>Records</th>
                                    </tr>
                                    </thead>
                                    <tbody class="scrollContent">
                                    </tbody>
                                </table>
                            </div>

                            <div id="leftList">
                                <table id="taxa-level-0">
                                    <thead>
                                    <tr>
                                        <th>Group</th>
                                        <th>Species</th>
                                    </tr>
                                    </thead>
                                    <tbody>

                                    </tbody>
                                </table>
                            </div>

                            <div id="taxa-links" style="clear:both;">
                                <ul>
                                    <li>
                                        <span id="viewRecords" class="link">View all records</span>
                                    </li>
%{--
                                    <li>
                                        <img src="${resource(dir:'images',file: 'species-images-icon.png')}"/><br/>
                                        <span id="viewImages" class="link">View images for species</span>
                                    </li>
--}%
                                    <li>
                                        <a href="#download" id="downloadLink" title="Download records OR species checklist">Download all</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div id="taxonomy"><div id="charts"></div></div>
                </div>
                <button id="resetButton" type="button" onclick="resetAll()">Reset all</button>

                <div id="timeContainer">
                    <p>Explore by date</p>
                    <p>Drag handles to restrict records by date of observation/collection.</p>
                    <div id="timeValues"><span id="from">1850</span> <span id="to">2010</span></div>
                    <div id="timeSlider"></div>
                    <div id="timeTicks"><img src="${resource(dir:'images/skin',file:'timescale.png')}"/></div>
                    <div id="debugTime"></div>
                    <div id="playControls"><span id="play">
                        <img onclick="timeSlider.startPlay()" alt="Play timeline by decade" width="32" height="32" src="${resource(dir:'images/skin',file:'EZ-Play-icon.png')}"/>
                        <img onclick="timeSlider.pause()" alt="Pause play" width="32" height="32" src="${resource(dir:'images/skin',file:'EZ-Pause.png')}"/>
                        <img onclick="timeSlider.stop()" alt="Stop" width="32" height="32" src="${resource(dir:'images/skin',file:'EZ-Stop-icon.png')}"/>
                    </span></div>
                </div>
            </div>

            <div id="map" class="section">
                <div id="region-map-container">
                    <div id="region-map"></div>

                    <div id="controls">

                        <div>
                            <div class="tish">
                                <label for="toggleOccurrences">
                                    <input type="checkbox" name="occurrences" id="toggleOccurrences" value="1" checked/>
                                    Occurrences</label></div>

                            <div id="occurrencesOpacity"></div>
                        </div>

                        <div>
                            <div class="tish">
                                <label for="toggleRegion">
                                    <input type="checkbox" name="region" id="toggleRegion" value="1" checked/>
                                    Region</label></div>

                            <div id="regionOpacity"></div>
                        </div>
                    </div>

                    <div>LatLng: <span id="location"></span></div>
                    <div>Zoom: <span id="zoom"></span> <span id="using-bbox-hack"></span></div>

                    <div><span id="bbox"></span></div>
                </div>
            </div>

        </section><!--close section-->

        <div style="clear:both;"> </div>

        <section id="subRegions" class="section">
            <h2>Regions within ${region.name}</h2>
            <g:if test="${subRegions.ibras}">
                <h3>Biogeographic (IBRA)</h3>
                <ul>
                    <g:each in="${subRegions.ibras}" var="r">
                        <li><g:link action="region" params="[regionType:'ibras',regionName:r]">${r}</g:link></li>
                    </g:each>
                </ul>
            </g:if>
            <g:if test="${subRegions.nrms}">
                <h3>Natural Resource Management (NRM)</h3>
                <ul>
                    <g:each in="${subRegions.nrms}" var="r">
                        <li><g:link action="region" params="[regionType:'nrms',regionName:r]">${r}</g:link></li>
                    </g:each>
                </ul>
            </g:if>
            <g:if test="${subRegions.imcras}">
                <h3>Marine and Coastal (IMCRA)</h3>
                <ul>
                    <g:each in="${subRegions.imcras}" var="r">
                        <li><g:link action="region" params="[regionType:'imcras',regionName:r]">${r}</g:link></li>
                    </g:each>
                </ul>
            </g:if>
            <g:if test="${subRegions.subs}">
                <h3>Administrative</h3>
                <ul>
                    <g:each in="${subRegions.subs}" var="r">
                        <li><g:link action="region" params="[regionType:'layer',regionName:r,parent:region.name]">${r}</g:link></li>
                    </g:each>
                </ul>
            </g:if>
        </section>

        <section id="docs" class="section">
            <h2>Documents and Links</h2>
            <g:if test="${documents.factSheets}">
                <h3>Fact sheets</h3>
                <ul>
                    <g:each in="${documents.factSheets}" var="d">
                        <li>
                            <a href="${d.url}" class="external">${d.linkText}</a> ${d.otherText}
                        </li>
                    </g:each>
                </ul>
            </g:if>
            <g:if test="${documents.publications}">
                <h3>Publications</h3>
                <ul>
                    <g:each in="${documents.publications}" var="d">
                        <li>
                            <a href="${d.url}" class="external">${d.linkText}</a> ${d.otherText}
                        </li>
                    </g:each>
                </ul>
            </g:if>
            <g:if test="${documents.links}">
                <h3>Links</h3>
                <ul>
                    <g:each in="${documents.links}" var="d">
                        <li>
                            <a href="${d.url}" class="external">${d.linkText}</a> ${d.otherText}
                        </li>
                    </g:each>
                </ul>
            </g:if>

            <g:link elementId="manage-doc-link" action="documents">Add or manage documents and links</g:link>
        </section>

        <div style="display:none">

        <div id="download">
            <p id="termsOfUseDownload">
                By downloading this content you are agreeing to use it in accordance with the Atlas
                <a href="http://www.ala.org.au/about/terms-of-use/#TOUusingcontent">Terms of Use</a>
                and individual <a href=" http://www.ala.org.au/support/faq/#q29">Data Provider Terms</a>.
                <br/><br/>
                Please provide the following <b>optional</b> details before downloading:
            </p>
            <form id="downloadForm">
                <input type="hidden" name="url" id="downloadUrl" value="http://biocache.ala.org.au/ws/occurrences/download?q=state:&#034;South Australia&#034;&amp;qc="/>
                <input type="hidden" name="url" id="downloadChecklistUrl" value="http://biocache.ala.org.au/ws/occurrences/facets/download?q=state:&#034;South Australia&#034;&amp;qc="/>
                <input type="hidden" name="url" id="downloadFieldGuideUrl" value="http://biocache.ala.org.au/occurrences/fieldguide/download?q=state:&#034;South Australia&#034;&amp;qc="/>

                <fieldset>
                    <p><label for="email">Email</label>
                        <input type="text" name="email" id="email" value="${rg.loggedInUsername()}" size="30"  />
                    </p>
                    <p><label for="filename">File Name</label>
                        <input type="text" name="filename" id="filename" value="data" size="30"  />
                    </p>
                    <p><label for="reason" style="vertical-align: top">Download Reason</label>
                        <textarea name="reason" rows="5" cols="30" id="reason"  ></textarea>
                    </p>
                    <input type="submit" value="Download All Records" id="downloadSubmitButton"/>&nbsp;
                    <input type="submit" value="Download Species Checklist" id="downloadCheckListSubmitButton"/>&nbsp;
                    <input type="submit" value="Download Species Field Guide" id="downloadFieldGuideSubmitButton"/>&nbsp;
                    <!--
                    <input type="reset" value="Cancel" onClick="$.fancybox.close();"/>
                    -->
                    <p style="margin-top:10px;">
                        <strong>Note</strong>: The field guide may take several minutes to prepare and download.
                    </p>
                </fieldset>
            </form>
        </div>

        </div>

    </div><!--close content-->

    <script type="text/javascript">

        var bieUrl = "${ConfigurationHolder.config.bie.baseURL}",
            baseUrl = "${ConfigurationHolder.config.grails.serverURL}",
            bbox;

        layerFid = "${region.fid}";

        if (${useReflect == false}) {
            useReflectService = false;
        }

        var $emblems = $('#emblems');
        function showEmblem(emblemType, guid) {
            if (guid == "") return;
            // call the bie to get details
            $.ajax({
              url: bieUrl + "species/moreInfo/" + guid + ".json",
              dataType: 'jsonp',
              error: function() {
                cleanUp();
              },
              success: function(data) {
                  var imageSrc = "http://bie.ala.org.au/static/images/noImage85.jpg";
                  if (data.images && data.images.length > 0) {
                      imageSrc = data.images[0].thumbnail;
                  }
                  var sciName = data.taxonConcept.nameString;
                  var commonName = "";
                  if (data.commonNames && data.commonNames.length > 0) {
                      commonName = data.commonNames[0].nameString;
                  }
                  var link = bieUrl + "species/" + guid;
                  var frag =
                  '<div class="emblem">' +
                  '<a id="' + makeId(emblemType) + '" href="' + link + '"><img src="' + imageSrc + '" class="emblemThumb" alt="' +
                  sciName + ' image"/></a>' +
                  '<h3>' + emblemType + '</h3>' +
                  '<div id="' + makeId(emblemType) + '"><i>' + sciName + '</i><br> ' + commonName + '</div>' +
                  '</div>';
                  $emblems.append($(frag));
              }
            });
        }
        var query = buildRegionFacet("${region.type}","${region.name}"),
            taxonomyChartOptions = {
            query: query,
            subquery: timeSlider.staticQueryString($.bbq.getState('from'), $.bbq.getState('to')),
            rank: "kingdom",
            width: 450,
            clickThru: false,
            notifyChange: "taxonChartChange",
            collectionsUrl: "${ConfigurationHolder.config.grails.serverURL}",
            biocacheServicesUrl: "${ConfigurationHolder.config.biocache.baseURL}ws",
            displayRecordsUrl: "${ConfigurationHolder.config.biocache.baseURL}"
        };

        bbox = {sw: {lat: ${region.bbox?.minLat}, lng: ${region.bbox?.minLng}},
                ne: {lat: ${region.bbox?.maxLat}, lng: ${region.bbox?.maxLng}} };

        // Load Google maps via AJAX API
//        google.load("maps", "3.3", {other_params:"sensor=false"});
        // load visualisations
        google.load("visualization", "1", {packages:["corechart"]});

        // wire tabs
        var $bySpecies = $('ul.explore-tabs li:first-child');
        var $byTaxonomy = $('ul.explore-tabs li:last-child');
        var $bySpeciesLink = $bySpecies.find('a');
        var $byTaxonomyLink = $byTaxonomy.find('a');

        $byTaxonomy.click(function() {
            $byTaxonomyLink.addClass('current');
            $bySpeciesLink.removeClass('current');
            $('#slider-pane').animate({left: '-480px'}, 500, function() {
                // don't fire notification until animation is complete - else animation can be jerky
                taxonomySelected();
            });
            return false;
        });
        $bySpecies.click(function() {
            $bySpeciesLink.addClass('current');
            $byTaxonomyLink.removeClass('current');
            $('#slider-pane').animate({left: '0'}, 500, function() {
                speciesSelected();
            });
            return false;
        });

        function setTab(tab) {
            if (tab == 'species' && !$bySpecies.hasClass('current')) {
                $bySpeciesLink.addClass('current');
                $byTaxonomyLink.removeClass('current');
                $('#slider-pane').css('left', 0);
            }
            else {
                $byTaxonomyLink.addClass('current');
                $bySpeciesLink.removeClass('current');
                $('#slider-pane').css('left', '-480px');
            }
        }

        // get any tab state from url
        var currentTab = $.bbq.getState('tab');
        if (currentTab) { setTab(currentTab) }

        // do stuff
        google.setOnLoadCallback(function() {

            showEmblem("Bird emblem", "${emblems?.birdEmblem}");
            showEmblem("Animal emblem", "${emblems?.animalEmblem}");
            showEmblem("Plant emblem", "${emblems?.plantEmblem}");
            showEmblem("Marine emblem", "${emblems?.marineEmblem}");

            var config = {
                speciesPageUrl: "${ConfigurationHolder.config.bie.baseURL}species/",
                biocacheServiceUrl: "${ConfigurationHolder.config.biocache.baseURL}ws",
                biocacheWebappUrl: "${ConfigurationHolder.config.biocache.baseURL}",
                spatialWmsUrl: "${ConfigurationHolder.config.spatial.baseURL}geoserver/ALA/wms?",
                spatialCacheUrl: "${ConfigurationHolder.config.spatial.baseURL}geoserver/gwc/service/wms?",
                spatialServiceUrl: "${ConfigurationHolder.config.spatial.baseURL}layers-service"
            };

            // init time controls
            $('#timeSlider').slider({
                range: true,
                min: 1850,
                max: 2010,
                values: [1850, 2010],
                slide: slideHandler,
                change: dateRangeChanged
            });

            // initialise the visible tab first
            if (false) {
                taxonomyChart.load(taxonomyChartOptions);
                initTaxaBox("${region.type}","${region.name}", config);
            }
            else {
                initTaxaBox("${region.type}","${region.name}", config);
                taxonomyChart.load(taxonomyChartOptions);
            }

            initRegionMap("${region.type}", "${region.name}", "${region.layerName}",
                    "${region.pid}", bbox, config);

        });

    </script>
  </body>
</html>