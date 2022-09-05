import { createChart, createUser, destroy } from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseHTML,
    parseSvelteView
} from '../../tests/helpers/serverUtils.mjs';

describe('GET /archive/', function () {
    let chart;
    let userObj = {};

    before(async function () {
        userObj = await createUser(this.server);
        chart = await createChart({
            author_id: userObj.user.id,
            title: 'Testchart',
            last_edit_step: 3
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

    it('shows user archive', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/archive/`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);
        const view = parseSvelteView(res.result);
        expect(view).to.equal('archive/Index.svelte');

        const { $, $$ } = parseHTML(res.result);

        expect($('h1')).to.have.trimmed.text('My archive');
        expect($$('figure')).to.have.length(1);
        expect($('figcaption')).to.have.trimmed.text('Testchart');
    });
});
