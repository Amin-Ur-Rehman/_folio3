<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 26-Aug-15
 * Time: 10:07 AM
 */
class Payment_Term
{
    public function upsert($data)
    {
        $response = null;
        Mage::log("Payment_Term.upsert - Start ", null, date("d_m_Y") . '.log', true);
        Mage::log("Payment_Term.upsert - data = " . json_decode($data), null, date("d_m_Y") . '.log', true);
        try {
            $recordIds = array();
            $record_ids = property_exists($data, "record_ids") && !empty($data->record_id) ? $data->record_ids : null;
            Mage::log("Payment_Term.upsert: record_ids = " . $record_ids, null, date("d_m_Y") . '.log', true);
            $msg = empty($record_ids) ? "Created" : "Updated";
            /*
             "name":"10% Discount Level","discountType":"percent","rate":"10"
            opionalIds: {"record_ids": {"taxClassId":"", "customerGroupId":"", "taxClassId":""}}
             */
            $taxClassData = (object)array(
                "className" => $data->name,
                "record_id" => property_exists($record_ids, "taxClassId") && !empty($record_ids->taxClassId) ? $record_ids->taxClassId : null
            );

            // making tax class
            $taxClass = new Customer_Tax_Class();
            $taxClassResponse = $taxClass->upsert($taxClassData);
            if ($taxClassResponse["status"] === 1) {
                $recordIds["taxClassId"] = $taxClassResponse["data"]["record_id"];

                $customerGroupData = (object)array(
                    "code" => $data->name,
                    "taxClassId" => $recordIds["taxClassId"],
                    "record_id" => property_exists($record_ids, "customerGroupId") && !empty($record_ids->customerGroupId) ? $record_ids->customerGroupId : null
                );

                // making customer group
                $customerGroup = new Customer_Group();
                $customerGroupResponse = $customerGroup->upsert($customerGroupData);
                if ($customerGroupResponse["status"] === 1) {
                    $recordIds["customerGroupId"] = $customerGroupResponse["data"]["record_id"];
                } else {
                    if ($msg === "Created") {
                        Mage::log("Payment_Term.upsert - Roll Back Tax Class", null, date("d_m_Y") . '.log', true);
                        $taxClass->delete($recordIds["taxClassId"]);
                    }
                    throw new Exception("Payment Term didn't sync. Dependent Record: Customer Group didn't created.");
                }
            } else {
                throw new Exception("Payment Term didn't sync. Dependent Record: Customer Tax Class didn't created.");
            }

            // making response object
            $response["status"] = 1;
            $response["message"] = "Payment Term " . $msg . " Successfully";
            $response["data"] = array("record_ids" => $recordIds);
        } catch (Exception $e) {
            Mage::log("Payment_Term.upsert - Exception = " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }

        Mage::log("Payment_Term.upsert End ", null, date("d_m_Y") . '.log', true);

        return $response;
    }

    public function delete($id)
    {
        $response = null;
        Mage::log("Payment_Term.delete - Start", null, date("d_m_Y") . '.log', true);
        try {
            Mage::log("Payment_Term.delete - Id = " . $id, null, date("d_m_Y") . '.log', true);
            if (empty($id)) {
                throw new Exception("Error in deleting. Payment Term Id is empty.");
            }
            $model = $this->getModel($id);
            // Delete the record
            $model->delete();
        } catch (Exception $e) {
            Mage::log("Payment_Term.delete - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Payment_Term.delete - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }
}