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
                describe: {
                    'source-name': 'Source Name',
                    byline: 'Foo'
                },
                visualize: {}
            }
        }
    });
    t.is(await getElementInnerText(page, '.byline-block'), 'Chart: Foo ');
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementStyle(page, '.footer-left .separator', 'content', ':before'), '"•"');
});

test('custom separator', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name',
                    byline: 'Foo'
                },
                visualize: {}
            }
        },
        themeData: {
            options: {
                footer: {
                    separator: "' ~ '"
                }
            }
        }
    });
    t.is(await getElementStyle(page, '.footer-left .separator', 'content', ':before'), '" ~ "');
});
