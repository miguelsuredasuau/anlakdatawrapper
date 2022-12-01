const test = require('ava');
const { initWithPlugins } = require('./helpers/orm');

test.before(async t => {
    t.context.orm = await initWithPlugins();
});

test.after.always(t => t.context.orm.db.close());

test('"orm-test" plugin registration', async t => {
    const { orm } = t.context;
    let ORMTest;
    let row;
    try {
        await orm.registerPlugins();
        ORMTest = orm.db.models.orm_test;

        // Test that '"orm-test" is registered.
        t.truthy(ORMTest);

        row = await ORMTest.create({ data: 'Test' });

        // Test that "orm-test" can write data.
        t.truthy(row.id);
        t.is(row.data, 'Test');
    } finally {
        if (row) {
            await row.destroy();
        }
        if (ORMTest) {
            await ORMTest.drop();
        }
    }
});
