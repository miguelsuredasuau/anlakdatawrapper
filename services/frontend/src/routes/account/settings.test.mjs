import { createUser, destroy } from '../../../../api/test/helpers/setup.js';
import {
    getSessionHeaders,
    parseHTML,
    parseSvelteView
} from '../../../tests/helpers/serverUtils.mjs';

describe('GET /account/settings/', function () {
    let userObj = {};

    before(async function () {
        userObj = await createUser(this.server);
    });

    after(async function () {
        await destroy(...Object.values(userObj));
    });

    it('view compiles', async function () {
        const res = await this.server.inject({
            method: 'GET',
            url: `/account/settings`,
            headers: getSessionHeaders(userObj)
        });
        expect(res.statusCode).to.equal(200);
        const view = parseSvelteView(res.result);
        expect(view).to.equal('account/Settings.svelte');

        const { $ } = parseHTML(res.result);
        expect($('h2')).to.have.trimmed.text('Settings');
    });
});
