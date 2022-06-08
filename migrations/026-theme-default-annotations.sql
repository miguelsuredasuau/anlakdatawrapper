-- Adds default range and line annotation color/opacity

-- Up
UPDATE theme SET data = JSON_MERGE_PATCH(data, '{"style":{"chart":{"rangeAnnotations":{"color":"#888","opacity":0.1},"lineAnnotations":{"color":"#888","opacity":0.1}}}}') WHERE id = 'default';
