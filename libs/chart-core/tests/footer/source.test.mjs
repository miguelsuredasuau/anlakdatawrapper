import test from 'ava';
import { before, beforeEach, after, afterEach, renderDummy } from '../helpers/utils.mjs';
import {
    getElementInnerHtml,
    getElementInnerText,
    getElementAttribute
} from '../helpers/setup.mjs';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);
test.after(after);

test('chart source without URL', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name'
                },

                visualize: {}
            }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block span.source'), 'Source Name');
});

test('chart source with URL', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name',
                    'source-url': 'https://example.com'
                },
                visualize: {}
            }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
    t.is(await getElementAttribute(page, '.source-block a.source', 'href'), 'https://example.com');
});

test('chart source with invalid URL', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name',
                    'source-url': 'htt://invalid.com'
                },
                visualize: {}
            }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block span.source'), 'Source Name');
});

test('chart source with empty caption', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name',
                    'source-url': 'https://example.com'
                },
                visualize: {}
            }
        },
        themeData: {
            options: { blocks: { source: { data: { caption: '' } } } }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
});

test('chart source with custom caption', async t => {
    const { page } = t.context;

    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name',
                    'source-url': 'https://example.com'
                },
                visualize: {}
            }
        },
        themeData: {
            options: { blocks: { source: { data: { caption: 'Data' } } } }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Data: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block .source-caption'), 'Data:');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
});

test('chart source with appended HTML', async t => {
    const { page } = t.context;
    await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Name',
                    'source-url': 'https://example.com'
                },
                visualize: {}
            }
        },
        themeData: {
            options: { blocks: { source: { append: 'Foo' } } }
        }
    });
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Name Foo');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Name');
    t.is(await getElementInnerHtml(page, '.source-block .append'), 'Foo');
});
