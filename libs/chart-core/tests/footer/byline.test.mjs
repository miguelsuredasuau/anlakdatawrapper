import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerText } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('chart byline', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: { describe: { byline: 'Datawrapper' } }
        }
    });
    t.is(await getElementInnerText(page, '.byline-block'), 'Chart: Datawrapper');
});

test('chart byline with empty caption', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: { describe: { byline: 'Datawrapper' } }
        },
        themeData: {
            options: { blocks: { byline: { data: { chartCaption: '' } } } }
        }
    });
    t.is(await getElementInnerText(page, '.byline-block'), 'Datawrapper');
});

test('chart byline with custom caption', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: { describe: { byline: 'Datawrapper' } }
        },
        themeData: {
            options: { blocks: { byline: { data: { chartCaption: 'Diagram by' } } } }
        }
    });
    t.is(await getElementInnerText(page, '.byline-block'), 'Diagram by Datawrapper');
});
