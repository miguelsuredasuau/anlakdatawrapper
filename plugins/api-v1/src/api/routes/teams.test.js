const test = require('ava');

const {
    BASE_URL,
    V1_BASE_URL,
    createTeamWithUser,
    createUser,
    destroy,
    setup,
    createTeam,
    createCharts,
    addUserToTeam
} = require('../../../../../services/api/test/helpers/setup.js');

const fetch = require('node-fetch');

test.before(async t => {
    t.context.server = await setup();
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
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
