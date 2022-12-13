const get = require('lodash/get');
const Boom = require('@hapi/boom');

module.exports = {
    async getChart(server, request) {
        const api = server.methods.createAPI(request);
        const { query, params } = request;
        const { chartId } = params;

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
    },
    initCaches(server) {
        const config = server.methods.config();

        const styleCache = server.cache({
            segment: 'vis-styles',
            expiresIn: 86400000 * 365 /* 1 year */,
            shared: true
        });

        const visCache = server.cache({
            segment: 'visualizations',
            expiresIn: 86400000 /* 1 day */,
            shared: true
        });

        const themeCache = server.cache({
            segment: 'themes',
            expiresIn: 86400000 /* 1 day */,
            shared: true
        });

        return {
            async getStyles(api, visId, themeId, transparent) {
                if (get(config, 'general.cache.styles') && !transparent) {
                    const cachedCSS = await styleCache.get(`${themeId}__${visId}`);
                    if (cachedCSS) return cachedCSS;
                }

                return api(
                    `/visualizations/${visId}/styles.css?theme=${themeId}${
                        transparent ? '&transparent=true' : ''
                    }`,
                    {
                        json: false
                    }
                );
            },

            async getVis(api, visId) {
                if (get(config, 'general.cache.visualizations')) {
                    const cachedVis = await visCache.get(visId);
                    if (cachedVis) return cachedVis;
                }

                const vis = await api(`/visualizations/${visId}`);

                if (get(config, 'general.cache.visualizations')) {
                    await visCache.set(visId, vis);
                }

                return vis;
            },

            async getTheme(api, themeId) {
                if (get(config, 'general.cache.themes')) {
                    const cachedTheme = await themeCache.get(themeId);
                    if (cachedTheme) return cachedTheme;
                }

                const theme = await api(`/themes/${themeId}?extend=true`);

                if (get(config, 'general.cache.themes')) {
                    await themeCache.set(themeId, theme);
                }

                return theme;
            }
        };
    }
};
