<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of CustomOrderItemEntity
 *
 * @author zahmed
 */
class CustomOrderItemEntity {

    public $product_sku;
    public $product_id;
    public $order_item_id;



    /**
     * Retrieve sales order data from field manager plugin tables
     *
     * @param string $orderId
     * @return  array of objects
     */
    public static function getOrderItemEntityArray($orderIncrementId) {

        if (empty($orderIncrementId)) {
            return array();
        }

        $orderItemEntityArr = array();

        try {

                Mage::log('getOrderItemEntityArray - orderIncrementId: ' . $orderIncrementId, null, 'create-order.log', true);

                $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);
                $ordered_items = $order->getAllItems();
                foreach($ordered_items as $item) {//item detail

                    Mage::log("OK 1.1", null, 'create-order.log', true);

                $customOrderItemEntity = new CustomOrderItemEntity();
                    Mage::log("OK 1.2", null, 'create-order.log', true);
                $customOrderItemEntity->product_sku = $item->getSku();
                    Mage::log("OK 1.3", null, 'create-order.log', true);
                $customOrderItemEntity->product_id = $item->getProductId();
                    Mage::log("OK 1.4", null, 'create-order.log', true);
                $customOrderItemEntity->order_item_id = $item->getItemId();
                    Mage::log("OK 1.5", null, 'create-order.log', true);

                $orderItemEntityArr[] = $customOrderItemEntity;
                    Mage::log("OK 1.6", null, 'create-order.log', true);

            }
        } catch (Exception $e) {
            Mage::log('getOrderItemEntityArray - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }

        Mage::log("End", null, 'create-order.log', true);

        return $orderItemEntityArr;
    }

}
