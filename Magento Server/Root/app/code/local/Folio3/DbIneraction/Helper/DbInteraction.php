<?php

include_once '/../../../Apex/Libraries/ConnectorConstants.php';

/**
 * This class is responsible for handling the interaction with custom table 
 * named apex_netsuite_details
 */
class Apex_DbIneraction_Helper_DbInteraction extends Mage_Core_Helper_Abstract {

    public $connectionRead = null;
    public $connectionWrite = null;

    /**
     * Get the handler for reading the data from database
     * @return type
     */
    public function getConnectionRead() {
        if (empty($this->connectionRead)) {
            $this->connectionRead = Mage::getSingleton('core/resource')->getConnection('core_read');
        }
        return $this->connectionRead;
    }

    /**
     * Get the handler for writing the data into database
     * @return type
     */
    public function getConnectionWrite() {
        if (empty($this->connectionWrite)) {
            $this->connectionWrite = Mage::getSingleton('core/resource')->getConnection('core_write');
        }
        return $this->connectionWrite;
    }

    /**
     * This function searches the row in the given $tableName and return boolen value
     * Search Condition: $fieldId equals to $fieldValue
     * @param string $tableName
     * @param string $fieldId
     * @param string $fieldValue
     * @return boolean
     */
    public function lookupRow($tableName, $fieldId, $fieldValue) {

        $isBool = true;

        // Get the handler for reading the data from database
        $connectionRead = $this->getConnectionRead();

        // making select query
        $select = $connectionRead->select()
                ->from($tableName, array($fieldId))
                ->where($fieldId . '=?', $fieldValue);

        // we only need to know if the row exist or not
        $result = $connectionRead->fetchRow($select);

        if (empty($result)) {
            $isBool = false;
        }

        return $isBool;
    }

    /**
     * This function updates the row in the given $tableName with passed $fieldsData
     * Search Condition: $fieldId equals to $fieldValue
     * @param string $tableName
     * @param array $fieldsData
     * @param string $fieldId
     * @param string $fieldValue
     */
    public function updateRow($tableName, $fieldsData, $fieldId, $fieldValue) {
        // Get the handler for writing the data into database
        $connectionWrite = $this->getConnectionWrite();

        // Assumption: There will be no error occur here
        try {
            $connectionWrite->beginTransaction();
            // making search condition
            $where = $connectionWrite->quoteInto($fieldId . '=?', $fieldValue);

            // update row
            $connectionWrite->update($tableName, $fieldsData, $where);
            // commit changes
            $connectionWrite->commit();
        } catch (Exception $e) {
            // rollback the transaction
            $connectionWrite->rollback();
        }
    }

    /**
     * This function insert the row in the given $tableName with passed $fieldsData
     * @param string $tableName
     * @param array $fieldsData
     */
    public function insertRow($tableName, $fieldsData) {
        // Get the handler for writing the data into database
        $connectionWrite = $this->getConnectionWrite();

        // Assumption: There will be no error occur here
        try {
            // start inserting row
            $connectionWrite->beginTransaction();

            // insert the row
            $connectionWrite->insert($tableName, $fieldsData);
            // commit changes
            $connectionWrite->commit();
        } catch (Exception $e) {
            // rollback the transaction
            $connectionWrite->rollback();
        }
    }

}
