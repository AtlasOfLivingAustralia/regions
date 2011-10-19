<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Test stuff</title>
      <meta name="layout" content="ala" />
    <g:javascript src="OpenLayers/OpenLayers.js" />
    <g:javascript library="jquery.cookie" />
    <g:javascript library="map2" />
    <script type="text/javascript">
            var availableTags = [
                "ActionScript",
                "AppleScript",
                "Asp",
                "BASIC",
                "C",
                "C++",
                "Clojure",
                "COBOL",
                "ColdFusion",
                "Erlang",
                "Fortran",
                "Groovy",
                "Haskell",
                "Java",
                "JavaScript",
                "Lisp",
                "Perl",
                "PHP",
                "Python",
                "Ruby",
                "Scala",
                "Scheme"
            ];
            function initTest() {
                $( "#regionSearch" ).autocomplete({
                    source: availableTags
                });
            }
    </script>
  </head>
  <body onload="initTest();">
<h1 id="title">Autocomplete</h1>

<div class="demo">

    <div class='region-search ui-widget'>
        <label for="regionSearch">Search: </label><br/>
        <input id="regionSearch">
    </div>

</div><!-- End demo -->

</body>
</html>