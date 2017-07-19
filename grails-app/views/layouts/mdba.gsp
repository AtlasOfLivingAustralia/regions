<g:set var="orgNameLong" value="${grailsApplication.config.skin.orgNameLong}"/>
<g:set var="orgNameShort" value="${grailsApplication.config.skin.orgNameShort}"/>
<g:set var="authService" bean="authService"/>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <rg:addApplicationMetaTags />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="shortcut icon" type="image/x-icon" href="${request.contextPath}/images/mdba/favicons.ico/favicon.ico">

    <title><g:layoutTitle /></title>
    <r:require modules="bootstrap,mdba" />
    <r:layoutResources/>
    <g:layoutHead />
</head>
<body class="${pageProperty(name:'body.class')?:'nav-collections'}" id="${pageProperty(name:'body.id')}" onload="${pageProperty(name:'body.onload')}"  data-offset="${pageProperty(name:'body.data-offset')}" data-target="${pageProperty(name:'body.data-target')}" data-spy="${pageProperty(name:'body.data-spy')}">

<g:set var="fluidLayout" value="${grailsApplication.config.skin.fluidLayout?.toBoolean()}"/>
<div class="navbar-nav navbar-inverse navbar-static-top">
    <div class="navbar-inner contain-to-grid">
        <div class="${fluidLayout?'container-fluid':'container'}">
            <button type="button" class="btn navbar-btn" data-toggle="collapse" data-target=".navbar-collapse">
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
                <div class="navbar-collapse collapse pull-right">
                    <ul class="nav">
                        <li><a href="${grailsApplication.config.skin.homeURL}/index">Home</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/occurrences/search?fq=data_hub_uid:dh10#tab_mapView">Search</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/about">About</a></li>
                        <li><a href="${grailsApplication.config.skin.homeURL}/help">Help</a></li>
                        <g:if test="${!authService.getUserId()}">
                            <li>
                                <a href="${grailsApplication.config.casServerLoginUrl}?service=${grailsApplication.config.serverName}${request.forwardURI}">Login</a>
                            </li>
                        </g:if>
                        <g:if test="${!!authService.getUserId()}">
                            <li>
                                <a href="${grailsApplication.config.grails.serverURL}/logout/logout?casUrl=${grailsApplication.config.casServerUrlPrefix}/logout&appUrl=${grailsApplication.config.serverName}${request.forwardURI}">Logout</a>
                            </li>
                        </g:if>
                    </ul>
                </div><!--/.nav-collapse -->
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
           <div class="col-md-1">
               <ul class="nav">
                   <li><a href="${grailsApplication.config.skin.homeURL}/contact">Contact us </a></li>
                   <li><a href="${grailsApplication.config.skin.homeURL}/access">Accessibility </a></li>
                   <li><a href="${grailsApplication.config.skin.homeURL}/disclaim">Disclaimer</a></li>
               </ul>
           </div><!--/.spanX -->
           <div class="col-md-1 smlinks text-right">
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