const test = require('ava');
const { createChart, createUser, destroy, setup } = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server, { role: 'admin' });
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
    const resChart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            metadata: {
                foo: 'Unpublished chart'
            }
        }
    });
    t.context.chart = resChart.result;

    const resPublicChart = await t.context.server.inject({
        method: 'POST',
        url: '/v3/charts',
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            metadata: {
                foo: 'Published version'
            }
        }
    });
    t.context.publicChart = resPublicChart.result;

    await t.context.server.inject({
        method: 'POST',
        url: `/v3/charts/${t.context.publicChart.id}/publish`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    await t.context.server.inject({
        method: 'PUT',
        url: `/v3/charts/${t.context.publicChart.id}`,
        auth: t.context.auth,
        headers: t.context.headers,
        payload: {
            metadata: {
                foo: 'New version'
            }
        }
    });
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj), t.context.publicChart, t.context.chart);
});

test('GET /charts/{id}/publish/data returns the default dataset', async t => {
    const { chart } = t.context;
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.id}/publish/data`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    t.is(res.statusCode, 200);
    t.deepEqual(res.result.assets, [
        {
            name: 'dataset.csv',
            shared: false,
            value: null
        }
    ]);
});

test('GET /charts/{id}/publish/data returns the uploaded dataset', async t => {
    let chart;
    try {
        chart = await createChart();

        await t.context.server.inject({
            method: 'PUT',
            url: `/v3/charts/${chart.id}/data`,
            auth: t.context.auth,
            headers: {
                ...t.context.headers,
                'Content-Type': 'text/csv'
            },
            payload: `foo,1
bar,2
`
        });

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/publish/data`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);
        t.deepEqual(res.result.assets, [
            {
                name: 'dataset.csv',
                shared: false,
                value: `foo,1
bar,2
`
            }
        ]);
    } finally {
        await destroy(chart);
    }
});

test('GET /charts/{id}/publish/data returns an empty dataset', async t => {
    let chart;
    try {
        chart = await createChart();

        const { server } = t.context;
        const { event, events } = server.app;
        await events.emit(
            event.PUT_CHART_ASSET,
            {
                chart: await server.methods.loadChart(chart.id),
                data: '',
                filename: `${chart.id}.csv`
            },
            { filter: 'first' }
        );

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/publish/data`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);
        t.deepEqual(res.result.assets, [
            {
                name: 'dataset.csv',
                shared: false,
                value: ''
            }
        ]);
    } finally {
        await destroy(chart);
    }
});

test('GET /charts/{id}/publish/data returns the latest data of an unpublished chart', async t => {
    const { chart } = t.context;
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.id}/publish/data`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    t.is(res.statusCode, 200);
    t.is(res.result.chart.metadata.foo, 'Unpublished chart');
});

test('GET /charts/{id}/publish/data returns the latest data of a published chart', async t => {
    const { publicChart } = t.context;
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${publicChart.id}/publish/data`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    t.is(res.statusCode, 200);
    t.is(res.result.chart.metadata.foo, 'New version');
});

test('GET /charts/{id}/publish/data returns the last published data when published=true', async t => {
    const { publicChart } = t.context;
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${publicChart.id}/publish/data?published=true`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    t.is(res.statusCode, 200);
    t.is(res.result.chart.metadata.foo, 'Published version');
});

test('GET /charts/{id}/publish/data returns error 404 for unpublished chart when published=true', async t => {
    const { chart } = t.context;
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.id}/publish/data?published=true`,
        auth: t.context.auth,
        headers: t.context.headers
    });
    t.is(res.statusCode, 404);
});

test('GET /charts/{id}/publish/data returns error 403 when the scope is insufficient', async t => {
    const { publicChart } = t.context;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:read', 'theme:read', 'visualization:read']
        });
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${publicChart.id}/publish/data?published=true`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(Object.values(userObj));
    }
});

test('GET /charts/{id}/publish/data returns error 401 for unpublished chart when requested as another user', async t => {
    const { chart } = t.context;
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/publish/data`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`
            }
        });
        t.is(res.statusCode, 401);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('GET /charts/{id}/publish/data returns the data when requested as another user with ott', async t => {
    const { chart } = t.context;
    const { ChartAccessToken } = require('@datawrapper/orm/models');
    const token = 'test-token';
    await ChartAccessToken.create({
        chart_id: chart.id,
        token
    });
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        const resWrong = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/publish/data?ott=spam`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`
            }
        });
        t.is(resWrong.statusCode, 401);

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/publish/data?ott=${token}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`
            }
        });
        t.is(res.statusCode, 200);
        t.is(res.result.chart.metadata.foo, 'Unpublished chart');
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('POST /charts/{id}/publish updates chart properties', async t => {
    const { chart } = t.context;

    const prePublicationDate = new Date();
    prePublicationDate.setMilliseconds(0);

    let res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.id}`,
        auth: t.context.auth,
        headers: t.context.headers
    });

    t.is(res.statusCode, 200);
    t.falsy(res.result.publicVersion);
    t.falsy(res.result.lastEditStep);
    t.falsy(res.result.publishedAt);

    res = await t.context.server.inject({
        method: 'POST',
        url: `/v3/charts/${chart.id}/publish`,
        auth: t.context.auth,
        headers: t.context.headers
    });

    t.is(res.statusCode, 200);

    res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/charts/${chart.id}`,
        auth: t.context.auth,
        headers: t.context.headers
    });

    t.is(res.statusCode, 200);
    t.is(res.result.publicVersion, 1);
    t.is(res.result.lastEditStep, 5);
    t.is(new Date(res.result.publishedAt) >= prePublicationDate, true);
});

test('POST /charts/{id}/publish updates keywords', async t => {
    let chart;
    const { userObj } = t.context;
    const { Chart, ChartPublic } = require('@datawrapper/orm/models');
    try {
        chart = await createChart({
            title: 'Hello world',
            metadata: {
                describe: {
                    intro: 'Apple',
                    byline: 'Strawberry'
                }
            },
            author_id: userObj.user.id
        });

        const ormChart = await Chart.findByPk(chart.id);

        t.true(ormChart.keywords.includes('apple'));
        t.true(ormChart.keywords.includes('strawberry'));

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });

        t.is(res.statusCode, 200);

        const ormChartPublic = await ChartPublic.findByPk(chart.id);

        t.is(ormChartPublic.title, 'Hello world');
        t.true(ormChartPublic.keywords.includes('apple'));
        t.true(ormChartPublic.keywords.includes('strawberry'));
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish updates embed codes', async t => {
    let chart;
    const { userObj } = t.context;
    const { ChartPublic } = require('@datawrapper/orm/models');
    try {
        chart = await createChart({ author_id: userObj.user.id });

        t.is(chart.metadata.publish?.['embed-codes']?.['embed-method-iframe'], undefined);
        t.is(chart.metadata.publish?.['embed-codes']?.['embed-method-responsive'], undefined);

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });

        t.is(res.statusCode, 200);

        const ormChartPublic = await ChartPublic.findByPk(chart.id);

        t.truthy(ormChartPublic.metadata.publish['embed-codes']['embed-method-iframe']);
        t.truthy(ormChartPublic.metadata.publish['embed-codes']['embed-method-responsive']);
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish publishes a chart with an empty dataset', async t => {
    let chart;
    try {
        chart = await createChart();

        const { server } = t.context;
        const { event, events } = server.app;
        await events.emit(
            event.PUT_CHART_ASSET,
            {
                chart: await server.methods.loadChart(chart.id),
                data: '',
                filename: `${chart.id}.csv`
            },
            { filter: 'first' }
        );

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);

        const resAsset = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/assets/${chart.id}.public.csv`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resAsset.statusCode, 200);
        t.is(resAsset.result, '');
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish publishes a chart with an invalid JSON dataset', async t => {
    let chart;
    try {
        chart = await createChart({
            metadata: {
                axes: [],
                describe: {},
                visualize: {},
                annotate: {},
                data: {
                    json: true
                }
            }
        });

        const { server } = t.context;
        const { event, events } = server.app;
        await events.emit(
            event.PUT_CHART_ASSET,
            {
                chart: await server.methods.loadChart(chart.id),
                data: 'invalid json',
                filename: `${chart.id}.csv`
            },
            { filter: 'first' }
        );

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 200);

        // Check that the invalid JSON asset was really used.
        const resAsset = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chart.id}/assets/${chart.id}.public.csv`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(resAsset.statusCode, 200);
        t.is(resAsset.result, 'invalid json');
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish returns error 400 when trying to publish chart with invalid type', async t => {
    let chart;
    try {
        chart = await createChart({ type: 'spam' });
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish returns error 400 when trying to publish chart with nonexistent theme', async t => {
    let chart;
    try {
        chart = await createChart({ theme: 'spam' });
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish returns error 502 when the GET_PUBLIC_URL event fails', async t => {
    const { server } = t.context;

    let chart;
    try {
        chart = await createChart();

        server.app.events.on(server.app.event.GET_PUBLIC_URL, arg => {
            if (arg.chart.id == chart.id) {
                throw new Error('Test GET_PUBLIC_URL error');
            }
        });

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });

        t.is(res.statusCode, 502);
    } finally {
        await destroy(chart);
    }
});

test('POST /charts/{id}/publish returns error 502 when the PUBLISH_CHART event fails', async t => {
    const { server } = t.context;

    let chart;
    try {
        chart = await createChart();

        server.app.events.on(server.app.event.PUBLISH_CHART, arg => {
            if (arg.chart.id == chart.id) {
                throw new Error('Test PUBLISH_CHART error');
            }
        });

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            auth: t.context.auth,
            headers: t.context.headers
        });

        t.is(res.statusCode, 502);
    } finally {
        await destroy(chart);
    }
});

test('GET /charts/{id}/publish returns error 403 when the scope is insufficient', async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, {
            role: 'editor',
            scopes: ['chart:read', 'theme:read', 'visualization:read']
        });
        chart = await createChart({ author_id: userObj.user.id });
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/charts/${chart.id}/publish`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});
