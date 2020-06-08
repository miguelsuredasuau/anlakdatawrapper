
-- Up
SET @oldkey = '$."map-styles"';
SET @newkey = '$.vis."locator-maps".mapStyles';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(JSON_MERGE_PATCH(`data`, '{"vis": {"locator-maps": {}}}'), @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

SET @oldkey = '$.vis."locator-maps".mapStyles[0].defaultMarker';
SET @newkey = '$.vis."locator-maps".defaultMarker';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

SET @oldkey = '$.vis."locator-maps".mapStyles[0].markerPresets';
SET @newkey = '$.vis."locator-maps".markerPresets';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

-- Down
SET @oldkey = '$.vis."locator-maps".mapStyles';
SET @newkey = '$."map-styles"';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

SET @oldkey = '$.vis."locator-maps".defaultMarker';
SET @newkey = '$."map-styles"[0].defaultMarker';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;

SET @oldkey = '$.vis."locator-maps".markerPresets';
SET @newkey = '$."map-styles"[0].markerPresets';
UPDATE theme SET
	`data` = JSON_REMOVE(JSON_SET(`data`, @newkey, JSON_EXTRACT(`data`, @oldkey)), @oldkey)
	WHERE JSON_EXTRACT(`data`, @oldkey) IS NOT NULL;