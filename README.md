Regions   [![Build Status](https://travis-ci.org/AtlasOfLivingAustralia/regions.svg?branch=master)](https://travis-ci.org/AtlasOfLivingAustralia/regions)
=========

## Information

Website URL: http://regions.ala.org.au

This project allows the user to conveniently browse existing ALA records that have been previously filtered by the user selecting a wide range of meaningful regions displayed on a Map.

## Main technologies used
 - [Grails framework](https://grails.org/)
 - [The Atlas of Living Australia REST Web Services](http://api.ala.org.au/)
 - [Google Maps Web API](https://developers.google.com/maps/web/)
 - [Google Charts](https://developers.google.com/chart/)
 - Other libraries include:
  - [Bootstrap](http://getbootstrap.com/)
  - [jQuery](http://jquery.com/)
  - [AjaxAnywhere](http://ajaxanywhere.com)
  - ...

## Changelog
- **Version 2.2** (24/04/2015):
  - Made changes to reuse code base for GER (Great Eastern Ranges) webpapp
  - Separate layersService and spatial URLs
  - Add Major drainage divisions
  - Add dataResourceUid to records download
  - Update download form
  - Fix encoding issues
- **Version 2.1** (04/03/2015):
  - Integrated new 2015 look & feel design
  - Minor fixes
- **Version 2.0.1** (25/02/2015):
  - Fixes small bug with Ajax indicator
- **Version 2.0** (23/02/2015):
  - Major project overhaul to improve the look & feel and UX of the tool.
  - There has been a mayor refactoring in all app layers to improve maintainability and reduce technical debt.
  - Lots of javascript Ajax boilerplate code has been removed by using the AjaxAnywhere Grails plugin.
  - Many existing bugs have been fixed.
