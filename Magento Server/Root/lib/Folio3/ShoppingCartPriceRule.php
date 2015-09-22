<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:09 PM
 */
class Shopping_Cart_Price_Rule
{
    /**
     * Upsert shopping cart price rule
     * @param $data
     * @return {object}
     * @throws Exception
     */
    public function upsert($data)
    {
        $response = null;//var_dump($data);die();
        Mage::log("Shopping_Cart_Price_Rule.upsert - Start ", null, date("d_m_Y") . '.log', true);
        Mage::log("Shopping_Cart_Price_Rule.upsert - data = " . json_decode($data), null, date("d_m_Y") . '.log', true);
        try {
            $id = property_exists($data, "record_id") && !empty($data->record_id) ? $data->record_id : null;
            $msg = empty($id) ? "Created" : "Update";

            // making record
            $model = $this->getModel($id);
            $this->setRuleInformation($model, $data);
            $this->setConditions($model, $data);
            $this->setActions($model, $data);
            $this->setLabels($model, $data);
            //var_dump($data);die();
            // save the rule
            $model = $model->save();
            $id = $model->getId();

            Mage::log("Shopping_Cart_Price_Rule.upsert - data->numberOfUses " . $data->numberOfUses, null, date("d_m_Y") . '.log', true);
            // adding coupon codes
            if ($data->numberOfUses == "SINGLEUSE") {
                $couponCodeList = $this->generateCoupnCodes($model, $data, $msg);
            }

            // making response object
            $response["status"] = 1;
            $response["message"] = "Shopping Rule " . $msg . " Successfully";
            $response["data"] = array("record_id" => $id, "couponCodeList" => $couponCodeList);
        } catch (Exception $e) {
            Mage::log("Shopping_Cart_Price_Rule.upsert - Exception: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Shopping_Cart_Price_Rule.upsert - End ", null, date("d_m_Y") . '.log', true);

        return $response;
    }

    /**
     * Get shopping cart price rule model
     * @param null $id
     * @return false|Mage_Core_Model_Abstract
     */
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

        // if promotion code is public make it available for all customers
        if ($data->isPublic == "T") {
            // All customer group ids
            $customerGroupIds = Mage::getModel('customer/group')->getCollection()->getAllIds();
            $model->setCustomerGroupIds($customerGroupIds);
        }

        // custom handling for discount/price level
        if ($data->createFor == "DISCOUNT_EXPORT") {
            $model->setCustomerGroupIds($data->customerGroupIds);
        }

        $couponType = $this->getCouponType($data->numberOfUses);
        $model->setCouponType($couponType);

        // handling for discount/ price level
        if ($data->createFor == "DISCOUNT_EXPORT") {
            $couponType = Mage_SalesRule_Model_Rule::COUPON_TYPE_NO_COUPON;
        }

        if ($data->numberOfUses == "MULTIPLEUSES") {
            $model->setCouponCode($data->couponCode);
        } else {
            $model->setUseAutoGeneration(true);
        }

        if ($data->numberOfUses == "SINGLEUSE") {
            $model->setUsesPerCoupon(1);
        }

        if ($data->applyDiscountTo == "FIRSTSALE") {
            $model->setUsesPerCustomer(1);
        }

        // getting date format from configuration
        $magentoDateFormat = Mage::getStoreConfig(ConnectorConstants::MagentoDateFormatPath);
        $netSuiteDateFormat = Mage::getStoreConfig(ConnectorConstants::NetSuiteDateFormatPath);

        if (!empty($data->startDate)) {
            $startDate = DateTime::createFromFormat($netSuiteDateFormat, $data->startDate)->format($magentoDateFormat);
            $model->setFromDate($startDate);
        }

        if (!empty($data->endDate)) {
            $endDate = DateTime::createFromFormat($netSuiteDateFormat, $data->endDate)->format($magentoDateFormat);
            $model->setToDate($endDate);
        }

        // Following comments are for references purpose
        //$model->setSortOrder(0);

        $model->setIsRss(0);
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

    public function getCouponType($numberOfUses)
    {
        $couponType = null;

        if ($numberOfUses == "MULTIPLEUSES") {
            $couponType = Mage_SalesRule_Model_Rule::COUPON_TYPE_SPECIFIC;
        }

        if ($numberOfUses == "SINGLEUSE") {
            $couponType = Mage_SalesRule_Model_Rule::COUPON_TYPE_SPECIFIC;
        }

        return $couponType;
    }

    public function generateCoupnCodes($ruleModel, $data, $msg)
    {
        Mage::log("Shopping_Cart_Price_Rule.generateCoupnCodes - Start", null, date("d_m_Y") . '.log', true);

        $ruleId = $ruleModel->getId();

        $couponCodeList = $data->couponCodeList;
        $couponCodeIds = array();

        $newCouponCodeListMap = array();

        foreach ($couponCodeList as $couponCodeObj) {
            $id = property_exists($couponCodeObj, "record_id") && !empty($couponCodeObj->record_id) ? $couponCodeObj->record_id : null;

            $coupon = $id == null ? Mage::getModel('salesrule/coupon') : Mage::getModel('salesrule/coupon')->load($id);
            // create coupon
            $coupon->setId($id)
                ->setRuleId($ruleId)
                ->setCode($couponCodeObj->code)
                ->setUsageLimit(1)
                ->setUsagePerCustomer(1)
                //->setTimesUsed
                //->setExpirationDate
                ->setIsPrimary(0)
                ->setCreatedAt(time())
                ->setType(Mage_SalesRule_Helper_Coupon::COUPON_TYPE_SPECIFIC_AUTOGENERATED)
                ->save();
            $id = $coupon->getId();

            // create map for matching
            $newCouponCodeListMap[$couponCodeObj->code] = $id;

            $couponCodeIds[] = array(
                "code" => $couponCodeObj->code,
                "id" => $couponCodeObj->id,
                "record_id" => $id
            );
        }

        // shopping cart rule is getting update - delete existing coupon codes
        if ($msg == "Update") {
            $this->deleteCouponCodes((object)$newCouponCodeListMap, $ruleModel);
        }

        Mage::log("Shopping_Cart_Price_Rule.generateCoupnCodes - End", null, date("d_m_Y") . '.log', true);
        return $couponCodeIds;
    }

    public function deleteCouponCodes($newCouponCodeListMap, $ruleModel)
    {
        // check if coupon code listcan be genrated
        $userAutoGeneration = $ruleModel->getData("use_auto_generation");
        if ($userAutoGeneration) {
            // fetch existing coupon codes
            $existingCouponCodeList = $ruleModel->getCoupons();//var_dump($userAutoGeneration);var_dump($existingCouponCodeList);die();
            foreach ($existingCouponCodeList as $existingCouponCodeObj) {
                // deleting coupon codes which are not found in update request
                Mage::log("Shopping_Cart_Price_Rule.deleteCouponCodes - Code: " . $existingCouponCodeObj->code . " Exist: " . property_exists($newCouponCodeListMap, $existingCouponCodeObj->code), null, date("d_m_Y") . '.log', true);
                if (!property_exists($newCouponCodeListMap, $existingCouponCodeObj->code)) {
                    Mage::log("Shopping_Cart_Price_Rule.deleteCouponCodes", null, date("d_m_Y") . '.log', true);
                    $this->deleteCouponCode($existingCouponCodeObj->coupon_id);
                }
            }
        }
    }

    public function deleteCouponCode($id)
    {
        $response = null;
        Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Start", null, date("d_m_Y") . '.log', true);
        try {
            Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Id = " . $id, null, date("d_m_Y") . '.log', true);

            if (empty($id)) {
                Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Exception Supress - Id = " . $id, null, date("d_m_Y") . '.log', true);
                //throw new Exception("Error in deleting. Payment Term Id is empty.");
            }
            $model = Mage::getModel('salesrule/coupon')->load($id);
            // Delete the record
            $model->delete();
            Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Id = " . $id . " - DELETED", null, date("d_m_Y") . '.log', true);
        } catch (Exception $e) {
            Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - Exception Supress", null, date("d_m_Y") . '.log', true);
            //throw new Exception($e->getMessage());
        }
        Mage::log("Shopping_Cart_Price_Rule.deleteCouponCode - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }
}