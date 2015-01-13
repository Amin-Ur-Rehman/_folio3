/**
 * Created with JetBrains WebStorm.
 * User: szaman
 * Date: 12/4/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */

var US_CA_States = {
    //US states
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'Armed Forces Americas': 'AA',
    'Armed Forces Europe': 'AE',
    'Armed Forces Pacific': 'AP',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'GUAM': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    // canada states
    'Alberta': 'AB',
    'British Columbia': 'BC',
    'Manitoba': 'MB',
    'New Brunswick': 'NB',
    'Newfoundland': 'NL',
    'Northwest Territories': 'NT',
    'Nova Scotia': 'NS',
    'Nunavut': 'NU',
    'Ontario': 'ON',
    'Prince Edward Island': 'PE',
    'Quebec': 'QC',
    'Saskatchewan': 'SK',
    'Yukon': 'YT'
};

function getMagentoMaxCustomerIdNetsuite(enviornment) {
    var cols = new Array();
    var maxValue;
    var result = new Object();

    var magentoCustomerIdId;

    if (enviornment == 'production') {
        magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
    } else {
        magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
    }

    try {

        result.errorMsg = '';

        cols.push(new nlobjSearchColumn(magentoCustomerIdId, null, 'max'));


        var recs = nlapiSearchRecord('customer', null, null, cols);

        if (recs && recs.length > 0) {
            maxValue = recs[0].getValue(magentoCustomerIdId, null, 'max');
        }
        else
            maxValue = 0;

        if (maxValue == null || maxValue == '')
            maxValue = 0;

        result.data = maxValue;

    } catch (ex) {
        result.errorMsg = ex.toString();
    }


    return result;
}

function createSalesOrder(salesOrderObj) {
    //  generateErrorEmail('Create Sales Order - Test Email', configuration);
    /*
     * check configuration of dummy item/skip item
     **/

    var order = salesOrderObj.order;
    var invoiceNum = salesOrderObj.invoiceNum;
    var products = salesOrderObj.products;
    var netsuiteMagentoProductMap = salesOrderObj.netsuiteMagentoProductMap;
    var netsuiteCustomerId = salesOrderObj.netsuiteCustomerId;
    var configuration = salesOrderObj.configuration;
    var shippingAddress = salesOrderObj.shippingAddress;
    var billingAddress = salesOrderObj.billingAddress;
    var payment = salesOrderObj.payment;


    var magentoIdId;
    var magentoSyncId;
    var dummyItemId;
    var isDummyItemSetInOrder = false;
    var emailMsg = '';
    var containsSerialized = false;
    var enviornment = '';
    var context = nlapiGetContext();
    var netSuiteItemID;
    var soprice = context.getSetting('SCRIPT', 'custscript_magento_ws_price');

    if (enviornment == 'production') {
        magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
        magentoSyncId = 'custbody_magentosync';
    } else {
        magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
        magentoSyncId = 'custbody_magentosyncdev';
    }

    var rec = nlapiCreateRecord('salesorder', null);
    nlapiLogExecution('DEBUG', 'setting payment ');

    //   rec.setFieldValue('tranid', order.increment_id);
    rec.setFieldValue('shippingcost', order.shipping_amount);

    var shippingMethod = getShippingCarrierAndMethod2(order.shipping_description);

    if (!isDevAccount()) {
        rec.setFieldValue('shipcarrier', ShippingMethod.FedEx);// hardcoded to noups
        rec.setFieldValue('shipmethod', shippingMethod);
    }
    // rec.setFieldValue('taxitem',-2379);


    nlapiLogExecution('AUDIT', '  order.shipping_amount ', order.shipping_amount);
    rec.setFieldValue('entity', netsuiteCustomerId);

    nlapiLogExecution('DEBUG', 'setting method ', order.shipment_method);

    if (!isDevAccount()) {
        var orderClass = getOrderClass(order.store_id);
        //rec.setFieldValue('department', '20');// e-Commerce : Herman Street- Cost Service
        //rec.setFieldValue('class', orderClass);
        rec.setFieldValue('location', 1);//Goddiva Warehous...ddiva Warehouse
        //rec.setFieldValue('shippingtaxcode', '7625');// VAT:SR-GB
    } else {
        rec.setFieldValue('department', '1');// Admin
    }

    //    rec.setFieldValue('shipmethod',732);

    //if ( )shipcarrier  ups nonups

    //Setting shipping
    setAddressV2(rec, shippingAddress, 'T');
    nlapiLogExecution('DEBUG', 'Setting Shipping Fields');

    //Setting billing
    setAddressV2(rec, billingAddress, 'F', 'T');
    nlapiLogExecution('DEBUG', 'Setting Billing Fields');

    // set payment details
    setPayment(rec, payment);


    for (var x = 0; x < products.length; x++) {

        nlapiLogExecution('Debug', 'products.length is createSalesOrder', products.length);

        nlapiLogExecution('Debug', 'products[x].product_id in createSalesOrder', products[x].product_id);

        var objIDPlusIsSerial = getNetsuiteProductIdByMagentoIdViaMap(netsuiteMagentoProductMap, products[x].product_id);
        netSuiteItemID = objIDPlusIsSerial.netsuiteId;
        var isSerial = objIDPlusIsSerial.isSerial;
        nlapiLogExecution('Debug', 'Netsuite Item ID', netSuiteItemID);

        if (netSuiteItemID != '') {
            rec.setLineItemValue('item', 'item', x + 1, netSuiteItemID);
            rec.setLineItemValue('item', 'quantity', x + 1, products[x].qty_ordered);
            rec.setLineItemValue('item', 'price', x + 1, 1);
            rec.setLineItemValue('item', 'taxcode', x + 1, '7625');//VAT:SR-GB
        }
        else {
            if (ConnectorConstants.CurrentStore.SalesOrder.setDummyItem) {
                Utility.logDebug('Set Dummy Item Id: ', ConnectorConstants.DummyItem.Id);
                rec.setLineItemValue('item', 'item', x + 1, dummyItemId);
                isDummyItemSetInOrder = true;
                rec.setLineItemValue('item', 'amount', x + 1, 0);
                rec.setLineItemValue('item', 'taxcode', x + 1, '7625');//VAT:SR-GB
            }
        }


        if (isSerial == 'T')
            containsSerialized = true;


        //    if( soprice != null )

        //    rec.setLineItemValue('item','amount',x+1,95);
    }

    // get coupon code from magento order
    var couponCode = getCouponCode(order.increment_id);

    if (couponCode) {
        nlapiLogExecution('DEBUG', 'start setting coupon code');
        //rec.setFieldValue('couponcode', couponCode);
        rec.setFieldValue('discountitem', '14733');// item: DISCOUNT
        rec.setFieldValue('discountrate', order.discount_amount || 0);
        nlapiLogExecution('DEBUG', 'end setting coupon code');
    }

    try {
        rec.setFieldValue(magentoSyncId, 'T');
        rec.setFieldValue(magentoIdId, order.increment_id);
        rec.setFieldValue('memo', 'Test Folio3');
        if (isDummyItemSetInOrder) {
            // A = Pending Approval
            // if order has dummy item then set status to A (Pending Approval)
            rec.setFieldValue('orderstatus', 'A');
        }
        else {
            rec.setFieldValue('orderstatus', 'B');
        }

        //rec.setFieldValue('subsidiary', '3');// TODO generalize
        var id = nlapiSubmitRecord(rec, true);
        nlapiLogExecution('Debug', 'Netsuite SO-ID for magento order ' + order.increment_id, id);
        /*if (isDummyItemSetInOrder) {
         // if order has dummy item then don't create invoice and customer payment
         return;
         }
         else {
         // try creating Invoice
         var invoiceResult = createInvoice(id, invoiceNum);
         if (invoiceResult.errorMsg != '') {
         nlapiLogExecution('ERROR', 'Could not create Invoice ', invoiceResult.errorMsg);
         return;
         }

         // Now create Payment
         var paymentResult = createCustomerPayment(invoiceResult.invoiceId);
         if (paymentResult.errorMsg != '') {
         nlapiLogExecution('ERROR', 'Could not create payment ', paymentResult.errorMsg);
         return;
         }

         }*/
    }
    catch (ex) {


        emailMsg = 'Order having Magento Id: ' + order.increment_id + ' did not created because of an error.\n' + ex.toString() + '.';
        generateErrorEmail(emailMsg, configuration, 'order');
        nlapiLogExecution('Debug', 'Error in createSalesOrder', ex.toString());
        // }


    }
}

function getOrderClass(storeId) {
    if (storeId.toString() === '1') {
        // space store id  on  magento = 1
        return '3';//Space
    }
    if (storeId.toString() === '7') {
        // live science store id  on  magento = 7
        return '2';//LiveScience
    }
    if (storeId.toString() === '6') {
        // hermen street store id  on  magento = 6
        return '27';//Herman Street
    }
    if (storeId.toString() === '5') {
        //  toms hardware store id  on  magento = 5
        return '31';// BOM : Tom's Hardware
    }
    return '';
}

function getShippingCarrierAndMethod(shipmentMethod) {
    var methodObj = {};
    var methodArr = (shipmentMethod + '').split('_');
    if (methodArr.length > 0) {
        switch (methodArr[0]) {
            case 'royalmail':
                switch (methodArr[1]) {
                    case 'firstclassrecordedsignedfor':
                        methodObj.method = '2707';
                        break;
                    case 'secondclassrecordedsignedfor':
                        methodObj.method = '2707';
                        break;
                    default :
                        methodObj.method = '2707';
                }
                break;
            /*case 'ups':
             methodObj.carrier = methodArr[0];
             switch (methodArr[1]) {
             case 'GND':
             methodObj.method = '1837';// UPS Ground
             break;
             case '3DS':
             methodObj.method = '1846';// UPS 3 Dyas Select
             break;
             case '2AD':
             methodObj.method = '1845';// UPS 2nd Day Air
             break;
             case '1DA':
             methodObj.method = '1838';// UPS Next Day Air
             break;
             default :
             methodObj.method = '1837'; // UPS Ground
             }
             break;*/
            case 'flatrate':
                methodObj.carrier = '';
                methodObj.method = '2707';// Royal Mail (Rep. of Ireland)
                break;
            case 'freeshipping':
                methodObj.carrier = '';
                methodObj.method = '2707';
                break;
            default :
                methodObj.carrier = '';
                methodObj.method = '2707';
        }
    }

    return methodObj;
}

function getShippingCarrierAndMethod2(shippingDescription) {
    return NSToMGShipMap[shippingDescription] || '';
}

function generateErrorEmail(message, configuration, type) {
    nlapiLogExecution('EMERGENCY', 'Error', 'Email Sent');
    var author = -5;
    var recipient = '';
    recipient = 'zahmed@folio3.com'; // TODO: will change for production account
    var subject = '';

    if (type == 'item')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Item';
    else if (type == 'customer')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Customer';
    else if (type == 'order')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Order';


    var body = message;

    if (recipient == '') {
        nlapiLogExecution('DEBUG', 'Emails can not send. Recipient is Empty.');
        return;
    }

    try {
        //nlapiSendEmail(author, recipient, subject, body);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Error in generating email./n' + ex.toString());
    }

}

function getNetsuiteCustomerIdByMagentoId(magentoID, enviornment) {
    var filters = new Array();
    var cols = new Array();

    var magentoCustomerIdId;

    if (enviornment == 'production') {
        magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
    } else {
        magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
    }

    try {
        filters.push(new nlobjSearchFilter(magentoCustomerIdId, null, 'is', magentoID));

        var recs = nlapiSearchRecord('customer', null, filters, null);

        if (recs != null && recs.length > 0) {
            return recs[0].getId();

        }
        else {
            return 0;
        }
    } catch (ex) {
        nlapiLogExecution('Debug', 'Error in getNetsuiteCustomerIdByMagentoId');
        return 0;
    }
}

function getNetsuiteProductIdsByMagentoIds(magentoIds, enviornment) {
    var cols = new Array();

    var filterExpression = "";

    var resultArray = new Array();

    var obj = new Object();

    var result = new Object();

    var magentoIdId;

    if (enviornment == 'production') {
        magentoIdId = 'custitem_magentoid';
    } else {
        magentoIdId = 'custitem_magento_sku';
    }

    result.errorMsg = '';

    try {


        filterExpression = "[[";


        for (var x = 0; x < magentoIds.length; x++) {

            filterExpression = filterExpression + "['" + magentoIdId + "','is','" + magentoIds[x].product_id + "']";


            if ((x + 1) < magentoIds.length) {

                filterExpression = filterExpression + ",'or' ,";

            }

        }


        filterExpression = filterExpression + ']';

        filterExpression += ',"AND",["type", "anyof", "InvtPart", "NonInvtPart"]]';


        nlapiLogExecution('Debug', ' filterExpression', filterExpression);


        filterExpression = eval(filterExpression);


        cols.push(new nlobjSearchColumn(magentoIdId));


        var recs = nlapiSearchRecord('item', null, filterExpression, cols);


        if (recs && recs.length > 0) {

            for (var i = 0; i < recs.length; i++) {

                obj = new Object();

                obj.internalId = recs[i].getId();

                obj.magentoID = recs[i].getValue(magentoIdId);

                resultArray[resultArray.length] = obj;

            }

        }


        result.data = resultArray;


    } catch (ex) {

        nlapiLogExecution('Debug', 'Error in getNetsuiteProductIdByMagentoId', ex.toString());

        result.errorMsg = ex.toString();

    }


    return result;
}

function getNetsuiteProductIdByMagentoIdViaMap(netsuiteMagentoProductMap, magentoID) {

    var netsuiteId = '';
    var isSerial = '';
    var retObj = new Object();
    for (var x = 0; x < netsuiteMagentoProductMap.length; x++) {

        if (netsuiteMagentoProductMap[x].magentoID == magentoID) {
            netsuiteId = netsuiteMagentoProductMap[x].internalId;
            isSerial = netsuiteMagentoProductMap[x].isSerialItem;
            retObj.netsuiteId = netsuiteId;
            retObj.isSerial = isSerial;
            break;
        }

    }
    retObj.netsuiteId = netsuiteId;
    retObj.isSerial = isSerial;
    return retObj;

}

function getFulfillments(enviornment) {
    var filters = new Array();
    var cols = new Array();
    var obj = null;
    var arr = new Array();
    var result = new Object();
    var magentoIdId;
    var magentoSyncId;
    var magentoFuflillmentIdId;
    var magentoFuflillmentSyncId;

    if (enviornment == 'production') {
        magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
        magentoSyncId = 'custbody_magentosync';
        magentoFuflillmentIdId = 'custbody_magentoffid';
        magentoFuflillmentSyncId = 'custbody_magentoffsync';
    } else {
        magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
        magentoSyncId = 'custbody_magentosyncdev';
        magentoFuflillmentIdId = 'custbody_magentoffiddev';
        magentoFuflillmentSyncId = 'custbody_magentoffsyncdev';
    }

    filters.push(new nlobjSearchFilter(magentoSyncId, 'appliedtotransaction', 'is', 'T'));   // Ready for Magento Sync
    filters.push(new nlobjSearchFilter(magentoIdId, 'appliedtotransaction', 'isnotempty'));
    filters.push(new nlobjSearchFilter(magentoFuflillmentSyncId, null, 'is', 'F'));
    filters.push(new nlobjSearchFilter(magentoFuflillmentIdId, null, 'isempty'));
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

    cols.push(new nlobjSearchColumn(magentoIdId, 'appliedtotransaction'));

    result.errorMsg = '';

    try {
        var recs = nlapiSearchRecord('itemfulfillment', null, filters, cols);
        if (recs && recs.length > 0) {
            for (var x = 0; x < recs.length; x++) {

                /*var itemFulFillmentRec = nlapiLoadRecord('itemfulfillment',recs[x].getId());
                 var itemsLength=itemFulFillmentRec.getLineItemCount('item');
                 var itemsArr=new Array();

                 for(var line=1;line<=itemsLength;line++){
                 var tempItem={};
                 tempItem['itemId']=itemFulFillmentRec.getLineItemValue('item','item',line);
                 tempItem['itemQty']=itemFulFillmentRec.getLineItemValue('item','quantity',line);
                 itemsArr.push(tempItem);
                 }
                 */

                obj = new Object();
                obj.internalId = recs[x].getId();
                obj.magentoSOId = recs[x].getValue(magentoIdId, 'appliedtotransaction');
                obj.magentoId = recs[x].getValue(magentoIdId) ? recs[x].getValue(magentoIdId) : '';

                arr[arr.length] = obj;
            }

            result.data = arr;
        }

    } catch (ex) {

        result.errorMsg = ex.toString();

    }

    return result;
}

function updateFulfillmentsMagentoID(internalId, magentoID, sync, enviornment) {
    nlapiLogExecution('DEBUG', 'Enter in updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);

    var magentoFulfillmentIdId;
    var magentoFulfillmentSyncId;

    if (enviornment == 'production') {
        magentoFulfillmentIdId = 'custbody_magentoffid';
        magentoFulfillmentSyncId = 'custbody_magentoffsync';
    } else {
        magentoFulfillmentIdId = 'custbody_magentoffiddev';
        magentoFulfillmentSyncId = 'custbody_magentoffsyncdev';
    }

    var rec = nlapiLoadRecord('itemfulfillment', internalId);

    rec.setFieldValue(magentoFulfillmentIdId, magentoID);
    rec.setFieldValue(magentoFulfillmentSyncId, sync);

    try {
        nlapiSubmitRecord(rec);
        nlapiLogExecution('DEBUG', 'Exit from updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);
        return true;

    } catch (ex) {
        return false;
    }
}

function updateCustomerInNetSuite(customerId, magentoCustomerObj, enviornment, sessionID) {
    var magentoCustomerId;
    var magentoSync;
    var result = new Object();

    if (enviornment == 'production') {
        magentoCustomerId = ConnectorConstants.Entity.Fields.MagentoId;
        magentoSync = 'custentity_magentosync';
    } else {
        magentoCustomerId = ConnectorConstants.Entity.Fields.MagentoId;
        magentoSync = 'custentity_magentosync_dev';
    }

    var rec = nlapiLoadRecord('customer', customerId);

    var entityId = magentoCustomerObj.firstname + ' ' + magentoCustomerObj.middlename + magentoCustomerObj.lastname;

    //rec.setFieldValue('entityid', entityId); zee
    rec.setFieldValue(magentoCustomerId, magentoCustomerObj.customer_id);
    rec.setFieldValue(magentoSync, 'T');
    rec.setFieldValue('email', magentoCustomerObj.email);
    rec.setFieldValue('firstname', magentoCustomerObj.firstname);
    rec.setFieldValue('middlename', magentoCustomerObj.middlename);
    rec.setFieldValue('lastname', magentoCustomerObj.lastname);
    //  rec.setFieldValue('salutation','');

    // zee: get customer address list: start

    var custAddrXML;
    var responseMagento;
    var addresses = new Object();

    custAddrXML = getCustomerAddressXML(magentoCustomerObj.customer_id, sessionID);

    saveXML(custAddrXML);

    responseMagento = validateCustomerAddressResponse(soapRequestToMagento(custAddrXML));

    if (responseMagento.status == false) {
        result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
        nlapiLogExecution('ERROR', 'Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' + result.errorMsg);
        return result;
    }

    addresses = responseMagento.addresses;

    if (addresses != null) {
        rec = setAddresses(rec, addresses);
    }

    // zee: get customer address list: end


    var id = nlapiSubmitRecord(rec, false, true);

    nlapiLogExecution('DEBUG', 'Customer updated in NetSuite', 'Customer Id: ' + id);
}

function createLeadInNetSuite(magentoCustomerObj, enviornment, sessionID, isGuest) {

    var magentoCustomerId;
    var magentoSync;
    var result = new Object();

    if (enviornment == 'production') {
        magentoCustomerId = ConnectorConstants.Entity.Fields.MagentoId;
        magentoSync = 'custentity_magentosync';
    } else {
        magentoCustomerId = ConnectorConstants.Entity.Fields.MagentoId;
        magentoSync = 'custentity_magentosync_dev';
    }

    result.errorMsg = '';
    result.infoMsg = '';

    var rec = nlapiCreateRecord('lead');
    //rec.setFieldValue('isperson', 'T');
    //rec.setFieldValue('subsidiary', '3');// TODO: generalize location
    //   rec.setFieldValue('salutation', '');

    // zee: get customer address list: start

    var custAddrXML;
    var responseMagento;
    var addresses = new Object();

    if (!isGuest) {
        custAddrXML = getCustomerAddressXML(magentoCustomerObj.customer_id, sessionID);

        saveXML(custAddrXML);

        responseMagento = validateCustomerAddressResponse(soapRequestToMagento(custAddrXML));

        if (responseMagento.status == false) {
            result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            nlapiLogExecution('ERROR', 'Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' + result.errorMsg);
            return result;
        }

        addresses = responseMagento.addresses;

        if (addresses != null) {
            rec = setAddresses(rec, addresses);
        }
    } else {
        // if guest customer comes

        if (addresses != null) {
            rec = setAddresses(rec, magentoCustomerObj.addresses);
        }
    }

    // zee: get customer address list: end
    //var;/// TO DO:
    var entityId = magentoCustomerObj.firstname + ' ' + magentoCustomerObj.middlename + magentoCustomerObj.lastname;

    rec.setFieldValue('isperson', 'T');
    //rec.setFieldValue('autoname', 'T');

    //rec.setFieldValue('entityid', entityId); zee

    rec.setFieldValue(magentoCustomerId, isGuest ? 'Guest' : magentoCustomerObj.customer_id);
    rec.setFieldValue(magentoSync, 'T');
    rec.setFieldValue('email', magentoCustomerObj.email);
    rec.setFieldValue('firstname', magentoCustomerObj.firstname);
    rec.setFieldValue('middlename', magentoCustomerObj.middlename);
    rec.setFieldValue('lastname', magentoCustomerObj.lastname);//TODO: check
    //  rec.setFieldValue('salutation','');

    try {
        result.id = nlapiSubmitRecord(rec, false, true);
    } catch (ex) {
        result.errorMsg = ex.toString();
    }

    return result;
}

function getSystemConfiguration() {
    var config = {};
    var result = {};
    var configRec;

    result.errorMsg = '';

    try {
        configRec = nlapiLoadConfiguration('accountingpreferences');
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Reading System Configuration', ex.message);
        result.errorMsg = 'Reading System Configuration -- ' + ex.message;
        return result;
    }

    config.unshippedinvoices = configRec.getFieldValue('unshippedinvoices');

    result.systemConfiguration = config;
    return result;
}

function createInvoice(id, invoiceNum) {
    var result = {};
    var rec;

    result.errorMsg = '';

    try {
        rec = nlapiTransformRecord('salesorder', id, 'invoice');
        rec.setFieldValue('tranid', invoiceNum);
        result.invoiceId = nlapiSubmitRecord(rec);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Creating Invoice', ex.message);
        result.errorMsg = 'Creating Invoice -- ' + ex.message;
        return result;
    }
    return result;
}

function createCustomerPayment(id) {
    var result = {};
    var rec;

    result.errorMsg = '';

    try {
        rec = nlapiTransformRecord('invoice', id, 'customerpayment');
        // rec.setFieldValue('paymentmethod',12);
        result.customerPaymentId = nlapiSubmitRecord(rec);

    } catch (ex) {
        nlapiLogExecution('ERROR', 'Creating Customer Payment', ex.message);
        result.errorMsg = 'Creating Customer Payment -- ' + ex.message;
        return result;
    }
    return result;
}

function setAddresses(rec, addresses) {
    nlapiLogExecution('DEBUG', 'in setAddresses() start', addresses.toSource());

    removeAllLineItems(rec, 'addressbook');

    for (var i in addresses) {
        if (addresses[i].is_default_billing == true && addresses[i].is_default_shipping == true) {
            rec = setAddress(rec, addresses[i], 'T', 'T');
            break;
        }
        else if (addresses[i].is_default_billing == true) {
            rec = setAddress(rec, addresses[i], 'F', 'T');
        } else if (addresses[i].is_default_shipping == true) {
            rec = setAddress(rec, addresses[i], 'T', 'F');
        }
    }
    nlapiLogExecution('DEBUG', 'in setAddresses() end');
    return rec;
}

function setAddress(rec, address, isShipAddr, isBillAddr) {
    nlapiLogExecution('DEBUG', 'in setAddress() start', address.toSource());
    var addr = '';

    if (isShipAddr == isBillAddr) {
        addr = 'Address';
    } else if (isShipAddr == 'T') {
        addr = 'Shipping Address';
    }
    else if (isBillAddr == 'T') {
        addr = 'Billing Address';
    }

    var stAddr = address.street;

    var stAddr1;
    var stAddr2;

    var subStr;
    var index;
    if (stAddr.length > 150) {
        subStr = stAddr.substring(0, 150);
        index = subStr.lastIndexOf(' ');

        stAddr1 = stAddr.substring(0, index);
        stAddr2 = stAddr.substring(index + 1);
    } else {
        stAddr1 = stAddr;
        stAddr2 = '';
    }

    rec.setFieldValue('phone', address.telephone);
    rec.selectNewLineItem('addressbook');

    rec.setCurrentLineItemValue('addressbook', 'label', addr);
    rec.setCurrentLineItemValue('addressbook', 'defaultshipping', isShipAddr);
    rec.setCurrentLineItemValue('addressbook', 'defaultbilling', isBillAddr);
    rec.setCurrentLineItemValue('addressbook', 'addr1', stAddr1);
    rec.setCurrentLineItemValue('addressbook', 'addr2', stAddr2);
    rec.setCurrentLineItemValue('addressbook', 'addressee', address.firstname + ' ' + address.lastname);
    rec.setCurrentLineItemValue('addressbook', 'phone', address.telephone);
    rec.setCurrentLineItemValue('addressbook', 'country', address.country_id);
    rec.setCurrentLineItemValue('addressbook', 'zip', address.postcode);
    try {
        rec.setCurrentLineItemValue('addressbook', 'state', address.region);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'State is a select Field');
        rec.setCurrentLineItemText('addressbook', 'state', address.region);
    }

    rec.setCurrentLineItemValue('addressbook', 'city', address.city);

    rec.commitLineItem('addressbook');

    nlapiLogExecution('DEBUG', 'in setAddress() start');
    return rec;
}

function setAddressV2(rec, address, isShipAddr, isBillAddr) {
    var addr = '';

    if (isShipAddr == isBillAddr) {
        addr = 'Address';
    } else if (isShipAddr == 'T') {
        //rec.setFieldValue('shipaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone + '\n Street : ' + address.street + '\n Country : ' + address.country + '\n Zip : ' + address.zip + '\n State : ' + address.state + '\n City : ' + address.city);
        rec.setFieldValue('shipaddress', getFormattedAddress(address));
    }
    else if (isBillAddr == 'T') {
        //rec.setFieldValue('billaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone + '\n Street : ' + address.street + '\n Country : ' + address.country + '\n Zip : ' + address.zip + '\n State : ' + address.state + '\n City : ' + address.city);
        rec.setFieldValue('billaddress', getFormattedAddress(address));
    }

    var stAddr = address.street;

    var stAddr1;
    var stAddr2;

    var subStr;
    var index;
    if (stAddr.length > 150) {
        subStr = stAddr.substring(0, 150);
        index = subStr.lastIndexOf(' ');

        stAddr1 = stAddr.substring(0, index);
        stAddr2 = stAddr.substring(index + 1);
    } else {
        stAddr1 = stAddr;
        stAddr2 = '';
    }


    return rec;

    /*address.company=nlapiSelectValue(addresses[i],'company');

     address.region=nlapiSelectValue(addresses[i],'region');
     address.region_id=nlapiSelectValue(addresses[i],'region_id');
     address.street=nlapiSelectValue(addresses[i],'street');*/
}

function getCustomerAddressXML(customerID, sessionID) {
    var custAddrListXML;

    custAddrListXML = XML_HEADER;

    custAddrListXML = custAddrListXML + '<urn:customerAddressList>';
    custAddrListXML = custAddrListXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
    custAddrListXML = custAddrListXML + '<customerId urn:type="xsd:int">' + customerID + '</customerId>';
    custAddrListXML = custAddrListXML + '</urn:customerAddressList>';

    custAddrListXML = custAddrListXML + XML_FOOTER;

    return custAddrListXML;
}

function validateCustomerAddressResponse(xml) {
    saveXML(nlapiXMLToString(xml));

    var responseMagento = new Object();

    var customerAddresses = nlapiSelectNodes(xml, "//result/item");
    var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
    var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String

    }
    else if (customerAddresses != null) {
        responseMagento.status = true;
        responseMagento.addresses = transformCustAddrListXMLtoArray(customerAddresses);
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';


    }

    return responseMagento;
}

function transformCustAddrListXMLtoArray(addresses) {
    var result = new Array();
    var address;

    for (var i = 0; i < addresses.length; i++) {
        address = new Object();

        address.customer_address_id = nlapiSelectValue(addresses[i], 'customer_address_id');
        address.created_at = nlapiSelectValue(addresses[i], 'created_at');
        address.updated_at = nlapiSelectValue(addresses[i], 'updated_at');
        address.city = nlapiSelectValue(addresses[i], 'city');
        address.company = nlapiSelectValue(addresses[i], 'company');
        address.country_id = nlapiSelectValue(addresses[i], 'country_id');
        address.firstname = nlapiSelectValue(addresses[i], 'firstname');
        address.lastname = nlapiSelectValue(addresses[i], 'lastname');
        address.postcode = nlapiSelectValue(addresses[i], 'postcode');
        address.region = nlapiSelectValue(addresses[i], 'region');
        address.region_id = nlapiSelectValue(addresses[i], 'region_id');
        address.street = nlapiSelectValue(addresses[i], 'street');
        address.telephone = nlapiSelectValue(addresses[i], 'telephone');
        address.is_default_billing = eval(nlapiSelectValue(addresses[i], 'is_default_billing'));
        address.is_default_shipping = eval(nlapiSelectValue(addresses[i], 'is_default_shipping'));

        result[result.length] = address;
    }

    return result;
}

function removeAllLineItems(rec, sublist) {
    if (rec) {
        var totalLines = rec.getLineItemCount(sublist);
        for (var line = totalLines; line >= 1; line--) {
            rec.removeLineItem(sublist, line);
        }
    }
}

function isDevAccount() {
    var ctx = nlapiGetContext();

    if (ctx.getCompany() == 'TSTDRV1228763') {
        return true;
    }
    return false;
}

var ShippingMethod = {
    'UPS': 'ups',
    'FedEx': 'nonups'
};

// zee method: i have just separated the code.
function getNSCustomerID(customer, sessionID) {
    var customerIndex = 0;
    var existingCustomerRecords;
    var email = customer[customerIndex].email;
    var filterExpression;
    nlapiLogExecution('DEBUG', 'Start Iterating on Customer: ' + email);
    filterExpression = [
        ['email', 'is', email]
    ];
    nlapiLogExecution('DEBUG', 'Start Iterating on Customer: ' + filterExpression);
    cols = [];
    cols.push(new nlobjSearchColumn(magentoCustomerIdId));                        // Distinct the Parent

    existingCustomerRecords = ConnectorCommon.getRecords('customer', filterExpression, cols);

    var existingEntity;
    var leadCreateAttemptResult;

    if (existingCustomerRecords) {
        CustIdInNS = existingCustomerRecords[0].getId();
        //updateCustomerInNetSuite(CustIdInNS, customer[customerIndex], '', sessionID);
        //nlapiLogExecution('Debug', 'Update Customer As it exists');
        return CustIdInNS;

    }
    else {
        nlapiLogExecution('Debug', 'existingCustomerRecords Found', 'length: ' + existingCustomerRecords);
        nlapiLogExecution('Debug', 'No Existing Records', 'Create Lead without duplicate check');
        nlapiLogExecution('DEBUG', 'Start Creating Lead');

        leadCreateAttemptResult = createLeadInNetSuite(customer[customerIndex], '', sessionID, true);

        if (leadCreateAttemptResult.errorMsg != '') {
            nlapiLogExecution('ERROR', 'Attempt to create lead', leadCreateAttemptResult.errorMsg);
            nlapiLogExecution('ERROR', 'End Creating Lead');
            nlapiLogExecution('ERROR', 'End Iterating on Customer: ' + email);
            return '';
        }
        else if (leadCreateAttemptResult.infoMsg != '') {
            nlapiLogExecution('DEBUG', 'Attempt to create lead', leadCreateAttemptResult.infoMsg);
            nlapiLogExecution('DEBUG', 'End Creating Lead');
            nlapiLogExecution('DEBUG', 'End Iterating on Customer: ' + email);
            return '';
        }
        nlapiLogExecution('DEBUG', 'End Creating Lead');

        return leadCreateAttemptResult.id;
    }
    nlapiLogExecution('DEBUG', 'End Iterating on Customer: ' + email);
}

function isOrderSynced(orderId) {
    var magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
    var magentoSyncId = 'custbody_magentosyncdev';
    var fils = [];
    fils.push(new nlobjSearchFilter(magentoIdId, null, 'is', orderId));
    fils.push(new nlobjSearchFilter(magentoSyncId, null, 'is', 'T'));
    var res = nlapiSearchRecord('transaction', null, fils);

    if (res && res.length > 0) {
        return true;
    }
    return false;
}

function getCCType(ccType) {
    ccType += '';
    // Visa
    if (ccType === '001' || ccType === '0001' || ccType === 'VI') {
        return '5';
    }
    // Master Card
    if (ccType === '002' || ccType === '0002' || ccType === 'MC') {
        return '4';
    }
    // American Express
    if (ccType === '003' || ccType === '0003' || ccType === 'AE') {
        return '6';
    }
    // Discover
    if (ccType === '004' || ccType === '0004' || ccType === 'DI') {// Diners in Magento
        return '3';// Discover
    }
    return '';
}

function setPayment(rec, payment) {
    if (payment.method.toString() === 'ccsave') {
        rec.setFieldValue('paymentmethod', getCCType(payment.ccType));
        rec.setFieldValue('ccapproved', 'T');
        return;
    }
    //paypal_direct
    if (payment.method.toString() === 'paypal_direct') {
        rec.setFieldValue('paymentmethod', getCCType(payment.ccType));
        rec.setFieldValue('pnrefnum', payment.authorizedId);
        rec.setFieldValue('ccapproved', 'T');
        return;
    }
    //paypal_express
    if (payment.method.toString() === 'paypal_express') {
        rec.setFieldValue('paymentmethod', '7');// paypal
        rec.setFieldValue('paypalauthid', payment.authorizedId);// paypal
        return;
    }
}

function getFormattedAddress(address) {
    var templateArray = {};
    templateArray.ALL = '<$firstname$> <$lastname$>\n<$street$>\n<$city$> <$state$> <$zip$>';
    //template_array['US'] = '<$attention$>\n<$addressee$>\n<$addr1$>\n<$addr2$>\n<$addr3$>\n<$city$> <$state$> <$zip$>\n<$country$>';
    var template = templateArray.ALL;
    if (isBlankOrNull(template)) {
        template = '<$firstname$> <$lastname$>\n<$street$>\n<$city$> <$state$> <$zip$>';
    }

    var val;

    val = address.firstname || '';
    template = template.replace('<$firstname$>', val);
    val = address.lastname || '';
    template = template.replace('<$lastname$>', val);
    val = address.street || '';
    template = template.replace('<$street$>', val);
    val = address.city || '';
    template = template.replace('<$city$>', val);
    val = address.state || '';

    if (address.country === 'US' || address.country === 'CA') {
        val = getStateShortName(val) || '';
    }

    template = template.replace('<$state$>', val);
    val = address.zip || '';
    template = template.replace('<$zip$>', val);

    template = template.replace(/<\$.*?\$>/g, '');
    template = template.replace(/(\n){2}/g, '\n');
    template = template.replace(/\n\s*/g, '\n');
    while (template.indexOf('\n') == 0) {
        template = template.substring(1);
    }

    return template;
}

function getStateShortName(stateName) {
    stateName += '';
    for (var i in US_CA_States) {
        if (i.toLowerCase() === stateName.toLowerCase()) {
            return US_CA_States[i];
        }
    }
    return stateName;
}

function getCouponCode(orderIncrementId) {
    try {
        var postData = {"isFetchCode": true, "data": JSON.stringify({"orderIncrementId": orderIncrementId})};
        var response = nlapiRequestURL('https://goddiva.co.uk/get-couponcode.php', postData).getBody();
        var data = JSON.parse(response);
        nlapiLogExecution('DEBUG', 'getCouponCode: data', JSON.stringify(data));
        if (data.status) {
            return data.couponCode;
        } else {
            if (data.error) {
                nlapiLogExecution('ERROR', 'Server Response getCouponCode', data.error);
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'getCouponCode', ex.toString());
    }
    return '';
}