
<tbody>
<g:each in="${groups}" var="group">
    <tr id="${group.name}-row" class="group-row link" href="${g.createLink(controller: 'region', action: 'showSpecies')}"
        ${group.parent ? "parent=\"${group.parent}-row\"" : ""}
        aa-refresh-zones="speciesZone"
        js-before="regionWidget.selectGroup('${group.commonName}', ${group.parent ? true : false});"
        js-after="regionWidget.speciesLoaded();">
        <td class="level${group.parent ? '1' : '0'}">
            <g:if test="${!group.parent}">
            <i class="fa fa-chevron-right"></i>
            </g:if>
            ${group.commonName == 'ALL_SPECIES' ? 'All Species' : group.commonName}
        </td>
    </tr>
</g:each>
</tbody>