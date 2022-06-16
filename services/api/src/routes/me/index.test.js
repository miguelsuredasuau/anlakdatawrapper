const test = require('ava');
const {
    createTeamWithUser,
    createUser,
    destroy,
    setup,
    createSession
} = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.legacyHash = require('@datawrapper/service-utils/auth')(
        require('@datawrapper/orm')
    ).legacyHash;
});

test('User cannot change password without old password', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session, user } = userObj;

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
        t.is(res.statusCode, 401);

        // check that password hash is still the same
        await user.reload();
        t.is(user.pwd, oldPwdHash);

        // try to change with false password
        res = await patchMe({ password: 'new-password', oldPassword: 'I dont know' });
        t.is(res.statusCode, 401);

        // check that password hash is still the same
        await user.reload();
        t.is(user.pwd, oldPwdHash);

        // try to change with correct password
        res = await patchMe({ password: 'new-password', oldPassword: 'test-password' });
        t.is(res.statusCode, 200);

        // check that password hash is still the same
        await user.reload();
        t.not(user.pwd, oldPwdHash);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('User cannot change password without old password (legacy)', async t => {
    const { legacyHash, server } = t.context;
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { authSalt, secretAuthSalt } = server.methods.config('api');
        const { session, user } = userObj;

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
        t.is(res.statusCode, 401);

        res = await patchMe({ password: 'new-password', oldPassword: 'legacy-password' });
        t.is(res.statusCode, 200);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('Password change leads to invalidation of all sessions', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { session, user } = userObj;
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
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('User can delete their account and are logged out', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { user, session } = userObj;

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
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('User cannot delete their account while owning team', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'owner' });
        const { user, team, session } = teamObj;

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
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('User can delete their account if only admin of a team', async t => {
    let teamObj;
    try {
        teamObj = await createTeamWithUser(t.context.server, { role: 'admin' });
        const { user, session } = teamObj;

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
    } finally {
        if (teamObj) {
            await destroy(...Object.values(teamObj));
        }
    }
});

test('User can set their name to valid characters', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { user, session } = userObj;
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
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('User cannot set their name to invalid characters', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const { user, session } = userObj;
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
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});
