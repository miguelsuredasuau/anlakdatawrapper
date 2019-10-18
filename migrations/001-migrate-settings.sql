-- Migrate from old to new settings format

-- Up
UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"categoryLabels": { "enabled": true }}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."direct-labeling"')) != 'off';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"categoryLabels": { "enabled": false }}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."direct-labeling"')) = 'off';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"categoryLabels": { "position": "color-key" }}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."direct-labeling"')) = 'false';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"categoryLabels": { "position": "direct" }}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."direct-labeling"')) = 'always';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"valueLabels": { "enabled": true, "show": "always" }}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."value-labels"')) = 'show';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"valueLabels": {"enabled": false,"show":"hover"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."value-labels"')) = 'hide';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"valueLabels": {"enabled": true,"show":"hover"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."value-labels"')) = 'hover';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"yAxisLabels": {"enabled":false,"placement":"outside"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."grid-labels"')) = 'hidden';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"yAxisLabels": {"enabled":true,"placement":"outside"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."grid-labels"')) = 'outside';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"yAxisLabels": {"enabled":true,"placement":"inside"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."grid-labels"')) = 'inside';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"yAxisLabels": {"alignment":"right"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."grid-label-position"')) = 'right';

UPDATE chart SET metadata = JSON_MERGE_PATCH(metadata,
    '{"visualize": {"yAxisLabels": {"alignment":"left"}}}')
WHERE `type` IN ('column-chart', 'grouped-column-chart', 'stacked-column-chart') AND
    JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.visualize."grid-label-position"')) = 'left';

-- Down