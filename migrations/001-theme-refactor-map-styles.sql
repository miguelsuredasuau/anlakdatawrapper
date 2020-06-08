
-- Up
SET @oldkey = '$."map-styles"';
SET @newkey = '$.vis."locator-maps".mapStyles';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

-- Down
SET @oldkey = '$.vis."locator-maps".mapStyles';
SET @newkey = '$."map-styles"';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;