var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';
//var URL="http://mystores1.gostorego.com/api/v2_soap";

var URL = '';
var SO_IMPORT_MIN_USAGELIMIT = 1000;        // For the safe side its 1000, we calculate , in actual it is 480
var SCRIPT_ID = MAGENTO_SCRIPTS.SCHEDULED.CONNECTOR_ORDER_IMPORT_SCHEDULER.SCRIPT_ID;
var SCRIPT_DEPLOYMENT_ID = MAGENTO_SCRIPTS.SCHEDULED.CONNECTOR_ORDER_IMPORT_SCHEDULER.DEPLOYMENT_ID;
var NSToMGShipMap = null;
/*var cyberSouceConfig = getCyberSourceConfiguration();

 // load the configuration from custom record and return as an object
 function getCyberSourceConfiguration() {
 var config = {};
 var rec;
 try {
 rec = nlapiLoadRecord('customrecord_cybersource_configuration', 1);
 config.merchantId = rec.getFieldValue('custrecord_csc_merchant_id');
 config.secretId = rec.getFieldValue('custrecord_csc_secret_key');
 config.reportingUser = rec.getFieldValue('custrecord_csc_reporting_user');
 config.reportingUserPass = rec.getFieldValue('custrecord_csc_reporting_user_pass');
 } catch (ex) {
 nlapiLogExecution('DEBUG', 'getCyberSourceConfiguration', ex.toString());
 }
 return config;
 }*/

function startup() {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        NSToMGShipMap = NSToMGShipMethodMap.getMap();
        //generateErrorEmail('TEST TEST ');
        var sessionID;
        var sessionObj = {};
        var jobId;
        var nextStartDate;
        var nextStartTime;
        var lastScheduleDate;
        var jobType;
        var context = nlapiGetContext();
        var jobRecord = {};
        var result = {};
        var soUpdateDate;
        var params;

        // Add a Check whether categories synched or not , if not then stop and give msg that ensure the sync of categories first
        try {
            context.setPercentComplete(0.00);  // set the percent complete parameter to 0.00

            URL = MGCONFIG.WebService.EndPoint;
            var webserviceid = MGCONFIG.WebService.UserName;
            var webservicepw = MGCONFIG.WebService.Password;
            //var sofrequency = MGCONFIG.SalesOrder.Days;
            var sofrequency = context.getSetting('SCRIPT', 'custscript_no_of_days') || 1;
            var soprice = '1'; //context.getSetting('SCRIPT', 'custscript_magento_ws_price');
            nlapiLogExecution('Debug', 'PRICE', soprice);
            sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
            soUpdateDate = getUpdateDate(-1 * sofrequency);

            nlapiLogExecution('Debug', 'date', soUpdateDate);
            nlapiLogExecution('Debug', 'sessionObj.data', sessionObj.data);
            nlapiLogExecution('Debug', 'sessionObj.errorMsg', sessionObj.errorMsg);

            if (sessionObj == null) {
                nlapiLogExecution('AUDIT', 'Session', 'Session Object is null');
            }

            if (sessionObj.errorMsg.toString() === '') {
                nlapiLogExecution('Debug', 'Inside if sessionObj.errorMsg');
                sessionID = sessionObj.data;
            }
            else {
                nlapiLogExecution('AUDIT', 'Session', 'Error in Session Creating With Message' + sessionObj.errorMsg);
            }


            nlapiLogExecution('AUDIT', 'Start Syncing');
            result = syncSalesOrderMagento(sessionID, soUpdateDate, jobId);

            // Something Wrong with SO Sync
            if (result.errorMsg.toString() !== '') {
                nlapiLogExecution('AUDIT', 'Master Scheduler', 'Job Ending With Message ' + result.errorMsg);
                //SEnd emil
            }
            else {
                nlapiLogExecution('AUDIT', 'Item Sync', result.infoMsg);

                if (result.infoMsg.toString() === 'Reschedule') {
                    nlapiScheduleScript(SCRIPT_ID, SCRIPT_DEPLOYMENT_ID, null);
                }
                else {
                    nlapiLogExecution('AUDIT', 'JOB RAN SUCCESSFULLyy');
                }
            }

        } catch (ex) {

            nlapiLogExecution('AUDIT', 'Error', 'Unexpected End with Error Message: ' + ex.toString());

            nlapiLogExecution('EMERGENCY', 'Error', 'Email Sent');


            generateErrorEmail('SalesOrder CRASHED , Please convey this to folio3 : ' + ex.toString(), '', 'order');

        }

    } else {
        nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
    }
}

function syncSalesOrderMagento(sessionID, updateDate, jobId, configuration) {
    var order = {};

    var responseMagentoOrders;
    var responseMagentoProducts;
    var orders;
    var orderXML;
    var productXML;
    var products;
    var netsuiteMagentoProductMap;
    var netsuiteMagentoProductMapData;
    var result = {};
    var context;
    var usageRemaining;
    var existingOrderRecords;
    var existingCustomerRecords;
    var filterExpression;
    var registeredCustomer;
    var cols;
    var guestNSId;
    var rec;

    magentoCustomerIdId = 'custentity_magento_custid';
    magentoIdId = 'custbody_magentoid';
    //order.updateDate='2013-07-18 00:00:00';
    try {
        result.errorMsg = '';
        result.infoMsg = '';
        order.updateDate = updateDate;

        nlapiLogExecution('DEBUG', 'order.updateDate', updateDate);


        // Make XML to get Order
        orderXML = getSalesOrderListXML(order, sessionID);
        //saveXML(orderXML);

        // Make Call and Get Data
        responseMagentoOrders = validateResponse(soapRequestToMagento(orderXML), 'order');

        // If some problem
        if (responseMagentoOrders.status === false) {
            result.errorMsg = responseMagentoOrders.faultCode + '--' + responseMagentoOrders.faultString;
            return result;
        }

        orders = responseMagentoOrders.orders;

        if (orders !== null) {
            result.infoMsg = orders.length + ' Order(s) Found for Processing ';

            for (var i = 0; i < orders.length; i++) {

                try {
                    nlapiLogExecution('DEBUG', 'Iterating Sales Order having Magento Id: ' + orders[i].increment_id);

                    nlapiLogExecution('DEBUG', 'orders[i]', JSON.stringify(orders[i]));

                    // Check if this SO already exists
                    if (isOrderSynced(orders[i].increment_id)) {
                        nlapiLogExecution('DEBUG', 'Sales Order already exist with Magento Id: ' + orders[i].increment_id);
                        continue;
                    }

                    // Extract products
                    productXML = getSalesOrderInfoXML(orders[i].increment_id, sessionID);

                    responseMagentoProducts = validateResponse(soapRequestToMagento(productXML), 'product');

                    // Could not fetch items of Magento
                    if (responseMagentoProducts.status == false) {
                        nlapiLogExecution('DEBUG', 'Could not fetch Magento Items in SO');
                        result.errorMsg = responseMagentoOrders.faultCode + '--' + responseMagentoOrders.faultString;
                        //return result;zee
                        continue;//zee
                    }

                    var shippingAddress = responseMagentoProducts.shippingAddress;
                    var billingAddress = responseMagentoProducts.billingAddress;
                    var payment = responseMagentoProducts.payment;

                    /*if (isBlankOrNull(payment.csTranId)) {
                     var ccdate;
                     // TODO: test this part
                     try {
                     ccdate = getDate(orders[i].created_at + '');
                     var ccRefCode = orders[i].increment_id;

                     CyberSourceSingleTransactionReport.setup(cyberSouceConfig.reportingUser, cyberSouceConfig.reportingUserPass, cyberSouceConfig.merchantId);
                     payment.csTranId = CyberSourceSingleTransactionReport.retieveRequestId(ccRefCode, ccdate);
                     payment.csReposne = CyberSourceSingleTransactionReport.csResponse;
                     nlapiLogExecution('DEBUG', 'Request Id from CyberSource', payment.csTranId);
                     } catch (ex) {
                     nlapiLogExecution('DEBUG', 'Error in getting request id', ex.toString());
                     }
                     }*/

                    products = responseMagentoProducts.products;

                    nlapiLogExecution('Debug', 'Inside Operation Function-- Mapping of Magento and Netsuite Products , 1st mg pro' + products[0].product_id);
                    netsuiteMagentoProductMap = getNetsuiteProductIdsByMagentoIds(products, 'pro');

                    if (netsuiteMagentoProductMap.errorMsg != '') {
                        nlapiLogExecution('DEBUG', 'result.errorMsg: ' + result.errorMsg);
                        nlapiLogExecution('DEBUG', 'COULD NOT EXECUTE Mapping perfectly , Please report szaman@folio3.com');
                        continue;
                    }

                    netsuiteMagentoProductMapData = netsuiteMagentoProductMap.data;
                    nlapiLogExecution('Debug', 'Inside Operation Function-- Before checking of data mapping result');

                    if (isBlankOrNull(orders[i].customer_id)) {
                        // TODO: if id does not exist then search customer against email address if found OK else create customer in NetSuite
                        nlapiLogExecution('Debug', 'Guest Customer');

                        var customer = getCustomerObject(orders[i]);
                        customer[0].addresses = getAddressesFromOrder(shippingAddress, billingAddress);
                        CustIdInNS = getNSCustomerID(customer, sessionID);
                        nlapiLogExecution('DEBUG', 'For Guest CUSTOMER', 'NS Entity ID: ' + CustIdInNS);
                        if (CustIdInNS) {
                            createSalesOrder(orders[i], '', products, netsuiteMagentoProductMapData, CustIdInNS, '', shippingAddress, billingAddress, payment);
                        }
                    }
                    else {
                        // start creating customer
                        var customer = getCustomerObject(orders[i]);
                        var customerIndex = 0;
                        var existingCustomerRecords;
                        var entityId = customer[customerIndex].firstname + ' ' + customer[customerIndex].middlename + customer[customerIndex].lastname;
                        var filterExpression;
                        nlapiLogExecution('DEBUG', 'Start Iterating on Customer: ' + entityId);
                        filterExpression = [
                            [ magentoCustomerIdId, 'is', customer[customerIndex].customer_id]
                        ];
                        nlapiLogExecution('DEBUG', 'Start Iterating on Customer: ' + filterExpression);
                        cols = [];
                        cols.push(new nlobjSearchColumn(magentoCustomerIdId));                        // Distinct the Parent

                        existingCustomerRecords = getRecords('customer', filterExpression, cols);

                        var existingEntity;
                        var leadCreateAttemptResult;

                        if (existingCustomerRecords) {
                            CustIdInNS = existingCustomerRecords[0].getId();
                            updateCustomerInNetSuite(CustIdInNS, customer[customerIndex], '', sessionID);
                            nlapiLogExecution('Debug', 'Update Customer As it exists');
                        }
                        else {
                            nlapiLogExecution('Debug', 'existingCustomerRecords Found', 'length: ' + existingCustomerRecords);
                            nlapiLogExecution('Debug', 'No Existing Records', 'Create Lead without duplicate check');
                            nlapiLogExecution('DEBUG', 'Start Creating Lead');

                            leadCreateAttemptResult = createLeadInNetSuite(customer[customerIndex], '', sessionID);

                            if (leadCreateAttemptResult.errorMsg != '') {
                                nlapiLogExecution('ERROR', 'Attempt to create lead', leadCreateAttemptResult.errorMsg);
                                nlapiLogExecution('ERROR', 'End Creating Lead');
                                nlapiLogExecution('ERROR', 'End Iterating on Customer: ' + entityId);
                                continue;
                            }
                            else if (leadCreateAttemptResult.infoMsg != '') {
                                nlapiLogExecution('DEBUG', 'Attempt to create lead', leadCreateAttemptResult.infoMsg);
                                nlapiLogExecution('DEBUG', 'End Creating Lead');
                                nlapiLogExecution('DEBUG', 'End Iterating on Customer: ' + entityId);
                                continue;
                            }
                            nlapiLogExecution('DEBUG', 'End Creating Lead');
                            CustIdInNS = leadCreateAttemptResult.id;
                        }
                        createSalesOrder(orders[i], '', products, netsuiteMagentoProductMapData, CustIdInNS, '', shippingAddress, billingAddress, payment);
                        nlapiLogExecution('DEBUG', 'End Iterating on Customer: ' + entityId);
                    }


                    // Write Code to handle Re-scheduling in case of going down than min Governance
                    context = nlapiGetContext();
                    usageRemaining = context.getRemainingUsage();

                    if (usageRemaining <= SO_IMPORT_MIN_USAGELIMIT) {

                        result.infoMsg = 'Reschedule';
                        return result;

                    }


                }
                catch (ex) {
                    nlapiLogExecution('DEBUG', 'SO of Order ID ' + orders[i].increment_id + ' Failed', 'With Message ' + ex.toString());

                }
                context.setPercentComplete(Math.round(((100 * i) / orders.length) * 100) / 100);  // calculate the results

                // displays the percentage complete in the %Complete column on
                // the Scheduled Script Status page
                context.getPercentComplete();  // displays percentage complete
            }

        }
        else {
            result.infoMsg = 'No Order(s) Found';
            return result;
        }

    }
    catch (ex) {
        result.errorMsg = ex.toString();
    }

    return result;

}


function checkCustomerOption(data1, chkOption, enviornment) {
    var i = 0;
    var magentoCustomerIdId;

    if (enviornment == 'production') {
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
    } else {
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
    }


    if (chkOption == 'magentoid') {
        for (i = 0; i < data1.length; i++) {
            if (!isBlankOrNull(data1[i].getValue(magentoCustomerIdId))) {
                return data1[i].getId();
            }
        }
    }

    return '';
}


function getInvoiceListXML(order, sessionID) {
    var ilXML;

    ilXML = XML_HEADER;
    ilXML = ilXML + '<urn:salesOrderInvoiceList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    ilXML = ilXML + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    ilXML = ilXML + '<filters xsi:type="urn:filters">';

    ilXML = ilXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
    ilXML = ilXML + '<item xsi:type="ns1:complexFilter">';
    ilXML = ilXML + '<key xsi:type="xsd:string">updated_at</key>';
    ilXML = ilXML + '<value xsi:type="ns1:associativeEntity">';
    ilXML = ilXML + '<key xsi:type="xsd:string">gt</key>';
    ilXML = ilXML + '<value xsi:type="xsd:string">' + order.updateDate + '</value>';
    ilXML = ilXML + '</value>';
    ilXML = ilXML + '</item>';
    ilXML = ilXML + '</complex_filter>';
    ilXML = ilXML + '</filters>';
    ilXML = ilXML + '</urn:salesOrderInvoiceList>';
    ilXML = ilXML + XML_FOOTER;
    return ilXML;

}


function getSalesOrderListXML(order, sessionID) {
    var soXML;

    soXML = XML_HEADER;
    soXML = soXML + '<urn:salesOrderList>';

    soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';

    soXML = soXML + '<filters xsi:type="urn:filters">';
    soXML = soXML + '<filter SOAP-ENC:arrayType="urn:associativeEntity[0]" xsi:type="urn:associativeArray">';
    soXML = soXML + '</filter>';

    soXML = soXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[2]" xsi:type="urn:complexFilterArray">';

    /*soXML = soXML + '<item xsi:type="ns1:complexFilter">';
     soXML = soXML + '    <key xsi:type="xsd:string">increment_id</key>';
     soXML = soXML + '    <value xsi:type="ns1:associativeEntity">';
     soXML = soXML + '        <key xsi:type="xsd:string">in</key>';
     soXML = soXML + '        <value xsi:type="xsd:string">1100000178</value>';
     soXML = soXML + '    </value>';
     soXML = soXML + '</item>';*/


    soXML = soXML + '<item xsi:type="ns1:complexFilter">';

    soXML = soXML + '<key xsi:type="xsd:string">updated_at</key>';
    soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
    soXML = soXML + '<key xsi:type="xsd:string">gt</key>';
    soXML = soXML + '<value xsi:type="xsd:string">' + order.updateDate + '</value>';
    soXML = soXML + '</value>';
    soXML = soXML + '</item>';

    var orderStatusFilster = ['processing', 'pending', 'pending_payment', 'complete', 'pending_review'];
    soXML = soXML + '<item xsi:type="ns1:complexFilter">';
    soXML = soXML + '<key xsi:type="xsd:string">status</key>';
    soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
    soXML = soXML + '<key xsi:type="xsd:string">in</key>';
    for (var i = 0; i < orderStatusFilster.length; i++) {
        soXML = soXML + '<value xsi:type="xsd:string">' + orderStatusFilster[i] + '</value>';
    }
    soXML = soXML + ' </value>';
    soXML = soXML + '</item>';
    soXML = soXML + '</complex_filter>';

    soXML = soXML + '</filters>';

    soXML = soXML + '</urn:salesOrderList>';
    soXML = soXML + XML_FOOTER;

    //saveXML(soXML);

    return soXML;

}


function getSalesOrderInfoXML(orderid, sessionID) {
    var soXML;

    soXML = XML_HEADER;
    soXML = soXML + '<urn:salesOrderInfo>';
    soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
    soXML = soXML + '<orderIncrementId urn:type="xsd:string">' + orderid + '</orderIncrementId>';
    soXML = soXML + '</urn:salesOrderInfo>';
    soXML = soXML + XML_FOOTER;

    return soXML;

}


function validateResponse(xml, operation) {


    var responseMagento = {};

    if (operation == 'order') {
        var orders = nlapiSelectNodes(xml, "//result/item");
        var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        if (faultCode != null) {
            responseMagento.status = false;       // Means There is fault
            responseMagento.faultCode = faultCode;   // Fault Code
            responseMagento.faultString = faultString; //Fault String

        }
        else if (orders != null) {
            responseMagento.status = true;
            responseMagento.orders = transformSalesOrderListXMLtoArray(orders);
        }
        else    // Not Attribute ID Found, Nor fault code found
        {
            responseMagento.status = false;
            responseMagento.faultCode = '000';
            responseMagento.faultString = 'Unexpected Error';


        }

    }
    else if (operation == 'product') {

        var products = nlapiSelectNodes(xml, "//items/item");
        var shipping = nlapiSelectNodes(xml, "//shipping_address");
        var billing = nlapiSelectNodes(xml, "//billing_address");
        var payment = nlapiSelectNodes(xml, "//payment");
        var statusHistory = nlapiSelectNodes(xml, "//status_history/item");
        var authorizedId;

        nlapiLogExecution('DEBUG', 'payment XXL', payment);

        var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        if (faultCode != null) {
            responseMagento.status = false;       // Means There is fault
            responseMagento.faultCode = faultCode;   // Fault Code
            responseMagento.faultString = faultString; //Fault String
        }
        else if (products != null) {

            responseMagento.status = true;
            responseMagento.products = transformSalesOrderInfoXMLtoArray(products);
            responseMagento.shippingAddress = transformSalesOrderInfoXMLtoshippingAddress(shipping);
            responseMagento.billingAddress = transformSalesOrderInfoXMLtobillingAddress(billing);
            responseMagento.payment = transformSalesOrderInfoXMLtoPayment(payment);
            authorizedId = getAuthorizedId(statusHistory);

            responseMagento.payment.authorizedId = authorizedId;
        }
        else    // Not Attribute ID Found, Nor fault code found
        {
            //nlapiLogExecution('Debug','Error in validateResponse-operation=product ');
            responseMagento.status = false;
            responseMagento.faultCode = '000';
            responseMagento.faultString = 'Unexpected Error';
        }

    }
    else if (operation == 'invoice') {
        var invoices = nlapiSelectNodes(xml, "//result/item");
        var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        if (faultCode != null) {
            responseMagento.status = false;       // Means There is fault
            responseMagento.faultCode = faultCode;   // Fault Code
            responseMagento.faultString = faultString; //Fault String
        }
        else if (invoices != null) {
            responseMagento.status = true;
            responseMagento.invoices = transformInvoiceListToArray(invoices);
        }
        else    // Not Attribute ID Found, Nor fault code found
        {
            //nlapiLogExecution('Debug','Error in validateResponse-operation=product ');
            responseMagento.status = false;
            responseMagento.faultCode = '000';
            responseMagento.faultString = 'Unexpected Error';
        }
    }
    return responseMagento;

}


function transformInvoiceListToArray(invoices) {
    var result = [];
    var invoice;
    for (var i = 0; i < invoices.length; i++) {
        invoice = {};
        invoice.increment_id = nlapiSelectValue(invoices[i], 'increment_id');
        invoice.order_id = nlapiSelectValue(invoices[i], 'order_id');
        result[invoice.order_id] = invoice.increment_id;
    }

    return result;
}

function transformSalesOrderListXMLtoArray(orders) {
    var result = [];

    for (var i = 0; i < orders.length; i++) {

        var order = {};
        order.increment_id = nlapiSelectValue(orders[i], 'increment_id');
        order.order_id = nlapiSelectValue(orders[i], 'order_id');
        order.created_at = nlapiSelectValue(orders[i], 'created_at');
        order.customer_id = nlapiSelectValue(orders[i], 'customer_id');
        order.firstname = nlapiSelectValue(orders[i], 'firstname');
        order.lastname = nlapiSelectValue(orders[i], 'lastname');
        order.email = nlapiSelectValue(orders[i], 'customer_email');
        order.shipment_method = nlapiSelectValue(orders[i], 'shipping_method');
        order.shipping_description = nlapiSelectValue(orders[i], 'shipping_description');
        order.customer_firstname = nlapiSelectValue(orders[i], 'customer_firstname');
        order.customer_lastname = nlapiSelectValue(orders[i], 'customer_lastname');
        order.grandtotal = nlapiSelectValue(orders[i], 'grand_total');
        order.store_id = nlapiSelectValue(orders[i], 'store_id');
        order.shipping_amount = nlapiSelectValue(orders[i], 'shipping_amount');
        order.discount_amount = nlapiSelectValue(orders[i], 'discount_amount');
        order.customer_middlename = nlapiSelectValue(orders[i], 'customer_middlename');
        order.customer_middlename = order.customer_middlename ? order.customer_middlename : '';

        result.push(order);
    }

    return result;
}

function transformSalesOrderInfoXMLtoshippingAddress(shipping) {
    var shippingObj = {};

    shippingObj.street = nlapiSelectValue(shipping[0], 'street');
    shippingObj.city = nlapiSelectValue(shipping[0], 'city');
    shippingObj.phone = nlapiSelectValue(shipping[0], 'telephone');
    shippingObj.state = nlapiSelectValue(shipping[0], 'region');
    shippingObj.region_id = nlapiSelectValue(shipping[0], 'region_id');
    shippingObj.zip = nlapiSelectValue(shipping[0], 'postcode');
    shippingObj.country = nlapiSelectValue(shipping[0], 'country_id');
    shippingObj.firstname = nlapiSelectValue(shipping[0], 'firstname');
    shippingObj.lastname = nlapiSelectValue(shipping[0], 'lastname');

    return  shippingObj;
}

function transformSalesOrderInfoXMLtobillingAddress(billing) {
    var billingObj = {};

    billingObj.street = nlapiSelectValue(billing[0], 'street');
    billingObj.city = nlapiSelectValue(billing[0], 'city');
    billingObj.phone = nlapiSelectValue(billing[0], 'telephone');
    billingObj.state = nlapiSelectValue(billing[0], 'region');
    billingObj.region_id = nlapiSelectValue(billing[0], 'region_id');
    billingObj.zip = nlapiSelectValue(billing[0], 'postcode');
    billingObj.country = nlapiSelectValue(billing[0], 'country_id');
    billingObj.firstname = nlapiSelectValue(billing[0], 'firstname');
    billingObj.lastname = nlapiSelectValue(billing[0], 'lastname');

    return  billingObj;
}

function transformSalesOrderInfoXMLtoPayment(payment) {
    var paymentObj = {};

    paymentObj.parentId = nlapiSelectValue(payment[0], 'parent_id');
    paymentObj.amountOrdered = nlapiSelectValue(payment[0], 'amount_ordered');
    paymentObj.shippingAmount = nlapiSelectValue(payment[0], 'shipping_amount');
    paymentObj.baseAmountOrdered = nlapiSelectValue(payment[0], 'base_amount_ordered');
    paymentObj.method = nlapiSelectValue(payment[0], 'method');
    paymentObj.ccType = nlapiSelectValue(payment[0], 'cc_type');
    paymentObj.ccLast4 = nlapiSelectValue(payment[0], 'cc_last4');
    paymentObj.ccExpMonth = nlapiSelectValue(payment[0], 'cc_exp_month');
    paymentObj.ccExpYear = nlapiSelectValue(payment[0], 'cc_exp_year');
    paymentObj.paymentId = nlapiSelectValue(payment[0], 'payment_id');

    return  paymentObj;
}

function transformSalesOrderInfoXMLtoArray(products) {
    var result = [];
    var product;
    var skuArr = [];

    for (var i = 0; i < products.length; i++) {
        product = {};
        //product.product_id = nlapiSelectValue(products[i], 'product_id');// zee change
        var sku = nlapiSelectValue(products[i], 'sku');
        if (skuArr.indexOf(sku) === -1) {
            skuArr.push(sku);
            product.product_id = sku;
            product.qty_ordered = nlapiSelectValue(products[i], 'qty_ordered');
            // get ammount for dummy item
            result[result.length] = product;
        }
    }

    return result;
}


function saveXML(xml) {


    /* var rec = nlapiCreateRecord(MAGENTO_MyRecordRecord.InternalId);
     rec.setFieldValue(MAGENTO_MyRecordRecord.FieldName.XML, xml);
     nlapiSubmitRecord(rec);      */


}


function getCustomerObject(order) {
    var result = [];
    var customer = {};

    customer.customer_id = order.customer_id;
    customer.email = order.email;
    customer.firstname = order.firstname;
    customer.middlename = getBlankForNull(order.middlename) == '' ? '' : order.middlename + ' ';
    customer.lastname = order.lastname;
    customer.group_id = order.customer_group_id;
    customer.prefix = order.customer_prefix;
    customer.suffix = order.customer_suffix;
    customer.dob = order.customer_dob;
    result.push(customer);

    return result;

}

function getAuthorizedId(statusHistory) {
    var authorizedId = '';

    for (var i = 0; i < statusHistory.length; i++) {
        var comment = nlapiSelectValue(statusHistory[i], 'comment') + '';
        if (comment.indexOf('Captured amount') !== -1 && comment.indexOf('Transaction ID:') !== -1) {
            authorizedId = comment.substring(comment.indexOf('"') + 1, comment.lastIndexOf('"'));
            break;
        }
    }

    return authorizedId;
}

function getAddressesFromOrder(shippingAddress, billingAddress) {
    var result = [];
    if (isSame(shippingAddress, billingAddress)) {
        var address = {};

        //address.customer_address_id = nlapiSelectValue(addresses[i], 'customer_address_id');
        //address.created_at = nlapiSelectValue(addresses[i], 'created_at');
        //address.updated_at = nlapiSelectValue(addresses[i], 'updated_at');
        //address.company = nlapiSelectValue(addresses[i], 'company');
        address.city = shippingAddress.city;
        address.country_id = shippingAddress.country;
        address.firstname = shippingAddress.firstname;
        address.lastname = shippingAddress.lastname;
        address.postcode = shippingAddress.zip;
        address.region = shippingAddress.state;
        address.region_id = shippingAddress.region_id;
        address.street = shippingAddress.street;
        address.telephone = shippingAddress.phone;
        address.is_default_billing = true;
        address.is_default_shipping = true;

        result[result.length] = address;
    } else {
        var address = {};

        address.city = shippingAddress.city;
        address.country_id = shippingAddress.country;
        address.firstname = shippingAddress.firstname;
        address.lastname = shippingAddress.lastname;
        address.postcode = shippingAddress.zip;
        address.region = shippingAddress.state;
        address.region_id = shippingAddress.region_id;
        address.street = shippingAddress.street;
        address.telephone = shippingAddress.phone;
        address.is_default_billing = false;
        address.is_default_shipping = true;

        result[result.length] = address;

        var address = {};

        address.city = billingAddress.city;
        address.country_id = billingAddress.country;
        address.firstname = billingAddress.firstname;
        address.lastname = billingAddress.lastname;
        address.postcode = billingAddress.zip;
        address.region = billingAddress.state;
        address.region_id = billingAddress.region_id;
        address.street = billingAddress.street;
        address.telephone = billingAddress.phone;
        address.is_default_billing = true;
        address.is_default_shipping = false;

        result[result.length] = address;
    }

    return result;
}

function isSame(shippingAddress, billingAddress) {
    if (shippingAddress.city + '' === billingAddress.city + '' &&
        shippingAddress.country + '' === billingAddress.country + '' &&
        shippingAddress.firstname + '' === billingAddress.firstname + '' &&
        shippingAddress.lastname + '' === billingAddress.lastname + '' &&
        shippingAddress.zip + '' === billingAddress.zip + '' &&
        shippingAddress.state + '' === billingAddress.state + '' &&
        shippingAddress.region_id + '' === billingAddress.region_id + '' &&
        shippingAddress.street + '' === billingAddress.street + '' &&
        shippingAddress.phone + '' === billingAddress.phone + '') {
        return true;
    }

    return false;
}


// subtract 6 hours from date
function getDate(dateString) {
//accept format = "2014-07-09 20:18:14";
    if (dateString) {

        var b = dateString.split(' ');
        var c = b[0].split('-');
        var t = b[1].split(':');

        var date = new Date(c[0], c[1] - 1, c[2], t[0], t[1], t[2], 0);//var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
        //"2014-07-09 20:18:14"

        date = new Date(date.getTime() - (6 * 60 * 60 * 1000));// -6 hr

        var d = date.getFullYear() + '-' +
            convertIntToDigit(date.getMonth() + 1, 2) + '-' +
            convertIntToDigit(date.getDate(), 2) + ' ' +
            convertIntToDigit(date.getHours(), 2) + ':' +
            convertIntToDigit(date.getMinutes(), 2) + ':' +
            convertIntToDigit(date.getSeconds(), 2);

        d = date.getFullYear() + convertIntToDigit(date.getMonth() + 1, 2) + convertIntToDigit(date.getDate(), 2);

        return d;
    }
}

// convert into to digits
function convertIntToDigit(num, length) {
    var str = '';
    if (!isNaN(num)) {
        num = parseInt(num);
        if (num >= 0) {
            var numArr = new String(num);
            if (numArr.length < length) {
                var diff = length - numArr.length;
                for (var i = 0; i < diff; i++) {
                    str += '0';
                }
            }
            str += num;
        }
    }
    return str;
}