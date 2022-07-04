const test = require('ava');
const OpenSearchClient = require('../../utils/openSearchClient.js');
const {
    ALL_SCOPES,
    addUserToTeam,
    createFolder,
    createTeam,
    createUser,
    destroy,
    genRandomChartId,
    genNonExistentFolderId,
    setup
} = require('../../../test/helpers/setup');
const { randomInt } = require('crypto');

function genRandomChartPrefix() {
    return `test_${randomInt(99999)}`;
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });

    t.context.adminObj = await createUser(t.context.server, { role: 'admin' });
    t.context.userObj = await createUser(t.context.server);
    t.context.otherUserObj = await createUser(t.context.server);

    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };

    t.context.openSearchClient = new OpenSearchClient(
        t.context.server.methods.config('opensearch')
    );

    t.context.search = function (userObj, params) {
        return t.context.server.inject({
            method: 'GET',
            url: '/v3/search/charts?' + new URLSearchParams(params),
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
    };
});

test.after.always(async t => {
    await destroy(
        Object.values(t.context.adminObj),
        Object.values(t.context.userObj),
        Object.values(t.context.otherUserObj)
    );
});

test('GET /search/charts searches in multiple fields', async t => {
    const chartId = genRandomChartId();
    const charts = [
        {
            id: chartId,
            title: 'apple',
            intro: 'banana',
            byline: 'lemon',
            source_name: 'strawberry',
            source_url: 'https://rasberry.com',
            notes: 'pear',
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: 'spam',
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        for (const query of ['apple', 'banana', 'lemon', 'strawberry', 'pear']) {
            const res = await t.context.search(t.context.adminObj, {
                query,
                authorId: 'all',
                orderBy: 'authorId',
                order: 'ASC'
            });
            t.is(res.statusCode, 200);
            t.is(res.result.list.length, 1);
            t.is(res.result.list[0].id, chartId);
        }
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts searches custom fields', async t => {
    const chartId = genRandomChartId();
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: chartId,
            custom_fields: {
                my_field: `${prefix} my value`
            },
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const res = await t.context.search(t.context.adminObj, {
            query: `${prefix} my value`,
            authorId: 'all'
        });
        t.is(res.statusCode, 200);
        t.is(res.result.list.length, 1);
        t.is(res.result.list[0].id, chartId);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts searches custom fields that are not text', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} custom field 1`,
            custom_fields: {
                my_boolean_field: true
            },
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} custom field 2`,
            custom_fields: {
                my_boolean_field: false
            },
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const res = await t.context.search(t.context.adminObj, {
            query: `${prefix} custom field false`,
            authorId: 'all'
        });
        t.is(res.statusCode, 200);
        t.is(res.result.list.length, 1);
        t.is(res.result.list[0].title, `${prefix} custom field 2`);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts returns error 401 if called by unauthenticated user', async t => {
    const query = 'test';
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/search/charts?query=${query}`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer invalid`
        }
    });
    t.is(res.statusCode, 401);
});

test('GET /search/charts returns error 401 if called by guest user', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'guest' });
        const query = 'test';
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/search/charts?query=${query}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 401);
    } finally {
        await destroy(...Object.values(userObj));
    }
});

test('GET /search/charts returns error 403 if called with insufficient permissions', async t => {
    let userObj = {};
    try {
        const scopes = ALL_SCOPES.filter(s => s !== 'chart:read');
        userObj = await createUser(t.context.server, { scopes });
        const query = 'test';
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/search/charts?query=${query}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(...Object.values(userObj));
    }
});

test('GET /search/charts orders results by authorId and createdAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 9`,
            author_id: 9,
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 1 older`,
            author_id: 1,
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 1 newer`,
            author_id: 1,
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 5`,
            author_id: 5,
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'authorId'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [`${prefix} 9`, `${prefix} 5`, `${prefix} 1 newer`, `${prefix} 1 older`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'authorId',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [`${prefix} 1 newer`, `${prefix} 1 older`, `${prefix} 5`, `${prefix} 9`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by createdAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 13:00`,
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 09:00`,
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 11:00`,
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'createdAt'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [`${prefix} 13:00`, `${prefix} 11:00`, `${prefix} 09:00`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'createdAt',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [`${prefix} 09:00`, `${prefix} 11:00`, `${prefix} 13:00`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by lastEditStep and createdAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 3`,
            last_edit_step: 3,
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 1 older`,
            last_edit_step: 1,
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 2`,
            last_edit_step: 2,
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 1 newer`,
            last_edit_step: 1,
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'lastEditStep'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [`${prefix} 3`, `${prefix} 2`, `${prefix} 1 newer`, `${prefix} 1 older`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'lastEditStep',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [`${prefix} 1 newer`, `${prefix} 1 older`, `${prefix} 2`, `${prefix} 3`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by lastModifiedAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 08:00`,
            last_modified_at: new Date('2022-05-01T08:00:00.000Z'),
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 09:00`,
            last_modified_at: new Date('2022-05-01T09:00:00.000Z'),
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 03:00`,
            last_modified_at: new Date('2022-05-01T03:00:00.000Z'),
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'lastModifiedAt'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [`${prefix} 09:00`, `${prefix} 08:00`, `${prefix} 03:00`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'lastModifiedAt',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [`${prefix} 03:00`, `${prefix} 08:00`, `${prefix} 09:00`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by publishedAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 22:00`,
            published_at: new Date('2022-04-10T22:00:00.000Z'),
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 21:00`,
            published_at: new Date('2022-04-10T21:00:00.000Z'),
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 23:00`,
            published_at: new Date('2022-04-10T23:00:00.000Z'),
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'publishedAt'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [`${prefix} 23:00`, `${prefix} 22:00`, `${prefix} 21:00`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'publishedAt',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [`${prefix} 21:00`, `${prefix} 22:00`, `${prefix} 23:00`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by title and createdAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} A`,
            language: `${prefix} A`, // Use language to store some identifying information about the chart.
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} C`,
            language: `${prefix} C older`,
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} B`,
            language: `${prefix} B`,
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} C`,
            language: `${prefix} C newer`,
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'title'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.language),
            [`${prefix} C newer`, `${prefix} C older`, `${prefix} B`, `${prefix} A`]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'title',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.language),
            [`${prefix} A`, `${prefix} B`, `${prefix} C newer`, `${prefix} C older`]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts orders results by type and createdAt', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} d3-bars`,
            type: 'd3-bars',
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} locator-maps older`,
            type: 'locator-maps',
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} locator-maps newer`,
            type: 'locator-maps',
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} visualization-column-charts`,
            type: 'visualization-column-charts',
            created_at: new Date('2022-03-29T11:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const resDesc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'type'
        });
        t.is(resDesc.statusCode, 200);
        t.deepEqual(
            resDesc.result.list.map(chart => chart.title),
            [
                `${prefix} visualization-column-charts`,
                `${prefix} locator-maps newer`,
                `${prefix} locator-maps older`,
                `${prefix} d3-bars`
            ]
        );

        const resAsc = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            orderBy: 'type',
            order: 'ASC'
        });
        t.is(resAsc.statusCode, 200);
        t.deepEqual(
            resAsc.result.list.map(chart => chart.title),
            [
                `${prefix} d3-bars`,
                `${prefix} locator-maps newer`,
                `${prefix} locator-maps older`,
                `${prefix} visualization-column-charts`
            ]
        );
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts returns error 400 when trying to order by a field that is not allowed', async t => {
    const res = await t.context.search(t.context.adminObj, {
        query: 'chart',
        authorId: 'all',
        orderBy: 'language'
    });
    t.is(res.statusCode, 400);
});

test('GET /search/charts filters by author when the user is admin', async t => {
    const prefix = genRandomChartPrefix();
    let otherUserObj = {};
    let charts;
    try {
        otherUserObj = await createUser(t.context.server);
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} admin`,
                author_id: t.context.adminObj.user.id,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other`,
                author_id: otherUserObj.user.id,
                created_at: new Date('2022-03-29T13:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const resDefault = await t.context.search(t.context.adminObj, {
            query: prefix
        });
        t.is(resDefault.statusCode, 200);
        t.deepEqual(
            resDefault.result.list.map(chart => chart.title),
            [`${prefix} admin`]
        );

        const resMe = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'me'
        });
        t.is(resMe.statusCode, 200);
        t.deepEqual(
            resMe.result.list.map(chart => chart.title),
            [`${prefix} admin`]
        );

        const resOwn = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: t.context.adminObj.user.id
        });
        t.is(resOwn.statusCode, 200);
        t.deepEqual(
            resOwn.result.list.map(chart => chart.title),
            [`${prefix} admin`]
        );

        const resOther = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: otherUserObj.user.id
        });
        t.is(resOther.statusCode, 200);
        t.deepEqual(
            resOther.result.list.map(chart => chart.title),
            [`${prefix} other`]
        );

        const resNonExistent = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: randomInt(99999)
        });
        t.is(resNonExistent.statusCode, 404);

        const resAll = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all'
        });
        t.is(resAll.statusCode, 200);
        t.deepEqual(
            resAll.result.list.map(chart => chart.title),
            [`${prefix} admin`, `${prefix} other`]
        );
    } finally {
        await destroy(...Object.values(otherUserObj));
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts filters by author when the user is not an admin', async t => {
    const prefix = genRandomChartPrefix();
    let otherUserObj = {};
    let charts;
    try {
        otherUserObj = await createUser(t.context.server);
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} user`,
                author_id: t.context.userObj.user.id,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other`,
                author_id: otherUserObj.user.id,
                created_at: new Date('2022-03-29T13:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const resDefault = await t.context.search(t.context.userObj, {
            query: prefix
        });
        t.is(resDefault.statusCode, 200);
        t.deepEqual(
            resDefault.result.list.map(chart => chart.title),
            [`${prefix} user`]
        );

        const resMe = await t.context.search(t.context.userObj, {
            query: prefix,
            authorId: 'me'
        });
        t.is(resMe.statusCode, 200);
        t.deepEqual(
            resMe.result.list.map(chart => chart.title),
            [`${prefix} user`]
        );

        const resOwn = await t.context.search(t.context.userObj, {
            query: prefix,
            authorId: t.context.userObj.user.id
        });
        t.is(resOwn.statusCode, 200);
        t.deepEqual(
            resOwn.result.list.map(chart => chart.title),
            [`${prefix} user`]
        );

        const resOther = await t.context.search(t.context.userObj, {
            query: prefix,
            authorId: otherUserObj.user.id
        });
        t.is(resOther.statusCode, 403);

        const resNonExistent = await t.context.search(t.context.userObj, {
            query: prefix,
            authorId: randomInt(99999)
        });
        t.is(resNonExistent.statusCode, 403);

        const resAll = await t.context.search(t.context.userObj, {
            query: prefix,
            authorId: 'all'
        });
        t.is(resAll.statusCode, 403);
    } finally {
        await destroy(...Object.values(otherUserObj));
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts filters by team when the user is admin', async t => {
    const prefix = genRandomChartPrefix();
    let adminObj = {};
    let adminTeam1;
    let adminTeam2;
    let otherUserObj = {};
    let otherTeam;
    let charts;
    try {
        adminObj = await createUser(t.context.server, { role: 'admin' });
        adminTeam1 = await createTeam();
        adminTeam2 = await createTeam();
        await addUserToTeam(adminObj.user, adminTeam1);
        await addUserToTeam(adminObj.user, adminTeam2);
        otherUserObj = await createUser(t.context.server);
        otherTeam = await createTeam();
        await addUserToTeam(otherUserObj.user, adminTeam1);
        await addUserToTeam(otherUserObj.user, otherTeam);
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in my first team`,
                author_id: adminObj.user.id,
                team_id: adminTeam1.id,
                created_at: new Date('2022-03-29T19:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in my second team`,
                author_id: adminObj.user.id,
                team_id: adminTeam2.id,
                created_at: new Date('2022-03-29T18:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in no team`,
                author_id: adminObj.user.id,
                team_id: null,
                created_at: new Date('2022-03-29T17:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in my first team`,
                author_id: otherUserObj.user.id,
                team_id: adminTeam1.id,
                created_at: new Date('2022-03-29T16:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in another team`,
                author_id: otherUserObj.user.id,
                team_id: otherTeam.id,
                created_at: new Date('2022-03-29T15:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in no team`,
                author_id: otherUserObj.user.id,
                team_id: null,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const resDefault = await t.context.search(adminObj, {
            query: prefix
        });
        t.is(resDefault.statusCode, 200);
        t.deepEqual(
            resDefault.result.list.map(chart => chart.title),
            [
                `${prefix} my chart in my first team`,
                `${prefix} my chart in my second team`,
                `${prefix} my chart in no team`,
                `${prefix} other user's chart in my first team`
            ]
        );

        const resMyChartsInMyTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: adminTeam1.id
        });
        t.is(resMyChartsInMyTeam.statusCode, 200);
        t.deepEqual(
            resMyChartsInMyTeam.result.list.map(chart => chart.title),
            [`${prefix} my chart in my first team`, `${prefix} other user's chart in my first team`]
        );

        const resOtherUsersChartsInMyTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: adminTeam1.id,
            authorId: otherUserObj.user.id
        });
        t.is(resOtherUsersChartsInMyTeam.statusCode, 200);
        t.deepEqual(
            resOtherUsersChartsInMyTeam.result.list.map(chart => chart.title),
            [`${prefix} other user's chart in my first team`]
        );

        const resAllChartsInAnotherTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: otherTeam.id
        });
        t.is(resAllChartsInAnotherTeam.statusCode, 200);
        t.deepEqual(
            resAllChartsInAnotherTeam.result.list.map(chart => chart.title),
            [`${prefix} other user's chart in another team`]
        );

        const resAllChartsInAnotherTeam2 = await t.context.search(adminObj, {
            query: prefix,
            teamId: otherTeam.id,
            authorId: 'all'
        });
        t.is(resAllChartsInAnotherTeam2.statusCode, 200);
        t.deepEqual(
            resAllChartsInAnotherTeam2.result.list.map(chart => chart.title),
            [`${prefix} other user's chart in another team`]
        );

        const resMyChartsInNoTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: 'null',
            authorId: adminObj.user.id
        });
        t.is(resMyChartsInNoTeam.statusCode, 200);
        t.deepEqual(
            resMyChartsInNoTeam.result.list.map(chart => chart.title),
            [`${prefix} my chart in no team`]
        );

        const resOtherUsersChartsInNoTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: 'null',
            authorId: otherUserObj.user.id
        });
        t.is(resOtherUsersChartsInNoTeam.statusCode, 200);
        t.deepEqual(
            resOtherUsersChartsInNoTeam.result.list.map(chart => chart.title),
            [`${prefix} other user's chart in no team`]
        );

        const resAllChartsInNoTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: 'null',
            authorId: 'all'
        });
        t.is(resAllChartsInNoTeam.statusCode, 200);
        t.deepEqual(
            resAllChartsInNoTeam.result.list.map(chart => chart.title),
            [`${prefix} my chart in no team`, `${prefix} other user's chart in no team`]
        );

        const resNonExistentTeam = await t.context.search(adminObj, {
            query: prefix,
            teamId: String(randomInt(99999))
        });
        t.is(resNonExistentTeam.statusCode, 404);
    } finally {
        await destroy(
            otherTeam,
            adminTeam1,
            adminTeam2,
            ...Object.values(otherUserObj),
            ...Object.values(adminObj)
        );
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts filters by team when the user is not admin', async t => {
    const prefix = genRandomChartPrefix();
    let userObj = {};
    let userTeam1;
    let userTeam2;
    let otherUserObj = {};
    let otherTeam;
    let charts;
    try {
        userObj = await createUser(t.context.server);
        userTeam1 = await createTeam();
        userTeam2 = await createTeam();
        await addUserToTeam(userObj.user, userTeam1);
        await addUserToTeam(userObj.user, userTeam2);
        otherUserObj = await createUser(t.context.server);
        otherTeam = await createTeam();
        await addUserToTeam(otherUserObj.user, userTeam1);
        await addUserToTeam(otherUserObj.user, otherTeam);
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in my first team`,
                author_id: userObj.user.id,
                team_id: userTeam1.id,
                created_at: new Date('2022-03-29T19:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in my second team`,
                author_id: userObj.user.id,
                team_id: userTeam2.id,
                created_at: new Date('2022-03-29T18:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} my chart in no team`,
                author_id: userObj.user.id,
                team_id: null,
                created_at: new Date('2022-03-29T17:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in my first team`,
                author_id: otherUserObj.user.id,
                team_id: userTeam1.id,
                created_at: new Date('2022-03-29T16:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in another team`,
                author_id: otherUserObj.user.id,
                team_id: otherTeam.id,
                created_at: new Date('2022-03-29T15:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} other user's chart in no team`,
                author_id: otherUserObj.user.id,
                team_id: null,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const resDefault = await t.context.search(userObj, {
            query: prefix
        });
        t.is(resDefault.statusCode, 200);
        t.deepEqual(
            resDefault.result.list.map(chart => chart.title),
            [
                `${prefix} my chart in my first team`,
                `${prefix} my chart in my second team`,
                `${prefix} my chart in no team`,
                `${prefix} other user's chart in my first team`
            ]
        );

        const resMyChartsInMyTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: userTeam1.id
        });
        t.is(resMyChartsInMyTeam.statusCode, 200);
        t.deepEqual(
            resMyChartsInMyTeam.result.list.map(chart => chart.title),
            [`${prefix} my chart in my first team`, `${prefix} other user's chart in my first team`]
        );

        const resOtherUsersChartsInMyTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: userTeam1.id,
            authorId: otherUserObj.user.id
        });
        t.is(resOtherUsersChartsInMyTeam.statusCode, 403);

        const resAllChartsInAnotherTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: otherTeam.id
        });
        t.is(resAllChartsInAnotherTeam.statusCode, 403);

        const resAllChartsInAnotherTeam2 = await t.context.search(userObj, {
            query: prefix,
            teamId: otherTeam.id,
            authorId: 'all'
        });
        t.is(resAllChartsInAnotherTeam2.statusCode, 403);

        const resMyChartsInNoTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: 'null',
            authorId: userObj.user.id
        });
        t.is(resMyChartsInNoTeam.statusCode, 200);
        t.deepEqual(
            resMyChartsInNoTeam.result.list.map(chart => chart.title),
            [`${prefix} my chart in no team`]
        );

        const resOtherUsersChartsInNoTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: 'null',
            authorId: otherUserObj.user.id
        });
        t.is(resOtherUsersChartsInNoTeam.statusCode, 403);

        const resAllChartsInNoTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: 'null',
            authorId: 'all'
        });
        t.is(resAllChartsInNoTeam.statusCode, 403);

        const resNonExistentTeam = await t.context.search(userObj, {
            query: prefix,
            teamId: String(randomInt(99999))
        });
        t.is(resNonExistentTeam.statusCode, 403);
    } finally {
        await destroy(
            otherTeam,
            userTeam1,
            userTeam2,
            ...Object.values(otherUserObj),
            ...Object.values(userObj)
        );
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts filters charts by folder', async t => {
    const prefix = genRandomChartPrefix();
    let charts;
    let folder1;
    let folder2;
    try {
        folder1 = await createFolder();
        folder2 = await createFolder();
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} 1`,
                in_folder: folder1.id,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} 2`,
                in_folder: folder2.id,
                created_at: new Date('2022-03-29T13:00:00.000Z'),
                deleted: false
            },
            {
                id: genRandomChartId(),
                title: `${prefix} root`,
                in_folder: null,
                created_at: new Date('2022-03-29T12:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const res = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            folderId: folder1.id
        });
        t.is(res.statusCode, 200);
        t.deepEqual(
            res.result.list.map(chart => chart.title),
            [`${prefix} 1`]
        );

        const resRoot = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            folderId: 'null'
        });
        t.is(resRoot.statusCode, 200);
        t.deepEqual(
            resRoot.result.list.map(chart => chart.title),
            [`${prefix} root`]
        );
    } finally {
        await destroy(folder1, folder2);
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts returns error 403 when the folder does not exist', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} filter non-existent folder`,
            created_at: new Date('2022-03-29T14:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        const resNonExistent = await t.context.search(t.context.adminObj, {
            query: `${prefix} filter non-existent folder`,
            authorId: 'all',
            folderId: genNonExistentFolderId()
        });
        t.is(resNonExistent.statusCode, 403);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts returns error 403 when the folder is not writable by the user', async t => {
    const prefix = genRandomChartPrefix();
    let charts;
    let folder;
    try {
        folder = await createFolder();
        charts = [
            {
                id: genRandomChartId(),
                title: `${prefix} user`,
                in_folder: folder.id,
                author_id: t.context.userObj.user.id,
                created_at: new Date('2022-03-29T14:00:00.000Z'),
                deleted: false
            }
        ];
        await t.context.openSearchClient.index(charts);

        const resUser = await t.context.search(t.context.userObj, {
            query: `${prefix} user`
        });
        t.is(resUser.statusCode, 200);

        const resUser2 = await t.context.search(t.context.userObj, {
            query: `${prefix} user`,
            folderId: folder.id
        });
        t.is(resUser2.statusCode, 403);

        const resAdmin = await t.context.search(t.context.adminObj, {
            query: `${prefix} user`,
            authorId: 'all',
            folderId: folder.id
        });
        t.is(resAdmin.statusCode, 200);
        t.deepEqual(
            resAdmin.result.list.map(chart => chart.title),
            [`${prefix} user`]
        );
    } finally {
        await destroy(folder);
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts filters charts by minLastEditStep', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} 1`,
            last_edit_step: 1,
            created_at: new Date('2022-03-29T14:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 2`,
            last_edit_step: 2,
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: false
        },
        {
            id: genRandomChartId(),
            title: `${prefix} 3`,
            last_edit_step: 3,
            created_at: new Date('2022-03-29T12:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const res0 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            minLastEditStep: 0
        });
        t.is(res0.statusCode, 200);
        t.deepEqual(
            res0.result.list.map(chart => chart.title),
            [`${prefix} 1`, `${prefix} 2`, `${prefix} 3`]
        );

        const res2 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            minLastEditStep: 2
        });
        t.is(res2.statusCode, 200);
        t.deepEqual(
            res2.result.list.map(chart => chart.title),
            [`${prefix} 2`, `${prefix} 3`]
        );

        const res4 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            minLastEditStep: 4
        });
        t.is(res4.statusCode, 200);
        t.is(res4.result.list.length, 0);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts paginates results', async t => {
    const prefix = genRandomChartPrefix();
    const charts = Array(10)
        .fill(null)
        .map((_, i) => ({
            id: genRandomChartId(),
            title: `${prefix} ${i}`,
            last_edit_step: 1,
            created_at: new Date(`2022-03-29T10:00:${59 - i}.000Z`),
            deleted: false
        }));
    try {
        await t.context.openSearchClient.index(charts);

        const resDefault = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all'
        });
        t.is(resDefault.statusCode, 200);
        t.is(resDefault.result.list.length, 10);
        t.is(resDefault.result.list[0].title, `${prefix} 0`);
        t.is(resDefault.result.list[9].title, `${prefix} 9`);

        const resPageDefault = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            limit: 4
        });
        t.is(resPageDefault.statusCode, 200);
        t.is(resPageDefault.result.list.length, 4);
        t.is(resPageDefault.result.list[0].title, `${prefix} 0`);
        t.is(resPageDefault.result.list[3].title, `${prefix} 3`);

        const resPage1 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            limit: 4,
            offset: 0
        });
        t.is(resPage1.statusCode, 200);
        t.is(resPage1.result.list.length, 4);
        t.is(resPage1.result.list[0].title, `${prefix} 0`);
        t.is(resPage1.result.list[3].title, `${prefix} 3`);

        const resPage2 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            limit: 4,
            offset: 4
        });
        t.is(resPage2.statusCode, 200);
        t.is(resPage2.result.list.length, 4);
        t.is(resPage2.result.list[0].title, `${prefix} 4`);
        t.is(resPage2.result.list[3].title, `${prefix} 7`);

        const resPage3 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            limit: 4,
            offset: 8
        });
        t.is(resPage3.statusCode, 200);
        t.is(resPage3.result.list.length, 2);
        t.is(resPage3.result.list[0].title, `${prefix} 8`);
        t.is(resPage3.result.list[1].title, `${prefix} 9`);

        const resPage4 = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all',
            limit: 4,
            offset: 12
        });
        t.is(resPage4.statusCode, 200);
        t.is(resPage4.result.list.length, 0);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts returns all expected chart properties', async t => {
    const chartId = genRandomChartId();
    const prefix = genRandomChartPrefix();

    let userObj = {};
    let charts;

    try {
        userObj = await createUser(t.context.server);
        charts = [
            {
                aria_description: 'test aria description',
                author_id: userObj.user.id,
                byline: 'test byline',
                created_at: new Date('2022-03-01T01:00:00.000Z'),
                custom_fields: {
                    test_field: 'test value'
                },
                deleted: false,
                id: chartId,
                in_folder: 654,
                intro: 'test intro',
                language: 'fr_FR',
                last_edit_step: 4,
                last_modified_at: new Date('2022-03-01T02:00:00.000Z'),
                notes: 'test notes',
                public_version: 5,
                published_at: new Date('2022-03-01T03:00:00.000Z'),
                source_name: 'test source name',
                source_url: 'https://www.example.com/test-source-url',
                team_id: 'test-team',
                theme: 'test-theme',
                title: `${prefix} test title`,
                type: 'test-chart-type'
            }
        ];

        await t.context.openSearchClient.index(charts);

        const res = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all'
        });
        t.is(res.statusCode, 200);
        t.is(res.result.list.length, 1);
        const { metadata, thumbnails, ...props } = res.result.list[0];
        t.deepEqual(props, {
            author: undefined,
            authorId: userObj.user.id,
            createdAt: new Date('2022-03-01T01:00:00.000Z'),
            folderId: 654,
            guestSession: undefined,
            id: chartId,
            language: 'fr_FR',
            lastEditStep: 4,
            lastModifiedAt: new Date('2022-03-01T02:00:00.000Z'),
            organizationId: 'test-team',
            publicId: chartId,
            publicVersion: 5,
            publishedAt: new Date('2022-03-01T03:00:00.000Z'),
            theme: 'test-theme',
            title: `${prefix} test title`,
            type: 'test-chart-type',
            url: `/v3/charts/${chartId}`
        });
        t.is(metadata.annotate.notes, 'test notes');
        t.deepEqual(metadata.custom, { test_field: 'test value' });
        t.is(metadata.describe['aria-description'], 'test aria description');
        t.is(metadata.describe.byline, 'test byline');
        t.is(metadata.describe.intro, 'test intro');
        t.is(metadata.describe['source-name'], 'test source name');
        t.is(metadata.describe['source-url'], 'https://www.example.com/test-source-url');
        t.regex(thumbnails.full, new RegExp(`preview/${chartId}/.+/full\\.png$`));
        t.regex(thumbnails.plain, new RegExp(`preview/${chartId}/.+/plain\\.png$`));
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});

test('GET /search/charts does not return deleted charts', async t => {
    const prefix = genRandomChartPrefix();
    const charts = [
        {
            id: genRandomChartId(),
            title: `${prefix} deleted`,
            created_at: new Date('2022-03-29T13:00:00.000Z'),
            deleted: true
        },
        {
            id: genRandomChartId(),
            title: `${prefix} not deleted`,
            created_at: new Date('2022-03-29T09:00:00.000Z'),
            deleted: false
        }
    ];
    try {
        await t.context.openSearchClient.index(charts);

        const res = await t.context.search(t.context.adminObj, {
            query: prefix,
            authorId: 'all'
        });
        t.is(res.statusCode, 200);
        t.is(res.result.list.length, 1);
        t.is(res.result.list[0].title, `${prefix} not deleted`);
    } finally {
        await t.context.openSearchClient.delete(charts);
    }
});
