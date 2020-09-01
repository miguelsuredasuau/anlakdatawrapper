-- Adds faketable

-- Up
REPLACE INTO theme
(id, created_at, extend, title, `data`, less, assets)
VALUES('default', '2017-05-04 12:00:00.000', NULL, 'Datawrapper (2012)', '{"colors": {"general": {"padding": 0, "background": "transparent"}, "palette": ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]}, "options": {"footer": {"logo": {"height": 30, "enabled": 0, "position": "right"}, "embed": {"caption": "Embed", "enabled": 0}, "getTheData": {"caption": "Get the data", "enabled": 0}, "mapCaption": "Map:", "forkCaption": "Based on", "staticImage": {"caption": "Download Image", "enabled": 0}, "chartCaption": "Chart:", "tableCaption": "Table:", "sourceCaption": "Source", "sourcePosition": "left", "createdWithCaption": "Created with"}}, "typography": {"chart": {"color": "#333333", "fontSize": 12, "typeface": "Helvetica"}, "links": {"color": "#0088CC", "cursive": 0, "fontWeight": "normal", "underlined": 0}, "notes": {"cursive": 1, "fontSize": 12, "fontWeight": "normal", "underlined": 0}, "footer": {"color": "#888", "cursive": 0, "fontSize": 11, "fontWeight": "normal", "underlined": 0}, "headline": {"cursive": 0, "fontSize": 22, "fontWeight": "lighter", "underlined": 0}, "description": {"cursive": 0, "fontSize": 12, "fontWeight": "normal", "lineHeight": 17, "underlined": 0}}}', '.chart.png-export {
    .dw-chart-footer {
        .static-image, .chart-action-data {
            display:none!important;
        }
    }
    a {
        color: unset!important;
    }
}', NULL);

REPLACE INTO theme
(id, created_at, extend, title, `data`, less, assets)
VALUES('datawrapper', '2017-05-04 12:00:00.000', 'default', 'Datawrapper', '{"pdf": {"fonts": {"Roboto Bold": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Bold.ttf", "Roboto Light": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Light.ttf", "Roboto Medium": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Medium.ttf", "Roboto Regular": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Regular.ttf", "Roboto Bold Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-BoldItalic.ttf", "Roboto Light Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-LightItalic.ttf", "Roboto Medium Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-MediumItalic.ttf", "Roboto Regular Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Italic.ttf"}, "fontStack": true, "cmykColors": [], "defaultFont": "Roboto Regular"}, "vis": {"d3-maps-symbols": {"regionFill": "#ededed"}}, "colors": {"picker": {"rowCount": 6}, "general": {"padding": 0}, "palette": ["#18a1cd", "#1d81a2", "#15607a", "#00dca6", "#09bb9f", "#009076", "#c4c4c4", "#c71e1d", "#fa8c00", "#ffca76", "#ffe59c"]}, "options": {"footer": {"sourcePosition": "left"}}, "typography": {"chart": {"color": "#181818", "typeface": "Roboto,sans-serif"}, "links": {"typeface": "Roboto,sans-serif"}, "notes": {"color": "#656565", "typeface": "Roboto,sans-serif"}, "footer": {"typeface": "Roboto,sans-serif"}, "headline": {"color": "#000000", "fontSize": 22, "typeface": "Roboto,sans-serif", "fontWeight": "bold"}, "description": {"fontSize": 14, "typeface": "Roboto,sans-serif"}}}', '/* .chart.png-export .footer-block.attribution { display: none; } */', '{"Roboto": {"type": "font", "import": "https://static.dwcdn.net/css/roboto.css", "method": "import"}}');


-- Down
DELETE FROM theme WHERE id = 'default';
DELETE FROM theme WHERE id = 'datawrapper';
