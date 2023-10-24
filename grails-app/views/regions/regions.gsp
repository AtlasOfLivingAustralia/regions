<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <meta name="breadcrumbParent" content="${grailsApplication.config.getProperty('breadcrumbParent')}"/>
    <meta name="breadcrumb" content="${g.message(code:'regions.title')}"/>
    <meta name="layout" content="${grailsApplication.config.getProperty('skin.layout') ?: 'main'}"/>

    <title><g:message code="regions.title"/> | ${grailsApplication.config.getProperty('orgNameLong') ?: 'Atlas of Living Australia'}</title>

    <script src="${g.createLink(controller: 'data', action: 'regionsMetadataJavascript')}"></script>
    <script src="https://maps.google.com/maps/api/js?key=${grailsApplication.config.getProperty('google.apikey')}"></script>
    <script src="https://www.gstatic.com/charts/loader.js"></script>

    <asset:stylesheet src="leaflet/leaflet"/>
    <asset:stylesheet src="application"/>
    <asset:javascript src="leaflet/leaflet"/>
    <asset:javascript src="dependencies.js"/>
    <asset:javascript src="regions_app"/>
    <asset:javascript src="regions_page"/>
</head>
<body class="nav-locations">
<div class="row">
    <div class="col-md-12">
        <g:if test="${flash.message}">
            <div class="message">${flash.message}</div>
        </g:if>
        <h1><g:message code="select.region.title"/></h1>
        <p>
            <g:message code="select.region.help1"/>
            <br/>
            <g:message code="select.region.help2"/>
        </p>
    </div>
</div>

<div class="row">
    <div class="col-md-4">
        <p style="font-size:15px;margin-left:15px;padding-bottom:0;"><i
                class="fa fa-info-circle"></i>
            <g:message code="select.region.help3"/>
        </p>
        <div id="accordion">
            <g:each in="${menu}" var="item">
                <h2><a href="#">${item.label}</a>
                    <g:if test="${grailsApplication.config.getProperty("showNotesInfoInAccordionPanel", Boolean, false) && item.notes?.length() > 0}">
                        <span class="glyphicon glyphicon glyphicon-info-sign layer-info" aria-hidden="true" data-toggle="tooltip" title="${item.notes}"></span>
                    </g:if>
                </h2>
                <div id="${item.layerName}" layer="${item.label}"><span class="loading">
                    <g:message code="loading"/>
                </span>
                </div>
            </g:each>
        </div>
    </div>

    <div class="col-md-8" id="rightPanel">
        <span id="click-info"><i class="fa fa-info-circle"></i>
            <g:message code="select.region.help4"/>
        </span>
        <span class="btn btn-default" id="reset-map"><i class="fa fa-refresh"></i>
            <g:message code="reset.map"/>
        </span>

        <div id="map">
            <div id="map-container">
                <div id="map_canvas"></div>

                <div id="maploading" class="maploading" hidden>
                    <div>
                        <i class="spinner fa fa-cog fa-spin fa-3x"></i>
                    </div>
                </div>
            </div>

            <div id="controls">
                <div>
                    <div class="tish">
                        <div class="checkbox">
                            <label for="toggleLayer">
                                <input type="checkbox" name="layer" id="toggleLayer" value="1" checked>
                                <g:message code="all.regions"/>
                            </label>
                        </div>
                    </div>
                    <div id="layerOpacity"></div>
                </div>

                <div>
                    <div class="tish">
                        <div class="checkbox">
                            <label for="toggleRegion">
                                <input type="checkbox" name="region" id="toggleRegion" value="1" checked disabled>
                                <g:message code="selected.region"/>
                            </label>
                        </div>
                    </div>
                    <div id="regionOpacity"></div>
                </div>
            </div>
        </div><!--close map-->
    </div>
</div>

<asset:script type="text/javascript">
    var altMap = true;
    $(function() {

        $('#dev-notes').dialog({autoOpen: false, show: 'blind', hide: 'blind'});
        $('#dev-notes-link').click(function() {
            $('#dev-notes').dialog('open');
            return false;
        });

        init_regions({
            server: '${grailsApplication.config.getProperty('grails.serverURL')}',
            spatialService: "${grailsApplication.config.getProperty('layersService.baseURL')}/",
            spatialWms: "${grailsApplication.config.getProperty('geoserver.baseURL')}/ALA/wms?",
            spatialCache: "${grailsApplication.config.getProperty('geoserver.baseURL')}/ALA/wms?",
            accordionPanelMaxHeight: '${grailsApplication.config.getProperty('accordion.panel.maxHeight')}',
            mapBounds: JSON.parse('${grailsApplication.config.getProperty('map.bounds') ?: []}'),
            mapHeight: '${grailsApplication.config.getProperty('map.height')}',
            mapContainer: 'map_canvas',
            defaultRegionType: "${grailsApplication.config.getProperty('default.regionType')}",
            defaultRegion: "${grailsApplication.config.getProperty('default.region')}",
            showQueryContextLayer: ${grailsApplication.config.getProperty('layers.showQueryContext')},
            queryContextLayer: {
                name:"${grailsApplication.config.getProperty('layers.queryContextName')}",
                shortName:"${grailsApplication.config.getProperty('layers.queryContextShortName')}",
                fid:"${grailsApplication.config.getProperty('layers.queryContextFid')}",
                bieContext:"${grailsApplication.config.getProperty('layers.queryContextBieContext')}",
                order:"${grailsApplication.config.getProperty('layers.queryContextOrder')}",
                displayName:"${grailsApplication.config.getProperty('layers.queryContextDisplayName')}"
            },
            useGoogleApi: '${(grailsApplication.config.getProperty('google.apikey')) ? "true": ""}',
            mapMinimalUrl: "${grailsApplication.config.getProperty('map.minimal.url')}",
            mapMinimalAttribution: "${raw(grailsApplication.config.getProperty('map.minimal.attr'))}",
            mapMinimalSubdomains: "${grailsApplication.config.getProperty('map.minimal.subdomains')}",
            bbox: {
                sw: {
                    lat: ${grailsApplication.config.getProperty('map.minLat')},
                    lng: ${grailsApplication.config.getProperty('map.minLng')}
                },
                ne: {
                    lat: ${grailsApplication.config.getProperty('map.maxLat')},
                    lng: ${grailsApplication.config.getProperty('map.maxLng')}
                }
            }
        });
    });

    $('[data-toggle="tooltip"]').tooltip();

</asset:script>
</body>
</html>
