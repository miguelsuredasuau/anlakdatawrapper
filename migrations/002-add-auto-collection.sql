-- Adds chargebee_invoices.auto_collection

-- Up
ALTER TABLE `chargebee_invoices` ADD COLUMN `auto_collection` TINYINT(2);

-- Down
