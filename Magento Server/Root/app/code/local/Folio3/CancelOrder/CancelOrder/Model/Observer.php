<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 05-Aug-15
 * Time: 4:07 PM
 */

include_once "/var/www/html/f3store2/app/code/local/Folio3/Libraries/NsRestRequest.php";
include_once "/var/www/html/f3store2/app/code/local/Folio3/Libraries/ConnectorConstants.php";

class Folio3_CancelOrder_Model_Observer
{

    public function invoicedStatusChange(Varien_Event_Observer $observer)
    {

        $original_data = $observer->getEvent()->getData('data_object')->getOrigData();
        $new_data = $observer->getEvent()->getData('data_object')->getData();
        Mage::log($original_data);
        Mage::log($new_data);
        if (($original_data['state'] !== $new_data['state']) && ($new_data['state'] == Mage_Sales_Model_Order::STATE_CANCELED)) {
            Mage::log("Yes+Cancel", null, 'cancel-order.log', true);
            /**
             * Close order in NetSuite when order is cancelled in Magento
             */
            $this->closeSalesOrder($new_data['increment_id']);

            Mage::log(json_encode($new_data), null, 'cancel-order.log', true);
        }
    }

    public function closeSalesOrder($orderIncrementId)
    {
        try {
            $data = null;

            $url = Mage::getStoreConfig(ConnectorConstants::SuiteletUrlPath);
            Mage::log($url, null, 'cancel-order.log', true);
            $storeId = Mage::getStoreConfig(ConnectorConstants::StoreIdPath);
            Mage::log($storeId, null, 'cancel-order.log', true);
            $verb = 'POST';

            $data["apiMethod"] = "closeSalesOrder";
            $data["data"] = array(
                "soIncrementId" => "$orderIncrementId",
                "storeId", "$storeId"
            );

            Mage::log("Request=Data" . json_encode($data), null, 'cancel-order.log', true);

            $response = $this->sendRequest($url, $verb, $data);

            Mage::log("ResponseData= " . $response, null, 'cancel-order.log', true);

            $responseJson = json_decode($response);

            Mage::log($response, null, 'cancel-order.log', true);
        } catch (Exception $e) {
            Mage::logException($e);
            Mage::log(json_encode($e), null, 'cancel-order.log', true);
        }
    }

    /**
     * Call Suitelet after getting the information from arguments
     * @param $url
     * @param $verb
     * @param $data
     * @return object
     */
    private function sendRequest($url, $verb, $data)
    {
        // Creating object after referring the class from defined namespace
        $nsRequestObject = new \SystemWrapper\Netsuite\NsRestRequest($url, $verb, $data);

        $nsRequestObject->setCustomHeaders('Content-Type: application/json');
        $nsRequestObject->setCustomHeaders(ConnectorConstants::CustomHeader);

        $response = $nsRequestObject->execute();

        return $response;
    }
}