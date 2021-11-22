import dw from '@datawrapper/chart-core/lib/dw/index.mjs';

global.dw = {
    ...dw,
    backend: {
        __messages: {
            core: {
                'describe / search / no-matches': 'No matches',
                'describe / search / of': 'of',
                'describe / search / results': 'results',
                'describe / revert / button': 'Revert',
                'describe / revert / delete-row / button': 'Revert delete',
                'describe / revert / paste / button': 'Merge'
            },
            'simple-maps': {
                'data / readonly / has-changes':
                    'Your dataset also contains changes, which are not reflected in the table. <a href="%href%" target="_self"><b>Click here</b></a> to view and edit these.'
            }
        },
        hooks: {
            call() {
                return {
                    errors: [],
                    results: []
                };
            }
        }
    }
};
