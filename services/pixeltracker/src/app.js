const express = require('express');
const http = require('http');
const mysql = require('mysql');
const moment = require('moment');
const async = require('async');
const URL = require('url');
const normalizeUrl = require('normalize-url');
const logger = require('./utils/logger');
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const { validatePixeltracker } = require('@datawrapper/schemas/config');

const app = express();

const config = requireConfig().pixeltracker;
validatePixeltracker(config);

app.configure(function () {
    app.set('port', config.port);
    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

let times = {};

app.set('connection', mysql.createConnection(config.db));

function init() {
    let chartHits = {};
    let domainHits = {};
    let chartUrls = {};
    const pixel = require('fs').readFileSync(__dirname + '/pixel.gif');

    app.get('/health', function (req, res) {
        let message = '';

        if (!times.total) {
            message = 'I have no flush in memory at the moment.';
        } else {
            message =
                'The last flush took ' +
                times.total +
                'ms.\r\n\r\n' +
                '- Fetching chart info took ' +
                times.fetchChartInfo +
                'ms.\r\n' +
                '- Creating the inserts took ' +
                times.createInserts +
                'ms.\r\n' +
                '- Running the inserts took ' +
                times.runInserts +
                'ms.';
        }

        const msg = {
            response_type: 'in_channel',
            text: message
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(msg));
    });

    app.get(/([a-zA-Z0-9]+)\/(?:pixel|datawrapper).gif/, function (req, res) {
        const chartId = req.params[0];
        if (!chartHits[chartId]) chartHits[chartId] = 0;
        chartHits[chartId]++;

        const ref = req.query.r;
        const domain = ref ? getDomain(ref) : 'direct';
        if (!domainHits[domain]) domainHits[domain] = 0;
        domainHits[domain]++;

        const url = ref ? getNormalizedUrl(ref) : 'direct';
        if (!chartUrls[chartId]) chartUrls[chartId] = {};
        if (chartUrls[chartId][url] === undefined) chartUrls[chartId][url] = 0;
        chartUrls[chartId][url]++;
        res.end(pixel, 'binary');
    });

    function flush() {
        logger.info('Flushing Hits to DB...');

        // copy counter
        const chartHitsCopy = { ...chartHits };
        const domainHitsCopy = { ...domainHits };
        const chartUrlsCopy = { ...chartUrls };

        // reset counter
        chartHits = {};
        domainHits = {};
        chartUrls = {};

        const connection = app.get('connection');

        times = {
            start: Date.now(),
            fetchChartInfo: 0,
            createInserts: 0,
            runInserts: 0,
            end: 0,
            total: 0
        };

        function getUserAndOrgForChartId(chartId, callback) {
            connection.query(
                'SELECT id, author_id, organization_id FROM chart WHERE id = ?',
                chartId,
                function (err, rows) {
                    if (rows.length === 0) {
                        callback(undefined, {});
                        return;
                    }

                    callback(undefined, {
                        chartId: rows[0].id,
                        userId: rows[0].author_id,
                        orgId: rows[0].organization_id
                    });
                }
            );
        }

        logger.info('Got connection. Fetching chart info...');

        async.map(Object.keys(chartHitsCopy), getUserAndOrgForChartId, function (err, results) {
            logger.info('Got chart info. Building inserts...');

            times.fetchChartInfo = Date.now() - times.start;

            connection.beginTransaction(function (err) {
                if (err) {
                    logger.warn(err);
                }
                const inserts = [];

                Object.keys(domainHitsCopy).forEach(domain => {
                    if (
                        domain &&
                        domain !== 'direct' &&
                        domain !== 'datawrapper.de' &&
                        domain !== 'datawrapper.dwcdn.net' &&
                        domain !== 'null'
                    ) {
                        const thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                        inserts.push(function (callback) {
                            connection.query(
                                'INSERT INTO pixeltracker_domain_month (domain, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [domain, thisMonth, domainHitsCopy[domain], domainHitsCopy[domain]],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });
                    }
                });

                Object.keys(chartUrlsCopy).forEach(chartId => {
                    Object.keys(chartUrlsCopy[chartId]).forEach(url => {
                        if (
                            url !== 'direct' &&
                            url.substr(0, 28) !== 'http://datawrapper.dwcdn.net'
                        ) {
                            const views = chartUrlsCopy[chartId][url];
                            inserts.push(function (callback) {
                                connection.query(
                                    'INSERT INTO pixeltracker_chart_embedurl (chart_id, url, views)' +
                                        'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ? ',
                                    [chartId, url, views, views],
                                    function (err) {
                                        if (err) {
                                            logger.warn(err);
                                        }
                                        callback(null, 'finished');
                                    }
                                );
                            });
                        }
                    });
                });

                results.forEach(function (el) {
                    if (el.chartId === undefined) {
                        return;
                        // if no chartId is set, the chart was not found in the database,
                        // and we don't want to track this hit.
                    }

                    inserts.push(function (callback) {
                        connection.query(
                            'INSERT INTO pixeltracker_chart (chart_id, views)' +
                                'VALUES (?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [el.chartId, chartHitsCopy[el.chartId], chartHitsCopy[el.chartId]],
                            function (err) {
                                if (err) {
                                    logger.warn(err);
                                }
                                callback(null, 'finished');
                            }
                        );
                    });

                    if (typeof el.userId === 'number') {
                        inserts.push(function (callback) {
                            const today = moment().startOf('day').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_user_day (user_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.userId,
                                    today,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });

                        inserts.push(function (callback) {
                            const thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_user_week (user_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.userId,
                                    thisWeek,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });

                        inserts.push(function (callback) {
                            const thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_user_month (user_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.userId,
                                    thisMonth,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });
                    }

                    if (typeof el.orgId === 'string') {
                        inserts.push(function (callback) {
                            const today = moment().startOf('day').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_organization_day (organization_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.orgId,
                                    today,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });

                        inserts.push(function (callback) {
                            const thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_organization_week (organization_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.orgId,
                                    thisWeek,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });

                        inserts.push(function (callback) {
                            const thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                            connection.query(
                                'INSERT INTO pixeltracker_organization_month (organization_id, date, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                                [
                                    el.orgId,
                                    thisMonth,
                                    chartHitsCopy[el.chartId],
                                    chartHitsCopy[el.chartId]
                                ],
                                function (err) {
                                    if (err) {
                                        logger.warn(err);
                                    }
                                    callback(null, 'finished');
                                }
                            );
                        });
                    }
                });

                times.createInserts = Date.now() - times.start - times.fetchChartInfo;

                logger.info('Inserts are ready. Executing them...');

                async.series(inserts, function (err) {
                    if (err) {
                        logger.warn(err);
                    }
                    logger.info('Committing Transaction...');
                    connection.commit(function (err) {
                        if (err) {
                            logger.warn(err);
                        }
                        logger.info('We are done here!');
                        times.runInserts =
                            Date.now() - times.start - times.fetchChartInfo - times.createInserts;
                        times.end = Date.now();
                        times.total = times.end - times.start;
                    });
                });
            });
        });
    }

    const interval =
        config.intervalMin + Math.round(Math.random() * (config.intervalMax - config.intervalMin));
    setInterval(flush, interval);

    http.createServer(app).listen(app.get('port'), function () {
        logger.info('Express server listening on port ' + app.get('port'));
    });
}

const client = app.get('connection');
async.series(
    [
        function connect(callback) {
            client.connect(callback);
        },
        function useDb(callback) {
            client.query('USE ' + config.db.database, callback);
        }
    ],
    function (err) {
        if (err) {
            logger.warn('Exception initializing database.');
            throw err;
        } else {
            logger.info('Database initialization complete.');
            init();
        }
    }
);

function getDomain(url) {
    const hn = URL.parse(url).hostname;
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
