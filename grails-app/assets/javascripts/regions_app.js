// This is a manifest file that'll be compiled into application.js.
//
// Any JavaScript file within this directory can be referenced here using a relative path.
//
// You're free to add application-wide JavaScript to this file, but it's generally better
// to create separate JavaScript files as needed.
//
// #= require jquery_i18n
//= require regions/application
//= require regions/charts2
//= require regions/keydragzoom
// #= require regions/wms
//= require bootstrap-switch/bootstrap-switch.min
//= require he/he-0.5.0
//= require number-functions/number-functions

if (typeof jQuery !== 'undefined') {
    (function ($) {
        $(document).ajaxStart(function () {
            $('#spinner').fadeIn();
        }).ajaxStop(function () {
            $('#spinner').fadeOut();
        });
    })(jQuery);
}
