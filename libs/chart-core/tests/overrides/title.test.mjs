import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    // override headline font size for viewports < 450px
    {
        condition: ['has', 'title'],
        settings: {
            'options.blocks.rectangle.data': {
                width: 100,
                height: 5,
                background: '#cc0000'
            }
        }
    }
];

test('show rect if chart has title', async t => {
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

test('dont show rect if chart has no title', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: '' },
        themeData: { overrides }
    });
    t.is(await page.$('.rectangle-block'), null);
});

const overrides2 = [
    {
        // headline has fewer than 40 characters
        condition: ['<', ['length', ['stripHtml', ['get', 'title']]], 40],
        settings: {
            'typography.headline.fontSize': 32
        }
    }
];

test('default headline size if title too long', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'This is a long headline with more than 40 characters' },
        themeData: { overrides: overrides2 }
    });

    t.is(await getElementStyle(page, 'h3', 'font-size'), '20px');
});

test('larger headline font if title is short enough', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'This is a short headline' },
        themeData: { overrides: overrides2 }
    });

    t.is(await getElementStyle(page, 'h3', 'font-size'), '32px');
});

test('larger headline font if text title short enough', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'This is a short <span style="color: red">HTML</span> headline' },
        themeData: { overrides: overrides2 }
    });

    t.is(await getElementStyle(page, 'h3', 'font-size'), '32px');
});
