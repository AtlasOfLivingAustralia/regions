<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="app.version" content="${g.meta(name:'app.version')}"/>
    <meta name="app.build" content="${g.meta(name:'app.build')}"/>
    <meta name="description" content="Atlas of Living Australia"/>
    <meta name="author" content="Atlas of Living Australia">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="http://www.ala.org.au/wp-content/themes/ala2011/images/favicon.ico" rel="shortcut icon"  type="image/x-icon"/>

    <link rel="alternate" type="application/rss+xml" title="The Great Eastern Ranges &raquo; GER regional partnerships Comments Feed" href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/feed/" />
    <link rel='stylesheet' id='dashicons-css'  href='http://ger.staging.noisebirds.com.au/wp-includes/css/dashicons.min.css?ver=3.9.2' type='text/css' media='all' />
    <link rel='stylesheet' id='style-css'  href='http://ger.staging.noisebirds.com.au/wp-content/themes/ger/style.css?ver=1.1' type='text/css' media='all' />
    <link rel='stylesheet' id='fonts-css'  href='//fonts.googleapis.com/css?family=Nobile&#038;subset=latin%2Clatin-ext&#038;ver=1.1' type='text/css' media='all' />
    <link rel='stylesheet' id='fonticons-css'  href='http://ger.staging.noisebirds.com.au/wp-content/themes/ger/css/fonticons.css?ver=1.1' type='text/css' media='all' />
    <title><g:layoutTitle /></title>

    <%-- Do not include JS & CSS files here - add them to your app's "application" module (in "Configuration/ApplicationResources.groovy") --%>
    <r:require modules="bootstrap"/>

    <r:layoutResources/>
    <g:layoutHead />
</head>
<body style="padding-top:0" class="${pageProperty(name:'body.class')}" id="${pageProperty(name:'body.id')}" onload="${pageProperty(name:'body.onload')}">
<g:set var="fluidLayout" value="${pageProperty(name:'meta.fluidLayout')?:grailsApplication.config.skin?.fluidLayout}"/>
<g:set var="containerType" value="${fluidLayout ? 'container-fluid' : 'container'}"/>

<!-- Header -->
<header id="rt-top-surround">
    <div id="rt-header">
        <div class="rt-container">
            <div class="rt-grid-3 rt-alpha">
                <div class="rt-block ">
                    <div class="module-surround">
                        <div class="module-content">
                            <div class="custom custom-logo">
                                <div style="margin: 16px 0 0;">
                                    <p><a href="http://ger.staging.noisebirds.com.au/"><img title="GER Logo" alt="ger-logo-205x150px" src="http://ger.staging.noisebirds.com.au/wp-content/themes/ger/images/ger-logo-205x150px.png" /></a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="rt-grid-9 rt-omega">
                <div class="rt-block menu-block">
                    <div class="search-module">
                        <div class="module-surround">
                            <div class="module-content">
                                <div class="search">
                                    <form class="form-inline" method="get" action="http://ger.staging.noisebirds.com.au/">
                                        <label class="element-invisible" for="mod-search-searchword">Search...</label>
                                        <input type="text" onfocus="if (this.value=='Search...') this.value='';" onblur="if (this.value=='') this.value='Search...';" value="Search..." size="20" class="inputbox search-query" maxlength="20" id="mod-search-searchword" name="s">
                                    </form>
                                </div>
                            </div>
                        </div>
                        <a class="header-button" href="http://fnpw.org.au/great-eastern-ranges" target="_blank">Donate</a>
                        <a class="header-button header-enews" href="http://ger.staging.noisebirds.com.au/resources/subscribe-to-enewsletter/">Subscribe to enews</a>
                    </div>

                    <div class="gf-menu-device-container"></div>
                    <ul id="menu-main-menu" class="gf-menu l1 "><li class="item872   ico-home menu-item menu-item-type-post_type menu-item-object-page "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/" class="item"> <span class="rt-item-border"></span> Homepage<span class="border-fixer"></span></a></li>
                        <span class="rt-item-shadow"></span>
                        <li class="item368 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/about-us/" class="item"> <span class="rt-item-border"></span> About Us<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item369   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/vision-and-goals/" class="item">Vision and Goals<span class="border-fixer"></span></a></li>
                                <li class="item370   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/our-key-supporters/" class="item">Our Key Supporters<span class="border-fixer"></span></a></li>
                                <li class="item371   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/history/" class="item">History<span class="border-fixer"></span></a></li>
                                <li class="item372   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/business-plan/" class="item">Business Plan 2012 &#8211; 15<span class="border-fixer"></span></a></li>
                                <li class="item373   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/annual-reports/" class="item">Highlights 2012-13<span class="border-fixer"></span></a></li>
                                <li class="item374   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/our-structure/" class="item">Our Structure<span class="border-fixer"></span></a></li>
                                <li class="item375 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/about-us/our-team/" class="item">Our Team<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item376   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/our-team/ger-central-team/" class="item">GER Central Team<span class="border-fixer"></span></a></li>
                                        <li class="item377   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/our-team/lead-partners/" class="item">Lead Partners<span class="border-fixer"></span></a></li>
                                        <li class="item378   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/our-team/regional-facilitators/" class="item">Regional Facilitators<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item379   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-us/contact-us/" class="item">Contact us<span class="border-fixer"></span></a></li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item380 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/" class="item"> <span class="rt-item-border"></span> The Corridor<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item386   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/the-landscapes/" class="item">The Landscapes<span class="border-fixer"></span></a></li>
                                <li class="item387   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/connectivity/" class="item">Connectivity Conservation<span class="border-fixer"></span></a></li>
                                <li class="item394 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/" class="item">Natural Values<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item395   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/diversity/" class="item">Diversity<span class="border-fixer"></span></a></li>
                                        <li class="item396   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/unique-species/" class="item">Unique Species<span class="border-fixer"></span></a></li>
                                        <li class="item397   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/migration-routes/" class="item">Migration Routes<span class="border-fixer"></span></a></li>
                                        <li class="item398   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/refuge-areas/" class="item">Refuge Areas<span class="border-fixer"></span></a></li>
                                        <li class="item399   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/natural-values/iconic-species/" class="item">GER&#8217;s Iconic Species<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item400 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/culture-and-heritage/" class="item">Culture and Heritage<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item401   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/culture-and-heritage/aboriginal/" class="item">Aboriginal Culture and Heritage<span class="border-fixer"></span></a></li>
                                        <li class="item402   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/culture-and-heritage/european-settlement/" class="item">European Settlement<span class="border-fixer"></span></a></li>
                                        <li class="item403   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/culture-and-heritage/aesthetics-and-well-being/" class="item">Aesthetics and Well-being<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item404   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/ecosystem-services/" class="item">Ecosystem Services<span class="border-fixer"></span></a></li>
                                <li class="item405 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/" class="item">Threats<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item406   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/habitat-loss/" class="item">Habitat Loss<span class="border-fixer"></span></a></li>
                                        <li class="item407   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/managing-invasive-species/" class="item">Managing Invasive Species<span class="border-fixer"></span></a></li>
                                        <li class="item408   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/over-grazing/" class="item">Over-grazing<span class="border-fixer"></span></a></li>
                                        <li class="item409   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/unsustainable-practices/" class="item">Unsustainable Practices<span class="border-fixer"></span></a></li>
                                        <li class="item410   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/population-growth/" class="item">Population Growth<span class="border-fixer"></span></a></li>
                                        <li class="item411   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/climate-change/" class="item">Climate Change<span class="border-fixer"></span></a></li>
                                        <li class="item412   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/altered-fire-regimes/" class="item">Altered Fire Regimes<span class="border-fixer"></span></a></li>
                                        <li class="item413   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/about-the-corridor/threats/altered-hydrology/" class="item">Altered Hydrology<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item381 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/where-we-work/" class="item"> <span class="rt-item-border"></span> Where We Work<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item414 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/where-we-work/how-we-prioritise-areas/" class="item">How We Prioritise Areas<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item415   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/where-we-work/how-we-prioritise-areas/spatial-analysis/" class="item">Spatial Analysis<span class="border-fixer"></span></a></li>
                                        <li class="item416   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/where-we-work/how-we-prioritise-areas/regional-planning/" class="item">Regional Planning<span class="border-fixer"></span></a></li>
                                        <li class="item417   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/where-we-work/how-we-prioritise-areas/project-development/" class="item">Project Development<span class="border-fixer"></span></a></li>
                                        <li class="item418   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/where-we-work/how-we-prioritise-areas/monitoring-success/" class="item">Monitoring Success<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item976   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/where-we-work/current-focus-areas/" class="item">Priority Regions<span class="border-fixer"></span></a></li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item382 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/" class="item"> <span class="rt-item-border"></span> What we do<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item420 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/working-with-communities/" class="item">Engaging Communities<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item421   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/working-with-communities/indigenous/" class="item">Indigenous<span class="border-fixer"></span></a></li>
                                        <li class="item422   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/working-with-communities/youth/" class="item">Youth<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item423 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/increasing-knowledge/" class="item">Increasing Knowledge<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item424   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/increasing-knowledge/citizen-science/" class="item">Citizen Science<span class="border-fixer"></span></a></li>
                                        <li class="item425   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/increasing-knowledge/research/" class="item">Research<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item426 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/" class="item">Improving Management<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item427   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/property-planning/" class="item">Property Planning<span class="border-fixer"></span></a></li>
                                        <li class="item428   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/fire-management/" class="item">Managing Fire<span class="border-fixer"></span></a></li>
                                        <li class="item429   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/managing-grazing/" class="item">Managing Grazing<span class="border-fixer"></span></a></li>
                                        <li class="item430   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/managing-invasive-species/" class="item">Managing Invasive Species<span class="border-fixer"></span></a></li>
                                        <li class="item431   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/improving-management/routine-farm-practices/" class="item">Routine Farm Practices<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item432 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/restoring-lost-linkages/" class="item">Restoring Lost Linkages<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item433   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/restoring-lost-linkages/revegetation/" class="item">Revegetation<span class="border-fixer"></span></a></li>
                                        <li class="item434   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/restoring-lost-linkages/buffers-and-connections/" class="item">Buffers and Connections<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item435 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/private-land-conservation/" class="item">Private Land Conservation<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item436   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/private-land-conservation/private-reserves/" class="item">Private Reserves<span class="border-fixer"></span></a></li>
                                        <li class="item439   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/private-land-conservation/in-perpetuity-covenants/" class="item">In-perpetuity Covenants<span class="border-fixer"></span></a></li>
                                        <li class="item437   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/private-land-conservation/term-based-agreements/" class="item">Term Based Agreements<span class="border-fixer"></span></a></li>
                                        <li class="item438   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/private-land-conservation/property-registration/" class="item">Property Registration<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item440 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/managing-public-lands/" class="item">Managing Public Lands<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item441   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/managing-public-lands/national-parks-and-reserves/" class="item">National Parks and Reserves<span class="border-fixer"></span></a></li>
                                        <li class="item442   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/managing-public-lands/state-forests/" class="item">State Forests<span class="border-fixer"></span></a></li>
                                        <li class="item443   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/managing-public-lands/tsrs-crown-lands-and-roadsides/" class="item">TSRs, Crown Lands and Roadsides<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item444 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/apply-for-a-ger-grant/" class="item">GER Grants Program<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item445   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/apply-for-a-ger-grant/landcare-grants-program/" class="item">Landcare Grants Program<span class="border-fixer"></span></a></li>
                                        <li class="item446   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/how-we-deliver/apply-for-a-ger-grant/landcare-grants-program-2/" class="item">Partners Grants Program<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item383 parent menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/our-partners/" class="item"> <span class="rt-item-border"></span> Our Partners<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item447 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/" class="item">National<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item448   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/australian-conservation-foundation/" class="item">Australian Conservation Foundation<span class="border-fixer"></span></a></li>
                                        <li class="item449   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/birdlife-australia/" class="item">BirdLife Australia<span class="border-fixer"></span></a></li>
                                        <li class="item450   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/foundation-for-national-parks-wildlife/" class="item">Foundation for National Parks &#038; Wildlife<span class="border-fixer"></span></a></li>
                                        <li class="item451   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/conservation-volunteers-australia/" class="item">Conservation Volunteers Australia<span class="border-fixer"></span></a></li>
                                        <li class="item452   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/forests-alive/" class="item">Forests Alive<span class="border-fixer"></span></a></li>
                                        <li class="item453   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/greening-australia/" class="item">Greening Australia<span class="border-fixer"></span></a></li>
                                        <li class="item454   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/ozgreen/" class="item">OzGREEN<span class="border-fixer"></span></a></li>
                                        <li class="item455   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/parks-forum/" class="item">Parks Forum<span class="border-fixer"></span></a></li>
                                        <li class="item456   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/wetlandcare-australia/" class="item">WetlandCare Australia<span class="border-fixer"></span></a></li>
                                        <li class="item457   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/national/wildlife-land-trust/" class="item">Wildlife Land Trust<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item458 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/" class="item">NSW/ACT<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item459   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/land-for-wildlife-nsw/" class="item">Land for Wildlife NSW<span class="border-fixer"></span></a></li>
                                        <li class="item460   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/national-parks-association-of-nsw/" class="item">National Parks Association of NSW<span class="border-fixer"></span></a></li>
                                        <li class="item461   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/nature-conservation-council-of-nsw/" class="item">Nature Conservation Council of NSW<span class="border-fixer"></span></a></li>
                                        <li class="item462   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/nature-conservation-trust-of-nsw/" class="item">Nature Conservation Trust of NSW<span class="border-fixer"></span></a></li>
                                        <li class="item463   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/office-of-environment-heritage-nsw/" class="item">Office of Environment &#038; Heritage NSW<span class="border-fixer"></span></a></li>
                                        <li class="item464   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/western-sydney-parklands-trust/" class="item">Western Sydney Parklands Trust<span class="border-fixer"></span></a></li>
                                        <li class="item465   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/nsw-act/landcare-nsw/" class="item">Landcare NSW<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item495 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/our-partners/queensland/" class="item">Queensland<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item496   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/queensland/queensland-trust-for-nature/" class="item">Queensland Trust for Nature<span class="border-fixer"></span></a></li>
                                        <li class="item497   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/queensland/south-east-queensland-catchments/" class="item">South East Queensland Catchments<span class="border-fixer"></span></a></li>
                                        <li class="item498   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/queensland/terrain-nrm/" class="item">Terrain NRM<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item499 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/our-partners/victoria/" class="item">Victoria<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item500   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/victoria/trust-for-nature-victoria/" class="item">Trust for Nature Victoria<span class="border-fixer"></span></a></li>
                                        <li class="item501   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/victoria/parks-victoria/" class="item">Parks Victoria<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                                <li class="item502 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/" class="item">GER regional partnerships<span class="border-fixer"></span></a>
                                    <div class="dropdown flyout columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l3">
                                        <li class="item503   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/hinterland-bush-links/" class="item">Hinterland Bush Links<span class="border-fixer"></span></a></li>
                                        <li class="item504   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/border-ranges-alliance/" class="item">Border Ranges Alliance<span class="border-fixer"></span></a></li>
                                        <li class="item505   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/jalliigirr-biodiversity-alliance/" class="item">Jaliigirr Biodiversity Alliance<span class="border-fixer"></span></a></li>
                                        <li class="item506   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/hunter-valley-partnership/" class="item">Hunter Valley Partnership<span class="border-fixer"></span></a></li>
                                        <li class="item507   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/kanangra-boyd-to-wyangala-link/" class="item">Kanangra-Boyd to Wyangala Link<span class="border-fixer"></span></a></li>
                                        <li class="item508   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/southern-highlands-link/" class="item">Southern Highlands Link<span class="border-fixer"></span></a></li>
                                        <li class="item509   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/illawarra-to-shoalhaven/" class="item">Illawarra to Shoalhaven<span class="border-fixer"></span></a></li>
                                        <li class="item510   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/kosciusko2coast/" class="item">Kosciuszko to Coast<span class="border-fixer"></span></a></li>
                                        <li class="item511   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/slopes-to-summit/" class="item">Slopes to Summit<span class="border-fixer"></span></a></li>
                                        <li class="item512   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/our-partners/ger-regional-partnerships/central-victorian-biolinks/" class="item">Central Victorian Biolinks<span class="border-fixer"></span></a></li>
                                    </ul>
                                    </div>
                                    </div>
                                </li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item513 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/resources/" class="item"> <span class="rt-item-border"></span> Resources<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item719   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/resources/ger-news/" class="item">News<span class="border-fixer"></span></a></li>
                                <li class="item722   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/resources/ger-case-studies/" class="item">Case Studies<span class="border-fixer"></span></a></li>
                                <li class="item516   menu-item menu-item-type-custom menu-item-object-custom "><a target="_blank" href="http://www.youtube.com/channel/UCqzgpVlMT_dhH4KTrJxmdGA" class="item">Videos<span class="border-fixer"></span></a></li>
                                <li class="item517   menu-item menu-item-type-custom menu-item-object-custom "><a target="_blank" href="http://www.flickr.com/photos/great_eastern_ranges_initiative" class="item">Image Gallery<span class="border-fixer"></span></a></li>
                                <li class="item518   menu-item menu-item-type-custom menu-item-object-custom "><a href="https://drive.google.com/folderview?id=0B_Dn8rROv7NLYV9EOGJFaE1ESEE&amp;usp=sharing" class="item">Maps<span class="border-fixer"></span></a></li>
                                <li class="item519   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/resources/references/" class="item">References<span class="border-fixer"></span></a></li>
                                <li class="item520   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/resources/subscribe-to-enewsletter/" class="item">Subscribe to enewsletter<span class="border-fixer"></span></a></li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                        <li class="item761 parent  menu-item menu-item-type-post_type menu-item-object-page menu-item-has-children "><span class="rt-menu-border"></span><a href="http://ger.staging.noisebirds.com.au/get-involved/" class="item"> <span class="rt-item-border"></span> Get Involved<span class="border-fixer"></span></a>
                            <div class="dropdown columns-1 " style="width:180px"><div class="column col1" style="width:180px"><ul class="l2">
                                <li class="item995   menu-item menu-item-type-post_type menu-item-object-page "><a href="http://ger.staging.noisebirds.com.au/register/" class="item">Register for the Great Eastern Ranges Supporters Program<span class="border-fixer"></span></a></li>
                            </ul>
                            </div>
                            </div>
                        </li>
                        <span class="rt-item-shadow"></span>
                    </ul>                     <div class="clear"></div>
                </div>
            </div>
            <div class="clear"></div>
        </div>

    </div>
</header>
<!-- End header -->

<!-- Container -->
<div class="${containerType}" id="main">
    <div>
        <r:img uri="/images/ALA_Powered.jpg" style="float:right; height: 3.5em;"/>
        <a href="http://bie.ala.org.au"><h1>Great Eastern Ranges Biodiversity Atlas</h1></a>
        <div style="clear:both"></div>
    </div>
    <g:layoutBody />
</div><!-- End container #main  -->

<!-- Footer -->
<footer id="rt-footer-surround">
    <div id="rt-footer">
        <div class="rt-container">
            <div class="rt-grid-4 rt-alpha">
                <div class="rt-block ">
                    <div class="module-surround">
                        <div class="module-content">
                            <div class="custom"  >
                                <h4>Our Structure</h4>
                                <p>GER is based on a model of partnerships with collaboration across organisational boundaries and focused on common goals. GER comprises the Central Team, GER Lead Partners, GER Regional Partnerships and over 180 organisations across the length of the corridor.</p>                              </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="rt-grid-4">
                <div class="rt-block ">
                    <div class="module-surround">
                        <div class="module-content">
                            <div class="custom"  >
                                <h4>Lead Partners</h4>
                                <p>The Lead Partners provide high level vision, governance, strategic planning and policy to the GER. The GER Lead Partners are <a href="http://www.greeningaustralia.org.au/" target="_blank">Greening Australia</a>, <a href="http://www.npansw.org.au/" target="_blank">National Parks Association of NSW</a>, <a href="http://nct.org.au/" target="_blank">Nature Conservation Trust of NSW</a>, <a href="http://www.environment.nsw.gov.au/" target="_blank">Office of Environment &amp; Heritage</a> and <a href="http://www.ozgreen.org.au/" target="_blank">OzGREEN</a>.</p>                              </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="rt-grid-4 rt-omega">
                <div class="rt-block ">
                    <div class="module-surround">
                        <div class="module-content">
                            <div class="custom"  >
                                <h4>Key Supporters</h4>
                                <p>The Great Eastern Ranges Initiative would not exist, nor have been so successful without the crucial funding provided by our key supporters.</p>
                                <p><a href="http://www.environment.nsw.gov.au/grants/envtrust.htm" target="_blank"><img class="alignnone size-full wp-image-626" src="http://ger.staging.noisebirds.com.au/wp-content/uploads/2014/07/nsw-logo.png" alt="nsw-logo" width="160" height="44" /></a> <a href="http://www.environment.gov.au/" target="_blank"><img class="alignnone size-full wp-image-623" src="http://ger.staging.noisebirds.com.au/wp-content/uploads/2014/07/ausgov-stacked.gif" alt="ausgov-stacked" width="110" height="55" /></a> <a href="http://www.ala.org.au/" target="_blank"><img class="alignnone size-full wp-image-624" src="http://ger.staging.noisebirds.com.au/wp-content/uploads/2014/07/ALA_NEW.gif" alt="ALA_NEW" width="55" height="45" /></a> </p>                              </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    <div id="rt-copyright">
        <div class="rt-container">
            <div class="rt-grid-4 rt-alpha">
                <div class="rt-social-buttons rt-block">
                    <a class="social-button rt-facebook-btn" href="https://www.facebook.com/pages/Great-Eastern-Ranges-Initiative/240694676044829"> <span class="icon-facebook"></span> </a>
                    <div class="clear"></div>
                </div>
            </div>
            <div class="rt-grid-4">
                <div class="clear"></div>
                <div class="rt-block"></div>
            </div>
            <div class="rt-grid-4 rt-omega">
                <div class="clear"></div>
                <div class="rt-block"> <a href="#" id="gantry-totop" rel="nofollow">TOP</a></div>
            </div>
            <div class="clear"></div>
        </div>
    </div>
</footer>
<!-- End footer -->

<!-- JS resources-->
<r:layoutResources/>
</body>
</html>
