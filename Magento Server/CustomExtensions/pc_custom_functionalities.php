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
        $data = json_decode($_POST["data"]);
        //var_dump($data);
        $responseArr = cancelOrder($data, $responseArr);

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



?>
