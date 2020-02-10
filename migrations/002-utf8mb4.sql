-- Changes chart_access_token charset to utf8mb4

-- Up
ALTER TABLE chart_access_token DEFAULT CHARSET=utf8mb4;

-- Down
ALTER TABLE chart_access_token DEFAULT CHARSET=utf8;
