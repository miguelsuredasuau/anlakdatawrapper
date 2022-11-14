import type { FeatureFlag } from './featureFlagTypes';
import type { Server } from './serverTypes';

export = function registerFeatureFlag(server: Server) {
    server.app.featureFlags = new Map<string, FeatureFlag>();

    function registerFeatureFlag(id: string, attributes: Omit<FeatureFlag, 'id'>) {
        server.app.featureFlags.set(id, { id, ...attributes });
    }

    server.method('getFeatureFlags', () => Array.from(server.app.featureFlags.values()));

    // core feature flags
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
    registerFeatureFlag('output_locale', {
        title: {
            key: 'describe / locale-select / hed',
            scope: 'core'
        },
        type: 'switch',
        default: true,
        group: 'layout'
    });

    return registerFeatureFlag;
};
