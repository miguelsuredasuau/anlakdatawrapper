-- Change charset of river_chart_tag to utf8mb4 but leave the rest untouched

-- Up
ALTER TABLE river_chart_tag MODIFY COLUMN tag varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL;

-- Down
ALTER TABLE river_chart_tag MODIFY COLUMN tag varchar(100) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
