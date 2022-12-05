-- Up
UPDATE theme
SET data = JSON_SET(
        data,
        '$.options.footer.separator',
        JSON_SET(
            '{}',
            "$.text",
            data->>'$.options.footer.separator'
        )
    )
WHERE data->>'$.options.footer.separator' IS NOT NULL;

-- Down
