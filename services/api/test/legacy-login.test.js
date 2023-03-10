const test = require('ava');
const { createUser, destroy, setup } = require('./helpers/setup');

const USER_PASSWORD = 'legacy';
/**
 * USER_PASSWORD -> legacyHash(USER_PASSWORD, DEFAULT_SALT) ->
 * CLIENT_HAST
 */
const CLIENT_HASH = '9574e9327ce73d61c8f5ffdc710e5c21cb07fcb3bef9ce4d892b88e6ad0ee107';
/**
 * USER_PASSWORD -> legacyHash(USER_PASSWORD, DEFAULT_SALT) ->
 * output -> legacyHash(output, SECRET_AUTH_SALT) ->
 * LEGACY_HASH
 */
const LEGACY_HASH = 'd51315c3623087d1c4378927b87b80e8e1a3216eb3976a4752e008fe82aff176';

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
});

test.beforeEach(async t => {
    t.context.userObj = await createUser(t.context.server, { pwd: LEGACY_HASH });
    t.context.userEmail = t.context.userObj.user.email;
});

test.afterEach.always(async t => {
    await destroy(...Object.values(t.context.userObj));
});

test('Client hashed password', async t => {
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: CLIENT_HASH
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);
});

test('Non hashed password', async t => {
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: USER_PASSWORD
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);
});

test('Migrate client hashed password to new hash', async t => {
    let res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: CLIENT_HASH
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: USER_PASSWORD
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);
});

test('Migrate password to new hash', async t => {
    let res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: USER_PASSWORD
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);

    res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/auth/login',
        headers: {
            cookie: 'crumb=abc',
            'X-CSRF-Token': 'abc',
            referer: 'http://localhost'
        },
        payload: {
            email: t.context.userEmail,
            password: USER_PASSWORD
        }
    });

    t.truthy(res.result['DW-SESSION']);
    t.is(res.statusCode, 200);
});
