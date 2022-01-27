-- Up
UPDATE
    access_token
SET
    `data` = JSON_ARRAY_APPEND(`data`, "$.scopes", "theme:read")
WHERE
    JSON_CONTAINS_PATH(`data`, "one", "$.scopes")
    AND JSON_CONTAINS(`data`, '"chart:write"', "$.scopes")
    AND NOT JSON_CONTAINS(`data`, '"theme:read"', "$.scopes");

-- Down