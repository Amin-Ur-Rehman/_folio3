<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:09 PM
 */
class Customer_Group
{

    public function upsert($data)
    {
        $response = null;
        Mage::log("Customer_Group.upsert - Start", null, date("d_m_Y") . '.log', true);
        Mage::log("Customer_Group.upsert - data = " . json_decode($data), null, date("d_m_Y") . '.log', true);
        try {
            $id = property_exists($data, "record_id") && !empty($data->record_id) ? $data->record_id : null;
            $msg = empty($id) ? "Created" : "Update";

            // making record
            $model = $this->getModel($id);
            $this->setData($model, $data);
            $model = $model->save();
            $id = $model->getId();

            // making response object
            $response["status"] = 1;
            $response["message"] = "Customer Group " . $msg . " Successfully";
            $response["data"] = array("record_id" => $id);
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }

        Mage::log("Customer_Group.upsert - End", null, date("d_m_Y") . '.log', true);
        return $response;
    }

    public function getModel($id = null)
    {
        Mage::log("Customer_Group.getModel - Id = " . $id, null, date("d_m_Y") . '.log', true);
        // Customer Group Model
        return $id === null ? Mage::getModel('customer/group') : Mage::getModel('customer/group')->load($id);
    }

    public function setData($model, $data)
    {
        Mage::log("Customer_Group.setData - Start", null, date("d_m_Y") . '.log', true);
        $model->setCode($data->code);
        $model->setTaxClassId($data->taxClassId);
        Mage::log("Customer_Group.setData - End", null, date("d_m_Y") . '.log', true);
    }

    public function delete($id)
    {
        $response = null;
        Mage::log("Customer_Group.delete - Start", null, date("d_m_Y") . '.log', true);
        try {
            Mage::log("Customer_Group.delete - Id = " . $id, null, date("d_m_Y") . '.log', true);
            if (empty($id)) {
                throw new Exception("Error in deleting. Customer Group Id is empty.");
            }
            $model = $this->getModel($id);
            // Delete the record
            $model->delete();
        } catch (Exception $e) {
            Mage::log("Customer_Group.delete - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Customer_Group.delete - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }
}