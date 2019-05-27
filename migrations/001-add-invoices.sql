-- Adds chargebee_invoics

-- Up
CREATE TABLE IF NOT EXISTS `chargebee_invoices` (
  `id` varchar(512) NOT NULL DEFAULT '',
  `user_id` INTEGER NULL,
  `date` date NOT NULL DEFAULT '1970-01-01',
  `status` varchar(512) NOT NULL DEFAULT '',
  `amount` INTEGER NOT NULL,
  `plan` varchar(512) NOT NULL DEFAULT '',
  `customer_portal_token` varchar(512) NOT NULL DEFAULT '',
  `metadata` LONGTEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- Down
DROP TABLE `chargebee_invoices`;
