<?php
/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:13 PM
 */

/**
 * Class F3_Generic_Api_Base contains the base methods which are requested to be called from other system.
 */
class F3_Generic_Api_Base
{
    public function upsertShoppingCart($data)
    {
        $shoppingCartPriceRule = new Shopping_Cart_Price_Rule();
        $response = $shoppingCartPriceRule->upsert($data);
        return $response;
    }

    /*public function upsertCustomerGroup($data)
    {
        $customerGroup = new Customer_Group();
        $response = $customerGroup->upsert($data);
        return $response;
    }

    public function upsertCustomerTaxClass($data)
    {
        $customerTaxClass = new Customer_Tax_Class();
        $response = $customerTaxClass->upsert($data);
        return $response;
    }*/

    public function upsertPriceLevel($data)
    {
        $priceLevel = new Price_Level();
        $response = $priceLevel->upsert($data);
        return $response;
    }

    public function upsertPaymentTerm($data)
    {
        $paymentTerm = new Payment_Term();
        $response = $paymentTerm->upsert($data);
        return $response;
    }
}