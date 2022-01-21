const test = require('ava');
const { createChart, destroy } = require('./helpers/fixtures');
const { init } = require('./helpers/orm');

test.before(async t => {
    t.context.orm = await init();

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
    await t.context.orm.db.close();
});

test('metadata is object', t => {
    const { chart } = t.context;
    t.is(typeof chart.metadata, 'object');
});

test('get metadata properties', t => {
    const { chart } = t.context;
    t.is(chart.metadata.data.transpose, false);
    t.is(chart.metadata.publish['embed-width'], 600);
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
    const Chart = require('../models/Chart');
    const chart = await Chart.findByPk(t.context.chart.id, { attributes: ['id'] });
    t.throws(() => chart.getThumbnailHash());
});
