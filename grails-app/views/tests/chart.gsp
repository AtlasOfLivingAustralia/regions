<!DOCTYPE html>
<html>
  <head>
      <title>Chart generator</title>
      <link rel="stylesheet" href="${resource(dir:'css',file:'charts.css')}" />
      <g:javascript library="jquery-1.5.1.min"/>
      <script type="text/javascript" language="javascript" src="http://www.google.com/jsapi"></script>
      <script type="text/javascript" src="http://jquery-jsonp.googlecode.com/files/jquery.jsonp-2.1.4.min.js"></script>
      %{--<script type="text/javascript" src="http://collections.ala.org.au/js/charts.js"></script>--}%
      <g:javascript library="charts"/>
      <style>
          input[type=radio] {margin-left: 15px;}
          h1 {color: #718804 }
      </style>
  </head>
  <body style="padding: 20px;">
    <h1>Chart sampler</h1>
    <h2>Enter a query and choose a chart type</h2>
    <label for="query">Query:</label> <input id="query" type="text" size="80"/>
    <button type="button" id="draw">Draw chart</button>
    <div style="margin: 20px 0;">
        <div style="padding-right: 10px; float:left; height:100px;">Type:</div>
        <div id="types" style="display:inline; max-width:600px;">
            <div style="padding-bottom:10px;">
                <g:radio name="type" value="taxonomy" checked="checked"/> Taxonomy
                (optional: - <label for="rank">starting rank:</label> <input id="rank" type="text" size="20"/> OR
                <label for="max">threshold:</label> <input id="max" type="text" size="20"/>)
            </div>
            <div style="padding-bottom: 8px;">
                <g:radio name="type" value="state"/> State
                <g:radio name="type" value="institution_uid"/> Institution
                <g:radio name="type" value="data_resource_uid"/> Data set
                <g:radio name="type" value="type_status"/> Types
                <g:radio name="type" value="species_group"/> Common groups
            </div>
            <div style="padding-bottom: 8px;">
                <g:radio name="type" value="assertions"/> Data assertions
                <g:radio name="type" value="occurrence_year"/> Decades
                <g:radio name="type" value="biogeographic_region"/> Biogeographic region
                <g:radio name="type" value="state_conservation"/> State conservation
            </div>
            <div style="padding-bottom: 8px;">
                <g:radio name="type" value="other"/> Other named facet:
                <label for="other"></label> <input id="other" type="text" size="40"/>
            </div>
        </div>
    </div>

    <div id="charts"></div>

    <script type="text/javascript">
        var taxonomyChartOptions = { rank: "kingdom", error: "badQuery" }
        var facetChartOptions = { error: "badQuery" }
        $('#draw').click(drawChart);
        $('body').keypress(function(event) {
            if (event.which == 13) {
                event.preventDefault();
                drawChart();
            }
        });

        function drawChart() {
            $('#charts').html("");
            var query = $('#query').val();
            var type = $('#types input:checked').val();
            if (type == "taxonomy") {
                taxonomyChartOptions.query = query;
                loadTaxonomyChart(taxonomyChartOptions);
            }
            else {
                facetChartOptions.query = query;
                facetChartOptions.charts = [type];
                loadFacetCharts(facetChartOptions);
            }
        }

        function badQuery() {
            $('#charts').append($('<span>Bad query</span>'));
        }
        google.load("visualization", "1", {packages:["corechart"]});
    </script>
  </body>
</html>