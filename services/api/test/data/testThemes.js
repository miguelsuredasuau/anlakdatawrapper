module.exports.darkModeTestTheme = {
    colors: {
        background: '#ffffff',
        palette: ['#ff0000', '#ffff00', '#ffffff'],
        gradients: [['#ff0000', '#ffff00', '#ffffff']],
        categories: [['#ff0000', '#ffff00', '#ffffff']]
    },
    overrides: [
        {
            type: 'darkMode',
            settings: {
                'colors.palette.1': '#00ff00',
                'colors.gradients': [['#ffffff', '#ffff00', '#ff0000']],
                'options.blocks.logo.data.options.0.imgSrc': 'https://domain/logo-white.png'
            }
        }
    ],
    options: {
        blocks: {
            logo: {
                data: {
                    options: [
                        {
                            id: 'main',
                            title: 'Logo',
                            imgSrc: 'https://domain/logo.png',
                            height: 20
                        },
                        {
                            id: 'secondary',
                            title: '2nd Logo',
                            imgSrc: 'https://domain/logo-2.png',
                            height: 20
                        }
                    ]
                }
            }
        }
    },
    vis: {
        'locator-maps': {
            mapStyles: [
                {
                    id: 'map-style',
                    label: 'Map style',
                    colors: {
                        land: '#ffffff'
                    },
                    layers: {
                        water: {
                            paint: {
                                'fill-color': 'hsl(193, 17%, 48%)'
                            }
                        }
                    }
                }
            ]
        }
    },
    style: {
        chart: {
            rangeAnnotations: {
                color: '#888',
                opacity: 0.1
            }
        }
    }
};

module.exports.darkModeTestBgTheme = {
    style: {
        body: {
            background: 'transparent'
        }
    },
    colors: {
        background: '#ffffff'
    },
    overrides: [
        {
            type: 'darkMode',
            settings: {
                'colors.background': '#191919'
            }
        }
    ]
};
