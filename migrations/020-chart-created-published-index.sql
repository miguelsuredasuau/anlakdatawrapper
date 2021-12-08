-- Up
CREATE INDEX chart_created_at_IDX USING BTREE ON chart (created_at);

CREATE INDEX chart_published_at_IDX USING BTREE ON chart (published_at);

-- Down
ALTER TABLE
    chart DROP INDEX chart_published_at_IDX;

ALTER TABLE
    chart DROP INDEX chart_created_at_IDX;