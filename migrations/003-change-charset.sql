-- Changes the charset to utf8mb4

-- Up
ALTER TABLE chargebee_invoices DEFAULT CHARSET=utf8mb4;

-- Down
ALTER TABLE chargebee_invoices DEFAULT CHARSET=latin1;
