-- Adds a non-privileged user and adds an organization and product to the superuser

-- Up
INSERT INTO `user` (`id`, `email`, `pwd`, `created_at`) VALUES
(2, 'user@datawrapper.de', '34738608dfa322bed9859978902a0050501c6aad204c9b61b53c2a86533e5b49', '2020-05-06 14:00:00');

INSERT INTO auth_token (`user_id`, `token`, `comment`, `created_at`) VALUES
(2, 'ff382546de8b45aab57de3a4be66b2bac8231e4ea73f805d0702891833fcf9fd', 'default', '2020-05-05 14:00:00');

INSERT INTO `organization` (`id`, `name`, `created_at`, `default_theme`, `settings`) VALUES
('admins', 'Admins', '2020-05-06 14:00:00', 'datawrapper', '{"css": "", "embed": {"custom_embed": {"text": "", "title": "", "template": ""}, "preferred_embed": "responsive"}, "flags": {"byline": true, "output_locale": true, "social_sharing": true}, "default": {"folder": null, "locale": null}, "folders": "expanded", "pdfUpload": {"s3": {"bucket": "", "prefix": "", "region": "", "secret": "", "enabled": false, "filename": "", "accessKeyId": ""}, "ftp": {"user": "", "server": "", "enabled": false, "filename": "", "password": "", "directory": ""}}, "customFields": [], "disableVisualizations": {"enabled": false, "allowAdmins": false, "visualizations": {}}, "restrictDefaultThemes": false}');

INSERT INTO `product` (`id`, `name`, `created_at`, `data`) VALUES
(1, 'Admin Product', '2020-05-06 14:00:00', '{"productPriority":0,"restrictChartViews":false,"showExportNote":false,"restrictLocatorMaps":false,"enableTeams":false,"enableCustomLayouts":false,"requireDatawrapperAttribution":false,"enableCMYKExport":false,"enableSelfHosting":false}');

INSERT INTO `organization_product` (`organization_id`, `product_id`) VALUES
('admins', 1);

INSERT INTO `user_organization` (`user_id`, `organization_id`, `invited_at`) VALUES
(1, 'admins', '2020-05-06 14:00:00');

-- Down
DELETE FROM `user_organization` WHERE `user_id` = 1 AND `organization_id` = 'admins';
DELETE FROM `organization_product` WHERE `organization_id` = 'admins' AND `product_id` = 1;
DELETE FROM `product` WHERE `id` = 1;
DELETE FROM `organization` WHERE `id` = 'admins';
DELETE FROM `auth_token` WHERE `token` = 'ff382546de8b45aab57de3a4be66b2bac8231e4ea73f805d0702891833fcf9fd';
DELETE FROM `user` WHERE `id` = 2;
