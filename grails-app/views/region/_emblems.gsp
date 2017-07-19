<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<zones>
    <zone id="emblems"><![CDATA[

        <div id="emblems" tagName="div">
            <ul class="thumbnails">
                <g:each in="${emblems}" var="emblem">
                    <li class="col-md-3">
                        <a href="${emblem?.speciesUrl}" title="Go to ${emblem?.commonName} details.">
                            <div class="media thumbnail">
                                <img class="pull-left" src="${emblem?.imgUrl}" class="media-object"
                                     alt="${emblem?.scientificName} image"></img>

                                <div class="media-body">
                                    <h4 class="media-heading">${emblem?.emblemType}</h4>
                                    <span><i>${emblem?.scientificName}</i><br/>${emblem?.commonName}</span>
                                </div>
                            </div>
                        </a>
                    </li>
                </g:each>
            </ul>
        </div>

        ]]></zone></zones>