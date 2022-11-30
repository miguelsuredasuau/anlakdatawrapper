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

    const logs = await renderDummy(t, {
        chart: {
            metadata: {
                describe: {
                    'source-name': 'Source Name'
                },

                visualize: {}
            }
        }
    });
    // must render without logging errors
    t.is(logs.length, 0);
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block span.source'), 'Source Name');
});

test('chart source with URL', async t => {
    const { page } = t.context;

    const logs = await renderDummy(t, {
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
    // must render without logging errors
    t.is(logs.length, 0);
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
    t.is(await getElementAttribute(page, '.source-block a.source', 'href'), 'https://example.com');
});

test('chart source with invalid URL', async t => {
    const { page } = t.context;

    const logs = await renderDummy(t, {
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
    // must render without logging errors
    t.is(logs.length, 0);
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block span.source'), 'Source Name');
});

test('chart source with custom caption', async t => {
    const { page } = t.context;

    const logs = await renderDummy(t, {
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
            options: {
                blocks: {
                    source: {
                        data: {
                            caption: 'Data'
                        }
                    }
                }
            }
        }
    });
    // must render without logging errors
    t.is(logs.length, 0);
    t.is(await getElementInnerText(page, '.source-block'), 'Data: Source Name');
    t.is(await getElementInnerHtml(page, '.source-block .source-caption'), 'Data:');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Source Name');
});

test('chart source with appended HTML', async t => {
    const { page } = t.context;

    const logs = await renderDummy(t, {
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
            options: {
                blocks: {
                    source: {
                        append: 'Foo'
                    }
                }
            }
        }
    });
    // must render without logging errors
    t.is(logs.length, 0);
    t.is(await getElementInnerText(page, '.source-block'), 'Source: Name Foo');
    t.is(await getElementInnerHtml(page, '.source-block a.source'), 'Name');
    t.is(await getElementInnerHtml(page, '.source-block .append'), 'Foo');
});
