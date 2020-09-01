-- Sets role for the default non-privileged user

-- Up
UPDATE `user` SET `role` = 1 WHERE `email` = 'user@datawrapper.de';

-- Down
UPDATE `user` SET `role` = 2 WHERE `email` = 'user@datawrapper.de';
