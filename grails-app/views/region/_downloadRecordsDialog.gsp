<div id="downloadRecordsModal" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
<aa:zone id="dialogZone">
    <g:form controller="region" action="download" params="[regionType : region.type, regionName : region.regionName, regionFid : region.regionFid, regionPid : region.regionPid]" class="form-horizontal">
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
                    <g:textField id="email" name="email" value="${downloadParams.email}"/>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'fileName', 'error')}">
                <label class="control-label" for="fileName">File name</label>
                <div class="controls">
                    <g:textField id="fileName" name="fileName" value="${downloadParams.fileName?:'data'}"/>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'downloadReason', 'error')}">
                <label class="control-label" for="downloadReason">Download reason</label>
                <div class="controls">
                    <g:select id="downloadReason" name="downloadReason" value="${downloadParams.downloadReason}"
                              noSelection="${['':'Select One...']}"
                              from="${downloadReasons}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>
            <div class="control-group ${g.hasErrors(bean: downloadParams, field: 'downloadOption', 'error')}">
                <label class="control-label" for="downloadOption">Download option</label>
                <div class="controls">
                    <g:select id="downloadOption" name="downloadOption" value="${downloadParams.downloadOption}"
                              noSelection="${['':'Select One...']}"
                              from="${downloadOptions}"
                              optionKey="key" optionValue="value">
                    </g:select>
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn" data-dismiss="modal" aria-hidden="true">Close</button>
            <button id='downloadStart' class="btn btn-primary"
                    aa-refresh-zones="dialogZone" js-before="AjaxAnywhere.dynamicParams=regionWidget.getCurrentState();">
                <i class="fa fa-download"></i> Download
            </button>
        </div>
    </g:form>
    <script>
        $(document).ready(function() {
            // catch download submit button
            // Note the unbind().bind() syntax - due to Jquery ready being inside <body> tag.

            // start download button
            $("#downloadStart").unbind("click").bind("click",function(e) {
                e.preventDefault();
                var downloadReason = $( "#downloadReason option:selected").val()
                var downloadOption = $( "#downloadOption option:selected").val()

                if (validateForm()) {
                    if (downloadOption == "0") {
                        var downloadUrl = decodeURIComponent('${downloadRecordsUrl}') + "&email=" + $("#email").val() + "&reasonTypeId=" +
                                $("#downloadReason").val() + "&file=" + $("#fileName").val() + "&extra=dataResourceUid,dataResourceName.p";

                        //alert(downloadUrl)
                        window.location.href = downloadUrl;
                    } else if (downloadOption == "1") {
                        var downloadUrl = decodeURIComponent('${downloadChecklistUrl}') + "&email=" + $("#email").val() + "&reasonTypeId=" +
                                $("#downloadReason").val() + "&file=" + $("#fileName").val();

                        //alert(downloadUrl)
                        window.location.href = downloadUrl;
                    } else if (downloadOption == "2") {
                        var downloadUrl = decodeURIComponent('${downloadFieldguideUrl}') +"&email="+$("#email").val()+"&reasonTypeId="+
                                $("#downloadReason").val()+"&file="+$("#fileName").val();

                        //alert(downloadUrl)
                        window.open(downloadUrl);
                    }
                    $('#downloadRecordsModal').modal('hide');
                }
            });
        });

        function validateForm() {
            var isValid = false;
            var downloadReason = $("#downloadReason option:selected").val();
            var downloadOption = $( "#downloadOption option:selected").val()
            var email = $( "#email").val()

            if (!downloadReason) {
                $("#downloadReason").focus();
                $("label[for='downloadReason']").css("color","red");
                alert("Please select a \"download reason\" from the drop-down list");
            } else if (!downloadOption) {
                $("#downloadOption").focus();
                $("label[for='downloadOption']").css("color","red");
                alert("Please select a \"download option\" from the drop-down list");
                return
            } else if (!email) {
                $("#email").focus();
                $("label[for='email']").css("color","red");
                alert("Please enter an email address");
            } else {
                isValid = true
            }

            return isValid;
        }


    </script>
</aa:zone>
</div>