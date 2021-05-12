-- Update the admin product and add a new default low-priority product

-- Up
UPDATE `product`
SET
`data` = '{"productPriority":0,"restrictChartViews":false,"restrictLocatorMaps":false,"enableTeams":false,"enableCustomLayouts":true,"enableImagePublishing":true,"requireDatawrapperAttribution":false,"enableCMYKExport":true,"enableSelfHosting":false,"enableWebToPrint":true,"showExportNote":false,"publicName":"admin","customLayouts":1}',
`priority` = 5
WHERE `id` = 1;

INSERT INTO `product` (`id`, `name`, `created_at`, `data`) VALUES
(2, 'Default Product', '2021-05-12 14:00:00', '{"productPriority":0,"restrictChartViews":false,"restrictLocatorMaps":false,"enableTeams":false,"enableCustomLayouts":false,"enableImagePublishing":false,"requireDatawrapperAttribution":true,"enableCMYKExport":false,"enableSelfHosting":false,"enableWebToPrint":false,"showExportNote":false}');

-- Down
UPDATE `product`
SET
`data` = '{"productPriority":0,"restrictChartViews":false,"showExportNote":false,"restrictLocatorMaps":false,"enableTeams":false,"enableCustomLayouts":false,"requireDatawrapperAttribution":false,"enableCMYKExport":false,"enableSelfHosting":false}',
`priority` = 0
WHERE `id` = 1;

DELETE FROM `product` WHERE `id` = 2;
