-- Up
SET @oldkey = '$.vis.tables.header."text-transform"';
SET @newkey = '$.vis.tables.header.textTransform';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

-- Down
SET @oldkey = '$.vis.tables.header.textTransform';
SET @newkey = '$.vis.tables.header."text-transform"';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;