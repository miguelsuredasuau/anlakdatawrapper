import { readFile } from 'fs/promises';
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const pathToChartCore = join(dirname(fileURLToPath(import.meta.url)), '../..');

export function createBrowser() {
    return puppeteer.launch();
}

export async function createPage(browser) {
    const page = await browser.newPage();
    await page.setViewport({
        width: 600,
        height: 500,
        deviceScaleFactor: 2
    });

    await page.setContent(
        `<html>
    <body>
        <div class="dw-chart" id="__svelte-dw">
            <div class="dw-chart-body"></div>
        </div>
    </body>
</html>`
    );

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

    page.on('console', evt => process.stdout.write('CONSOLE: ' + evt.text() + '\n'));

    return page;
}

const DEFAULT_THEME = {
    colors: {
        background: '#ffffff',
        palette: [
            '#18a1cd',
            '#1d81a2',
            '#15607a',
            '#00dca6',
            '#09bb9f',
            '#009076',
            '#c4c4c4',
            '#c71e1d',
            '#fa8c00',
            '#ffca76',
            '#ffe59c'
        ]
    },
    body: {}
};

export async function render(page, props) {
    props.theme = props.theme || DEFAULT_THEME;
    props.translations = props.translations || { 'en-US': {} };

    const state = {
        ...props
    };

    await page.addScriptTag({
        content: `window.__DW_SVELTE_PROPS__ = ${JSON.stringify(state)};`
    });

    return await page.evaluate(
        async ({ chart, dataset, visMeta, theme, flags, translations, textDirection }) => {
            /* eslint-env browser */
            /* global dw, createEmotion */

            const target = document.querySelector('.dw-chart-body');
            const container = document.querySelector('.dw-chart');
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
}
