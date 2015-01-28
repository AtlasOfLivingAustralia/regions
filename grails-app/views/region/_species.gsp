<g:if test="${!pageIndex}">
<tbody>
</g:if>


<g:each in="${species}" var="singleSpecies" status="i">
    <tr class="link">
        <td>
            ${(pageIndex * 50) + i + 1}.
        </td>
        <td>
            ${singleSpecies.name}${singleSpecies.commonName ? " : ${singleSpecies.commonName}" : ''}
        </td>
        <td class="text-right">
            ${g.formatNumber(number: singleSpecies.count, type: 'number')}
        </td>
    </tr>
    <tr class="infoRowLinks" style="display: none;">
        <td>&nbsp;</td>
        <td colspan="2">
            <a href="${speciesPageUrl}/${singleSpecies.guid}" class="btn btn-mini btn-info" title="View Species page"><i class="fa fa-external-link"></i> Species Profile</a>
            &nbsp;|&nbsp;
            <a href="${rg.speciesRecordListUrl([name: singleSpecies.name, rank: singleSpecies.rank, regionFid: regionFid, regionName: regionName, regionType: regionType, from: from, to: to])}"
               class="btn btn-mini btn-success" title="View list of Records"><i class="fa fa-database"></i> List of Records</a>
        </td>
    </tr>
</g:each>

<g:if test="${species.size() % 50 == 0}">
    <aa:zone id="speciesZone" tag="tr">
        <td colspan="2" class="text-center">
            <a aa-refresh-zones="speciesZone" id="showMoreSpeciesButton"
               href="${g.createLink(controller: 'region', action: 'showSpecies', params: [pageIndex: pageIndex ? pageIndex + 1 : '1'])}"
               js-before="regionWidget.showMoreSpecies();"
               js-after=""
               class="btn btn-primary btn-small"><i class="fa fa-plus"></i> Show more species</a>
        </td>
        <td></td>
    </aa:zone>
</g:if>

<g:if test="${!pageIndex}">
</tbody>
</g:if>
