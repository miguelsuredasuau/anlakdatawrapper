const moment = require('moment');
const logger = require('./utils/logger');
const { validatePixeltracker } = require('@datawrapper/schemas/config');
const { waitForDb } = require('./utils/db');
const { Worker } = require('bullmq');
const { waitForRedis } = require('./utils/redis');
const express = require('express');

class Flusher {
    constructor(config) {
        validatePixeltracker(config);
        this.config = config;
        this.times = {};
        this.isFlushing = false;
    }

    async init() {
        this.connectionPool = await waitForDb(this.config.flusher.db);
        if (!this.connectionPool) {
            return;
        }
        await waitForRedis(this.config.redis);
        this.app = express();
        this.app.get('/health', this.getHealth.bind(this));
        logger.info('Initialization completed.');
    }

    async start() {
        if (!this.connectionPool) {
            throw new Error('Not initialized');
        }
        this.worker = new Worker(this.config.queue.name, async job => this.flush(job.data), {
            connection: this.config.redis
        });
        this.worker.on('error', err => {
            logger.error(err);
        });
        this.worker.on('closing', () => {
            logger.info('Redis connection is closing...');
        });
        this.worker.on('closed', () => {
            logger.info('Redis connection closed.');
        });
        const port = this.config.flusher.port;
        this.server = this.app
            .listen(port, function () {
                logger.info('Flusher listening on port ' + port);
            })
            .on('error', function (err) {
                logger.error(err);
            });
        logger.info(`Flusher ready (queue: ${this.config.queue.name})`);
    }

    async stop() {
        logger.info('Shutting down...');
        if (!this.worker) {
            throw new Error('Not started');
        }
        await this.worker.close();
        await this.connectionPool.end();
        this.server.close(() => {
            logger.info('HTTP server is closed.');
            logger.info('Bye bye.');
        });
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
            text: message,
            times: this.times
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(msg));
    }

    async flush(job) {
        logger.info('Flushing Hits to DB...');
        this.isFlushing = true;

        const { chartHits, domainHits, chartUrls } = job;
        this.times = {
            start: Date.now(),
            fetchChartInfo: 0,
            createInserts: 0,
            runInserts: 0,
            end: 0,
            total: 0
        };

        const connection = await this.connectionPool.getConnection();
        logger.info('Got connection. Fetching chart info...');
        try {
            this.times.start = Date.now();
            const results = await this.getUserAndOrgForChartIds(connection, Object.keys(chartHits));
            this.times.fetchChartInfo = Date.now() - this.times.start;
            logger.info('Got chart info. Building inserts...');

            await connection.beginTransaction();
            const inserts = [];

            const domainHitsPerMonthValues = [];
            Object.keys(domainHits).forEach(domain => {
                if (
                    domain &&
                    domain !== 'direct' &&
                    domain !== 'datawrapper.de' &&
                    domain !== 'datawrapper.dwcdn.net' &&
                    domain !== 'null'
                ) {
                    const thisMonth = moment().startOf('month').format('YYYY-MM-DD');
                    domainHitsPerMonthValues.push([domain, thisMonth, domainHits[domain]]);
                }
            });
            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_domain_month',
                    ['domain', 'date', 'views'],
                    domainHitsPerMonthValues
                )
            );

            Object.keys(chartUrls).forEach(chartId => {
                const perChartIdAndEmbedUrlValues = [];
                Object.keys(chartUrls[chartId]).forEach(url => {
                    if (url !== 'direct' && url.substr(0, 28) !== 'http://datawrapper.dwcdn.net') {
                        const views = chartUrls[chartId][url];
                        perChartIdAndEmbedUrlValues.push([chartId, url, views]);
                    }
                });
                inserts.push(
                    ...this.createViewsInsertQueries(
                        connection,
                        'pixeltracker_chart_embedurl',
                        ['chart_id', 'url', 'views'],
                        perChartIdAndEmbedUrlValues
                    )
                );
            });

            const chartHitValues = [];
            const userPerDayValues = [];
            const userPerWeekValues = [];
            const userPerMonthValues = [];
            const teamPerDayValues = [];
            const teamPerWeekValues = [];
            const teamPerMonthValues = [];
            results.forEach(function (el) {
                if (el.chartId === undefined) {
                    return;
                    // if no chartId is set, the chart was not found in the database,
                    // and we don't want to track this hit.
                }
                chartHitValues.push([el.chartId, chartHits[el.chartId]]);

                const today = moment().startOf('day').format('YYYY-MM-DD');
                const thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');
                const thisMonth = moment().startOf('month').format('YYYY-MM-DD');

                if (typeof el.userId === 'number') {
                    userPerDayValues.push([el.userId, today, chartHits[el.chartId]]);
                    userPerWeekValues.push([el.userId, thisWeek, chartHits[el.chartId]]);
                    userPerMonthValues.push([el.userId, thisMonth, chartHits[el.chartId]]);
                }

                if (typeof el.orgId === 'string') {
                    teamPerDayValues.push([el.orgId, today, chartHits[el.chartId]]);
                    teamPerWeekValues.push([el.orgId, thisWeek, chartHits[el.chartId]]);
                    teamPerMonthValues.push([el.orgId, thisMonth, chartHits[el.chartId]]);
                }
            });

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_chart',
                    ['chart_id', 'views'],
                    chartHitValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_user_day',
                    ['user_id', 'date', 'views'],
                    userPerDayValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_user_week',
                    ['user_id', 'date', 'views'],
                    userPerWeekValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_user_month',
                    ['user_id', 'date', 'views'],
                    userPerMonthValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_organization_day',
                    ['organization_id', 'date', 'views'],
                    teamPerDayValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_organization_week',
                    ['organization_id', 'date', 'views'],
                    teamPerWeekValues
                )
            );

            inserts.push(
                ...this.createViewsInsertQueries(
                    connection,
                    'pixeltracker_organization_month',
                    ['organization_id', 'date', 'views'],
                    teamPerMonthValues
                )
            );

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
            logger.warn(`Failed to flush chart view statistics: ${e.stack || e}`);
            throw e;
        } finally {
            await connection.release();
        }
    }

    async getUserAndOrgForChartIds(db, chartIds) {
        if (!chartIds.length) {
            return [];
        }
        const [rows] = await db.query(
            'SELECT id, author_id, organization_id FROM chart WHERE id in (?)',
            [chartIds]
        );
        if (rows.length === 0) {
            return [];
        }
        return rows.map(row => ({
            chartId: row.id,
            userId: row.author_id,
            orgId: row.organization_id
        }));
    }

    /* Returns an array of promises */
    createViewsInsertQueries(db, tableName, columns, values) {
        // The reason for splitting the queries via multiple value "chunks"
        // is so that we don't run into the maximum size for one query.
        const chunkSize = 1000;
        const queryPromises = [];
        for (let i = 0; i < values.length; i += chunkSize) {
            const valuesChunk = values.slice(i, i + chunkSize);
            queryPromises.push(
                db.query(
                    'INSERT INTO ?? (??) VALUES ? ON DUPLICATE KEY UPDATE views = views + VALUES(views)',
                    [tableName, columns, valuesChunk]
                )
            );
        }
        return queryPromises;
    }
}

module.exports = Flusher;
