import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerText, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    {
        condition: ['get', 'mode.static'],
        settings: {
            'options.blocks.notes': {
                region: 'belowHeader',
                append: 'This chart is static.'
            }
        }
    },
    {
        condition: ['get', 'mode.plain'],
        settings: {
            'style.chart.padding': '20px'
        }
    },
    {
        condition: ['get', 'mode.print'],
        settings: {
            'typography.headline.fontSize': 17.75
        }
    }
];

test('show no custom text if chart is rendered normal', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { annotate: { notes: 'Some notes.' } } },
        themeData: { overrides }
    });
    t.is(await page.$('.dw-below-header'), null);
    t.is(await getElementInnerText(page, '.notes-block'), 'Some notes.');
    t.is(await getElementStyle(page, '.dw-chart-body', 'padding'), '0px');
    t.is(await getElementStyle(page, 'h3', 'font-size'), '20px');
});

test('show custom text if chart is rendered static', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { annotate: { notes: 'Some notes.' } } },
        themeData: { overrides },
        flags: { static: true }
    });
    t.is(await getElementInnerText(page, '.dw-below-header'), 'Some notes. This chart is static.');
    t.is(await getElementStyle(page, '.dw-chart-body', 'padding'), '0px');
    t.is(await getElementStyle(page, 'h3', 'font-size'), '20px');
});

test('custom body padding in plain mode', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: {} },
        themeData: { overrides },
        flags: { plain: true }
    });
    t.is(await getElementStyle(page, '.dw-chart-body', 'padding'), '20px');
    t.is(await page.$('h3'), null);
});

test('custom headline size in print mode', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: {} },
        themeData: { overrides },
        flags: { svgonly: true }
    });
    t.is(await getElementStyle(page, '.dw-chart-body', 'padding'), '0px');
    t.is(await getElementStyle(page, 'h3', 'font-size'), '17.75px');
});
