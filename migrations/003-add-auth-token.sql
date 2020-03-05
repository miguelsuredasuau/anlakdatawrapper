-- Adds auth token to the existing user with id 1

-- Up
INSERT INTO auth_token (user_id,token,comment,created_at) VALUES
(1,'e927d1b49deadf9186800d3759cdcf46de009fe705573dd67ab7cfcbf3efc153','default','2020-01-22 14:18:17.000');

-- Down
DELETE FROM auth_token WHERE id = 1;
