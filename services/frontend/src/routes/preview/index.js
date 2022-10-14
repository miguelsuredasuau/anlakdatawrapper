const { fakeBoolean, id: logoId } = require('@datawrapper/schemas/themeData/shared');
const { loadVendorLocale, loadLocaleConfig } = require('@datawrapper/service-utils/loadLocales');
const { Team } = require('@datawrapper/orm/models');
const chartCore = require('@datawrapper/chart-core');
const Joi = require('joi');
const Boom = require('@hapi/boom');
const jsesc = require('jsesc');
const get = require('lodash/get');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'routes/preview',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();
        const apiBase = `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
            config.api.domain
        }/v3`;
        const frontendBase = `${config.frontend.https ? 'https' : 'http'}://${
            config.frontend.domain
        }`;
        const validate = {
            params: Joi.object({
                chartId: Joi.string()
                    .alphanum()
                    .length(5)
                    .required()
                    .description('5 character long chart ID.')
            }),
            query: Joi.object({
                theme: Joi.string().optional(),
                ott: Joi.string().optional(),
                search: Joi.string().optional(),
                published: fakeBoolean(),
                static: fakeBoolean(),
                plain: fakeBoolean(),
                fitchart: fakeBoolean(),
                fitheight: fakeBoolean(),
                svgonly: fakeBoolean(),
                map2svg: fakeBoolean(),
                transparent: fakeBoolean(),
                logo: Joi.string().optional().valid('auto', 'on', 'off').default('auto'),
                logoId: logoId().optional(),
                dark: Joi.boolean().default(false).allow('auto')
            })
        };

        async function getChart(chartId, query, request) {
            const api = server.methods.createAPI(request);

            const queryString = Object.entries({
                published: query.published,
                ott: query.ott,
                theme: query.theme,
                transparent: query.transparent
            })
                .filter(([, value]) => Boolean(value))
                .map(([key, value]) => `${key}=${value}`)
                .join('&');

            let props;

            try {
                props = await api(`/charts/${chartId}/publish/data?${queryString}`);
            } catch (ex) {
                throw Boom.notFound();
            }

            // also load dark mode theme & styles
            const themeDark = {};
            const themeId = props.chart.theme;

            if (!server.app.visualizations.has(props.chart.type)) {
                throw Boom.badRequest('Invalid visualization type');
            }

            const darkThemePromises = [
                `/themes/${themeId}?extend=true&dark=true`,
                `/visualizations/${props.chart.type}/styles.css?theme=${themeId}&dark=true`
            ].map((url, i) =>
                api(url, { json: i === 0 }).then(res => {
                    themeDark[i === 0 ? 'json' : 'css'] = res;
                })
            );

            await Promise.all(darkThemePromises);

            return { props, themeDark };
        }

        server.route({
            method: 'GET',
            path: '/{chartId}',
            options: {
                auth: 'guest',
                validate: {
                    params: Joi.object({
                        chartId: Joi.string()
                            .alphanum()
                            .length(5)
                            .required()
                            .description('5 character long chart ID.')
                    }),
                    query: Joi.object({
                        theme: Joi.string().optional(),
                        ott: Joi.string().optional(),
                        search: Joi.string().optional(),
                        published: fakeBoolean(),
                        static: fakeBoolean(),
                        plain: fakeBoolean(),
                        fitchart: fakeBoolean(),
                        fitheight: fakeBoolean(),
                        svgonly: fakeBoolean(),
                        map2svg: fakeBoolean(),
                        transparent: fakeBoolean(),
                        logo: Joi.string().optional().valid('auto', 'on', 'off').default('auto'),
                        logoId: logoId().optional(),
                        dark: Joi.boolean().default(false).allow('auto'),
                        allowEditing: fakeBoolean(),
                        previewId: Joi.string().optional()
                    })
                }
            },
            handler: async (request, h) => {
                const { params } = request;
                const res = await getChart(params.chartId, request.query, request);
                let { props } = res;
                const { themeDark } = res;

                const chartLocale = props.chart.language || 'en-US';

                const team = await Team.findByPk(props.chart.organizationId);

                const localeConfig = await loadLocaleConfig(chartLocale);

                props = Object.assign(props, {
                    isIframe: true,
                    isPreview: true,
                    isEditingAllowed: request.query.allowEditing,
                    isStyleDark: request.query.dark,
                    themeDataDark: themeDark.json.data,
                    themeDataLight: props.theme.data,
                    polyfillUri: '/lib/polyfills',
                    locales: {
                        dayjs: await loadVendorLocale('dayjs', chartLocale, team),
                        numeral: await loadVendorLocale('numeral', chartLocale, team)
                    },
                    textDirection: localeConfig.textDirection || 'ltr',
                    teamPublicSettings: team ? team.getPublicSettings() : {},
                    ...(request.query.dark ? { theme: themeDark.json } : {}),
                    assets: props.assets.reduce((acc, item) => {
                        const { name, value, url, load = true } = item;
                        acc[name] = {
                            load,
                            ...(url ? { url } : { value })
                        };
                        return acc;
                    }, {}),
                    frontendDomain: config.frontend.domain,
                    previewId: request.query.previewId
                });

                const css = props.styles;
                const fonts = props.theme.fontsCSS;
                delete props.styles;
                delete props.theme.fontsCSS;

                const libraries = props.visualization.libraries.map(lib => lib.uri);

                props.frontendDomain = config.frontend.domain;

                const { html, head } = chartCore.svelte.render(props);

                const response = h.view('preview.pug', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    CHART_LOCALE: chartLocale,
                    VIS_SCRIPT: `${apiBase}/visualizations/${props.visualization.id}/script.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
                    POLYFILL_SCRIPT: '/lib/chart-core/load-polyfills.js',
                    DEPS: ['/lib/chart-core/dw-2.0.min.js'],
                    LIBRARIES: libraries,
                    FONT_CSS: fonts,
                    CSS: css,
                    CSS_DARK: themeDark.css,
                    DARK_MODE: request.query.dark,
                    CHART_CLASS: [
                        `vis-height-${get(props.visualization, 'height', 'fit')}`,
                        `theme-${get(props.theme, 'id')}`,
                        `vis-${get(props.visualization, 'id')}`
                    ]
                });
                response.header('X-Robots-Tag', 'noindex, nofollow');
                return response;
            }
        });

        server.route({
            method: 'GET',
            path: '/{chartId}/embed.js',
            options: {
                validate
            },
            handler: async (request, h) => {
                const { params } = request;
                const res = await getChart(params.chartId, request.query, request);
                let { props } = res;
                const { themeDark } = res;

                const chartLocale = props.chart.language || 'en-US';
                const team = await Team.findByPk(props.chart.organizationId);

                const webComponentJS = await fs.readFile(
                    path.join(chartCore.path.dist, 'web-component.js'),
                    'utf-8'
                );

                const localeConfig = await loadLocaleConfig(chartLocale);

                props = Object.assign(props, {
                    isIframe: false,
                    isPreview: true,
                    isStyleDark: request.query.dark,
                    themeDataDark: themeDark.json.data,
                    themeDataLight: props.theme.data,
                    polyfillUri: '/lib/polyfills',
                    locales: {
                        dayjs: await loadVendorLocale('dayjs', chartLocale, team),
                        numeral: await loadVendorLocale('numeral', chartLocale, team)
                    },
                    textDirection: localeConfig.textDirection || 'ltr',
                    teamPublicSettings: team ? team.getPublicSettings() : {},
                    ...(request.query.dark ? { theme: themeDark.json } : {}),
                    assets: props.assets.reduce((acc, item) => {
                        const { value } = item;
                        acc[item.name] = { value };
                        return acc;
                    }, {}),
                    frontendDomain: config.frontend.domain,
                    dependencies: [
                        `${frontendBase}/lib/chart-core/dw-2.0.min.js`,
                        ...props.visualization.libraries.map(lib => `${frontendBase}${lib.uri}`),
                        `${config.api.https ? 'https' : 'http'}://${config.api.subdomain}.${
                            config.api.domain
                        }/v3/visualizations/${props.visualization.id}/script.js`
                    ],
                    blocks: props.blocks.map(block => {
                        block.source.js = `${frontendBase}${block.source.js}`;
                        block.source.css = `${frontendBase}${block.source.css}`;
                        return block;
                    })
                });

                return h
                    .response(
                        webComponentJS + `\n\nwindow.datawrapper.render(${JSON.stringify(props)});`
                    )
                    .header('Content-Type', 'application/javascript');
            }
        });
    }
};
