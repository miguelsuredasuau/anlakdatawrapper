import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import { getElementInnerText, getElementStyle } from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('default separator', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        }
    });
    t.is(await getElementInnerText(page, '.byline-block'), 'Chart: Foo ');
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementStyle(page, '.footer-left .separator', 'content', ':before'), '"•"');
});

test('custom separator text', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: { footer: { separator: { text: "' ~ '" } } }
        }
    });
    t.is(await getElementStyle(page, '.footer-left .separator', 'content', ':before'), '" ~ "');
});

test('custom separator margin', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: { 'source-name': 'Source Name', byline: 'Foo' }
            }
        },
        themeData: {
            options: { footer: { separator: { margin: '0 20px' } } }
        }
    });
    t.is(await getElementStyle(page, '.footer-left .separator', 'margin', ':before'), '0px 20px');
});
