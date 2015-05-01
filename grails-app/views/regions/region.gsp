<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="layout" content="${grailsApplication.config.layout.skin?:'main'}"/>
    <title>${region.name} | Atlas of Living Australia</title>
    <r:require modules="region"/>
</head>
<body class="nav-locations">

<div class="row">
    <div class="span12">
        <ul class="breadcrumb pull-left">
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
        <a id="alertsButton" class="btn btn-ala pull-right" href="${alertsUrl}">
            Alerts
            <i class="icon-bell icon-white"></i>
        </a>
    </div>
</div>

<div class="row" id="emblemsContainer">
    <div class="span12">
        <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
        </g:if>
        <h1>${region.name}</h1>
        <aa:zone id="emblems" href="${g.createLink(controller: 'region', action: 'showEmblems', params: [regionType: region.type, regionName: region.name, regionPid: region.pid])}">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </aa:zone>
    </div>
</div>

<div class="row">
    <div class="span12">
        <g:if test="${region.description || region.notes}">
            <section class="section">
                <h2>Description</h2>
                <g:if test="${region.description}"><p>${raw(region.description)}</p></g:if>
                <g:if test="${region.notes}"><h3>Notes on the map layer</h3><p>${region.notes}</p></g:if>
            </section>
        </g:if>

        <h2 id="occurrenceRecords">Occurrence records <span id="totalRecords"></span></h2>
    </div>
</div>

<div class="row">
    <div class="span6">
        <ul class="nav nav-tabs" id="explorerTabs">
            <li class="active"><a id="speciesTab" href="#speciesTabContent" data-toggle="tab">Explore by species <i class="fa fa-cog fa-spin fa-lg hidden"></i></a></li>
            <li><a id="taxonomyTab" href="#taxonomyTabContent" data-toggle="tab">Explore by taxonomy <i class="fa fa-cog fa-spin fa-lg hidden"></i></a></li>
        </ul>
        <div class="tab-content">
            <div class="tab-pane active" id="speciesTabContent">
                <table class="table table-condensed table-hover" id="groups">
                    <thead>
                        <tr>
                            <th class="text-center">Group</th>
                        </tr>
                    </thead>
                    <aa:zone id="groupsZone" tag="tbody" href="${g.createLink(controller: 'region', action: 'showGroups', params: [regionFid: region.fid,regionType: region.type, regionName: region.name, regionPid: region.pid])}"
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
                <div class="text-center" id="exploreButtons">
                    <a href="" id="viewRecords" class="btn"><i class="fa fa-share-square-o"></i> View Records</a>

                    <a href="${g.createLink(controller: 'region', action: 'showDownloadDialog',
                            params: [email: rg.loggedInUsername(),
                                     regionType: region.type, regionName: region.name,
                                     regionFid: region.fid, regionPid: region.pid
                                     ])}"
                       aa-refresh-zones="dialogZone" aa-js-before="$('#downloadRecordsModal').modal('show');" class="btn">
                        <i class="fa fa-download"></i> Download Records
                    </a>
                </div>
            </div>
            <div class="tab-pane" id="taxonomyTabContent">
                <div id="charts">
                    <i class="spinner fa fa-cog fa-spin fa-3x"></i>
                </div>
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
                <span class="timeControl link" id="playButton" title="Play timeline by decade" alt="Play timeline by decade"></span>
                <span class="timeControl link" id="pauseButton" title="Pause play" alt="Pause play"></span>
                <span class="timeControl link" id="stopButton" title="Stop" alt="Stop"></span>
                <span class="timeControl link" id="resetButton" title="Reset" alt="Reset"></span>
            </div>

            <div id="timeSlider">
                <div id="timeRange"><span id="timeFrom"></span> - <span id="timeTo"></span></div>
            </div>
        </div>

        <div id="region-map"></div>

        <div class="accordion" id="opacityControls">
            <div class="accordion-group">
                <div class="accordion-heading">
                    <a class="accordion-toggle" data-toggle="collapse" href="#opacityControlsContent">
                        <i class="fa fa-chevron-right"></i>Map opacity controls
                    </a>
                </div>
                <div id="opacityControlsContent" class="accordion-body collapse">
                    <div class="accordion-inner">
                        <label class="checkbox">
                            <input type="checkbox"name="occurrences" id="toggleOccurrences" checked> Occurrences
                        </label>
                        <div id="occurrencesOpacity"></div>
                        <label class="checkbox">
                            <input type="checkbox" name="region" id="toggleRegion" checked> Region
                        </label>
                        <div id="regionOpacity"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="downloadRecordsModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
    <aa:zone id="dialogZone">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h3 id="myModalLabel">Download Records</h3>
        </div>
        <div class="modal-body text-center">
            <i class="fa fa-cog fa-spin fa-2x"></i>
        </div>
    </aa:zone>
</div>

<g:if test="${subRegions.size() > 0}">
    <div class="row">
        <div class="span12" id="subRegions">
            <h2>Regions within ${region.name}</h2>
            <g:each in="${subRegions}" var="item">
                <h3>${item.key}</h3>
                <ul>
                    <g:each in="${item.value.list}" var="r">
                        <li><g:link action="region" params="[regionType:item.value.name,regionName:r,parent:region.name]">${r}</g:link></li>
                    </g:each>
                </ul>
            </g:each>
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

<r:script>
    google.load("visualization", "1", {packages:["corechart"]});
    var regionWidget;

    $(function() {


        regionWidget = new RegionWidget({
            regionName: '${region.name}',
            regionType: '${region.type}',
            regionFid: '${region.fid}',
            regionPid: '${region.pid}',
            regionLayerName: '${region.layerName}',
            urls: {
                regionsApp: '${g.createLink(uri: '/', absolute: true)}',
                proxyUrl: '${g.createLink(controller: 'proxy', action: 'index')}',
                proxyUrlBbox: '${g.createLink(controller: 'proxy', action: 'bbox')}',
                speciesPageUrl: "${grailsApplication.config.bie.baseURL}/species/",
                biocacheServiceUrl: "${grailsApplication.config.biocache.baseURL}/ws",
                biocacheWebappUrl: "${grailsApplication.config.biocache.baseURL}",
                spatialWmsUrl: "${grailsApplication.config.spatial.baseURL}/geoserver/ALA/wms?",
                spatialCacheUrl: "${grailsApplication.config.spatial.baseURL}/geoserver/gwc/service/wms?",
                spatialServiceUrl: "${grailsApplication.config.layersService.baseURL}/",
            },
            username: '${rg.loggedInUsername()}',
            q: '${region.q}'
        });

        regionWidget.setMap(new RegionMap({
            bbox: {
                sw: {lat: ${region.bbox?.minLat}, lng: ${region.bbox?.minLng}},
                ne: {lat: ${region.bbox?.maxLat}, lng: ${region.bbox?.maxLng}}
            },
            useReflectService: ${useReflect}
        }));
        regionWidget.setTimeControls(new RegionTimeControls());

         google.setOnLoadCallback(function() {
            regionWidget.setTaxonomyWidget(new TaxonomyWidget());
        });

    });

</r:script>
</body>
</html>