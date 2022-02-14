/* eslint-disable no-console */
const { requireConfig } = require('@datawrapper/service-utils/findConfig');
const Api = require('../src/api');
const config = requireConfig();
const ORM = require('@datawrapper/orm');
const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const fs = require('fs/promises');
const path = require('path');
const sinon = require('sinon');
const sleep = require('../src/utils/sleep');
const { step } = require('mocha-steps');
const {
    resetChartViewStatistics,
    destroy,
    createTeam,
    createUser,
    createCharts
} = require('./helpers');
const { waitForDb } = require('../src/utils/db');
const Flusher = require('../src/flusher');
const got = require('got');

const resultsFile = 'results/performance.csv';

describe('Pixeltracker Performance', function () {
    this.timeout(5 * 60 * 1000); // 5 minutes
    let connectionPool;

    before(async () => {
        await fs.mkdir(path.dirname(resultsFile), { recursive: true });
        await fs.writeFile(
            resultsFile,
            toCSVString(['noOfCharts', 'fetchChartInfo', 'createInserts', 'runInserts'])
        );
        await ORM.init(config);
        connectionPool = await waitForDb(config.orm.db);
    });

    const start = 1000;
    const stepSize = 1000;
    const steps = 10;

    describe(`Flusher performance with`, () => {
        let pixeltrackerApi;
        let pixeltrackerFlusher;
        let clock;

        beforeEach(async () => {
            console.log('beforeEach');
            // initialize fake timer before pixeltracker so that
            // intervals and timeouts within pixeltracker are affected
            clock = sinon.useFakeTimers();
            pixeltrackerApi = new Api(config.pixeltracker);
            await pixeltrackerApi.init();
            await pixeltrackerApi.queue.obliterate({ force: true });
            await pixeltrackerApi.start();

            pixeltrackerFlusher = new Flusher(config.pixeltracker);
            await pixeltrackerFlusher.init();
            await pixeltrackerFlusher.start();
        });

        afterEach(async () => {
            console.log('afterEach');
            await pixeltrackerApi.stop();
            await pixeltrackerFlusher.stop();
            clock.restore();
        });

        const testRuns = Array.from({ length: steps }, (v, i) => start + stepSize * i);
        testRuns.forEach(noOfCharts => {
            step(`${noOfCharts} charts`, async () => {
                let charts = [];
                let user;
                let team;
                try {
                    user = await createUser();
                    team = await createTeam();
                    const chartProps = Array.from({ length: noOfCharts }, (v, i) => i).map(i => ({
                        author_id: user.id,
                        organization_id: team.id,
                        id: String(i).padStart(5, '0')
                    }));
                    console.log(chartProps.map(c => c.id));
                    console.log(`Creating ${noOfCharts} charts...`);
                    charts = await createCharts(chartProps);
                    console.log(`Created charts. Running pixel requests...`);
                    const testRequests = charts.map(
                        chart =>
                            `http://localhost:${config.pixeltracker.api.port}/${chart.id}/pixel.gif`
                    );
                    for (const request of testRequests) {
                        await got(request);
                    }
                    console.log('Finished requests');

                    clock.tick(20000);

                    // Restore fake time so that sleep will actually
                    // wait for db operations to finish
                    clock.restore();
                    const body = await waitForFlush(pixeltrackerFlusher);
                    console.log(body.text);
                    await fs.appendFile(
                        resultsFile,
                        toCSVString([
                            noOfCharts,
                            body.times.fetchChartInfo / 1000,
                            body.times.createInserts / 1000,
                            body.times.runInserts / 1000
                        ])
                    );
                } finally {
                    console.log('Cleaning up...');
                    await resetChartViewStatistics(connectionPool, charts, [user], [team], []);
                    await destroy(charts, team, user);
                    console.log('Clean up done.');
                }
            });
        });
    });

    after(async () => {
        await connectionPool.end();
    });
});

const waitForFlush = async flusher => {
    let body;
    while (!body) {
        await sleep(5000);
        await chai
            .request(flusher.app)
            .get('/health')
            .then(res => {
                if (res.body.text !== 'I have no flush in memory at the moment.') {
                    console.log('Flush has run.');
                    body = res.body;
                } else {
                    console.log("Hasn't flushed yet, waiting 5 seconds...");
                }
            })
            .catch(err => {
                throw err;
            });
    }
    return body;
};

function toCSVString(row) {
    return row.join(';') + '\n';
}
