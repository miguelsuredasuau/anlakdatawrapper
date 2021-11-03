const test = require('ava');
const assign = require('assign-deep');
const { createTeamWithUser, createUser, destroy, setup } = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server, 'admin');
    t.context.auth = {
        strategy: 'session',
        credentials: {
            session: t.context.userObj.session.id,
            data: t.context.userObj.session,
            scope: t.context.userObj.session.scope
        },
        artifacts: t.context.userObj.user
    };
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

function checkStatusCode(t, code, res, msg) {
    t.is(res.statusCode, code, msg);
    if (res.statusCode !== code) {
        console.error(res.result);
    }
    return res;
}

function getHelpers(t, userObj) {
    if (!userObj) userObj = t.context.userObj;
    const auth = userObj
        ? {
              strategy: 'session',
              credentials: {
                  session: userObj.session.id,
                  data: userObj.session,
                  scope: userObj.session.scope
              },
              artifacts: userObj.user
          }
        : t.context.auth;
    return {
        user: userObj.user,

        async createFolder(folder, expectedCode = 201) {
            return checkStatusCode(
                t,
                expectedCode,
                await t.context.server.inject({
                    method: 'POST',
                    url: '/v3/folders',
                    auth,
                    headers: t.context.headers,
                    payload: folder
                }),
                'createFolder'
            );
        },

        async createChart(chart, expectedCode = 201) {
            return checkStatusCode(
                t,
                expectedCode,
                await t.context.server.inject({
                    method: 'POST',
                    url: '/v3/charts',
                    auth: auth,
                    headers: t.context.headers,
                    payload: assign(
                        {
                            metadata: {
                                axes: [],
                                describe: {},
                                visualize: {},
                                annotate: {}
                            }
                        },
                        chart
                    )
                }),
                'createChart'
            );
        },

        async getCharts(query = '', expectedCode = 200) {
            return checkStatusCode(
                t,
                expectedCode,
                await t.context.server.inject({
                    method: 'GET',
                    url: `/v3/charts${query}`,
                    auth,
                    headers: t.context.headers
                }),
                'getCharts'
            );
        },

        async publishChart(chartId, expectedCode = 200) {
            return checkStatusCode(
                t,
                expectedCode,
                await t.context.server.inject({
                    method: 'POST',
                    url: `/v3/charts/${chartId}/publish`,
                    auth: auth,
                    headers: t.context.headers
                }),
                'publishChart'
            );
        },

        async setActiveTeam(teamId, expectedCode = 200) {
            return checkStatusCode(
                t,
                expectedCode,
                await t.context.server.inject({
                    method: 'PATCH',
                    url: '/v3/me/settings',
                    auth: auth,
                    headers: t.context.headers,
                    payload: {
                        activeTeam: teamId
                    }
                }),
                'setActiveTeam'
            );
        }
    };
}

test('Should be possible to search in multiple fields', async t => {
    const { createChart } = getHelpers(t);
    let chart = await createChart({
        title: 'apple',
        metadata: {
            describe: {
                intro: 'banana',
                byline: 'lemon',
                'source-name': 'strawberry',
                'source-url': 'https://rasberry.com'
            },
            annotate: {
                notes: 'pear'
            }
        }
    });

    const chartId = chart.result.id;

    const searchQueries = ['apple', 'banana', 'lemon', 'strawberry', 'pear'];

    for (const query of searchQueries) {
        chart = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts?search=${query}`,
            auth: t.context.auth
        });

        t.is(chart.result.list.length, 1, query);
        t.is(chart.result.list[0].id, chartId, query);
    }
});

test('Should be possible to create chart in a folder', async t => {
    const { createChart, createFolder } = getHelpers(t);
    const folder = await createFolder({ name: 'A user folder' });
    const res = await createChart({ folderId: folder.result.id }); // not in folder
    t.is(res.result.folderId, folder.result.id);
});

test('Should be possible to filter by folder id', async t => {
    const { createChart, createFolder, getCharts } = getHelpers(t);
    const folder = await createFolder({ name: 'A user folder' });

    await createChart({ folderId: folder.result.id }); // in folder
    await createChart({ folderId: folder.result.id }); // in folder
    await createChart({ folderId: folder.result.id }); // in folder

    const chartsInFolder = await getCharts(`?folderId=${folder.result.id}`);

    t.is(chartsInFolder.result.total, 3);
});

test('Should be possible to filter by team id', async t => {
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts } = getHelpers(t, teamObj);

    await createChart({ organizationId: team.id });
    await createChart({ organizationId: team.id });
    await createChart({ organizationId: team.id });

    const chartsInTeam = await getCharts(`?teamId=${team.id}`);

    t.is(chartsInTeam.result.total, 3);
});

test('Should be possible to filter by team and folder id', async t => {
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts, createFolder } = getHelpers(t, teamObj);

    // create two charts in team root
    await createChart();
    await createChart();

    const folder = await createFolder({ name: 'A team folder', organizationId: team.id });
    // create one chart in team folder
    await createChart({ folderId: folder.result.id });

    const inTeamFolder = await getCharts(`?teamId=${team.id}&folderId=${folder.result.id}`);
    t.is(inTeamFolder.result.total, 1);

    const inTeamRoot = await getCharts(`?teamId=${team.id}&folderId=null`);
    t.is(inTeamRoot.result.total, 2);

    const inTeamTotal = await getCharts(`?teamId=${team.id}`);
    t.is(inTeamTotal.result.total, 3);
});

test('Should be possible to filter by folder id null', async t => {
    const { createChart, getCharts, createFolder } = getHelpers(t);
    const folder = await createFolder({ name: 'A user folder' });

    await createChart(); // not in folder
    const { total: chartsNotInFolder } = (await getCharts(`?folderId=null`)).result;
    await createChart({ folderId: folder.result.id }); // in folder
    await createChart({ folderId: folder.result.id }); // in folder

    const { total: chartsNotInFolderAfter } = (await getCharts(`?folderId=null`)).result;
    t.is(chartsNotInFolder, chartsNotInFolderAfter);
});

test('Cannot filter by folder a user does not have access to', async t => {
    const admin = getHelpers(t);
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const teamUser = getHelpers(t, teamObj);
    // admin creates a folder
    const folder = (await admin.createFolder({ name: 'Admins only' })).result;
    // admin creates a chart
    await admin.createChart({ folderId: folder.id });
    // normal team user tries to filter charts
    await teamUser.getCharts(`?folderId=${folder.id}`, 406);
});

test('Cannot filter by team a user does not have access to', async t => {
    const teamObj1 = await createTeamWithUser(t.context.server, 'member');
    const teamUser1 = getHelpers(t, teamObj1);
    const teamObj2 = await createTeamWithUser(t.context.server, 'member');
    const teamUser2 = getHelpers(t, teamObj2);

    // team user can query their own team
    await teamUser1.getCharts(`?teamId=${teamObj1.team.id}`, 200);
    await teamUser2.getCharts(`?teamId=${teamObj2.team.id}`, 200);
    // but not the other ones
    await teamUser1.getCharts(`?teamId=${teamObj2.team.id}`, 406);
    await teamUser2.getCharts(`?teamId=${teamObj1.team.id}`, 406);
});

test('Cannot combine by folderId with different teamId', async t => {
    const admin = getHelpers(t);
    const teamObj1 = await createTeamWithUser(t.context.server, 'member');
    const teamUser1 = getHelpers(t, teamObj1);
    const folder1 = (
        await teamUser1.createFolder({ name: 'team1', organizationId: teamObj1.team.id })
    ).result;

    const teamObj2 = await createTeamWithUser(t.context.server, 'member');

    // can query folder
    await admin.getCharts(`?folderId=${folder1.id}`, 200);
    // can query folder combined with correct team
    await admin.getCharts(`?folderId=${folder1.id}&teamId=${teamObj1.team.id}`, 200);
    // cannot query folder combined with different team
    await admin.getCharts(`?folderId=${folder1.id}&teamId=${teamObj2.team.id}`, 406);
});

test('Users can create charts in a team they have access to', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team } = teamObj;
        const { createChart } = getHelpers(t, teamObj);

        const chart = await createChart({
            organizationId: team.id
        });

        t.is(chart.statusCode, 201);
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Users can create charts with settings set', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team, session } = teamObj;

        const chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                organizationId: team.id,
                title: 'My new visualization',
                type: 'd3-bars',
                metadata: {
                    axes: [],
                    describe: {
                        intro: 'A description',
                        byline: ''
                    }
                }
            }
        });

        t.is(chart.statusCode, 201);
        t.is(chart.result.type, 'd3-bars');
        t.is(chart.result.title, 'My new visualization');
        t.is(chart.result.metadata.describe.intro, 'A description');
        t.is(chart.result.metadata.describe.byline, '');
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Users can create a chart in a team when authenticating with a token', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team, token } = teamObj;

        const chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                Authorization: `Bearer ${token}`
            },
            payload: {
                organizationId: team.id,
                title: 'My new visualization',
                type: 'd3-bars'
            }
        });
        t.is(chart.statusCode, 201);
        t.is(chart.result.type, 'd3-bars');
        t.is(chart.result.title, 'My new visualization');
        t.is(chart.result.organizationId, team.id);
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Users cannot create a chart with an invalid token', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team } = teamObj;

        const chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                Authorization: `Bearer XXXXXXXXX`
            },
            payload: {
                organizationId: team.id,
                title: 'My new visualization',
                type: 'd3-bars'
            }
        });
        t.is(chart.statusCode, 401);
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Users cannot create chart in a team they dont have access to (token auth)', async t => {
    let userObj;
    let teamObj;
    try {
        userObj = await createUser(t.context.server);
        const { token } = userObj;
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team } = teamObj;

        const chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                Authorization: `Bearer ${token}`
            },
            payload: {
                organizationId: team.id
            }
        });

        t.is(chart.statusCode, 403);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Users cannot create chart in a team they dont have access to (session auth)', async t => {
    let userObj;
    let teamObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;
        teamObj = await createTeamWithUser(t.context.server, 'member');
        const { team } = teamObj;

        const chart = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                organizationId: team.id
            }
        });

        t.is(chart.statusCode, 403);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('Charts can be sorted by title', async t => {
    // create a new team for an empty slare
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts } = getHelpers(t, teamObj);

    await createChart({ title: 'Zoo', organizationId: team.id });
    await createChart({ title: 'Boo', organizationId: team.id });
    await createChart({ title: 'Foo', organizationId: team.id });

    const { list: charts } = (await getCharts(`?teamId=${team.id}&orderBy=title&order=ASC`)).result;
    t.is(charts.length, 3);
    t.is(charts[0].title, 'Boo');
    t.is(charts[1].title, 'Foo');
    t.is(charts[2].title, 'Zoo');
});

test('Charts can be sorted by createdAt', async t => {
    // create a new team for an empty slare
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts } = getHelpers(t, teamObj);

    const c0 = await createChart({ organizationId: team.id });
    await sleep(1);
    const c1 = await createChart({ organizationId: team.id });
    await sleep(1);
    const c2 = await createChart({ organizationId: team.id });

    const { list: charts } = (await getCharts(`?teamId=${team.id}&orderBy=createdAt`)).result;
    t.is(charts.length, 3);
    // default sort is DESC
    t.is(charts[0].id, c2.result.id);
    t.is(charts[1].id, c1.result.id);
    t.is(charts[2].id, c0.result.id);
});

test('Charts can be sorted by publishedAt', async t => {
    // create a new team for an empty slate
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts, publishChart } = getHelpers(t, teamObj);

    const c0 = await createChart({ organizationId: team.id });
    const c1 = await createChart({ organizationId: team.id });
    const c2 = await createChart({ organizationId: team.id });

    await publishChart(c1.result.id);
    await sleep(1);
    await publishChart(c2.result.id);
    await sleep(1);
    await publishChart(c0.result.id);

    const { list: charts } = (await getCharts(`?teamId=${team.id}&orderBy=publishedAt&order=ASC`))
        .result;
    t.is(charts.length, 3);
    t.is(charts[0].id, c1.result.id);
    t.is(charts[1].id, c2.result.id);
    t.is(charts[2].id, c0.result.id);
});

test('Charts can be filtered by lastEditStep', async t => {
    // create a new team for an empty slate
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const { createChart, getCharts } = getHelpers(t, teamObj);

    await createChart({ organizationId: team.id });
    await createChart({ organizationId: team.id, lastEditStep: 1 });
    await createChart({ organizationId: team.id, lastEditStep: 2 });
    await createChart({ organizationId: team.id, lastEditStep: 3 });
    await createChart({ organizationId: team.id, lastEditStep: 4 });

    const { total: noFilter } = (await getCharts(`?teamId=${team.id}`)).result;
    const { total: filter1 } = (await getCharts(`?teamId=${team.id}&minLastEditStep=1`)).result;
    const { total: filter2 } = (await getCharts(`?teamId=${team.id}&minLastEditStep=2`)).result;
    const { total: filter3 } = (await getCharts(`?teamId=${team.id}&minLastEditStep=3`)).result;
    const { total: filter4 } = (await getCharts(`?teamId=${team.id}&minLastEditStep=4`)).result;
    const { total: filter5 } = (await getCharts(`?teamId=${team.id}&minLastEditStep=5`)).result;

    t.is(noFilter, 5);
    t.is(filter1, 4);
    t.is(filter2, 3);
    t.is(filter3, 2);
    t.is(filter4, 1);
    t.is(filter5, 0);
});

test('Charts list goes through all user and team charts', async t => {
    // create a new team for an empty slare
    const teamObj = await createTeamWithUser(t.context.server, 'member');
    const { team } = teamObj;

    const admin = getHelpers(t);
    const user1 = getHelpers(t, teamObj);

    // user 1 creates 2 team charts
    await user1.createChart();
    await user1.createChart();
    // user 1 creates 3 private charts
    await user1.setActiveTeam(null);
    await user1.createChart();
    await user1.createChart();
    await user1.createChart();

    // another team user also creates some charts
    const teamObj2 = await teamObj.addUser('member');
    const user2 = getHelpers(t, teamObj2);
    // user 2 created 3 team charts
    await user2.createChart();
    await user2.createChart();
    await user2.createChart();
    // and one private chart
    await user2.setActiveTeam(null);
    await user2.createChart();

    // user 1 sees 8 charts (3 private + 5 team)
    const u1 = (await user1.getCharts()).result;
    t.is(u1.total, 8);

    // user 2 sees 6 charts (1 private + 5 team)
    const u2 = (await user2.getCharts()).result;
    t.is(u2.total, 6);

    // user 1 sees 5 self-created charts (3 private + 2 team)
    const m1 = (await user1.getCharts('?authorId=me')).result;
    t.is(m1.total, 5);

    // user 2 sees 4 self-created charts (1 private + 3 team)
    const m2 = (await user2.getCharts('?authorId=me')).result;
    t.is(m2.total, 4);

    // an admin can see all 5 team charts without being in the team
    const a = (await admin.getCharts(`?teamId=${team.id}`)).result;
    t.is(a.total, 5);
});

test('User cannot query charts by different user', async t => {
    // create two users
    const admin = getHelpers(t);
    const user1 = getHelpers(t, await createUser(t.context.server));
    const user2 = getHelpers(t, await createUser(t.context.server));
    // user 1 creates a chart
    await user1.createChart();
    // user 1 may query it
    const u1 = (await user1.getCharts(`?authorId=${user1.user.id}`)).result;
    t.is(u1.total, 1);
    // admins may query it
    const a = (await admin.getCharts(`?authorId=${user1.user.id}`)).result;
    t.is(a.total, 1);
    // but user 2 may not
    await user2.getCharts(`?authorId=${user1.user.id}`, 406);
});

test('Admins can not query charts from non-existing users', async t => {
    // create two users
    const admin = getHelpers(t);
    await admin.getCharts(`?authorId=12345678`, 404);
});

test('Admins can not query charts from non-existing teams', async t => {
    // create two users
    const admin = getHelpers(t);
    await admin.getCharts(`?teamId=xxxxxxx`, 404);
});

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}
