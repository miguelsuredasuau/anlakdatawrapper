-- Up
CREATE INDEX chart_theme_IDX ON chart (theme);

-- Down
ALTER TABLE chart DROP INDEX chart_theme_IDX;
