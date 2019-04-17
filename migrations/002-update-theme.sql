-- Adds faketable

-- Up
INSERT INTO theme (id,created_at,extend,title,`data`,less,assets) VALUES
('default','2017-05-04 12:00:00.000',NULL,'Datawrapper (2012)','{
    "typography": {
        "chart": {
            "typeface": "Roboto",
            "color": "#000"
        },
        "headline": {
            "fontSize": 26,
            "fontWeight": "bold",
            "underlined": 0,
            "cursive": 0
        },
        "description": {
            "fontSize": 16,
            "fontWeight": "normal",
            "underlined": 0,
            "cursive": 0
        },
        "notes": {
            "fontSize": 12,
            "fontWeight": "normal",
            "underlined": 0,
            "cursive": 1
        },
        "footer": {
            "color": "#888",
            "fontSize": 11,
            "fontWeight": "normal",
            "underlined": 0,
            "cursive": 0
        },
        "links": {
            "color": "#0088CC",
            "fontWeight": "normal",
            "underlined": 0,
            "cursive": 0
        }
    },
    "colors": {
        "general": {
            "padding": 0
        },
        "palette": [
            "#1f77b4",
            "#ff7f0e",
            "#2ca02c",
            "#d62728",
            "#9467bd"
        ]
    },
    "options": {
        "footer": {
            "logo": {
                "enabled": 0,
                "height": 30,
                "position": "right"
            },
            "getTheData": {
                "enabled": 0,
                "caption": "Get the data"
            },
            "embed": {
                "enabled": 0,
                "caption": "Embed"
            },
            "staticImage": {
                "enabled": 0,
                "caption": "Download Image"
            },
            "sourcePosition": "left",
            "sourceCaption": "Source",
            "chartCaption": "Chart:",
            "mapCaption": "Map:",
            "forkCaption": "based on"
        }
    }
}','',NULL);

-- Down
