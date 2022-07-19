const test = require('ava');
const {
    addThemeToTeam,
    addUserToTeam,
    createTeam,
    createTeamWithUser,
    createThemes,
    createUser,
    createGuestSession,
    destroy,
    getTheme,
    setup
} = require('../../../test/helpers/setup');

const defaultHeaders = {
    cookie: 'crumb=abc',
    'X-CSRF-Token': 'abc',
    referer: 'http://localhost'
};

test.before(async t => {
    t.context.server = await setup({ usePlugins: true });
    t.context.config = t.context.server.methods.config();
});

test('GET /themes returns all themes of a user', async t => {
    let themes;
    let teamObj = {};
    let team2;
    try {
        const defaultThemeIds = t.context.config.general.defaultThemes;
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        team2 = await createTeam();
        await addUserToTeam(teamObj.user, team2);
        themes = await createThemes([
            { title: 'Theme 1' },
            { title: 'Theme 2' },
            { title: 'Theme 3' }
        ]);
        await addThemeToTeam(themes[0], teamObj.team);
        await addThemeToTeam(themes[1], teamObj.team);
        await addThemeToTeam(themes[2], team2);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${teamObj.token}`
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
        await destroy(themes, Object.values(teamObj), team2);
    }
});

test('GET /themes returns themes for a guest', async t => {
    let session;
    const defaultThemeIds = t.context.config.general.defaultThemes;
    try {
        session = await createGuestSession(t.context.server);

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/themes`,
            headers: {
                cookie: `DW-SESSION=${session}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 200);

        t.deepEqual(defaultThemeIds.sort(), res.result.list.map(d => d.id).sort());
    } finally {
        await destroy(session);
    }
});

test('GET /themes returns themes correctly paginated', async t => {
    let themes;
    let team;
    let userObj = {};
    try {
        const defaultThemeIds = t.context.config.general.defaultThemes;
        userObj = await createUser(t.context.server, { role: 'editor' });
        team = await createTeam();
        await addUserToTeam(userObj.user, team);
        const alphabet = Array.from(Array(26).keys()).map(n => String.fromCharCode(65 + n));
        themes = await createThemes(alphabet.map(letter => ({ title: `Theme ${letter}` })));
        const expectedThemeIds = [...defaultThemeIds, ...themes.map(e => e.id)];
        for (const theme of themes) {
            await addThemeToTeam(theme, team);
        }

        const testPagination = async (offset, limit, expectedThemes) => {
            const res = await t.context.server.inject({
                method: 'GET',
                url: `/v3/themes?offset=${offset}&limit=${limit}`,
                headers: {
                    ...defaultHeaders,
                    Authorization: `Bearer ${userObj.token}`
                }
            });
            const expectedIdList = expectedThemes.slice(offset, offset + limit);
            t.is(res.statusCode, 200);
            const json = await res.result;
            t.is(json.total, expectedThemes.length);
            t.is(json.list.length, expectedIdList.length);
            expectedIdList.forEach(id => {
                t.assert(json.list.find(el => el.id === id));
            });
        };
        await testPagination(0, 10, expectedThemeIds); // expected [A...J]
        await testPagination(10, 10, expectedThemeIds); // expected [K...T]
        await testPagination(20, 10, expectedThemeIds); // expected [U...Z]
        await testPagination(30, 10, expectedThemeIds); // expected []
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test('GET /themes returns error if offset is negative', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/themes?offset=-1`,
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

test('GET /themes returns error if limit is negative', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor' });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/themes?limit=-1`,
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

test('GET /themes does not return themes of teams a user is not part of', async t => {
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
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        themes.forEach(theme => {
            t.assert(!json.list.find(el => el.id === theme.id));
        });
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test('GET /themes does not return all existing themes to an admin user', async t => {
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
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.total, defaultThemeIds.length);
        t.is(json.list.length, defaultThemeIds.length);
        defaultThemeIds.forEach(id => {
            t.assert(json.list.find(el => el.id === id));
        });
        themes.forEach(theme => {
            t.assert(!json.list.find(el => el.id === theme.id));
        });
    } finally {
        await destroy(themes, team, Object.values(userObj));
    }
});

test("GET /themes returns an error if user does not have scope 'theme:read'", async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/themes`,
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

test('POST /themes creates theme when valid less is passed', async t => {
    let userObj = {};
    const themeId = 'test-valid-less-1';
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const payload = {
            id: themeId,
            title: 'Test valid less 1',
            extend: 'default',
            less: '.dw-chart { border: 5px solid red; }'
        };
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            payload
        });
        t.is(res.statusCode, 201);
    } finally {
        await destroy(Object.values(userObj));
        const theme = await getTheme(themeId);
        await destroy(theme);
    }
});

test('POST /themes returns error when invalid less is passed', async t => {
    let userObj = {};
    const themeId = 'test-valid-less-2';
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const payload = {
            id: themeId,
            title: 'Test valid less 2',
            extend: 'default',
            less: '{.dw-chart { border: 5px solid red; }'
        };
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            payload
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(Object.values(userObj));
        const theme = await getTheme(themeId);
        await destroy(theme);
    }
});

test('POST /themes creates theme when less contains valid less variables', async t => {
    let userObj = {};
    const themeId = 'test-valid-less-3';
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const payload = {
            id: themeId,
            title: 'Test valid less 3',
            extend: 'default',
            data: {
                typography: {
                    description: {
                        color: '#333333'
                    }
                }
            },
            less: [
                '.dw-chart { background: @colors_background; }', // defined in default theme
                '.caption-block { color: @typography_description_color; }' // not defined in default theme
            ].join('\n')
        };
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            payload
        });
        t.is(res.statusCode, 201);
    } finally {
        await destroy(Object.values(userObj));
        const theme = await getTheme(themeId);
        await destroy(theme);
    }
});

test('POST /themes returns error when nonexistent less variable is passed', async t => {
    let userObj = {};
    const themeId = 'test-valid-less-4';
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const payload = {
            id: themeId,
            title: 'Test valid less 4',
            extend: 'default',
            less: '.dw-chart { border: 5px solid @my_favorite_color; }'
        };
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/themes`,
            headers: {
                ...defaultHeaders,
                Authorization: `Bearer ${userObj.token}`,
                'Content-Type': 'application/json'
            },
            payload
        });
        t.is(res.statusCode, 400);
        t.is(res.result.message, 'LESS error: "variable @my_favorite_color is undefined"');
    } finally {
        await destroy(Object.values(userObj));
        const theme = await getTheme(themeId);
        await destroy(theme);
    }
});
