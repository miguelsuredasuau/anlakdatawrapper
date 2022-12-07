import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerHtml, getElementInnerText, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('notes', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here are <u>some</u> notes'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.notes-block', 'font-style'), 'normal');
    t.is(await getElementInnerText(page, '.notes-block'), 'Here are some notes');
    t.is(await getElementInnerHtml(page, '.notes-block > span'), 'Here are <u>some</u> notes');
});

test('notes styles', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here are <u>some</u> notes'
                }
            }
        },
        themeData: {
            style: {
                notes: {
                    padding: '10px',
                    margin: '5px 0 10px',
                    textAlign: 'center'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.notes-block', 'padding'), '10px');
    t.is(await getElementStyle(page, '.notes-block', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.notes-block', 'text-align'), 'center');
});

test('notes typography', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here are <u>some</u> notes'
                }
            }
        },
        themeData: {
            typography: {
                notes: {
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
    t.is(await getElementStyle(page, '.notes-block', 'font-family'), 'Arial');
    t.is(await getElementStyle(page, '.notes-block', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.notes-block', 'font-style'), 'italic');
    t.is(await getElementStyle(page, '.notes-block', 'line-height'), '20px');
    t.is(await getElementStyle(page, '.notes-block', 'font-weight'), '300');
    t.is(await getElementStyle(page, '.notes-block', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.notes-block', 'letter-spacing'), '1px');
    t.is(await getElementStyle(page, '.notes-block', 'text-decoration-line'), 'underline');
    t.is(await getElementStyle(page, '.notes-block', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.notes-block', 'color'), 'rgb(153, 153, 153)');
});

test('notes prepend', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                annotate: {
                    notes: 'Here are <u>some</u> notes'
                }
            }
        },
        themeData: {
            options: {
                blocks: {
                    notes: {
                        prepend: 'Notes:'
                    }
                }
            }
        }
    });
    t.is(await getElementInnerText(page, '.notes-block'), 'Notes: Here are some notes');
});
