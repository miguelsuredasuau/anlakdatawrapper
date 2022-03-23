const test = require('ava');

const {
    createTeamWithUser,
    createUser,
    createCharts,
    destroy,
    setup
} = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test('GET /users/:id/recently-edited-charts - user can access their own charts', async t => {
    let userObj;

    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${userObj.user.id}/recently-edited-charts`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });
        t.is(res.result.total, 0);
        t.is(res.result.list.length, 0);
    } finally {
        destroy(...Object.values(userObj));
    }
});

test('GET /users/:id/recently-edited-charts - user can not access different users charts', async t => {
    let userObj, userObj2;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;
        userObj2 = await createUser(t.context.server);

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${userObj2.user.id}/recently-edited-charts`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.result.statusCode, 401);
        t.is(res.result.error, 'Unauthorized');
    } finally {
        destroy(...Object.values(userObj), ...Object.values(userObj2));
    }
});

test('GET /users/:id/recently-edited-charts - admins can access different users charts', async t => {
    let adminObj, userObj;
    try {
        adminObj = await createUser(t.context.server);
        const { session } = adminObj;
        userObj = await createUser(t.context.server);

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${userObj.user.id}/recently-edited-charts`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.result.statusCode, 401);
        t.is(res.result.error, 'Unauthorized');
    } finally {
        destroy(...Object.values(userObj), ...Object.values(adminObj));
    }
});

test('GET /users/:id/recently-edited-charts - returns charts', async t => {
    const { server } = t.context;
    const { setUserData } = require('@datawrapper/orm/utils/userData');

    let userObj, userObj2, charts, teamObj;

    try {
        userObj2 = await createUser(server);
        teamObj = await createTeamWithUser(server);
        userObj = await teamObj.addUser();

        const { session, user } = userObj;

        charts = await createCharts([
            { author_id: user.id }, // access
            { author_id: user.id }, // access
            { author_id: user.id, deleted: true }, // no access
            { author_id: userObj2.user.id }, // no access,
            { author_id: teamObj.user.id, organization_id: teamObj.team.id } // access through team
        ]);

        await setUserData(
            user.id,
            'recently_edited',
            JSON.stringify(charts.map(chart => chart.id))
        );

        const res = await server.inject({
            method: 'GET',
            url: `/v3/users/${user.id}/recently-edited-charts`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });
        t.is(res.result.total, 3);
        t.is(res.result.list.length, 3);
    } finally {
        destroy(
            ...charts,
            ...Object.values(userObj),
            ...Object.values(userObj2),
            ...Object.values(teamObj)
        );
    }
});

test('GET /users/:id/recently-published-charts - returns charts', async t => {
    const { server } = t.context;
    const { setUserData } = require('@datawrapper/orm/utils/userData');

    let userObj, userObj2, charts, teamObj;

    try {
        userObj2 = await createUser(server);
        teamObj = await createTeamWithUser(server);
        userObj = await teamObj.addUser();

        const { session, user } = userObj;

        charts = await createCharts([
            { author_id: user.id, published_at: new Date() }, // access
            { author_id: user.id }, // no access, not published yet
            { author_id: user.id, deleted: true, published_at: new Date() }, // no access
            { author_id: userObj2.user.id, published_at: new Date() }, // no access,
            {
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id,
                published_at: new Date(Date.now() - 864e5)
            } // access through team
        ]);

        await setUserData(
            user.id,
            'recently_published',
            JSON.stringify(charts.map(chart => chart.id))
        );

        const res = await server.inject({
            method: 'GET',
            url: `/v3/users/${user.id}/recently-published-charts`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });
        t.is(res.result.total, 2);
        t.is(res.result.list.length, 2);
        t.is(res.result.list[0].id, charts[0].id);
        t.is(res.result.list[1].id, charts[4].id);
    } finally {
        destroy(
            ...charts,
            ...Object.values(userObj),
            ...Object.values(userObj2),
            ...Object.values(teamObj)
        );
    }
});
