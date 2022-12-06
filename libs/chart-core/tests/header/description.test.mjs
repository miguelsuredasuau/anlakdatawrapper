import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerHtml, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const LOREM =
    'Reprehenderit laborum officia irure velit commodo Lorem est sint. Deserunt irure aute esse in veniam fugiat est. Tempor sint ea incididunt ex mollit sit qui adipisicing ipsum. Cillum proident magna voluptate dolor duis Lorem laborum deserunt eu velit reprehenderit cillum enim elit exercitation.';

test('default description', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                describe: {
                    intro: 'This is the <b>description</b>'
                },
                visualize: {}
            }
        }
    });
    t.is(await getElementInnerHtml(page, '.dw-chart-header h3 span'), 'Hello world');
    t.is(
        await getElementInnerHtml(page, '.dw-chart-header .description-block > span'),
        'This is the <b>description</b>'
    );
});

test('description typography', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    intro: LOREM
                }
            }
        },
        themeData: {
            typography: {
                description: {
                    typeface: 'Arial',
                    fontSize: 13,
                    cursive: 1,
                    lineHeight: 20,
                    fontWeight: 300,
                    fontStretch: 'condensed',
                    letterSpacing: 1,
                    underlined: true,
                    textTransform: 'uppercase',
                    color: '#999999'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.description-block', 'font-family'), 'Arial');
    t.is(await getElementStyle(page, '.description-block', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.description-block', 'font-style'), 'italic');
    t.is(await getElementStyle(page, '.description-block', 'line-height'), '20px');
    t.is(await getElementStyle(page, '.description-block', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.description-block', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.description-block', 'letter-spacing'), '1px');
    t.is(await getElementStyle(page, '.description-block', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, '.description-block', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.description-block', 'color'), 'rgb(153, 153, 153)');
});

test('description styles', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                visualize: {},
                describe: {
                    intro: LOREM
                }
            }
        },
        themeData: {
            style: {
                header: {
                    description: {
                        background: '#eeeeff',
                        textAlign: 'justify',
                        padding: '4px 10px',
                        margin: '0 0 20px',
                        border: {
                            top: '1px solid #990000',
                            right: '1px solid #990000',
                            bottom: '1px solid #990000',
                            left: '1px solid #990000'
                        }
                    }
                }
            }
        }
    });

    t.is(
        await getElementStyle(page, '.description-block', 'background-color'),
        'rgb(238, 238, 255)'
    );
    t.is(await getElementStyle(page, '.description-block', 'text-align'), 'justify');
    t.is(await getElementStyle(page, '.description-block', 'padding'), '4px 10px');
    t.is(await getElementStyle(page, '.description-block', 'margin-bottom'), '20px');
    t.is(
        await getElementStyle(page, '.description-block', 'border-top'),
        '1px solid rgb(153, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.description-block', 'border-right'),
        '1px solid rgb(153, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.description-block', 'border-bottom'),
        '1px solid rgb(153, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.description-block', 'border-left'),
        '1px solid rgb(153, 0, 0)'
    );
});
