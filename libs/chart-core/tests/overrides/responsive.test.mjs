import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerHtml, getElementStyle } from '../helpers/setup.mjs';
import { setTimeout } from 'timers/promises';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    // override headline font size for viewports < 450px
    {
        condition: ['<', ['get', 'width'], 450],
        settings: {
            'typography.headline.fontSize': 24
        }
    },
    // override headlien font size for viewports >= 700
    {
        condition: ['>=', ['get', 'width'], 700],
        settings: {
            'typography.headline.fontSize': 36
        }
    }
];

test('responsive overrides for headline font size', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world' },
        themeData: {
            // default headline size
            typography: { headline: { fontSize: 30 } },
            overrides
        }
    });
    t.is(await getElementInnerHtml(page, '.dw-chart-header h3 span'), 'Hello world');
    t.is(await getElementStyle(page, 'h3', 'font-size'), '30px');

    // resize browser and wait a bit
    await page.setViewport({ width: 400, height: 600 });
    await setTimeout(300);

    t.is(await getElementStyle(page, 'h3', 'font-size'), '24px');

    // resize browser and wait a bit
    await page.setViewport({ width: 740, height: 600 });
    await setTimeout(300);

    t.is(await getElementStyle(page, 'h3', 'font-size'), '36px');
});
