import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerHtml, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('default headline', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                visualize: {}
            }
        }
    });
    t.is(await getElementInnerHtml(page, '.dw-chart-header h3 span'), 'Hello world');
});

test('headline typography', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                visualize: {}
            }
        },
        themeData: {
            typography: {
                headline: {
                    cursive: true,
                    fontSize: 30,
                    fontWeight: 400,
                    typeface: 'serif',
                    color: '#660000',
                    letterSpacing: 2,
                    lineHeight: 25,
                    textTransform: 'lowercase',
                    underlined: true,
                    fontStretch: 'expanded'
                }
            }
        }
    });
    t.is(await getElementStyle(page, 'h3', 'font-size'), '30px');
    t.is(await getElementStyle(page, 'h3', 'font-weight'), '400');
    t.is(await getElementStyle(page, 'h3', 'font-family'), 'serif');
    t.is(await getElementStyle(page, 'h3', 'font-style'), 'italic');
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(102, 0, 0)');
    t.is(await getElementStyle(page, 'h3', 'letter-spacing'), '2px');
    t.is(await getElementStyle(page, 'h3', 'line-height'), '25px');
    t.is(await getElementStyle(page, 'h3', 'text-transform'), 'lowercase');
    t.is(await getElementStyle(page, 'h3', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, 'h3', 'font-stretch'), '125%');
});

test('headline styles', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                visualize: {}
            }
        },
        themeData: {
            style: {
                header: {
                    title: {
                        background: '#ffccee',
                        textAlign: 'center',
                        padding: '4px 10px',
                        margin: '0 0 20px',
                        border: {
                            top: '2px solid #990000',
                            right: '2px solid #990000',
                            bottom: '2px solid #990000',
                            left: '2px solid #990000'
                        }
                    }
                }
            }
        }
    });

    t.is(await getElementStyle(page, 'h3', 'background-color'), 'rgb(255, 204, 238)');
    t.is(await getElementStyle(page, 'h3', 'text-align'), 'center');
    t.is(await getElementStyle(page, 'h3', 'padding'), '4px 10px');
    t.is(await getElementStyle(page, 'h3', 'margin-bottom'), '20px');
    t.is(await getElementStyle(page, 'h3', 'border-top'), '2px solid rgb(153, 0, 0)');
    t.is(await getElementStyle(page, 'h3', 'border-right'), '2px solid rgb(153, 0, 0)');
    t.is(await getElementStyle(page, 'h3', 'border-bottom'), '2px solid rgb(153, 0, 0)');
    t.is(await getElementStyle(page, 'h3', 'border-left'), '2px solid rgb(153, 0, 0)');
});

test('move headline into footer', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: {
                visualize: {}
            }
        },
        themeData: {
            options: {
                blocks: {
                    headline: {
                        region: 'aboveFooter'
                    }
                }
            }
        }
    });

    t.is(await getElementInnerHtml(page, '.dw-above-footer h3 span'), 'Hello world');
});
