//= require jquery/jquery-migrate-1.2.1.min.js
//= require jquery-ui/jquery-ui-1.12.1
//= require jquery-jsonp/jquery.jsonp-2.1.4.min
//= require jquery-ui-slider-pips/jquery-ui-slider-pips
//= require jquery-aa/aa.js
//= require jquery-aa/jquery-ajaxq-0.0.2.js
//= require jquery.i18n/jquery.i18n.properties-1.0.9.js
//= require jquery-bbq/jquery.ba-bbq-1.2.1

// initialise plugins
$(function () {

    var autocompleteUrl = 'http://bie.ala.org.au/ws/search/auto';

    if (typeof BIE_VARS != 'undefined' && BIE_VARS.autocompleteUrl) {
        autocompleteUrl = BIE_VARS.autocompleteUrl;
    }

    // autocomplete on navbar search input
    $("#biesearch").autocomplete();
    $("#biesearch").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: autocompleteUrl,
                dataType: "jsonp",
                data: {
                    term: request.term
                },
                extraParams: {limit: 100},
                success: function (data) {
                    var rows = new Array();
                    data = data.autoCompleteList;
                    for (var i in data) {
                        var item = data[i];
                        if (item) {
                            rows.push({
                                value: item.matchedNames[0],
                                label: item.matchedNames[0]
                            });
                        }
                    }
                    response(rows);
                }
            });
        },
        matchSubset: false,
        cacheLength: 10,
        minChars: 3,
        scroll: false,
        max: 10,
        selectFirst: false
    });
    // Mobile/desktop toggle
    // TODO: set a cookie so user's choice is remembered across pages
    var responsiveCssFile = $("#responsiveCss").attr("href"); // remember set href
    $(".toggleResponsive").click(function (e) {
        e.preventDefault();
        $(this).find("i").toggleClass("icon-resize-small icon-resize-full");
        var currentHref = $("#responsiveCss").attr("href");
        if (currentHref) {
            $("#responsiveCss").attr("href", ""); // set to desktop (fixed)
            $(this).find("span").html("Mobile");
        } else {
            $("#responsiveCss").attr("href", responsiveCssFile); // set to mobile (responsive)
            $(this).find("span").html("Desktop");
        }
    });
});