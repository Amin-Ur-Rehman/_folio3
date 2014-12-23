/**
 * Created by zahmed on 14-Oct-14.
 */

// Ceating parent items as configurable in Magento
// getting items with status 10 from customer record
// set status to 20 and Assign related products to the magento items

var context = nlapiGetContext();

function getItemType(id) {
    if (!!id) {
        var result = nlapiSearchRecord('item', null, new nlobjSearchFilter('internalid', null, 'anyof', [id])) || [];
        if (result.length > 0) {
            return result[0].getRecordType();
        }
    }
    return null;
}

// getting all the item having status zero or empty and those are matrix child items
function getItemsToExport() {
    var records = [];
    try {
        records = nlapiSearchRecord(null, ItemConstant.SavedSearch.MatrixParentSyncStatus) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'getItemsToExport', e.toString());
    }
    return records;
}

function getRelatedItems(itemType, itemId) {
    var itemsArr = [];
    try {
        var rec = nlapiLoadRecord(itemType, itemId);
        var relatedItemsCount = rec.getLineItemCount('presentationitem');
        for (var line = 1; line <= relatedItemsCount; line++) {
            var id = rec.getLineItemValue('presentationitem', 'item', line);
            if (itemsArr.indexOf(id) === -1) {
                itemsArr.push(id);
            }
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'getRelatedItems', e.toString());
    }
    return itemsArr;
}

function getRelatedItemsData(relatedItems) {
    var fils = [];
    var result = [];

    try {
        fils.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.ParentMatrixItem, null, 'anyof', relatedItems));
        result = MatrixParentSyncStatus.lookup(fils);
    } catch (e) {
        nlapiLogExecution('ERROR', 'getRelatedItemsSku', e.toString());
    }
    return result;
}
function getProductLinkXML(dataObj, sessionID) {
    var xml = '';

    xml += XML_HEADER;
    xml += '<urn:catalogProductLinkAssign soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    xml += '    <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionID + '</sessionId>';
    xml += '    <type xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + dataObj.type + '</type>';
    xml += '    <product xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + dataObj.product + '</product>';
    xml += '    <linkedProduct xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + dataObj.linkedProduct + '</linkedProduct>';
    xml += '    <data xsi:type="urn:catalogProductLinkEntity" xs:type="type:catalogProductLinkEntity" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
    xml += '    </data>';
    xml += '    <identifierType xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + dataObj.identifierType + '</identifierType>';
    xml += '</urn:catalogProductLinkAssign>';
    xml += XML_FOOTER;

    return xml;
}

function validateProductLinkedResponse(xml) {
    var responseMagento = {};
    var magentoItemID;
    var faultCode;
    var faultString;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductLinkAssignResponse/result");
    } catch (ex) {
    }

    if (!!faultCode) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Item Linking Operation Failed', responseMagento.faultString);
    }
    else if (!!magentoItemID) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = eval(magentoItemID);
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Item Linking Operation Failed', responseMagento.faultString);

    }

    return responseMagento;
}

function syncItemToMagento(itemRec, sessionID) {
    var itemId = itemRec.getValue(MatrixParentSyncStatus.FieldName.ParentMatrixItem);
    var itemType = getItemType(itemId);
    var productSku = itemRec.getValue(MatrixParentSyncStatus.FieldName.MagentoSku);

    var relatedItems = getRelatedItems(itemType, itemId);
    if (relatedItems.length > 0) {
        var relatedItemsData = getRelatedItemsData(relatedItems);
        for (var i in relatedItemsData) {
            var relatedItemData = relatedItemsData[i];
            var sku = relatedItemData.getValue(MatrixParentSyncStatus.FieldName.MagentoSku);

            var data = {};
            data.type = 'related';
            data.product = productSku;
            data.linkedProduct = sku;
            data.identifierType = 'sku';

            var productLinkXML = getProductLinkXML(data, sessionID);

            var responseMagento = validateProductLinkedResponse(soapRequestToMagento(productLinkXML));
            if (!responseMagento.status) {
                var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                var msg = 'Item having NS Id: ' + itemId + ' has not linked. -- ' + errMsg;
                nlapiLogExecution("ERROR", " Error From Magento " + msg);
            } else {
                var result = responseMagento.result;

                if (result) {
                    nlapiLogExecution("DEBUG", 'ITEM LINKED IN MAGENTO', 'SUCCESSFULLY - ' + JSON.stringify(data));
                    var obj = {};
                    obj[MatrixParentSyncStatus.FieldName.MagentoSyncStatus] = '20';
                    MatrixParentSyncStatus.upsert(obj, itemRec.getId());
                    nlapiLogExecution("DEBUG", 'CUSTOM RECORD UPDATED IN NETSUITE SUCCESSFULLY', '');
                }
            }

        }
    }
}

function scheduled(type) {
    try {
        if (MC_SYNC_CONSTANTS.isValidLicense()) {
            URL = ItemConstant.MagentoCred.SoapUrl;
            var webserviceid = ItemConstant.MagentoCred.UserName;
            var webservicepw = ItemConstant.MagentoCred.Password;
            var sessionID;
            var startTime;
            var endTime;
            var minutes;

            startTime = (new Date()).getTime();

            // Fetching session
            var sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
            if (sessionObj === null) {
                return false;
            }
            if (sessionObj.errorMsg === '') {
                sessionID = sessionObj.data;
            } else {
                nlapiLogExecution('ERROR', 'Error in Getting login session', sessionObj);
                return false;
            }
            // End Getting Session

            var itemsToExport = getItemsToExport();
            for (var i in itemsToExport) {
                var itemRec = itemsToExport[i];
                syncItemToMagento(itemRec, sessionID);
                if (context.getRemainingUsage() < 5000) {
                    nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                    return;
                }
                endTime = (new Date()).getTime();
                minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
                nlapiLogExecution('DEBUG', 'Time Elapsed', 'Minutes: ' + minutes);
                // if script run time greater than 50 mins then reshedule the script to prevent time limit exceed error
                if (minutes > 50) {
                    nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Time Elapsed: ' + minutes);
                    nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                    return;
                }
            }
        } else {
            nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'scheduled', e.toString());
    }
}