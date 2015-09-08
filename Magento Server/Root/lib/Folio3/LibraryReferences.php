<?php
/**
 * Created by PhpStorm.
 * User: zahmed
 * Date: 12-Aug-15
 * Time: 4:15 PM
 */

define("BASE_LIB_DIRCETORY", Mage::getBaseDir('lib'));
define("FOLIO3_DIRCETORY", "/Folio3");

include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/ConnectorConstants.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/F3GenericApiBase.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/F3Base.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/CustomerTaxClass.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/CustomerGroup.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/ShoppingCartPriceRule.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/PriceLevel.php');
include_once(BASE_LIB_DIRCETORY . FOLIO3_DIRCETORY . '/PaymentTerm.php');