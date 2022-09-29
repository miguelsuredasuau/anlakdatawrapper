import { readFile, mkdir } from 'fs/promises';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createHash } from 'crypto';
import deepmerge from 'deepmerge';
import { compileCSS } from '../../lib/styles/compile-css.js';
import MemoryCache from '@datawrapper/service-utils/MemoryCache.js';
import { setTimeout } from 'timers/promises';

const pathToChartCore = join(dirname(fileURLToPath(import.meta.url)), '../..');

const emptyPage = `<html>
        <body>
            <div class="dw-chart" id="__svelte-dw">
                <div id="chart" class="dw-chart-body"></div>
            </div>
        </body>
    </html>`;

/**
 * Creates a new Puppeteer browser
 * @param {Object} puppeteerOptions
 * @param {boolean} puppeteerOptions.headless set to false to visually debug page
 * @param {boolean} puppeteerOptions.devtools set to true to open page with devtools on
 * @param {string[]} puppeteerOptions.args
 * @returns {Browser}
 */
export function createBrowser(puppeteerOptions = {}) {
    return puppeteer.launch(puppeteerOptions);
}

/**
 * Creates a new empty HTML page with a DOM ready to
 * render visualizations in it.
 *
 * @param {Browser} browser
 * @param {Object} viewportOpts
 * @param {number} viewportOpts.width
 * @param {number} viewportOpts.height
 * @param {number} viewportOpts.deviceScaleFactor
 * @returns {Promise} Promise that resolves when the page has been created
 */
export async function createPage(browser, viewportOpts = {}) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 600,
        height: 500,
        deviceScaleFactor: 1,
        ...viewportOpts
    });

    await page.setContent(emptyPage);

    await page.addScriptTag({
        content: await readFile(join(pathToChartCore, 'dist/dw-2.0.min.js'), 'utf-8')
    });

    // load emotion
    await page.addScriptTag({
        content: await readFile(
            join(
                pathToChartCore,
                'node_modules',
                '@emotion/css/create-instance',
                'dist/emotion-css-create-instance.umd.min.js'
            ),
            'utf-8'
        )
    });

    return page;
}

/**
 * Renders a chart described by `props` on a Puppeteer `page`.
 *
 * @param {Page} page Puppeteer page instance
 * @param {Object} props
 * @param {Object} props.chart
 * @param {string} props.dataset
 * @param {Object} props.theme
 * @param {Object} props.translations
 * @param {Object} props.visMeta
 * @param {Object} props.flags
 * @param {Object} props.textDirection
 * @returns {Object[]} console log messages
 */
export async function render(page, props, delay = 0) {
    const baseTheme = JSON.parse(
        await readFile(join(pathToChartCore, 'tests/helpers/data/theme.json'), 'utf-8')
    );
    props.theme = deepmerge(props.theme || {}, baseTheme.data);
    props.translations = props.translations || { 'en-US': {} };

    await page.addStyleTag({
        content: await getCSS(props)
    });

    const state = {
        ...props
    };

    await page.addScriptTag({
        content: `window.__DW_SVELTE_PROPS__ = ${JSON.stringify(state)};`
    });

    const logs = [];

    page.on('console', event => {
        logs.push({ type: event.type(), text: event.text() });
    });

    await page.evaluate(
        async ({ chart, dataset, visMeta, theme, flags, translations, textDirection }) => {
            /* eslint-env browser */
            /* global dw, createEmotion */
            const target = document.querySelector('.dw-chart-body');
            const container = document.querySelector('.dw-chart');

            container.setAttribute('class', `dw-chart chart theme-test vis-${chart.type}`);

            const dwChart = dw
                .chart(chart)
                .locale((chart.language || 'en-US').substr(0, 2))
                .translations(translations)
                .theme({ ...theme })
                .flags({ isIframe: true, ...flags });

            const vis = dw.visualization(chart.type, target);
            vis.meta = visMeta;
            vis.lang = chart.language || 'en-US';
            vis.textDirection = textDirection || 'ltr';
            // load chart data and assets
            if (!dwChart.emotion) {
                dwChart.emotion = createEmotion({
                    key: `datawrapper-${chart.id}`,
                    container: document.head
                });
            }

            await dwChart.load(dataset);
            dwChart.locales = {};
            dwChart.vis(vis);
            dwChart.render(container);
        },
        props
    );

    if (delay) await setTimeout(delay);

    return logs;
}

/**
 * this cache is used to avoid compiling LESS for the same
 * theme-vis combination multiple times during the same test
 * run
 */
const styleCache = new MemoryCache();

/**
 * Compiles the CSS stylesheet for a given theme-vis combination
 *
 * @param {Object} props
 * @param {Object} props.visMeta
 * @param {Object} props.theme
 * @returns {string} the css code
 */
async function getCSS(props) {
    const key = createHash('md5')
        .update(
            JSON.stringify({
                vis: props.visMeta.less,
                theme: props.theme
            })
        )
        .digest('hex');
    return styleCache.withCache(key, () => {
        return compileCSS({
            theme: { id: 'test', data: props.theme },
            filePaths: ['../../lib/styles.less', props.visMeta.less]
        });
    });
}

/**
 * Returns array with all CSS classes set for the specified selector
 *
 * @param {Page} page
 * @param {string} selector
 * @returns {string[]}
 */
export function getElementClasses(page, selector) {
    return page.$eval(selector, node => Array.from(node.classList));
}

/**
 * Returns a computed style for a given CSS selector
 * @param {Page} page
 * @param {string} selector
 * @param {string} style css property, e.g. "marginTop"
 * @returns {string}
 */
export function getElementStyle(page, selector, style) {
    return page.$eval(selector, (node, style) => getComputedStyle(node)[style], style);
}

/**
 * Takes a screenshot of `t.context.page` and saves it in directory `path`.
 */
export async function takeTestScreenshot(t, path) {
    await mkdir(path, { recursive: true });
    await t.context.page.screenshot({
        path: join(path, `${slugify(t.title.split('hook for')[1])}.png`)
    });
}

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
}
