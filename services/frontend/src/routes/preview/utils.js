const get = require('lodash/get');

module.exports = {
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
