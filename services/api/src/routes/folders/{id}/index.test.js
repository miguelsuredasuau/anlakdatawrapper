const fetch = require('node-fetch');
const test = require('ava');
const { randomInt } = require('crypto');
const {
    createUser,
    destroy,
    setup,
    createTeam,
    createTeamWithUser,
    createCharts,
    genRandomChartId
} = require('../../../../test/helpers/setup');

const BASE_URL = 'http://api.datawrapper.local';

const MAX_ID = 99999;

function randomId() {
    return String(randomInt(MAX_ID));
}

function nonExistentId() {
    return String(MAX_ID + 1);
}

function createFolder(props) {
    const { Folder } = require('@datawrapper/orm/models');
    return Folder.create({
        name: randomId(),
        ...props
    });
}

function findFolderById(id) {
    const { Folder } = require('@datawrapper/orm/models');
    return Folder.findByPk(id);
}

function findChartById(id) {
    const { Chart } = require('@datawrapper/orm/models');
    return Chart.findByPk(id);
}

async function addUserToTeam(user, team, role = 'member') {
    const { UserTeam } = require('@datawrapper/orm/models');

    await UserTeam.create({
        user_id: user.id,
        organization_id: team.id,
        team_role: role
    });
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.adminObj = await createUser(t.context.server, { role: 'admin' });
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
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.teamObj), ...Object.values(t.context.adminObj));
});

test('GET /folders/{id} returns a single folder', async t => {
    let folder, child, charts;
    try {
        folder = await createFolder({ user_id: t.context.teamObj.user.id });
        child = await createFolder({
            user_id: t.context.teamObj.user.id,
            parent_id: folder.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                in_folder: folder.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/folders/${folder.id}`,
            auth: t.context.auth
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.id, folder.id);
        t.is(json.name, folder.name);
        t.is(json.userId, t.context.teamObj.user.id);
        t.is(json.children.length, 1);
        t.is(json.children[0].id, child.id);
        t.is(json.charts.length, 1);
        t.is(json.charts[0].id, charts[0].id);
    } finally {
        await destroy(charts, child, folder);
    }
});

test('GET /folders/{id} returns an error 404 when the requested folder does not exist', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/folders/999999`,
        auth: t.context.auth
    });
    t.is(res.statusCode, 404);
});

test('GET /folders/{id} returns an error 403 when the API token does not have the folder:read scope', async t => {
    let folder;
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['spam'] });
        folder = await createFolder({ user_id: userObj.user.id });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(folder, ...Object.values(userObj));
    }
});

test('GET /folders/{id} returns an error when the user does not have permissions to access the requested folder', async t => {
    let folder;
    let anotherUserObj;
    try {
        anotherUserObj = await createUser(t.context.server);
        folder = await createFolder({ user_id: anotherUserObj.user.id });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/folders/${folder.id}`,
            auth: t.context.auth
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, ...Object.values(anotherUserObj));
    }
});

test('GET /folders/{id} returns an error when the user does not have access to the team the folder belongs to', async t => {
    let folder;
    let team;
    try {
        team = await createTeam();
        folder = await createFolder({ org_id: team.id });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/folders/${folder.id}`,
            auth: t.context.auth
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, team);
    }
});

test('GET /folders/{id} always returns the folder for admins', async t => {
    let folder;
    let team;
    try {
        team = await createTeam();
        folder = await createFolder({ org_id: team.id });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        t.is(res.result.id, folder.id);
    } finally {
        await destroy(folder, team);
    }
});

test('PHP GET /folders/{id} returns a single folder', async t => {
    let folder;
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['folder:read'] });
        folder = await createFolder({ user_id: userObj.user.id });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.name, folder.name);
        t.is(json.data.user, userObj.user.id);
    } finally {
        await destroy(folder, userObj);
    }
});

test('PHP GET /folders/{id} returns an error 404 when the requested folder does not exist', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['folder:read'] });
        const res = await fetch(`${BASE_URL}/folders/9999999`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 404);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.data, undefined);
    } finally {
        await destroy(userObj);
    }
});

test('PHP GET /folders/{id} returns an error 403 when the API token does not have the folder:read scope', async t => {
    let folder;
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['spam'] });
        folder = await createFolder({ user_id: userObj.user.id });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.data, undefined);
    } finally {
        await destroy(folder, userObj);
    }
});

test('PHP GET /folders/{id} returns an error when the user does not have permissions to access the requested folder', async t => {
    let folder;
    let userObj;
    let anotherUserObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['folder:read'] });
        anotherUserObj = await createUser(t.context.server);
        folder = await createFolder({ user_id: anotherUserObj.user.id });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        // This is what the old (PHP) API returns:
        // t.is(res.status, 200);
        // const json = await res.json();
        // t.is(json.status, 'error');
        // t.is(json.code, 'access-denied');
        // t.is(json.data, undefined);

        // this is what the new (Node) API returns:
        t.is(res.status, 404);
    } finally {
        await destroy(folder, userObj, anotherUserObj);
    }
});

test('PUT /folders/{id} updates the name of a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const name = randomId();
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name,
                parentId: null,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 200);
        const result = res.result;
        t.is(result.name, name);
        t.is(result.parentId, null);
        t.is(result.userId, t.context.teamObj.user.id);
        t.is(result.teamId, null);
        const updated = await findFolderById(folder.id);
        t.is(updated.name, name);
        t.is(updated.parent_id, null);
        t.is(updated.user_id, t.context.teamObj.user.id);
        t.is(updated.org_id, null);
    } finally {
        await destroy(folder);
    }
});

test('PUT /folders/{id} moves a folder to the root', async t => {
    let folder, parent;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'child',
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            url: `/v3/folders/${folder.id}`,
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: folder.user_id,
                teamId: null,
                parentId: null
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.parentId, null);
        folder = await findFolderById(folder.id);
        t.is(folder.parent_id, null);
    } finally {
        await destroy(folder, parent);
    }
});

test('PUT /folders/{id} moves a folder from a user to a team', async t => {
    let folder, child, grandchild, charts, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        folder = await createFolder({
            name: 'folder',
            user_id: teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            user_id: teamObj.user.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            user_id: teamObj.user.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: folder.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: child.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: grandchild.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: null,
                parentId: null,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, teamObj.team.id);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
        child = await findFolderById(child.id);
        t.is(child.org_id, teamObj.team.id);
        t.is(child.user_id, null);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, teamObj.team.id);
        t.is(grandchild.user_id, null);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, teamObj.user.id);
            t.is(updated.organization_id, teamObj.team.id);
        }
    } finally {
        await destroy(charts, grandchild, child, folder, ...Object.values(teamObj));
    }
});

test('PUT /folders/{id} returns an error when trying to assign ownership of a folder to user as well as a team', async t => {
    let folder, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        folder = await createFolder({
            name: 'folder',
            org_id: teamObj.team.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: teamObj.user.id,
                parentId: null,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
    } finally {
        await destroy(folder, ...Object.values(teamObj));
    }
});

test('PUT /folders/{id} returns error if parent belongs to a different team than the provided teamId', async t => {
    let folder, parent, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        await addUserToTeam(teamObj.user, t.context.teamObj.team);
        parent = await createFolder({
            name: 'parent',
            org_id: t.context.teamObj.team.id
        });
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: null,
                parentId: folder.parent_id,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, t.context.teamObj.team.id);
        t.is(folder.user_id, null);
        t.is(folder.parent_id, parent.id);
    } finally {
        await destroy(folder, parent, ...Object.values(teamObj));
    }
});

test('PUT /folders/{id} returns error if parent belongs to a different user then the provided teamId', async t => {
    let folder, parent;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'folder',
            org_id: null,
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: null,
                parentId: folder.parent_id,
                teamId: t.context.teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, null);
        t.is(folder.user_id, t.context.teamObj.user.id);
        t.is(folder.parent_id, parent.id);
    } finally {
        await destroy(folder, parent);
    }
});

test('PUT /folders/{id} moves a folder from a team to a user', async t => {
    let folder, child, grandchild, charts;
    try {
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id
        });
        child = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            org_id: t.context.teamObj.team.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folder.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: child.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: grandchild.id,
                organization_id: t.context.teamObj.team.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: t.context.teamObj.user.id,
                parentId: null,
                teamId: null
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, null);
        t.is(result.userId, t.context.teamObj.user.id);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, null);
        t.is(folder.user_id, t.context.teamObj.user.id);
        child = await findFolderById(child.id);
        t.is(child.org_id, null);
        t.is(child.user_id, t.context.teamObj.user.id);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, null);
        t.is(grandchild.user_id, t.context.teamObj.user.id);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, t.context.teamObj.user.id);
            t.is(updated.organization_id, null);
        }
    } finally {
        await destroy(charts, grandchild, child, folder);
    }
});

test('PUT /folders/{id} moves a folder between teams', async t => {
    let folder, child, grandchild, charts, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        await addUserToTeam(teamObj.user, t.context.teamObj.team);
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id
        });
        child = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            org_id: t.context.teamObj.team.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folder.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: child.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: grandchild.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name: folder.name,
                userId: null,
                parentId: null,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, teamObj.team.id);
        t.is(result.userId, null);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
        child = await findFolderById(child.id);
        t.is(child.org_id, teamObj.team.id);
        t.is(child.user_id, null);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, teamObj.team.id);
        t.is(grandchild.user_id, null);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, teamObj.user.id);
            t.is(updated.organization_id, teamObj.team.id);
        }
    } finally {
        await destroy(charts, grandchild, child, folder, Object.values(teamObj));
    }
});

test('PUT /folders/{id} returns an error if some fields are missing in request payload', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const name = randomId();
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(folder);
    }
});

test('PUT /folders/{id} returns an error when trying to update a non-existent folder', async t => {
    const name = randomId();
    const res = await t.context.server.inject({
        method: 'PUT',
        url: `/v3/folders/${nonExistentId()}`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        },
        payload: {
            name,
            userId: t.context.teamObj.user.id,
            teamId: null,
            parentId: null
        }
    });
    t.is(res.statusCode, 404);
});

test('PUT /folders/{id} returns an error when trying to move a folder to a team the user is not part of', async t => {
    let folder, team;
    try {
        team = await createTeam();
        folder = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                teamId: team.id,
                name: folder.name,
                parentId: null,
                userId: null
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, team);
    }
});

test('PUT /folders/{id} returns an error when user does not have access to the folder', async t => {
    let folder, userObj;
    try {
        userObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'name',
            user_id: userObj.user.id
        });
        const name = randomId();
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name,
                userId: folder.user_id,
                parentId: null,
                teamId: null
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, ...Object.keys(userObj));
    }
});

test('PUT /folders/{id} returns an error when trying to update the name of a folder to a duplicate name', async t => {
    let folder, duplicateFolder;
    try {
        const name = randomId();
        duplicateFolder = await createFolder({
            name: name,
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name,
                userId: folder.user_id,
                parentId: null,
                teamId: null
            }
        });
        t.is(res.statusCode, 409);
    } finally {
        await destroy(folder, duplicateFolder);
    }
});

test('PUT /folders/{id} returns an error when setting a non-existent folder as parent of a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: nonExistentId(),
                name: folder.name,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder);
    }
});

test('PUT /folders/{id} returns an error when setting an inaccessible folder as parent of a folder', async t => {
    let folder, inaccessibleParent, team;
    try {
        const name = randomId();
        team = await createTeam();
        inaccessibleParent = await createFolder({
            name: name,
            org_id: team.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: inaccessibleParent.id,
                name: folder.name,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, inaccessibleParent, team);
    }
});

test('PUT /folders/{id} returns an error when setting the parent of a folder to the folder itself', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: folder.id,
                name: folder.name,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(folder);
    }
});

test('PUT /folders/{id} returns an error when setting the parent of a folder to a child of the folder', async t => {
    let folder, child;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            parent_id: folder.id,
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: child.id,
                name: folder.name,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(child, folder);
    }
});

test('PUT /folders/{id} returns an error when setting the parent of a folder to a grandchild of the folder', async t => {
    let folder, child, grandchild;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            parent_id: folder.id,
            user_id: t.context.teamObj.user.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            parent_id: child.id,
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: grandchild.id,
                name: folder.name,
                userId: folder.user_id,
                teamId: null
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(grandchild, child, folder);
    }
});

test('PHP PUT /folders/{id} moves a folder to the root', async t => {
    let folder, parent;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'child',
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: false
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.parent, null);
        folder = await findFolderById(folder.id);
        t.is(folder.parent_id, null);
    } finally {
        await destroy(folder, parent);
    }
});

test('PHP PUT /folders/{id} moves a folder to a different organization', async t => {
    let folder, team;
    try {
        team = await createTeam();
        await addUserToTeam(t.context.teamObj.user, team);
        folder = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                organization: team.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.organization, team.id);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, team.id);
    } finally {
        await destroy(folder, team);
    }
});

test('PHP PUT /folders/{id} returns an error when trying to update a non-existent folder', async t => {
    const name = randomId();
    const res = await fetch(`${BASE_URL}/folders/${nonExistentId()}`, {
        method: 'PUT',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name
        })
    });
    t.is(res.status, 200);
    const json = await res.json();
    t.is(json.status, 'error');
    t.is(json.code, 'not-found');
});

test('PHP PUT /folders/{id} returns an error when trying to move a folder to a team the user is not part of', async t => {
    let folder, team;
    try {
        team = await createTeam();
        folder = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                organization: team.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'org-invalid');
    } finally {
        await destroy(folder, team);
    }
});

test('PHP PUT /folders/{id} returns an error when user does not have access to the folder', async t => {
    let folder, userObj;
    try {
        userObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'name',
            user_id: userObj.user.id
        });
        const name = randomId();
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        // t.is(json.code, 'access-denied');   // Before node migration
        t.is(json.code, 'not-found'); // After node migration
    } finally {
        await destroy(folder, ...Object.values(userObj));
    }
});

test('PHP PUT /folders/{id} returns an error when trying to update the name of a folder to a duplicate name', async t => {
    let folder, duplicateFolder;
    try {
        const name = randomId();
        duplicateFolder = await createFolder({
            name: name,
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'duplicate-name');
    } finally {
        await destroy(folder, duplicateFolder);
    }
});

test('PHP PUT /folders/{id} returns an error when setting a non-existent folder as parent of a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: nonExistentId()
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'parent-invalid');
    } finally {
        await destroy(folder);
    }
});

test('PHP PUT /folders/{id} returns an error when setting an inaccessible folder as parent of a folder', async t => {
    let folder, inaccessibleParent, team;
    try {
        const name = randomId();
        team = await createTeam();
        inaccessibleParent = await createFolder({
            name: name,
            org_id: team.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: inaccessibleParent.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'parent-invalid');
    } finally {
        await destroy(folder, inaccessibleParent, team);
    }
});

test('PHP PUT /folders/{id} returns an error when setting the parent of a folder to the folder itself', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: folder.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'move-folder-inside-itself');
    } finally {
        await destroy(folder);
    }
});

test('PHP PUT /folders/{id} returns an error when setting the parent of a folder to a child of the folder', async t => {
    let folder, child;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            parent_id: folder.id,
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parent: child.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'move-folder-inside-substree');
    } finally {
        await destroy(child, folder);
    }
});

test('PHP PUT /folders/{id} moves charts into a folder', async t => {
    let folder, inaccessibleFolder, otherUserObj, charts;
    try {
        otherUserObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'test',
            user_id: t.context.teamObj.user.id
        });
        inaccessibleFolder = await createFolder({
            name: 'inaccessible',
            user_id: otherUserObj.user.id
        });
        charts = await createCharts([
            {
                id: genRandomChartId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id
            },
            {
                id: genRandomChartId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: otherUserObj.user.id,
                in_folder: inaccessibleFolder.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'PUT',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                add: [charts[0].id, charts[1].id]
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        const chart1 = await findChartById(charts[0].id);
        t.is(chart1.in_folder, folder.id);
        const chart2 = await findChartById(charts[1].id);
        t.is(chart2.in_folder, inaccessibleFolder.id);
    } finally {
        await destroy(charts, folder, inaccessibleFolder, ...Object.values(otherUserObj));
    }
});

test('DELETE /folders/{id} deletes a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.statusCode, 204);
        folder = await findFolderById(folder.id);
        t.is(folder, null);
    } finally {
        await destroy(folder);
    }
});

test('DELETE /folders/{id} moves charts of deleted folder to parent', async t => {
    let folder, parent, charts;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'test',
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                in_folder: folder.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.statusCode, 204);
        folder = await findFolderById(folder.id);
        t.is(folder, null);
        const chart1 = await findChartById(charts[0].id);
        t.is(chart1.in_folder, parent.id);
    } finally {
        await destroy(charts, parent);
    }
});

test('DELETE /folders/{id} moves charts of deleted top-level folder to root', async t => {
    let folder, charts;
    try {
        folder = await createFolder({
            name: 'test',
            user_id: t.context.teamObj.user.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                in_folder: folder.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.statusCode, 204);
        const chart1 = await findChartById(charts[0].id);
        t.is(chart1.in_folder, null);
    } finally {
        await destroy(charts);
    }
});

test('DELETE /folders/{id} returns an error when trying to delete non-existent folder', async t => {
    const res = await t.context.server.inject({
        method: 'DELETE',
        url: `/v3/folders/${nonExistentId()}`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        }
    });
    t.is(res.statusCode, 404);
});

test('DELETE /folders/{id} returns an error when trying to delete inaccessible folder', async t => {
    let folder, userObj;
    try {
        userObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'name',
            user_id: userObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, ...Object.values(userObj));
    }
});

test('DELETE /folders/{id} returns an error when trying to delete folder with subfolders', async t => {
    let folder, subfolder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        subfolder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id,
            parent_id: folder.id
        });
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(subfolder, folder);
    }
});

test('PHP DELETE /folders/{id} deletes a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        folder = await findFolderById(folder.id);
        t.is(folder, null);
    } finally {
        await destroy(folder);
    }
});

test('PHP DELETE /folders/{id} moves charts of deleted folder to parent', async t => {
    let folder, parent, charts;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'test',
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                in_folder: folder.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        const chart1 = await findChartById(charts[0].id);
        t.is(chart1.in_folder, parent.id);
    } finally {
        await destroy(charts, folder, parent);
    }
});

test('PHP DELETE /folders/{id} moves charts of deleted root folder to root', async t => {
    let folder, charts;
    try {
        folder = await createFolder({
            name: 'test',
            user_id: t.context.teamObj.user.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                in_folder: folder.id
            }
        ]);
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        const chart1 = await findChartById(charts[0].id);
        t.is(chart1.in_folder, null);
    } finally {
        await destroy(charts, folder);
    }
});

test('PHP DELETE /folders/{id} returns an error when trying to delete non-existent folder', async t => {
    const res = await fetch(`${BASE_URL}/folders/${nonExistentId()}`, {
        method: 'DELETE',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        }
    });
    t.is(res.status, 200);
    const json = await res.json();
    t.is(json.status, 'error');
    t.is(json.code, 'not-found');
});

test('PHP DELETE /folders/{id} returns an error when trying to delete inaccessible folder', async t => {
    let folder, userObj;
    try {
        userObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'name',
            user_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        // t.is(json.code, 'access-denied');   // Before node migration
        t.is(json.code, 'not-found'); // After node migration
    } finally {
        await destroy(folder, ...Object.values(userObj));
    }
});

test('PHP DELETE /folders/{id} returns an error when trying to delete folder with subfolders', async t => {
    let folder, subfolder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        subfolder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id,
            parent_id: folder.id
        });
        const res = await fetch(`${BASE_URL}/folders/${folder.id}`, {
            method: 'DELETE',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'has-subfolders');
    } finally {
        await destroy(subfolder, folder);
    }
});

test('PATCH /folders/{id} updates the name of a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const name = randomId();
        const res = await t.context.server.inject({
            url: `/v3/folders/${folder.id}`,
            method: 'PATCH',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name
            }
        });
        t.is(res.statusCode, 200);
        const result = res.result;
        t.is(result.name, name);
        t.is(result.parentId, null);
        t.is(result.userId, t.context.teamObj.user.id);
        t.is(result.teamId, null);
        const updated = await findFolderById(folder.id);
        t.is(updated.name, name);
        t.is(updated.parent_id, null);
        t.is(updated.user_id, t.context.teamObj.user.id);
        t.is(updated.org_id, null);
    } finally {
        await destroy(folder);
    }
});

test('PATCH /folders/{id} moves a folder to the root', async t => {
    let folder, parent;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'child',
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            url: `/v3/folders/${folder.id}`,
            method: 'PATCH',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: null
            }
        });
        t.is(res.statusCode, 200);
        const json = await res.result;
        t.is(json.parentId, null);
        folder = await findFolderById(folder.id);
        t.is(folder.parent_id, null);
    } finally {
        await destroy(folder, parent);
    }
});

test('PATCH /folders/{id} returns an error when trying to update a non-existent folder', async t => {
    const name = randomId();
    const res = await t.context.server.inject({
        method: 'PATCH',
        url: `/v3/folders/${nonExistentId()}`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        },
        payload: {
            name
        }
    });
    t.is(res.statusCode, 404);
});

test('PATCH /folders/{id} returns an error when trying to move a folder to a team the user is not part of', async t => {
    let folder, team;
    try {
        team = await createTeam();
        folder = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                teamId: team.id
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, team);
    }
});

test('PATCH /folders/{id} returns an error when user does not have access to the folder', async t => {
    let folder, userObj;
    try {
        userObj = await createUser(t.context.server);
        folder = await createFolder({
            name: 'name',
            user_id: userObj.user.id
        });
        const name = randomId();
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, ...Object.keys(userObj));
    }
});

test('PATCH /folders/{id} returns an error when trying to update the name of a folder to a duplicate name', async t => {
    let folder, duplicateFolder;
    try {
        const name = randomId();
        duplicateFolder = await createFolder({
            name: name,
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                name
            }
        });
        t.is(res.statusCode, 409);
    } finally {
        await destroy(folder, duplicateFolder);
    }
});

test('PATCH /folders/{id} returns an error when setting a non-existent folder as parent of a folder', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: nonExistentId()
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder);
    }
});

test('PATCH /folders/{id} returns an error when setting an inaccessible folder as parent of a folder', async t => {
    let folder, inaccessibleParent, team;
    try {
        const name = randomId();
        team = await createTeam();
        inaccessibleParent = await createFolder({
            name: name,
            org_id: team.id
        });
        folder = await createFolder({
            name: 'other',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: inaccessibleParent.id
            }
        });
        t.is(res.statusCode, 404);
    } finally {
        await destroy(folder, inaccessibleParent, team);
    }
});

test('PATCH /folders/{id} returns an error when setting the parent of a folder to the folder itself', async t => {
    let folder;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: folder.id
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(folder);
    }
});

test('PATCH /folders/{id} returns an error when setting the parent of a folder to a child of the folder', async t => {
    let folder, child;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            parent_id: folder.id,
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: child.id
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(child, folder);
    }
});

test('PATCH /folders/{id} returns an error when setting the parent of a folder to a grandchild of the folder', async t => {
    let folder, child, grandchild;
    try {
        folder = await createFolder({
            name: 'name',
            user_id: t.context.teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            parent_id: folder.id,
            user_id: t.context.teamObj.user.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            parent_id: child.id,
            user_id: t.context.teamObj.user.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: grandchild.id
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(grandchild, child, folder);
    }
});

test('PATCH /folders/{id} moves a folder from a user to a team', async t => {
    let folder, child, grandchild, charts, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        folder = await createFolder({
            name: 'folder',
            user_id: teamObj.user.id
        });
        child = await createFolder({
            name: 'child',
            user_id: teamObj.user.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            user_id: teamObj.user.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: folder.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: child.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                in_folder: grandchild.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                teamId: teamObj.team.id,
                userId: null
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, teamObj.team.id);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
        child = await findFolderById(child.id);
        t.is(child.org_id, teamObj.team.id);
        t.is(child.user_id, null);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, teamObj.team.id);
        t.is(grandchild.user_id, null);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, teamObj.user.id);
            t.is(updated.organization_id, teamObj.team.id);
        }
    } finally {
        await destroy(charts, grandchild, child, folder, ...Object.values(teamObj));
    }
});

test('PATCH /folders/{id} moves a folder from a team to a user implicitly', async t => {
    let folder, child, grandchild, charts, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        folder = await createFolder({
            name: 'folder',
            org_id: teamObj.team.id,
            user_id: null
        });
        child = await createFolder({
            name: 'child',
            org_id: teamObj.team.id,
            user_id: null,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            user_id: null,
            org_id: teamObj.team.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id,
                in_folder: folder.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id,
                in_folder: child.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: teamObj.user.id,
                organization_id: teamObj.team.id,
                in_folder: grandchild.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                teamId: null
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.userId, teamObj.user.id);
        t.is(result.teamId, null);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, null);
        t.is(folder.user_id, teamObj.user.id);
        child = await findFolderById(child.id);
        t.is(child.org_id, null);
        t.is(child.user_id, teamObj.user.id);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, null);
        t.is(grandchild.user_id, teamObj.user.id);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, teamObj.user.id);
            t.is(updated.organization_id, null);
        }
    } finally {
        await destroy(charts, grandchild, child, folder, ...Object.values(teamObj));
    }
});

test('PATCH /folders/{id} returns an error when trying to assign ownership of a folder to a user as well as a team', async t => {
    let folder, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        folder = await createFolder({
            name: 'folder',
            org_id: teamObj.team.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                userId: teamObj.user.id,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
    } finally {
        await destroy(folder, ...Object.values(teamObj));
    }
});

test('PATCH /folders/{id} returns error if parent belongs to a different team than the provided teamId', async t => {
    let folder, parent, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        await addUserToTeam(teamObj.user, t.context.teamObj.team);
        parent = await createFolder({
            name: 'parent',
            org_id: t.context.teamObj.team.id
        });
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: folder.parent_id,
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, t.context.teamObj.team.id);
        t.is(folder.user_id, null);
        t.is(folder.parent_id, parent.id);
    } finally {
        await destroy(folder, parent, ...Object.values(teamObj));
    }
});

test('PATCH /folders/{id} returns error if parent belongs to a different user then the provided teamId', async t => {
    let folder, parent;
    try {
        parent = await createFolder({
            name: 'parent',
            user_id: t.context.teamObj.user.id
        });
        folder = await createFolder({
            name: 'folder',
            org_id: null,
            user_id: t.context.teamObj.user.id,
            parent_id: parent.id
        });
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                parentId: folder.parent_id,
                teamId: t.context.teamObj.team.id
            }
        });
        t.is(res.statusCode, 400);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, null);
        t.is(folder.user_id, t.context.teamObj.user.id);
        t.is(folder.parent_id, parent.id);
    } finally {
        await destroy(folder, parent);
    }
});

test('PATCH /folders/{id} moves a folder from a team to a user explicitly', async t => {
    let folder, child, grandchild, charts;
    try {
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id
        });
        child = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            org_id: t.context.teamObj.team.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folder.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: child.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: grandchild.id,
                organization_id: t.context.teamObj.team.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                userId: t.context.teamObj.user.id,
                teamId: null
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, null);
        t.is(result.userId, t.context.teamObj.user.id);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, null);
        t.is(folder.user_id, t.context.teamObj.user.id);
        child = await findFolderById(child.id);
        t.is(child.org_id, null);
        t.is(child.user_id, t.context.teamObj.user.id);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, null);
        t.is(grandchild.user_id, t.context.teamObj.user.id);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, t.context.teamObj.user.id);
            t.is(updated.organization_id, null);
        }
    } finally {
        await destroy(charts, grandchild, child, folder);
    }
});

test('PATCH /folders/{id} moves a folder between teams', async t => {
    let folder, child, grandchild, charts, teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'member' });
        await addUserToTeam(teamObj.user, t.context.teamObj.team);
        folder = await createFolder({
            name: 'folder',
            org_id: t.context.teamObj.team.id
        });
        child = await createFolder({
            name: 'child',
            org_id: t.context.teamObj.team.id,
            parent_id: folder.id
        });
        grandchild = await createFolder({
            name: 'grandchild',
            org_id: t.context.teamObj.team.id,
            parent_id: child.id
        });
        charts = await createCharts([
            {
                id: randomId(),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folder.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: child.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            },
            {
                id: randomId(),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: grandchild.id,
                author_id: teamObj.user.id,
                organization_id: t.context.teamObj.team.id
            }
        ]);
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/folders/${folder.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${teamObj.token}`,
                'Content-Type': 'application/json'
            },
            payload: {
                teamId: teamObj.team.id
            }
        });
        t.is(res.statusCode, 200);
        const result = await res.result;
        t.is(result.teamId, teamObj.team.id);
        t.is(result.userId, null);
        folder = await findFolderById(folder.id);
        t.is(folder.org_id, teamObj.team.id);
        t.is(folder.user_id, null);
        child = await findFolderById(child.id);
        t.is(child.org_id, teamObj.team.id);
        t.is(child.user_id, null);
        grandchild = await findFolderById(grandchild.id);
        t.is(grandchild.org_id, teamObj.team.id);
        t.is(grandchild.user_id, null);
        for (const chart of charts) {
            const updated = await findChartById(chart.id);
            t.is(updated.author_id, teamObj.user.id);
            t.is(updated.organization_id, teamObj.team.id);
        }
    } finally {
        await destroy(charts, grandchild, child, folder, Object.values(teamObj));
    }
});
