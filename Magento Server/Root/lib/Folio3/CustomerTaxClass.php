<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:10 PM
 */
class Customer_Tax_Class
{
    public function upsert($data)
    {
        $response = null;//var_dump($data);die();
        Mage::log("Customer_Tax_Class.upsert - Start ", null, date("d_m_Y") . '.log', true);
        Mage::log("Customer_Tax_Class.upsert - data = " . json_decode($data), null, date("d_m_Y") . '.log', true);
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
            $response["message"] = "Customer Class " . $msg . " Successfully";
            $response["data"] = array("record_id" => $id);
        } catch (Exception $e) {
            Mage::log("Customer_Tax_Class.upsert - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }

        Mage::log("Customer_Tax_Class.upsert - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }

    public function getModel($id = null)
    {
        Mage::log("Customer_Tax_Class.getModel - Id =  " . $id, null, date("d_m_Y") . '.log', true);
        // Tax Class Model
        return $id === null ? Mage::getModel('tax/class') : Mage::getModel('tax/class')->load($id);
    }

    public function setData($model, $data)
    {
        Mage::log("Customer_Tax_Class.setData - Start ", null, date("d_m_Y") . '.log', true);
        $model->setClassType(Mage_Tax_Model_Class::TAX_CLASS_TYPE_CUSTOMER);
        $model->setClassName($data->className);
        Mage::log("Customer_Tax_Class.setData - End ", null, date("d_m_Y") . '.log', true);
    }

    public function delete($id)
    {
        $response = null;
        Mage::log("Customer_Tax_Class.delete - Start", null, date("d_m_Y") . '.log', true);
        try {
            Mage::log("Customer_Tax_Class.delete - Id = " . $id, null, date("d_m_Y") . '.log', true);
            if (empty($id)) {
                throw new Exception("Error in deleting. Customer Class Id is empty.");
            }
            $model = $this->getModel($id);
            // Delete the record
            $model->delete();
        } catch (Exception $e) {
            Mage::log("Customer_Tax_Class.delete - Exeption: " . $e->getMessage(), null, date("d_m_Y") . '.log', true);
            throw new Exception($e->getMessage());
        }
        Mage::log("Customer_Tax_Class.delete - End ", null, date("d_m_Y") . '.log', true);
        return $response;
    }

}