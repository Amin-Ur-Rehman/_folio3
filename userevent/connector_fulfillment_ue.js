//var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';

var magentoIdId = 'custbody_magentoshipmentid';
var magentoSO;
var magentoItemIds;
//var cyberSouceConfig = getCyberSourceConfiguration();
//var csResponse = null;

function validateTrackingCreateResponse(xml, operation) {
    nlapiLogExecution('AUDIT', 'XML', nlapiEscapeXML(xml));
    var responseMagento = {};
    var magentoFulfillmentID;
    var faultCode;
    var faultString;


    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        //  if (operation=='create')
        magentoFulfillmentID = nlapiSelectValue(xml, "//result");
        //else if (operation=='update')
        //magentoFulfillmentID= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


    } catch (ex) {
    }


    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Tracking Number Add Operation Failed', responseMagento.faultString + ' - ' + responseMagento.faultCode);
        generateErrorEmail('Tracking Number Add Operation Failed  ' + responseMagento.faultString, '', 'order');
    }
    else if (magentoFulfillmentID != null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = magentoFulfillmentID;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Tracking Number Add Operation Failed', responseMagento.faultString + ' - ' + responseMagento.faultCode);
        generateErrorEmail('Tracking Number Add Operation Failed ' + responseMagento.faultString, '', 'order');

    }

    return responseMagento;
}

function getCreateFulfillmentXML(sessionID) {
    nlapiLogExecution('DEBUG', 'Enter in getCreateFulfillmentXML() fun');
    var itemsQuantity = nlapiGetLineItemCount('item');
    var shipmentXML;

    shipmentXML = XML_HEADER + '<urn:salesOrderShipmentCreate>';
    shipmentXML = shipmentXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
    shipmentXML = shipmentXML + '<orderIncrementId urn:type="xsd:string">' + magentoSOID + '</orderIncrementId>';
    shipmentXML = shipmentXML + '<itemsQty  SOAP-ENC:arrayType="urn:orderItemIdQtyArray[' + itemsQuantity + ']" xsi:type="urn:orderItemIdQty">';
    nlapiLogExecution('AUDIT', 'xml', nlapiEscapeXML(shipmentXML));

    var comment = '';
    for (var line = 1; line <= itemsQuantity; line++) {
        // magentoItemIds is a global object contains the magento item id
        var itemId = magentoItemIds[nlapiGetLineItemValue('item', 'item', line)];
        var itemQty = nlapiGetLineItemValue('item', 'quantity', line);
        if (nlapiGetLineItemValue('item', 'isserialitem', 1) == 'T') {
            comment = comment + ',' + nlapiGetLineItemValue('item', 'itemdescription', line) + '=' + nlapiGetLineItemValue('item', 'serialnumbers', line);
        }
        else {
            comment = '-';
        }

        nlapiLogExecution('AUDIT', 'xml', nlapiEscapeXML(shipmentXML));
        shipmentXML = shipmentXML + '<item xsi:type="urn:orderItemIdQty">    ';
        shipmentXML = shipmentXML + '<order_item_id type="xsd:int">' + itemId + '</order_item_id>';
        shipmentXML = shipmentXML + '<qty type="xsd:double">' + itemQty + '</qty>';
        shipmentXML = shipmentXML + '</item>';
        nlapiLogExecution('AUDIT', 'Quantity', itemId);
        nlapiLogExecution('AUDIT', 'Quantity', itemQty);
        nlapiLogExecution('AUDIT', 'xml', nlapiEscapeXML(shipmentXML));
    }


    shipmentXML = shipmentXML + '</itemsQty>';
    shipmentXML = shipmentXML + ' <comment xsi:type="xsd:string">' + comment + '</comment>';
    shipmentXML = shipmentXML + '</urn:salesOrderShipmentCreate>';

    shipmentXML = shipmentXML + XML_FOOTER;

    nlapiLogExecution('DEBUG', 'Exit from getCreateFulfillmentXML() funciton');

    return shipmentXML;

}

function createTrackingXML(id, carrier, carrierText, tracking, sessionID) {
    // Add TrackingNum for shipment - XML
    var tShipmentXML = '';
    tShipmentXML = XML_HEADER;
    tShipmentXML = tShipmentXML + '<urn:salesOrderShipmentAddTrack soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    tShipmentXML = tShipmentXML + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>'
    tShipmentXML = tShipmentXML + '<shipmentIncrementId xsi:type="xsd:string">' + id + '</shipmentIncrementId>';

    //if (carrierText.split(' ')[0] == 'UPS') {
    tShipmentXML = tShipmentXML + '<carrier xsi:type="xsd:string">' + 'ups' + '</carrier>';
    //}
    /*else {
     tShipmentXML = tShipmentXML + '<carrier xsi:type="xsd:string">' + 'usps' + '</carrier>';
     }*/

    tShipmentXML = tShipmentXML + '<title xsi:type="xsd:string">' + carrierText + '</title>';
    tShipmentXML = tShipmentXML + '<trackNumber xsi:type="xsd:string">' + tracking + '</trackNumber>';
    tShipmentXML = tShipmentXML + '</urn:salesOrderShipmentAddTrack>';
    tShipmentXML = tShipmentXML + XML_FOOTER;
    nlapiLogExecution('AUDIT', 'XML', nlapiEscapeXML(tShipmentXML));
    return tShipmentXML;
}

function validateFulfillmentExportResponse(xml, operation) {
    var responseMagento = {};
    var magentoFulfillmentID;
    var faultCode;
    var faultString;


    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        //  if (operation=='create')
        magentoFulfillmentID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:salesOrderShipmentCreateResponse/shipmentIncrementId");
        //else if (operation=='update')
        //magentoFulfillmentID= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


    } catch (ex) {
    }


    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Fulfillment Export Operation Failed', responseMagento.faultString);
        generateErrorEmail('Fulfilment couldnt get to Magento , Please convey this to folio3 : ' + responseMagento.faultString, '', 'order');
    }
    else if (magentoFulfillmentID != null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = magentoFulfillmentID;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Fulfillment Export Operation Failed', responseMagento.faultString);
        generateErrorEmail('Fulfilment couldnt get to Magento , Please convey this to folio3 : ' + responseMagento.faultString, '', 'order');

    }

    return responseMagento;
}

function syncFulfillmentsMagento(sessionID, jobId, enviornment) {
    var cRecs;
    var fulfillmentXML;
    var responseMagento;
    var result = {};
    var operation;
    var ctx = nlapiGetContext();
    var rectype = nlapiGetRecordType();

    if (!nlapiGetFieldValue(magentoIdId)) {
        fulfillmentXML = getCreateFulfillmentXML(sessionID);
        nlapiLogExecution('DEBUG', 'XML', 'EOS ' + fulfillmentXML);
    }

    responseMagento = validateFulfillmentExportResponse(soapRequestToMagento(fulfillmentXML));           // soapRequestToMagento Function in accessMagento.js
    //captureCreditCard();

    if (responseMagento.status === false) {
        nlapiLogExecution('AUDIT', 'Error', 'Export fulfillment record -- ID: ' + '--' + responseMagento.faultCode + '--' + responseMagento.faultString);

        return;
    }
    else {
        nlapiLogExecution('AUDIT', 'set magento shipment id', 'Im Setting ID ' + responseMagento.result);
        //nlapiSetFieldValue('custbody_magentoshipmentid', responseMagento.result);

        // from SO
        var carrier = magentoSO.getFieldValue('shipcarrier');
        var totalPackages = nlapiGetLineItemCount('package');
        var carrierText = magentoSO.getFieldText('shipmethod');

        nlapiLogExecution('DEBUG', 'carrier', carrier);
        nlapiLogExecution('DEBUG', 'totalPackages', totalPackages);
        nlapiLogExecution('DEBUG', 'carrierText', carrierText);

        for (var p = 1; p <= totalPackages; p++) {
            var tracking = nlapiGetLineItemValue('package', 'packagetrackingnumber', p);
            if (isBlankOrNull(tracking)) {
                tracking = 0;
            }
            // Setting Tracking Number
            var trackingXML = createTrackingXML(responseMagento.result, carrier, carrierText, tracking, sessionID);
            responseTracking = validateTrackingCreateResponse(soapRequestToMagento(trackingXML));
            nlapiLogExecution('AUDIT', 'CHECK', 'I tried setting shipment tracking id Got this in response : ' + responseTracking.result);
        }
        //capture
        //captureCreditCard();
    }


    return responseMagento;
}

function createInvoice2(id) {
    var result = {};
    var rec;

    result.errorMsg = '';

    try {
        rec = nlapiTransformRecord('salesorder', id, 'invoice');
        result.invoiceId = nlapiSubmitRecord(rec);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Creating Invoice', ex.message);
        result.errorMsg = 'Creating Invoice -- ' + ex.message;
        return result;
    }
    return result;
}

function createCustomerPayment2(id) {
    var result = {};
    var rec;

    result.errorMsg = '';

    try {
        rec = nlapiTransformRecord('invoice', id, 'customerpayment');

        result.customerPaymentId = nlapiSubmitRecord(rec);

    } catch (ex) {
        nlapiLogExecution('ERROR', 'Creating Customer Payment', ex.message);
        result.errorMsg = 'Creating Customer Payment -- ' + ex.message;
        return result;
    }
    return result;
}

function getUpdateFulfillmentXML(fulfillmentId, sessionID) {
    nlapiLogExecution('DEBUG', 'Enter in getUpdateFulfillmentXML() funciton', 'fulfillmentId: ' + fulfillmentId);

    var xml = '';

    nlapiLogExecution('DEBUG', 'Exit from getUpdateFulfillmentXML() funciton', 'fulfillmentId: ' + fulfillmentId);

    return xml;

}

function printItems(cRecs) {

    var temp = '';
    for (var x = 0; x < cRecs.length; x++) {
        temp = temp + cRecs[x].internalId + '||' + cRecs[x].name + '||' + cRecs[x].description + '||' + cRecs[x].magentoCategoryId + '||---';
    }


    nlapiLogExecution('Debug', 'Item', temp);
}

function setShipmentIdInFulFillment(shipmentId) {
    var rec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
    rec.setFieldValue('custbody_magentoshipmentid', shipmentId + '');
    //rec.setFieldValue('custbody_cs_response', csResponse);// saving magento response for verification
    nlapiSubmitRecord(rec);
}

function startup(type) {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        try {
            if (type.toString() === 'create') {
                magentoItemIds = getMagentoItemIds();
                var orderId = nlapiGetFieldValue('orderid');

                var recType = getRecordTypeOfTransaction(orderId);

                if (recType + '' === 'salesorder') {

                    magentoSO = nlapiLoadRecord('salesorder', orderId);

                    var context = nlapiGetContext();
                    URL = MGCONFIG.WebService.EndPoint;
                    var webserviceid = MGCONFIG.WebService.UserName;
                    var webservicepw = MGCONFIG.WebService.Password;
                    var sofrequency = '4';
                    var soprice = '1';
                    magentoSOID = magentoSO.getFieldValue('custbody_magentoid');

                    if (!isBlankOrNull(magentoSOID)) {
                        sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);

                        nlapiLogExecution('Debug', 'sessionObj.data', sessionObj.data);
                        nlapiLogExecution('Debug', 'sessionObj.errorMsg', sessionObj.errorMsg);

                        if (!isBlankOrNull(sessionObj)) {
                            if (sessionObj.errorMsg.toString() === '') {
                                nlapiLogExecution('Debug', 'Inside if sessionObj.errorMsg');
                                sessionID = sessionObj.data;

                                nlapiLogExecution('AUDIT', 'SyncItem', 'Start Fulfillment Sync');
                                var response = syncFulfillmentsMagento(sessionID, 1, '');

                                if (response) {
                                    setShipmentIdInFulFillment(response.result);
                                }

                                nlapiLogExecution('AUDIT', 'THE END MOVE TO MAKE PAYMENT & INVOICE');
                            }
                            else {
                                nlapiLogExecution('AUDIT', 'Session', 'Error in Session Creating With Message' + sessionObj.errorMsg);
                            }
                        } else {
                            nlapiLogExecution('AUDIT', 'Session', 'Session Object is null');
                        }
                    }
                }
            }
        } catch (ex) {
            nlapiLogExecution('ERROR', 'startup - after submit', ex.toString());
        }
    } else {
        nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
    }
}


function getCyberSourceCaptureXML() {
    // required merchant id, secret key, refrence code, items and quantity mapping, currency, authentication id

    var xml = '';
    xml += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:schemas-cybersource-com:transaction-data-1.104">';
    xml += '    <soapenv:Header>';
    xml += '        <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">';
    xml += '            <wsse:UsernameToken>';
    xml += '                <wsse:Username>' + cyberSouceConfig.merchantId + '</wsse:Username>';
    xml += '                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wssusername-token-profile-1.0#PasswordText">' + cyberSouceConfig.secretId + '</wsse:Password>';
    xml += '            </wsse:UsernameToken>';
    xml += '        </wsse:Security>';
    xml += '    </soapenv:Header>';
    xml += '    <soapenv:Body>';
    xml += '        <urn:requestMessage xmlns="urn:schemas-cybersource-com:transaction-data-1.104">';
    xml += '            <urn:merchantID>' + cyberSouceConfig.merchantId + '</urn:merchantID>';
    var soId = magentoSO.getFieldValue('custbody_magentoid');
    xml += '           <urn:merchantReferenceCode>' + soId + '</urn:merchantReferenceCode>';

    //xml += '<urn:clientApplication>Credit Card Settlement</urn:clientApplication>';

    // magentoItemIds is a global object contains the magento item id
    var itemId = '0';
    var itemQty = '1';
    var unitPrice = magentoSO.getFieldValue('total');
    xml += '            <urn:item id="' + itemId + '">';
    xml += '                <urn:unitPrice>' + unitPrice + '</urn:unitPrice>';
    xml += '                <urn:quantity>' + itemQty + '</urn:quantity>';
    xml += '            </urn:item>';

    xml += '            <urn:purchaseTotals>';
    xml += '                <urn:currency>USD</urn:currency>';
    xml += '            </urn:purchaseTotals>';

    xml += '<urn:ccCaptureService run="true">';
    xml += '<urn:authRequestID>' + magentoSO.getFieldValue('pnrefnum') + '</urn:authRequestID>';
    xml += '</urn:ccCaptureService>';

    xml += '        </urn:requestMessage>';
    xml += '    </soapenv:Body>';
    xml += '</soapenv:Envelope>';

    return xml;
}


function objectSize(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key))
            size++;
    }
    return size;
}

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
}

// get array of items exist in fulfillment
function getFulfillmentItems() {
    var itemsIdArr = [];
    var itemsQuantity = nlapiGetLineItemCount('item');
    for (var line = 1; line <= itemsQuantity; line++) {
        var itemId = nlapiGetLineItemValue('item', 'item', line);
        if (itemsIdArr.indexOf(itemId) === -1) {
            itemsIdArr.push(itemId);
        }
    }
    return itemsIdArr;
}

// get magento item ids mapping
function getMagentoItemIds() {
    var magentoItemIds = {};
    // get all items data exist in fulfillment
    var fulfillmentItems = getFulfillmentItems();

    var fils = [];
    var cols = [];
    var result;

    fils.push(new nlobjSearchFilter('internalid', null, 'anyof', fulfillmentItems));
    cols.push(new nlobjSearchColumn('custitem_magentoid'));

    result = nlapiSearchRecord('item', null, fils, cols);

    if (result && result.length > 0) {
        for (var i in result) {
            var magentoId = result[i].getValue('custitem_magentoid') || '';
            magentoItemIds[result[i].getId()] = magentoId;
        }
    }
    return magentoItemIds;
}

function isValidResponse(resXML) {
    var faultCode = nlapiSelectValue(resXML, "soap:Envelope/soap:Body/soap:Fault/faultcode");
    var faultString = nlapiSelectValue(resXML, "soap:Envelope/soap:Body/soap:Fault/faultstring");

    if (faultCode) {
        nlapiLogExecution('ERROR', 'isValidResponse - faultCode: ' + faultCode, 'faultString: ' + faultString);
        return false;
    }

    return true;
}

function getCaptureCreditCardRes(resXML) {
    //TODO: update if required
    var resObj = {};
    var replyMsg = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage");
    var purchaseTotal = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage/c:purchaseTotals");
    var ccCaptureReply = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage/c:ccCaptureReply");

    resObj.merchantReferenceCode = nlapiSelectValue(replyMsg, 'c:merchantReferenceCode');
    resObj.requestID = nlapiSelectValue(replyMsg, 'c:requestID');
    resObj.decision = nlapiSelectValue(replyMsg, 'c:decision');
    resObj.reasonCode = nlapiSelectValue(replyMsg, 'c:reasonCode');
    resObj.requestToken = nlapiSelectValue(replyMsg, 'c:requestToken');

    resObj.purchaseTotals = {};
    resObj.purchaseTotals.currency = nlapiSelectValue(purchaseTotal, 'c:currency');

    resObj.ccCaptureReply = {};
    resObj.ccCaptureReply.reasonCode = nlapiSelectValue(ccCaptureReply, 'c:reasonCode');
    resObj.ccCaptureReply.requestDateTime = nlapiSelectValue(ccCaptureReply, 'c:requestDateTime');
    resObj.ccCaptureReply.amount = nlapiSelectValue(ccCaptureReply, 'c:amount');
    resObj.ccCaptureReply.reconciliationID = nlapiSelectValue(ccCaptureReply, 'c:reconciliationID');

    return resObj;
}

function captureCreditCard() {
    nlapiLogExecution('DEBUG', 'In captureCreditCard()');
    var xml = getCyberSourceCaptureXML();
    nlapiLogExecution('DEBUG', 'get request xml from getCyberSourceCaptureXML()', xml);
    var resXML = soapRequestToCS(xml);
    nlapiLogExecution('DEBUG', 'get response xml from cybersource' + nlapiXMLToString(resXML));

    csResponse = resXML;
    /*if (isValidResponse(resXML)) {
     var captureCreditCardRes = getCaptureCreditCardRes(resXML);
     nlapiLogExecution('DEBUG', 'captureCreditCardRes', JSON.stringify(captureCreditCardRes));
     // set values in fulfillment ???
     }*/
    nlapiLogExecution('DEBUG', 'Out captureCreditCard()');
}

function soapRequestToCS(xml) {
    var res = nlapiRequestURL('https://ics2wstest.ic3.com/commerce/1.x/transactionProcessor/CyberSourceTransaction_1.104.wsdl', xml);
    var responseXML = res.getBody();
    return responseXML;
}

function getRecordTypeOfTransaction(id) {
    var type = null;
    if (id) {
        var fils = [];
        fils.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));
        fils.push(new nlobjSearchFilter('internalid', null, 'anyof', [id]));

        var result = nlapiSearchRecord('transaction', null, fils, null);

        if (result && result.length > 0) {
            type = result[0].getRecordType();
        }
    }
    return type;
}