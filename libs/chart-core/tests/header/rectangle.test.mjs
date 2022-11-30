import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerHtml, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const rectangle = {
    data: {
        width: 100,
        height: 4,
        background: '#00FF00'
    }
};

test('rectangle', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                visualize: {}
            }
        },
        themeData: {
            options: {
                blocks: {
                    rectangle
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.rectangle-block .export-rect', 'width'), '100px');
    t.is(await getElementStyle(page, '.rectangle-block .export-rect', 'height'), '4px');
    t.is(
        await getElementStyle(page, '.rectangle-block .export-rect', 'background-color'),
        'rgb(0, 255, 0)'
    );
    // headline renders after rect
    t.is(await getElementInnerHtml(page, '.rectangle-block + .headline-block span'), 'Headline');
});

test('rectangle below ', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Headline',
            metadata: {
                visualize: {}
            }
        },
        themeData: {
            options: {
                blocks: {
                    headline: {
                        priority: 1
                    },
                    rectangle: {
                        priority: 2,
                        ...rectangle
                    }
                }
            }
        }
    });
    // rectangle renders after headline
    t.is(
        await getElementStyle(page, '.headline-block + .rectangle-block .export-rect', 'width'),
        '100px'
    );
});
