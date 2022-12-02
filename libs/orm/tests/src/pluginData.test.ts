import anyTest, { type TestFn } from 'ava';
import type { DB, PluginModel } from '@datawrapper/orm-lib';
import type { PluginData } from '@datawrapper/orm-lib/db';
import { createPlugin, destroy } from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
    PluginData: typeof PluginData;
    plugin: PluginModel;
}>;

test.before(async t => {
    t.context.db = await init();
    t.context.PluginData = t.context.db.models.plugin_data;
    t.context.plugin = await createPlugin();
});

test.after.always(async t => {
    await destroy(t.context.plugin);
    await t.context.db.close();
});

test('store plugin data', async t => {
    const { PluginData, plugin } = t.context;
    try {
        const res = await PluginData.create({
            plugin_id: plugin.id,
            stored_at: new Date(),
            key: 'orm-test',
            data: 'It works'
        });

        t.is(res.plugin_id, plugin.id);
        t.is(res.key, 'orm-test');
        t.is(res.data, 'It works');
        t.true(res.stored_at instanceof Date);

        t.throwsAsync(async () => {
            // not allowed to store another one
            // because of unique index
            await PluginData.create({
                plugin_id: plugin.id,
                stored_at: new Date(),
                key: 'orm-test',
                data: 'It worked again'
            });
        });

        // load plugin data
        const pd = await plugin.getPluginData();
        t.is(pd.length, 1);
        t.is(pd[0]?.key, 'orm-test');
        t.is(pd[0]?.plugin_id, plugin.id);
    } finally {
        await PluginData.destroy({ where: { key: 'orm-test' } });
    }
});
