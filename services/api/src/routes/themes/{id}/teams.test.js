const test = require('ava');
const {
    createUser,
    createTeamWithUser,
    createTheme,
    addThemeToTeam,
    destroy,
    setup
} = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server);
    t.context.teamObj = await createTeamWithUser(t.context.server);
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
    t.context.themes = await Promise.all([await createTheme(), await createTheme()]);
});

test.after.always(async t => {
    if (t.context.themes) {
        await destroy(
            ...t.context.themes,
            ...Object.values(t.context.teamObj),
            ...Object.values(t.context.userObj)
        );
    }
});

test('Should be possible to remove team theme assignment', async t => {
    const { themes, teamObj } = t.context;

    await addThemeToTeam(themes[0], teamObj.team);

    let res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/themes`,
        headers: {
            authorization: `Bearer ${teamObj.token}`
        }
    });
    t.is(res.statusCode, 200);
    t.is(
        res.result.list.some(d => d.id === themes[0].id),
        true
    );

    res = await t.context.server.inject({
        method: 'DELETE',
        url: `/v3/themes/${themes[0].id}/teams`,
        payload: [teamObj.team.id],
        auth: t.context.auth
    });

    res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/themes`,
        headers: {
            authorization: `Bearer ${teamObj.token}`
        }
    });

    t.is(res.statusCode, 200);
    t.is(
        res.result.list.some(d => d.id === themes[0].id),
        false
    );
});
