-- Up
ALTER TABLE
    plugin_data
MODIFY
    COLUMN data TEXT NULL;

ALTER TABLE
    user_data
MODIFY
    COLUMN value TEXT NULL;

-- Down
ALTER TABLE
    user_data
MODIFY
    COLUMN value VARCHAR(4096) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;

ALTER TABLE
    plugin_data
MODIFY
    COLUMN data VARCHAR(4096) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;