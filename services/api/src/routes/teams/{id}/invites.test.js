const test = require('ava');
const {
    createTeamWithUser,
    createUser,
    destroy,
    setup
} = require('../../../../test/helpers/setup');

async function inviteUser(context, teamObj, email) {
    const { User } = require('@datawrapper/orm/models');
    const res = await context.server.inject({
        method: 'POST',
        url: `/v3/teams/${teamObj.team.id}/invites`,
        auth: {
            strategy: 'session',
            credentials: teamObj.session,
            artifacts: teamObj.user
        },
        headers: context.headers,
        payload: {
            email,
            role: 'member'
        }
    });
    const user = await User.findOne({ where: { email } });
    return { res, user };
}

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.teamObj = await createTeamWithUser(t.context.server);
    t.context.auth = {
        strategy: 'session',
        credentials: t.context.teamObj.session,
        artifacts: t.context.teamObj.user
    };
    t.context.headers = {
        cookie: 'crumb=abc',
        'X-CSRF-Token': 'abc',
        referer: 'http://localhost'
    };
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.teamObj));
});

test('owners can invite new members to a team', async t => {
    let userObj;
    try {
        userObj = await createUser(t.context.server);
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/teams/${t.context.teamObj.team.id}/invites`,
            auth: t.context.auth,
            headers: t.context.headers,
            payload: {
                email: userObj.user.email,
                role: 'member'
            }
        });

        t.is(res.statusCode, 201);
    } finally {
        if (userObj) {
            await destroy(...Object.values(userObj));
        }
    }
});

test('owners can invite new users to a team', async t => {
    const users = [];
    try {
        const { res, user } = await inviteUser(t.context, t.context.teamObj, 'user@example.com');
        users.push(user);
        t.is(res.statusCode, 201);
        t.is(user.email, 'user@example.com');
        t.truthy(user.activate_token);
    } finally {
        await destroy(users);
    }
});

test('owners can invite a maximum number of users equal to MAX_TEAM_INVITES', async t => {
    const users = [];
    let teamObj = {};
    const maxInvites = 3;
    try {
        const { events, event } = t.context.server.app;
        teamObj = await createTeamWithUser(t.context.server);

        events.on(event.MAX_TEAM_INVITES, async () => ({ maxInvites }));

        for (let i = 1; i <= maxInvites + 1; i++) {
            const { res, user } = await inviteUser(t.context, teamObj, `user-${i}@test1.com`);
            t.is(res.statusCode, i > maxInvites ? 406 : 201);
            if (user) users.push(user);
            if (i > maxInvites) {
                t.is(user, null);
            } else {
                t.not(user, null);
            }
        }
    } finally {
        await destroy(users, ...Object.values(teamObj));
    }
});
test('owners cannot invite more than MAX_TEAM_INVITES by deleting invite', async t => {
    const users = [];
    let teamObj = {};

    try {
        const { events, event } = t.context.server.app;
        teamObj = await createTeamWithUser(t.context.server);

        const maxInvites = 3;
        events.on(event.MAX_TEAM_INVITES, async () => ({ maxInvites }));

        for (var i = 0; i < 10; i++) {
            const { res, user } = await inviteUser(t.context, teamObj, `user-${i}@test2.com`);
            users.push(user);
            t.is(res.statusCode, i >= maxInvites * 2 ? 406 : 201);

            if (res.statusCode === 201) {
                await t.context.server.inject({
                    method: 'DELETE',
                    url: `/v3/teams/${teamObj.team.id}/members/${user.id}`,
                    auth: {
                        strategy: 'session',
                        credentials: teamObj.session,
                        artifacts: teamObj.user
                    },
                    headers: t.context.headers
                });
            }
        }
    } finally {
        await destroy(users, ...Object.values(teamObj));
    }
});
