const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const Api = require('../src/api');
const config = requireConfig();
const ORM = require('@datawrapper/orm');
const { Queue } = require('bullmq');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const expect = chai.expect;
const sinon = require('sinon');
const sleep = require('../src/utils/sleep');
const {
    getChartViewStatistics,
    resetChartViewStatistics,
    destroy,
    createTeam,
    createUser,
    createCharts
} = require('./helpers');
const { getDomain } = require('../src/utils/url');
const { waitForDb } = require('../src/utils/db');
const Flusher = require('../src/flusher');

describe('Pixeltracker', () => {
    let connectionPool;

    before(async () => {
        await ORM.init(config);
        connectionPool = await waitForDb(config.orm.db);
    });

    describe('GET /pixel', () => {
        let pixeltrackerApi;
        let pixeltrackerFlusher;
        let clock;
        beforeEach(async () => {
            // initialize fake timer before pixeltracker so that
            // intervals and timeouts within pixeltracker are affected
            clock = sinon.useFakeTimers();
            pixeltrackerApi = new Api(config.pixeltracker);
            await pixeltrackerApi.init();
            await pixeltrackerApi.start();
            await pixeltrackerApi.queue.obliterate({ force: true });

            pixeltrackerFlusher = new Flusher(config.pixeltracker);
            await pixeltrackerFlusher.init();
            await pixeltrackerFlusher.start();
        });

        afterEach(async () => {
            await pixeltrackerApi.stop();
            await pixeltrackerFlusher.stop();
            clock.restore();
        });

        it('should track chart views correctly', async () => {
            let charts;
            let user;
            let team;
            const testUrlA = 'http://test.datawrapper.de';
            const testUrlB = 'http://test.datawrapper.de/foo';
            const testUrlC = 'http://other.datawrapper.de/foo';
            const testDomainA = getDomain(testUrlB);
            const testDomainB = getDomain(testUrlC);
            try {
                user = await createUser();
                team = await createTeam();
                charts = await createCharts([
                    { author_id: user.id, organization_id: team.id },
                    { author_id: user.id, organization_id: team.id }
                ]);
                let testRequests = [
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlC)}`
                ];
                await Promise.all(
                    testRequests.map(request =>
                        chai
                            .request(pixeltrackerApi.app)
                            .get(request)
                            .then(res => {
                                expect(res).to.have.status(200);
                            })
                    )
                );

                clock.tick(20000);

                testRequests = [
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlC)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`
                ];
                await Promise.all(
                    testRequests.map(request =>
                        chai
                            .request(pixeltrackerApi.app)
                            .get(request)
                            .then(res => {
                                expect(res).to.have.status(200);
                            })
                    )
                );

                clock.tick(20000);

                // Restore fake time so that sleep will actually
                // wait for db operations to finish
                clock.restore();
                await sleep(1000);
                await chai
                    .request(pixeltrackerApi.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.text).to.equal(`Still counting chart hits`);
                        expect(res.body.queue.name).to.equal(config.pixeltracker.queue.name);
                        expect(res.body.queue.completed).to.equal(2);
                    })
                    .catch(err => {
                        throw err;
                    });

                // check correct chart view statistics
                const chartViews = await getChartViewStatistics(
                    connectionPool,
                    charts[0],
                    user,
                    team,
                    testDomainA,
                    testUrlA
                );
                expect(chartViews.total).to.equal(8);
                expect(chartViews.perEmbedUrl).to.equal(5);
                expect(chartViews.perDomain.perMonth).to.equal(11);
                expect(chartViews.perUser.perDay).to.equal(13);
                expect(chartViews.perUser.perMonth).to.equal(13);
                expect(chartViews.perUser.perWeek).to.equal(13);
                expect(chartViews.perTeam.perDay).to.equal(13);
                expect(chartViews.perTeam.perMonth).to.equal(13);
                expect(chartViews.perTeam.perWeek).to.equal(13);
            } finally {
                await resetChartViewStatistics(
                    connectionPool,
                    charts,
                    [user],
                    [team],
                    [testDomainA, testDomainB]
                );
                await destroy(charts, team, user);
            }
        });
    });

    describe('GET /health', () => {
        let charts;
        let clock;
        let pixeltrackerApi;
        let team;
        let user;

        beforeEach(async () => {
            // initialize fake timer before pixeltracker so that
            // intervals and timeouts within pixeltracker are affected
            clock = sinon.useFakeTimers();
            pixeltrackerApi = new Api(config.pixeltracker);

            await pixeltrackerApi.init();
            await pixeltrackerApi.start();
            await pixeltrackerApi.queue.obliterate({ force: true });

            user = await createUser();
            team = await createTeam();
            charts = await createCharts([{ author_id: user.id, organization_id: team.id }]);
        });

        afterEach(async () => {
            await pixeltrackerApi.stop();
            clock.restore();

            await destroy(charts, team, user);
        });

        it('should throw error if too many jobs are queued', async () => {
            try {
                const testRequests = [
                    `/${charts[0].id}/pixel.gif`,
                    `/${charts[0].id}/pixel.gif`,
                    `/${charts[0].id}/pixel.gif`,
                    `/${charts[0].id}/pixel.gif`,
                    `/${charts[0].id}/pixel.gif`
                ];
                for (const request of testRequests) {
                    await chai
                        .request(pixeltrackerApi.app)
                        .get(request)
                        .then(res => {
                            expect(res).to.have.status(200);
                        });
                    clock.tick(20000);
                }
                // Now all the jobs should be in the queue
                // The flusher should not have processed any jobs yet
                await chai
                    .request(pixeltrackerApi.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(555);
                        expect(res.body.text).to.equal(`Still counting chart hits`);
                        expect(res.body.queue.name).to.equal(config.pixeltracker.queue.name);
                        expect(res.body.queue.waiting).to.equal(5);
                    });
            } finally {
                await resetChartViewStatistics(connectionPool, charts, [user], [team], []);
            }
        });

        it('should throw error if a flush job fails', async () => {
            let pixeltrackerFlusher;
            let job;

            try {
                pixeltrackerFlusher = new Flusher(config.pixeltracker);
                await pixeltrackerFlusher.init();
                await pixeltrackerFlusher.start();

                // Add an invalid job.
                const queue = new Queue(config.pixeltracker.queue.name, {
                    connection: config.pixeltracker.redis
                });
                job = await queue.add('flush', 'invalid job data');

                clock.tick(20000);
                // Restore fake time so that sleep will actually
                // wait for db operations to finish
                clock.restore();
                await sleep(200);
                await chai
                    .request(pixeltrackerApi.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(555);
                        expect(res.body.text).to.equal(`Still counting chart hits`);
                        expect(res.body.queue.name).to.equal(config.pixeltracker.queue.name);
                        expect(res.body.queue.failed).to.equal(1);
                    });
            } finally {
                await job.remove();
                await pixeltrackerFlusher.stop();
            }
        });

        it('should return OK again if last failed job is older than specified period', async () => {
            let pixeltrackerFlusher;

            try {
                // Deactivating fake timers as I did not manage to do it with.
                // Reporting OK again after a job failed is based on a
                // certain amount of time having passed after the failed job has
                // completed processing. Using fake time holds of any processing until
                // restoring the clock. Hence the failure period is not counted correctly.
                clock.restore();
                pixeltrackerFlusher = new Flusher(config.pixeltracker);
                await pixeltrackerFlusher.init();
                await pixeltrackerFlusher.start();

                // Add an invalid job.
                const queue = new Queue(config.pixeltracker.queue.name, {
                    connection: config.pixeltracker.redis
                });
                await queue.add('flush', 'invalid job data');
                // Wait for failure reporting period to pass
                await sleep(config.pixeltracker.api.reportFailuresPeriod * 1000);

                await chai
                    .request(pixeltrackerApi.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.text).to.equal(`Still counting chart hits`);
                        expect(res.body.queue.name).to.equal(config.pixeltracker.queue.name);
                        expect(res.body.queue.failed).to.equal(1);
                    });
            } finally {
                await pixeltrackerFlusher.stop();
            }
            // use custom timeout as failure reporting period is configurable from the outside
        }).timeout(Math.max(2000, (config.pixeltracker.api.reportFailuresPeriod + 2) * 1000));
    });

    after(async () => {
        await connectionPool.end();
    });
});
