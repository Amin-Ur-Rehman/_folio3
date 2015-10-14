<?php
/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:13 PM
 */

/**
 * Class F3_Generic_Api_Base contains the base methods which are requested to be called from other system.
 */
class F3_Generic_Api_Base
{
    public function upsertShoppingCart($data)
    {
        $shoppingCartPriceRule = new Shopping_Cart_Price_Rule();
        $response = $shoppingCartPriceRule->upsert($data);
        return $response;
    }

    /*public function upsertCustomerGroup($data)
    {
        $customerGroup = new Customer_Group();
        $response = $customerGroup->upsert($data);
        return $response;
    }

    public function upsertCustomerTaxClass($data)
    {
        $customerTaxClass = new Customer_Tax_Class();
        $response = $customerTaxClass->upsert($data);
        return $response;
    }*/

    public function upsertPriceLevel($data)
    {
        $priceLevel = new Price_Level();
        $response = $priceLevel->upsert($data);
        return $response;
    }

    public function upsertPaymentTerm($data)
    {
        $paymentTerm = new Payment_Term();
        $response = $paymentTerm->upsert($data);
        return $response;
    }

    public function getGiftCardDiscount($data)
    {
        $response = $this->getGiftCardAmount($data);
        return $response;
    }

    private function getGiftCardAmount($data)
    {
        try {
            $quoteId = property_exists($data, "quoteId") && !empty($data->quoteId) ? $data->quoteId : null;

            if ($quoteId == null) {
                throw new Exception("Unable to get giftcard discount. Undefined Quote Id");
            }

            $connectionRead = Mage::getSingleton('core/resource')->getConnection('core_read');

            // SELECT quote_entity_id, giftcard_id, link_id, base_giftcard_amount, giftcard_amount, code FROM aw_giftcard_quote_totals JOIN aw_giftcard ON giftcard_id = entity_id WHERE quote_entity_id=123;

            // making select query
            $select = "SELECT quote_entity_id, giftcard_id, link_id, base_giftcard_amount, giftcard_amount, code FROM aw_giftcard_quote_totals JOIN aw_giftcard ON giftcard_id = entity_id WHERE quote_entity_id = $quoteId";

            // we only need to know if the row exist or not
            $result = $connectionRead->fetchRow($select);

            $responseData = array();

            if (!empty($result)) {
                $responseData["quoteEentityId"] = $result["quote_entity_id"];
                $responseData["giftcardId"] = $result["giftcard_id"];
                $responseData["linkId"] = $result["link_id"];
                $responseData["baseGiftcardAmount"] = $result["base_giftcard_amount"];
                $responseData["giftcardAmount"] = $result["giftcard_amount"];
                $responseData["code"] = $result["code"];
            } else {
                $responseData["quoteEentityId"] = null;
                $responseData["giftcardId"] = null;
                $responseData["linkId"] = null;
                $responseData["baseGiftcardAmount"] = 0;
                $responseData["giftcardAmount"] = 0;
                $responseData["code"] = null;
            }


            // making response object
            $response["status"] = 1;
            $response["message"] = "Gift Card Amount used in Order";
            $response["data"] = $responseData;
        } catch (Exception $e) {
            Mage::log("F3_Generic_Api_Base.getGiftCardAmount - Exception = " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }

        return $response;
    }

    public function getSalesOrderInfo($data)
    {
        try {
            $orderIncrementId = property_exists($data, "orderIncrementId") && !empty($data->orderIncrementId) ? $data->orderIncrementId : null;

            if ($orderIncrementId == null) {
                throw new Exception("Undefined Order IncrementId");
            }

            $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);
            $state = $order->getState();
            $status = $order->getStatus();

            $responseData = array();

            $responseData["state"] = !empty($state) ? $state : "";
            $responseData["status"] = !empty($status) ? $status : "";

            // making response object
            $response["status"] = 1;
            $response["message"] = "Sales Order Info";
            $response["data"] = $responseData;
        } catch (Exception $e) {
            Mage::log("F3_Generic_Api_Base.getGiftCardAmount - Exception = " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }

        return $response;
    }

    public function cancelSalesOrder($data)
        {
            try {
                $orderIncrementId = property_exists($data, "orderIncrementId") && !empty($data->orderIncrementId) ? $data->orderIncrementId : null;
                $nsTransactionId = property_exists($data, "nsTransactionId") && !empty($data->nsTransactionId) ? $data->nsTransactionId : null;

                if ($orderIncrementId == null) {
                    throw new Exception("Undefined Order IncrementId");
                }

                if ($nsTransactionId == null) {
                    throw new Exception("Undefined NetSuite Transaction Id");
                }

                $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);

                $state = Mage_Sales_Model_Order::STATE_CANCELED;
                $order->setData('state', $state);
                $order->setStatus($state);
                $history = $order->addStatusHistoryComment('This order has been cancelled due to editing of its NetSuite Sales Order Having Transaction Id: ' . $nsTransactionId, false);
                $history->setIsCustomerNotified(false);
                $responseData = array();

                // making response object
                $response["status"] = 1;
                $response["message"] = "Sales Order has been cancelled";
                $response["data"] = $responseData;
            } catch (Exception $e) {
                Mage::log("F3_Generic_Api_Base.getGiftCardAmount - Exception = " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
                throw new Exception($e->getMessage());
            }

            return $response;
        }
}