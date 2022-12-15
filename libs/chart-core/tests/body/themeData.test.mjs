import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerText } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const metadata = {
    visualize: {}
};

test('theme gets passed to render code', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { metadata },
        themeData: { colors: { mode: { rotateLimit: 5 } } }
    });
    t.is(await getElementInnerText(page, '.dw-chart-body .rotate-limit'), '5');
});

test('theme override gets passed to render code, too', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { metadata },
        themeData: {
            colors: { mode: { rotateLimit: 5 } },
            overrides: [
                {
                    condition: ['==', ['get', 'type'], 'dummy'],
                    settings: { 'colors.mode.rotateLimit': 8 }
                }
            ]
        }
    });
    t.is(await getElementInnerText(page, '.dw-chart-body .rotate-limit'), '8');
});
