-- Makes the admin user the owner of the admins organization

-- Up
UPDATE user_organization SET organization_role = 0 WHERE user_id = 1 AND organization_id = 'admins';

-- Down
UPDATE user_organization SET organization_role = 2 WHERE user_id = 1 AND organization_id = 'admins';
