<ul class="thumbnails">
<g:each in="${emblems}" var="emblem">

    <li class="span3">
        <div class="media thumbnail">
            <a class="pull-left" href="${emblem?.speciesUrl}" title="Go to ${emblem?.commonName} details.">
                <img src="${emblem?.imgUrl}" class="media-object" alt="${emblem?.scientificName} image"/>
            </a>
            <div class="media-body">
                <h4 class="media-heading">${emblem?.emblemType}</h4>
                <span><i>${emblem?.scientificName}</i><br/>${emblem?.commonName}</span>
            </div>
        </div>
    </li>
</g:each>
</ul>