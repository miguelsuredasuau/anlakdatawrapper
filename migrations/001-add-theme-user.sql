-- Adds faketable

-- Up
INSERT INTO `user` (id,email,pwd,activate_token,reset_password_token,`role`,deleted,`language`,created_at,name,website,sm_profile,oauth_signin,customer_id) VALUES
(1,'admin@datawrapper.de','34738608dfa322bed9859978902a0050501c6aad204c9b61b53c2a86533e5b49','','',0,0,'en_US','2018-11-28 14:45:40.000',NULL,NULL,NULL,NULL,NULL);

INSERT INTO theme (id,created_at,extend,title,`data`,less,assets) VALUES
('default','2017-05-04 12:00:00.000',NULL,'Datawrapper (2012)','{
    "typography": {
        "chart": {
            "typeface": "Helvetica",
            "color": "#000"
        },
        "headline": {
            "fontSize": 22,
            "fontWeight": "lighter",
            "underlined": 0,
            "cursive": 0
        },
        "description": {
            "fontSize": 12,
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

INSERT INTO theme (id,created_at,extend,title,`data`,less,assets) VALUES
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
DELETE FROM user WHERE id = 1;
DELETE FROM theme WHERE id = 'default';
