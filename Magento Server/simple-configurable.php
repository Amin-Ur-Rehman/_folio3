<?PHP
echo "Start1";
session_start();
session_write_close();
echo "Start2";
// on left side simple product sku and on right side configurable product sku

require_once 'app/Mage.php';
umask(0);
Mage::app()->setCurrentStore(Mage_Core_Model_App::ADMIN_STORE_ID);

print_r($_POST);

function setSizeAttribute($configurableSku){
    $new_attribute_code = "size_goddiva";//add_the_code_here

                $product = Mage::getModel('catalog/product')->loadByAttribute('sku',$configurableSku);

                $super_attribute= Mage::getModel('eav/entity_attribute')->loadByCode('catalog_product', $new_attribute_code);
                $configurableAtt = Mage::getModel('catalog/product_type_configurable_attribute')->setProductAttribute($super_attribute);

                $newAttributes[] = array(
                   'id'             => $configurableAtt->getId(),
                   'label'          => $configurableAtt->getLabel(),
                   'position'       => $super_attribute->getPosition(),
                   'values'         => $configurableAtt->getPrices() ? $product->getPrices() : array(),
                   'attribute_id'   => $super_attribute->getId(),
                   'attribute_code' => $super_attribute->getAttributeCode(),
                   'frontend_label' => $super_attribute->getFrontend()->getLabel(),
                );

                $existingAtt = $product->getTypeInstance()->getConfigurableAttributesAsArray();

                if(empty($existingAtt) && !empty($newAttributes)){
                    $product->setCanSaveConfigurableAttributes(true);
                    $product->setConfigurableAttributesData($newAttributes);
                    try {
                        $product->save();
                    } catch (Exception $e) {
                        echo 'ERROR: ' . $e->getMessage() . '<br />';
                    }
                }
                echo '<br />';

                unset($newAttributes);

            $process = Mage::getModel('index/indexer')->getProcessByCode('catalog_product_attribute');
            $process->reindexAll();
}

if(isset($_POST["cpLink"])&& isset($_POST["data"])){
	$cpLink = $_POST["cpLink"];
	$data  =  json_decode($_POST["data"]);
	if($cpLink){
		$configurableSku =  $data->configurable;
		$associatedSKUs = $data->associated;
		echo "OK1";
		$configurableProduct = Mage::getModel('catalog/product')->loadByAttribute('sku',$configurableSku);
		echo "OK2";
		$ids = $configurableProduct->getTypeInstance()->getUsedProductIds();
		$newids = array();
		foreach ( $ids as $id ) {
			$newids[$id] = 1;
		}
		echo "OK3";
		foreach ($associatedSKUs as $simpleSku){
			echo "OK4";
			$simpleProduct = Mage::getModel('catalog/product')->loadByAttribute('sku',$simpleSku);
			$simpleId = $simpleProduct->getId();
			$newids[$simpleId] = 1;
			echo "OK5";
		}

		echo "Updating configurable product " . $configurableSku;
		echo "<br>";
		
		Mage::getResourceModel('catalog/product_type_configurable')->saveProducts($configurableProduct, array_keys($newids));
		
		setSizeAttribute($configurableSku);
		
		echo "OK6";
	}
	echo "End";
	exit();
}	

?>
