
<tbody>
<g:each in="${groups}" var="group">
    <tr id="${group.name}-row" class="group-row link" href="${g.createLink(controller: 'region', action: 'showSpecies')}"
        aa-refresh-zones="speciesZone"
        js-before="regionWidget.selectGroup('${group.name}');"
        js-after="regionWidget.speciesLoaded();">
        <td class="level${group.level}">${group.name == 'ALL_SPECIES' ? 'All species' : group.name }</td>
        <td class="text-right">${g.formatNumber(number: group.speciesCount, type: 'number')}</td>
    </tr>
</g:each>
</tbody>