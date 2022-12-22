import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('core body styles', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            style: {
                body: {
                    border: {
                        bottom: '1px solid #ff0000',
                        left: '1px solid #ff0000',
                        right: '1px solid #ff0000',
                        top: '1px solid #ff0000'
                    },
                    margin: '5px 0',
                    padding: '10px'
                }
            }
        }
    });
    t.is(
        await getElementStyle(page, '.dw-chart-styles', 'border-bottom'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-styles', 'border-left'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(
        await getElementStyle(page, '.dw-chart-styles', 'border-right'),
        '1px solid rgb(255, 0, 0)'
    );
    t.is(await getElementStyle(page, '.dw-chart-styles', 'border-top'), '1px solid rgb(255, 0, 0)');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'margin'), '5px 0px');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'padding'), '10px');
});

test('chart typography', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        themeData: {
            typography: {
                chart: {
                    color: '#ff0000',
                    fontSize: 13,
                    fontStretch: 'condensed',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    typeface: 'Arial'
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-styles', 'color'), 'rgb(255, 0, 0)');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'font-size'), '13px');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'font-stretch'), '75%');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'letter-spacing'), '1.5px');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'text-transform'), 'uppercase');
    t.is(await getElementStyle(page, '.dw-chart-styles', 'font-family'), 'Arial');
});
