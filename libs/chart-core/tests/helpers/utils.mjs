import { readFile } from 'fs/promises';
import { createBrowser, createPage, render, takeTestScreenshot } from './setup.mjs';

const visMeta = {
    axes: {}
};

export async function before(t) {
    t.context.translations = {};

    t.context.browser = await createBrowser({
        // devtools: true
    });
}

export async function beforeEach(t) {
    t.context.page = await createPage(t.context.browser);

    const js = await readFile('./tests/helpers/data/dummy.vis.js', 'utf-8');
    await Promise.all([t.context.page.addScriptTag({ content: js })]);
}

export async function after(t) {
    await t.context.browser.close();
}

export async function afterEach(t) {
    if (!t.passed) {
        console.error({ body: await t.context.page.$eval('body', n => n.innerHTML.trim()) });
        await takeTestScreenshot(t, './tests/failed');
    }
    await t.context.page.close();
}

export async function renderDummy(t, props) {
    const { page, translations } = t.context;
    if (!props.chart)
        props.chart = {
            metadata: { axes: {} }
        };
    props.chart.type = 'dummy';
    props.chart.theme = props.chart.theme || 'test';
    if (!props.dataset) props.dataset = 'label,value';

    return await render(page, {
        ...props,
        visMeta,
        translations
    });
}
