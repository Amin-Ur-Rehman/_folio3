<?php

/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 13-Oct-15
 * Time: 3:14 PM
 */
class Folio3_Payment_Model_Method_Authorizenet extends Mage_Paygate_Model_Authorizenet
{
    /**
     * Prepare info instance for save
     *
     * @return Mage_Payment_Model_Abstract
     */
    public function prepareSave()
    {
        Mage::log('Folio3_Payment_Model_Method_Cc.prepareSave - Start', null, 'cc.log', true);
        $info = $this->getInfoInstance();
        if ($this->_canSaveCc) {
            $info->setCcNumberEnc($info->encrypt($info->getCcNumber()));
        }

        $ccid = $info->getCcCid();

        if ($ccid == '123' || $ccid == '1234') {
            //UB: Need to comment out this
            $info->setCcCidEnc($info->encrypt($info->getCcCid()));
        }

        $info->setCcNumber(null)
            ->setCcCid(null);
        Mage::log('Folio3_Payment_Model_Method_Cc.prepareSave - End', null, 'cc.log', true);
        return $this;
    }
}