<?php

//require_once '/var/www/html/app/code/local/Folio3/Common/CustomAttributeEntity.php';
require_once 'Folio3/Common/CustomAttributeEntity.php';

class Folio3_Sales_Model_Order_Api_V2 extends Mage_Sales_Model_Order_Api_V2 {

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
        /*
         * http://stackoverflow.com/questions/4878634/magento-catching-exceptions-and-rolling-back-database-transactions
          $transactionSave = Mage::getModel('core/resource_transaction');
          $transactionSave->addObject($model_one);
          $transactionSave->addObject($model_two);
          $transactionSave->save();
         */

        $quoteId = null;

        try {
            //http://magento.stackexchange.com/questions/18267/how-to-create-order-programmatically-with-downloadable-products
            $transactionSave = Mage::getModel('core/resource_transaction');

            /* Mage::log('storeId: ' . json_encode($storeId), null, 'success.log', true);
              Mage::log('customer: ' . json_encode($customer), null, 'success.log', true);
              Mage::log('productsEntityArray: ' . json_encode($products), null, 'success.log', true);
              Mage::log('shippingmethod: ' . json_encode($shippingmethod), null, 'success.log', true);
              Mage::log('paymentmethod: ' . json_encode($paymentmethod), null, 'success.log', true); */

            $id = $customer->entity->customer_id; // get Customer Id - TODO: generalize for guest, new and existing customers
            $customerRec = Mage::getModel('customer/customer')->load($id);

            //$storeId = $customer->getStoreId();// todo: test store id for multiple views of same magento store

            $quote = Mage::getModel('sales/quote')->setStoreId($storeId);

            $quote->assignCustomer($customerRec);


            foreach ($products as $p) {

                // add product(s)
                $product = Mage::getModel('catalog/product');
                $product = $product->load($product->getIdBySku($p->sku));
                $buyInfo = array(
                    'qty' => $p->qty,
                    'price' => 0
                        // custom option id => value id
                        // or
                        // configurable attribute id => value id
                );
                $params = array();
                //$links = Mage::getModel('downloadable/product_type')->getLinks($product);
                //$linkId = 0;
                //foreach ($links as $link) {
                //   $linkId = $link->getId();
                //}
                //$params['product'] = $product;
                $params['qty'] = $p->qty;
                //$params['links'] = array($linkId);
                $request = new Varien_Object();

                $request->setData($params);
                //$quoteObj->addProduct($productObj , $request);

                /* [adamw] Bundled product options would look like this:

                  $buyInfo = array(
                  "qty" => 1,
                  "bundle_option" = array(
                  "123" => array(456), //optionid => array( selectionid )
                  "124" => array(235)
                  )
                  );

                 */
                //$class_name = get_class($quote);
                //Zend_Debug::dump($class_name);

                $quote->addProduct($product, $request);
            }

            // TODO: getting shipping and billing data from request if found else fetch it from customer else throw error

            $shippingAddress = null;
            $addresses = $customer->address;

            foreach ($addresses as $address) {

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
                    $billingAddress = $quote->getBillingAddress()->addData($addressData);
                } else if ($address->mode == "shipping") {
                    $shippingAddress = $quote->getShippingAddress()->addData($addressData);
                } else {
                    // TODO: handle if mode is not defined
                    //shippingAddress = $quote->getShippingAddress()->addData($addressData);
                    //$billingAddress = $quote->getBillingAddress()->addData($addressData);
                }
            }

            if ($shippingmethod == 'freeshipping_freeshipping') {
                $shippingAddress->setFreeShipping(true)
                        ->setCollectShippingRates(true)->collectShippingRates()
                        ->setShippingMethod('freeshipping_freeshipping')
                        ->setPaymentMethod('checkmo');
            } else {
                $shippingAddress->setCollectShippingRates(true)->collectShippingRates()
                        ->setShippingMethod('flatrate_flatrate')
                        ->setPaymentMethod('checkmo');
            }

            //$quote->setCouponCode('ABCD'); TODO: undo if necessory

            $quote->getPayment()->importData(array('method' => 'checkmo'));

            $quote->collectTotals()->save();

            $quoteId = $quote->getId();

            Mage::log('quote: ' . $quote->getId(), null, 'success.log', true);

            $service = Mage::getModel('sales/service_quote', $quote);
            $service->submitAll();

            $order = $service->getOrder();

            //printf("Created order %s\n", $order->getIncrementId());

            $customAttribute = new CustomAttributeEntity();
            $customAttribute->field_id = 'orderIncrementId';
            $customAttribute->field_value = $order->getIncrementId();

            $result = array();
            $result[] = $customAttribute;

            return $result;
        } catch (Exception $e) {

            // delete quote if sales order is not created
            if (!empty($quoteId)) {
                try {
                    $quote = Mage::getModel("sales/quote")->load($quoteId);
                    $quote->setIsActive(false);
                    $quote->delete();
                } catch (Exception $e) {
                    
                }
            }

            throw $e;
        }
    }

}
