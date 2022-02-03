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
    createChart,
    destroy
} = require('./helpers');

describe('Pixeltracker', () => {
    let pixeltracker;
    let clock;

    before(async () => {
        await ORM.init(config);
    });

    beforeEach(async () => {
        // initialize fake timer before pixeltracker so that
        // intervals and timeouts within pixeltracker are affected
        clock = sinon.useFakeTimers();
        pixeltracker = new Api(config.pixeltracker);
        await pixeltracker.init();
        await pixeltracker.start();
    });

    describe('GET /pixel', () => {
        it('should track chart view correctly', async () => {
            let chart;
            try {
                chart = await createChart();
                await chai
                    .request(pixeltracker.app)
                    .get(`/${chart.id}/pixel.gif`)
                    // .query({value1: 'value1', value2: 'value2'})
                    .then(res => {
                        expect(res).to.have.status(200);
                    });
                clock.tick(20000);

                // Restore fake time so that sleep will actually
                // wait for db operations to finish
                clock.restore();
                await sleep(20);
                await chai
                    .request(pixeltracker.app)
                    .get('/health')
                    .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.text).not.to.equal(
                            'I have no flush in memory at the moment.'
                        );
                    })
                    .catch(err => {
                        throw err;
                    });
                const statistics = await getChartViewStatistics(pixeltracker.connection, chart.id);
                expect(statistics.length).to.equal(1);
                expect(statistics[0].views).to.equal(1);
            } finally {
                await resetChartViewStatistics(pixeltracker.connection, chart?.id);
                await destroy(chart);
            }
        });
    });

    afterEach(async () => {
        await pixeltracker.stop();
        clock.restore();
    });
});
