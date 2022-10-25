import {
    addUserToTeam,
    createChart,
    createTeam,
    createUser,
    destroy
} from '../../../api/test/helpers/setup.js';
import {
    createAPIForUser,
    getSessionHeaders,
    parseHTML,
    parseSvelteView
} from '../../tests/helpers/serverUtils.mjs';

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
            expect($$('a[href="/create/chart"]')).to.have.length(2);
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

        it('shows recently edited chart and purifies HTML', async function () {
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
            expect($('figcaption')).to.have.html('Testchart');
        });
    });

    describe('pending invites', function () {
        let ownerObj = {};
        let memberObj = {};
        let team;

        before(async function () {
            ownerObj = await createUser(this.server, {
                name: 'A. <script>alert(1)</script> <b>Mallory</b>',
                email: ''
            });
            team = await createTeam({
                name: "Mallory's <script>alert(1)</script> <b>Team</b>"
            });
            await addUserToTeam(ownerObj.user, team, 'owner');
            memberObj = await createUser(this.server);

            const api = createAPIForUser(this.server, ownerObj);
            try {
                await api(`/teams/${team.id}/invites`, {
                    method: 'POST',
                    body: JSON.stringify({
                        email: memberObj.user.email,
                        role: 'member'
                    })
                });
            } catch (e) {
                console.error(e.response);
                throw e;
            }
        });

        after(async function () {
            await destroy(team, ...Object.values(memberObj), ...Object.values(ownerObj));
        });

        it('shows pending invites and sanitizes user name and team name', async function () {
            const res = await this.server.inject({
                method: 'GET',
                url: `/`,
                headers: getSessionHeaders(memberObj)
            });
            expect(res.statusCode).to.equal(200);
            const view = parseSvelteView(res.result);
            expect(view).to.equal('dashboard/Index.svelte');

            const { $ } = parseHTML(res.result);

            expect($('.box h3')).to.include.text('Pending invitation');
            expect($('.invite-msg')).to.contain.html('<tt>"A.  Mallory"</tt>');
            expect($('.invite-msg')).to.contain.html('<b>"Mallory\'s  Team"</b>');
        });
    });
});
