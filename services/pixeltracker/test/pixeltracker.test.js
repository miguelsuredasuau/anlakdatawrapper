const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const Api = require('../src/api');
const config = requireConfig();
const ORM = require('@datawrapper/orm');
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
    let pixeltrackerApi;
    let pixeltrackerFlusher;
    let clock;
    let connection;

    before(async () => {
        await ORM.init(config);
        connection = await waitForDb(config.orm.db);
    });

    beforeEach(async () => {
        // initialize fake timer before pixeltracker so that
        // intervals and timeouts within pixeltracker are affected
        clock = sinon.useFakeTimers();
        pixeltrackerApi = new Api(config.pixeltracker);
        await pixeltrackerApi.init();
        await pixeltrackerApi.start();

        pixeltrackerFlusher = new Flusher(config.pixeltracker);
        await pixeltrackerFlusher.init();
        await pixeltrackerFlusher.start();
    });

    describe('GET /pixel', () => {
        it('should track chart view correctly', async () => {
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
                const testRequests = [
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlB)}`,
                    `/${charts[0].id}/pixel.gif?r=${encodeURIComponent(testUrlC)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
                    `/${charts[1].id}/pixel.gif?r=${encodeURIComponent(testUrlA)}`,
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

                // Restore fake time so that sleep will actually
                // wait for db operations to finish
                clock.restore();
                await sleep(200);
                await chai
                    .request(pixeltrackerApi.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.text).to.equal(`Still counting chart hits`);
                        expect(res.body.queue.name).to.equal(config.pixeltracker.queue.name);
                        expect(res.body.queue.completed).to.equal(1);
                    })
                    .catch(err => {
                        throw err;
                    });

                // check correct chart view statistics
                const chartViews = await getChartViewStatistics(
                    connection,
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
                    connection,
                    charts,
                    [user],
                    [team],
                    [testDomainA, testDomainB]
                );
                await destroy(charts, team, user);
            }
        });
    });

    afterEach(async () => {
        await pixeltrackerApi.stop();
        await pixeltrackerFlusher.stop();
        clock.restore();
    });

    after(async () => {
        await connection.close();
    });
});
