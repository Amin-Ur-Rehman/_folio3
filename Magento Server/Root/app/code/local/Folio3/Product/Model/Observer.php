<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 05-Aug-15
 * Time: 4:07 PM
 */

/**
 * Dependency:
 * This script will only works for product type "aw_giftcard" which comes after installinh AW Gift Card extension.
 */

include_once(Mage::getBaseDir('lib') . '/Folio3/ConnectorConstants.php');
include_once(Mage::getBaseDir('lib') . '/Folio3/NsRestRequest.php');

class Folio3_Product_Model_Observer
{
    // gift card type id provided by ahead works extension(gift card module)
    const AW_GIFTCARD = "aw_giftcard";

    public function catalogProductSaveBefore(Varien_Event_Observer $observer)
    {
        try {
            Mage::log("catalogProductSaveBefore - Start", null, 'product-save.log', true);

            $object = $observer->getEvent()->getData('data_object');
            $new_data = $object->getData();
            $customPricingData = $this->getValue($new_data, "f3mg_custom_pricing_data");

            Mage::log("Folio3_Product_Model_Observer.catalogProductSaveBefore - customPricingData =" . $customPricingData, null, 'product-save.log', true);

            $type = $new_data["type_id"];
            Mage::log("type: " . $type, null, 'product-save.log', true);

            if ($type == Folio3_Product_Model_Observer::AW_GIFTCARD) {
                if (!empty($customPricingData)) {
                    Mage::log("Folio3_Product_Model_Observer.catalogProductSaveBefore - set data", null, 'product-save.log', true);
                    $object->setData("f3mg_custom_pricing_data", "");
                    $object->setData("f3_custom_pricing_data_hidden", $customPricingData);
                }else{
                    $object->setData("f3_custom_pricing_data_hidden", "");
                }
            }

            Mage::log("catalogProductSaveBefore - End", null, 'product-save.log', true);
        } catch (Exception $e) {
            Mage::logException($e);
            Mage::log("catalogProductSaveBefore - " . json_encode($e), null, 'product-save.log', true);
        }
    }

    /**
     * This method checks if product type is aw_giftcard then send it to NetSuite else do nothing
     * If yes then it cancels the respective order in NetSuite
     * @param Varien_Event_Observer $observer
     */
    public function catalogProductSaveAfter(Varien_Event_Observer $observer)
    {
        try {
            Mage::log("After Product Save", null, 'product-save.log', true);

            $old_data = $observer->getEvent()->getData('data_object')->getOrigData();
            $new_data = $observer->getEvent()->getData('data_object')->getData();

            Mage::log("original_data: " . json_encode($old_data), null, 'product-save.log', true);
            Mage::log("new_data: " . json_encode($new_data), null, 'product-save.log', true);

            $type = $new_data["type_id"];
            Mage::log("type: " . $type, null, 'product-save.log', true);

            // if product type is aw_giftcard then send it to NetSuite for Syncing
            if ($type == Folio3_Product_Model_Observer::AW_GIFTCARD) {
                Mage::log("Export Gift Card to NetSuite - allzohu", null, 'product-save.log', true);
                $this->syncGiftCardToNetSuite($new_data);
            }
        } catch (Exception $e) {
            Mage::logException($e);
            Mage::log("catalogProductSaveAfter - " . json_encode($e), null, 'product-save.log', true);
        }
    }

    /**
     * This method sends a request to cancel sales order to NetSuite with increment id and store id
     * We are currently not handling its response
     * @param $obj
     */
    public function syncGiftCardToNetSuite($obj)
    {
        $data = null;

        // getting public Suitelet URL and Store Id from custom configuration
        $url = Mage::getStoreConfig(ConnectorConstants::SuiteletUrlPath);
        $storeId = Mage::getStoreConfig(ConnectorConstants::StoreIdPath);

        Mage::log($storeId . " " . $url, null, 'product-save.log', true);

        // making data for sending request
        $verb = 'POST';
        $data["apiMethod"] = "createGiftCertificateItem";
        $data["data"] = $this->getData($obj);

        // send request to NetSuite
        Mage::log("RequestData=" . json_encode($data), null, 'product-save.log', true);
        $response = $this->sendRequest($url, $verb, $data);
        Mage::log("ResponseData= " . $response, null, 'product-save.log', true);

        //$responseJson = json_decode($response);

        Mage::log($response, null, 'product-save.log', true);
    }

    /**
     * Making data for sending to NetSuite
     * @param $obj
     * @return stdClass
     */
    public function getData($obj)
    {
        Mage::log("Folio3_Product_Model_Observer.getData - Start", null, 'product-save.log', true);
        // getting Store Id from custom configuration
        $storeId = Mage::getStoreConfig(ConnectorConstants::StoreIdPath);
        Mage::log($storeId, null, 'product-save.log', true);

        // get data model for creation
        $giftCardModel = $this->awGiftCardModel();

        $giftCardModel->storeId = $storeId;
        $giftCardModel->context = "webservice";//userinterface
        $giftCardModel->id = $this->getValue($obj, "entity_id");
        $giftCardModel->name = $this->getValue($obj, "name");
        $giftCardModel->description = $this->getValue($obj, "description");
        $giftCardModel->shortDescription = $this->getValue($obj, "short_description");
        $giftCardModel->sku = $this->getValue($obj, "sku");
        $giftCardModel->weight = $this->getValue($obj, "weight", "number");
        $giftCardModel->urlKey = $this->getValue($obj, "url_key");
        $giftCardModel->metaTitle = $this->getValue($obj, "meta_title");
        $giftCardModel->metaDescription = $this->getValue($obj, "meta_description");
        $giftCardModel->metaKeyword = $this->getValue($obj, "meta_keyword");
        $giftCardModel->active = $this->getValue($obj, "status", "number");
        $giftCardModel->awGcAllowOpenAmount = $this->getValue($obj, "aw_gc_allow_open_amount", "number");
        $giftCardModel->awGcOpenAmountMax = $this->getValue($obj, "aw_gc_open_amount_max", "number");
        $giftCardModel->awGcOpenAmountMin = $this->getValue($obj, "aw_gc_open_amount_min", "number");

        if (isset($obj["stock_data"])) {
            $stockData = $obj["stock_data"];

            $giftCardModel->stockData->isInStock = $this->getValue($stockData, "is_in_stock", "number");
            $giftCardModel->stockData->qty = $this->getValue($stockData, "qty", "number");
        }

        $customPricingData = $this->getValue($obj, "f3_custom_pricing_data_hidden");
        Mage::log("Folio3_Product_Model_Observer.getData - customPricingData =" . $customPricingData, null, 'product-save.log', true);

        $customPricingDataObj = array();


        try {
            $connection = Mage::getSingleton('core/resource')->getConnection('core_write');

            if (!empty($customPricingData)) {
                // get custom pricing data from custom table
                $tablePricigData = $this->getCustomPricingData($obj);
                if (!empty($tablePricigData)) {
                    // delete all rows
                    foreach ($tablePricigData as $tablePricigDataRow) {
                        // get link id/ row id from custom table row
                        $linkId = $this->getValue($tablePricigDataRow, "link_id", "number");
                        $__condition = $connection->quoteInto('link_id=?', $linkId);
                        $connection->delete('aw_giftcard_product_amount', $__condition);
                        Mage::log("Folio3_Product_Model_Observer.getData - Delete - link_id: " . $linkId, null, 'product-save.log', true);
                    }
                }
                $customPricingData = json_decode($customPricingData);
                // insert rows getting from JSON
                foreach ($customPricingData as $priceData) {
                    // insert row
                    $__fields = array();
                    $__fields['website_id'] = '0';
                    $__fields['entity_id'] = $giftCardModel->id;
                    $__fields['value'] = $priceData->price;
                    $__fields['entity_type_id'] = '4';
                    $__fields['attribute_id'] = Mage::getStoreConfig(ConnectorConstants::AwGcAmountsPath);
                    $connection->insert('aw_giftcard_product_amount', $__fields);
                    // get last inserted id
                    $lastInsertedId = $connection->lastInsertId();
                    Mage::log("Folio3_Product_Model_Observer.getData - insert row =" . $lastInsertedId, null, 'product-save.log', true);

                    // make an array for sending it to user - start
                    $obj = new stdClass();
                    $obj->websiteId = 0;
                    $obj->price = $priceData->price;
                    $obj->magentoId = $lastInsertedId;
                    $obj->internalId = $priceData->internalId;
                    $obj->itemId = $priceData->itemId;
                    // make an array for sending it to user
                    $giftCardModel->customPricingData[] = $obj;
                    // make an array for sending it to user - end
                }
            } else {
                Mage::log("Folio3_Product_Model_Observer.getData - Retrieve Data Only - Custom Attribute is Empty", null, 'product-save.log', true);
                // get custom pricing data from custom table
                $pricigData = $this->getCustomPricingData($obj);
                if (!empty($pricigData)) {
                    foreach ($pricigData as $arr) {
                        $obj = new stdClass();
                        $obj->websiteId = $this->getValue($arr, "website_id", "number");
                        $obj->price = $this->getValue($arr, "value", "number");
                        $obj->magentoId = $this->getValue($arr, "link_id", "number");
                        $obj->internalId = "";
                        $obj->itemId = "";

                        // make an array for sending it to user
                        $giftCardModel->customPricingData[] = $obj;

                    }
                }
            }
        } catch (Exception $e) {
            Mage::log("Folio3_Product_Model_Observer.getData - " . $e->getMessage(), null, 'product-save.log', true);
        }
        Mage::log("Folio3_Product_Model_Observer.getData - End", null, 'product-save.log', true);

        return $giftCardModel;
    }

    /**
     * This function searches the row in the given $tableName and return boolen value
     * Search Condition: $fieldId equals to $fieldValue
     * @param string $tableName
     * @param string $fieldId
     * @param string $fieldValue
     * @return boolean
     */
    public function lookupRow($tableName, $fieldId, $fieldValue)
    {

        $isBool = false;

        $connectionRead = Mage::getSingleton('core/resource')->getConnection('core_read');

        // making select query
        $select = $connectionRead->select()
            ->from($tableName, array($fieldId))
            ->where($fieldId . '=?', $fieldValue);

        // we only need to know if the row exist or not
        $result = $connectionRead->fetchRow($select);

        if (!empty($result)) {
            $isBool = true;
        }

        return $isBool;
    }

    public function getCustomPricingData($data)
    {
        $entityId = $data["entity_id"];

        if (!empty($entityId)) {
            $connectionRead = Mage::getSingleton('core/resource')->getConnection('core_read');
            // making select query
            $query = 'SELECT link_id,website_id,value FROM aw_giftcard_product_amount WHERE entity_id=' . $entityId;

            // we only need to know if the row exist or not
            $results = $connectionRead->fetchAll($query);
        }
        return $results;
    }

    /**
     * Check if value exist in array
     * @param $obj
     * @param $attributeName
     * @param null $type
     * @return int|string
     */
    public function getValue($obj, $attributeName, $type = null)
    {
        return isset($obj[$attributeName]) && !empty($obj[$attributeName]) ? $obj[$attributeName] : ($type == "number" ? 0 : "");
    }

    /**
     * Call Suitelet using information from arguments
     * @param $url
     * @param $verb
     * @param $data
     * @return object
     */
    public function sendRequest($url, $verb, $data)
    {
        Mage::log("Folio3_Product_Model_Observer.sendRequest - Start", null, 'product-save.log', true);
        // Creating object after referring the class from defined namespace
        $nsRequestObject = new \SystemWrapper\Netsuite\NsRestRequest($url, $verb, $data);
        // set headers
        $nsRequestObject->setCustomHeaders('Content-Type: application/json');
        $nsRequestObject->setCustomHeaders(ConnectorConstants::CustomHeaderName . ": " . ConnectorConstants::CustomHeaderValue);
        $response = $nsRequestObject->execute();
        Mage::log("Folio3_Product_Model_Observer.sendRequest - End", null, 'product-save.log', true);
        return $response;
    }

    /**
     * AW Gift Card Data Model for sending to NetSuite
     * @return stdClass
     */
    private function awGiftCardModel()
    {
        Mage::log("Folio3_Product_Model_Observer.awGiftCardModel - Start", null, 'product-save.log', true);
        $stdObject = new stdClass();

        $stdObject->storeId = "";
        $stdObject->id = "";
        $stdObject->name = "";
        $stdObject->description = "";
        $stdObject->shortDescription = "";
        $stdObject->sku = "";
        $stdObject->urlKey = "";
        $stdObject->metaTitle = "";
        $stdObject->metaDescription = "";
        $stdObject->metaKeyword = "";
        $stdObject->context = "";
        $stdObject->weight = 0;
        $stdObject->active = 0;
        $stdObject->awGcAllowOpenAmount = 0;
        $stdObject->awGcOpenAmountMax = 0;
        $stdObject->awGcOpenAmountMin = 0;
        $stdObject->customPricingData = array();

        $stdObject->stockData = new stdClass();
        $stdObject->stockData->isInStock = "";
        $stdObject->stockData->qty = 0;

        Mage::log("Folio3_Product_Model_Observer.awGiftCardModel - End", null, 'product-save.log', true);
        return $stdObject;
    }
}