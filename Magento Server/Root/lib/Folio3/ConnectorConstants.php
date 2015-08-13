<?php

/**
 * Magento Connector Contants
 */
class ConnectorConstants
{

    const CustomHeaderName = "X-HTTP-NS-MG-CONNECTOR";
    const CustomHeaderValue = "5ac0d7e1-7d9c-430b-af7c-ec66f64781c4";
    const SuiteletUrlPath = "connectorconfiguration_options/connector_config_group/f3_suitelet_url";
    const StoreIdPath = "connectorconfiguration_options/connector_config_group/f3_store_id";
}

/**
 * Order Status Constants
 */
class OrderStatus
{

    const NOT_PROCESS = 'NOT PROCESS';
    const IN_PROGRESS = 'IN PROGRESS';
    const BACKORDERED = 'BACKORDERED';
    const SYNCED = 'SYNCED';
    const FAILED = 'FAILED';

}
