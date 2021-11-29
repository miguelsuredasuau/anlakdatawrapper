const get = require('lodash/get');
const has = require('lodash/has');
const set = require('lodash/set');
const test = require('ava');
const {
    BASE_URL,
    createFolder,
    createTeamWithUser,
    createUser,
    destroy,
    setup,
    createTeam,
    createCharts,
    addUserToTeam
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');

async function updateTeamSettings(server, headers, user, team, payload) {
    return await server.inject({
        method: 'PUT',
        url: `/v3/teams/${team.id}`,
        auth: {
            strategy: 'simple',
            credentials: { session: '', scope: ['team:write'] },
            artifacts: user
        },
        headers: headers,
        payload
    });
}

function testTeamSettings(t, team, settings) {
    t.is(team.statusCode, 200);

    // was able to edit settings.embed
    t.is(team.result.settings.embed.custom_embed.text, 'Copy and paste this ID into your CMS');
    t.is(team.result.settings.embed.custom_embed.title, 'Chart ID');

    // was able to edit settings.default.local
    t.is(team.result.settings.default.locale, 'de-DE');

    // protected settings.css preserved
    t.is(team.result.settings.css, settings.css);

    // protected settings.flags preserved
    t.deepEqual(team.result.settings.flags, settings.flags);

    // metadata.publish saved, metadata.visualize dropped
    t.deepEqual(team.result.settings.default.metadata, {
        publish: {
            'embed-width': 500,
            'embed-height': 300
        }
    });
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: true });
    t.context.teamObj = await createTeamWithUser(t.context.server);
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.teamObj.session,
        artifacts: t.context.teamObj.user
    };
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };

    // emulate team settings filter
    const { events, event } = t.context.server.app;
    events.on(event.TEAM_SETTINGS_FILTER, async ({ team, payload }) => {
        // check if the team supports certain settings
        const prohibitedKeys = [
            'settings.flags',
            'settings.css',
            'settings.default.metadata.visualize'
        ];
        const readOnlySettings = {};
        prohibitedKeys.forEach(key => {
            if (has(payload, key)) {
                const keys = key.split('.');
                const last = keys.pop();
                const readOnlySetting = get(team.dataValues, key);
                set(readOnlySettings, key, readOnlySetting);
                delete get(payload, keys.join('.'))[last];
            }
        });
        return readOnlySettings;
    });
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.teamObj));
});

test('[/v3/teams/:id] check that owners and admins can see owner, but members cannot', async t => {
    let teamObj;
    let adminUserObj;
    let memberUserObj;
    try {
        teamObj = await createTeamWithUser(t.context.server);
        const { addUser, user: owner, session: ownerSession, team } = teamObj;
        adminUserObj = await addUser('admin');
        const { user: admin, session: adminSession } = adminUserObj;
        memberUserObj = await addUser('member');
        const { user: member, session: memberSession } = memberUserObj;

        let teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: ownerSession,
                artifacts: owner
            }
        });

        t.is(typeof teams.result.owner, 'object');
        t.is(teams.result.owner.id, owner.id);

        teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: adminSession,
                artifacts: admin
            }
        });

        t.is(typeof teams.result.owner, 'object');
        t.is(teams.result.owner.id, owner.id);

        teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: memberSession,
                artifacts: member
            }
        });

        t.is(teams.result.owner, undefined);
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
        if (adminUserObj) {
            await destroy(...Object.values(teamObj));
        }
        if (memberUserObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('[/v3/teams/:id] check that owners and admins can see settings, but members cannot', async t => {
    let teamObj;
    let adminUserObj;
    let memberUserObj;
    try {
        teamObj = await createTeamWithUser(t.context.server);
        const { addUser, user: owner, session: ownerSession, team } = teamObj;
        adminUserObj = await addUser('admin');
        const { user: admin, session: adminSession } = adminUserObj;
        memberUserObj = await addUser('member');
        const { user: member, session: memberSession } = memberUserObj;

        let teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: ownerSession,
                artifacts: owner
            }
        });

        t.is(typeof teams.result.settings, 'object');

        teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: adminSession,
                artifacts: admin
            }
        });

        t.is(typeof teams.result.settings, 'object');

        teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: memberSession,
                artifacts: member
            }
        });

        t.is(teams.result.settings, undefined);
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
        if (adminUserObj) {
            await destroy(...Object.values(teamObj));
        }
        if (memberUserObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('user can fetch individual team', async t => {
    const teams = await t.context.server.inject({
        method: 'GET',
        url: `/v3/teams/${t.context.teamObj.team.id}`,
        auth: t.context.auth
    });

    t.is(teams.statusCode, 200);
    t.is(teams.result.id, t.context.teamObj.team.id);
    t.is(teams.result.name, 'Test Team');
});

test('user can not fetch teams they are not a part of', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const teams = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'session',
                credentials: userObj.session,
                artifacts: userObj.user
            }
        });

        t.is(teams.statusCode, 401);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('owners can edit team', async t => {
    const team = await t.context.server.inject({
        method: 'PATCH',
        url: `/v3/teams/${t.context.teamObj.team.id}`,
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            name: 'Testy'
        }
    });

    t.is(team.statusCode, 200);
    t.is(team.result.name, 'Testy');
    t.truthy(team.result.updatedAt);
});

test('admin can edit team', async t => {
    let userObj;
    try {
        userObj = await t.context.teamObj.addUser('admin');
        const { user } = userObj;

        const team = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers,
            payload: {
                name: 'Testy'
            }
        });

        t.is(team.statusCode, 200);
        t.is(team.result.name, 'Testy');
        t.truthy(team.result.updatedAt);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('member can not edit team', async t => {
    let userObj;
    try {
        userObj = await t.context.teamObj.addUser('member');
        const { user } = userObj;

        const team = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers,
            payload: {
                name: 'Testy'
            }
        });

        t.is(team.statusCode, 401);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('admin can edit team allowed settings', async t => {
    let userObj;
    try {
        userObj = await t.context.teamObj.addUser('admin');
        const { user } = userObj;

        const team0 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers
        });

        t.is(team0.statusCode, 200);
        t.is(team0.result.settings.default.locale, 'en-US');
        t.is(team0.result.settings.flags.pdf, false);

        const team1 = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers,
            payload: {
                settings: {
                    default: {
                        locale: 'fr-FR'
                    }
                }
            }
        });

        t.is(team1.statusCode, 200);
        t.is(team1.result.settings.default.locale, 'fr-FR');
        t.is(team1.result.settings.flags.pdf, false);
        t.truthy(team1.result.updatedAt);

        const team2 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers
        });

        t.is(team2.statusCode, 200);
        t.is(team2.result.settings.default.locale, 'fr-FR');
        t.is(team2.result.settings.flags.pdf, false);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test("admins can't edit team restricted team settings", async t => {
    let userObj;
    try {
        userObj = await t.context.teamObj.addUser('admin');
        const { user } = userObj;

        const team1 = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers,
            payload: {
                settings: {
                    flags: {
                        pdf: true
                    }
                }
            }
        });

        t.is(team1.statusCode, 200);
        t.is(team1.result.settings.flags.pdf, false);
        t.truthy(team1.result.updatedAt);

        const team2 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${t.context.teamObj.team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers
        });

        t.is(team2.statusCode, 200);
        t.is(team2.result.settings.flags.pdf, false);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('restricted team settings are preserved in PUT request', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server);
        const { user, team } = teamObj;

        const { settings } = team.dataValues;

        const requestPayload = {
            settings: {
                default: {
                    locale: 'de-DE',
                    metadata: {
                        publish: {
                            'embed-width': 500,
                            'embed-height': 300
                        },
                        visualize: {
                            'x-grid': false
                        }
                    }
                },
                flags: {
                    pdf: true,
                    nonexistentflag: true
                },
                css: '',
                embed: {
                    custom_embed: {
                        text: 'Copy and paste this ID into your CMS',
                        title: 'Chart ID',
                        template: '%chart_id%'
                    },
                    preferred_embed: 'responsive'
                }
            }
        };

        const team1 = await updateTeamSettings(
            t.context.server,
            t.context.headers,
            user,
            team,
            requestPayload
        );

        // check response
        testTeamSettings(t, team1, settings);
        t.truthy(team1.result.updatedAt);

        const team2 = await t.context.server.inject({
            method: 'GET',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'simple',
                credentials: { session: '', scope: ['team:write'] },
                artifacts: user
            },
            headers: t.context.headers
        });

        // all expected changes persist
        testTeamSettings(t, team2, settings);

        // PUT request can also delete nested items from the team settings
        delete requestPayload.settings.default.metadata.publish['embed-width'];
        delete requestPayload.settings.default.metadata.publish['embed-height'];

        const team3 = await updateTeamSettings(
            t.context.server,
            t.context.headers,
            user,
            team,
            requestPayload
        );

        t.deepEqual(team3.result.settings.default.metadata, {
            publish: {}
        });
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('DELETE /teams/{id} deletes a team with nested folders', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server);
        const { session, team, user } = teamObj;
        const parentFolder = await createFolder({ org_id: team.id });
        await createFolder({ org_id: team.id, parent_id: parentFolder.id });

        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/teams/${team.id}`,
            auth: {
                strategy: 'session',
                credentials: session,
                artifacts: user
            },
            headers: t.context.headers,
            payload: {
                name: 'Testy'
            }
        });
        t.is(res.statusCode, 204);

        const { Team } = require('@datawrapper/orm/models');
        t.is(await Team.findByPk(team.id), null);
    } finally {
        if (teamObj) {
            await destroy(Object.values(teamObj));
        }
    }
});

async function testV1GetTeamCharts(t, teamsPath = 'teams') {
    let teamObj = {};
    let otherTeam;
    let charts = [];
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        otherTeam = await createTeam();
        charts = await createCharts([
            {
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: teamObj.team.id
            },
            {
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: otherTeam.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `${V1_BASE_URL}/${teamsPath}/${teamObj.team.id}/charts`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.status, 'ok');
        t.is(json.data.total, 1);
        t.is(json.data.charts.length, 1);
        t.is(json.data.charts[0].id, charts[0].id);
        t.is(json.data.page, 0);
        t.is(json.data.numPages, 1);
    } finally {
        await destroy(charts, otherTeam, Object.values(teamObj));
    }
}

test('V1 GET /teams/{id}/charts returns charts of a team', testV1GetTeamCharts, 'teams');

test.skip(
    'V1 GET /organizations/{id}/charts returns charts of a team',
    testV1GetTeamCharts,
    'organizations'
); // skipped because /organizations route is defined by nginx and not by the api-v1 plugin

async function testV1GetTeamChartsMinLastEditStep(t, teamsPath = 'teams') {
    let teamObj = {};
    let otherTeam;
    let charts = [];
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        otherTeam = await createTeam();
        charts = await createCharts([
            {
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: teamObj.team.id
            },
            {
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 0,
                organization_id: teamObj.team.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/${teamsPath}/${teamObj.team.id}/charts`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.total, 1);
        t.is(json.data.charts.length, 1);
        t.is(json.data.charts[0].id, charts[0].id);
        t.is(json.data.page, 0);
        t.is(json.data.numPages, 1);
    } finally {
        await destroy(charts, otherTeam, Object.values(teamObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns only charts with data',
    testV1GetTeamChartsMinLastEditStep,
    'teams'
);

test(
    'PHP GET /organizations/{id}/charts returns only charts with data',
    testV1GetTeamChartsMinLastEditStep,
    'organizations'
);

async function testV1GetTeamChartsAsAdmin(t, teamsPath) {
    let team;
    let otherTeam;
    let charts = [];
    let adminObj = {};
    try {
        team = await createTeam();
        otherTeam = await createTeam();
        adminObj = await createUser(t.context.server, { role: 'admin' });
        charts = await createCharts([
            {
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: team.id
            },
            {
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: otherTeam.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/${teamsPath}/${team.id}/charts`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${adminObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.total, 1);
        t.is(json.data.charts.length, 1);
        t.is(json.data.charts[0].id, charts[0].id);
        t.is(json.data.page, 0);
        t.is(json.data.numPages, 1);
    } finally {
        await destroy(charts, otherTeam, team, Object.values(adminObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns charts of a team for admin users',
    testV1GetTeamChartsAsAdmin,
    'teams'
);

test(
    'PHP GET /organizations/{id}/charts returns charts of a team for admin users',
    testV1GetTeamChartsAsAdmin,
    'organizations'
);

async function testV1GetTeamChartsWithInsufficientScope(t, teamsPath, scopes) {
    let userObj = {};
    let team;
    try {
        team = await createTeam();
        userObj = await createUser(t.context.server, { scopes });
        await addUserToTeam(userObj.user, team);
        const res = await fetch(`${BASE_URL}/${teamsPath}/${team.id}/charts`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
        t.is(json.message, 'Insufficient scope');
    } finally {
        await destroy(team, Object.values(userObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns error if user does not have scope team:read',
    testV1GetTeamChartsWithInsufficientScope,
    'teams',
    ['chart:read']
);

test(
    'PHP GET /teams/{id}/charts returns error if user does not have scope chart:read',
    testV1GetTeamChartsWithInsufficientScope,
    'teams',
    ['team:read']
);

test(
    'PHP GET /organizations/{id}/charts returns error if user does not have scope team:read',
    testV1GetTeamChartsWithInsufficientScope,
    'organizations',
    ['chart:read']
);

test(
    'PHP GET /organizations/{id}/charts returns error if user does not have scope chart:read',
    testV1GetTeamChartsWithInsufficientScope,
    'organizations',
    ['team:read']
);

async function testV1GetTeamChartsAsNonTeamMember(t, teamsPath = 'teams') {
    let userObj = {};
    let team;
    try {
        team = await createTeam();
        userObj = await createUser(t.context.server, { scopes: ['chart:read', 'team:read'] });
        const res = await fetch(`${BASE_URL}/${teamsPath}/${team.id}/charts`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(team, Object.values(userObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns error if non-admin user is not part of the team',
    testV1GetTeamChartsAsNonTeamMember,
    'teams'
);

test(
    'PHP GET /organizations/{id}/charts returns error if non-admin user is not part of the team',
    testV1GetTeamChartsAsNonTeamMember,
    'organizations'
);

async function testV1GetTeamChartsOfNonExistentTeam(t, teamsPath) {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { scopes: ['chart:read', 'team:read'] });
        const res = await fetch(`${BASE_URL}/${teamsPath}/spam/charts`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied'); // PHP returned 'unknown-organization'
    } finally {
        await destroy(Object.values(userObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns error if the team does not exist',
    testV1GetTeamChartsOfNonExistentTeam,
    'teams'
);

test(
    'PHP GET /organizations/{id}/charts returns error if the team does not exist',
    testV1GetTeamChartsOfNonExistentTeam,
    'organizations'
);

async function testV1GetTeamChartsPaginated(t, teamsPath = 'teams', page, expectedNoOfCharts) {
    let teamObj = {};
    let otherTeam;
    let charts = [];
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        otherTeam = await createTeam();
        charts = await createCharts(
            // create 50 charts --> page size in PHP is 48
            Array.from(Array(50).keys()).map(key => ({
                title: `Chart ${key}`,
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                last_edit_step: 1,
                organization_id: teamObj.team.id
            }))
        );
        const res = await fetch(`${BASE_URL}/${teamsPath}/${teamObj.team.id}/charts?page=${page}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.total, charts.length);
        t.is(json.data.charts.length, expectedNoOfCharts);
        t.is(json.data.page, page.toString());
        t.is(json.data.numPages, 2);
    } finally {
        await destroy(charts, otherTeam, Object.values(teamObj));
    }
}

test(
    'PHP GET /teams/{id}/charts returns charts of a team correctly paginated (page 1)',
    testV1GetTeamChartsPaginated,
    'teams',
    0,
    48
);

test(
    'PHP GET /teams/{id}/charts returns charts of a team correctly paginated (page 2)',
    testV1GetTeamChartsPaginated,
    'teams',
    1,
    2
);

test(
    'PHP GET /organizations/{id}/charts returns charts of a team correctly paginated (page 1)',
    testV1GetTeamChartsPaginated,
    'organizations',
    0,
    48
);

test(
    'PHP GET /organizations/{id}/charts returns charts of a team correctly paginated (page 2)',
    testV1GetTeamChartsPaginated,
    'organizations',
    1,
    2
);

async function testV1GetTeamChartsWithSearchParam(t, teamsPath = 'teams') {
    let teamObj = {};
    let charts = [];
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        charts = await createCharts([
            {
                last_edit_step: 1,
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id
            },
            {
                title: 'foo',
                last_edit_step: 1,
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id
            },
            {
                last_edit_step: 1,
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/${teamsPath}/${teamObj.team.id}/charts?search=foo`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.total, 1);
        t.is(json.data.charts.length, 1);
        t.is(json.data.charts[0].id, charts[1].id);
        t.is(json.data.page, 0);
        t.is(json.data.numPages, 1);
    } finally {
        await destroy(charts, Object.values(teamObj));
    }
}

test(
    'PHP GET /teams/{id}/charts?search=X searches in team charts',
    testV1GetTeamChartsWithSearchParam,
    'teams'
);

test(
    'PHP GET /organizations/{id}/charts?search=X searches in team charts',
    testV1GetTeamChartsWithSearchParam,
    'organizations'
);

async function testV1GetTeamsOfUser(t, teamsPath = 'teams') {
    let userObj = {};
    let team1;
    let team2;
    let team3;
    try {
        team1 = await createTeam();
        team2 = await createTeam();
        team3 = await createTeam();
        userObj = await createUser(t.context.server);
        await addUserToTeam(userObj.user, team1);
        await addUserToTeam(userObj.user, team2);
        const res = await fetch(`${BASE_URL}/${teamsPath}/user`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.length, 2);
        t.is(json.data.includes(team1.id), true);
        t.is(json.data.includes(team2.id), true);
        t.is(json.data.includes(team3.id), false);
    } finally {
        await destroy(team1, team2, team3, Object.values(userObj));
    }
}

test('PHP GET /teams/user returns teams of a user', testV1GetTeamsOfUser, 'teams');

test('PHP GET /organizations/user returns teams of a user', testV1GetTeamsOfUser, 'organizations');

async function testV1GetTeamsOfUserIgnoreDisabled(t, teamsPath = 'teams') {
    const disableTeam = async team => {
        // helper function to disable a team. Uses a raw query
        // since property 'disabled' is not part of the Sequelize model definition
        const db = t.context.server.methods.getDB();
        await db.query('UPDATE organization SET disabled = 1 WHERE id = ?', {
            replacements: [team.id],
            type: db.QueryTypes.UPDATE
        });
    };
    let userObj = {};
    let team1;
    let team2;
    try {
        team1 = await createTeam();
        team2 = await createTeam();
        await disableTeam(team2);
        userObj = await createUser(t.context.server);
        await addUserToTeam(userObj.user, team1);
        await addUserToTeam(userObj.user, team2);
        const res = await fetch(`${BASE_URL}/${teamsPath}/user`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.length, 1);
        t.is(json.data.includes(team1.id), true);
        t.is(json.data.includes(team2.id), false);
    } finally {
        await destroy(team1, team2, Object.values(userObj));
    }
}

test(
    'PHP GET /teams/user does not return disabled teams of a user',
    testV1GetTeamsOfUserIgnoreDisabled,
    'teams'
);

test(
    'PHP GET /organizations/user does not return disabled teams of a user',
    testV1GetTeamsOfUserIgnoreDisabled,
    'organizations'
);

async function testV1GetTeamsOfUserWithInsufficientScope(t, teamsPath = 'teams') {
    let userObj = {};
    let team1;
    let team2;
    let team3;
    try {
        team1 = await createTeam();
        team2 = await createTeam();
        team3 = await createTeam();
        userObj = await createUser(t.context.server, { scopes: ['scope:invalid'] });
        await addUserToTeam(userObj.user, team1);
        await addUserToTeam(userObj.user, team2);
        const res = await fetch(`${BASE_URL}/${teamsPath}/user`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
        t.is(json.message, 'Insufficient scope');
    } finally {
        await destroy(team1, team2, team3, Object.values(userObj));
    }
}

test(
    "PHP GET /teams/user returns an error if user does not have scope 'team:read'",
    testV1GetTeamsOfUserWithInsufficientScope,
    'teams'
);

test(
    "PHP GET /organizations/user returns an error if user does not have scope 'team:read'",
    testV1GetTeamsOfUserWithInsufficientScope,
    'organizations'
);
