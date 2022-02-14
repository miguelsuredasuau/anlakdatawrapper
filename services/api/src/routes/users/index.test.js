const test = require('ava');
const sortBy = require('lodash/sortBy');
const {
    addUserToTeam,
    createChart,
    createTeam,
    createUser,
    destroy,
    getCredentials,
    setup
} = require('../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server);
    t.context.adminObj = await createUser(t.context.server, { role: 'admin' });
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj), ...Object.values(t.context.adminObj));
});

test('It should be possible to create a user, login and logout', async t => {
    let userId;
    try {
        const credentials = getCredentials();

        /* create user with email and some data */
        let res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/users',
            headers: t.context.headers,
            payload: { ...credentials, language: 'de-DE' }
        });

        t.log('User created', res.result.email);
        userId = res.result.id;

        t.is(res.statusCode, 201);
        t.is(res.result.email, credentials.email);
        t.is(res.result.language, 'de-DE');

        /* login as newly created user */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/login',
            headers: t.context.headers,
            payload: credentials
        });

        t.log('Logged in', credentials.email);

        const session = res.result['DW-SESSION'];
        const cookieString = `DW-SESSION=${session}`;
        t.is(typeof session, 'string');
        t.is(res.statusCode, 200);
        t.true(res.headers['set-cookie'].join().includes(cookieString));

        /* logout */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/logout',
            headers: {
                cookie: `${cookieString}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.log('Logged out', credentials.email);

        t.is(res.statusCode, 205);
        t.false(res.headers['set-cookie'].join().includes(cookieString));
    } finally {
        if (userId) {
            const { User } = require('@datawrapper/orm/models');
            const user = await User.findByPk(userId);
            await destroy(user);
        }
    }
});

test('New user passwords should be saved as bcrypt hash', async t => {
    const { User } = require('@datawrapper/orm/models');
    let userId;
    try {
        const credentials = getCredentials();

        /* create user with email and some data */
        const { result } = await t.context.server.inject({
            method: 'POST',
            url: '/v3/users',
            headers: t.context.headers,
            payload: { ...credentials, language: 'de-DE' }
        });

        t.log('User created', result.email);

        const user = await User.findByPk(result.id, { attributes: ['pwd'] });

        t.is(user.pwd.slice(0, 2), '$2');

        userId = result.id;
    } finally {
        if (userId) {
            const user = await User.findByPk(userId);
            await destroy(user);
        }
    }
});

test("New users can't set their role to admin", async t => {
    const { User } = require('@datawrapper/orm/models');
    let userId;
    try {
        const credentials = getCredentials();

        /* create user with email and some data */
        const { result } = await t.context.server.inject({
            method: 'POST',
            url: '/v3/users',
            headers: t.context.headers,
            payload: { ...credentials, role: 'admin' }
        });

        t.log('User created', result.email);

        const user = await User.findByPk(result.id, { attributes: ['role'] });

        t.is(user.role, 'pending');
        userId = result.id;
    } finally {
        if (userId) {
            const user = await User.findByPk(userId);
            await destroy(user);
        }
    }
});

test("New users can't set protected fields", async t => {
    const credentials = getCredentials();

    const fields = {
        id: 123455789,
        activateToken: '12345',
        deleted: true,
        resetPasswordToken: '12345',
        customerId: 12345,
        oauthSignin: 'blub'
    };

    /* create user with email and some data */
    const { result, statusCode } = await t.context.server.inject({
        method: 'POST',
        url: '/v3/users',
        headers: t.context.headers,
        payload: { ...credentials, ...fields }
    });

    t.log(result.message);
    t.is(statusCode, 400);
});

test('Users see only their user excluding private fields', async t => {
    let chart;
    let team;
    let userObj = {};
    try {
        userObj = await createUser(t.context.server, {
            language: 'de-DE',
            activate_token: 'foo',
            reset_password_token: 'bar'
        });
        const { session, user } = userObj;
        team = await createTeam();
        await addUserToTeam(user, team);
        chart = await createChart({ author_id: userObj.user.id });

        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/users',
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.statusCode, 200);
        t.is(res.result.total, 1);
        t.is(res.result.list.length, 1);
        const row = res.result.list[0];
        t.deepEqual(row, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'editor',
            language: 'de-DE',
            chartCount: 1,
            url: `/v3/users/${user.id}`,
            teams: [
                {
                    id: team.id,
                    name: team.name,
                    url: `/v3/teams/${team.id}`
                }
            ]
        });
    } finally {
        await destroy(chart, team, ...Object.values(userObj));
    }
});

test('Admin sees all users including private fields', async t => {
    let chart;
    let team;
    let userObj = {};
    try {
        const { session } = t.context.adminObj;

        userObj = await createUser(t.context.server, {
            language: 'de-DE',
            activate_token: 'foo',
            reset_password_token: 'bar'
        });
        const { user } = userObj;
        team = await createTeam();
        await addUserToTeam(user, team);
        chart = await createChart({ author_id: userObj.user.id });

        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/users?orderBy=id&order=desc',
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.statusCode, 200);
        t.true(res.result.total > 1);
        t.true(res.result.list.length > 1);
        const row = res.result.list.find(x => x.email === user.email);
        const { createdAt, ...data } = row;
        t.deepEqual(data, {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'editor',
            language: 'de-DE',
            chartCount: 1,
            url: `/v3/users/${user.id}`,
            teams: [
                {
                    id: team.id,
                    name: team.name,
                    url: `/v3/teams/${team.id}`
                }
            ],
            activateToken: 'foo',
            resetPasswordToken: 'bar'
        });
        t.truthy(createdAt);
    } finally {
        await destroy(chart, team, ...Object.values(userObj));
    }
});

test('Admin can sort users by creation date - Ascending', async t => {
    const { session } = t.context.adminObj;

    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/users?orderBy=createdAt&order=ASC',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 200);
    const sortedDates = sortBy(res.result.list.map(d => d.createdAt));
    t.deepEqual(
        res.result.list.map(d => d.createdAt),
        sortedDates
    );
});

test('Admin can sort users by creation date - Descending', async t => {
    const { session } = t.context.adminObj;

    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/users?orderBy=createdAt&order=DESC',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 200);
    const sortedDates = sortBy(res.result.list.map(d => d.createdAt));
    sortedDates.reverse();
    t.deepEqual(
        res.result.list.map(d => d.createdAt),
        sortedDates
    );
});

test('Admin can sort users by chart count - Ascending', async t => {
    const { session } = t.context.adminObj;

    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/users?orderBy=chartCount&order=ASC',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 200);
    const sortedChartCount = sortBy(res.result.list.map(d => d.chartCount));
    t.deepEqual(
        res.result.list.map(d => d.chartCount),
        sortedChartCount
    );
});

test('Admin can sort users by chart count - Descending', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server, { role: 'admin' });
        const { session } = userObj;

        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/users?orderBy=chartCount&order=DESC',
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.statusCode, 200);
        const sortedChartCount = sortBy(res.result.list.map(d => d.chartCount));
        sortedChartCount.reverse();
        t.deepEqual(
            res.result.list.map(d => d.chartCount),
            sortedChartCount
        );
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('Users endpoint searches in name field', async t => {
    const search = 'name-test';
    const { session } = t.context.adminObj;

    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/users?search=${search}`,
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 200);
    const user = res.result.list.find(u => u.name.includes(search));
    t.truthy(user);
    t.true(user.name.includes(search));
    t.false(user.email.includes(search));
});

test('Users endpoint searches in email field', async t => {
    const search = '@ava';
    const { session } = t.context.adminObj;

    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/users?search=${search}`,
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 200);
    const user = res.result.list.find(u => u.email.includes(search));
    const name = user.name || '';
    t.truthy(user);
    t.true(user.email.includes(search));
    t.false(name.includes(search));
});

test('It should be possible to resend the activation link up to two times', async t => {
    const { User } = require('@datawrapper/orm/models');
    let userId;
    try {
        const credentials = getCredentials();

        /* create user with email */
        let res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/users',
            headers: t.context.headers,
            payload: credentials
        });

        t.log('User created', res.result.email);
        userId = res.result.id;

        t.is(res.statusCode, 201);
        t.is(res.result.email, credentials.email);

        /* Login as newly created user */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/login',
            payload: credentials
        });

        t.log('Logged in', credentials.email);

        const session = res.result['DW-SESSION'];
        const cookieString = `DW-SESSION=${session}`;
        t.is(typeof session, 'string');
        t.is(res.statusCode, 200);
        t.true(res.headers['set-cookie'].join().includes(cookieString));

        /* resend once */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/resend-activation',
            headers: {
                cookie: `${cookieString}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 204);

        /* resend twice */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/resend-activation',
            headers: {
                cookie: `${cookieString}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 204);

        /* resend thrice, should fail now */
        res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/auth/resend-activation',
            headers: {
                cookie: `${cookieString}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost'
            }
        });

        t.is(res.statusCode, 429);
    } finally {
        if (userId) {
            const user = await User.findByPk(userId);
            await destroy(user);
        }
    }
});
