-- Up
CREATE UNIQUE INDEX plugin_data_plugin_id_IDX USING BTREE ON plugin_data (plugin_id, `key`);

-- Down
ALTER TABLE
    plugin_data DROP INDEX plugin_data_plugin_id_IDX;