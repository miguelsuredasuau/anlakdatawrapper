import anyTest, { type TestFn } from 'ava';
import type { DB, ChartModel } from '@datawrapper/orm-lib';
import { Chart } from '@datawrapper/orm-lib/db';
import { createChart, destroy } from './helpers/fixtures';
import { init } from './helpers/orm';

const test = anyTest as TestFn<{
    db: DB;
    chart: ChartModel;
}>;

test.before(async t => {
    t.context.db = await init();

    t.context.chart = await createChart({
        metadata: {
            data: {
                transpose: false
            },
            publish: {
                'embed-width': 600
            }
        }
    });
});

test.after.always(async t => {
    await destroy(t.context.chart);
    await t.context.db.close();
});

test('metadata is object', t => {
    const { chart } = t.context;
    t.is(typeof chart.metadata, 'object');
});

test('get metadata properties', t => {
    const { chart } = t.context;
    t.is(chart.metadata.data?.transpose, false);
    t.is(chart.metadata.publish?.['embed-width'], 600);
});

test('chart has publicId', t => {
    const { chart } = t.context;
    t.is(typeof chart.getPublicId, 'function');
});

test('getThumbnailHash returns an md5 hash', async t => {
    const { chart } = t.context;
    t.is(chart.getThumbnailHash().length, 32);
});

test('getThumbnailHash throws an error when createdAt is not available', async t => {
    const chart = await Chart.findByPk(t.context.chart.id, { attributes: ['id'] });
    t.truthy(chart);
    t.throws(() => chart?.getThumbnailHash());
});
