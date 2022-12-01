const test = require('ava');
const { Team, TeamProduct, UserProduct, UserTeam } = require('../db');
const { createProduct, createTeam, createUser, destroy } = require('./helpers/fixtures');
const { init } = require('./helpers/orm');

test.before(async t => {
    t.context.db = await init();

    t.context.team = await createTeam();

    const promises = Array(3)
        .fill()
        .map(() => createUser({ teams: [t.context.team] }));
    t.context.users = await Promise.all(promises);
});

test.after.always(async t => {
    await destroy(t.context.users, t.context.team);
    await t.context.db.close();
});

test('team.getUsers returns three users', async t => {
    const { team } = t.context;
    t.is(typeof team.getUsers, 'function', 'team.getUsers() is undefined');
    const result = await team.getUsers();
    t.is(result.length, 3);
});

test('Team.countTeamAndOwnerProducts counts all products', async t => {
    const team = await createTeam();
    // Team products
    for (let i = 0; i < 3; i++) {
        const product = await createProduct();
        await TeamProduct.create({
            organization_id: team.id,
            productId: product.id
        });
    }
    // Owner prodcuts
    for (let i = 0; i < 1; i++) {
        const user = await createUser();
        await UserTeam.create({
            user_id: user.id,
            organization_id: team.id,
            team_role: 'owner'
        });
        const product = await createProduct();
        await UserProduct.create({
            userId: user.id,
            productId: product.id
        });
    }
    // Member products (will not be counted)
    for (let i = 0; i < 2; i++) {
        const user = await createUser();
        await UserTeam.create({
            user_id: user.id,
            organization_id: team.id,
            team_role: 'member'
        });
        const product = await createProduct();
        await UserProduct.create({
            userId: user.id,
            productId: product.id
        });
    }
    const [numTeamProducts, numTeamOwnerProducts] = await Team.countTeamAndOwnerProducts(team.id);
    t.is(numTeamProducts, 3);
    t.is(numTeamOwnerProducts, 1);
});

test('Team.countTeamAndOwnerProducts returns zeros when there are no products', async t => {
    const team = await createTeam();
    const [numTeamProducts, numTeamOwnerProducts] = await Team.countTeamAndOwnerProducts(team.id);
    t.is(numTeamProducts, 0);
    t.is(numTeamOwnerProducts, 0);
});

test('Team.create fills webhook string fields of team settings with empty strings', async t => {
    const team = await createTeam();
    t.is(team.settings.webhook_url, '');
    t.is(team.settings.slack_webhook_url, '');
    t.is(team.settings.msteams_webhook_url, '');
});
