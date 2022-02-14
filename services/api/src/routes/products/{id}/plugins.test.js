const test = require('ava');
const { nanoid } = require('nanoid');
const {
    addPluginToProduct,
    createPlugin,
    createUser,
    destroy,
    getProductPlugin,
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

test('POST /products/{id}/plugins adds plugin to product', async t => {
    const product = await createProduct({ data: `{ "foo": "bar" }` });
    const plugin = await createPlugin({ id: nanoid(8) });
    let productPlugin;
    try {
        const res = await t.context.server.inject({
            method: 'POST',
            url: `/v3/products/${product.id}/plugins`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: [plugin.id]
        });
        productPlugin = await getProductPlugin(product.id, plugin.id);
        t.truthy(productPlugin);
        t.is(res.statusCode, 201);
    } finally {
        await destroy(productPlugin);
        await destroy(plugin);
        await destroy(product);
    }
});

test('POST /products/{id}/plugins returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'POST',
        url: '/v3/products/FOO/plugins',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('POST /products/{id}/plugins returns error 403 when the token does not have the product:write scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: [] });
        const res = await t.context.server.inject({
            method: 'POST',
            url: '/v3/products/FOO/plugins',
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

test('DELETE /products/{id}/plugins removes plugin from product', async t => {
    const product = await createProduct({ data: `{ "foo": "bar" }` });
    const plugin = await createPlugin({ id: nanoid(8) });
    await addPluginToProduct(plugin, product);
    try {
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: `/v3/products/${product.id}/plugins`,
            headers: {
                ...t.context.headers,
                Authorization: `Bearer ${t.context.adminObj.token}`
            },
            payload: [plugin.id]
        });
        const productPlugin = await getProductPlugin(product.id, plugin.id);
        t.falsy(productPlugin);
        t.is(res.statusCode, 204);
    } finally {
        await destroy(product);
    }
});

test('DELETE /products/{id}/plugins returns error 401 when the user is not admin', async t => {
    const res = await t.context.server.inject({
        method: 'DELETE',
        url: '/v3/products/FOO/plugins',
        headers: {
            ...t.context.headers,
            Authorization: `Bearer ${t.context.userObj.token}`
        }
    });
    t.is(res.statusCode, 401);
});

test('DELETE /products/{id}/plugins returns error 403 when the token does not have the product:write scope', async t => {
    let adminObj = {};
    try {
        adminObj = await createUser(t.context.server, { role: 'admin', scopes: [] });
        const res = await t.context.server.inject({
            method: 'DELETE',
            url: '/v3/products/FOO/plugins',
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
