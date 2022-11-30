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
                    cursive: 1
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.notes-block', 'font-style'), 'italic');
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
