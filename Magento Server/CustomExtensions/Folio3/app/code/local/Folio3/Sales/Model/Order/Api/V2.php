<?php

//require_once '/var/www/html/app/code/local/Folio3/Common/CustomAttributeEntity.php';
require_once 'Folio3/Common/CustomAttributeEntity.php';

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

        //Mage::log('order_id: ' + $orderId, null,  'success.log', true);
        // get custom sales order data 
        Mage::log('getSalesOrderInfo.$orderId' . $orderId, null, 'success.log', true);
        $result['custom_salesorder_attribute'] = CustomAttributeEntity::getFieldManagerData($orderId);

        // get custom customer data
        Mage::log('getSalesOrderInfo.$customerId' . $customerId, null, 'success.log', true);
        $result['custom_customer_attribute'] = CustomAttributeEntity::getWebFormsData($customerId);

        return $result;
    }

    /**
     * Create sales order in one request
     * @param string $storeId
     * @param object $customer
     * @param object $products
     * @param string $shippingmethod
     * @param object $paymentmethod
     * @return array
     */
    public function createSalesOrder($storeId, $customer, $products, $shippingmethod, $paymentmethod) {

        // initialize members variables for quote
        $this->initDataForQuote($storeId, $customer, $products, $shippingmethod, $paymentmethod);

        $quoteId = null;
        try {
            // create quote
            $quoteId = $this->createQuote();
            Mage::log('quote: ' . $quoteId, null, 'success.log', true);

            // create sales order from quote
            $service = Mage::getModel('sales/service_quote', $this->quote);
            $service->submitAll();

            // getting created order
            $order = $service->getOrder();

            // set order increment id in web service response
            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'orderIncrementId';
            $customAttribute->field_value = $order->getIncrementId();

            $result = array();
            $result[] = $customAttribute;

            return $result;
        } catch (Exception $e) {
            // TODO: handle quote rollback - future
            $this->delteQuote($quoteId);
            throw $e;
        }
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
                $productId = $product->getIdBySku($p->sku);
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
            $shippingAddress->setCollectShippingRates(true)->collectShippingRates()
                    ->setShippingMethod('flatrate_flatrate')
                    ->setPaymentMethod('checkmo');
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

}
