const Boom = require('@hapi/boom');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const pug = require('pug');
const { Team } = require('@datawrapper/orm/models');
const chartCore = require('@datawrapper/chart-core');
const { loadVendorLocale, loadLocaleConfig } = require('@datawrapper/service-utils/loadLocales');
const dwChart = require('@datawrapper/chart-core/dist/dw-2.0.cjs.js').dw.chart;
const get = require('lodash/get');
const {
    stringify,
    readFileAndHash,
    copyFileHashed,
    writeFileHashed,
    noop
} = require('../index.js');
const renderHTML = pug.compileFile(path.resolve(__dirname, './index.pug'));

/**
 * @typedef {Object} Options
 * @property {Object} auth - Hapi.js `auth` object
 * @property {Object} server - Hapi.js `server` object
 * @property {function} [log] - Logging function
 * @property {boolean} [includePolyfills] - Flag to decide if polyfills should get included
 * @property {boolean} [zipExport] - Flag to include assets directly for ZIP export
 * @property {boolean} [publish] - Flag to indicate that this chart is to be published (not previewed or exported)
 */

/**
 * @typedef {Object} Result
 * @property {Object} chart - Sequelize Chart model
 * @property {string} data - Chart data (usually csv)
 * @property {string} outDir - Path to the chart website
 * @property {string[]} fileMap - List of files included in `outDir`
 * @property {function} cleanup - Function to remove `outDir`
 */

/**
 * Creates a static website for a given chart.
 * Used for publishing and zip export.
 *
 * @param {string} chartId - ID of the chart
 * @param {Options} options
 * @returns {Result}
 */
module.exports = async function createChartWebsite(
    chart,
    {
        auth,
        headers,
        server,
        log = noop,
        includePolyfills = true,
        zipExport = false,
        publish = false
    } = {}
) {
    /**
     * Load chart information
     * (including metadata, data, basemaps, etc.)
     */
    const { result, statusCode } = await server.inject({
        url: `/v3/charts/${chart.id}/publish/data${publish ? '?publish=true' : ''}`,
        auth,
        headers
    });

    // also load dark mode theme & styles
    const themeDark = (
        await server.inject({
            url: `/v3/themes/${chart.theme}?extend=true&dark=true`,
            auth,
            headers
        })
    ).result;
    const cssDark = (
        await server.inject({
            url: `/v3/visualizations/${chart.type}/styles.css?theme=${chart.theme}&dark=true`,
            auth,
            headers
        })
    ).result;

    if (statusCode >= 400) {
        throw new Boom.Boom(result.message || 'Failed to publish chart data', { statusCode });
    }
    let publishData = result;

    if (chart.error) {
        throw Boom.notFound();
    }

    const team = await Team.findByPk(chart.organization_id);
    const chartLocale = publishData.chart.language || 'en-US';
    const locales = {
        dayjs: await loadVendorLocale('dayjs', chartLocale, team),
        numeral: await loadVendorLocale('numeral', chartLocale, team)
    };
    const localeConfig = await loadLocaleConfig(chartLocale);

    // no need to await this...
    log('preparing');

    publishData = Object.assign(publishData, {
        isIframe: true,
        isPreview: false,
        locales,
        polyfillUri: `../../lib/vendor`,
        teamPublicSettings: team ? team.getPublicSettings() : {},
        themeDataDark: themeDark.data,
        themeDataLight: publishData.theme.data,
        textDirection: localeConfig.textDirection || 'ltr'
    });

    log('rendering');

    const { html, head } = chartCore.svelte.render(publishData);

    let dependencies = ['dw-2.0.min.js'].map(file => path.join(chartCore.path.dist, file));

    /* Create a temporary directory */
    const outDir = await fs.mkdtemp(path.resolve(os.tmpdir(), `dw-chart-${chart.id}-`));

    /* Copy assets */
    const assets = {};
    const assetsFiles = [];
    let chartData = null;

    for (const { name, prefix = '', shared, value, load = true } of publishData.assets) {
        if (name === `dataset.${get(chart, 'metadata.data.json') ? 'json' : 'csv'}`) {
            chartData = value;
        }

        assets[name] = { load };

        if (zipExport && load) {
            // in ZIP export, bake assets directly into HTML, unless asset specifies otherwise via false load option
            assets[name].value = value;
        } else {
            const filename = path.join(
                shared ? prefix : '',
                await writeAsset(name, value ?? '', outDir, shared)
            );
            assets[name].url = getAssetLink((shared ? '../../lib/' : '') + filename);
            assetsFiles.push((shared ? 'lib/' : '') + filename);
        }
    }

    publishData.assets = assets;

    /* Copy dependencies into temporary directory and hash them on the way */
    const dependencyPromises = [
        dependencies,
        publishData.visualization.libraries.map(lib => lib.file)
    ]
        .flat()
        .map(filePath => copyFileHashed(filePath, outDir));

    dependencies = (await Promise.all(dependencyPromises)).map(file =>
        path.join('lib/vendor/', file)
    );

    const { fileName, content } = await readFileAndHash(publishData.visualization.script);

    const [coreScript] = await Promise.all([
        copyFileHashed(path.join(chartCore.path.dist, 'main.js'), path.join(outDir)),
        fs.writeFile(path.join(outDir, fileName), content)
    ]);

    const [polyfillScript] = await Promise.all([
        copyFileHashed(path.join(chartCore.path.dist, 'load-polyfills.js'), path.join(outDir)),
        fs.writeFile(path.join(outDir, fileName), content)
    ]);

    dependencies.push(path.join('lib/vis/', fileName));

    function getAssetLink(asset) {
        return zipExport ? path.basename(asset) : asset;
    }

    async function writeAsset(name, value, outDir, hashFileName) {
        const fileName = hashFileName ? await writeFileHashed(name, value, outDir) : name;
        if (hashFileName) return fileName;
        // write file with unmodified filename
        await fs.writeFile(path.join(outDir, name), value, { encoding: 'utf-8' });
        return fileName;
    }

    const config = server.methods.config('general');
    const blocksFilePromises = publishData.blocks
        .filter(block => block.include && block.prefix)
        .map(async ({ prefix, publish, blocks }) => {
            const [js, css] = await Promise.all([
                copyFileHashed(path.join(config.localPluginRoot, publish.js), outDir, { prefix }),
                copyFileHashed(path.join(config.localPluginRoot, publish.css), outDir, { prefix })
            ]);
            return {
                source: {
                    js: getAssetLink(`../../lib/blocks/${js}`),
                    css: getAssetLink(`../../lib/blocks/${css}`)
                },
                blocks
            };
        });

    const publishedBlocks = await Promise.all(blocksFilePromises);
    const blocksFiles = publishedBlocks
        .map(({ source }) => [source.js.replace('../../', ''), source.css.replace('../../', '')])
        .flat();

    publishData.blocks = publishedBlocks;

    const css = publishData.styles;
    const fonts = publishData.theme.fontsCSS;
    delete publishData.styles;
    delete publishData.theme.fontsCSS;

    const cssFile = await writeFileHashed(
        `${chart.type}.${chart.theme}.css`,
        `${fonts}\n${css}`,
        outDir
    );

    const cssFileDark = await writeFileHashed(
        `${chart.type}.${chart.theme}-dark.css`,
        `${fonts}\n${cssDark}`,
        outDir
    );

    const themeAutoDark = get(publishData.theme.data, 'options.darkMode.auto', 'user');
    const autoDark =
        themeAutoDark === 'user'
            ? get(chart, 'metadata.publish.autoDarkMode', false)
            : themeAutoDark;

    /**
     * Render the visualizations entry: "index.html"
     */
    const indexHTML = renderHTML({
        __DW_SVELTE_PROPS__: stringify(publishData),
        CHART_LANGUAGE: chartLocale.split(/_|-/)[0],
        META_ROBOTS: 'noindex, indexifembedded, nofollow',
        CHART_HTML: html,
        CHART_HEAD: head,
        CHART_AFTER_HEAD_HTML: publishData.chartAfterHeadHTML,
        POLYFILL_SCRIPT: getAssetLink(`../../lib/${polyfillScript}`),
        CORE_SCRIPT: getAssetLink(`../../lib/${coreScript}`),
        CSS: getAssetLink(`../../lib/vis/${cssFile}`),
        CSS_DARK: getAssetLink(`../../lib/vis/${cssFileDark}`),
        AUTO_DARK: autoDark,
        SCRIPTS: dependencies.map(file => getAssetLink(`../../${file}`)),
        CHART_CLASS: [
            `vis-height-${get(publishData.visualization, 'height', 'fit')}`,
            `theme-${get(publishData.theme, 'id')}`,
            `vis-${get(publishData.visualization, 'id')}`
        ]
    });

    publishData.dependencies = dependencies.map(file => getAssetLink(`../../${file}`));

    let polyfillFiles = [];
    if (includePolyfills) {
        /* Copy polyfills to destination */
        const polyfillPromises = chartCore.polyfills.map(async filePath => {
            const file = path.basename(filePath);
            await fs.copyFile(filePath, path.join(outDir, file));
            return path.join('lib/vendor/', file);
        });
        polyfillFiles = await Promise.all(polyfillPromises);
    }

    /* write "index.html", visualization Javascript and other assets */
    await fs.writeFile(path.join(outDir, 'index.html'), indexHTML, { encoding: 'utf-8' });

    /* write "data.csv", including changes made in step 2 */
    const dataset = await dwChart(publishData.chart).load(chartData || '');
    const isJSON = get(publishData.chart, 'metadata.data.json');
    const dataFile = `data.${isJSON ? 'json' : 'csv'}`;
    await fs.writeFile(
        path.join(outDir, dataFile),
        isJSON ? JSON.stringify(dataset) : dataset.csv(),
        { encoding: 'utf-8' }
    );

    const webComponentJS = await fs.readFile(
        path.join(chartCore.path.dist, 'web-component.js'),
        'utf-8'
    );
    publishData.styles = css;
    publishData.theme.fontsCSS = fonts;
    const webComponent =
        webComponentJS + `\n\nwindow.datawrapper.render(${JSON.stringify(publishData)});`;
    /* write "embed.js" for embedding as web component*/
    await fs.writeFile(path.join(outDir, 'embed.js'), webComponent, { encoding: 'utf-8' });

    const fileMap = [
        ...dependencies.map(path => {
            return { path, hashed: true };
        }),
        ...polyfillFiles.map(path => {
            return { path, hashed: false };
        }),
        ...blocksFiles.map(path => {
            return { path, hashed: true };
        }),
        ...assetsFiles.map(path => {
            return { path, hashed: true };
        }),
        { path: path.join('lib/', polyfillScript), hashed: true },
        { path: path.join('lib/', coreScript), hashed: true },
        { path: path.join('lib/vis', cssFile), hashed: true },
        { path: path.join('lib/vis', cssFileDark), hashed: true },
        { path: 'index.html', hashed: false },
        { path: 'embed.js', hashed: false },
        { path: dataFile, hashed: false }
    ];

    async function cleanup() {
        await fs.remove(outDir);
    }

    return { data: publishData, chartData, outDir, fileMap, cleanup };
};
