var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';
//var URL="http://mystores1.gostorego.com/api/v2_soap";
var URL = '';
// For the safe side its 1000, we calculate , in actual it is 460
var CUSTOMER_IMPORT_MIN_USAGELIMIT = 1000;
var SCRIPT_ID = 'customscript_magento_customer_sync';
var SCRIPT_DEPLOYMENT_ID = 'customdeploy_magento_customer_sync';


function startup() {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        var configuration;
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
        var params = [];
        var customerUpdateDate;

        // Add a Check whether categories synched or not , if not then stop and give msg that ensure the sync of categories first

        try {
            context.setPercentComplete(0.00);  // set the percent complete parameter to 0.00
            URL = MGCONFIG.WebService.EndPoint;
            var webserviceid = MGCONFIG.WebService.UserName;
            var webservicepw = MGCONFIG.WebService.Password;
            var sofrequency = '4';//context.getSetting('SCRIPT', 'custscript_magento_ws_frequency');
            var soprice = '1'; //context.getSetting('SCRIPT', 'custscript_magento_ws_price');
            nlapiLogExecution('Debug', 'PRICE', soprice);
            sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
            customerUpdateDate = getUpdateDate(-1 * sofrequency);


            nlapiLogExecution('Debug', 'sessionObj.data', sessionObj.data);
            nlapiLogExecution('Debug', 'sessionObj.errorMsg', sessionObj.errorMsg);
            nlapiLogExecution('Debug', 'configuration.sofrequency', sofrequency);

            nlapiLogExecution('Debug', 'customerUpdateDate', customerUpdateDate);

            nlapiLogExecution('Debug', 'sessionObj.data', sessionObj.data);
            nlapiLogExecution('Debug', 'sessionObj.errorMsg', sessionObj.errorMsg);

            if (sessionObj === null) {
                nlapiLogExecution('AUDIT', 'Session', 'Session Object is null');
            }

            if (sessionObj.errorMsg == '') {
                nlapiLogExecution('Debug', 'Inside if sessionObj.errorMsg');
                sessionID = sessionObj.data;
            }
            else
                nlapiLogExecution('AUDIT', 'Session', 'Error in Session Creating With Message' + sessionObj.errorMsg);


            nlapiLogExecution('AUDIT', 'Start Syncing');


            result = syncCustomerMagento(sessionID, customerUpdateDate, configuration);


            if (result.errorMsg != '') {
                nlapiLogExecution('DEBUG', 'Master Scheduler', 'Job Ending With Message ' + result.errorMsg);
                //     setMasterJobStatus(jobId,'Ready');
            }
            else {


                if (result.infoMsg == 'Reschedule') {
                    nlapiLogExecution('DEBUG', 'Rescheduling ', ' i = ' + result.i);
                    params['custscript_internalid'] = result.i;
                    nlapiScheduleScript(SCRIPT_ID, SCRIPT_DEPLOYMENT_ID, params);
                    return true;
                }
            }

        } catch (ex) {

            // logEntry(jobId,'Error','Unexpected End with Error Message: ' + ex.toString());
        }
    } else {
        nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
    }
}

function syncCustomerMagento(sessionID, updateDate, configuration) {
    var customerXML = "";
    var customer = {};
    var responseMagento;
    var customers;
    var result = {};
    var context;
    var usageRemaining;
    var customerCount;
    var cols = [];
    var leadCreateAttemptResult;
    var enviornment = '';
    var paramInternalId = nlapiGetContext().getSetting('SCRIPT', 'custscript_internalid');
    try {
        result.errorMsg = '';
        result.infoMsg = '';
        nlapiLogExecution('DEBUG', 'inside');
        customerCount = getMagentoMaxCustomerIdNetsuite(enviornment);
        nlapiLogExecution('DEBUG', 'Count', customerCount);


        if (customerCount.errorMsg != '') {
            result.errorMsg = customerCount.errorMsg;
            return result;
        }

        customer.maxMagentoId = customerCount.data;
        customer.updateDate = updateDate;
        customerXML = getLoadCustomersXML(customer, sessionID);


        responseMagento = validateResponseCustomer(soapRequestToMagento(customerXML));

        if (responseMagento.status == false) {
            result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            return result;
        }

        customers = responseMagento.customers;

        if (customers != null)                                   // Move this customer createion code to connector_common_records.js to make it generalize
        {
            var magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;


            nlapiLogExecution('DEBUG', customers.length + ' Customer(s) Found for Processing ');

            for (var i = (paramInternalId == null) ? 0 : paramInternalId, k = 0; i < customers.length; i++, k++) {
                try {
                    var existingCustomerRecords;
                    var entityId = customers[i].firstname + ' ' + customers[i].middlename + customers[i].lastname;
                    var filterExpression;
                    nlapiLogExecution('DEBUG', 'Start Iterating on Customer: ' + entityId);
                    filterExpression = [ magentoCustomerId, 'is', customers[i].customer_id];

                    cols = [];

                    cols.push(new nlobjSearchColumn(magentoCustomerId));                        // Distinct the Parent
                    cols.push(new nlobjSearchColumn('email'));
                    cols.push(new nlobjSearchColumn('entityid'));

                    existingCustomerRecords = getRecords('customer', filterExpression, cols);

                    if (existingCustomerRecords != null) {
                        var CustIdInNS = existingCustomerRecords[0].getId();
                        nlapiLogExecution('Debug', 'Start Update Customer');
                        updateCustomerInNetSuite(CustIdInNS, customers[i], enviornment, sessionID);
                        nlapiLogExecution('Debug', 'End Update Customer  ' + i);
                    }
                    else {
                        nlapiLogExecution('Debug', 'existingCustomerRecords Found', 'length: ' + existingCustomerRecords);
                        nlapiLogExecution('Debug', 'No Existing Records', 'Create Lead without duplicate check');
                        nlapiLogExecution('DEBUG', 'Start Creating Lead');

                        leadCreateAttemptResult = createLeadInNetSuite(customers[i], '', sessionID);

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

                        nlapiLogExecution('DEBUG', 'End Creating Lead  -  ' + i);
                    }

                    // Write Code to handle Re-scheduling in case of going down than min Governance
                    context = nlapiGetContext();
                    usageRemaining = context.getRemainingUsage();

                    if (usageRemaining <= CUSTOMER_IMPORT_MIN_USAGELIMIT) {
                        result.infoMsg = 'Reschedule';
                        result.i = i;
                        return result;
                    }
                } catch (e) {
                    nlapiLogExecution('ERROR', 'error', e.toString());
                }
                context.setPercentComplete(Math.round(((100 * k) / customers.length) * 100) / 100);  // calculate the results

                // displays the percentage complete in the %Complete column on
                // the Scheduled Script Status page
                context.getPercentComplete();  // displays percentage complete
            }

        }

    }
    catch (ex) {
        result.errorMsg = ex.toString();
    }


    return result;

}

// Will only work when no product is associated with any category
function unSyncCustomers() {


}

function getLoadCustomersXML(customer, sessionID) {
    var customerXML;

    customerXML = XML_HEADER;
    customerXML = customerXML + '<urn:customerCustomerList>';
    customerXML = customerXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
    //  customerXML=customerXML+'<filters xsi:type="urn:filters">'
    //  customerXML=customerXML+'<filter SOAP-ENC:arrayType="urn:associativeEntity[0]" xsi:type="urn:associativeArray">';
    //  customerXML=customerXML+'</filter>';
    /*customerXML=customerXML+'<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
     customerXML=customerXML+'<item xsi:type="ns1:complexFilter">';
     customerXML=customerXML+'<key xsi:type="xsd:string">customer_id</key>';
     customerXML=customerXML+'<value xsi:type="ns1:associativeEntity">';
     customerXML=customerXML+'<key xsi:type="xsd:string">gt</key>';
     customerXML=customerXML+'<value xsi:type="xsd:string">'+customer.maxMagentoId+'</value>'
     customerXML=customerXML+'</value>';
     customerXML=customerXML+'</item>';
     customerXML=customerXML+'</complex_filter>';*/
    /*
     customerXML=customerXML+'<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
     customerXML=customerXML+'<item xsi:type="ns1:complexFilter">';
     customerXML=customerXML+'<key xsi:type="xsd:string">updated_at</key>';
     customerXML=customerXML+'<value xsi:type="ns1:associativeEntity">';
     customerXML=customerXML+'<key xsi:type="xsd:string">gt</key>';
     customerXML=customerXML+'<value xsi:type="xsd:string">'+customer.updateDate+'</value>'
     customerXML=customerXML+'</value>';
     customerXML=customerXML+'</item>';
     customerXML=customerXML+'</complex_filter>';  */
    //  customerXML=customerXML+'</filters>';
    customerXML = customerXML + '</urn:customerCustomerList>';
    customerXML = customerXML + XML_FOOTER;
    nlapiLogExecution('DEBUG', 'req', nlapiXMLToString(customerXML));
    return customerXML;

}

function validateResponseCustomer(xml) {

    nlapiLogExecution('Debug', 'validateResponse started');

    nlapiLogExecution('DEBUG', 'response', nlapiXMLToString(xml));

    var responseMagento = {};


    var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
    var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
    var customers = nlapiSelectNodes(xml, "//storeView/item");

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Category Delete Operation Faild', responseMagento.faultString);
    }
    else if (customers != null) {
        responseMagento.status = true;
        responseMagento.customers = tranformCustomerXMLtoArray(customers);
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Customer Import Operation Faild', responseMagento.faultString);

    }


    return responseMagento;

}

function tranformCustomerXMLtoArray(customers) {
    var result = [];
    var customer;
    var middleName;

    for (var i = 0; i < customers.length; i++) {
        customer = {};
        customer.customer_id = nlapiSelectValue(customers[i], 'customer_id');
        customer.email = nlapiSelectValue(customers[i], 'email');
        customer.firstname = nlapiSelectValue(customers[i], 'firstname');
        middleName = getBlankForNull(nlapiSelectValue(customers[i], 'middlename'));
        customer.middlename = middleName ? middleName + ' ' : '';
        customer.lastname = nlapiSelectValue(customers[i], 'lastname');
        customer.group_id = nlapiSelectValue(customers[i], 'group_id');
        customer.prefix = getBlankForNull(nlapiSelectValue(customers[i], 'prefix'));
        customer.suffix = nlapiSelectValue(customers[i], 'suffix');
        customer.dob = nlapiSelectValue(customers[i], 'dob');

        result.push(customer);
    }

    return result;
}

function printCustomers(cRecs) {

    var temp = '';
    for (var x = 0; x < cRecs.length; x++) {
        temp = temp + cRecs[x].id + '||' + cRecs[x].name + '||' + cRecs[x].level + '||' + cRecs[x].parent + '||' + cRecs[x].magentoParentID + '||' + cRecs[x].magentoID + '||---'
    }


    nlapiLogExecution('Debug', 'categories', temp);
}

function saveXML(xml) {

    /*

     var rec=nlapiCreateRecord(MAGENTO_MyRecordRecord.InternalId);
     rec.setFieldValue(MAGENTO_MyRecordRecord.FieldName.XML,xml);
     nlapiSubmitRecord(rec);

     */


}

function validateResponse(xml, operation) {

    //nlapiLogExecution('Debug','validateResponse started');

    saveXML(nlapiXMLToString(xml));

    var responseMagento = new Object();

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

    } else if (operation == 'product') {

        var products = nlapiSelectNodes(xml, "//items/item");
        var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        if (faultCode != null) {
            responseMagento.status = false;       // Means There is fault
            responseMagento.faultCode = faultCode;   // Fault Code
            responseMagento.faultString = faultString; //Fault String

        }
        else if (products != null) {
            //nlapiLogExecution('Debug','Products readed from XML');

            responseMagento.status = true;
            responseMagento.products = transformSalesOrderInfoXMLtoArray(products);
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

function transformSalesOrderListXMLtoArray(orders) {
    var result = new Array();
    var order;

    for (var i = 0; i < orders.length; i++) {

        order = new Object();
        order.increment_id = nlapiSelectValue(orders[i], 'increment_id');
        order.created_at = nlapiSelectValue(orders[i], 'created_at');
        order.customer_id = nlapiSelectValue(orders[i], 'customer_id');
        order.firstname = nlapiSelectValue(orders[i], 'firstname');
        order.lastname = nlapiSelectValue(orders[i], 'lastname');
        order.email = nlapiSelectValue(orders[i], 'customer_email');


        result[result.length] = order;


    }

    return result;
}

function transformSalesOrderInfoXMLtoArray(products) {
    var result = new Array();
    var product;

    for (var i = 0; i < products.length; i++) {
        product = new Object();

        //nlapiLogExecution('Debug','nlapiSelectValue(products[i],item_id)',nlapiSelectValue(products[i],'product_id'));

        // nlapiLogExecution('Debug','nlapiSelectValue(products[i],qty_ordered)',nlapiSelectValue(products[i],'qty_ordered'));

        product.product_id = nlapiSelectValue(products[i], 'product_id');
        product.qty_ordered = nlapiSelectValue(products[i], 'qty_ordered');

        result[result.length] = product;

    }

    return result;
}

function getSalesOrderListByCustomerXML(customerId, sessionID) {
    var soXML;

    soXML = XML_HEADER;
    soXML = soXML + '<urn:salesOrderList>';

    soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';

    soXML = soXML + '<filters xsi:type="urn:filters">'
    soXML = soXML + '<filter SOAP-ENC:arrayType="urn:associativeEntity[0]" xsi:type="urn:associativeArray">';
    soXML = soXML + '</filter>';
    soXML = soXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
    soXML = soXML + '<item xsi:type="ns1:complexFilter">';
    soXML = soXML + '<key xsi:type="xsd:string">customer_id</key>';
    soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
    soXML = soXML + '<key xsi:type="xsd:string">eq</key>';
    soXML = soXML + '<value xsi:type="xsd:string">' + customerId + '</value>'

    soXML = soXML + '</value>';
    soXML = soXML + '</item>';
    soXML = soXML + '</complex_filter>';
    soXML = soXML + '</filters>';

    soXML = soXML + '</urn:salesOrderList>';
    soXML = soXML + XML_FOOTER;

    saveXML(soXML);

    return soXML;

}