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

                Mage::log('getOrderItemEntityArray - $orderIncrementId: ' . $orderIncrementId, null, 'create-order.log', true);

                $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);
                $ordered_items = $order->getAllItems();
                foreach($ordered_items as $item) {//item detail


                $customOrderItemEntity = new CustomOrderItemEntity();
                $customOrderItemEntity->product_sku = $item->getSku();
                $customOrderItemEntity->product_id = $item->getProductId();
                $customOrderItemEntity->order_item_id = $item->getItemId();

                $orderItemEntityArr[] = $customOrderItemEntity;


            }
        } catch (Exception $e) {
            Mage::log('getOrderItemEntityArray - Error: ' . $e->getMessage(), null, 'create-order.log', true);
        }


        return $orderItemEntityArr;
    }

}
