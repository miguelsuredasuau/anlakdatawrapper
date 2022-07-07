const test = require('ava');
const { setup } = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test('Can create guest sessions', async t => {
    let res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/session'
    });
    const sessionId = res.result['DW-SESSION'];
    t.truthy(sessionId);
    t.truthy(res.headers['set-cookie'].find(s => s.includes(`DW-SESSION=${sessionId}`)));

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/session',
        headers: {
            cookie: `DW-SESSION=${sessionId}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        }
    });

    t.is(sessionId, res.result['DW-SESSION']);

    await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/logout',
        headers: {
            cookie: `DW-SESSION=${sessionId}; crumb=abc`,
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        }
    });
});

test('Guest session artifacts are valid user model instances', async t => {
    const resSession = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/session'
    });
    const sessionId = resSession.result['DW-SESSION'];
    t.truthy(sessionId);

    const resMe = await t.context.server.inject({
        method: 'GET',
        url: '/v3/me',
        headers: {
            cookie: `DW-SESSION=${sessionId}`
        }
    });
    t.is(resMe.result.role, 'guest');
    const user = resMe.request.auth.artifacts;

    t.is(user.id, null);
    t.is(user.role, 'guest');
    t.is(user.get('language'), 'en-US');
    t.is(user.isActivated(), false);
    t.is(user.isAdmin(), false);
    t.is(user.save(), false);
});
