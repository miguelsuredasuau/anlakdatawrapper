const express = require('express');
const logger = require('./utils/logger');
const { validatePixeltracker } = require('@datawrapper/schemas/config');
const { getDomain, getNormalizedUrl } = require('./utils/url');
const { Queue } = require('bullmq');
const { waitForRedis } = require('./utils/redis');

class Api {
    constructor(config) {
        validatePixeltracker(config);
        this.config = config;
        this.chartHits = {};
        this.domainHits = {};
        this.chartUrls = {};
    }

    async init() {
        this.app = express();
        this.pixel = require('fs').readFileSync(__dirname + '/pixel.gif');
        await waitForRedis(this.config.redis);
        this.queue = new Queue(this.config.queue.name, {
            connection: this.config.redis,
            defaultJobOptions: {
                removeOnComplete: this.config.queue.removeOnComplete,
                removeOnFail: this.config.queue.removeOnFail
            }
        });
        this.queue.on('error', err => {
            logger.error(err);
        });

        this.app.get('/health', this.getHealth.bind(this));
        this.app.get('/jobs', this.getJobs.bind(this));

        this.app.get(/([a-zA-Z0-9]+)\/(?:pixel|datawrapper).gif/, this.getPixel.bind(this));
        logger.info(`API ready (queue: ${this.config.queue.name})`);
    }

    async start() {
        if (!this.queue) {
            throw new Error('Not initialized');
        }

        const port = this.config.api.port;
        this.server = this.app
            .listen(port, function () {
                logger.info('API listening on port ' + port);
            })
            .on('error', function (err) {
                logger.error(err);
            });
        const interval = this.config.api.interval;
        this.flushInterval = setInterval(() => {
            if (isEmpty(this.chartHits) && isEmpty(this.domainHits) && isEmpty(this.chartUrls)) {
                return;
            }
            this.queue.add('flush', {
                chartHits: { ...this.chartHits },
                domainHits: { ...this.domainHits },
                chartUrls: { ...this.chartUrls }
            });
            // reset counter
            this.chartHits = {};
            this.domainHits = {};
            this.chartUrls = {};
        }, interval);
    }

    async stop() {
        if (!this.server) {
            throw new Error('Not started');
        }
        logger.info('Shutting down...');
        clearInterval(this.flushInterval);
        if (!isEmpty(this.chartHits) || !isEmpty(this.domainHits) || !isEmpty(this.chartUrls)) {
            logger.info('Adding remaining chart hits as one last job...');
            await this.queue.add('flush', {
                chartHits: { ...this.chartHits },
                domainHits: { ...this.domainHits },
                chartUrls: { ...this.chartUrls }
            });
        }
        await this.queue.close();
        logger.info('Closed queue.');
        await this.server.close(() => {
            logger.info('HTTP server is closed.');
            logger.info('Bye bye.');
        });
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

    async getHealth(req, res) {
        const counts = await this.queue.getJobCounts(
            'completed',
            'failed',
            'delayed',
            'active',
            'waiting',
            'paused',
            'repeat'
        );
        const msg = {
            response_type: 'in_channel',
            text: `Still counting chart hits`,
            queue: {
                name: this.config.queue.name,
                ...counts
            }
        };
        const raiseWarning = await shouldRaiseWarning(this.config, this.queue, counts);
        res.setHeader('Content-Type', 'application/json');
        res.status(raiseWarning ? 555 : 200).end(JSON.stringify(msg));
    }

    async getJobs(req, res) {
        const page = Number.parseInt(req.query.page) || 0;
        const limit = Number.parseInt(req.query.limit) || 100;
        const type = req.query.type || 'completed';
        const sortedBy = req.query['sort-by'] || 'desc';
        const jobs = await this.queue.getJobs(
            type,
            page * limit,
            page * limit + limit,
            sortedBy === 'asc'
        );

        res.setHeader('Content-Type', 'application/json');
        res.end(
            JSON.stringify({
                name: this.config.queue.name,
                jobs
            })
        );
    }
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

async function shouldRaiseWarning(config, queue, counts) {
    if (counts.waiting >= config.api.reportQueuedJobs) {
        return true;
    }
    const mostRecentFailedJob = (await queue.getFailed(0, 0))[0];
    if (!mostRecentFailedJob) {
        return false;
    }
    const reportingPeriodStart = new Date().getTime() - config.api.reportFailuresPeriod * 1000;
    // raise warning if the most recent failed job happened in the last x seconds
    return mostRecentFailedJob.finishedOn >= reportingPeriodStart;
}

module.exports = Api;
