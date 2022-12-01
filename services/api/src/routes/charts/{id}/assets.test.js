const test = require('ava');
const { Chart } = require('@datawrapper/orm/db');
const {
    createPublicChart,
    createUser,
    destroy,
    genRandomChartId,
    setup
} = require('../../../../test/helpers/setup');

async function getAsset(server, headers, chart, asset) {
    return server.inject({
        method: 'GET',
        headers,
        url: `/v3/charts/${chart.id}/assets/${asset}`
    });
}

async function putAsset(server, headers, chart, asset, data, contentType = 'text/csv') {
    return server.inject({
        method: 'PUT',
        headers: {
            ...headers,
            'Content-Type': contentType
        },
        url: `/v3/charts/${chart.id}/assets/${asset}`,
        payload: data
    });
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server);
    t.context.headers = {
        cookie: `DW-SESSION=${t.context.userObj.session.id}; crumb=abc`,
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('User can write chart asset with almost 2MB', async t => {
    let chart;
    try {
        // create a new chart
        let res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: t.context.headers,
            payload: {}
        });
        chart = res.result;

        const bytes = Math.floor(1.99 * 1024 * 1024);
        let big = '';
        while (big.length < bytes) {
            big += Math.round(Math.random() * 32).toString(32);
        }

        // write some big JSON
        res = await putAsset(
            t.context.server,
            t.context.headers,
            chart,
            `${chart.id}.map.json`,
            { data: big },
            'application/json'
        );
        t.is(res.statusCode, 204);
        // see if that worked
        res = await getAsset(t.context.server, t.context.headers, chart, `${chart.id}.map.json`);
        t.is(res.statusCode, 200);
        const dataLength = JSON.parse(res.result).data.length;
        t.true(dataLength === bytes || dataLength === bytes + 1);
        t.is(res.headers['content-type'], 'application/json; charset=utf-8');
        t.is(res.headers['content-disposition'], `attachment; filename=${chart.id}.map.json`);

        // try writing some oversize JSON
        res = await putAsset(
            t.context.server,
            t.context.headers,
            chart,
            `${chart.id}.map.json`,
            { data: big + big },
            'application/json'
        );
        // that should not work
        t.is(res.statusCode, 413);
    } finally {
        if (chart) {
            await Chart.destroy({ where: { id: chart.id } });
        }
    }
});

test('Public asset can be read', async t => {
    let chartId;
    try {
        // create a new chart
        let res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: t.context.headers,
            payload: {}
        });
        const chart = res.result;
        chartId = chart.id;

        const asset = `X1,X2
10,20`;

        res = await putAsset(t.context.server, t.context.headers, chart, `${chart.id}.csv`, asset);
        t.is(res.statusCode, 204);

        // see if that worked
        res = await getAsset(t.context.server, t.context.headers, chart, `${chart.id}.csv`);
        t.is(res.statusCode, 200);
        t.is(res.result, asset);
        t.is(res.headers['content-type'], 'text/csv; charset=utf-8');
        t.is(res.headers['content-disposition'], `attachment; filename=${chart.id}.csv`);

        // publish chart
        await t.context.server.inject({
            method: 'POST',
            headers: t.context.headers,
            url: `/v3/charts/${chart.id}/publish`
        });

        // unauthenticated user can read public asset
        const unauthenticatedHeaders = {
            cookie: `crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        };

        const publicAsset = await t.context.server.inject({
            method: 'GET',
            headers: unauthenticatedHeaders,
            url: `/v3/charts/${chart.id}/assets/${chart.id}.public.csv`
        });
        t.is(publicAsset.statusCode, 200);

        const nonPublicAsset = await t.context.server.inject({
            method: 'GET',
            headers: unauthenticatedHeaders,
            url: `/v3/charts/${chart.id}/assets/${chart.id}.csv`
        });
        t.is(nonPublicAsset.statusCode, 403);
    } finally {
        if (chartId) {
            const chart = await Chart.findByPk(chartId);
            await destroy(chart);
        }
    }
});

test('GET /charts/{id}/assets/{asset} returns error 400 when the asset is not in the whitelist', async t => {
    let chartId;
    try {
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: t.context.headers,
            payload: {}
        });
        chartId = res.result.id;

        const resAsset = await t.context.server.inject({
            method: 'GET',
            headers: t.context.headers,
            url: `/v3/charts/${chartId}/assets/SPAM`
        });
        t.is(resAsset.statusCode, 400);
    } finally {
        if (chartId) {
            const chart = await Chart.findByPk(chartId);
            await destroy(chart);
        }
    }
});

test('GET /charts/{id}/assets/{asset} returns error 404 when the asset was not found', async t => {
    let chartId;
    try {
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: t.context.headers,
            payload: {}
        });
        chartId = res.result.id;

        const resAsset = await t.context.server.inject({
            method: 'GET',
            headers: t.context.headers,
            url: `/v3/charts/${chartId}/assets/${chartId}.metadata.json`
        });
        t.is(resAsset.statusCode, 404);
    } finally {
        if (chartId) {
            const chart = await Chart.findByPk(chartId);
            await destroy(chart);
        }
    }
});

test('GET /charts/{id}/assets/{asset} returns error 404 when trying to get a public asset using chart id that has wrong case', async t => {
    let chart;
    try {
        const chartIdPrefix = genRandomChartId().slice(0, 4);
        const chartId = chartIdPrefix + 'a';
        const chartIdDifferentCase = chartIdPrefix + 'A';
        chart = await createPublicChart({
            id: chartId,
            author_id: t.context.userObj.user.id
        });
        await putAsset(
            t.context.server,
            t.context.headers,
            chart,
            `${chart.id}.public.csv`,
            'FOO\nBAR'
        );

        const resAsset = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chartId}/assets/${chartId}.public.csv`
        });
        t.is(resAsset.statusCode, 200);
        t.is(resAsset.result, 'FOO\nBAR');

        const resAssetDifferentCase = await t.context.server.inject({
            method: 'GET',
            url: `/v3/charts/${chartIdDifferentCase}/assets/${chartIdDifferentCase}.public.csv`
        });
        t.is(resAssetDifferentCase.statusCode, 404);
    } finally {
        await destroy(chart);
    }
});
