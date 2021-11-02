-- Up

UPDATE theme
SET data = JSON_SET(
        data,
        "$.metadata.publish.blocks.logo",
        JSON_SET("{}", "$.enabled", JSON_EXTRACT(data,'$.metadata.publish.blocks.logo'))
    );
WHERE JSON_EXTRACT(`data`, '$.metadata.publish.blocks.logo') IS NOT NULL;

UPDATE chart
SET metadata = JSON_SET(
       # provide fallback in case publish.blocks.logo doesn't exist
       JSON_MERGE_PATCH('{ "publish": { "blocks": { "logo": false } } }', metadata),
       # set publish.blocks.logo
       "$.publish.blocks.logo",
       # to the extracted old value, wrapped in `{ "enabled": ... }`
       JSON_SET("{}", "$.enabled", JSON_EXTRACT(
           # for which we provide a fallback false
           JSON_MERGE_PATCH('{ "publish": { "blocks": { "logo": false } } }', metadata),
           '$.publish.blocks.logo'
        ))
    );

UPDATE chart
SET metadata = JSON_MERGE_PATCH(metadata, '{ "publish": { "blocks": { "logo": { "id": "main" } } } }')
WHERE JSON_EXTRACT(metadata,'$.publish.blocks.logo.enabled') = true;

-- Down