const test = require('ava');
const {
    addThemeToTeam,
    addUserToTeam,
    createTeam,
    createTeamWithUser,
    createThemes,
    createUser,
    destroy,
    setup
} = require('../../../../../services/api/test/helpers/setup.js');

test.before(async t => {
    t.context.server = await setup();
    t.context.config = t.context.server.methods.config();
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test('V1 GET /themes returns all themes of a user', async t => {
    let themes;
    let teamObj = {};
    try {
        const defaultThemeIds = t.context.config.general.defaultThemes;
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        await addThemeToTeam(themes[0], teamObj.team);
        await addThemeToTeam(themes[1], teamObj.team);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/api-v1/themes`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`
            }
        });
        const expectedThemeIds = [...defaultThemeIds, ...themes.map(e => e.id)];
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.status, 'ok');
        t.is(json.data.length, expectedThemeIds.length);
        expectedThemeIds.forEach(id => {
            t.assert(json.data.find(el => el.id === id));
        });
    } finally {
        await destroy(themes, Object.values(teamObj));
    }
});

test('V1 GET /themes does not return themes of teams a user is not part of', async t => {
    let themes;
    let userObj = {};
    let team;
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        team = await createTeam();
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        await addThemeToTeam(themes[0], team);
        await addThemeToTeam(themes[1], team);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/api-v1/themes`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.status, 'ok');
        themes.forEach(theme => {
            t.assert(!json.data.find(el => el.id === theme.id));
        });
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test('V1 GET /themes returns all themes for admins', async t => {
    let themes;
    let userObj = {};
    let team;
    try {
        const defaultThemeIds = t.context.config.general.defaultThemes;
        userObj = await createUser(t.context.server, { role: 'admin' });
        team = await createTeam();
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        await addThemeToTeam(themes[0], team);
        await addThemeToTeam(themes[1], team);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/api-v1/themes`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const expectedThemeIds = [...defaultThemeIds, ...themes.map(e => e.id)];
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.status, 'ok');
        t.assert(json.data.length >= expectedThemeIds.length);
        expectedThemeIds.forEach(theme => {
            t.assert(!json.data.find(el => el.id === theme.id));
        });
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test('V1 GET /themes does not return default themes if team has restricted default themes', async t => {
    let themes;
    let team;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        team = await createTeam({
            settings: {
                restrictDefaultThemes: true
            }
        });
        await addUserToTeam(userObj.user, team);
        themes = await createThemes([{ title: 'Theme 1' }, { title: 'Theme 2' }]);
        await addThemeToTeam(themes[0], team);
        await addThemeToTeam(themes[1], team);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/api-v1/themes`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        const expectedThemeIds = [...themes.map(e => e.id)];
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.status, 'ok');
        t.is(json.data.length, expectedThemeIds.length);
        expectedThemeIds.forEach(id => {
            t.assert(json.data.find(el => el.id === id));
        });
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test("V1 GET /themes returns an error if user does not have scope 'theme:read'", async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/api-v1/themes`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
        const json = await res.result;
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(Object.values(userObj));
    }
});
