const test = require('ava');
const { createProduct, createUser, destroy, setup } = require('../../../test/helpers/setup');

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

test.serial('GET /products returns all products that are not deleted', async t => {
    const products = [];
    try {
        for (let i = 0; i < 3; i++) {
            products.push(await createProduct());
            products.push(await createProduct({ deleted: true }));
        }
        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        t.deepEqual(
            res.result.list.map(result => result.name),
            [
                'Admin Product',
                'Default Product',
                products[0].name,
                products[2].name,
                products[4].name
            ]
        );
    } finally {
        await destroy(products);
    }
});

test.serial('GET /products parses product data JSON', async t => {
    const products = [];
    try {
        for (let i = 0; i < 3; i++) {
            products.push(await createProduct({ data: `{ "foo": ${i * 100} }` }));
        }
        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            }
        });
        t.is(res.statusCode, 200);
        t.deepEqual(
            res.result.list.slice(2).map(result => result.data),
            [{ foo: 0 }, { foo: 100 }, { foo: 200 }]
        );
    } finally {
        await destroy(products);
    }
});

test('GET /products returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: '/v3/products',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('GET /products returns error 403 when the token does not have the product:read scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: [] });
        const res = await t.context.server.inject({
            method: 'GET',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${adminObj.token}`
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(...Object.keys(adminObj));
    }
});
