/**
 * Created by zahmed on 14-Oct-14.
 */

// Ceating parent items as configurable in Magento
// getting items with status 10 from customer record
// set status to 30 after adding tier pricing if found

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

// getting all the item having magento sync to true
function getItemsToUpdate() {
    var records = [];
    try {
        records = nlapiSearchRecord(null, ItemConstant.SavedSearch.MatrixItemsForTierPricing) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'getItemsToUpdate', e.toString());
    }
    return records;
}

function getUpdateTierXML(arrTiers, sessionID, productID, identifierType) {
    var xml = '';
    xml = xml + XML_HEADER;
    xml = xml + '<urn:catalogProductAttributeTierPriceUpdate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    xml = xml + '<sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionID + '</sessionId>';
    xml = xml + '<product xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + productID + '</product>';
    xml = xml + '<tier_price xsi:type="urn:catalogProductTierPriceEntityArray" soapenc:arrayType="urn:catalogProductTierPriceEntity[' + arrTiers.length + ']">';
    for (var tier in    arrTiers) {
        xml = xml + '<item>';
        xml = xml + '<qty xsi:type="xsd:int">' + tier + '</qty>';
        xml = xml + '<price xsi:type="xsd:double">' + arrTiers[tier] + '</price>';
        xml = xml + '</item>';
    }
    xml = xml + '</tier_price>';
    xml = xml + '<identifierType xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + identifierType + '</identifierType>';
    xml = xml + '</urn:catalogProductAttributeTierPriceUpdate>';
    xml = xml + XML_FOOTER;

    return xml;
}

function validateItemUpdateResponse(xml) {
    var responseMagento = {};
    var faultCode;
    var faultString;
    var result;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        result = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductAttributeTierPriceUpdateResponse/result");
    } catch (ex) {
    }

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Item Tier Price Update Operation Faild', responseMagento.faultString);
    }
    else if (result !== null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = result;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Item Tier Price Update Operation Faild', responseMagento.faultString);

    }
    return responseMagento;
}

function updateTierPrices(arrTiers, sessionID, magentoSku, rec, type) {
    var itemUpdateItemXML = getUpdateTierXML(arrTiers, sessionID, magentoSku, 'sku');
    var responseMagento = validateItemUpdateResponse(soapRequestToMagento(itemUpdateItemXML));
    // If due to some reason Magento item is unable to update
    // Send Email Magento Side error
    if (responseMagento.status == false) {
        var msg = 'Item having Magento Sku Id: ' + magentoSku + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
        nlapiLogExecution("EMERGENCY", msg);
        nlapiLogExecution("EMERGENCY", 'Error From Magento');
        return;
    }
    else {
        // Updated Successfully
        var data;
        if (type === 'custom') {
            data = {};
            data[MatrixParentSyncStatus.FieldName.MagentoSyncStatus] = '30';
            MatrixParentSyncStatus.upsert(data, rec.getId());
        } else {
            var fields = [ ItemConstant.Fields.MagentoSyncStatus, ItemConstant.Fields.ItemSync];
            data = ['30', 'F'];
            nlapiSubmitField(rec.getRecordType(), rec.getId(), fields, data);
        }

        nlapiLogExecution("DEBUG", 'Item Update Successfully', 'Magento Sku Id: ' + magentoSku);
    }
}

function syncItemToMagento(itemId, sessionID) {
    var itemType = getItemType(itemId);

    var itemRec = nlapiLoadRecord(itemType, itemId);
    var matrixType = itemRec.getFieldValue('matrixtype');
    var magentoSku = itemRec.getFieldValue(ItemConstant.Fields.MagentoSku);

    // Check the features enabled in the account. See Pricing Sublist Feature Dependencies for
    // details on why this is important.
    var multiCurrency = nlapiGetContext().getFeature('MULTICURRENCY');
    var multiPrice = nlapiGetContext().getFeature('MULTPRICE');
    var quantityPricing = nlapiGetContext().getFeature('QUANTITYPRICING');

    multiCurrency = !!(multiCurrency === 'T' || multiCurrency === true);
    multiPrice = !!(multiPrice === 'T' || multiPrice === true);
    quantityPricing = !!(quantityPricing === 'T' || quantityPricing === true);

    // Set the name of the Price sublist based on features enabled and currency type.
    // See Pricing Sublist Internal IDs for details on why this is important.
    var priceID;
    var currencyID = "GBP";
    var priceLevel = 1; //base price level id

    // Set the ID for the sublist and the price field. Note that if all pricing-related features
    // are disabled, you will set the price in the rate field. See Pricing Sublist Feature Dependencies
    // for details.
    if (!multiCurrency && !multiPrice && !quantityPricing) {
        priceID = "rate";
    }
    else {
        priceID = "price";
        if (multiCurrency) {
            var internalId = nlapiSearchRecord('currency', null, new nlobjSearchFilter('symbol', null, 'contains', currencyID))[0].getId();

            // Append the currency ID to the sublist name
            priceID = priceID + internalId;
        }
    }

    var qtyLevelArr = [2, 3, 4, 5];
    var priceField = itemRec.getLineItemValue(priceID, 'pricelevel', priceLevel);

    var arrTiers = [];

    for (var i in qtyLevelArr) {
        var level = qtyLevelArr[i];

        // update tier price it tiers exist
        if (!!itemRec.getMatrixValue(priceID, 'price', level)) {
            var quantity = itemRec.getMatrixValue(priceID, 'price', level);
            var price = itemRec.getLineItemValue(priceID, 'price_' + level + '_', priceField);
            arrTiers[quantity] = price;
        }
    }
    nlapiLogExecution('DEBUG', 'CHECK', JSON.stringify(arrTiers));

    if (matrixType === 'PARENT') {
        var fils = [];
        fils.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.ParentMatrixItem, null, 'anyof', [itemId], null));
        fils.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.MagentoSyncStatus, null, 'isnotempty', null, null));
        var configItems = MatrixParentSyncStatus.lookup(fils);
        if (configItems.length > 0) {
            for (var i in configItems) {
                var configItem = configItems[i];
                var sku = configItem.getValue(MatrixParentSyncStatus.FieldName.MagentoSku);
                updateTierPrices(arrTiers, sessionID, sku, configItem, 'custom');
            }
        }
    } else {
        updateTierPrices(arrTiers, sessionID, magentoSku, itemRec, 'standard');
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

            var itemsToExport = getItemsToUpdate();
            for (var i in itemsToExport) {
                var itemId = itemsToExport[i].getValue('internalid', null, 'GROUP');
                syncItemToMagento(itemId, sessionID);
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

