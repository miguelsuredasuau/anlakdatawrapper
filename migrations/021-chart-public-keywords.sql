-- Up
ALTER TABLE
    chart_public
ADD
    COLUMN `keywords` TEXT NULL;

-- Down
ALTER TABLE
    chart_public DROP COLUMN `keywords`;