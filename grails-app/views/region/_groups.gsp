<g:each in="${groups}" var="group">
    <tr>
        <td>${group.name}</td>
        <td class="${group.level}">${group.speciesCount}</td>
    </tr>
</g:each>