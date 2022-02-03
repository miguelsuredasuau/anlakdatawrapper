const express = require('express');
const mysql = require('mysql2/promise');
const moment = require('moment');
const URL = require('url');
const normalizeUrl = require('normalize-url');
const logger = require('./utils/logger');
const sleep = require('./utils/sleep');
const { validatePixeltracker } = require('@datawrapper/schemas/config');

class Api {
    constructor(config) {
        validatePixeltracker(config);
        this.config = config;

        this.chartHits = {};
        this.domainHits = {};
        this.chartUrls = {};
        this.times = {};
        this.isFlushing = false;
    }

    async init() {
        this.connection = await waitForDb(this.config.db);
        this.app = express();
        this.pixel = require('fs').readFileSync(__dirname + '/pixel.gif');

        this.app.get('/health', this.getHealth.bind(this));

        this.app.get(/([a-zA-Z0-9]+)\/(?:pixel|datawrapper).gif/, this.getPixel.bind(this));
    }

    async start() {
        if (!this.connection) {
            throw new Error('Not initialized');
        }

        const port = this.config.port;
        this.server = this.app
            .listen(port, function () {
                logger.info('Express server listening on port ' + port);
            })
            .on('error', function (err) {
                logger.error(err);
                process.exit();
            });
        const interval =
            this.config.intervalMin +
            Math.round(Math.random() * (this.config.intervalMax - this.config.intervalMin));
        this.flushInterval = setInterval(() => this.flush(), interval);
    }

    async stop() {
        if (!this.server) {
            throw new Error('Not started');
        }
        logger.info('Shutting down...');
        await this.server.close();
        clearInterval(this.flushInterval);
        while (this.isFlushing) {
            logger.info('Waiting for end of flush...');
            await sleep(1000);
        }
        logger.info('Bye bye.');
    }

    getPixel(req, res) {
        const chartId = req.params[0];
        if (!this.chartHits[chartId]) this.chartHits[chartId] = 0;
        this.chartHits[chartId]++;

        const ref = req.query.r;
        const domain = ref ? getDomain(ref) : 'direct';
        if (!this.domainHits[domain]) this.domainHits[domain] = 0;
        this.domainHits[domain]++;

        const url = ref ? getNormalizedUrl(ref) : 'direct';
        if (!this.chartUrls[chartId]) this.chartUrls[chartId] = {};
        if (this.chartUrls[chartId][url] === undefined) this.chartUrls[chartId][url] = 0;
        this.chartUrls[chartId][url]++;
        res.end(this.pixel, 'binary');
    }

    getHealth(req, res) {
        let message = '';

        if (!this.times.total) {
            message = 'I have no flush in memory at the moment.';
        } else {
            message =
                'The last flush took ' +
                this.times.total +
                'ms.\r\n\r\n' +
                '- Fetching chart info took ' +
                this.times.fetchChartInfo +
                'ms.\r\n' +
                '- Creating the inserts took ' +
                this.times.createInserts +
                'ms.\r\n' +
                '- Running the inserts took ' +
                this.times.runInserts +
                'ms.';
        }

        const msg = {
            response_type: 'in_channel',
            text: message
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(msg));
    }

    async flush() {
        logger.info('Flushing Hits to DB...');
        this.isFlushing = true;
        // copy counter
        const chartHitsCopy = { ...this.chartHits };
        const domainHitsCopy = { ...this.domainHits };
        const chartUrlsCopy = { ...this.chartUrls };

        // reset counter
        this.chartHits = {};
        this.domainHits = {};
        this.chartUrls = {};

        this.times = {
            start: Date.now(),
            fetchChartInfo: 0,
            createInserts: 0,
            runInserts: 0,
            end: 0,
            total: 0
        };

        const connection = this.connection;
        logger.info('Got connection. Fetching chart info...');
        try {
            this.times.start = Date.now();
            const results = await Promise.all(
                Object.keys(chartHitsCopy).map(chartId => this.getUserAndOrgForChartId(chartId))
            );
            this.times.fetchChartInfo = Date.now() - this.times.start;
            logger.info('Got chart info. Building inserts...');

            await connection.beginTransaction();
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
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_domain_month (domain, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [domain, thisMonth, domainHitsCopy[domain], domainHitsCopy[domain]]
                        )
                    );
                }
            });

            Object.keys(chartUrlsCopy).forEach(chartId => {
                Object.keys(chartUrlsCopy[chartId]).forEach(url => {
                    if (url !== 'direct' && url.substr(0, 28) !== 'http://datawrapper.dwcdn.net') {
                        const views = chartUrlsCopy[chartId][url];
                        inserts.push(
                            connection.query(
                                'INSERT INTO pixeltracker_chart_embedurl (chart_id, url, views)' +
                                    'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ? ',
                                [chartId, url, views, views]
                            )
                        );
                    }
                });
            });

            results.forEach(function (el) {
                if (el.chartId === undefined) {
                    return;
                    // if no chartId is set, the chart was not found in the database,
                    // and we don't want to track this hit.
                }
                inserts.push(
                    connection.query(
                        'INSERT INTO pixeltracker_chart (chart_id, views)' +
                            'VALUES (?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                        [el.chartId, chartHitsCopy[el.chartId], chartHitsCopy[el.chartId]]
                    )
                );

                if (typeof el.userId === 'number') {
                    const today = moment().startOf('day').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_user_day (user_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [el.userId, today, chartHitsCopy[el.chartId], chartHitsCopy[el.chartId]]
                        )
                    );

                    const thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_user_week (user_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [
                                el.userId,
                                thisWeek,
                                chartHitsCopy[el.chartId],
                                chartHitsCopy[el.chartId]
                            ]
                        )
                    );

                    const thisMonth = moment().startOf('month').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_user_month (user_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [
                                el.userId,
                                thisMonth,
                                chartHitsCopy[el.chartId],
                                chartHitsCopy[el.chartId]
                            ]
                        )
                    );
                }

                if (typeof el.orgId === 'string') {
                    const today = moment().startOf('day').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_organization_day (organization_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [el.orgId, today, chartHitsCopy[el.chartId], chartHitsCopy[el.chartId]]
                        )
                    );

                    const thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_organization_week (organization_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [
                                el.orgId,
                                thisWeek,
                                chartHitsCopy[el.chartId],
                                chartHitsCopy[el.chartId]
                            ]
                        )
                    );

                    const thisMonth = moment().startOf('month').format('YYYY-MM-DD');
                    inserts.push(
                        connection.query(
                            'INSERT INTO pixeltracker_organization_month (organization_id, date, views)' +
                                'VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE views = views + ?',
                            [
                                el.orgId,
                                thisMonth,
                                chartHitsCopy[el.chartId],
                                chartHitsCopy[el.chartId]
                            ]
                        )
                    );
                }
            });

            this.times.createInserts = Date.now() - this.times.start - this.times.fetchChartInfo;
            logger.info('Inserts are ready. Executing them...');

            await Promise.all(inserts);
            logger.info('Committing Transaction...');
            await connection.commit();
            this.times.runInserts =
                Date.now() -
                this.times.start -
                this.times.fetchChartInfo -
                this.times.createInserts;
            this.times.end = Date.now();
            this.times.total = this.times.end - this.times.start;
            this.isFlushing = false;
            logger.info('We are done here!');
        } catch (e) {
            logger.warn('Failed to flush chart view statistics', e);
        }
    }

    async getUserAndOrgForChartId(chartId) {
        const [rows] = await this.connection.query(
            'SELECT id, author_id, organization_id FROM chart WHERE id = ?',
            [chartId]
        );
        if (rows.length === 0) {
            return {};
        }
        return {
            chartId: rows[0].id,
            userId: rows[0].author_id,
            orgId: rows[0].organization_id
        };
    }
}

async function waitForDb(dbConfig) {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.connect();
        await connection.query('USE ' + dbConfig.database);
        logger.info('Database initialization complete.');
        return connection;
    } catch (e) {
        logger.warn('Exception initializing database, trying again in 5 seconds...');
        await sleep(5000);
        return await waitForDb(dbConfig);
    }
}

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

module.exports = Api;
