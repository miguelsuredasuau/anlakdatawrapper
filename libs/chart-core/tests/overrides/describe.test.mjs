import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    // true, if chart has source but no source URL
    {
        condition: ['all', ['has', 'describe.source-name'], ['!', ['has', 'describe.source-url']]],
        settings: {
            'typography.headline.color': '#ff0000'
        }
    }
];

test('default headline color', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world' },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(24, 24, 24)');
});

test('no headline color change if source has url', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: { describe: { 'source-name': 'ACME', 'source-url': 'https://acme.org' } }
        },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(24, 24, 24)');
});

test('red headline if just source is given', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            title: 'Hello world',
            metadata: { describe: { 'source-name': 'ACME' } }
        },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(255, 0, 0)');
});
