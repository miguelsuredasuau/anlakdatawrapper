const { fakeBoolean, id: logoId } = require('@datawrapper/schemas/themeData/shared');
const { loadVendorLocale, loadLocaleConfig } = require('@datawrapper/service-utils');
const { Team } = require('@datawrapper/orm/db');
const { getChart, renderChart } = require('../utils.js');
const Joi = require('joi');
const jsesc = require('jsesc');
const get = require('lodash/get');

module.exports = {
    name: 'routes/preview/id',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();

        server.route({
            method: 'GET',
            path: '/',
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
                const res = await getChart(server, request);
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

                const {
                    html,
                    head,
                    css: emotionCSSLight
                } = renderChart({ ...props, isStyleDark: false });
                // render again for dark mode styles
                const { css: emotionCSSDark } = renderChart({ ...props, isStyleDark: true });

                const sentryConfig = config.frontend?.sentry?.visPreview;

                const response = h.view('preview.pug', {
                    __DW_SVELTE_PROPS__: jsesc(JSON.stringify(props), {
                        isScriptContext: true,
                        json: true,
                        wrap: true
                    }),
                    CHART_HTML: html,
                    CHART_HEAD: head,
                    CHART_LOCALE: chartLocale,
                    VIS_SCRIPT: `/lib/plugins/${props.visualization.__plugin}/static/${props.visualization.id}.js`,
                    MAIN_SCRIPT: '/lib/chart-core/main.js',
                    POLYFILL_SCRIPT: '/lib/chart-core/load-polyfills.js',
                    DEPS: ['/lib/chart-core/dw-2.0.min.js'],
                    LIBRARIES: libraries,
                    FONT_CSS: fonts,
                    CSS: `${css}\n${emotionCSSLight}`,
                    CSS_DARK: `${themeDark.css}\n${emotionCSSDark}`,
                    DARK_MODE: request.query.dark,
                    CHART_CLASS: [
                        `vis-height-${get(props.visualization, 'height', 'fit')}`,
                        `theme-${get(props.theme, 'id')}`,
                        `vis-${get(props.visualization, 'id')}`
                    ],
                    SENTRY: sentryConfig && {
                        ...sentryConfig,
                        src: `https://js.sentry-cdn.com/${
                            sentryConfig.client.dsn.match(/\/\/([^@]+)/)[1]
                        }.min.js`,
                        tags: {
                            chartId: props.chart.id,
                            themeId: props.chart.theme,
                            teamId: props.chart.organizationId || '(no team)',
                            visualization: get(props.visualization, 'id'),
                            visPlugin: get(props.visualization, '__plugin')
                        }
                    },
                    GITHEAD: server.app.GITHEAD
                });
                response.header('X-Robots-Tag', 'noindex, nofollow');
                return response;
            }
        });

        await server.register(require('./embed.js.js'));
    }
};
