var express = require('express'),
    http = require('http'),
    mysql = require('mysql'),
    moment = require('moment'),
    _ = require('underscore'),
    fs = require('fs'),
    async = require('async'),
    URL = require('url'),
    normalizeUrl = require('normalize-url');

var app = express();

var config_file = __dirname + '/production-config.json';
// config_file = './config-gregor.json';
const config = require(config_file);

app.configure(function(){
    app.set('port', 1234);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

var times = {};

app.set('connection', mysql.createConnection(config));

function init() {
    var chartHits = {},
        domainHits = {},
        chartUrls = {},
        flushInterval,
        pixel = require('fs').readFileSync(__dirname + '/pixel.gif');

    app.get('/health', function(req, res) {
        var message = "";

        if (!times.total) {
            message = 'I have no flush in memory at the moment.';
        } else {
            message = ('The last flush took ' + times.total + "ms.\r\n\r\n"+
              "- Fetching chart info took " + times.fetchChartInfo + "ms.\r\n"+
              "- Creating the inserts took " + times.createInserts + "ms.\r\n"+
              "- Running the inserts took " + times.runInserts + "ms."
              );
        }

        var msg = {
            "response_type": "in_channel",
            "text": message
        };


        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(msg));
    });

    app.get(/([a-zA-Z0-9]+)\/(?:pixel|datawrapper).gif/, function(req, res) {
        var chart_id = req.params[0];
        if (!chartHits[chart_id]) chartHits[chart_id] = 0;
        chartHits[chart_id]++;

        var ref = req.query.r;
        var domain = ref ? getDomain(ref) : 'direct';
        if (!domainHits[domain]) domainHits[domain] = 0;
        domainHits[domain]++;

        var url = ref ? getNormalizedUrl(ref) : 'direct';
        if (!chartUrls[chart_id]) chartUrls[chart_id] = {};
        if (chartUrls[chart_id][url] === undefined) chartUrls[chart_id][url] = 0;
        chartUrls[chart_id][url]++;
        res.end(pixel, 'binary');
    });

    function flush() {
        console.log('Flushing Hits to DB...');

        // copy counter
        var chartHits_copy = _.extend({}, chartHits),
            domainHits_copy = _.extend({}, domainHits),
            chartUrls_copy = _.extend({}, chartUrls);

        // reset counter
        chartHits = {};
        domainHits = {};
        chartUrls = {};

        var connection = app.get('connection');

        times = {
            "start": Date.now(),
            "fetchChartInfo": 0,
            "createInserts": 0,
            "runInserts": 0,
            "end": 0,
            "total": 0
        };

        function getUserAndOrgForChartId(chartId, callback) {
            connection.query('SELECT id, author_id, organization_id FROM chart WHERE id = ?', chartId, function(err, rows) {
                if (rows.length == 0) {
                    callback(undefined, {});
                    return;
                }

                callback(undefined, {
                    "chartId": rows[0].id,
                    "userId": rows[0].author_id,
                    "orgId": rows[0].organization_id
                });
            });
        }

        console.log('Got connection. Fetching chart info...');

        async.map(Object.keys(chartHits_copy), getUserAndOrgForChartId, function (err, results) {
            console.log('Got chart info. Building inserts...');

            times.fetchChartInfo = Date.now() - times.start;

            connection.beginTransaction(function(err) {
                var inserts = [];

                _.each(domainHits_copy, function(views, domain) {
                    if (domain && domain != "direct" && domain != "datawrapper.de" && domain != "datawrapper.dwcdn.net" && domain != 'null') {
                        var thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                        inserts.push(function(callback) {
                            connection.query(
                              'INSERT INTO pixeltracker_domain_month (domain, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ domain, thisMonth, domainHits_copy[domain], domainHits_copy[domain] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });
                    }
                });

                _.each(chartUrls_copy, function(urls, chart_id) {
                    _.each(urls, function(views, url) {
                        if (url != 'direct' && url.substr(0,28) != 'http://datawrapper.dwcdn.net') {
                            // console.log(chart_id, views, url);
                            inserts.push(function(callback) {
                                connection.query(
                                  'INSERT INTO pixeltracker_chart_embedurl (chart_id, url, views)' +
                                  'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ? ',
                                  [ chart_id, url, views, views ],
                                  function (err) {
                                      callback(null, 'finished');
                                });
                            });
                        }
                    });
                });

                results.forEach(function(el) {
                    if (el.chartId === undefined) {
                        return;
                        // if no chartId is set, the chart was not found in the database,
                        // and we don't want to track this hit.
                    }

                    inserts.push(function(callback) {
                        connection.query(
                          'INSERT INTO pixeltracker_chart (chart_id, views)' +
                          'VALUES (?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                          [ el.chartId, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                          function (err) {
                              callback(null, 'finished');
                        });
                    });


                    if (typeof el.userId == "number") {
                        inserts.push(function(callback) {
                            var today = moment().startOf('day').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_user_day (user_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.userId, today, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });

                        inserts.push(function(callback) {
                            var thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_user_week (user_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.userId, thisWeek, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });

                        inserts.push(function(callback) {
                            var thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_user_month (user_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.userId, thisMonth, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });
                    }

                    if (typeof el.orgId === "string") {
                        inserts.push(function(callback) {
                            var today = moment().startOf('day').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_organization_day (organization_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.orgId, today, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });

                        inserts.push(function(callback) {
                            var thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_organization_week (organization_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.orgId, thisWeek, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });

                        inserts.push(function(callback) {
                            var thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                            connection.query(
                              'INSERT INTO pixeltracker_organization_month (organization_id, date, views)' +
                              'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                              [ el.orgId, thisMonth, chartHits_copy[el.chartId], chartHits_copy[el.chartId] ],
                              function (err) {
                                  callback(null, 'finished');
                            });
                        });
                    }

                });

                times.createInserts = Date.now() - times.start - times.fetchChartInfo;

                console.log('Inserts are ready. Executing them...');

                async.series(inserts, function(err, results) {
                    console.log('Committing Transaction...');
                    connection.commit(function(err) {
                        console.log('We are done here!');
                        times.runInserts = Date.now() - times.start - times.fetchChartInfo - times.createInserts;
                        times.end = Date.now();
                        times.total = times.end - times.start;
                    });
                });
            });
        });
    }

    var interval = config.intervalMin + Math.round(Math.random() * (config.intervalMax - config.intervalMin));
    flushInterval = setInterval(flush, interval);

    http.createServer(app).listen(app.get('port'), function(){
        console.log("Express server listening on port " + app.get('port'));
    });
}

var client = app.get('connection');
async.series([
    function connect(callback) {
        client.connect(callback);
    },
    function use_db(callback) {
        client.query('USE ' + config.database, callback);
    }
], function (err, results) {
    if (err) {
        console.log('Exception initializing database.');
        throw err;
    } else {
        console.log('Database initialization complete.');
        init();
    }
});

function getDomain(url) {
    var hn = URL.parse(url).hostname;
    try {
        return hn ? hn.replace(/^www\./, '') : hn;
    } catch (e) {
        return null;
    }
}

function getNormalizedUrl(url) {
    try {
        return normalizeUrl(url, {
            normalizeHttps: true,
            removeQueryParameters: [/.*/],
            removeDirectoryIndex: true
        });
    } catch (e) {
        return url;
    }
}
