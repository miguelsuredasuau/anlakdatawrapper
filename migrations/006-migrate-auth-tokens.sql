-- Copies default users' tokens from the auth_token table to the access_token table

-- Up
INSERT INTO access_token
(user_id, token, type, created_at, last_used_at, data)
SELECT user_id, token, "api-token", created_at, last_used_at, JSON_OBJECT('comment', comment)
FROM auth_token
WHERE token IN (
'e927d1b49deadf9186800d3759cdcf46de009fe705573dd67ab7cfcbf3efc153',
'ff382546de8b45aab57de3a4be66b2bac8231e4ea73f805d0702891833fcf9fd'
);

-- Down
DELETE FROM access_token WHERE token IN (
'e927d1b49deadf9186800d3759cdcf46de009fe705573dd67ab7cfcbf3efc153',
'ff382546de8b45aab57de3a4be66b2bac8231e4ea73f805d0702891833fcf9fd'
);
