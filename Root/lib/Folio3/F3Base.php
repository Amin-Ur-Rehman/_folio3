<?php
/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:06 PM
 */
// TODO: utlize base calss for generating response, generic upsert and delete method.
class F3_Base
{
    public function getModel($name, $id = null)
    {
        return $id === null ? Mage::getModel($name) : Mage::getModel($name)->load($id);
    }

    public function generateResponse($id, $message)
    {
        $response = null;
        // making response object
        $response["status"] = 1;
        $response["message"] = $message;
        $response["data"] = array("record_id" => $id);
        return $response;
    }
}