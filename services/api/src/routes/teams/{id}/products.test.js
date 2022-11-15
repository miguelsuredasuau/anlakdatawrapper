const test = require('ava');
const {
    createTeamWithUser,
    createProduct,
    addProductToTeam,
    createUser,
    destroy,
    setup
} = require('../../../../test/helpers/setup');

test.before(async t => {
    t.context.server = await setup({ usePlugins: false });

    const teamObj = await createTeamWithUser(t.context.server);

    t.context.teamObj = teamObj;
    t.context.adminUserObj = await createUser(t.context.server, { role: 'admin' });

    const product1 = await createProduct(t.context.server, { name: 'Product 1' });
    const product2 = await createProduct(t.context.server, { name: 'Product 2' });
    t.context.products = [product1, product2];

    const teamProduct1 = await addProductToTeam(product1, teamObj.team, { created_by_admin: true });
    const teamProduct2 = await addProductToTeam(product2, teamObj.team, {
        created_by_admin: false
    });

    t.context.teamProducts = [teamProduct1, teamProduct2];
});

test.after.always(async t => {
    await destroy(
        ...Object.values(t.context.teamObj),
        ...Object.values(t.context.adminUserObj),
        ...t.context.products
    );
});

test('createdByAdmin not included when request is made by non-admin', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/teams/${t.context.teamObj.team.id}/products`,
        headers: {
            Authorization: `Bearer ${t.context.teamObj.token}`
        }
    });

    t.is(res.statusCode, 200);
    t.is(res.result.list.length, 2);
    t.is(
        res.result.list.find(d => 'createdByAdmin' in d),
        undefined
    );
});

test('createdByAdmin included when request is made by admin', async t => {
    const res = await t.context.server.inject({
        method: 'GET',
        url: `/v3/teams/${t.context.teamObj.team.id}/products`,
        headers: {
            Authorization: `Bearer ${t.context.adminUserObj.token}`
        }
    });

    t.is(res.statusCode, 200);
    t.is(res.result.list.length, 2);

    const createdByAdmin = Object.fromEntries(
        t.context.teamProducts.map(v => [v.productId, v.created_by_admin])
    );
    const createdByAdminResults = Object.fromEntries(
        res.result.list.map(v => [v.id, v.createdByAdmin])
    );

    t.deepEqual(createdByAdmin, createdByAdminResults);
});
