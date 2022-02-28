module.exports = function registerFeatureFlag(server) {
    server.app.featureFlags = new Map();
    function registerFeatureFlag(id, attributes) {
        server.app.featureFlags.set(id, { id, ...attributes });
    }

    registerFeatureFlag('byline', {
        default: true,
        type: 'switch',
        title: {
            key: 'visualize / annotate / byline',
            scope: 'core'
        },
        group: 'annotate'
    });
    registerFeatureFlag('embed', {
        default: true,
        type: 'switch',
        title: {
            key: 'Embed',
            scope: 'core'
        },
        group: 'footer'
    });
    registerFeatureFlag('get_the_data', {
        default: true,
        type: 'switch',
        title: {
            key: 'Get the data',
            scope: 'core'
        },
        group: 'footer'
    });
    registerFeatureFlag('layout_selector', {
        default: true,
        type: 'switch',
        title: {
            key: 'Layout selector',
            scope: 'core'
        },
        group: 'layout'
    });

    return registerFeatureFlag;
};
