<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:09 PM
 */
class Shopping_Cart_Price_Rule
{
    public function upsert($data)
    {
        $response = null;
        Mage::log("Shopping_Cart_Price_Rule.upsert - Start ", null, date("d_m_Y") . '.log', true);
        try {
            $id = property_exists($data, "record_id") ? $data->record_id : null;
            $msg = empty($id) ? "Created" : "Update";

            // making record
            $model = $this->getModel($id);
            $this->setRuleInformation($model, $data);
            $this->setConditions($model, $data);
            $this->setActions($model, $data);
            $this->setLabels($model, $data);
            //var_dump($salesRule);die();
            // save the rule
            $model = $model->save();
            $id = $model->getId();

            // making response object
            $response["status"] = 1;
            $response["message"] = "Shopping Rule " . $msg . " Successfully";
            $response["data"] = array("record_id" => $id);
        } catch (Exception $e) {
            Mage::log("Shopping_Cart_Price_Rule.upsert - Exception: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Shopping_Cart_Price_Rule.upsert - End ", null, date("d_m_Y") . '.log', true);

        return $response;
    }

    public function getModel($id = null)
    {
        Mage::log("Shopping_Cart_Price_Rule.getModel - Id = " . $id, null, date("d_m_Y") . '.log', true);
        // SalesRule Rule Model
        return $id === null ? Mage::getModel('salesrule/rule') : Mage::getModel('salesrule/rule')->load($id);
    }

    public function setRuleInformation($model, $data)
    {
        Mage::log("Shopping_Cart_Price_Rule.setRuleInformation - Start ", null, date("d_m_Y") . '.log', true);
        $model->setName($data->name);
        $model->setDescription($data->description);
        $isActive = $data->isInactive == "F" ? 1 : 0;
        $model->setIsActive($isActive);
        // TODO: handle the group ids
        // All customer group ids
        $customerGroupIds = Mage::getModel('customer/group')->getCollection()->getAllIds();
        $model->setCustomerGroupIds($customerGroupIds);
        $model->setCouponType(Mage_SalesRule_Model_Rule::COUPON_TYPE_SPECIFIC);
        $model->setCouponCode($data->couponCode);
        // Following comments are for references purpose
        //$model->setUsesPerCustomer(0);
        //$model->setUsesPerCoupon(1);
        //$model->setFromDate('');
        //$model->setToDate('');
        //$model->setSortOrder(0);
        //$model->setIsRss(0);
        Mage::log("Shopping_Cart_Price_Rule.setRuleInformation - End ", null, date("d_m_Y") . '.log', true);
    }

    public function setConditions($model, $data)
    {
        Mage::log("Shopping_Cart_Price_Rule.setConditions - End", null, date("d_m_Y") . '.log', true);
        // Following comments are for references purpose
        /*
          // Product found condition type
          $productFoundCondition = Mage::getModel('salesrule/rule_condition_product_found')
          ->setType('salesrule/rule_condition_product_found')
          ->setValue(1)// 0 == not found, 1 == found
          ->setAggregator('all');     // match all conditions
          // 'Attribute set id 1' product condition
          $attributeSetCondition = Mage::getModel('salesrule/rule_condition_product')
          ->setType('salesrule/rule_condition_product')
          ->setAttribute('attribute_set_id')
          ->setOperator('==')
          ->setValue(1);

          // Bind attribute set condition to product found condition
          $productFoundCondition->addCondition($attributeSetCondition);

          // If a product with 'attribute set id 1' is found in the cart
          $salesRule->getConditions()->addCondition($productFoundCondition); */
        Mage::log("Shopping_Cart_Price_Rule.setConditions - End", null, date("d_m_Y") . '.log', true);
    }

    public function setActions($model, $data)
    {
        Mage::log("Shopping_Cart_Price_Rule.setActions - Start", null, date("d_m_Y") . '.log', true);
        $discountType = $data->discountType;
        if ($discountType === "percent") {
            $action = Mage_SalesRule_Model_Rule::BY_PERCENT_ACTION;
        } else if ($discountType === "flat") {
            $action = Mage_SalesRule_Model_Rule::BY_FIXED_ACTION;
        }

        $model->setSimpleAction($action);
        $model->setDiscountAmount($data->rate); // todo: remove % sign from value if necessary
        // Following comments are for references purpose
        //$model->setDiscountQty(0);
        //$model->setDiscountStep(0);
        //$model->setSimpleFreeShipping(0);
        //$model->setApplyToShipping(0);
        // Only apply the rule discount to this specific product
        //$model->getActions()->addCondition($attributeSetCondition);
        Mage::log("Shopping_Cart_Price_Rule.setActions - End", null, date("d_m_Y") . '.log', true);
    }

    public function setLabels($model, $data)
    {
        Mage::log("Shopping_Cart_Price_Rule.setLabels - Start", null, date("d_m_Y") . '.log', true);
        $model->setWebsiteIds(array(1));
        $model->setStoreLabels(array($data->name));
        Mage::log("Shopping_Cart_Price_Rule.setLabels - End", null, date("d_m_Y") . '.log', true);
    }
}