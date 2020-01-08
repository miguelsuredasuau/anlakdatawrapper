-- Adds Roboto font to the existing 'datawrapper' theme

-- Up
UPDATE theme
SET assets = '{
        "Roboto": {
            "type": "font",
            "import": "https://static.dwcdn.net/css/roboto.css",
            "method": "import"
        }
    }'
WHERE id = 'datawrapper';

-- Down
