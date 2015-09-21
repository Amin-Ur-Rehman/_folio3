<?php

require_once Mage::getBaseDir('code') . '/local/Folio3/Common/CustomAttributeEntity.php';
require_once Mage::getBaseDir('code') . '/local/Folio3/Common/CustomOrderItemEntity.php';

class Folio3_Sales_Model_Order_Api_V2 extends Mage_Sales_Model_Order_Api_V2
{

    private $storeId;
    private $customer;
    private $addresses;
    private $products;
    private $shippingMehtod;
    private $paymentData;
    private $quote;
    private $isOnlyGiftCard = true;

    /**
     * Retrieve Sales Order data
     * @param $increamentId
     * @return array
     */
    public function getSalesOrderInfo($increamentId)
    {

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
     * @param $storeId
     * @param $customer
     * @param $products
     * @param $shippingmethod
     * @param $customshippingcost
     * @param $paymentmethod
     * @param $history
     * @param $status
     * @return array
     * @throws Exception
     */
    public function createSalesOrder($storeId, $customer, $products, $shippingmethod, $customshippingcost, $paymentmethod, $history, $status)
    {
        $GLOBALS["f3_giftcard_code"] = array();
        $result = array();
        // initialize members variables for quote
        $this->initDataForQuote($storeId, $customer, $products, $shippingmethod, $paymentmethod);

        $quoteId = null;
        try {

            // create quote
            $quoteId = $this->createQuote();
            //Mage::log('quote: ' . $quoteId, null, 'create-order.log', true);

            // create sales order from quote
            $service = Mage::getModel('sales/service_quote', $this->quote);

            $service->submitAll();
            // getting created order
            $order = $service->getOrder();
            //Mage::log('order: ' . json_encode($order), null, 'create-order.log', true);

            // add history in comments
            $this->addHistoryInOrder($order, $history);

            // set custom shipping cost
            $this->setShippingCostInOrder($order, $customshippingcost);
            // set set
            $this->setStatusInOrder($order, $status);

            //$order = $this->createOrderZee($storeId, $customer, $products, $shippingmethod, $customshippingcost, $paymentmethod, $history, $status);

            Mage::log('IncrementId: ' . $order->getIncrementId(), null, 'create-order.log', true);

            // set order increment id in web service response
            Mage::log('CustomAttributeEntity: ' . class_exists("CustomAttributeEntity"), null, 'create-order.log', true);
            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'orderIncrementId';
            $customAttribute->field_value = $order->getIncrementId();
            $result['result'][] = $customAttribute;
            $result['orderitementityarray'] = CustomOrderItemEntity::getOrderItemEntityArray($order->getIncrementId());

            Mage::log('result1: ' . json_encode($result), null, 'create-order.log', true);

        } catch (Exception $e) {
            // TODO: handle quote rollback - future
            $this->delteQuote($quoteId);

            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'Delete Quote Id: ' . $quoteId;
            $customAttribute->field_value = $e->getMessage();

            Mage::log('Catch Log Error: ' . $e->getMessage(), null, 'order-status.log', true);

            throw $e;
        }

        Mage::log('result2: ' . json_encode($result), null, 'create-order.log', true);

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
    private function initDataForQuote($storeId, $customerData, $products, $shippingMethod, $paymentData)
    {
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
    private function createQuote()
    {
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
    private function setStoreId()
    {
        $this->quote->setStoreId($this->storeId);
    }

    /**
     * Get Quote Model
     * @return  Mage_Core_Model_Abstract|false
     */
    private function getQuoteModel()
    {
        return Mage::getModel('sales/quote');
    }

    /**
     * Assign/Set Customer in the Quote
     */
    private function setCustomer()
    {
        // get Customer Id - TODO: generalize for guest, new and existing customers
        $id = $this->customer->customer_id;
        $customer = Mage::getModel('customer/customer')->load($id);
        //$storeId = $customer->getStoreId();// todo: test store id for multiple views of same magento store
        $this->quote->assignCustomer($customer);
    }

    /**
     * Add products in the Quote
     */
    private function addProducts()
    {
        $products = $this->products;
        Mage::log('products: ' . json_encode($products), null, 'create-order.log', true);
        foreach ($products as $p) {
            Mage::log('p: ' . json_encode($p), null, 'create-order.log', true);
            // add product(s)
            $product = Mage::getModel('catalog/product');

            // if identifier type is sku then get product id using sku
            if (!empty($p->sku)) {
                $productId = $product->getIdBySku(urldecode($p->sku));
            } else {
                $productId = $p->product_id;
            }

            // todo generalize store id
            $product = $product->setStore(1)->setStoreId(1)->load($productId);

            if ($product->getTypeId() != "aw_giftcard") {
                $this->isOnlyGiftCard = false;
            }

            $isCustomPrice = array_key_exists("customprice", $p);

            // set data in quote item
            $params = array();
            $params['qty'] = $p->qty;
            if (isset($p->f3_gc_info) && count($p->f3_gc_info) > 0) {
                $gcInfo = $p->f3_gc_info[0];
                $params['aw_gc_amount'] = $gcInfo->aw_gc_amount;
                $params['aw_gc_sender_name'] = $gcInfo->aw_gc_sender_name;
                $params['aw_gc_sender_email'] = $gcInfo->aw_gc_sender_email;
                $params['aw_gc_recipient_name'] = $gcInfo->aw_gc_recipient_name;
                $params['aw_gc_recipient_email'] = $gcInfo->aw_gc_recipient_email;
                $params['aw_gc_message'] = $gcInfo->aw_gc_message;
                //$params['aw_gc_created_codes'] = array(1);

                // set global variables to use in gift card extension
                if(!array_key_exists("f3_giftcard_code", $GLOBALS)){
                    $GLOBALS["f3_giftcard_code"] = array();
                }

                $giftCardObj = array();
                $giftCardObj['aw_gc_amount'] = $gcInfo->aw_gc_amount;
                $giftCardObj['aw_gc_sender_name'] = $gcInfo->aw_gc_sender_name;
                $giftCardObj['aw_gc_sender_email'] = $gcInfo->aw_gc_sender_email;
                $giftCardObj['aw_gc_recipient_name'] = $gcInfo->aw_gc_recipient_name;
                $giftCardObj['aw_gc_recipient_email'] = $gcInfo->aw_gc_recipient_email;
                $giftCardObj['aw_gc_code'] = $gcInfo->aw_gc_code;
                $giftCardObj['use'] = false;

                $GLOBALS["f3_giftcard_code"][] = $giftCardObj;

                Mage::log('gcInfo - aw_gc_amount: ' . $gcInfo->aw_gc_amount, null, 'create-order.log', true);
            }

            Mage::log('params: ' . json_encode($params), null, 'create-order.log', true);

            $request = new Varien_Object();
            $request->setData($params);

            if ($isCustomPrice) {
                $customPrice = $p->customprice;
                // we need (setOriginalCustomPrice) since Magento 1.4
                $quoteItem = $this->quote->addProduct($product, $request)->setOriginalCustomPrice($customPrice); //custom price
            } else {
                $quoteItem = $this->quote->addProduct($product, $request);
            }

            //Mage::log('quoteItem: ' . $quoteItem, null, 'create-order.log', true);

            //$quoteItem->setQuote($this->quote);
        }
    }

    /**
     * Set Shipping & Billing Addresses and Shipping & Payment information in the Quote
     */
    private function setAddressesAndPaymentInfo()
    {
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

        if ($this->isOnlyGiftCard) {
            $this->quote->setPaymentMethod("cashondelivery");
        } else {
            // set Shipping and Payment Information
            if ($this->shippingMehtod == 'freeshipping_freeshipping') {
                $shippingAddress->setFreeShipping(true)
                    ->setCollectShippingRates(true)->collectShippingRates()
                    ->setShippingMethod('freeshipping_freeshipping')
                    ->setPaymentMethod('cashondelivery');
            } else {
                $shippingAddress->setCollectShippingRates(true);
                $shippingAddress->collectShippingRates();
                $shippingAddress->setShippingMethod($this->shippingMehtod);
                $shippingAddress->setPaymentMethod('cashondelivery');
            }
        }
        // set coupon code if necessory
        //$quote->setCouponCode('ABCD');
        $this->quote->getPayment()->importData(array('method' => 'cashondelivery'));
        $this->quote->collectTotals()->save();
    }

    /**
     * Delete Quote
     * @param string $quoteId
     */
    private function delteQuote($quoteId)
    {
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
    private function setShippingCostInOrder($order, $cost)
    {
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
    private function addHistoryInOrder($order, $history)
    {
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

    private function showAmountBreakup($order)
    {
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

    private function setStatusInOrder($order, $status)
    {
        try {
            Mage::log('setStatusInOrder - status: ' . $status, null, 'create-order.log', true);

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

    public function createOrderZee($storeId, $customer, $products, $shippingmethod, $customshippingcost, $paymentmethod, $history, $status)
    {

        Mage::log('OK 1 ', null, 'create-order.log', true);
        $quote = Mage::getModel('sales/quote');

        // add customer
        $id = $customer->entity->customer_id;
        $customer = Mage::getModel('customer/customer')->load($id);
        $quote->assignCustomer($customer);

        Mage::log('OK 2 ', null, 'create-order.log', true);

        $storeObj = $quote->getStore()->load($storeId);
        $quote->setStore($storeObj);

        Mage::log('OK 3 ', null, 'create-order.log', true);

        //add product

        $productModel = Mage::getModel('catalog/product');
        $productId = $productModel->getIdBySku(urldecode($products[0]->sku));

        $productModel = Mage::getModel('catalog/product');
        $product = $productModel->setStore($storeId)->setStoreId($storeId)->load($productId);

        Mage::log('OK 4 ', null, 'create-order.log', true);

        $params = array();
        //$params['price'] = 11;
        $params['qty'] = $products[0]->qty;
        $params['aw_gc_amount'] = $products[0]->f3_gc_info[0]->aw_gc_amount;
        $params['aw_gc_sender_name'] = $products[0]->f3_gc_info[0]->aw_gc_sender_name;
        $params['aw_gc_sender_email'] = $products[0]->f3_gc_info[0]->aw_gc_sender_email;
        $params['aw_gc_recipient_name'] = $products[0]->f3_gc_info[0]->aw_gc_recipient_name;
        $params['aw_gc_recipient_email'] = $products[0]->f3_gc_info[0]->aw_gc_recipient_email;
        $params['aw_gc_message'] = $products[0]->f3_gc_info[0]->aw_gc_message;
        $params['aw_gc_created_codes'] = array("1");
        $request = new Varien_Object();
        $request->setData($params);

        Mage::log('OK 5 ', null, 'create-order.log', true);

        $quoteItem = $quote->addProduct($product, $request); //var_dump(($quote->getAllItems()));die();

        Mage::log('OK 6 ', null, 'create-order.log', true);
        $quoteItem->setQuote($quote);

        Mage::log('OK 7 - quoteItem: ', null, 'create-order.log', true);

        //$quote->checkData();

        // shipping and payment info

        // create address array
        $addressData = array(
            'firstname' => "Zeeshan",
            'lastname' => "Ahmed",
            'street' => "112 N 12th Street",
            'city' => "Columbus",
            'postcode' => "08060",//"35010",
            'telephone' => "123456879",
            'country_id' => "US",
            'region_id' => "41" // id from directory_country_region table
        );


        $billingAddress = $quote->getBillingAddress()->addData($addressData);
        $shippingAddress = $quote->getShippingAddress()->addData($addressData);

        Mage::log('OK 8 ', null, 'create-order.log', true);

        // set Shipping and Payment Information

        $shippingMethod = $shippingmethod;
        $paymentMethod = $paymentmethod->method;

        if ($shippingMethod == 'freeshipping_freeshipping') {
            $shippingAddress->setFreeShipping(true)
                ->setCollectShippingRates(true)->collectShippingRates()
                ->setShippingMethod($shippingMethod)
                ->setPaymentMethod($paymentMethod);
        } else {
            $shippingAddress->setCollectShippingRates(true);
            $shippingAddress->collectShippingRates();
            $shippingAddress->setShippingMethod($shippingMethod);
            $shippingAddress->setPaymentMethod($paymentMethod);
        }

        Mage::log('OK 9 ', null, 'create-order.log', true);

        // set coupon code if necessory
        //$quote->setCouponCode('ABCD');
        $quote->getPayment()->importData(array('method' => $paymentMethod));
        $quote = $quote->collectTotals()->save();
        $quoteId = $quote->getId();

        Mage::log('Quote Id: ' . $quoteId, null, 'create-order.log', true);

        // create SO

        $service = Mage::getModel('sales/service_quote', $quote);
        $service->submitAll();
        $order = $service->getOrder();

        Mage::log('OK 10 ', null, 'create-order.log', true);

        $history = "Test History";
        $order->addStatusHistoryComment($history);

        Mage::log('OK 11 ', null, 'create-order.log', true);

        $cost = $customshippingcost;

        $oldShipAmt = $order->getShippingAmount();
        $oldBaseShipAmt = $order->getBaseShippingAmount();
        $oldGrandTotal = $order->getGrandTotal();
        $oldBaseGrandTotal = $order->getBaseGrandTotal();

        $order->setShippingAmount($cost);
        $order->setBaseShippingAmount($cost);

        $order->setBaseShippingTaxAmount($cost);
        $order->setShippingInclTax($cost);

        $order->setGrandTotal($oldGrandTotal + $cost - $oldShipAmt);
        $order->setBaseGrandTotal($oldBaseGrandTotal + $cost - $oldBaseShipAmt);
        $order->save();

        Mage::log('OK 12 ', null, 'create-order.log', true);

        $state = Mage_Sales_Model_Order::STATE_PROCESSING;
        $order->setData('state', $state);
        $order->setStatus($state);
        $history = $order->addStatusHistoryComment('Order was set to ' . $state . ' by Order Export tool.', false);
        $history->setIsCustomerNotified(false);
        $order->save();

        Mage::log('OK End ', null, 'create-order.log', true);

        return $order;
    }
}