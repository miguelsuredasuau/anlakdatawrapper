const test = require('ava');
const {
    BASE_URL,
    createUser,
    destroy,
    setup,
    createChart,
    createTeam
} = require('../../../../test/helpers/setup');
const fetch = require('node-fetch');

async function getData(server, session, chart) {
    return server.inject({
        method: 'GET',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        },
        url: `/v3/charts/${chart.id}/data`
    });
}

async function getAsset(server, session, chart, asset) {
    return server.inject({
        method: 'GET',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        },
        url: `/v3/charts/${chart.id}/assets/${asset}`
    });
}

async function putData(server, session, chart, data, contentType = 'text/csv') {
    return server.inject({
        method: 'PUT',
        headers: {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost',
            'Content-Type': contentType
        },
        url: `/v3/charts/${chart.id}/data`,
        payload: data
    });
}

async function putAsset(server, session, chart, asset, data, contentType = 'text/csv') {
    return server.inject({
        method: 'PUT',
        headers: {
            cookie: `DW-SESSION=${session.id}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost',
            'Content-Type': contentType
        },
        url: `/v3/charts/${chart.id}/assets/${asset}`,
        payload: data
    });
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server, { role: 'admin' });
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.userObj.session,
        artifacts: t.context.userObj.user
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('User can read and write chart data', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        // create a new chart
        let res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/charts',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {}
        });
        const chart = res.result;

        // chart data is missing by default
        res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.is(res.result, ' ');
        // set chart data
        res = await putData(t.context.server, session, chart, 'hello world');
        t.is(res.statusCode, 204);
        // confirm chart data was set
        res = await getData(t.context.server, session, chart);
        t.is(res.statusCode, 200);
        t.is(res.result, 'hello world');
        // check if data is written to asset, too
        res = await getAsset(t.context.server, session, chart, `${chart.id}.csv`);
        t.is(res.statusCode, 200);
        t.is(res.result, 'hello world');
        // make sure we can't access data for a different chart id
        res = await getAsset(t.context.server, session, chart, `00000.csv`);
        t.is(res.statusCode, 400);
        // write some JSON to another asset
        res = await putAsset(
            t.context.server,
            session,
            chart,
            `${chart.id}.map.json`,
            { answer: 42 },
            'application/json'
        );
        t.is(res.statusCode, 204);
        // see if that worked
        res = await getAsset(t.context.server, session, chart, `${chart.id}.map.json`);
        t.is(res.statusCode, 200);
        t.is(JSON.parse(res.result).answer, 42);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('PHP GET /charts/{id}/data returns chart data', async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        t.assert(res.headers.get('content-type').includes('text/csv'));
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test("PHP GET /charts/{id}/data returns an error if user does not have scope 'chart:read'", async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['scope:invalid'] });
        chart = await createChart({
            author_id: userObj.user.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 403);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'access-denied');
    } finally {
        await destroy(chart, Object.values(userObj));
    }
});

test('PHP GET /charts/{id}/data returns an error if chart does not exist', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        const res = await fetch(`${BASE_URL}/charts/00000/data`, {
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(res.status, 200);
        const json = await res.json();
        t.is(json.status, 'error');
        t.is(json.code, 'no-such-chart');
    } finally {
        await destroy(Object.values(userObj));
    }
});
test('PHP GET /charts/{id}/data returns an error if user does not have access to chart', async t => {
    let userObj = {};
    let chart;
    let team;
    try {
        userObj = await createUser(t.context.server, { role: 'editor', scopes: ['chart:read'] });
        team = await createTeam();
        chart = await createChart({
            organization_id: team.id
        });
        const res = await fetch(`${BASE_URL}/charts/${chart.id}/data`, {
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
        await destroy(chart, team, Object.values(userObj));
    }
});
