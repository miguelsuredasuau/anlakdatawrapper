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

-- Down
DELETE FROM user WHERE id = 1;
DELETE FROM theme WHERE id = 'default';
