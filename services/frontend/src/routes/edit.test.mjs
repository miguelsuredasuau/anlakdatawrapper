import { createChart, createUser, destroy } from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseSvelteView,
    parseSvelteProps
} from '../../test/helpers/serverUtils.mjs';

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
