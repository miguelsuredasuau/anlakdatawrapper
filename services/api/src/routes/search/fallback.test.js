const sinon = require('sinon');
const test = require('ava');
const { createChart, createUser, destroy, setup } = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });

    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };

    const configStub = sinon.stub(t.context.server.methods, 'config');
    configStub.callThrough();
    configStub.withArgs('opensearch').returns(undefined);
});

test('GET /search/charts uses GET /charts if OpenSearch is not configured', async t => {
    let userObj = {};
    let chart;
    try {
        userObj = await createUser(t.context.server);
        chart = await createChart({ title: 'test' });

        const query = 'test';
        const orderBy = 'authorId';
        const order = 'ASC';
        const limit = '10';
        const offset = '5';
        const serverSpy = sinon.spy(t.context.server, 'inject');
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/search/charts?query=${query}&orderBy=${orderBy}&order=${order}&limit=${limit}&offset=${offset}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${userObj.token}`
            }
        });
        t.is(serverSpy.callCount, 2);
        const callArg = serverSpy.secondCall.args[0];
        t.is(
            callArg.url,
            `/v3/charts?search=${query}&orderBy=${orderBy}&order=${order}&limit=${limit}&offset=${offset}`
        );
        t.is(callArg.method, 'GET');
        t.is(res.statusCode, 200);
    } finally {
        await destroy(chart, ...Object.values(userObj));
    }
});
