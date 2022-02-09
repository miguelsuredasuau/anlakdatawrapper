const test = require('ava');
const {
    createProduct,
    createUser,
    destroy,
    getProduct,
    setup
} = require('../../../test/helpers/setup');
const { nanoid } = require('nanoid');

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

        t.truthy(res.result.list[0].id);
        t.false(res.result.list[0].deleted);
        t.truthy(res.result.list[0].priority);
        t.truthy(res.result.list[0].data);
        t.truthy(res.result.list[0].createdAt);

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

test.serial('POST /products creates a new product with default properties', async t => {
    let product;
    try {
        const name = nanoid(5);
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: {
                name
            }
        });
        t.is(res.statusCode, 201);

        product = await getProduct(res.result.id);
        t.is(product.name, name);
        t.false(product.deleted);
        t.is(product.priority, 0);
        t.is(product.data, null);

        t.truthy(res.result.id);
        t.is(res.result.name, name);
        t.false(res.result.deleted);
        t.is(res.result.priority, 0);
        t.is(res.result.data, undefined);
        t.truthy(res.result.createdAt);
    } finally {
        await destroy(product);
    }
});

test.serial('POST /products creates a new product with passed properties', async t => {
    let product;
    try {
        const name = nanoid(5);
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: {
                name,
                priority: 99,
                data: '{ "foo": "bar" }'
            }
        });
        t.is(res.statusCode, 201);

        product = await getProduct(res.result.id);
        t.is(product.name, name);
        t.false(product.deleted);
        t.is(product.priority, 99);
        t.is(product.data, '{ "foo": "bar" }');

        t.truthy(res.result.id);
        t.is(res.result.name, name);
        t.false(res.result.deleted);
        t.is(res.result.priority, 99);
        t.truthy(res.result.createdAt);
        t.deepEqual(res.result.data, { foo: 'bar' });
    } finally {
        await destroy(product);
    }
});

test('POST /products returns error 400 when the data property is not a valid JSON', async t => {
    let product;
    try {
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/products',
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: {
                name: nanoid(5),
                data: '{'
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(product);
    }
});

test('POST /products returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/products',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('POST /products returns error 403 when the token does not have the product:write scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: ['product:read'] });
        const res = await t.context.server.inject({
            method: 'POST',
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
