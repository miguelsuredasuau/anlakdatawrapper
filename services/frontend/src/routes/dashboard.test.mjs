import { createChart, createUser, destroy } from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseHTML,
    parseSvelteView
} from '../../test/helpers/serverUtils.mjs';

describe('GET / (dashboard)', function () {
    describe('fresh user without charts', function () {
        let userObj = {};

        before(async function () {
            userObj = await createUser(this.server);
        });

        after(async function () {
            await destroy(...Object.values(userObj));
        });

        it('shows welcome to users without charts', async function () {
            const res = await this.server.inject({
                method: 'GET',
                url: `/`,
                headers: getSessionHeaders(userObj)
            });
            expect(res.statusCode).to.equal(200);
            const view = parseSvelteView(res.result);
            expect(view).to.equal('dashboard/Index.svelte');

            const { $, $$ } = parseHTML(res.result);

            expect($('h2')).to.include.text('Welcome');
            expect($$('a[href="/chart/create"]')).to.have.length(1);
        });
    });

    describe('user with a chart', function () {
        let userObj = {};
        let chart;

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

        it('shows recently edited chart', async function () {
            const res = await this.server.inject({
                method: 'GET',
                url: `/`,
                headers: getSessionHeaders(userObj)
            });
            expect(res.statusCode).to.equal(200);
            const view = parseSvelteView(res.result);
            expect(view).to.equal('dashboard/Index.svelte');

            const { $, $$ } = parseHTML(res.result);

            expect($('h2')).to.include.text('Recently edited');
            expect($$('figure')).to.have.length(1);
            expect($('figcaption')).to.have.trimmed.text('Testchart');
        });
    });
});
