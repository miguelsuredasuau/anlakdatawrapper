// Important: use serial since all themes created in each test are available to admin users
// --> tests influence each other if run in parallel
const { serial: test } = require('ava');
const {
    setup,
    destroy,
    createThemes,
    createUser,
    createTeam
} = require('../../../test/helpers/setup');

async function findThemes(ids) {
    const { Theme } = require('@datawrapper/orm/models');
    return await Theme.findAll({
        where: {
            id: ids
        }
    });
}

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
        const defaultThemeIds = t.context.config.general.defaultThemes;
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/admin/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const expectedThemeIds = [...defaultThemeIds, ...themes.map(e => e.id)];
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.total, expectedThemeIds.length);
        t.is(json.list.length, expectedThemeIds.length);
        expectedThemeIds.forEach(id => {
            t.assert(json.list.find(el => el.id === id));
        });
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
        const defaultThemeIds = t.context.config.general.defaultThemes;
        const expectedThemes = [...createdThemes, ...(await findThemes(defaultThemeIds))].sort(
            (a, b) => a.title.localeCompare(b.title)
        );

        const testPagination = async (offset, limit, expectedThemes) => {
            const res = await t.context.server.inject({
                method: 'GET',
                url: `/v3/admin/themes?offset=${offset}&limit=${limit}`,
                headers: {
                    ...defaultHeaders,
                    Authorization: `Bearer ${userObj.token}`
                }
            });
            const expectedList = expectedThemes.slice(offset, offset + limit);
            t.is(res.statusCode, 200);
            const json = await res.result;
            t.is(json.total, expectedThemes.length);
            t.is(json.list.length, expectedList.length);
            expectedList.forEach(theme => {
                t.assert(json.list.find(el => el.id === theme.id));
            });
        };
        await testPagination(0, 10, expectedThemes);
        await testPagination(10, 10, expectedThemes);
        await testPagination(20, 10, expectedThemes);
        await testPagination(30, 10, expectedThemes);
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
