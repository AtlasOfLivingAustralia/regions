<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="layout" content="main" />
    <title>${region.name} | Atlas of Living Australia</title>
    <r:require modules="region"/>
</head>
<body>

<div class="row">
    <div class="span12">
        <ul class="breadcrumb">
            <rg:breadcrumbTrail/>
            <li><a href="${grailsApplication.config.grails.serverURL}#rt=${region.type}">Regions</a> <span class="divider"><i class="fa fa-arrow-right"></i></span></li>
            <g:if test="${region.parent}">
                <li><a href="${grailsApplication.config.grails.serverURL}/${region.parent.type}/${region.parent.name}">${region.parent.name}</a> <span class="divider"><i class="fa fa-arrow-right"></i></span></li>
                <g:if test="${region.parent.child}">
                    <li><a href="${grailsApplication.config.grails.serverURL}/${region.parent.child.type}/${region.parent.child.name}">${region.parent.child.name}</a> <span class="divider"><i class="fa fa-arrow-right"></i></span></li>
                </g:if>
            </g:if>
            <li class="active">${region.name}</li>
        </ul>
    </div>
</div>

<div class="row">
    <div class="span12">
        <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
        </g:if>
        <h1>${region.name}</h1>
        <aa:zone id="emblems" fragmentUrl="${g.createLink(controller: 'region', action: 'showEmblems', params: [regionType: region.type, regionName: region.name])}">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </aa:zone>
    </div>
</div>

<div class="row">
    <div class="span12">
        <g:if test="${region.description || region.notes}">
            <section class="section">
                <h2>Description</h2>
                <g:if test="${region.description}"><p>${region.description}</p></g:if>
                <g:if test="${region.notes}"><h3>Notes on the map layer</h3><p>${region.notes}</p></g:if>
            </section>
        </g:if>

        <h2 id="occurrenceRecords">Occurrence records</h2>
    </div>
</div>

<div class="row">
    <div class="span6">
        <ul class="nav nav-tabs" id="explorerTabs">
            <li id="speciesTab" class="active"><a href="#species" data-toggle="tab">Explore by species <i class="fa fa-cog fa-spin fa-lg hidden"></i></a></li>
            <li id="taxonomyTab"><a href="#taxonomy" data-toggle="tab">Explore by taxonomy <i class="fa fa-cog fa-spin fa-lg hidden"></i></a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active">
                <table class="table table-condensed table-hover" id="groups">
                    <thead>
                        <tr>
                            <th class="text-center">Group</th>
                        </tr>
                    </thead>
                    <aa:zone id="groupsZone" tag="tbody" fragmentUrl="${g.createLink(controller: 'region', action: 'showGroups')}"
                             jsAfter="regionWidget.groupsLoaded();">
                        <tr class="spinner">
                            <td class="spinner text-center">
                                <i class="fa fa-cog fa-spin fa-2x"></i>
                            </td>
                        </tr>

                    </aa:zone>
                </table>
                <table class="table table-condensed table-hover" id="species">
                    <thead>
                        <tr>
                            <th colspan="2" class="text-center">Species</th>
                            <th class="text-right">Records</th>
                        </tr>
                    </thead>
                    <aa:zone id="speciesZone" tag="tbody" jsAfter="regionWidget.speciesLoaded();">
                        <tr class="spinner">
                            <td colspan="3" class="spinner text-center">
                                <i class="fa fa-cog fa-spin fa-2x"></i>
                            </td>
                        </tr>
                    </aa:zone>
                </table>
            </div>
            <div class="tab-pane" id="taxonomy">
                <div id="charts"></div>
            </div>
        </div>
    </div>
    <div class="span6">

        <ul class="nav nav-tabs" id="controlsMapTab">
            <li class="active">
                <a href="#">Time Controls and Map <i class="fa fa-info-circle fa-lg link" id="timeControlsInfo"
                                                     data-content="Drag handles to restrict date or play by decade."
                                                     data-placement="right" data-toggle="popover" data-original-title="How to use time controls"></i></a>
            </li>
        </ul>

        <div id="timeControls" class="text-center">
            <div id="timeButtons">
                <r:img uri="/images/play.png" class="timeControl link" id="playButton" title="Play timeline by decade" alt="Play timeline by decade"/>
                <r:img uri="/images/pause.png" class="timeControl link" id="pauseButton" title="Pause play" alt="Pause play"/>
                <r:img uri="/images/stop.png" class="timeControl link" id="stopButton" title="Stop" alt="Stop"/>
                <r:img uri="/images/reset.png" class="timeControl link" id="resetButton" title="Reset" alt="Reset"/>
            </div>

            <div id="timeSlider">
                <div id="timeRange"><span id="timeFrom"></span> - <span id="timeTo"></span></div>
            </div>
        </div>

        <div id="region-map"></div>

        <span id="controls-toggle" class="link under">Advanced map controls</span>
        <div id="controls" class="ui-helper-hidden">
            <div>
                <div class="tish">
                    <label for="toggleOccurrences">
                        <input type="checkbox" name="occurrences" id="toggleOccurrences" value="1" checked/>
                        Occurrences</label></div>

                <div id="occurrencesOpacity"></div>
                <span id="hide-controls" class="link under">Hide</span>
            </div>

            <div>
                <div class="tish">
                    <label for="toggleRegion">
                        <input type="checkbox" name="region" id="toggleRegion" value="1" checked/>
                        Region</label></div>

                <div id="regionOpacity"></div>
            </div>
        </div>
    </div>
</div>

<hr/>

    <div class="row">
        <div class="span6">
            <div id="explore">
                %{--<ul class='explore-tabs'>--}%
                    %{--<li><a href="#" class="current">Explore by species</a></li>--}%
                    %{--<li><a href="#">Explore by taxonomy</a></li>--}%
                %{--</ul>--}%
                <div id="slider-pane">
                    <div>
                        <div id="taxaBox">


                            <div id="taxa-links" style="clear:both;">
                                <ul>
                                    <li>
                                        <span id="viewRecords" class="link under">View all records</span>
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

                    %{--<div id="taxonomy"><div id="charts"></div></div>--}%
                </div>

            </div>
        </div>

    </div>

    <div class="row">
        <div class="span12">
            <h2>Alerts</h2>
            <div id="alerts"></div>
        </div>
    </div>

    <g:if test="${subRegions.ibras||subRegions.nrms||subRegions.imcras||subRegions.subs}">
    <div class="row">
        <div class="span12" id="subRegions">
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
        </div>
    </div>
    </g:if>

    <g:if test="${documents.factSheets||documents.publications||documents.links}">
    <div class="row">
        <div class="span12" id="docs">
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
        </div>
    </div>
    </g:if>

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
                <input type="hidden" name="url" id="fastDownloadUrl" value="http://biocache.ala.org.au/ws/occurrences/index/download?q=state:&#034;South Australia&#034;&amp;qc="/>

                <fieldset>
                    <p><label for="email">Email</label>
                        <input type="text" name="email" id="email" value="${rg.loggedInUsername()}" size="30"  />
                    </p>
                    <p><label for="filename">File Name</label>
                        <input type="text" name="filename" id="filename" value="data" size="30"  />
                    </p>
                    <p><label for="reasonTypeId" style="">Download Reason *</label>
                        <select name="reasonTypeId" id="reasonTypeId">
                            <option value="">-- select a reason --</option>
                            <g:each in="${downloadReasons}" var="reason">
                                <option value="${reason.key}">${reason.value}</option>
                            </g:each>
                        </select>
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

    <r:script>

        var regionWidget;

        $(function() {
            regionWidget = new RegionWidget({
                regionName: '${region.name}',
                regionType: '${region.type}',
                regionFid: '${region.fid}',
                regionPid: '${region.pid}',
                regionLayerName: ${region.pid},
                urls: {
                    proxyUrl: '${createLink(controller: 'proxy', action: 'index')}',
                    speciesPageUrl: "${grailsApplication.config.bie.baseURL}/species/",
                    biocacheServiceUrl: "${grailsApplication.config.biocache.baseURL}/ws",
                    biocacheWebappUrl: "${grailsApplication.config.biocache.baseURL}",
                    spatialWmsUrl: "${grailsApplication.config.spatial.baseURL}/geoserver/ALA/wms?",
                    spatialCacheUrl: "${grailsApplication.config.spatial.baseURL}/geoserver/gwc/service/wms?",
                    spatialServiceUrl: "${grailsApplication.config.spatial.baseURL}/layers-service"
                }
            });

            regionWidget.setMap(new RegionMap({
                bbox: {
                    sw: {lat: ${region.bbox?.minLat}, lng: ${region.bbox?.minLng}},
                    ne: {lat: ${region.bbox?.maxLat}, lng: ${region.bbox?.maxLng}}
                },
                useReflectService: ${useReflect}
            }));

            regionWidget.setTimeControls(RegionTimeControls());

            %{--var query = region.buildRegionFacet("${region.type}","${region.name}", "${region.fid}");--}%

            %{--var taxonomyChartOptions = {--}%
                %{--query: query,--}%
%{--//                subquery: timeSlider.staticQueryString($.bbq.getState('from'), $.bbq.getState('to')),--}%
                %{--rank: "kingdom",--}%
                %{--width: 450,--}%
                %{--clickThru: false,--}%
                %{--notifyChange: "taxonChartChange",--}%
                %{--collectionsUrl: "${grailsApplication.config.grails.serverURL}",--}%
                %{--biocacheServicesUrl: "${grailsApplication.config.biocache.baseURL}/ws",--}%
                %{--displayRecordsUrl: "${grailsApplication.config.biocache.baseURL}/"--}%
            %{--};--}%

//            taxonomyChart.load(taxonomyChartOptions);
        });

    </r:script>
  </body>
</html>