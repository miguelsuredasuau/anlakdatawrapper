import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementBoundingBox } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('non-rtl footer aligns left', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { byline: 'Datawrapper' },
                annotate: { notes: 'Here are <u>some</u> notes' }
            }
        }
    });
    t.is((await getElementBoundingBox(page, '.footer-left')).left, 0);
    t.is(Math.round((await getElementBoundingBox(page, '.footer-right')).right), 600);
});

test('rtl footer aligns right', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { byline: 'Datawrapper' },
                annotate: { notes: 'Here are <u>some</u> notes' }
            }
        },
        textDirection: 'rtl'
    });
    t.is((await getElementBoundingBox(page, '.footer-left')).right, 600);
    t.is(Math.round((await getElementBoundingBox(page, '.footer-right')).right), 0);
});
