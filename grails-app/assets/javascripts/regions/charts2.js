/*------------------------- RECORD BREAKDOWN CHARTS ------------------------------*/

/***** external services & links *****/
// an instance of the collections app - used for name lookup services
var collectionsUrl = "https://collections.ala.org.au";  // should be overridden from config by the calling page
// an instance of the biocache web services app - used for facet and taxonomic breakdowns
var biocacheServicesUrl = "https://biocache-ws.ala.org.au/ws";  // should be overridden from config by the calling page
// an instance of a web app - used to display search results
var biocacheWebappUrl = "https://biocache.ala.org.au/";  // should be overridden from config by the calling page

// defaults for taxa chart
var taxonomyPieChartOptions = {
    width: 480,
    height: 350,
    chartArea: {left: 0, top: 30, width: "100%", height: "70%"},
    is3D: true,
    titleTextStyle: {color: "#555", fontName: 'Arial', fontSize: 15},
    sliceVisibilityThreshold: 0,
    legend: "right"
};

// defaults for facet charts
var genericChartOptions = {
    width: 480,
    height: 350,
    chartArea: {left: 0, top: 30, width: "100%", height: "70%"},
    is3D: true,
    titleTextStyle: {color: "#555", fontName: 'Arial', fontSize: 15},
    sliceVisibilityThreshold: 0,
    legend: "right",
    chartType: "pie"
};

// defaults for individual facet charts
var individualChartOptions = {
    state_conservation: {
        chartType: 'column', width: 450, chartArea: {left: 60, height: "58%"},
        title: 'By state conservation status', hAxis: {slantedText: true}
    },
    occurrence_year: {
        chartType: 'column',
        width: 450,
        chartArea: {left: 60, height: "65%"},
        hAxis: {slantedText: true}
    },
    species_group: {title: 'By higher-level group', ignore: ['Animals']},
    state: {ignore: ['Unknown1']},
    type_status: {title: 'By type status (as % of all type specimens)', ignore: ['notatype']},
    assertions: {chartType: 'bar', chartArea: {left: 170}}
};

/*----------------- FACET-BASED CHARTS USING DIRECT CALLS TO BIO-CACHE SERVICES ---------------------*/
// these override the facet names in chart titles
var chartLabels = {
    institution_uid: 'institution',
    data_resource_uid: 'data set',
    assertions: 'data assertion',
    biogeographic_region: 'biogeographic region',
    occurrence_year: 'decade'
}
// asynchronous transforms are applied after the chart is drawn, ie the chart is drawn with the original values
// then redrawn when the ajax call for transform data returns
var asyncTransforms = {
    institution_uid: {method: 'lookupEntityName', param: 'institution'},
    data_resource_uid: {method: 'lookupEntityName', param: 'dataResource'}
}
// synchronous transforms are applied to the json data before the data table is built
var syncTransforms = {
    occurrence_year: {method: 'transformDecadeData'}/*,
     assertions: {method: 'expandCamelCase'}*/
}

/********************************************************************************\
 * Ajax request for charts based on the facets available in the biocache breakdown.
 \********************************************************************************/
function loadFacetCharts(chartOptions) {
    if (chartOptions.collectionsUrl != undefined) {
        collectionsUrl = chartOptions.collectionsUrl;
    }
    if (chartOptions.biocacheServicesUrl != undefined) {
        biocacheServicesUrl = chartOptions.biocacheServicesUrl;
    }
    if (chartOptions.displayRecordsUrl != undefined) {
        biocacheWebappUrl = chartOptions.displayRecordsUrl;
    }

    var chartsDiv = $('#' + (chartOptions.targetDivId ? chartOptions.targetDivId : 'charts'));
    chartsDiv.append($("<span>Loading charts...</span>"));
    var query = chartOptions.query ? chartOptions.query : buildQueryString(chartOptions.instanceUid);
    $.ajax({
        url: urlConcat(biocacheServicesUrl, "/occurrences/search.json?pageSize=0&q=") + query,
        dataType: 'jsonp',
        error: function () {
            cleanUp();
        },
        success: function (data) {

            // clear loading message
            chartsDiv.find('span').remove();

            // draw all charts
            drawFacetCharts(data, chartOptions);

        }
    });
}
function cleanUp(chartOptions) {
    $('i.loading').remove();
    if (chartOptions != undefined && chartOptions.error) {
        window[chartOptions.error]();
    }
}
/*********************************************************************\
 * Loads charts based on the facets declared in the config object.
 * - does not require any markup other than div#charts element
 \*********************************************************************/
function drawFacetCharts(data, chartOptions) {
    // check that we have results
    if (data.length == 0 || data.totalRecords == undefined || data.totalRecords == 0) {
        return;
    }

    // update total if requested
    if (chartOptions.totalRecordsSelector) {
        $(chartOptions.totalRecordsSelector).html(addCommas(data.totalRecords));
    }

    // transform facet results into map
    var facetMap = {};
    $.each(data.facetResults, function (idx, obj) {
        facetMap[obj.fieldName] = obj.fieldResult;
    });

    // draw the charts
    var chartsDiv = $('#' + (chartOptions.targetDivId ? chartOptions.targetDivId : 'charts'));
    var query = chartOptions.query ? chartOptions.query : buildQueryString(chartOptions.instanceUid);
    $.each(chartOptions.charts, function (index, name) {
        if (facetMap[name] != undefined) {
            buildGenericFacetChart(name, facetMap[name], query, chartsDiv, chartOptions);
        }
    });
}
/************************************************************\
 * Create and show a generic facet chart
 \************************************************************/
function buildGenericFacetChart(name, data, query, chartsDiv, chartOptions) {

    // resolve chart label
    var chartLabel = chartLabels[name] ? chartLabels[name] : name;

    // resolve the chart options
    var opts = $.extend({}, genericChartOptions);
    opts.title = $.i18n.prop("charts.by") + " " + $.i18n.prop("charts.by." + chartLabel);  // default title
    var individualOptions = individualChartOptions[name] ? individualChartOptions[name] : {};
    // merge generic, individual and user options
    opts = $.extend(true, {}, opts, individualOptions, chartOptions[name]);
    //Dumper.alert(opts);

    // optionally transform the data
    var xformedData = data;
    if (syncTransforms[name]) {
        xformedData = window[syncTransforms[name].method](data);
    }

    // create the data table
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', chartLabel);
    dataTable.addColumn('number', 'records');
    $.each(xformedData, function (i, obj) {
        // filter any crap
        if (opts == undefined || opts.ignore == undefined || $.inArray(obj.label, opts.ignore) == -1) {
            if (detectCamelCase(obj.label)) {
                dataTable.addRow([{v: obj.label, f: capitalise(expandCamelCase(obj.label))}, obj.count]);
            }
            else {
                dataTable.addRow([obj.label, obj.count]);
            }
        }
    });

    // reject the chart if there is only one facet value (after filtering)
    if (dataTable.getNumberOfRows() < 2) {
        return;
    }

    // create the container
    var $container = $('#' + name);
    if ($container.length == 0) {
        $container = $("<div id='" + name + "'></div>");
        chartsDiv.append($container);
    }

    // specify the type (for css tweaking)
    $container.addClass('chart-' + opts.chartType);

    // create the chart
    var chart;
    switch (opts.chartType) {
        case 'column':
            chart = new google.visualization.ColumnChart(document.getElementById(name));
            break;
        case 'bar':
            chart = new google.visualization.BarChart(document.getElementById(name));
            break;
        default:
            chart = new google.visualization.PieChart(document.getElementById(name));
            break;
    }

    chart.draw(dataTable, opts);

    // kick off post-draw asynch actions
    if (asyncTransforms[name]) {
        window[asyncTransforms[name].method](chart, dataTable, opts, asyncTransforms[name].param);
    }

    // setup a click handler - if requested
    if (chartOptions.clickThru != false) {  // defaults to true
        google.visualization.events.addListener(chart, 'select', function () {

            // default facet value is the name selected
            var id = dataTable.getValue(chart.getSelection()[0].row, 0);

            // build the facet query
            var facetQuery = name + ":" + id;

            // the facet query can be overridden for date ranges
            if (name == 'occurrence_year') {
                if (id.match("^before") == 'before') { // startWith
                    facetQuery = "occurrence_year:[*%20TO%20" + "1850" + "-01-01T12:00:00Z]";
                }
                else {
                    var decade = id.substr(0, 4);
                    var dateTo = parseInt(decade) + 10;
                    facetQuery = "occurrence_year:[" + decade + "-01-01T12:00:00Z%20TO%20" + dateTo + "-01-01T12:00:00Z]";
                }
            }

            // show the records
            document.location = urlConcat(biocacheWebappUrl, "/occurrences/search?q=") + query +
                "&fq=" + facetQuery;
        });
    }
}

/*---------------------- DATA TRANSFORMATION METHODS ----------------------*/
function transformDecadeData(data) {
    var firstDecade;
    var transformedData = [];
    $.each(data, function (i, obj) {
        if (obj.label == 'before') {
            transformedData.splice(0, 0, {label: "before " + firstDecade, count: obj.count});
        }
        else {
            var decade = obj.label.substr(0, 4);
            if (i == 0) {
                firstDecade = decade;
            }
            transformedData.push({label: decade + "s", count: obj.count});
        }
    });
    return transformedData;
}
/*--------------------- LABEL TRANSFORMATION METHODS ----------------------*/
function detectCamelCase(name) {
    return /[a-z][A-Z]/.test(name);
}
function expandCamelCase(name) {
    return name.replace(/([a-z])([A-Z])/g, function (s, str1, str2) {
        return str1 + " " + str2.toLowerCase();
    });
}
/* capitalises the first letter of the passed string */
function capitalise(item) {
    return item.replace(/^./, function (str) {
        return str.toUpperCase();
    })
}
function lookupEntityName(chart, table, opts, entity) {
    var uidList = [];
    for (var i = 0; j = table.getNumberOfRows(), i < j; i++) {
        uidList.push(table.getValue(i, 0));
    }
    $.jsonp({
        url: collectionsUrl + "/ws/resolveNames/" + uidList.join(',') + "?callback=?",
        cache: true,
        success: function (data) {
            for (var i = 0; j + table.getNumberOfRows(), i < j; i++) {
                var uid = table.getValue(i, 0);
                table.setCell(i, 0, uid, data[uid]);
            }
            chart.draw(table, opts);
        },
        error: function (d, msg) {
            alert(msg);
        }
    });
}
/*----------- TAXONOMY BREAKDOWN CHARTS USING DIRECT CALLS TO BIO-CACHE SERVICES ------------*/
// works for uid-based queries or q/fq general queries

var taxonomyChart = {
    // the base query that defines the full set of records being analysed
    baseQuery: "",
    // the active query - base plus any non-taxonomic restrictions such as date range
    query: "",
    // the rank of the current subset being displayed
    rank: undefined,
    // the name of the current subset being displayed
    name: undefined,
    // threshold - used when no rank+name given
    threshold: undefined,
    // chart configuration
    chartOptions: {},
    // history of chart state
    historyState: [],
    hasState: function () {
        return this.historyState.length > 0;
    },
    pushState: function () {
        this.historyState.push({rank: this.rank, name: this.name});
    },
    popState: function () {
        return this.hasState() ? this.historyState.pop() : {};
    },
    cleanUp: function () {
        $('i.loading').remove();
        if (this.chartOptions != undefined && this.chartOptions.error) {
            window[this.chartOptions.error]();
        }
    },
    // loads a new chart with the passed configuration
    load: function (chartOptions) {
        var thisChart = this;

        if (chartOptions) {
            this.chartOptions = chartOptions;

            if (chartOptions.collectionsUrl != undefined) {
                collectionsUrl = chartOptions.collectionsUrl;
            }
            if (chartOptions.biocacheServicesUrl != undefined) {
                biocacheServicesUrl = chartOptions.biocacheServicesUrl;
            }
            if (chartOptions.displayRecordsUrl != undefined) {
                biocacheWebappUrl = chartOptions.displayRecordsUrl;
            }

            this.baseQuery = chartOptions.query ? chartOptions.query : buildQueryString(chartOptions.instanceUid);
            this.query = this.baseQuery + (chartOptions.subquery ? chartOptions.subquery : '');

            this.rank = chartOptions.rank;
            this.name = chartOptions.name;
            this.threshold = chartOptions.threshold;
        }

        var url = biocacheServicesUrl + "/breakdown.json?q=" + this.query;

        // add url params to set state
        if (this.rank) {
            url += "&rank=" + this.rank + (this.name ? "&name=" + this.name : "");
        }
        else {
            url += "&max=" + (this.threshold ? this.threshold : '55');
        }

        $.ajax({
            url: url,
            dataType: 'jsonp',
            timeout: 30000,
            complete: function (jqXHR, textStatus) {
                if (textStatus == 'timeout') {
                    alert('Sorry - the request was taking too long so it has been cancelled.');
                }
                if (textStatus == 'error') {
                    alert('Sorry - the chart cannot be redrawn due to an error.');
                }
                if (textStatus != 'success') {
                    thisChart.cleanUp();
                }
            },
            success: function (data) {
                // check for errors
                if (data != undefined && data.taxa.length > 0) {
                    // draw the chart
                    thisChart.draw(data);
                } else {
                    // show no data
                    thisChart.draw({
                        taxa: [],
                        rank: ''
                    })
                }
            }
        });
    },
    draw: function (data) {
        var thisChart = this;

        // create the data table
        var dataTable = new google.visualization.DataTable();
        dataTable.addColumn('string', chartLabels[name] ? chartLabels[name] : name);
        dataTable.addColumn('number', 'records');
        $.each(data.taxa, function (i, obj) {
            dataTable.addRow([obj.label, obj.count]);
        });

        // resolve the chart options
        var opts = $.extend({}, taxonomyPieChartOptions);
        opts = $.extend(true, opts, this.chartOptions);
        opts.title = opts.name ? $.i18n.prop("charts.records.by", opts.name, data.rank) : $.i18n.prop("charts.by") + " " + $.i18n.prop("charts.by." + data.rank);
        opts.backgroundColor = {fill: 'transparent'};

        // create the outer div that will contain the chart and the additional links
        var $outerContainer = $('#taxa');
        if ($outerContainer.length == 0) {
            $outerContainer = $('<div id="taxa"></div>'); // create it
            $outerContainer.css('margin-bottom', '-50px');
            var chartsDiv = $('div#' + (this.chartOptions.targetDivId ? this.chartOptions.targetDivId : 'charts'));
            // append it
            chartsDiv.prepend($outerContainer);
        }

        // create the chart container if not already there
        var $container = $('#taxaChart');
        if ($container.length == 0) {
            $container = $("<div id='taxaChart' class='chart-pie'></div>");
            $outerContainer.append($container);
        }

        // create the chart
        var chart = new google.visualization.PieChart(document.getElementById('taxaChart'));

        // notify any listeners
        if (this.chartOptions.notifyChange) {
            window[this.chartOptions.notifyChange](this.rank, this.name);
        }

        // draw the chart
        chart.draw(dataTable, opts);

        google.visualization.events.addListener(chart, 'onmouseover', function () {
            $('#taxaChart').css('cursor', 'pointer');
        });

        google.visualization.events.addListener(chart, 'onmouseout', function () {
            $('#taxaChart').css('cursor', 'default');
        });

        // draw the back button / instructions
        var $backLink = $('#backLink');
        if ($backLink.length == 0) {
            $backLink = $('<a class="btn btn-default" id="backLink"></a>').appendTo($outerContainer);  // create it
            $backLink.css('position', 'relative').css('top', '-75px');
            $backLink.html('&laquo; ' + $.i18n.prop('charts.previous.rank'));
            $backLink.click(function () {
                // only act if link was real
                if (!$backLink.hasClass('lnk')) return;
                $("i.loading").remove();
                // show spinner while loading
                $container.append($('<i class="fa fa-cog fa-spin fa-3x loading" style="position:relative;left:152px;top:-280px;z-index:2000"></i>'));
                // get state from history
                var previous = thisChart.popState();

                // set new chart state
                taxonomyChart.rank = previous.rank;
                taxonomyChart.name = previous.name;

                // redraw chart
                thisChart.load();
            });
        }
        if (this.hasState()) {
            // show the prev link
            $backLink.html('&laquo; ' + $.i18n.prop('charts.previous.rank')).addClass('lnk');
        }
        else {
            // show the instruction
            $backLink.html($.i18n.prop("charts.click.slice")).removeClass('link');
        }

        // draw records link
        var $recordsLink = $('#recordsLink');
        if ($recordsLink.length == 0) {
            $recordsLink = $('<a id="recordsLink" class="btn btn-default"><i id="btn_icon" class="fa fa-share-square-o"></i>&nbsp;View records</a>').appendTo($outerContainer);  // create it
            $recordsLink.css('position', 'relative').css('top', '-75px');
            $recordsLink.click(function () {
                thisChart.showRecords();  // called explicitly so we have the correct 'this' context
            });
        }

        // set link text
        if (this.hasState()) {
            $recordsLink.html('<i  id="btn_icon" class="fa fa-share-square-o"></i>&nbsp;' + $.i18n.prop("charts.view.records.for",  $.i18n.prop("charts.by." + this.rank), this.name));
        }
        else {
            $recordsLink.html('<i  id="btn_icon" class="fa fa-share-square-o"></i>&nbsp;' + $.i18n.prop("charts.view.all.records"));
        }

        // setup a click handler - if requested
        var clickThru = this.chartOptions.clickThru == undefined ? true : this.chartOptions.clickThru;  // default to true
        var drillDown = this.chartOptions.drillDown == undefined ? true : this.chartOptions.drillDown;  // default to true
        if (clickThru || drillDown) {
            google.visualization.events.addListener(chart, 'select', function () {

                // find out what they clicked
                var name = dataTable.getValue(chart.getSelection()[0].row, 0);

                /* DRILL DOWN */
                if (drillDown && data.rank != "species") {
                    // show spinner while loading
                    $container.append($('<i class="fa fa-cog fa-spin fa-3x loading" style="position:relative;left:152px;top:-280px;z-index:2000"></i>'));

                    // save current state as history - for back-tracking
                    thisChart.pushState();

                    // set new chart state
                    thisChart.rank = data.rank;
                    thisChart.name = name;

                    // redraw chart
                    thisChart.load();
                }

                /* SHOW RECORDS */
                else if (clickThru) {
                    // show occurrence records
                    document.location = urlConcat(biocacheWebappUrl, "/occurrences/search?q=") + query +
                        "&fq=" + this.rank + ":\"" + encodeURIComponent(this.name) + "\"";
                }
            });
        }

        $("#charts i").hide();
        $("#btn_icon").show();
    },
    showRecords: function () {
        // show occurrence records
        var fq = "";
        var state = this.chartOptions.currentState;
        if (this.rank != undefined && this.name != undefined) {
            fq = "&fq=" + this.rank + ":\"" + encodeURIComponent(this.name) + "\"";
        }

        document.location = urlConcat(biocacheWebappUrl, "/occurrences/search?q=") +
            this.query + fq;
    },
    reset: function () {
        if (this.hasState()) {
            var firstState = this.historyState[0];

            // this is a bit rubbish - the common code should be pulled out
            // set new chart state
            this.rank = firstState.rank;
            this.name = firstState.name;
        }

        // remove any non-taxonomic restrictions
        this.query = this.baseQuery;

        // redraw chart
        this.load();
    },
    updateQuery: function (query) {
        this.query = query;
        this.load();
    }
};

/*------------------------- TAXON TREE -----------------------------*/
function initTaxonTree(treeOptions) {
    var query = treeOptions.query ? treeOptions.query : buildQueryString(treeOptions.instanceUid);

    var targetDivId = treeOptions.targetDivId ? treeOptions.targetDivId : 'tree';
    var $container = $('#' + targetDivId);
    $container.append($('<h4>Explore records by taxonomy</h4>'));
    var $treeContainer = $('<div id="treeContainer"></div>').appendTo($container);
    $treeContainer.resizable({
        maxHeight: 900,
        minHeight: 100,
        maxWidth: 900,
        minWidth: 500
    });
    var $tree = $('<div id="taxaTree"></div>').appendTo($treeContainer);
    $tree
        .bind("after_open.jstree", function (event, data) {
            var children = $.jstree._reference(data.rslt.obj)._get_children(data.rslt.obj);
            // automatically open if only one child node
            if (children.length == 1) {
                $tree.jstree("open_node", children[0]);
            }
            // adjust container size
            var fullHeight = $tree[0].scrollHeight;
            if (fullHeight > $tree.height()) {
                fullHeight = Math.min(fullHeight, 700);
                $treeContainer.animate({height: fullHeight});
            }
        })
        .bind("select_node.jstree", function (event, data) {
            // click will show the context menu
            $tree.jstree("show_contextmenu", data.rslt.obj);
        })
        .bind("loaded.jstree", function (event, data) {
            // get rid of the anchor click handler because it hides the context menu (which we are 'binding' to click)
            //$tree.undelegate("a", "click.jstree");
            $tree.jstree("open_node", "#top");
        })
        .jstree({
            json_data: {
                data: {"data": "Kingdoms", "state": "closed", "attr": {"rank": "kingdoms", "id": "top"}},
                ajax: {
                    url: function (node) {
                        var rank = $(node).attr("rank");
                        var u = urlConcat(biocacheServicesUrl, "/breakdown.json?q=") + query + "&rank=";
                        if (rank == 'kingdoms') {
                            u += 'kingdom';  // starting node
                        }
                        else {
                            u += rank + "&name=" + $(node).attr('id');
                        }
                        return u;
                    },
                    dataType: 'jsonp',
                    success: function (data) {
                        var nodes = [];
                        var rank = data.rank;
                        $.each(data.taxa, function (i, obj) {
                            var label = obj.label + " - " + obj.count;
                            if (rank == 'species') {
                                nodes.push({"data": label, "attr": {"rank": rank, "id": obj.label}});
                            }
                            else {
                                nodes.push({"data": label, "state": "closed", "attr": {"rank": rank, "id": obj.label}});
                            }
                        });
                        return nodes;
                    },
                    error: function (xhr, text_status) {
                        //alert(text_status);
                    }
                }
            },
            core: {animation: 200, open_parents: true},
            themes: {
                theme: 'classic',
                icons: false
            },
            checkbox: {override_ui: true},
            contextmenu: {
                select_node: false, show_at_node: false, items: {
                    records: {
                        label: "Show records", action: function (obj) {
                            showRecords(obj, query);
                        }
                    },
                    bie: {
                        label: "Show information", action: function (obj) {
                            showBie(obj);
                        }
                    },
                    create: false,
                    rename: false,
                    remove: false,
                    ccp: false
                }
            },
            plugins: ['json_data', 'themes', 'ui', 'contextmenu']
        });
}
/************************************************************\
 * Go to occurrence records for selected node
 \************************************************************/
function showRecords(node, query) {
    var rank = node.attr('rank');
    if (rank == 'kingdoms') return;
    var name = node.attr('id');
    // url for records list
    var recordsUrl = urlConcat(biocacheWebappUrl, "/occurrences/search?q=") + query +
        "&fq=" + this.rank + ":\"" + encodeURIComponent(this.name) + "\"";
    document.location.href = recordsUrl;
}
/************************************************************\
 * Go to 'species' page for selected node
 \************************************************************/
function showBie(node) {
    var rank = node.attr('rank');
    if (rank == 'kingdoms') return;
    var name = node.attr('id');
    var sppUrl = "https://bie.ala.org.au/species/" + name;
    if (rank != 'species') {
        sppUrl += "_(" + rank + ")";
    }
    document.location.href = sppUrl;
}

/*------------------------- UTILITIES ------------------------------*/
/************************************************************\
 * build records query handling multiple uids
 * uidSet can be a comma-separated string or an array
 \************************************************************/
function buildQueryString(uidSet) {
    var uids = (typeof uidSet == "string") ? uidSet.split(',') : uidSet;
    var str = "";
    $.each(uids, function (index, value) {
        str += solrFieldNameForUid(value) + ":" + value + " OR ";
    });
    return str.substring(0, str.length - 4);
}
/************************************************************\
 * returns the appropriate facet name for the uid - to build
 * biocache occurrence searches
 \************************************************************/
function solrFieldNameForUid(uid) {
    switch (uid.substring(0, 2)) {
        case 'co':
            return "collection_uid";
        case 'in':
            return "institution_uid";
        case 'dp':
            return "data_provider_uid";
        case 'dr':
            return "data_resource_uid";
        case 'dh':
            return "data_hub_uid";
        default:
            return "";
    }
}
/************************************************************\
 * returns the appropriate context for the uid - to build
 * biocache webservice urls
 \************************************************************/
function wsEntityForBreakdown(uid) {
    switch (uid.substr(0, 2)) {
        case 'co':
            return 'collections';
        case 'in':
            return 'institutions';
        case 'dr':
            return 'dataResources';
        case 'dp':
            return 'dataProviders';
        case 'dh':
            return 'dataHubs';
        default:
            return "";
    }
}
/************************************************************\
 * Concatenate url fragments handling stray slashes
 \************************************************************/
function urlConcat(base, context) {
    // remove any trailing slash from base
    base = base.replace(/\/$/, '');
    // remove any leading slash from context
    context = context.replace(/^\//, '');
    // join
    return base + "/" + context;
}

/************************************************************\
 * Add commas to number strings
 \************************************************************/
function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

