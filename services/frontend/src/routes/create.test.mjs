import { createUser, destroy } from '../../../api/test/helpers/setup.js';
import {
    getSessionHeaders,
    parseSvelteView,
    parseSvelteProps
} from '../../test/helpers/serverUtils.mjs';

describe('GET /create/chart', function () {
    let userObj = {};

    before(async function () {
        userObj = await createUser(this.server);
    });

    after(async function () {
        await destroy(...Object.values(userObj));
    });

    it('creates a chart for the authenticated user and redirects to the editor', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: '/create/chart',
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(302);

        // Check that user has exactly one chart now.
        const Chart = this.server.methods.getModel('chart');
        const allUsersCharts = await Chart.findAll({ where: { author_id: userObj.user.id } });
        expect(allUsersCharts.length).to.equal(1);

        // Check that the route response redirects to the user's chart.
        const chartIdFromURL = res.headers.location.match(/^\/chart\/(\w{5})\/edit$/)[1];
        expect(allUsersCharts[0].id).to.equal(chartIdFromURL);
    });
});

describe('POST /create', function () {
    it('sets chart data and metadata', async function () {
        const res = await this.server.inject({
            method: 'POST',
            url: '/create',
            payload: {
                title: 'My title',
                data: 'a,1',
                metadata: '{"foo": "bar"}'
            }
        });
        expect(res.statusCode).to.equal(200);
        const view = parseSvelteView(res.result);
        expect(view).to.equal('Create.svelte');
        const props = parseSvelteProps(res.result);
        expect(props.chartData.title).to.equal('My title');
        expect(props.chartData.metadata).to.deep.equal({ foo: 'bar' });
        expect(props.dataset).to.equal('a,1');
    });

    it('returns error 400 when chart metadata is invalid JSON', async function () {
        const res = await this.server.inject({
            method: 'POST',
            url: '/create',
            payload: {
                title: 'My title',
                data: 'a,1',
                metadata: 'spam'
            }
        });
        expect(res.statusCode).to.equal(400);
    });
});
