const test = require('ava');
const { createSession, setup, withUser, withTeamWithUser } = require('../../../test/helpers/setup');
const { createAuth } = require('@datawrapper/service-utils');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    const { legacyHash } = createAuth(require('@datawrapper/orm/models'));
    t.context.legacyHash = legacyHash;
});

test('User cannot change password without old password', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const patchMe = async payload =>
            t.context.server.inject({
                method: 'PATCH',
                url: '/v3/me',
                headers: {
                    cookie: `DW-SESSION=${session.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost'
                },
                payload
            });

        const oldPwdHash = user.pwd;
        // try to change without password
        let res = await patchMe({ password: 'new-password' });
        t.is(res.statusCode, 403);

        // check that password hash is still the same
        await user.reload();
        t.is(user.pwd, oldPwdHash);

        // try to change with false password
        res = await patchMe({ password: 'new-password', oldPassword: 'I dont know' });
        t.is(res.statusCode, 403);

        // check that password hash is still the same
        await user.reload();
        t.is(user.pwd, oldPwdHash);

        // try to change with correct password
        res = await patchMe({ password: 'new-password', oldPassword: 'test-password' });
        t.is(res.statusCode, 200);

        // check that password hash is still the same
        await user.reload();
        t.not(user.pwd, oldPwdHash);
    });
});

test('User cannot change password without old password (legacy)', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const { legacyHash, server } = t.context;
        const { authSalt, secretAuthSalt } = server.methods.config('api');

        const patchMe = async payload =>
            t.context.server.inject({
                method: 'PATCH',
                url: '/v3/me',
                headers: {
                    cookie: `DW-SESSION=${session.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost'
                },
                payload
            });

        // try the same with legacy login (tests have secret salt configured)
        let legacyPwd = legacyHash('legacy-password', authSalt);
        if (secretAuthSalt) legacyPwd = legacyHash(legacyPwd, secretAuthSalt);
        await user.update({ pwd: legacyPwd });

        // test is changing password also works with legacy hashes
        let res = await patchMe({
            password: 'new-password',
            oldPassword: 'wrong-legacy-password'
        });
        t.is(res.statusCode, 403);

        res = await patchMe({ password: 'new-password', oldPassword: 'legacy-password' });
        t.is(res.statusCode, 200);
    });
});

test('Password change leads to invalidation of all sessions', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const { Session } = require('@datawrapper/orm/models');

        // create some more sessions for the user
        await createSession(t.context.server, user);
        await createSession(t.context.server, user);

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: { password: 'new-password', oldPassword: 'test-password' }
        });
        t.is(res.statusCode, 200);

        // all sessions have been deleted
        const sessions = await Session.findAll({ where: { user_id: user.id } });
        t.is(sessions.length, 0);
    });
});

test('User can delete their account and are logged out', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const res1 = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                email: user.email,
                password: 'test-password'
            }
        });

        t.is(res1.statusCode, 204);

        const res2 = await t.context.server.inject({
            method: 'GET',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res2.statusCode, 401);
    });
});

test('User cannot delete their account while owning team', async t => {
    const options = { role: 'owner' };
    return withTeamWithUser(t.context.server, options, async ({ session, team, user }) => {
        const res1 = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                email: user.email,
                password: 'test-password'
            }
        });

        t.is(res1.statusCode, 409);

        const res2 = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/teams/${team.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res2.statusCode, 204);

        const res3 = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                email: user.email,
                password: 'test-password'
            }
        });

        t.is(res3.statusCode, 204);
    });
});

test('User can delete their account if only admin of a team', async t => {
    return withTeamWithUser(t.context.server, { role: 'admin' }, async ({ session, user }) => {
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                email: user.email,
                password: 'test-password'
            }
        });

        t.is(res.statusCode, 204);
    });
});

test('User can set their name to valid characters', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const name = 'François T. 张伟 Ἁγνή-Æðelwine 🥶';

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                name
            }
        });

        t.is(res.statusCode, 200);
        await user.reload();
        t.is(user.name, name);
    });
});

test('User cannot set their name to invalid characters', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const oldUserName = user.name;

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                name: 'admin@datawrapper.de'
            }
        });

        t.is(res.statusCode, 400);
        await user.reload();
        t.is(user.name, oldUserName);
    });
});

test('A guest user can update their language', async t => {
    const userOptions = {
        role: 'guest',
        scopes: ['user:read', 'user:write']
    };
    return withUser(t.context.server, userOptions, async ({ session }) => {
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                language: 'de-DE'
            }
        });

        t.is(res.statusCode, 200);
        t.is(res.result.language, 'de-DE');
    });
});

test('A guest user cannot update their language to an invalid language', async t => {
    const userOptions = {
        role: 'guest',
        scopes: ['user:read', 'user:write']
    };
    return withUser(t.context.server, userOptions, async ({ session }) => {
        const res = await t.context.server.inject({
            method: 'PATCH',
            url: '/v3/me',
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            },
            payload: {
                language: 'Klingon'
            }
        });

        t.is(res.statusCode, 400);
    });
});
