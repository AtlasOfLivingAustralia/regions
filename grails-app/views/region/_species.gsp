<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<zones>
        <g:if test="${!pageIndex || pageIndex == 0}">
            <zone id="speciesZone"><![CDATA[
            <tbody id="speciesZone">
        </g:if>

    <g:if test="${pageIndex && pageIndex != 0}">
        <zone id="moreSpeciesZone"><![CDATA[
    </g:if>

        <g:if test="${species.totalRecords == 0}">
            <tr>
                <td colspan="3">No records found.</td>
            </tr>
        </g:if>

        <g:each in="${species.records}" var="singleSpecies" status="i">
            <tr class="link" id="${singleSpecies.guid}">
                <td>
                    ${(pageIndex * 50) + i + 1}.
                </td>
                <td>
                    ${singleSpecies.name}${singleSpecies.commonName ? " : ${singleSpecies.commonName}" : ""}
                </td>
                <td class="text-right">
                    ${g.formatNumber(number: singleSpecies.count, type: 'number')}
                </td>
            </tr>
            <tr class="infoRowLinks" style="display: none;">
                <td>&nbsp;</td>
                <td colspan="2">
                    <a href="${speciesPageUrl}/${singleSpecies.guid}" class="btn btn-default btn-xs"
                       title="${g.message(code:'species.profile.alt')}" class="regionsSpeciesPageLink"><i class="fa fa-share-square-o"></i>
                        <g:message code="species.profile" />
                    </a>
                    <a href="${rg.speciesRecordListUrl([guid: singleSpecies.guid, regionFid: regionFid, regionName: regionName, regionType: regionType, regionPid: regionPid, from: from, to: to, showHubData: showHubData])}"
                       class="btn btn-default btn-xs" title="${g.message(code:'list.records.alt')}"><i
                            class="fa fa-database"></i>
                        <g:message code="list.records" />
                    </a>
                </td>
            </tr>
        </g:each>

        <tr id="moreSpeciesZone" totalRecords="${species.totalRecords}" speciesCount="${species.speciesCount}"
            style="${species.records.size() > 0 && species.records.size() % 50 == 0 ? "" : "display:none;"}">
            <td colspan="2" class="text-center">
                <a aa-refresh-zones="moreSpeciesZone" id="showMoreSpeciesButton"
                   href="${g.createLink(controller: 'region', action: 'showSpecies', params: [pageIndex: pageIndex ? pageIndex + 1 : '1'])}"
                   aa-js-before="regionWidget.showMoreSpecies();"
                   aa-js-after="regionWidget.speciesLoaded();"
                   aa-queue="abort"
                   class="btn btn-default btn-sm"><i class="fa fa-plus"></i>

                    <g:message code="show.more.species" />
                </a>
            </td>
            <td></td>
        </tr>

        <tr style="display:none" id="toDelete"><td><div class="text-center" id="exploreButtonsNew">
            <a href="${rg.speciesRecordListUrl([guid: null, regionFid: regionFid,
                                                regionName: regionName, regionType: regionType,
                                                regionPid: regionPid, from: from, to: to,
                                                group: group, subgroup: subgroup,
                                                showHubData: showHubData, fq: fq])}"
               id="viewRecords" class="btn btn-default"><i class="fa fa-share-square-o"></i>
                <g:message code="view.records" />
            </a>

            <a href="${rg.downloadRecordListUrl([guid: null, regionFid: regionFid,
                                                 regionName: regionName, regionType: regionType,
                                                 regionPid: regionPid, from: from, to: to,
                                                 group: group, subgroup: subgroup,
                                                 showHubData: showHubData, fq: fq])}"
               id="downloadRecords" class="btn btn-default"><i class="fa fa-download"></i>
                <g:message code="download.records" />

            </a>
        </div></td></tr>

        <g:if test="${!pageIndex || pageIndex == 0}">
            </tbody>
        </g:if>

        <script>
            $(function() {
                var tmp = $('#exploreButtons');
                if (tmp) {
                    $('#exploreButtons').remove();
                }

                $('#exploreButtonsNew').appendTo($('#exploreButtonsZone'));
                $('#exploreButtonsNew').attr('id', 'exploreButtons');

                $('#toDelete').remove()
            })
        </script>

        ]]></zone></zones>

