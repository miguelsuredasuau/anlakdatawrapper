import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    {
        condition: ['get', 'blocks.headline'],
        settings: {
            'options.blocks.rectangle.data': {
                width: 100,
                height: 5,
                background: '#cc0000'
            }
        }
    }
];

test('show rect if chart has headline', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world' },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, '.rectangle-block .export-rect', 'width'), '100px');
    t.is(await getElementStyle(page, '.rectangle-block .export-rect', 'height'), '5px');
    t.is(
        await getElementStyle(page, '.rectangle-block .export-rect', 'background-color'),
        'rgb(204, 0, 0)'
    );
});

test('dont show rect if chart has no headline', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: '' },
        themeData: { overrides }
    });
    t.is(await page.$('.rectangle-block'), null);
});

test('dont show rect if chart has hidden title', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { describe: { 'hide-title': true } } },
        themeData: { overrides }
    });
    t.is(await page.$('.rectangle-block'), null);
});
