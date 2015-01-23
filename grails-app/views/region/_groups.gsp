
<tbody>
<g:each in="${groups}" var="group">
    <tr>
        <td class="level${group.level}">${group.name == 'ALL_SPECIES' ? 'All species' : group.name }</td>
        <td class="text-right">${g.formatNumber(number: group.speciesCount, type: 'number')}</td>
    </tr>
</g:each>
</tbody>