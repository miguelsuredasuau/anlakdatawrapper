-- Up
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE chart MODIFY COLUMN id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
ALTER TABLE chart MODIFY COLUMN forked_from varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NULL;
ALTER TABLE chart_public MODIFY COLUMN id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
ALTER TABLE job MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NULL;
ALTER TABLE river_chart MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
ALTER TABLE river_chart_stats MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
ALTER TABLE river_chart_tag MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;
ALTER TABLE pixeltracker_chart MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL;

SET FOREIGN_KEY_CHECKS=1;
-- Down

SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE chart MODIFY COLUMN id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE chart MODIFY COLUMN forked_from varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
ALTER TABLE chart_public MODIFY COLUMN id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE job MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;
ALTER TABLE river_chart MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE river_chart_stats MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE river_chart_tag MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;
ALTER TABLE pixeltracker_chart MODIFY COLUMN chart_id varchar(5) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL;

SET FOREIGN_KEY_CHECKS=1;