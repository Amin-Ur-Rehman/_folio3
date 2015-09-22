<?php
/**
 * aheadWorks Co.
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the EULA
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://ecommerce.aheadworks.com/AW-LICENSE.txt
 *
 * =================================================================
 *                 MAGENTO EDITION USAGE NOTICE
 * =================================================================
 * This software is designed to work with Magento community edition and
 * its use on an edition other than specified is prohibited. aheadWorks does not
 * provide extension support in case of incorrect edition use.
 * =================================================================
 *
 * @category   AW
 * @package    AW_Giftcard
 * @version    1.0.6
 * @copyright  Copyright (c) 2010-2012 aheadWorks Co. (http://www.aheadworks.com)
 * @license    http://ecommerce.aheadworks.com/AW-LICENSE.txt
 */

class AW_Giftcard_Model_Email_Template extends Mage_Core_Model_Email_Template
{
    const DEFAULT_EMAIL_TEMPLATE_PATH = 'aw_giftcard_email_template';

    public function prepareEmailAndSend(array $variables, $store)
    {
        $this->setDesignConfig(array('store' => $store->getId()));
        $templateData = $this->_getEmptyTemplateData();
        $templateData['store'] = $store;
        $templateData['store_name'] = $store->getName();

        $template = self::DEFAULT_EMAIL_TEMPLATE_PATH;
        if (array_key_exists('aw_gc_email_template', $variables)) {
            $template = $variables['aw_gc_email_template'];
        }

        $giftcodesRenderBlock = Mage::helper('aw_giftcard')->getEmailGiftcodeItemsBlock();
        if (array_key_exists('aw_gc_created_codes', $variables)) {
            //$giftcodesRenderBlock->setGiftCodes($variables['aw_gc_created_codes']);
            if(array_key_exists("f3_giftcard_code", $GLOBALS) && count($GLOBALS["f3_giftcard_code"]) > 0){
                // custom handling for updating gift code in DB - start
                $f3GiftCodes = $this->setAndGetGiftCode($variables);
                $giftcodesRenderBlock->setGiftCodes($f3GiftCodes);
                // custom handling for updating gift code in DB - end
            }else{
                $giftcodesRenderBlock->setGiftCodes($variables['aw_gc_created_codes']);
            }
            $templateData['is_multiple_codes'] = 1 < count($variables['aw_gc_created_codes']);
        }

        $templateData['giftcards'] = $giftcodesRenderBlock->toHtml();
        if (array_key_exists('aw_gc_recipient_name', $variables)) {
            $templateData['recipient_name'] = $variables['aw_gc_recipient_name'];
        }

        if (array_key_exists('aw_gc_recipient_email', $variables)) {
            $templateData['recipient_email'] = $variables['aw_gc_recipient_email'];
        }

        if (array_key_exists('aw_gc_sender_email', $variables)) {
            $templateData['sender_email'] = $variables['aw_gc_sender_email'];
        }

        if (array_key_exists('aw_gc_sender_name', $variables)) {
            $templateData['sender_name'] = $variables['aw_gc_sender_name'];
        }

        if (array_key_exists('aw_gc_message', $variables)) {
            $templateData['message'] = $variables['aw_gc_message'];
        }

        if (array_key_exists('balance', $variables)) {
            $templateData['balance'] = $variables['balance'];
        }

        return $this->sendTransactional(
            $template,
            Mage::helper('aw_giftcard/config')->getEmailSender($store),
            $templateData['recipient_email'],
            $templateData['recipient_name'],
            $templateData
        );
    }

    protected function _getEmptyTemplateData()
    {
        return $templateData = array(
            'recipient_name'    => '',
            'recipient_email'   => '',
            'sender_email'      => '',
            'sender_name'       => '',
            'message'           => '',
            'giftcards'         => '',
            'balance'           => '',
            'store'             => '',
            'store_name'        => '',
            'is_multiple_codes' => false
        );
    }

    public function setAndGetGiftCode($variables)
    {
        $awGcCreatedCodes = $variables["aw_gc_created_codes"];
        $amount = $variables["aw_gc_amounts"];

        $giftCodes = array();

        if (count($awGcCreatedCodes) > 0) {

            $code = $awGcCreatedCodes[0];

            $doSet = false;
            $globalGiftData = $GLOBALS["f3_giftcard_code"];

            Mage::log('globalGiftData: ' . json_encode($globalGiftData), null, 'create-order.log', true);

            for ($i = 0; $i < count($globalGiftData); $i++) {
                $giftData = $globalGiftData[$i];
                if ($giftData["use"] == false) {
                    $newCode = $giftData["aw_gc_code"];
                    $newAmount = $giftData["aw_gc_amount"];
                    $GLOBALS["f3_giftcard_code"][$i]["use"] = true;
                    $doSet = true;
                    break;
                }
            }

            if ($doSet) {
                $tableName = "aw_giftcard";
                $fieldsData = array();
                $fieldsData["code"] = $newCode;
                $fieldsData["balance"] = $newAmount;
                $fieldId = "code";
                $fieldValue = $code;
                $this->updateRow($tableName, $fieldsData, $fieldId, $fieldValue);
                array_push($giftCodes, $newCode);
            }
        }

        return $giftCodes;
    }

    /**
     * This function updates the row in the given $tableName with passed $fieldsData
     * Search Condition: $fieldId equals to $fieldValue
     * @param string $tableName
     * @param array $fieldsData
     * @param string $fieldId
     * @param string $fieldValue
     */
    public function updateRow($tableName, $fieldsData, $fieldId, $fieldValue)
    {
        // Get the handler for writing the data into database
        $connectionWrite = Mage::getSingleton('core/resource')->getConnection('core_write');

        // Assumption: There will be no error occur here
        try {
            // making search condition
            $where = $connectionWrite->quoteInto($fieldId . '=?', $fieldValue);

            // update row
            $connectionWrite->update($tableName, $fieldsData, $where);
            // commit changes
        } catch (Exception $e) {
            Mage::log('updateRow: ' . $fieldValue, null, 'gc_update.log', true);
        }
    }
}