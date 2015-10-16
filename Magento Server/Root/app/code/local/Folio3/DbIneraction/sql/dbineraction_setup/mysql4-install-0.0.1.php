<?php

$installer = $this;

$installer->startSetup();

$installer->run("
    DROP TABLE IF EXISTS {$this->getTable('apex_netsuite_details')};
    CREATE TABLE `apex_netsuite_details` (
	`order_increment_id` VARCHAR(50) NOT NULL,
	`netsuite_id` VARCHAR(50) NOT NULL,
	`netsuite_status` VARCHAR(50) NOT NULL DEFAULT 'NOT PROCESS'
        )
    COMMENT='Contains the order statuses and netsuite ids\r\n'
    COLLATE='utf8_general_ci'
    ENGINE=InnoDB
");

$installer->endSetup();
