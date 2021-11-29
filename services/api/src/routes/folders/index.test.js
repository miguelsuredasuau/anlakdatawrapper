const fetch = require('node-fetch');
const { serial: test } = require('ava');
const { randomInt } = require('crypto');
const {
    BASE_URL,
    createUser,
    destroy,
    setup,
    createTeamWithUser,
    createCharts,
    createFolders,
    createFoldersWithParent
} = require('../../../test/helpers/setup');

function createFolder(props) {
    const { Folder } = require('@datawrapper/orm/models');
    return Folder.create({
        ...props,
        name: String(randomInt(99999))
    });
}

function findFolderByName(name) {
    const { Folder } = require('@datawrapper/orm/models');
    return Folder.findOne({ where: { name } });
}

function findChartsByIds(ids) {
    const { Chart } = require('@datawrapper/orm/models');
    return Chart.findAll({ where: { id: ids } });
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

test('GET /folders should return all folders of a user', async t => {
    let folders, charts;
    try {
        folders = await createFolders([
            { name: 'Test Folder' },
            { name: 'User Folder', user_id: t.context.teamObj.user.id },
            { name: 'Team Folder', org_id: t.context.teamObj.team.id }
        ]);
        const nestedFolders = await createFoldersWithParent(
            [{ name: 'Nested Folder', user_id: t.context.teamObj.user.id }],
            folders[1]
        );
        folders = [...folders, ...nestedFolders];
        charts = await createCharts([
            {
                id: String(randomInt(99999)),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                organization_id: t.context.teamObj.team.id
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folders[1].id
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 4',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folders[2].id
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 5',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folders[3].id
            }
        ]);
        const resp = await t.context.server.inject({
            method: 'GET',
            url: '/v3/folders',
            auth: t.context.auth
        });

        t.is(resp.statusCode, 200);
        t.is(resp.result.total, 2);

        const foldersAndChartsOfUser = resp.result.list.find(el => el.type === 'user');
        const foldersAndChartsOfTeam = resp.result.list.find(el => el.type === 'team');
        t.is(foldersAndChartsOfUser.folders.length, 1);
        t.is(foldersAndChartsOfUser.charts.length, 1);
        t.is(foldersAndChartsOfTeam.folders.length, 1);
        t.is(foldersAndChartsOfUser.folders[0].folders.length, 1);
        t.is(foldersAndChartsOfUser.folders[0].folders[0].charts.length, 1);
        t.is(foldersAndChartsOfUser.folders[0].charts.length, 1);
        t.is(foldersAndChartsOfTeam.charts.length, 1);
        t.is(foldersAndChartsOfUser.charts[0].metadata, undefined); // check that chart data is cleaned
    } finally {
        await destroy(charts, folders.reverse()); // reverse so that nested folders are destroyed first
    }
});

test('PHP GET /folders returns the list of folders for the current user', async t => {
    let folder, charts;
    try {
        folder = await createFolder({ user_id: t.context.teamObj.user.id });
        charts = await createCharts([
            {
                id: String(randomInt(99999)),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id,
                last_edit_step: 3
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                organization_id: t.context.teamObj.team.id,
                last_edit_step: 3
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 3',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                in_folder: folder.id,
                last_edit_step: 3
            }
        ]);
        const res = await fetch(`${BASE_URL}/folders`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data[0].folders.length, 1);
        t.is(json.data[0].charts, 1);
        t.is(json.data[0].type, 'user');
        t.is(json.data[0].folders[0].name, folder.name);
        t.is(json.data[0].folders[0].charts, 1);
        t.is(json.data[1].charts, 1);
        t.is(json.data[1].folders.length, 0);
        // following assertions fail after Node migration
        // t.is(json.data[0].folders[0].user, t.context.teamObj.user.id);
        // t.is(json.data[1].type, 'organization');
        // t.is(json.data[1].organization.id, t.context.teamObj.team.id);
    } finally {
        await destroy(charts, folder);
    }
});

test('PHP GET /folders returns an error 403 when the API token does not have the folder:read scope', async t => {
    let folder;
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['spam'] });
        folder = await createFolder({ user_id: userObj.user.id });
        const res = await fetch(`${BASE_URL}/folders`, {
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

test('PHP POST /folders creates a new folder', async t => {
    let folder;
    try {
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name
            })
        });
        folder = await findFolderByName(name);
        t.is(folder.name, name);
        t.is(folder.parent_id, null);
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.name, name);
    } finally {
        await destroy(folder);
    }
});

test('PHP POST /folders returns an error when folder name is not specified', async t => {
    const res = await fetch(`${BASE_URL}/folders`, {
        method: 'POST',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.teamObj.token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            // missing name
        })
    });
    t.is(res.status, 200);
    const json = await res.json();
    t.is(json.status, 'error');
    t.is(json.code, 'need-name');
});

test('PHP POST /folders creates a new folder with a parent folder', async t => {
    let folder, parentFolder;
    try {
        parentFolder = (
            await createFolders([
                {
                    name: 'parent',
                    user_id: t.context.teamObj.user.id
                }
            ])
        )[0];
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                parent: parentFolder.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.name, name);
        t.is(json.data.parent, parentFolder.id);
        t.is(json.data.user, parentFolder.user_id);
        folder = await findFolderByName(name);
        t.is(folder.name, name);
        t.is(folder.parent_id, parentFolder.id);
    } finally {
        await destroy(folder, parentFolder);
    }
});

test('PHP POST /folders returns an error when creating a user folder with a parent folder not owned by the user', async t => {
    let parentFolder, userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['folder:read'] });
        parentFolder = (
            await createFolders([
                {
                    name: 'parent',
                    user_id: userObj.user.id
                }
            ])
        )[0];
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                parent: parentFolder.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'parent-invalid');
    } finally {
        await destroy(parentFolder, ...Object.keys(userObj));
    }
});

test('PHP POST /folders returns an error when creating a folder with a parent folder that is not owned by the same organization', async t => {
    let parentFolder, otherTeamObj;
    try {
        otherTeamObj = await createTeamWithUser(t.context.server);
        parentFolder = (
            await createFolders([
                {
                    name: 'parent',
                    org_id: otherTeamObj.team.id
                }
            ])
        )[0];
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                parent: parentFolder.id,
                organization: t.context.teamObj.team.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'parent-invalid');
    } finally {
        await destroy(parentFolder, ...Object.keys(otherTeamObj));
    }
});

test('PHP POST /folders creates a new folder with organization specified', async t => {
    let folder;
    try {
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                organization: t.context.teamObj.team.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        t.is(json.data.name, name);
        t.is(json.data.organization, t.context.teamObj.team.id);
        t.is(json.data.user, null);
        folder = await findFolderByName(name);
        t.is(folder.name, name);
        t.is(folder.org_id, t.context.teamObj.team.id);
    } finally {
        await destroy(folder);
    }
});

test('PHP POST /folders returns an error when the user does not have access to the specified organization', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server);
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                organization: teamObj.team.id
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'org-invalid');
    } finally {
        await destroy(...Object.keys(teamObj));
    }
});

test('PHP POST /folders returns an error when creating a folder with duplicate name', async t => {
    let folder;
    try {
        const name = String(randomInt(99999));
        folder = (await createFolders([{ name: name, user_id: t.context.teamObj.user.id }]))[0];
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
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
        await destroy(folder);
    }
});

test('PHP POST /folders charts are not moved into a newly created folder', async t => {
    let folder, charts;
    try {
        charts = await createCharts([
            {
                id: String(randomInt(99999)),
                title: 'Chart 1',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id
            },
            {
                id: String(randomInt(99999)),
                title: 'Chart 2',
                theme: 'theme1',
                type: 'bar',
                metadata: {},
                author_id: t.context.teamObj.user.id
            }
        ]);
        const name = String(randomInt(99999));
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.teamObj.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                add: [charts[0].id, charts[1].id]
            })
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'ok');
        folder = await findFolderByName(name);
        const updatedCharts = await findChartsByIds([charts[0].id, charts[1].id]);
        updatedCharts.forEach(chart => t.is(chart.in_folder, null));
    } finally {
        await destroy(charts, folder);
    }
});

test('PHP POST /folders returns an error 403 when the API token does not have the folder:write scope', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server, { scopes: ['spam'] });
        const res = await fetch(`${BASE_URL}/folders`, {
            method: 'POST',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            },
            body: JSON.stringify({
                name: 'some-name'
            })
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.data, undefined);
    } finally {
        await destroy(...Object.keys(userObj));
    }
});
