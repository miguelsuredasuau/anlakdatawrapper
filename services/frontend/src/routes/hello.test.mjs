import { createUser, destroy, createChart } from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseHTML,
    parseSvelteView
} from '../../test/helpers/serverUtils.mjs';

describe('GET /v2/hello/', function () {
    let userObj = {};
    let chart;

    before(async function () {
        userObj = await createUser(this.server);
        chart = await createChart({
            author_id: userObj.user.id,
            title: 'Testchart',
            theme: 'default',
            last_edit_step: 5
        });
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

    it('view compiles', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/v2/hello/`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);
        const view = parseSvelteView(res.result);
        expect(view).to.equal('hello/Index.svelte');

        const { $ } = parseHTML(res.result);
        expect($('h1')).to.have.trimmed.text('Hello world!');
    });
});
