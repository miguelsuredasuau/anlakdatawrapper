import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

const overrides = [
    // override headline font size for viewports < 450px
    {
        condition: ['==', ['get', 'custom.headcol'], 'red'],
        settings: {
            'typography.headline.color': '#ff0000'
        }
    },
    {
        condition: ['==', ['get', 'custom.headcol'], 'blue'],
        settings: {
            'typography.headline.color': '#0000ff'
        }
    }
];

test('default headline color', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { custom: {} } },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(24, 24, 24)');
});

test('red headline color', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { custom: { headcol: 'red' } } },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(255, 0, 0)');
});

test('blue headline color', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: { title: 'Hello world', metadata: { custom: { headcol: 'blue' } } },
        themeData: { overrides }
    });
    t.is(await getElementStyle(page, 'h3', 'color'), 'rgb(0, 0, 255)');
});
