<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CustomAttributeEntity
 *
 * @author zahmed
 */
class CustomAttributeEntity {

    public $field_id;
    public $field_value;

    /**
     * Retrieve customer data from webforms plugin tables
     *
     * @param int $customerId
     * @return associative array
     */
    public static function getWebFormsData($customerId) {

        if (empty($customerId)) {
            return array();
        }

        /**
         * Get the resource model
         */
        $resource = Mage::getSingleton('core/resource');

        /**
         * Retrieve the read connection
         */
        $readConnection = $resource->getConnection('core_read');

        //select A.result_id, A.field_id, A.value from webforms_results_values as A where A.result_id in (select id from webforms_results where customer_id = 449);

        $webFromsResultsValuesTable = $resource->getTableName('webforms_results_values');
        $webFromsResultsTable = $resource->getTableName('webforms_results');

        if (!empty($webFromsResultsTable) && !empty($webFromsResultsValuesTable)) {
            $query = 'select A.field_id, A.value from ' . $webFromsResultsValuesTable . ' as A where A.result_id in (select id from ' . $webFromsResultsTable . ' where customer_id = ' . $customerId . ')';

            /**
             * Execute the query and store the results in $results
             */
            $results = $readConnection->fetchAll($query);

            $customAttributeArr = array();

            foreach ($results as $value) {
                $fieldId = $value['field_id'];
                $tValue = $value['value'];

                $customAttribute = new CustomAttributeEntity();
                $customAttribute->field_id = $fieldId;
                $customAttribute->field_value = $tValue;

                $customAttributeArr[] = $customAttribute;
            }
        }

        return $customAttributeArr;
    }

    /**
     * Retrieve sales order data from field manager plugin tables
     *
     * @param string $orderId
     * @return  array of objects
     */
    public static function getFieldManagerData($orderId) {

        if (empty($orderId)) {
            return array();
        }

        $customAttributeArr = array();

        /**
         * Get the resource model
         */
        $resource = Mage::getSingleton('core/resource');

        /**
         * Retrieve the read connection
         */
        $readConnection = $resource->getConnection('core_read');

        $tableName = $resource->getTableName('fieldsmanager_orders');

        if (!empty($tableName)) {
            $query = 'SELECT attribute_id, value FROM ' . $tableName . '  WHERE entity_id =  ' . $orderId;

            /**
             * Execute the query and store the results in $results
             */
            $results = $readConnection->fetchAll($query);

            foreach ($results as $value) {
                $fieldId = $value['attribute_id'];
                $tValue = $value['value'];

                $customAttribute = new CustomAttributeEntity();
                $customAttribute->field_id = $fieldId;
                $customAttribute->field_value = $tValue;

                $customAttributeArr[] = $customAttribute;
            }
        }

        return $customAttributeArr;
    }

}
