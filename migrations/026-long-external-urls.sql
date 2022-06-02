-- Up
ALTER TABLE external_data MODIFY COLUMN data_url varchar(2048);
ALTER TABLE external_data MODIFY COLUMN metadata_url varchar(2048);
ALTER TABLE chart MODIFY COLUMN external_data varchar(1024);

-- Down