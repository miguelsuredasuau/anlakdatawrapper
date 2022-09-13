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

    await page.setContent(
        `<html>
    <body>
        <div class="dw-chart">
            <div class="dw-chart-body"></div>
        </div>
    </body>
</html>`
    );

    await page.addScriptTag({
        content: await readFile(join(pathToChartCore, 'dist/dw-2.0.min.js'), 'utf-8')
    });

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
    return await page.evaluate(
        async ({ chart, dataset, visMeta, theme, flags, translations, textDirection }) => {
            /* eslint-env browser */
            /* global dw */
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
            await dwChart.load(dataset);
            dwChart.locales = {};
            dwChart.vis(vis);
            dwChart.render(container);
            return theme;
        },
        props
    );
}
