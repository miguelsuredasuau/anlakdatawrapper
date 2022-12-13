const { fakeBoolean, id: logoId } = require('@datawrapper/schemas/themeData/shared');
const { loadVendorLocale, loadLocaleConfig } = require('@datawrapper/service-utils');
const { Team } = require('@datawrapper/orm/db');
const chartCore = require('@datawrapper/chart-core');
const Joi = require('joi');
const { getChart } = require('../utils.js');

const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'routes/preview/id/embed',
    version: '1.0.0',
    register: async server => {
        const config = server.methods.config();
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

        server.route({
            method: 'GET',
            path: '/embed.js',
            options: {
                validate
            },
            handler: async (request, h) => {
                const res = await getChart(server, request);
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
