const test = require('ava');
const { createUser, destroy, setup } = require('../../../test/helpers/setup');

const QUEUE_NAME = 'test';

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test('POST /v3/worker/queues/{queueName}/jobs succeeds when scheduling a job in the test queue', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin' });
        const { session } = adminObj;

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/worker/queues/${QUEUE_NAME}/jobs`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                name: 'hello',
                payload: {
                    name: 'Ada'
                }
            }
        });

        t.is(res.statusCode, 200);
    } finally {
        await destroy(...Object.values(adminObj));
    }
});

test('POST /v3/worker/queues/{queueName}/jobs returns error 401 when the user is not admin', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/worker/queues/${QUEUE_NAME}/jobs`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                name: 'hello',
                payload: {
                    name: 'Ada'
                }
            }
        });

        t.is(res.statusCode, 401);
    } finally {
        await destroy(...Object.values(userObj));
    }
});

test('GET /v3/worker/health returns a report for the test queue', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin' });
        const { session } = adminObj;

        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/worker/health',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 555); // The health check fails, because no workers are connected to the queue.
        t.deepEqual(res.result, {
            [QUEUE_NAME]: {
                connected: true,
                numWorkers: 0,
                paused: false
            }
        });
    } finally {
        await destroy(...Object.values(adminObj));
    }
});

test('GET /v3/worker/health returns error 401 when the user is not admin', async t => {
    let userObj = {};
    try {
        userObj = await createUser(t.context.server);
        const { session } = userObj;

        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/worker/health',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 401);
    } finally {
        await destroy(...Object.values(userObj));
    }
});
