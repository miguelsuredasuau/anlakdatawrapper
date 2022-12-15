import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementBoundingBox } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('non-rtl chart header aligns left', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                describe: {
                    intro: 'Intro'
                }
            }
        }
    });
    t.is((await getElementBoundingBox(page, 'h3 span')).left, 0);
    t.is((await getElementBoundingBox(page, '.description-block .block-inner')).left, 0);
});

test('rtl chart header aligns right', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                describe: {
                    intro: 'Intro'
                }
            }
        },
        textDirection: 'rtl'
    });
    const width = 600;
    t.is(width - (await getElementBoundingBox(page, 'h3 span')).right, 0);
    t.is(width - (await getElementBoundingBox(page, '.description-block .block-inner')).right, 0);
});
