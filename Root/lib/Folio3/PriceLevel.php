<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:11 PM
 */
class Price_Level
{
    public function upsert($data)
    {
        $response = null;
        Mage::log("Price_Level.upsert - Start ", null, date("d_m_Y") . '.log', true);
        try {

            $recordIds = array();
            $record_ids = property_exists($data, "record_ids") ? $data->record_ids : null;
            Mage::log("Price_Level.upsert: record_ids = " . $record_ids, null, date("d_m_Y") . '.log', true);
            $msg = empty($record_ids) ? "Created" : "Updated";
            /*
             "name":"10% Discount Level","discountType":"percent","rate":"10"
            opionalIds: {"record_ids": {"taxClassId":"", "customerGroupId":"", "taxClassId":""}}
             */
            $taxClassData = (object)array(
                "className" => $data->name,
                "record_id" => property_exists($record_ids, "taxClassId") ? $record_ids->taxClassId : null
            );

            // making tax class
            $taxClass = new Customer_Tax_Class();
            $taxClassResponse = $taxClass->upsert($taxClassData);
            if ($taxClassResponse["status"] === 1) {
                $recordIds["taxClassId"] = $taxClassResponse["data"]["record_id"];

                $customerGroupData = (object)array(
                    "code" => $data->name,
                    "classId" => $recordIds["taxClassId"],
                    "record_id" => property_exists($record_ids, "customerGroupId") ? $record_ids->customerGroupId : null
                );

                // making customer group
                $customerGroup = new Customer_Group();
                $customerGroupResponse = $customerGroup->upsert($customerGroupData);
                if ($customerGroupResponse["status"] === 1) {
                    $recordIds["customerGroupId"] = $customerGroupResponse["data"]["record_id"];

                    $shoppingCartPriceRuleData = (object)array(
                        "name" => $data->name,
                        "discountType" => $data->discountType,
                        "rate" => $data->rate,
                        "description" => $data->name,
                        "isInactive" => "F",
                        "couponCode" => "",
                        "record_id" => property_exists($record_ids, "shoppingCartPriceRuleId") ? $record_ids->shoppingCartPriceRuleId : null
                    );

                    // making shopping cart price rule
                    $shoppingCartPriceRule = new Shopping_Cart_Price_Rule();
                    $shoppingCartPriceRuleResponse = $shoppingCartPriceRule->upsert($shoppingCartPriceRuleData);
                    if ($shoppingCartPriceRuleResponse["status"] === 1) {
                        $recordIds["shoppingCartPriceRuleId"] = $shoppingCartPriceRuleResponse["data"]["record_id"];
                    } else {
                        if ($msg === "Created") {
                            Mage::log("Price_Level.upsert - Roll Back Tax Class & Customer Group", null, date("d_m_Y") . '.log', true);
                            $taxClass->delete($recordIds["taxClassId"]);
                            $customerGroup->delete($recordIds["customerGroupId"]);
                        }
                        throw new Exception("Price Level didn't sync. Dependent Record: Shopping Cart Price Rule didn't created.");
                    }
                } else {
                    if ($msg === "Created") {
                        Mage::log("Price_Level.upsert - Roll Back Tax Class", null, date("d_m_Y") . '.log', true);
                        $taxClass->delete($recordIds["taxClassId"]);
                    }
                    throw new Exception("Price Level didn't sync. Dependent Record: Customer Group didn't created.");
                }
            } else {
                throw new Exception("Price Level didn't sync. Dependent Record: Customer Tax Class didn't created.");
            }

            // making response object
            $response["status"] = 1;
            $response["message"] = "Price Level " . $msg . " Successfully";
            $response["data"] = array("record_ids" => $recordIds);
        } catch (Exception $e) {
            Mage::log("Price_Level.upsert - Exception = " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }

        Mage::log("Price_Level.upsert End ", null, date("d_m_Y") . '.log', true);

        return $response;
    }

    public function delete($id)
    {
        $response = null;
        Mage::log("Price_Level.delete - Start", null, date("d_m_Y") . '.log', true);
        try {
            Mage::log("Price_Level.delete - Id = " . $id, null, date("d_m_Y") . '.log', true);
            if (empty($id)) {
                throw new Exception("Error in deleting. Price Level Id is empty.");
            }
            $model = $this->getModel($id);
            // Delete the record
            $model->delete();
        } catch (Exception $e) {
            Mage::log("Price_Level.delete - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Price_Level.delete - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }
}