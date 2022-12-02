import anyTest, { type TestFn } from 'ava';
import { initWithPlugins } from './helpers/orm';
import type { ORMTestClassType } from '@datawrapper/orm-test-plugin';

const test = anyTest as TestFn<{
    orm: Awaited<ReturnType<typeof initWithPlugins>>;
}>;

test.before(async t => {
    t.context.orm = await initWithPlugins();
});

test.after.always(t => t.context.orm.db.close());

test('"orm-test" plugin registration', async t => {
    const { orm } = t.context;
    await orm.registerPlugins();
    const ORMTest = orm.db.models['orm_test'] as ORMTestClassType;

    // Test that '"orm-test" is registered.
    t.truthy(ORMTest);
    try {
        const row = await ORMTest.create({ data: 'Test' });

        try {
            // Test that "orm-test" can write data.
            t.truthy(row.id);
            t.is(row.data, 'Test');
        } finally {
            if (row) {
                await row.destroy();
            }
        }
    } finally {
        if (ORMTest) {
            await ORMTest.drop();
        }
    }
});
