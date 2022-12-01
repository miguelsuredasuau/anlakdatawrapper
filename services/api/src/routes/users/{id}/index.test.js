const test = require('ava');
const { decamelize } = require('humps');
const { Action, Product, UserProduct } = require('@datawrapper/orm/db');
const {
    createUser,
    destroy,
    getCredentials,
    setup,
    withUser,
    withTeamWithUser
} = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });
    t.context.userObj = await createUser(t.context.server);
    t.context.adminObj = await createUser(t.context.server, { role: 'admin' });
});

test.after.always(async t => {
    await destroy(...Object.values(t.context.userObj), ...Object.values(t.context.adminObj));
});

test('GET /users/:id - should include teams when fetched as admin', async t => {
    /* create admin user to fetch different user with team */
    const { session } = t.context.adminObj;

    return withTeamWithUser(t.context.server, {}, async teamObj => {
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${teamObj.user.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.result.teams.length, 1);
        t.is(res.result.teams[0].id, teamObj.team.id);
        t.is(res.result.teams[0].name, teamObj.team.name);
        t.is(res.result.teams[0].url, `/v3/teams/${teamObj.team.id}`);
    });
});

test('Users endpoints should return 404 if no user was found', async t => {
    const { session } = t.context.adminObj;
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/users/12345678',
        headers: {
            cookie: `DW-SESSION=${session.id}`
        }
    });

    t.is(res.statusCode, 404);
});

test('Users endpoints should return products for admins', async t => {
    let product;
    let userProduct;
    try {
        const admin = t.context.adminObj;
        const { user } = t.context.userObj;

        product = await Product.create({
            name: 'test-product'
        });

        userProduct = await UserProduct.create({
            userId: user.id,
            productId: product.id
        });

        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${user.id}`,
            headers: {
                cookie: `DW-SESSION=${admin.session.id}`
            }
        });

        t.is(res.statusCode, 200);
        t.deepEqual(res.result.products, [
            {
                id: product.id,
                name: product.name,
                url: `/v3/products/${product.id}`
            }
        ]);
    } finally {
        await destroy(userProduct, product);
    }
});

test("Users can't change protected fields using PATCH", async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const forbiddenFields = {
            customerId: 12345,
            oauthSignin: 'blub',
            id: 9999
        };

        let res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/users/${user.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'application/json'
            },
            payload: forbiddenFields
        });

        t.is(res.statusCode, 400);

        const protectedFields = {
            activateToken: '12345',
            role: 'admin'
        };

        res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/users/${user.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'application/json'
            },
            payload: protectedFields
        });

        t.is(res.statusCode, 200);

        user = await user.reload();
        for (const f in protectedFields) {
            t.not(user[decamelize(f)], protectedFields[f]);
        }
    });
});

test('Users can change allowed fields', async t => {
    return withUser(t.context.server, {}, async ({ session, user }) => {
        const oldEmail = user.email;

        const allowedFields = {
            name: 'My new name',
            email: getCredentials().email,
            language: 'de_DE'
        };

        const res = await t.context.server.inject({
            method: 'PATCH',
            url: `/v3/users/${user.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}; crumb=abc`,
                'X-CSRF-Token': 'abc',
                referer: 'http://localhost',
                'Content-Type': 'application/json'
            },
            payload: allowedFields
        });

        t.is(res.statusCode, 200);

        user = await user.reload();

        const action = await Action.findOne({
            where: {
                user_id: user.id
            }
        });

        const details = JSON.parse(action.details);

        t.is(details['old-email'], oldEmail);
        t.is(details['new-email'], allowedFields.email);
        t.truthy(details.token);
        t.is(user.name, allowedFields.name);
        t.is(user.language, allowedFields.language);
    });
});

test('User cannot change email if it already exists', async t => {
    return withUser(t.context.server, {}, async ({ session, user: user1 }) => {
        return withUser(t.context.server, {}, async ({ user: user2 }) => {
            const { result, statusCode } = await t.context.server.inject({
                method: 'PATCH',
                url: `/v3/users/${user1.id}`,
                headers: {
                    cookie: `DW-SESSION=${session.id}; crumb=abc`,
                    'X-CSRF-Token': 'abc',
                    referer: 'http://localhost',
                    'Content-Type': 'application/json'
                },
                payload: {
                    email: user2.email
                }
            });

            t.is(statusCode, 409);
            t.is(result.type, 'account / change-email / email-already-exists');
            t.is(result.message, 'Email already exists');
        });
    });
});

test('GET /users/:id - should not include unaccepted team invites', async t => {
    /* create admin user to fetch different user with team */
    const { session } = t.context.adminObj;

    const options = { invite_token: 'abcdefg' };
    return withTeamWithUser(t.context.server, options, async teamObj => {
        const res = await t.context.server.inject({
            method: 'GET',
            url: `/v3/users/${teamObj.user.id}`,
            headers: {
                cookie: `DW-SESSION=${session.id}`
            }
        });

        t.is(res.result.teams.length, 0);
    });
});
