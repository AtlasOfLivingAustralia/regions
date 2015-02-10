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
            <div class="control-group ">
                <label class="control-label" for="downloadParams.email">Email</label>
                <div class="controls">
                    <g:textField name="downloadParams.email" value="${downloadParams.email}"/>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="downloadParams.fileName">File name</label>
                <div class="controls">
                    <g:textField name="downloadParams.fileName" value="${downloadParams.fileName?:'data'}"/>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="downloadParams.downloadReason">Download reason</label>
                <div class="controls">
                    <g:select id="type" name="downloadParams.downloadReason" value="${downloadParams.downloadReason}"
                              noSelection="${['null':'Select One...']}"
                              from="${downloadReasons}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>
            <div class="control-group">
                <label class="control-label" for="downloadParams.downloadOption">Download option</label>
                <div class="controls">
                    <g:select id="type" name="downloadParams.downloadOption" value="${downloadParams.downloadOption}"
                              noSelection="${['null':'Select One...']}"
                              from="${downloadOptions}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>

        </div>
        <div class="modal-footer">
            <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            <button type="submit" aa-refresh-zones="dialogZone" class="btn btn-primary"><i class="fa fa-download"></i> Download</button>
        </div>
    </g:form>
</aa:zone>
</div>