// Important: use serial since all themes created in each test are available to admin users
// --> tests influence each other if run in parallel
const { serial: test } = require('ava');
const { Theme } = require('@datawrapper/orm/db');
const {
    setup,
    destroy,
    createThemes,
    createUser,
    createTeam
} = require('../../../test/helpers/setup');

const defaultHeaders = {
    cookie: 'crumb=abc',
    'X-CSRF-Token': 'abc',
    referer: 'http://localhost'
};

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.config = t.context.server.methods.config();
});

test('GET /admin/themes returns all existing themes for admins', async t => {
    let themes;
    let userObj;
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        const limit = 100;
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes?limit=${limit}`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const totalThemeCount = await Theme.count();
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.total, totalThemeCount);
        t.is(json.list.length, Math.min(limit, totalThemeCount));
    } finally {
        await destroy(themes, Object.values(userObj));
    }
});

test('GET /admin/themes returns an error if user is not an admin', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 401);
    } finally {
        await destroy(Object.values(userObj));
    }
});

test("GET /admin/themes returns an error if admin does not have scope 'theme:read'", async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'admin', scopes: ['scope:invalid'] });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
        const json = await res.result;
        t.is(json.message, 'Insufficient scope');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('GET /admin/themes returns themes correctly paginated', async t => {
    let createdThemes;
    let team;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        team = await createTeam({
            settings: {
                restrictDefaultThemes: true
            }
        });
        const alphabet = Array.from(Array(26).keys()).map(n => String.fromCharCode(65 + n));
        createdThemes = await createThemes(alphabet.map(letter => ({ title: `Theme ${letter}` })));
        const totalThemeCount = await Theme.count();

        const testPagination = async (offset, limit) => {
            const res = await t.context.server.inject({
                method: 'GET',
                url: `/v3/admin/themes?offset=${offset}&limit=${limit}`,
                headers: {
                    ...defaultHeaders,
                    Authorization: `Bearer ${userObj.token}`
                }
            });
            t.is(res.statusCode, 200);
            const json = await res.result;
            t.is(json.total, totalThemeCount);
            t.is(json.list.length, Math.max(0, Math.min(limit, totalThemeCount - offset)));
        };
        await testPagination(0, 10);
        await testPagination(10, 10);
        await testPagination(20, 10);
        await testPagination(30, 10);
    } finally {
        await destroy(createdThemes, team, Object.values(userObj));
    }
});

test('GET /admin/themes returns error if offset is negative', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes?offset=-1`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 400);
        const json = await res.result;
        t.is(json.error, 'Bad Request');
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('GET /admin/themes returns error if limit is negative', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes?limit=-1`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 400);
        const json = await res.result;
        t.is(json.error, 'Bad Request');
    } finally {
        await destroy(Object.values(userObj));
    }
});
