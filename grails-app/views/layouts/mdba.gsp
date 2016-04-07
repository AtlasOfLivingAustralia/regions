<g:set var="orgNameLong" value="${grailsApplication.config.skin.orgNameLong}"/>
<g:set var="orgNameShort" value="${grailsApplication.config.skin.orgNameShort}"/>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <rg:addApplicationMetaTags />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" type="image/x-icon" href="${request.contextPath}/images/mdba/favicons.ico/favicon.ico">

    <title><g:layoutTitle /></title>
    <r:require modules="bootstrap,mdba" />
    %{--<link href='http://fonts.googleapis.com/css?family=Lato:400,700,400italic,700italic,300,300italic' rel='stylesheet' type='text/css'>--}%
    %{--<link href='http://livedata.mdba.gov.au/sites/all/themes/watersource_foundation/fonts/mdba-fonts/Common_fonts.css' rel='stylesheet' type='text/css'>--}%
    <style type="text/css">

    </style>
    %{--<r:script disposition='head'>--}%
        %{--// initialise plugins--}%
        %{--jQuery(function(){--}%
            %{--// autocomplete on navbar search input--}%
            %{--jQuery("form#search-form-2011 input#search-2011, form#search-inpage input#search, input#search-2013").autocomplete('http://bie.ala.org.au/search/auto.jsonp', {--}%
                %{--extraParams: {limit: 100},--}%
                %{--dataType: 'jsonp',--}%
                %{--parse: function(data) {--}%
                    %{--var rows = new Array();--}%
                    %{--data = data.autoCompleteList;--}%
                    %{--for(var i=0; i<data.length; i++) {--}%
                        %{--rows[i] = {--}%
                            %{--data:data[i],--}%
                            %{--value: data[i].matchedNames[0],--}%
                            %{--result: data[i].matchedNames[0]--}%
                        %{--};--}%
                    %{--}--}%
                    %{--return rows;--}%
                %{--},--}%
                %{--matchSubset: false,--}%
                %{--formatItem: function(row, i, n) {--}%
                    %{--return row.matchedNames[0];--}%
                %{--},--}%
                %{--cacheLength: 10,--}%
                %{--minChars: 3,--}%
                %{--scroll: false,--}%
                %{--max: 10,--}%
                %{--selectFirst: false--}%
            %{--});--}%

            %{--// Mobile/desktop toggle--}%
            %{--// TODO: set a cookie so user's choice is remembered across pages--}%
            %{--var responsiveCssFile = $("#responsiveCss").attr("href"); // remember set href--}%
            %{--$(".toggleResponsive").click(function(e) {--}%
                %{--e.preventDefault();--}%
                %{--$(this).find("i").toggleClass("icon-resize-small icon-resize-full");--}%
                %{--var currentHref = $("#responsiveCss").attr("href");--}%
                %{--if (currentHref) {--}%
                    %{--$("#responsiveCss").attr("href", ""); // set to desktop (fixed)--}%
                    %{--$(this).find("span").html("Mobile");--}%
                %{--} else {--}%
                    %{--$("#responsiveCss").attr("href", responsiveCssFile); // set to mobile (responsive)--}%
                    %{--$(this).find("span").html("Desktop");--}%
                %{--}--}%
            %{--});--}%

            %{--$('.helphover').popover({animation: true, trigger:'hover'});--}%
        %{--});--}%
    %{--</r:script>--}%
    <r:layoutResources/>
    <g:layoutHead />
</head>
<body class="${pageProperty(name:'body.class')?:'nav-collections'}" id="${pageProperty(name:'body.id')}" onload="${pageProperty(name:'body.onload')}"  data-offset="${pageProperty(name:'body.data-offset')}" data-target="${pageProperty(name:'body.data-target')}" data-spy="${pageProperty(name:'body.data-spy')}">

<g:set var="fluidLayout" value="${grailsApplication.config.skin.fluidLayout?.toBoolean()}"/>
<div class="navbar navbar-inverse navbar-static-top">
    <div class="navbar-inner contain-to-grid">
        <div class="${fluidLayout?'container-fluid':'container'}">
            <button type="button" class="btn btn-navbar" data-toggle="collapse" data-target=".nav-collapse">
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
            </button>
            <a class="brand" href="http://www.mdba.gov.au/" id="mdbaLink" title="MDBA home page">
                <g:img dir="/images/mdba" file="MDBA-logo.png" alt="MDBA logo" class="headerLogo"/>
                <div id="mdbaHeadingText">MDBA</div>
            </a>
            <a class="brand" href="http://ala.org.au/" id="alaLink" title="ALA home page">
                <g:img dir="/images" file="ALA-logo-BW-124x109.png" alt="Powered by ALA logo" class="headerLogo"/>
                <div id="alaHeadingText"><div id="poweredBy">powered by</div><div id="alaBy" class="visible-desktop">Atlas of Living Australia</div>
                <div class="hidden-desktop">ALA</div></div>
            </a>
            <div class="pull-right">
                <div class="nav-collapse collapse pull-right">
                    <ul class="nav">
                        <li><a href="${grailsApplication.config.skin.homeURL}/index">Home</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/search">Search</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/about">About</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/help">Help</a></li>
                    </ul>
                </div><!--/.nav-collapse -->
                %{--<div class="controls" style="padding-top: 18px">--}%
                    %{--<div class="input-append">--}%
                        %{--<input type="text" name="taxa" id="taxa" class="input-large">--}%
                        %{--<button id="locationSearch" type="submit" class="btn"><g:message code="home.index.simsplesearch.button" default="Search"/></button>--}%
                    %{--</div>--}%
                %{--</div>--}%
            </div>
        </div><!--/.container-fluid -->
    </div><!--/.navbar-inner -->
</div><!--/.navbar -->

<g:pageProperty name="page.page-header"/> <%-- allows special content to be inserted --%>

<div class="${fluidLayout?'container-fluid':'container'}" id="main-content">
    <g:layoutBody />
</div><!--/.container-->

<div id="footer">
   <div class="${fluidLayout?'container-fluid':'container'}">
       <div class="row  navbar-inverse">
           <div class="span6">
               <ul class="nav">
                   <li><a href="${grailsApplication.config.skin.homeURL}/contact">Contact us </a></li>
                   <li><a href="${grailsApplication.config.skin.homeURL}/access">Accessibility </a></li>
                   <li><a href="${grailsApplication.config.skin.homeURL}/disclaim">Disclaimer</a></li>
               </ul>
           </div><!--/.spanX -->
           <div class="span6 smlinks text-right">
               <div id="smlinks">
                   <a href="https://twitter.com/MD_Basin_Auth">
                       <span class="fa-stack fa-lg">
                           <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
                           <i class="fa fa-twitter fa-stack-1x"></i>
                       </span>
                       %{--<g:img dir="/images" file="twitter-icon.png" alt="MDBA on Twitter"/>--}%
                   </a>
                   <a href="https://www.youtube.com/user/mdbamedia">
                       <span class="fa-stack fa-lg">
                           <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
                           <i class="fa fa-youtube fa-stack-1x"></i>
                       </span>
                       %{--<g:img dir="/images" file="youtube-icon.png" alt="MDBA on Youtube"/>--}%
                   </a>
                   <a href="https://www.facebook.com/MDBAuth">
                       <span class="fa-stack fa-lg">
                           <i class="fa fa-circle fa-stack-2x fa-inverse"></i>
                           <i class="fa fa-facebook fa-stack-1x"></i>
                       </span>
                       %{--<g:img dir="/images" file="facebook-icon.png" alt="MDBA on Facebook"/>--}%
                   </a>
               </div>
           </div><!--/.spanX -->
       </div><!--/.row -->
   </div><!--/.contaier -->
</div><!--/#footer -->

<!-- JS resources-->
<r:layoutResources/>
</body>
</html>