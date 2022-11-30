import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('basic chart header', async t => {
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
    t.is(await getElementStyle(page, '.dw-chart-header', 'margin'), '0px');
});

test('custom header styles', async t => {
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
        themeData: {
            style: {
                header: {
                    padding: '12px',
                    margin: '5px 0 10px',
                    background: '#ffffff',
                    border: {
                        left: '5px solid red'
                    }
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.dw-chart-header', 'padding'), '12px');
    t.is(await getElementStyle(page, '.dw-chart-header', 'margin'), '5px 0px 10px');
    t.is(await getElementStyle(page, '.dw-chart-header', 'background-color'), 'rgb(255, 255, 255)');
    t.is(
        await getElementStyle(page, '.dw-chart-header', 'border-left'),
        '5px solid rgb(255, 0, 0)'
    );
    t.is(await getElementStyle(page, '.dw-chart-header', 'border-left-color'), 'rgb(255, 0, 0)');
});
