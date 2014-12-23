/**
 * Created by zahmed on 14-Oct-14.
 */

// getting items with status 0 or empty
// set status to 10 and create & set Main Body Fields

var context = nlapiGetContext();

function getItemBodyFieldsData(itemRec, parItemRec) {
    var dataObj = {};
    dataObj.additionalAttributes = [];

    dataObj.magentoId = itemRec.getValue(ItemConstant.Fields.MagentoId);
    dataObj.type = getMagentoItemType(itemRec, 'CHILD');
    dataObj.attributeSet = Store.attributeSet;
    dataObj.storeViewId = Store.storeView;
    dataObj.websiteId = Store.websiteId;

    dataObj.categories = getItemCategories(parItemRec);

    var colorPart = itemRec.getText(ItemConstant.Fields.Color) || '';
    if (colorPart) {
        colorPart = ' - ' + colorPart;
    }

    var name = itemRec.getValue('storedisplayname', 'parent') + colorPart;

    dataObj.name = nlapiEscapeXML(removeAsteric(name));
    var storeDescription = itemRec.getValue('storedescription', 'parent') || '';
    var storeDetailDescription = itemRec.getValue('storedetaileddescription', 'parent') || '';
    var lineBreakStr = '';
    if (storeDescription && storeDetailDescription) {
        lineBreakStr = lineBreak(1);
    }
    dataObj.description = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
    dataObj.shortDescription = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
    dataObj.urlComponent = nlapiEscapeXML(itemRec.getValue('urlcomponent', 'parent'));
    dataObj.metaTitle = nlapiEscapeXML(itemRec.getValue('pagetitle', 'parent'));
    dataObj.metaKeywords = nlapiEscapeXML(itemRec.getValue('searchkeywords', 'parent'));
    dataObj.metaDescription = dataObj.shortDescription;

    var itemId = (itemRec.getValue('itemid') + '');
    itemId = itemId.substring(itemId.indexOf(': ') + 2);
    dataObj.sku = nlapiEscapeXML(itemId);

    dataObj.weight = itemRec.getValue('weight') || 0;

    dataObj.price = itemRec.getValue('unitprice', 'pricing') || 0;// base price, soprice = 1, price1 = GBP
    //dataObj.quantity = itemRec.getValue('locationquantityonhand') || 0;// Goddiva Warehouse Main : Goddiva
    dataObj.quantity = itemRec.getValue('locationquantityavailable') || 0;// Goddiva Warehouse Main : Goddiva

    var color = getColor(itemRec.getText(ItemConstant.Fields.Color));// colour
    if (!!color) {
        dataObj.additionalAttributes.push({key: Store.Attributes.Color, value: color});
        //dataObj.additionalAttributes.push({key: 'color', value: color});//test
    }

    var size = getSize(itemRec.getText(ItemConstant.Fields.SizeUk) || itemRec.getText(ItemConstant.Fields.Size));
    if (!!size) {
        dataObj.additionalAttributes.push({key: Store.Attributes.Size, value: size});
        //dataObj.additionalAttributes.push({key: 'size', value: size});//test
    }

    var wasPrice = itemRec.getValue(ItemConstant.Fields.WasPrice) || 0;// WAS Price
    if (!!wasPrice) {
        dataObj.additionalAttributes.push({key: Store.Attributes.WasPrice, value: wasPrice});
    }

    //dataObj.customDesign = nlapiEscapeXML('default'); // test
    dataObj.customDesign = nlapiEscapeXML('default/goddiva'); // goddiva

    var displayInWebsite = itemRec.getValue('isonline') === 'T';
    var isInactive = itemRec.getValue('isinactive') === 'T';
    if (isInactive) {
        dataObj.status = '2'; // Disabled
    } else {
        dataObj.status = '1'; // Enabled
    }

    if (displayInWebsite) {
        dataObj.visibility = '4'; //Catalog, Search / visible
    } else {
        dataObj.visibility = '1'; // Not visible
    }

    dataObj.visibility = '1'; // Not visible for test todo:remove

    //dataObj.status = '2'; // Disabled for test todo:remove

    dataObj.taxClass = '4';// Shipping
    dataObj.manageStock = '1';// manage stock
    dataObj.stockAvailability = '1';// is in stock
    dataObj.useConfigManageStock = '0';// use config manage stock

    return dataObj;
}

function syncItemToMagento(itemRec, sessionID) {
    var itemId = itemRec.getId();
    var itemType = itemRec.getRecordType();
    var itemParentId = itemRec.getValue('parent');
    var itemParentRec;
    if (!!itemParentId) {
        itemParentRec = nlapiLoadRecord(itemType, itemParentId);
    }

    // check if item already sync with magento
    var isSync = checkIfAlreadySync(itemType, itemId, sessionID, null, 'CHILD');

    // TODO: generalized
    var itemBodyFieldsData = getItemBodyFieldsData(itemRec, itemParentRec);
    //nlapiLogExecution("DEBUG", 'itemBodyFieldsData', JSON.stringify(itemBodyFieldsData));

    // update the item it is already exist
    if (isSync) {
        var updateProductXML = getUpdateItemXML(itemBodyFieldsData, sessionID, false);
        var responseMagento = validateItemExportResponse(soapRequestToMagento(updateProductXML), 'update');
        if (responseMagento.status == false) {
            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            var msg = 'Item having NS Id: ' + itemId + ' has not exported. -- ' + errMsg;
            nlapiLogExecution("ERROR", " Error From Magento " + msg);
        } else {
            nlapiLogExecution("DEBUG", 'ITEM UPDATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
            var magId = responseMagento.result;

            var fields = [];
            var data = [];

            fields.push(ItemConstant.Fields.Export);
            data.push('F');

            nlapiSubmitField(itemType, itemId, fields, data);
            nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
        }
    } else {
        // create item in magento it is new item

        var createProductXML = getCreateItemXML(itemBodyFieldsData, sessionID, 'CHILD');
        var responseMagento = validateItemExportResponse(soapRequestToMagento(createProductXML), 'create');
        if (responseMagento.status == false) {
            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            var msg = 'Item having NS Id: ' + itemId + ' has not exported. -- ' + errMsg;
            nlapiLogExecution("ERROR", " Error From Magento " + msg);
        } else {
            nlapiLogExecution("DEBUG", 'ITEM CREATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
            var magId = responseMagento.result;

            var fields = [];
            var data = [];

            fields.push(ItemConstant.Fields.MagentoId);
            data.push(magId);

            fields.push(ItemConstant.Fields.MagentoSync);
            data.push('T');

            fields.push(ItemConstant.Fields.MagentoSyncStatus);
            data.push('10');

            fields.push(ItemConstant.Fields.Export);
            data.push('F');

            fields.push(ItemConstant.Fields.MagentoSku);
            data.push(itemBodyFieldsData.sku);

            nlapiSubmitField(itemType, itemId, fields, data);
            nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
        }
    }
}

function scheduled(type) {
    try {
        // handle the script to run only between 1 am to 7 am inclusive
        if (!isRunningTime()) {
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '0');
            return;
        }
        if (MC_SYNC_CONSTANTS.isValidLicense()) {
            URL = ItemConstant.MagentoCred.SoapUrl;
            var webserviceid = ItemConstant.MagentoCred.UserName;
            var webservicepw = ItemConstant.MagentoCred.Password;
            var sessionID;

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

            var itemsToExport = getItemsToExport(ItemConstant.SavedSearch.ChildMatrixItems);
            var itemsDone = [];
            for (var i in itemsToExport) {
                var itemRec = itemsToExport[i];
                var itemId = itemRec.getId();
                var itemType = itemRec.getRecordType();
                if (itemsDone.indexOf(itemId) === -1) {
                    nlapiLogExecution('DEBUG', 'itemType', itemType);
                    if (itemType === 'inventoryitem') {// todo: remove check
                        nlapiLogExecution('DEBUG', 'Iterating Item having Id', itemId);
                        syncItemToMagento(itemRec, sessionID);
                        // handle the script to run only between 1 am to 7 am inclusive
                        if (!isRunningTime()) {
                            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '0');
                            return;
                        }
                        if (rescheduleIfRequired(null)) {
                            return;
                        }
                    }
                    itemsDone.push(itemId);
                }
            }

            // update status and start scheduling script for parent item export
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '0');
            var status = nlapiScheduleScript(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, ItemConstant.Script.F3MG_ITEM_EXPORT_S2.DeploymentId);
            nlapiLogExecution('DEBUG', 'Status: ' + status, 'Script Id: ' + ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId);
            if (status === 'QUEUED') {
                ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '1');
            }

        } else {
            nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'scheduled', e.toString());
    }
    // if let suppose an error has occurred or license expire
    // update status
    ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '0');
}