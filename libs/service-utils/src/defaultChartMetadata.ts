import type { Metadata } from '@datawrapper/shared/chartTypes';

export const defaultChartMetadata = {
    data: {
        changes: [],
        transpose: false,
        'vertical-header': true,
        'horizontal-header': true
    },
    describe: {
        'source-name': '',
        'source-url': '',
        intro: '',
        byline: '',
        'aria-description': '',
        'number-format': '-',
        'number-divisor': 0,
        'number-append': '',
        'number-prepend': ''
    },
    visualize: {
        'dark-mode-invert': true,
        'highlighted-series': [],
        'highlighted-values': [],
        sharing: {
            enabled: false
        }
    },
    axes: {},
    publish: { 'embed-width': 600, 'embed-height': 400, blocks: {}, 'export-pdf': {} },
    annotate: {
        notes: ''
    },
    custom: {}
} as Metadata;
