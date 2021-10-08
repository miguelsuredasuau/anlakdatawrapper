import { Store } from 'svelte/store.js';

export const simpleTheme = new Store({
    themeData: {
        colors: {
            palette: [
                '#a6cee3',
                '#1f78b4',
                '#b2df8a',
                '#33a02c',
                '#fb9a99',
                '#e31a1c',
                '#fdbf6f',
                '#ff7f00',
                '#cab2d6',
                '#6a3d9a',
                '#ffff99',
                '#b15928'
            ],
            gradients: [
                ['#f0f9e8', '#ccebc5', '#a8ddb5', '#7bccc4', '#43a2ca', '#0868ac'], // GnBu
                ['#fefaca', '#008b15'], // simple yellow to green
                ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#c51b8a', '#7a0177'], // RdPu
                ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'], // YlGnbu

                ['#8c510a', '#d8b365', '#f6e8c3', '#f5f7ea', '#c7eae5', '#5ab4ac', '#01665e'], // BrBG
                ['#c51b7d', '#e9a3c9', '#fde0ef', '#faf6ea', '#e6f5d0', '#a1d76a', '#4d9221'], // PiYG
                ['#b2182b', '#ef8a62', '#fddbc7', '#f8f6e9', '#d1e5f0', '#67a9cf', '#2166ac']
            ],
            categories: [
                [
                    '#7fc97f',
                    '#beaed4',
                    '#fdc086',
                    '#ffff99',
                    '#386cb0',
                    '#f0027f',
                    '#bf5b17',
                    '#666666'
                ], // Accent
                [
                    '#fbb4ae',
                    '#b3cde3',
                    '#ccebc5',
                    '#decbe4',
                    '#fed9a6',
                    '#ffffcc',
                    '#e5d8bd',
                    '#fddaec',
                    '#f2f2f2'
                ], // Pastel1
                [
                    '#a6cee3',
                    '#1f78b4',
                    '#b2df8a',
                    '#33a02c',
                    '#fb9a99',
                    '#e31a1c',
                    '#fdbf6f',
                    '#ff7f00',
                    '#cab2d6',
                    '#6a3d9a',
                    '#ffff99',
                    '#b15928'
                ] // Paired
            ]
        }
    },
    metadata: {
        axes: {
            x: 'more values' // user selection
        }
    }
});

export const groupedColorsTheme = new Store({
    themeData: {
        colors: {
            palette: [
                '#82c6df',
                '#ec8431',
                '#ab7fb4',
                '#c89d29',
                '#adc839',
                '#829eb1',
                '#1281AA',
                '#BCBEC0',
                '#6D6E71',
                '#B75A36',
                '#000000',
                '#EBEBEC',
                '#5788b8',
                '#a6c8e1',
                '#d84e55',
                '#edabaf',
                '#eddb80',
                '#e2e3e4',
                '#d2c9a6',
                '#e6ad57',
                '#e6d67c',
                '#b9b1cc',
                '#a3dbd0',
                '#8fa0aa'
            ],
            groups: [
                {
                    name: 'Standard Colors',
                    colors: [
                        [
                            '#82c6df',
                            '#ec8431',
                            '#ab7fb4',
                            '#c89d29',
                            '#adc839',
                            '#829eb1',
                            '#1281AA',
                            '#BCBEC0',
                            '#6D6E71',
                            '#B75A36',
                            '#000000',
                            '#EBEBEC'
                        ]
                    ]
                },
                {
                    name: 'Election colors',
                    colors: [
                        ['#5788b8', '#a6c8e1', '#d84e55', '#edabaf'],
                        ['#eddb80', '#e2e3e4', '#d2c9a6']
                    ]
                },
                {
                    name: 'Categories',
                    colors: [['#e6ad57', '#e6d67c', '#b9b1cc', '#a3dbd0', '#8fa0aa']]
                }
            ]
        }
    }
});

export const fancyTheme = new Store({
    themeData: {
        colors: {
            picker: {
                rowCount: 7,
                showDuplicates: true,
                controls: {
                    hexEditable: false,
                    hue: false,
                    saturation: false,
                    lightness: false
                }
            },
            palette: [
                '#2e75b8',
                '#e68a17',
                '#5c8c42',
                '#a65583',
                '#bd3823',
                '#3b8991',
                '#b5a06d',
                '#7ab2e5',
                '#ffc259',
                '#9bd47f',
                '#de9ebc',
                '#ff9382',
                '#80c7cf',
                '#d9caa7',
                '#04284a',
                '#7f2704',
                '#283b1f',
                '#510238',
                '#6f130c',
                '#0c4240',
                '#594f35',
                '#4b535d',
                '#60666b',
                '#9ea3a5',
                '#dddddd',
                '#f2f2f2',
                '#9baaaa',
                '#c9cec6',
                '#4391db',
                '#f25d27',
                '#ea2636',
                '#ffcc00'
            ]
        }
    }
});
