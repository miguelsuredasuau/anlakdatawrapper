-- Adds faketable

-- Up
REPLACE INTO theme (id,created_at,extend,title,`data`,less,assets) VALUES
('datawrapper','2017-05-04 12:00:00.000','default','Datawrapper','{
    "typography": {
        "chart": {
            "typeface": "Roboto,sans-serif",
            "color": "#181818"
        },
        "headline": {
            "fontWeight": "bold",
            "typeface": "Roboto,sans-serif",
            "fontSize": 22,
            "color": "#000000"
        },
        "description": {
            "fontSize": 14,
            "typeface": "Roboto,sans-serif"
        },
        "notes": {
            "color": "#656565",
            "typeface": "Roboto,sans-serif"
        },
        "footer": {
            "typeface": "Roboto,sans-serif"
        },
        "links": {
            "typeface": "Roboto,sans-serif"
        }
    },
    "options": {
        "footer": {
            "embed": [],
            "sourcePosition": "left"
        }
    },
    "colors": {
        "general": {
            "padding": 0
        },
        "palette": [
            "#18a1cd",
            "#1d81a2",
            "#15607a",
            "#00dca6",
            "#09bb9f",
            "#009076",
            "#c4c4c4",
            "#c71e1d",
            "#fa8c00",
            "#ffca76",
            "#ffe59c"
        ]
    },
    "pdf": {
        "fonts": {
            "Roboto Regular": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Regular.ttf",
            "Roboto Regular Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Italic.ttf",
            "Roboto Light": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Light.ttf",
            "Roboto Light Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-LightItalic.ttf",
            "Roboto Medium": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Medium.ttf",
            "Roboto Medium Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-MediumItalic.ttf",
            "Roboto Bold": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-Bold.ttf",
            "Roboto Bold Italic": "https://static.dwcdn.net/css/fonts/roboto/ttf/Roboto-BoldItalic.ttf"
        },
        "defaultFont": "Roboto Regular",
        "fontStack": true,
        "cmykColors": []
    }
}','',NULL);

-- Down
