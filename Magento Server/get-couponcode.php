<?PHP
require_once 'app/Mage.php';
session_start();
session_write_close();
umask(0);
Mage::app()->setCurrentStore(Mage_Core_Model_App::ADMIN_STORE_ID);

function getCouponCode($orderIncrementId){
    $order = Mage::getModel('sales/order')->loadByIncrementId($orderIncrementId);
	$orderDetails = $order->getData();
	$couponCode = $orderDetails['coupon_code'];
	//echo '<br/>' . 'Coupon Code: ' . $couponCode;
	return $couponCode;
}

$dataArr = array("status" => false, "couponCode" => null, error => "");

if(isset($_POST["isFetchCode"])&& isset($_POST["data"])){
	$isFetchCode = $_POST["isFetchCode"];
	$data = json_decode($_POST["data"]);

	if($isFetchCode){
		$orderIncrementId = $data->orderIncrementId;
		if($orderIncrementId){
			try{
				$couponCode = getCouponCode($orderIncrementId);
				if($couponCode){
					$dataArr['status']  = true;
					$dataArr['couponCode'] = $couponCode;
				}
			}catch (Exception $e) {
					$dataArr['error'] =  $e->getMessage();
			}
		}
	}
}
	echo  json_encode($dataArr);
	exit();	
?>
