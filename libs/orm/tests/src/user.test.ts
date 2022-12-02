import anyTest, { type TestFn } from 'ava';
import type {
    ChartModel,
    DB,
    PluginModel,
    ProductModel,
    TeamModel,
    UserModel
} from '@datawrapper/orm-lib';
import type { Chart } from '@datawrapper/orm-lib/db';
import {
    createChart,
    createPlugin,
    createProduct,
    createTeam,
    createUser,
    createTeamInvite,
    destroy
} from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
    Chart: typeof Chart;
    defaultProduct: ProductModel;
    teamProduct: ProductModel;
    teamProductHighPrio: ProductModel;
    userProduct: ProductModel;
    team1: TeamModel;
    team2: TeamModel;
    adminUser: UserModel;
    teamUser: UserModel;
    teamUserChart: ChartModel;
    pendingTeamUser: UserModel;
    productUser: UserModel;
    productUserCharts: ChartModel[];
    pendingUser: UserModel;
    publicPlugin: PluginModel;
    privatePlugin: PluginModel;
    disabledPlugin: PluginModel;
    privatePluginCached: PluginModel;
    userPluginCache: Awaited<ReturnType<DB['models']['user_plugin_cache']['create']>>;
}>;

test.before(async t => {
    t.context.db = await init();

    t.context.Chart = t.context.db.models.chart;

    t.context.defaultProduct = await createProduct({
        priority: -50
    });
    t.context.teamProduct = await createProduct();
    t.context.teamProductHighPrio = await createProduct({
        priority: 30
    });
    t.context.userProduct = await createProduct();

    t.context.team1 = await createTeam({
        name: 'Team No. 1',
        product: t.context.teamProduct
    });
    t.context.team2 = await createTeam({
        name: 'Team No. 2',
        product: t.context.teamProductHighPrio
    });
    t.context.adminUser = await createUser({
        role: 'admin',
        pwd: 'test',
        activate_token: 'my-activate-token',
        reset_password_token: 'my-reset-passwod-token',
        customer_id: 'my-customer-id'
    });

    t.context.teamUser = await createUser({
        role: 'editor',
        teams: [t.context.team1]
    });
    t.context.teamUserChart = await createChart({
        author_id: t.context.teamUser.id
    });
    t.context.pendingTeamUser = await createUser({
        role: 'editor'
    });
    await createTeamInvite({ user: t.context.pendingTeamUser, team: t.context.team2 });

    t.context.productUser = await createUser({
        role: 'editor',
        teams: [t.context.team1],
        product: t.context.userProduct
    });
    t.context.productUserCharts = await Promise.all(
        Array(2)
            .fill(undefined)
            .map(() => createChart({ author_id: t.context.productUser.id }))
    );

    t.context.pendingUser = await createUser({
        activate_token: '12345678',
        teams: [t.context.team1, t.context.team2]
    });

    t.context.publicPlugin = await createPlugin({
        enabled: true,
        is_private: false
    });
    t.context.disabledPlugin = await createPlugin({
        enabled: false,
        is_private: false
    });
    t.context.privatePlugin = await createPlugin({
        enabled: true,
        is_private: true
    });
    t.context.privatePluginCached = await createPlugin({
        enabled: true,
        is_private: true
    });
    t.context.userPluginCache = await t.context.db.models.user_plugin_cache.create({
        user_id: t.context.adminUser.id,
        plugins: [t.context.publicPlugin.id, t.context.privatePluginCached.id].join(',')
    });
});

test.after.always(async t => {
    await destroy(
        t.context.userPluginCache,
        t.context.privatePluginCached,
        t.context.privatePlugin,
        t.context.disabledPlugin,
        t.context.publicPlugin,
        t.context.productUserCharts,
        t.context.productUser,
        t.context.pendingUser,
        t.context.teamUserChart,
        t.context.teamUser,
        t.context.adminUser,
        t.context.team2,
        t.context.team1,
        t.context.userProduct,
        t.context.teamProductHighPrio,
        t.context.teamProduct,
        t.context.defaultProduct,
        t.context.pendingTeamUser
    );
    await t.context.db.close();
});

test('admin user has role admin', t => {
    const { adminUser } = t.context;
    t.is(adminUser.role, 'admin');
    t.is(adminUser.get('role'), 'admin');
});

test('user.serialize returns object', t => {
    const { adminUser } = t.context;
    const obj = adminUser.serialize();
    t.is(typeof obj, 'object');
});

test('serialized user excludes sensitive data', t => {
    const { adminUser } = t.context;
    // obj is declared as not having any of these five fields,
    // but we need to check that it does not actually have any of them
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const obj = adminUser.serialize() as any;
    t.is(obj.pwd, undefined);
    t.is(obj.activate_token, undefined);
    t.is(obj.reset_password_token, undefined);
    t.is(obj.customer_id, undefined);
    t.is(obj.created_at, undefined);
});

test('admin user has not charts', async t => {
    const { Chart, adminUser } = t.context;
    t.is(typeof adminUser.getCharts, 'function', 'user.getCharts() is undefined');
    const result = await adminUser.getCharts();
    t.deepEqual(result, []);
    const chartCount = await Chart.count({ where: { author_id: adminUser.id } });
    t.is(chartCount, 0);
});

test('admin user has no teams', async t => {
    const { adminUser } = t.context;
    t.is(typeof adminUser.getTeams, 'function', 'user.getTeams() is undefined');
    const result = await adminUser.getTeams();
    t.deepEqual(result, []);
});

test('admin user has no folders', async t => {
    const { adminUser } = t.context;
    t.is(typeof adminUser.getFolders, 'function', 'user.getFolders() is undefined');
    const result = await adminUser.getFolders();
    t.deepEqual(result, []);
});

test('admin user has no themes', async t => {
    const { adminUser } = t.context;
    t.is(typeof adminUser.getThemes, 'function', 'user.getThemes() is undefined');
    const result = await adminUser.getThemes();
    t.deepEqual(result, []);
});

test('admin user has no user data', async t => {
    const { adminUser } = t.context;
    t.is(typeof adminUser.getUserData, 'function', 'user.getUserData() is undefined');
    const result = await adminUser.getUserData();
    t.deepEqual(result, []);
});

test('admin user has no user or team product', async t => {
    const { adminUser } = t.context;
    t.is(typeof adminUser.getProducts, 'function', 'user.getProducts() is undefined');
    const result = await adminUser.getProducts();
    t.deepEqual(result, []);
});

test('user has public plugin in userPluginCache', async t => {
    const { adminUser, publicPlugin } = t.context;
    const res = await adminUser.getUserPluginCache();
    const plugins = res.plugins.split(',');
    t.true(plugins.includes(publicPlugin.id));
});

test('user may use public plugin', async t => {
    const { adminUser, publicPlugin } = t.context;
    t.true(await adminUser.mayUsePlugin(publicPlugin.id));
});

test('user may not use private plugin that is not in userPluginCache', async t => {
    const { adminUser, privatePlugin } = t.context;
    t.false(await adminUser.mayUsePlugin(privatePlugin.id));
});

test('user may use private plugin that is in userPluginCache', async t => {
    const { adminUser, privatePluginCached } = t.context;
    t.true(await adminUser.mayUsePlugin(privatePluginCached.id));
});

test('user may not use non-existent plugin', async t => {
    const { adminUser } = t.context;
    t.false(await adminUser.mayUsePlugin('foo'));
});

test('user may not use disabled plugin', async t => {
    const { adminUser, disabledPlugin } = t.context;
    t.false(await adminUser.mayUsePlugin(disabledPlugin.id));
});

test('team user has role editor', t => {
    const { teamUser } = t.context;
    t.is(teamUser.role, 'editor');
});

test('team user has one chart', async t => {
    const { Chart, teamUser, teamUserChart } = t.context;
    const result = await teamUser.getCharts();
    t.is(result.length, 1);
    t.is(result[0].id, teamUserChart.id);
    const chartCount = await Chart.count({ where: { author_id: teamUser.id } });
    t.is(chartCount, 1);
});

test('team user has one team', async t => {
    const { teamUser } = t.context;
    const result = await teamUser.getTeams();
    t.is(result.length, 1);
    t.is(result[0]?.name, 'Team No. 1');
    t.is(result[0]?.user_team.team_role, 'owner');
    // Sequelize v6 types do not support model field and DB field having different types https://github.com/sequelize/sequelize/issues/13522
    // so we shouldn't use getDataValue in production code outside of getters and setters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    t.is(result[0]?.user_team.getDataValue('team_role'), 0 as any); // owner
});

test('product user has two charts', async t => {
    const { Chart, productUser } = t.context;
    const result = await productUser.getCharts();
    t.is(result.length, 2);
    const chartCount = await Chart.count({ where: { author_id: productUser.id } });
    t.is(chartCount, 2);
});

test('pending user has role pending', t => {
    const { pendingUser } = t.context;
    t.is(pendingUser.role, 'pending');
    t.is(pendingUser.get('role'), 'pending');
});

test('pending user has activation token', t => {
    const { pendingUser } = t.context;
    t.is(pendingUser.activate_token, '12345678');
});

test('pending user has is not activated', t => {
    const { pendingUser } = t.context;
    t.is(pendingUser.isActivated(), false);
});

test('user.getActiveProduct returns default product', async t => {
    const { defaultProduct, adminUser } = t.context;
    const activeProduct = await adminUser.getActiveProduct();
    // Check priority instead of id, because it can happen that an external testing database is
    // dirty and contains several products with low priority, in which case the default product will
    // be chosen randomly and might not be our 'defaultProduct'.
    t.is(activeProduct?.priority, defaultProduct.priority);
});

test('user.getActiveProduct returns team product', async t => {
    const { teamProduct, teamUser } = t.context;
    const activeProduct = await teamUser.getActiveProduct();
    t.truthy(activeProduct);
    t.is(activeProduct?.id, teamProduct.id);
});

test('user.getActiveProduct prefers user product to team product', async t => {
    const { userProduct, productUser } = t.context;
    const activeProduct = await productUser.getActiveProduct();
    t.truthy(activeProduct);
    t.is(activeProduct?.id, userProduct.id);
});

test('user.getActiveProduct returns team product with higher priority', async t => {
    const { teamProductHighPrio, pendingUser } = t.context;
    const activeProduct = await pendingUser.getActiveProduct();
    t.truthy(activeProduct);
    t.is(activeProduct?.id, teamProductHighPrio.id);
});

test('user.getActiveProduct does not return deleted team product', async t => {
    const { defaultProduct } = t.context;
    const deletedProduct = await createProduct({
        deleted: true
    });
    const team = await createTeam({
        product: deletedProduct
    });
    const user = await createUser({
        role: 'editor',
        teams: [team]
    });
    const activeProduct = await user.getActiveProduct();
    t.truthy(activeProduct);
    t.is(activeProduct?.id, defaultProduct.id);
});

test('user.getActiveProduct returns default product for pending team user', async t => {
    const { defaultProduct, pendingTeamUser } = t.context;
    const activeProduct = await pendingTeamUser.getActiveProduct();
    t.truthy(activeProduct);
    t.is(activeProduct?.id, defaultProduct.id);
});

test('user.getAcceptedTeams returns no teams for which the user has a pending invite', async t => {
    const { pendingTeamUser } = t.context;
    const acceptedTeams = await pendingTeamUser.getAcceptedTeams();
    t.deepEqual(acceptedTeams, []);
});

test('user.getAcceptedTeams returns all teams for which the user has no pending invite', async t => {
    const { teamUser } = t.context;
    const acceptedTeams = await teamUser.getAcceptedTeams();
    t.is(acceptedTeams.length, 1);
    t.is(acceptedTeams[0]?.name, 'Team No. 1');
});
