<?php

require_once 'app/Mage.php';
session_start();
session_write_close();
umask(0);
Mage::app()->setCurrentStore(Mage_Core_Model_App::ADMIN_STORE_ID);

function addHandlingCostInOrder($order, $cost) {

    $cost = 0;


    $oldShipAmt = $order->getShippingAmount();
    $oldBaseShipAmt = $order->getBaseShippingAmount();
    $oldGrandTotal = $order->getGrandTotal();
    $oldBaseGrandTotal = $order->getBaseGrandTotal();

    $order->setShippingAmount($cost);
    $order->setBaseShippingAmount($cost);

    $order->setBaseShippingTaxAmount($cost);
    $order->setShippingInclTax($cost);

    //adding shipping price to grand total

    $order->setGrandTotal($cost);
    $order->setBaseGrandTotal($cost);
    $order->save();
}

$arr = array('status' => false, 'error' => '');

try {
    $incrementId = $_GET['incrementid'];
    $method = $_GET['method'];

    if ($method == 'setitemcost') {
        //echo 'cost: ' . $cost;
        //echo 'incrementId: ' . $incrementId;

        $order = Mage::getModel('sales/order')->loadByIncrementId($incrementId);

        $items = $order->getAllItems();

        //$item = Mage::getModel('sales/order_item')->load('');
        //$item->setPrice(40)->setBasePrice(40)->save();
        //addHandlingCostInOrder($order, $cost);

        $arr['status'] = true;
    }
} catch (Exception $e) {
    $arr['status'] = false;
    $arr['error'] = $e->getMessage();
}

$result = array();
$result['items'] = array();
foreach ($items as $item) {
    $temp = array();

    foreach ($item->getData() as $attribute => $value) {
        //echo $attribute .' '.$value . '<br>';
    }


    //$item = Mage::getModel('sales/order_item')->load($item->getItemId());
    $result['items'][] = array(
        'id' => $item->getId(),
        'itemid' => $item->getItemId(),
        'sku' => $item->getSku(),
        'qtyordered' => $item->getQtyOrdered(),
        'name' => $item->getName(),
        'price' => $item->getPrice(),
        'originalprice' => $item->getOriginalPrice(),
        'subtotal' => $item->getSubTotal(),
        'getQtyOrdered' => $item->getQtyOrdered,
        'getBaseCost' => $item->getBaseCost,
        'getPrice' => $item->getPrice,
        'getBasePrice' => $item->getBasePrice,
        'getOriginalPrice' => $item->getOriginalPrice,
        'getBaseOriginalPrice' => $item->getBaseOriginalPrice,
        'getTaxPercent' => $item->getTaxPercent,
        'getTaxAmount' => $item->getTaxAmount,
        'getBaseTaxAmount' => $item->getBaseTaxAmount,
        'getDiscountPercent' => $item->getDiscountPercent,
        'getDiscountAmount' => $item->getDiscountAmount,
        'getBaseDiscountAmount' => $item->getBaseDiscountAmount,
        'getRowTotal' => $item->getRowTotal,
        'getBaseRowTotal' => $item->getBaseRowTotal,
        'getBaseTaxBeforeDiscount' => $item->getBaseTaxBeforeDiscount,
        'getTaxBeforeDiscount' => $item->getTaxBeforeDiscount,
        'getPriceInclTax' => $item->getPriceInclTax,
        'getBasePriceInclTax' => $item->getBasePriceInclTax,
        'getRowTotalInclTax' => $item->getRowTotalInclTax,
        'getBaseRowTotalInclTax' => $item->getBaseRowTotalInclTax,
        'type' => get_class($item)
    );
}

$a = true;
foreach ($items as $item) {

    $item->setData('row_total', 0);
    $item->setData('base_row_total', 0);
    $item->setData('row_total_incl_tax', 0);
    $item->setData('base_row_total_incl_tax', 0);



    $item
            ->setQtyOrdered(0)
            //->setBaseCost(24.97)
            //->setPrice(24.97)
            //->setBasePrice(24.97)
            //->setOriginalPrice(24.97)
            //->setBaseOriginalPrice(24.97)
            ->setTaxPercent(0)
            ->setTaxAmount(0)
            ->setBaseTaxAmount(0)
            ->setDiscountPercent(0)
            ->setDiscountAmount(0)
            ->setBaseDiscountAmount(0)
            ->setRowTotal(0)
            ->setBaseRowTotal(0)
            ->setBaseTaxBeforeDiscount(0)
            ->setTaxBeforeDiscount(0)
            ->setPriceInclTax(0)
            ->setBasePriceInclTax(0)
            ->setRowTotalInclTax(0)
            ->setBaseRowTotalInclTax(0);

    /*if ($a) {
        $a = false;
        $item
                ->setBaseCost(19.97)
                ->setPrice(19.97)
                ->setBasePrice(19.97)
                ->setOriginalPrice(22.49)
                ->setBaseOriginalPrice(22.49);
    }else{
        $item
                ->setBaseCost(49.87)
                ->setPrice(49.87)
                ->setBasePrice(49.87)
                ->setOriginalPrice(49.87)
                ->setBaseOriginalPrice(49.87);
    }*/

    $item->save();
}

$order
        ->setBaseGrandTotal(0)
        ->setBaseShippingAmount(0)
        ->setBaseShippingTaxAmount(0)
        ->setBaseSubtotal(0)
        ->setBaseTaxAmount(0)
        ->setGrandTotal(0)
        ->setShippingAmount(0)
        ->setShippingTaxAmount(0)
        ->setSubtotal(0)
        ->setTaxAmount(0)
        //->setTotalQtyOrdered(0)
        ->setBaseSubtotalInclTax(0)
        ->setBaseTotalDue(0)
        ->setShippingDiscountAmount(0)
        ->setSubtotalInclTax(0)
        ->setTotalDue(0)
        ->setShippingInclTax(0)
        ->setBaseShippingInclTax(0)
        ->setBaseTotalDue(0)
        ->setTotalDue(0)
        ->setBaseTotalPaid(0)
        ->setTotalPaid(0)
        ->save();

echo json_encode($arr);
