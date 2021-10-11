export default {
    visualize: {
        overlays: [
            {
                to: 'max',
                from: 'min',
                type: 'range',
                color: 7,
                title: '',
                opacity: 0.6,
                pattern: 'diagonal-up',
                labelDirectly: true
            },
            {
                to: 'min',
                from: 'percent_change',
                type: 'value',
                color: '#f7ffff',
                title: '90% confidence interval',
                opacity: 0.1,
                pattern: 'solid',
                labelDirectly: true
            }
        ],
        'base-color': '#ffa588',
        'show-color-key': false
    }
};
