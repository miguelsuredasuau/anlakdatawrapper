-- Adds pixeltracker_chart, pixeltracker_organization_day, pixeltracker_chart_embedurl

-- Up
SET sql_notes = 0;

CREATE TABLE IF NOT EXISTS `pixeltracker_chart` (
  `chart_id` varchar(5) NOT NULL DEFAULT '',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`chart_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_organization_day` (
  `organization_id` varchar(255) NOT NULL DEFAULT '',
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_organization_month` (
  `organization_id` varchar(255) NOT NULL DEFAULT '',
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_organization_week` (
  `organization_id` varchar(255) NOT NULL DEFAULT '',
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`organization_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_user_day` (
  `user_id` int(11) unsigned NOT NULL,
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_user_month` (
  `user_id` int(11) unsigned NOT NULL,
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_user_week` (
  `user_id` int(11) unsigned NOT NULL,
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_domain_month` (
  `domain` varchar(255) NOT NULL DEFAULT '',
  `date` date NOT NULL DEFAULT '1970-01-01',
  `views` int(11) DEFAULT NULL,
  PRIMARY KEY (`domain`,`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `pixeltracker_chart_embedurl` (
  `chart_id` varchar(5) NOT NULL DEFAULT '',
  `url` varchar(512) NOT NULL DEFAULT '',
  PRIMARY KEY (`chart_id`,`url`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET sql_notes = 1;

-- Down

DROP TABLE `pixeltracker_chart`;
DROP TABLE `pixeltracker_organization_day`;
DROP TABLE `pixeltracker_organization_month`;
DROP TABLE `pixeltracker_organization_week`;
DROP TABLE `pixeltracker_user_day`;
DROP TABLE `pixeltracker_user_month`;
DROP TABLE `pixeltracker_user_week`;
DROP TABLE `pixeltracker_domain_month`;
DROP TABLE `pixeltracker_chart_embedurl`;