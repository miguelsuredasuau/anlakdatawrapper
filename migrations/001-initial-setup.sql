-- Adds river_chart, river_chart_stats, river_chart_tag, river_chart_tag_translations
-- Up
CREATE TABLE IF NOT EXISTS `river_chart` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chart_id` varchar(5) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `last_updated_at` datetime DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL COMMENT 'a title describing this chart',
  `description` varchar(1024) DEFAULT NULL COMMENT 'longer description',
  `source` varchar(1024) DEFAULT NULL COMMENT 'data source',
  `source_url` varchar(1024) DEFAULT NULL COMMENT 'link to data source',
  `from_year` smallint(5) DEFAULT NULL COMMENT 'first year in dataset',
  `to_year` smallint(5) DEFAULT NULL COMMENT 'last year in dataset',
  `attribution` tinyint(4) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `forkable_charts_meta_chart_id_IDX` (`chart_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `river_chart_stats` (
  `chart_id` varchar(5) NOT NULL,
  `date` date NOT NULL,
  `forks` int(11) NOT NULL,
  `views` int(11) NOT NULL,
  `forks_published` int(11) DEFAULT NULL,
  PRIMARY KEY (`chart_id`,`date`),
  UNIQUE KEY `forkable_charts_stats_chart_id_IDX` (`chart_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `river_chart_tag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chart_id` varchar(5) NOT NULL,
  `tag_type` varchar(16) NOT NULL,
  `tag` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `forkable_charts_tags_chart_id_IDX` (`chart_id`,`tag_type`,`tag`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `river_chart_tag_translation` (
  `tag_type` varchar(100) DEFAULT NULL,
  `tag` varchar(100) DEFAULT NULL,
  `language` varchar(5) DEFAULT NULL,
  `tag_name` varchar(100) DEFAULT NULL,
  UNIQUE KEY `forkable_charts_tag_translations_tag_type_IDX` (`tag_type`,`tag`,`language`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Down
DROP TABLE `river_chart`;
DROP TABLE `river_chart_stats`;
DROP TABLE `river_chart_tag`;
DROP TABLE `river_chart_tag_translation`;