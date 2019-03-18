-- Adds chart_access_token

-- Up
CREATE TABLE chart_access_token (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `chart_id` varchar(10) NOT NULL,
    `token` varchar(100) NOT NULL,
    `created_at` datetime NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `chart_access_token_chart_id_IDX` (chart_id,token) USING BTREE
)  ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Down
DROP TABLE `chart_access_token`;
