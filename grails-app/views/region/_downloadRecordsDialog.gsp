<div id="downloadRecordsModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
<aa:zone id="dialogZone">
    <g:form controller="region" action="download" class="form-horizontal">
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>
            <h3 id="myModalLabel">Download Records</h3>
        </div>
        <div class="modal-body">
            <p>
                By downloading this content you are agreeing to use it in accordance with the Atlas
                <a href="http://www.ala.org.au/about/terms-of-use/#TOUusingcontent">Terms of Use</a>
                and individual <a href=" http://www.ala.org.au/support/faq/#q29">Data Provider Terms</a>.
                <br/><br/>
            </p>

            <h4>Please provide the following details before downloading:</h4>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'email', 'error')}">
                <label class="control-label" for="email">Email</label>
                <div class="controls">
                    <g:textField name="email" value="${downloadParams.email}"/>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'fileName', 'error')}">
                <label class="control-label" for="fileName">File name</label>
                <div class="controls">
                    <g:textField name="fileName" value="${downloadParams.fileName?:'data'}"/>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'downloadReason', 'error')}">
                <label class="control-label" for="downloadReason">Download reason</label>
                <div class="controls">
                    <g:select id="type" name="downloadReason" value="${downloadParams.downloadReason}"
                              noSelection="${['':'Select One...']}"
                              from="${downloadReasons}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'downloadOption', 'error')}">
                <label class="control-label" for="downloadOption">Download option</label>
                <div class="controls">
                    <g:select id="type" name="downloadOption" value="${downloadParams.downloadOption}"
                              noSelection="${['':'Select One...']}"
                              from="${downloadOptions}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            <button type="submit" class="btn btn-primary"
                    aa-refresh-zones="dialogZone" js-before="AjaxAnywhere.dynamicParams=regionWidget.getCurrentState();">
                <i class="fa fa-download"></i> Download
            </button>
        </div>
    </g:form>
    <g:if test="${downloadUrl}">
        <script>
        <g:applyCodec encodeAs="none">
            <g:if test="${downloadParams.downloadOption != '2'}">
                window.location.href = '${downloadUrl}';
            </g:if>
            <g:else>
                window.open('${downloadUrl}');
            </g:else>
        </g:applyCodec>
            $('#downloadRecordsModal').modal('hide');
        </script>
    </g:if>
</aa:zone>
</div>