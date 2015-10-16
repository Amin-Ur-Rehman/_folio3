<?PHP
require_once 'app/Mage.php';
session_start();
session_write_close();
umask(0);
Mage::app()->setCurrentStore(Mage_Core_Model_App::ADMIN_STORE_ID);


$responseArr = array("status" => false, "data" => null, "error" => "");
try {

    //isset($_POST["customHeaders"])&&
    //var_dump("I am here");

    //var_dump($_POST["data"]);
    //die();
    if(isset($_POST["data"])){
        //var_dump("going to cancel");
        //var_dump($data);
        $data = json_decode($_POST["data"]);
        $method = null;
        if(isset($_POST["method"])){
            $method = $_POST["method"];
        }
        if($method != null){
            if($method == 'createInvoice') {
                $responseArr = createInvoice($data, $responseArr);
            }
            else if($method == 'createCreditMemo') {
                $responseArr = createCreditMemo($data, $responseArr);
            }
        }
        else {
            $responseArr = cancelOrder($data, $responseArr);
        }

    } else {
         $responseArr["error"] = "No data object found.";
     }

}
catch(Exception $ex) {
    $responseArr["error"] = $ex->getMessage();
}

echo json_encode($responseArr);
exit();




function cancelOrder($data, $responseArr){

    try {

        if(isset($data->orderIncrementId) && isset($data->status) && isset($data->nsTransactionId)) {
            $orderIncrementId = $data->orderIncrementId;
            $status = $data->status;
            $nsTransactionId = $data->nsTransactionId;
            //var_dump($orderIncrementId);
            //var_dump($status);
            //var_dump($nsTransactionId);
            $state;
            //var_dump("Loading Order");
            Mage::log('setStatusInOrder - $status: ' . $status, null, 'create-order.log', true);
            //var_dump("Order Loaded");
            $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);

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
            $history = $order->addStatusHistoryComment('This order has been cancelled due to editing of its NetSuite Sales Order Having Transaction Id: ' . $nsTransactionId, false);
            $history->setIsCustomerNotified(false);
            //var_dump("Saving Order");
            $order->save();
            //var_dump("Order Saved");
            $responseArr["status"] = true;
            return $responseArr;
        }

    } catch (Exception $e) {
        Mage::log('setStatusInOrder - Error: ' . $e->getMessage(), null, 'create-order.log', true);
    }
}

function createInvoice($data, $responseArr){
    try {
        if(isset($data->increment_id)) {
            $increment_id = $data->increment_id;
            $order = Mage::getModel('sales/order')->loadByIncrementId($increment_id);

            $grandTotal = $order->getGrandTotal();
            $totalPaid = $order->getTotalPaid();
            $grandTotal = round($grandTotal, 2);
            $totalPaid = round($totalPaid, 2);
            $invoices = array();
            $selectedInvoice = null;
            foreach ($order->getInvoiceCollection() as $invoice) {
                $invoices[] = $invoice;
            }
            $invoiceCount = count($invoices);
            if($grandTotal == $totalPaid && $invoiceCount > 0) {
                $selectedInvoice = $invoices[$invoiceCount - 1];
                $responseArr["increment_id"] = $selectedInvoice->getIncrementId();
                $responseArr["status"] = true;
                return $responseArr;
            }


            if (!$order->canInvoice())
            {
                Mage::throwException(Mage::helper('core')->__('Cannot create an invoice.'));
            }
            $invoice = Mage::getModel('sales/service_order', $order)->prepareInvoice();
            if (!$invoice->getTotalQty())
            {
                Mage::throwException(Mage::helper('core')->__('Cannot create an invoice without products.'));
            }
            if ($data->capture_online == 'true')
            {
                $invoice->setRequestedCaptureCase(Mage_Sales_Model_Order_Invoice::CAPTURE_ONLINE);
            }
            else {
                $invoice->setRequestedCaptureCase(Mage_Sales_Model_Order_Invoice::NOT_CAPTURE);
            }

            $invoice->register();
            $transactionSave = Mage::getModel('core/resource_transaction')->addObject($invoice)->addObject($invoice->getOrder());
            $transactionSave->save();
            $responseArr["increment_id"] = $invoice->getIncrementId();
            $responseArr["status"] = true;
        }

    } catch (Exception $e) {
        $responseArr["status"] = false;
        $responseArr["error"] = $e->getMessage();
        Mage::log('createInvoice - Error: ' . $e->getMessage(), null, 'create-invoice.log', true);
    }
    return $responseArr;
}

function createCreditMemo($requestData, $responseArr){
    try {
        if(isset($requestData->order_increment_id) && isset($requestData->invoice_increment_id)) {
            //Mage::log('inside createCreditMemo start', null, 'create-creditmemo.log', true);
            $order_increment_id = $requestData->order_increment_id;
            $invoice_increment_id = $requestData->invoice_increment_id;
            //Mage::log('loading order', null, 'create-creditmemo.log', true);
            $order = Mage::getModel('sales/order')->loadByIncrementId($order_increment_id);
            //Mage::log('order loaded', null, 'create-creditmemo.log', true);
            if ($order->canCreditmemo()) {

                $selectedInvoice = null;
                //Mage::log('going to get invoice', null, 'create-creditmemo.log', true);
                //Mage::log('provided invoice: '.$invoice_increment_id, null, 'create-creditmemo.log', true);
                foreach ($order->getInvoiceCollection() as $invoice) {
                    //Mage::log('going to get current invoice id', null, 'create-creditmemo.log', true);
                    $currentInvoiceIncrementId = $invoice->getIncrementId();
                    //Mage::log('got current invoice id', null, 'create-creditmemo.log', true);
                    //Mage::log('current invoice id: '.$currentInvoiceIncrementId, null, 'create-creditmemo.log', true);
                    if($currentInvoiceIncrementId == $invoice_increment_id) {
                        $selectedInvoice = $invoice;
                        //Mage::log('invoice found', null, 'create-creditmemo.log', true);
                        break;
                    }
                }
                if(!isset($selectedInvoice)) {
                    $responseArr["error"] = 'No Invoice Found with provided invoice id: '+ $invoice_increment_id +' in magento.';
                    return;
                }
                //Mage::log('getting service model', null, 'create-creditmemo.log', true);
                $service = Mage::getModel('sales/service_order', $order);
                //Mage::log('setting data properties', null, 'create-creditmemo.log', true);
                $data = array();
                $data['shipping_amount'] = (double)$requestData->shipping_cost;
                $data['adjustment_positive'] = (double)$requestData->adjustment_positive;

                $quantityArray = array();
                foreach ($requestData->quantities as $quantity) {
                    $key = (int)$quantity->order_item_id;
                    $value = (int)$quantity->qty;
                    $quantityArray[$key] = $value;
                }

                $data['qtys'] = $quantityArray;
                $creditMemo = $service->prepareInvoiceCreditmemo($selectedInvoice, $data);
                $creditMemo->setShippingAmount($data['shipping_amount']);
                $creditMemo->setAdjustmentPositive($data['adjustment_positive']);
                //$creditMemo->setGrandTotal($data['adjustment_positive']);
                $creditMemo->setRefundRequested(true);
                if($requestData->capture_online == 'true') {
                    $creditMemo->setOfflineRequested(false);
                } else {
                    $creditMemo->setOfflineRequested(true);
                }

                $creditMemo->setPaymentRefundDisallowed(false);
                if(Mage::registry('current_creditmemo')) {
                    Mage::unregister('current_creditmemo');
                }
                //Mage::log('going to register current_creditmemo', null, 'create-creditmemo.log', true);
                Mage::register('current_creditmemo', $creditMemo);
                //Mage::log('going to register creditmemo', null, 'create-creditmemo.log', true);
                $creditMemo->register();
                //Mage::log('going to save creditmemo', null, 'create-creditmemo.log', true);
                Mage::getModel('core/resource_transaction')->addObject($creditMemo)->addObject($order)->save();

                # here follows the transactionSave: $this->_saveCreditmemo($creditmemo);
                $responseArr["increment_id"] = $creditMemo->getIncrementId();
                $responseArr["status"] = true;
            }
        }
        else {
            $responseArr["error"] = 'Please provide order_increment_id and invoice_increment_id values in request param';
            return;
        }

    } catch (Exception $e) {
        $responseArr["status"] = false;
        $responseArr["error"] = $e->getMessage();
        Mage::log('createCreditMemo - Error: ' . $e->getMessage(), null, 'create-creditmemo.log', true);
    }
    return $responseArr;
}
/*
function createCreditMemoNew($data, $responseArr){
    try {
        if(isset($data->increment_id)) {
            $increment_id = $data->increment_id;
            $order = Mage::getModel('sales/order')->loadByIncrementId($increment_id);


            //$order = Mage::getModel('sales/order')->load('100000001', 'increment_id');
            if (!$order->getId()) {
                $this->_fault('order_not_exists');
            }
            if (!$order->canCreditmemo()) {
                $this->_fault('cannot_create_creditmemo');
            }
            $data = array();


            $service = Mage::getModel('sales/service_order', $order);

            $creditMemo = $service->prepareCreditmemo($data);

            // refund to Store Credit
            if ($refundToStoreCreditAmount) {
                // check if refund to Store Credit is available
                if ($order->getCustomerIsGuest()) {
                    $this->_fault('cannot_refund_to_storecredit');
                }
                $refundToStoreCreditAmount = max(
                    0,     min($creditMemo->getBaseCustomerBalanceReturnMax(), $refundToStoreCreditAmount)
                );
                if ($refundToStoreCreditAmount) {
                    $refundToStoreCreditAmount = $creditMemo->getStore()->roundPrice($refundToStoreCreditAmount);
                    $creditMemo->
                    setBaseCustomerBalanceTotalRefunded($refundToStoreCreditAmount);

                    $refundToStoreCreditAmount = $creditMemo->getStore()->roundPrice(
                        $refundToStoreCreditAmount*$order->getStoreToOrderRate()
                    );
                    // this field can be used by customer balance observer
                    $creditMemo->setBsCustomerBalTotalRefunded($refundToStoreCreditAmount);
                    // setting flag to make actual refund to customer balance after credit memo save
                    $creditMemo->setCustomerBalanceRefundFlag(true);
                }
            }
            $creditMemo->setPaymentRefundDisallowed(true)->register();
            try {
                Mage::getModel('core/resource_transaction')
                    ->addObject($creditMemo)
                    ->addObject($order)
                    ->save();
            } catch (Mage_Core_Exception $e) {
                $this->_fault('data_invalid', $e->getMessage());
            }
            echo $creditMemo->getIncrementId();



            $responseArr["status"] = true;
        }

    } catch (Exception $e) {
        $responseArr["status"] = false;
        $responseArr["error"] = $e->getMessage();
        Mage::log('createCreditMemo - Error: ' . $e->getMessage(), null, 'create-creditmemo.log', true);
    }
    return $responseArr;
}
*/
?>
