<?php

require_once 'app/Mage.php';
session_start();
session_write_close();
umask(0);
Mage::app()->setCurrentStore(Mage_Core_Model_App::ADMIN_STORE_ID);

function addHandlingCostInOrder($order, $cost) {
    if (empty($cost)) {
        $cost = 0;
    }

    $oldShipAmt = $order->getShippingAmount();
    $oldBaseShipAmt = $order->getBaseShippingAmount();
    $oldGrandTotal = $order->getGrandTotal();
    $oldBaseGrandTotal = $order->getBaseGrandTotal();

    $order->setShippingAmount($oldShipAmt + $cost);
    $order->setBaseShippingAmount($oldBaseShipAmt + $cost);

    $order->setBaseShippingTaxAmount($oldShipAmt + $cost);
    $order->setShippingInclTax($oldBaseShipAmt + $cost);

    //adding shipping price to grand total

    $order->setGrandTotal($oldGrandTotal + $cost);
    $order->setBaseGrandTotal($oldBaseGrandTotal + $cost);
    $order->save();
}

$arr = array('status' => false, 'error' => '');

try {
    $cost = $_GET['cost'];
    $incrementId = $_GET['incrementid'];
    $method = $_GET['method'];

    if ($method == 'setcost') {
        //echo 'cost: ' . $cost;
        //echo 'incrementId: ' . $incrementId;

        $order = Mage::getModel('sales/order')->loadByIncrementId($incrementId);
        addHandlingCostInOrder($order, $cost);

        $arr['status'] = true;
    }
} catch (Exception $e) {
    $arr['status'] = false;
    $arr['error'] = $e->getMessage();
}

echo json_encode($arr);
