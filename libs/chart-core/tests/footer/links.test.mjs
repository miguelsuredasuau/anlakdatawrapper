import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const metadata = {
    describe: {
        intro: 'A <a href="#">link in the intro</a>'
    },
    annotate: {
        notes: 'Here are <a href="#">some links</a> in notes'
    }
};

test('default footer links', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { metadata }
    });
    t.is(await getElementStyle(page, '.description-block a', 'color'), 'rgb(51, 153, 204)');
    t.is(await getElementStyle(page, '.description-block a', 'border-bottom-width'), '0px');
    t.is(await getElementStyle(page, '.notes-block a', 'color'), 'rgb(51, 153, 204)');
    t.is(await getElementStyle(page, '.notes-block a', 'border-bottom-width'), '0px');
});

test('custom footer link style', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { metadata },
        themeData: {
            style: { footer: { links: { border: { bottom: '2px solid #3399cc' } } } }
        }
    });
    t.is(await getElementStyle(page, '.description-block a', 'color'), 'rgb(51, 153, 204)');
    t.is(await getElementStyle(page, '.description-block a', 'border-bottom-width'), '0px');
    t.is(await getElementStyle(page, '.notes-block a', 'color'), 'rgb(51, 153, 204)');
    t.is(await getElementStyle(page, '.notes-block a', 'border-bottom-width'), '2px');
});
