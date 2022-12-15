import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';
import { setTimeout } from 'timers/promises';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const chart = { title: 'Hello world', metadata: { annotate: { notes: 'Some notes.' } } };

test('background gets set on body and updates when dark mode state changes', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart,
        flags: { dark: 'auto' },
        themeData: {
            style: {
                body: {
                    background: '#ffffff'
                }
            },
            overrides: [
                {
                    type: 'darkMode',
                    settings: {
                        'style.body.background': '#000000'
                    }
                }
            ]
        }
    });

    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await setTimeout(300);
    t.is(await getElementStyle(page, 'body', 'background-color'), 'rgb(255, 255, 255)');

    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
    await setTimeout(300);
    t.is(await getElementStyle(page, 'body', 'background-color'), 'rgb(0, 0, 0)');
    // await setTimeout(10000);
    await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
    await setTimeout(300);
    t.is(await getElementStyle(page, 'body', 'background-color'), 'rgb(255, 255, 255)');
});

test('no background set on chart when transparent flag is true', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart,
        flags: { transparent: true },
        themeData: {
            style: {
                body: {
                    background: '#ff0000'
                }
            }
        }
    });
    t.is(await getElementStyle(page, 'body', 'background-color'), 'rgba(0, 0, 0, 0)');
});
