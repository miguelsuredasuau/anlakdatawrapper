const test = require('ava');
const {
    addProductToTeam,
    createTeam,
    createUser,
    destroy,
    getProduct,
    setup,
    createProduct
} = require('../../../../test/helpers/setup');

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

test('PUT /products/{id} updates all product properties', async t => {
    let product;
    try {
        product = await createProduct({
            name: 'Old name',
            priority: 1,
            data: { foo: 'old data' }
        });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/products/${product.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: {
                name: 'New name',
                priority: 2,
                data: { foo: 'new data' }
            }
        });
        t.is(res.statusCode, 200);

        await product.reload();
        t.is(product.name, 'New name');
        t.is(product.priority, 2);
        t.is(product.data, '{"foo":"new data"}');

        t.truthy(res.result.id);
        t.is(res.result.name, 'New name');
        t.false(res.result.deleted);
        t.is(res.result.priority, 2);
        t.deepEqual(res.result.data, { foo: 'new data' });
        t.truthy(res.result.createdAt);
    } finally {
        await destroy(product);
    }
});

test('PUT /products/{id} returns error 400 when some properties are missing', async t => {
    let product;
    try {
        product = await createProduct();
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/products/${product.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: {
                name: 'New name'
            }
        });
        t.is(res.statusCode, 400);
    } finally {
        await destroy(product);
    }
});

test('PUT /products/{id} returns error 404 when the product does not exist', async t => {
    const res = await t.context.server.inject({
        method: 'PUT',
        url: `/v3/products/spam`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.adminObj.token}`
        },
        payload: {
            name: 'New name',
            priority: 2,
            data: { foo: 'new data' }
        }
    });
    t.is(res.statusCode, 404);
});

test('PUT /products/{id} returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'PUT',
        url: `/v3/products/spam`,
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('PUT /products/{id} returns error 403 when the token does not have the product:write scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: ['product:read'] });
        const res = await t.context.server.inject({
            method: 'PUT',
            url: `/v3/products/spam`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${adminObj.token}`
            },
            payload: {
                name: 'New name',
                priority: 2,
                data: { foo: 'new data' }
            }
        });
        t.is(res.statusCode, 403);
    } finally {
        await destroy(...Object.keys(adminObj));
    }
});

test('DELETE /products/{id} deletes product by ID', async t => {
    const product = await createProduct({ data: `{ "foo": "bar" }` });
    try {
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/products/${product.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            }
        });
        const { deleted } = await getProduct(product.id);
        t.is(res.statusCode, 204);
        t.is(deleted, true);
    } finally {
        await destroy(product);
    }
});

test('DELETE /products/{id} does not delete product that is in use', async t => {
    const product = await createProduct({ data: `{ "foo": "bar" }` });
    const team = await createTeam();
    await addProductToTeam(product, team);
    try {
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/products/${product.id}`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            }
        });
        const { deleted } = await getProduct(product.id);
        t.is(res.statusCode, 403);
        t.is(deleted, false);
    } finally {
        await destroy(team);
        await destroy(product);
    }
});

test('DELETE /products/{id} returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'DELETE',
        url: '/v3/products/FOO',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('DELETE /products/{id} returns error 403 when the token does not have the product:write scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: [] });
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/products/FOO',
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
