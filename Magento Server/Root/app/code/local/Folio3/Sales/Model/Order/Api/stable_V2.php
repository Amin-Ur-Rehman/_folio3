<?php

require_once Mage::getBaseDir('code') .'/local/Folio3/Common/CustomAttributeEntity.php';
require_once Mage::getBaseDir('code') .'/local/Folio3/Common/CustomOrderItemEntity.php';

class Folio3_Sales_Model_Order_Api_V2 extends Mage_Sales_Model_Order_Api_V2 {

    private $storeId;
    private $customer;
    private $addresses;
    private $products;
    private $shippingMehtod;
    private $paymentData;
    private $quote;

    /**
     * Retrieve Sales Order data
     *
     * @param string $increamentId
     * @param array $attributes
     * @return array
     */
    public function getSalesOrderInfo($increamentId) {

        // get default sales order info
        $result = parent::info($increamentId);

        $result['custom_salesorder_attribute'] = array();
        $result['custom_customer_attribute'] = array();

        $orderId = $result['order_id'];
        $customerId = $result['customer_id'];

        //Mage::log('order_id: ' + $orderId, null,  'create-order.log', true);
        // get custom sales order data 
        Mage::log('getSalesOrderInfo.$orderId' . $orderId, null, 'create-order.log', true);
        //$result['custom_salesorder_attribute'] = CustomAttributeEntity::getFieldManagerData($orderId);
        // get custom customer data
        Mage::log('getSalesOrderInfo.$customerId' . $customerId, null, 'create-order.log', true);
        //$result['custom_customer_attribute'] = CustomAttributeEntity::getWebFormsData($customerId);

        return $result;
    }

    /**
     * Create sales order in one request
     * @param string $storeId
     * @param object $customer
     * @param object $products
     * @param string $shippingmethod
     * @param object $paymentmethod
     * @param double $customShippingCost
     * @param string $status
     * @return array
     */
    public function createSalesOrder($storeId, $customer, $products, $shippingmethod, $customshippingcost, $paymentmethod, $history, $status) {
        $logStr = 'Func Start: createSalesOrder';
        $result = array();
        $logStr .= '__Before: initDataForQuote';
        //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
        // initialize members variables for quote
        $this->initDataForQuote($storeId, $customer, $products, $shippingmethod, $paymentmethod);
        $logStr .= '__After: initDataForQuote';
        //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

        $quoteId = null;
        try {
            $logStr .= '__Before: createQuote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // create quote
            $quoteId = $this->createQuote();
            $logStr .= '__After: createQuote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            Mage::log('quote: ' . $quoteId, null, 'create-order.log', true);

            $logStr .= '__Before: getModel sales/service_quote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // create sales order from quote
            $service = Mage::getModel('sales/service_quote', $this->quote);
            $logStr .= '__After: getModel sales/service_quote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

            $logStr .= '__Before: submit order';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            $service->submitAll();
            $logStr .= '__After: submit order';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // getting created order
            $logStr .= '__Before: get order';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            $order = $service->getOrder();
            $logStr .= '__After: get order';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

            $logStr .= '__Before: addHistoryInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // add history in comments
            $this->addHistoryInOrder($order, $history);
            $logStr .= '__After: addHistoryInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

            $logStr .= '__Before: setShippingCostInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // set custom shipping cost
            $this->setShippingCostInOrder($order, $customshippingcost);
            $logStr .= '__After: setShippingCostInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

            $logStr .= '__Before: setStatusInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // set set
            $this->setStatusInOrder($order, $status);
            $logStr .= '__After: setStatusInOrder';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // set order increment id in web service response

            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'orderIncrementId';
            $customAttribute->field_value = $order->getIncrementId();
            $result['result'][] = $customAttribute;
            $logStr .= '__Before: getOrderItemEntityArray';
            //$result['orderitementityarray'] = array();
            $result['orderitementityarray']= CustomOrderItemEntity::getOrderItemEntityArray($order->getIncrementId());
            $logStr .= '__After: getOrderItemEntityArray';
            Mage::log($logStr, null, 'create-order.log', true);

        } catch (Exception $e) {
            $logStr .= '__ERROR: ' . $e->getMessage();
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

            $logStr .= '__Before: deleteQuote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            // TODO: handle quote rollback - future
            $this->delteQuote($quoteId);
            $logStr .= '__After: deleteQuote';
            //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);
            //$this->_fault('Delete Quote Id: ' . $quoteId);

            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'Delete Quote Id: ' . $quoteId;
            $customAttribute->field_value = $e->getMessage();



            Mage::log(' Catch Log Error: ' . $logStr, null, 'order-status.log', true);

            throw $e;
        }

        $logStr .= '__Func End: createSalesOrder';

        //Mage::log('ZeeLogs: ' . $logStr, null, 'order-status.log', true);

        return $result;
    }

    /**
     * Initialize member varibles for quote
     * @param string $storeId
     * @param object $customerData
     * @param object $products
     * @param string $shippingMethod
     * @param object $paymentData
     * @return void
     */
    private function initDataForQuote($storeId, $customerData, $products, $shippingMethod, $paymentData) {
        $this->storeId = $storeId;
        $this->customer = $customerData->entity;
        $this->addresses = $customerData->address;
        $this->products = $products;
        $this->shippingMehtod = $shippingMethod;
        $this->paymentData = $paymentData;
    }

    /**
     * Create a Quote
     * @return string $quoteId
     */
    private function createQuote() {
        $this->quote = $this->getQuoteModel();

        $this->setStoreId();
        $this->setCustomer();
        $this->addProducts();
        $this->setAddressesAndPaymentInfo();
        $this->quote->save();
        $quoteId = $this->quote->getId();

        return $quoteId;
    }

    /**
     * Set Store Id in Quote
     */
    private function setStoreId() {
        $this->quote->setStoreId($this->storeId);
    }

    /**
     * Get Quote Model
     * @return  Mage_Core_Model_Abstract|false
     */
    private function getQuoteModel() {
        return Mage::getModel('sales/quote');
    }

    /**
     * Assign/Set Customer in the Quote
     */
    private function setCustomer() {
        // get Customer Id - TODO: generalize for guest, new and existing customers
        $id = $this->customer->customer_id;
        $customer = Mage::getModel('customer/customer')->load($id);
        //$storeId = $customer->getStoreId();// todo: test store id for multiple views of same magento store
        $this->quote->assignCustomer($customer);
    }

    /**
     * Add products in the Quote
     */
    private function addProducts() {
        $products = $this->products;
        foreach ($products as $p) {
            // add product(s)
            $product = Mage::getModel('catalog/product');

            // if identifier type is sku then get product id using sku
            if (!empty($p->sku)) {
                $productId = $product->getIdBySku(urldecode($p->sku));
            } else {
                $productId = $p->product_id;
            }

            $product = $product->load($productId);

            $customPrice = $p->customprice;

            $params = array();
            $params['qty'] = $p->qty;
            $request = new Varien_Object();
            $request->setData($params);

            if (!isset($customPrice)) {
                $this->quote->addProduct($product, $request);
            } else {
                // we need (setOriginalCustomPrice) since Magento 1.4
                $this->quote->addProduct($product, $request)->setOriginalCustomPrice($customPrice); //custom price
            }
        }
    }

    /**
     * Set Shipping & Billing Addresses and Shipping & Payment information in the Quote
     */
    private function setAddressesAndPaymentInfo() {
        // TODO: getting shipping and billing data from request if found else fetch it from customer else throw error
        $shippingAddress = null;
        $addresses = $this->addresses;

        foreach ($addresses as $address) {
            // create address array
            $addressData = array(
                'firstname' => $address->firstname,
                'lastname' => $address->lastname,
                'street' => $address->street,
                'city' => $address->city,
                'postcode' => $address->postcode,
                'telephone' => $address->telephone,
                'country_id' => $address->country_id,
                'region_id' => $address->region_id, // id from directory_country_region table
            );

            if ($address->mode == "billing") {
                $billingAddress = $this->quote->getBillingAddress()->addData($addressData);
            } else if ($address->mode == "shipping") {
                $shippingAddress = $this->quote->getShippingAddress()->addData($addressData);
            } else {
                // TODO: handle if mode is not defined
                //shippingAddress = $quote->getShippingAddress()->addData($addressData);
                //$billingAddress = $quote->getBillingAddress()->addData($addressData);
            }
        }

        // set Shipping and Payment Information
        if ($this->shippingMehtod == 'freeshipping_freeshipping') {
            $shippingAddress->setFreeShipping(true)
                    ->setCollectShippingRates(true)->collectShippingRates()
                    ->setShippingMethod('freeshipping_freeshipping')
                    ->setPaymentMethod('checkmo');
        } else {
            $shippingAddress->setCollectShippingRates(true);
            $shippingAddress->collectShippingRates();
            $shippingAddress->setShippingMethod($this->shippingMehtod);
            $shippingAddress->setPaymentMethod('checkmo');
        }

        // set coupon code if necessory
        //$quote->setCouponCode('ABCD');
        $this->quote->getPayment()->importData(array('method' => 'checkmo'));
        $this->quote->collectTotals()->save();
    }

    /**
     * Delete Quote
     * @param string $quoteId
     */
    private function delteQuote($quoteId) {
        // delete quote if sales order is not created
        if (!empty($quoteId)) {
            try {
                $quote = Mage::getModel("sales/quote")->load($quoteId);
                $quote->setIsActive(false);
                $quote->delete();
            } catch (Exception $e) {
                // we are not handling this extecption 
                // as the order is not created from quote
                // so no need to check the quote
            }
        }
    }

    /**
     * This funtions sets shipping cost in order if cost exist
     * @param type $order
     * @param type $cost
     */
    private function setShippingCostInOrder($order, $cost) {
        try {
            if (empty($cost)) {
                $cost = 0;
            }

            //$this->showAmountBreakup($order);

            $oldShipAmt = $order->getShippingAmount();
            $oldBaseShipAmt = $order->getBaseShippingAmount();
            $oldGrandTotal = $order->getGrandTotal();
            $oldBaseGrandTotal = $order->getBaseGrandTotal();

            $order->setShippingAmount($cost);
            $order->setBaseShippingAmount($cost);

            $order->setBaseShippingTaxAmount($cost);
            $order->setShippingInclTax($cost);

            //adding shipping price to grand total

            /* Mage::log('oldGrandTotal - In Order : ' . ($oldGrandTotal), null, 'create-order.log', true);
              Mage::log('oldBaseGrandTotal - In Order : ' . ($oldBaseGrandTotal), null, 'create-order.log', true);
              Mage::log('oldShipAmt - In Order : ' . ($oldShipAmt), null, 'create-order.log', true);
              Mage::log('oldBaseShipAmt - In Order : ' . ($oldBaseShipAmt), null, 'create-order.log', true);
              Mage::log('cost - In Order : ' . ($cost), null, 'create-order.log', true);

              Mage::log('setGrandTotal - In Order : ' . ($oldGrandTotal + $cost - $oldShipAmt), null, 'create-order.log', true);
              Mage::log('setGrandTotal - In Order : ' . ($oldBaseGrandTotal + $cost - $oldBaseShipAmt), null, 'create-order.log', true); */

            $order->setGrandTotal($oldGrandTotal + $cost - $oldShipAmt);
            $order->setBaseGrandTotal($oldBaseGrandTotal + $cost - $oldBaseShipAmt);
            $order->save();

            //$this->showAmountBreakup($order);
        } catch (Exception $e) {
            Mage::log('SetShippingCostInOrder - Cost: ' . $cost . ' - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }
    }

    /**
     * This funtions sets history in order comments if history exist
     * @param type $order
     * @param type $history
     */
    private function addHistoryInOrder($order, $history) {
        try {
            if (!empty($history)) {
                $history = urldecode($history);
                $order->addStatusHistoryComment($history);
                $order->save();
            }
        } catch (Exception $e) {
            Mage::log('addHistoryInOrder - History: ' . $history . ' - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }
    }

    private function showAmountBreakup($order) {
        try {
            $shippingCost = $order->getShippingAmount();
            //shipping cost in base currency
            $shippingBaseCost = $order->getBaseShippingAmount();
            //shipping tax
            $shippingTax = $order->getShippingTaxAmount();
            //shipping tax in base currenty
            $shippingBaseTax = $order->getBaseShippingTaxAmount();
            //shipping cost including tax
            $shippingCostIncludingTax = $order->getShippingInclTax();
            //shipping cost including tax in base currency
            $shippingBaseCostIncludingTax = $order->getBaseShippingInclTax();
            // grand total
            $grandTotal = $order->getGrandTotal();
            // base grand total
            $baseGrandTotal = $order->getBaseGrandTotal();

            Mage::log('shippingCost: ' . $shippingCost, null, 'create-order.log', true);
            Mage::log('shippingBaseCost: ' . $shippingBaseCost, null, 'create-order.log', true);
            Mage::log('shippingTax: ' . $shippingTax, null, 'create-order.log', true);
            Mage::log('shippingBaseTax: ' . $shippingBaseTax, null, 'create-order.log', true);
            Mage::log('shippingCostIncludingTax: ' . $shippingCostIncludingTax, null, 'create-order.log', true);
            Mage::log('shippingBaseCostIncludingTax: ' . $shippingBaseCostIncludingTax, null, 'create-order.log', true);
            Mage::log('grandTotal: ' . $grandTotal, null, 'create-order.log', true);
            Mage::log('baseGrandTotal: ' . $baseGrandTotal, null, 'create-order.log', true);
        } catch (Exception $e) {
            Mage::log('showAmountBreakup - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }
    }

    private function setStatusInOrder($order, $status) {
        try {
            $state;

            Mage::log('setStatusInOrder - $status: ' . $status, null, 'create-order.log', true);

            $order = Mage::getModel('sales/order')->loadByIncrementId($order->getIncrementId());

            switch ($status) {
                case 'G':
                    $state = Mage_Sales_Model_Order::STATE_COMPLETE;
                    break;
                case 'H':
                    $state = Mage_Sales_Model_Order::STATE_CLOSED;
                    break;
                case 'C':
                    $state = Mage_Sales_Model_Order::STATE_CANCELED;
                    break;
                default:
                    $state = Mage_Sales_Model_Order::STATE_PROCESSING;
            }

            $order->setData('state', $state);
            $order->setStatus($state);
            $history = $order->addStatusHistoryComment('Order was set to ' . $state . ' by Order Export tool.', false);
            $history->setIsCustomerNotified(false);
            $order->save();
        } catch (Exception $e) {
            Mage::log('setStatusInOrder - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }
    }

}
