import { createChart, createUser, destroy } from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseSvelteView,
    parseSvelteProps
} from '../../tests/helpers/serverUtils.mjs';

describe('GET /chart/{chartId}/publish', function () {
    let chart;
    let userObj = {};

    before(async function () {
        userObj = await createUser(this.server);
        chart = await createChart({ author_id: userObj.user.id });
        const api = createAPIForUser(this.server, userObj);
        await api(`/charts/${chart.id}/data`, {
            method: 'PUT',
            body: 'foo,bar\n1,2',
            headers: {
                'Content-Type': 'text/csv'
            },
            json: false
        });
    });

    after(async function () {
        await destroy(chart, ...Object.values(userObj));
    });

    it('sets chart data and metadata', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/chart/${chart.id}/publish`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);
        const view = parseSvelteView(res.result);
        expect(view).to.equal('edit/Index.svelte');
        const props = parseSvelteProps(res.result);
        expect(props.rawChart.authorId).to.deep.equal(userObj.user.id);
        expect(props.rawChart.id).to.deep.equal(chart.id);
        expect(props.rawData).to.deep.equal('foo,bar\n1,2');
    });
});

describe('GET /edit/{chartId}/markers', function () {
    let chart;
    let userObj = {};

    before(async function () {
        userObj = await createUser(this.server);

        this.server.app.visualizations.set('test-vis', {
            id: 'test-vis',
            workflow: 'test-workflow',
            title: 'Test Vis'
        });

        this.server.methods.registerEditWorkflow({
            id: 'test-workflow',
            prefix: 'edit',
            steps: [
                {
                    id: 'step1',
                    view: 'edit/chart/upload',
                    title: ['steps - markers', 'locator-maps'],
                    forceReload: true
                },
                {
                    id: 'step2',
                    view: 'edit/chart/upload',
                    title: ['steps - design', 'locator-maps'],
                    forceReload: true
                },
                {
                    id: 'step3',
                    view: 'edit/chart/upload',
                    title: ['steps - annotate', 'locator-maps'],
                    forceReload: true
                }
            ]
        });

        chart = await createChart({ author_id: userObj.user.id, type: 'test-vis' });
        const api = createAPIForUser(this.server, userObj);
        await api(`/charts/${chart.id}/data`, {
            method: 'PUT',
            body: JSON.stringify({ markers: [] }),
            json: false
        });
    });

    it('sets chart data and metadata in /edit/ route', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/edit/${chart.id}/step1`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);

        const view = parseSvelteView(res.result);
        expect(view).to.equal('edit/Index.svelte');
        const props = parseSvelteProps(res.result);
        expect(props.rawChart.authorId).to.deep.equal(userObj.user.id);
        expect(props.rawChart.id).to.deep.equal(chart.id);
        expect(props.rawData).to.equal('{"markers":[]}');
    });

    it('sets chart data and metadata in /v2/edit/ route', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/edit/${chart.id}/step2`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);

        const view = parseSvelteView(res.result);
        expect(view).to.equal('edit/Index.svelte');
        const props = parseSvelteProps(res.result);
        expect(props.rawChart.authorId).to.deep.equal(userObj.user.id);
        expect(props.rawChart.id).to.deep.equal(chart.id);
        expect(props.rawData).to.equal('{"markers":[]}');
    });

    after(async function () {
        await destroy(chart, ...Object.values(userObj));
    });
});
