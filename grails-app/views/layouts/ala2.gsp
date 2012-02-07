<%@ page import="org.codehaus.groovy.grails.commons.ConfigurationHolder" %>
<!DOCTYPE html>
<html>
<head>
    <meta name="app.version" content="${g.meta(name:'app.version')}"/>
    <meta name="app.build" content="${g.meta(name:'app.build')}"/>
    <g:if test="${instance}">
        <meta name="description" content="The Atlas of Living Australia's description of the ${instance?.name}. ${instance?.makeAbstract(200)}"/>
    </g:if>
    <g:else>
        <meta name="description" content="Explore Australia's Biodiversity by region."/>
    </g:else>
    <title><g:layoutTitle /></title>
    <link rel="stylesheet" href="http://www.ala.org.au/wp-content/themes/ala2011/style.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="http://www.ala.org.au/wp-content/themes/ala2011/css/wp-styles.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="http://www.ala.org.au/wp-content/themes/ala2011/css/buttons.css" type="text/css" media="screen" />
    <link rel="icon" type="image/x-icon" href="http://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico" />
    <link rel="shortcut icon" type="image/x-icon" href="http://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico" />
    <link rel="stylesheet" type="text/css" media="screen" href="http://www.ala.org.au/wp-content/themes/ala2011/css/jquery.autocomplete.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="http://www.ala.org.au/wp-content/themes/ala2011/css/search.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="http://www.ala.org.au/wp-content/themes/ala2011/css/skin.css" />
    <link rel="stylesheet" type="text/css" media="screen" href="http://www.ala.org.au/wp-content/themes/ala2011/css/sf.css" />

    <link rel="stylesheet" href="${resource(dir:'css',file:'public.css')}"/>
    <link rel="stylesheet" href="${resource(dir:'css/smoothness',file:'jquery-ui-1.8.14.custom.css')}" type="text/css" media="screen"/>

    %{--<script language="JavaScript" type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>--}%
    <g:javascript library="application" />
    <g:javascript library="jquery-1.7.min"/>
    <g:javascript library="jquery-ui-1.8.14.custom-notabs.min"/>
    <g:layoutHead />
    <script type="text/javascript" src="http://www.ala.org.au/wp-content/themes/ala2011/scripts/html5.js"></script>
    <script language="JavaScript" type="text/javascript" src="http://www.ala.org.au/wp-content/themes/ala2011/scripts/superfish/superfish.js"></script>
    <script language="JavaScript" type="text/javascript" src="http://www.ala.org.au/wp-content/themes/ala2011/scripts/jquery.autocomplete.js"></script>
    <script language="JavaScript" type="text/javascript" src="http://www.ala.org.au/wp-content/themes/ala2011/scripts/uservoice.js"></script>
    <script type="text/javascript">

        // initialise plugins

        jQuery(function(){
            jQuery('ul.sf').superfish( {
                delay:500,
                autoArrows:false,
                dropShadows:false
            });

            jQuery("form#search-form input#search").autocomplete('http://bie.ala.org.au/search/auto.jsonp', {
                extraParams: {limit: 100},
                dataType: 'jsonp',
                parse: function(data) {
                    var rows = new Array();
                    data = data.autoCompleteList;
                    for(var i=0; i<data.length; i++){
                        rows[i] = {
                            data:data[i],
                            value: data[i].matchedNames[0],
                            result: data[i].matchedNames[0]
                        };
                    }
                    return rows;
                },
                matchSubset: false,
                formatItem: function(row, i, n) {
                    return row.matchedNames[0];
                },
                cacheLength: 10,
                minChars: 3,
                scroll: false,
                max: 10,
                selectFirst: false
            });
            jQuery("form#search-inpage input#search").autocomplete('http://bie.ala.org.au/search/auto.jsonp', {
                extraParams: {limit: 100},
                dataType: 'jsonp',
                parse: function(data) {
                    var rows = new Array();
                    data = data.autoCompleteList;
                    for(var i=0; i<data.length; i++){
                        rows[i] = {
                            data:data[i],
                            value: data[i].matchedNames[0],
                            result: data[i].matchedNames[0]
                        };
                    }
                    return rows;
                },
                matchSubset: false,
                formatItem: function(row, i, n) {
                    return row.matchedNames[0];
                },
                cacheLength: 10,
                minChars: 3,
                scroll: false,
                max: 10,
                selectFirst: false
            });
        });
    </script>
</head>
<body class='species'>
<header id="site-header">
    <div class="inner">
        <h1 title="Atlas of Living Australia"><a href="http://www.ala.org.au" title="Atlas of Living Australia home"><img src="http://www.ala.org.au/wp-content/themes/ala2011/images/logo.png" width="315" height="33" alt="" /></a></h1>
        <section id="nav-search">
            <section id="header-search">
                <form id="search-form" action="http://bie.ala.org.au/search" method="get" name="search-form"><label for="search">Search</label>
                    <input id="search" class="filled" title="Search" type="text" name="q" placeholder="Search the Atlas" />
                    <span class="search-button-wrapper"><button id="search-button" class="search-button" value="Search" type="submit"><img src="http://www.ala.org.au/wp-content/themes/ala2011/images/button_search-grey.png" alt="Search" width="12" height="12" /></button></span></form>
            </section>
            <nav>
                <ol>
                    <li><a href="http://www.ala.org.au" title="Atlas of Living Australia home">Home</a></li>
                    <li class="last"><a href="http://www.ala.org.au/wp-content/themes/ala2011/Logout.php">Log out</a></li>
                </ol>
            </nav>
        </section>
    </div>
</header>
<nav id="nav-site">
    <!-- WP Menubar 4.10: start menu nav-site, template Superfish, CSS  -->
    <ul class="sf sf-js-enabled"><li class="nav-species"><a href="http://www.ala.org.au/australias-species/">Species</a></li><li class="nav-locations selected"><a href="http://www.ala.org.au/species-by-location/">Locations</a></li><li class="nav-collections"><a href="http://collections.ala.org.au">Collections</a></li><li class="nav-mapping"><a href="http://spatial.ala.org.au">Mapping &amp; analysis</a></li><li class="nav-datasets"><a href="http://www.ala.org.au/data-sets/">Data sets</a></li><li class="nav-blogs"><a href="http://www.ala.org.au/blogs-news/">Blogs</a></li><li class="nav-getinvolved"><a href="http://www.ala.org.au/get-involved/">Get involved</a></li><li class="nav-about"><a href="http://www.ala.org.au/about-the-atlas/">About the Atlas</a><ul style="display: none; visibility: hidden; "><li><a href="http://www.ala.org.au/about-the-atlas/atlas-background/">Atlas background</a></li><li><a href="http://www.ala.org.au/about-the-atlas/atlas-data/">Atlas data</a></li><li><a href="http://www.ala.org.au/about-the-atlas/our-data-providers/">Our data providers</a></li><li><a href="http://www.ala.org.au/about-the-atlas/how-we-integrate-data/">How we integrate data</a></li><li><a href="http://www.ala.org.au/about-the-atlas/downloadable-tools/">Downloadable tools</a></li><li><a href="http://www.ala.org.au/about-the-atlas/digitisation-guidance/">Digitisation guidance</a></li><li><a href="http://www.ala.org.au/about-the-atlas/communications-centre/">Communications centre</a></li><li><a href="http://www.ala.org.au/about-the-atlas/terms-of-use/">Terms of Use</a></li><li><a href="http://www.ala.org.au/about-the-atlas/contact-us/">Contact us</a></li></ul></li></ul>
    <!-- WP Menubar 4.10: end menu nav-site, template Superfish, CSS  -->
</nav>

<div id="spinner" class="spinner" style="display:none;">
    <img src="${resource(dir:'images',file:'spinner.gif')}" alt="${message(code:'spinner.alt',default:'Loading...')}" />
</div>


<g:layoutBody />

<footer>
    <nav id="nav-footer-site">
        <ol><li id="menu-item-24746" class="first menu-item menu-item-type-post_type menu-item-object-page menu-item-24746"><a href="http://www.ala.org.au/about-the-atlas/">About the Atlas</a></li>
            <li id="menu-item-24883" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-24883"><a href="http://www.ala.org.au/about-the-atlas/contact-us/">Contact us</a></li>
            <li id="menu-item-25785" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-25785"><a href="http://www.ala.org.au/faq/">FAQ</a></li>
            <li id="menu-item-26367" class="menu-item menu-item-type-post_type menu-item-object-page menu-item-26367"><a href="http://www.ala.org.au/about-the-atlas/atlas-background/atlas-partners/">Partners</a></li>
        </ol>	</nav>
    <nav id="fat-footer">
        <!-- WP Menubar 4.10: start menu fat-footer, template Fat_Footer, CSS  -->


        <ul><li class="first">Map &amp; analyse<ul><li><a href="http://regions.ala.org.au/">Species by region</a></li><li><a href="http://biocache.ala.org.au/explore/your-area">Species in your area</a></li><li><a href="http://spatial.ala.org.au/">Species distributions</a></li><li><a href="http://www.ala.org.au/faq/spatial-portal/">Spatial case studies</a></li></ul></li><li>Download<ul><li><a href="http://www.ala.org.au/about-the-atlas/downloadable-tools/open-source-software/">Open source software</a></li><li><a href="http://www.ala.org.au/about-the-atlas/downloadable-tools/field-data-capture-toolkit/">Field Data Capture toolkit</a></li><li><a href="http://www.ala.org.au/about-the-atlas/downloadable-tools/web-services/">Web services</a></li></ul></li><li>Share<ul><li><a href="http://volunteer.ala.org.au/">Volunteer for online projects</a></li><li><a href="http://www.ala.org.au/get-involved/">Record sightings</a></li><li><a href="">Upload data sets</a></li><li><a href="http://www.ala.org.au/get-involved/">Upload media</a></li><li><a href="http://www.ala.org.au/faq/data-licensing/">Terms &amp; conditions of sharing</a></li><li><a href="http://www.ala.org.au/about-the-atlas/terms-of-use/privacy-policy/">Privacy</a></li></ul></li><li>Data<ul><li><a href="http://biocache.ala.org.au">Find a record</a></li><li><a href="http://collections.ala.org.au/datasets">Find a data set</a></li><li><a href="http://www.ala.org.au/faq/data-sensitivity/">Sensitive data</a></li><li><a href="http://www.ala.org.au/about-the-atlas/how-we-integrate-data/">Data integration</a></li></ul></li><li>Publications<ul><li><a href="http://www.ala.org.au/faq/">FAQ</a></li><li><a href="http://www.ala.org.au/faq/citizen-science/field-data-capture-toolkit-help/">Field Data Capture Toolkit help</a></li><li><a href="http://www.ala.org.au/about-the-atlas/communications-centre/">Communications</a></li><li><a href="http://www.ala.org.au/about-the-atlas/atlas-background/atlas-governance/">Atlas governance</a></li><li><a href="http://www.ala.org.au/about-the-atlas/digitisation-guidance/">Digitisation guidance</a></li></ul></li><li class="last">Associated sites<ul><li><a href="http://bhl.ala.org.au/">Biodiversity Heritage Library </a></li><li><a href="http://identifylife.org/">IdentifyLife</a></li><li><a href="http://morphbank.ala.org.au/">Morphbank  images</a></li><li><a href="http://www.ozcam.org.au/">OZCAM</a></li><li><a href="http://www.chah.gov.au/avh/">Australia's Virtual Herbarium</a></li><li><a href="http://bold.ala.org.au/">BOLD</a></li><li><a href="http://biodiversity.org.au/confluence/display/bdv/NSL%2bServices">National Species Lists</a></li><li><a href="http://www.taxonomy.org.au">TRIN Biodiversity Information</a></li></ul></li></ul>

        <!-- WP Menubar 4.10: end menu fat-footer, template Fat_Footer, CSS  -->
    </nav>
    <section class="copyright">
        <div class="img-left"><a href="http://creativecommons.org/licenses/by/3.0/au/" title="External link to Creative Commons"><img src="http://www.ala.org.au/wp-content/themes/ala2011/images/creativecommons.png" width="88" height="31" alt=""></a></div><p>This site is licensed under a <a href="http://creativecommons.org/licenses/by/3.0/au/" title="External link to Creative Commons">Creative Commons Attribution 3.0 Australia License</a>.<br>Provider content may be covered by other <a href="http://www.ala.org.au/about-the-atlas/terms-of-use/" title="Terms of Use">Terms of Use</a>.</p><div class="img-right"><img src="http://www.ala.org.au/wp-content/themes/ala2011/images/agi-s.png" width="167" height="46" alt="Atlas of Living Australia, an Australian Government Initiative"></div>
    </section>
</footer>
<script type="text/javascript">
    var gaJsHost = (("https:" == document.location.protocol) ? "https://ssl." : "http://www.");
    document.write(unescape("%3Cscript src='" + gaJsHost + "google-analytics.com/ga.js' type='text/javascript'%3E%3C/script%3E"));
</script>
<script type="text/javascript">
    var pageTracker = _gat._getTracker("UA-4355440-1");
    pageTracker._initData();
    pageTracker._trackPageview();
</script>
<script type="text/javascript">
    // show warning if using IE6
    if ($.browser.msie && $.browser.version.slice(0,1) == '6') {
        $('#header').prepend($('<div style="text-align:center;color:red;">WARNING: This page is not compatible with IE6.' +
                ' Many functions will still work but layout and image transparency will be disrupted.</div>'));
    }
</script>
</body>
</html>