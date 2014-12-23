/**
 * Created by zahmed on 14-Oct-14.
 */

// Ceating parent items as configurable in Magento
// getting items with status 0 or empty
// set status to 10 and create & set Main Body Fields

var context = nlapiGetContext();

function getItemBodyFieldsData(itemRec, parItemRec, colorPart) {
    var dataObj = {};

    dataObj.additionalAttributes = [];

    dataObj.type = getMagentoItemType(itemRec, 'PARENT');
    dataObj.attributeSet = Store.attributeSet;
    dataObj.storeViewId = Store.storeView;
    dataObj.websiteId = Store.websiteId;

    var sku = colorPart || '';
    if (colorPart) {
        sku = itemRec.getValue('itemid') + '_' + (colorPart || '').toUpperCase();
    } else {
        sku = itemRec.getValue('itemid');
    }
    dataObj.sku = nlapiEscapeXML(sku);

    dataObj.categories = getItemCategories(parItemRec);

    var name = colorPart || '';
    if (colorPart) {
        name = itemRec.getValue('storedisplayname') + ' - ' + colorPart;
    } else {
        name = itemRec.getValue('storedisplayname');
    }
    dataObj.name = nlapiEscapeXML(removeAsteric(name));

    var storeDescription = itemRec.getValue('storedescription') || '';
    var storeDetailDescription = itemRec.getValue('storedetaileddescription') || '';
    var lineBreakStr = '';
    if (storeDescription && storeDetailDescription) {
        lineBreakStr = lineBreak(1);
    }
    dataObj.description = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
    dataObj.shortDescription = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
    dataObj.urlComponent = nlapiEscapeXML(itemRec.getValue('urlcomponent'));
    dataObj.metaTitle = nlapiEscapeXML(itemRec.getValue('pagetitle'));
    dataObj.metaKeywords = nlapiEscapeXML(itemRec.getValue('searchkeywords'));
    dataObj.metaDescription = dataObj.shortDescription;

    dataObj.weight = itemRec.getValue('weight') || 0;

    dataObj.price = itemRec.getValue('unitprice', 'pricing') || 0;// base price, soprice = 1, price1 = GBP
    //dataObj.quantity = itemRec.getValue('locationquantityonhand') || 0;
    dataObj.quantity = 0 || itemRec.getValue('locationquantityavailable');

    //var color = getColor(colorPart);// colour
    var color = '';// colour
    if (!!color) {
        dataObj.additionalAttributes.push({key: Store.Attributes.Color, value: color});
        //dataObj.additionalAttributes.push({key: 'color', value: color});//test
    }

    //var size = getSize(itemRec.getText(ItemConstant.Fields.SizeUk) || itemRec.getText(ItemConstant.Fields.Size));
    var size = '';
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

    //dataObj.visibility = '1'; // Not visible for test todo:remove
    //dataObj.status = '2'; // Disabled for test todo:remove

    dataObj.taxClass = '4';// Shipping
    dataObj.manageStock = '1';// manage stock
    dataObj.stockAvailability = '1';// is in stock
    dataObj.useConfigManageStock = '0';// use config manage stock

    return dataObj;
}

function getChildItems(parentItemId) {
    var fils = [];
    var cols = [];
    var result = [];
    var data = {};

    try {
        fils.push(new nlobjSearchFilter('type', null, 'anyof', ['InvtPart']));
        fils.push(new nlobjSearchFilter('islotitem', null, 'is', 'F'));
        fils.push(new nlobjSearchFilter('matrixchild', null, 'is', 'T'));
        //fils.push(new nlobjSearchFilter('website', null, 'anyof', ['1']));// only fetch goddiva items
        fils.push(new nlobjSearchFilter('parent', null, 'anyof', [parentItemId]));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.Color));
        cols.push(new nlobjSearchColumn('internalid'));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.MagentoId));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.MagentoSku));
        result = nlapiSearchRecord('item', null, fils, cols) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'getChildItems', e.toString());
    }

    result.forEach(function (rec) {
        var color = rec.getText(ItemConstant.Fields.Color);
        var internalId = rec.getValue('internalid');
        var magentoId = rec.getValue(ItemConstant.Fields.MagentoId);
        var magentoSku = rec.getValue(ItemConstant.Fields.MagentoSku);

        if (!data.hasOwnProperty(color)) {
            data[color] = [];
        }
        data[color].push({
            internalId: internalId,
            magentoId: magentoId,
            magentoSku: magentoSku,
            parentItemId: parentItemId
        });
    });

    return data;
}

function associateChilds(childItems, color, configurableSKU) {
    try {
        nlapiLogExecution('DEBUG', 'arguments', JSON.stringify(arguments));
        var childs = childItems[color];

        if (childs) {
            var associated = [];
            for (var i in childs) {
                if (associated.indexOf(childs[i].magentoSku) === -1) {
                    associated.push(childs[i].magentoSku);
                }
            }
            var postData = {"cpLink": true, "data": JSON.stringify({"configurable": configurableSKU, "associated": associated})};

            var response = nlapiRequestURL(ItemConstant.Url.ConfigurableProduct, postData).getBody();
            nlapiLogExecution('DEBUG', 'response', response);
            if (response.indexOf('OK6') > -1) {
                nlapiLogExecution('DEBUG', 'Items have been associated', 'postData: ' + JSON.stringify(postData));
            } else {
                nlapiLogExecution('DEBUG', 'Items associattion Failed', 'postData: ' + JSON.stringify(postData));
            }
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'Items associattion Failed', e.toString());
    }
}

function getVisibilityForUpdatingItem(itemId, color) {
    var visibility = '1;';
    var filExp = [
        ['parent.internalid', 'is', itemId ],
        'AND',
        ['formulatext: {custitem3}', 'is', color],
        'OR',
        ['isonline', 'is', 'T']
    ];
    var cols = [new nlobjSearchColumn('isonline')];

    var res = nlapiSearchRecord('item', null, filExp, cols) || [];

    if (res.length > 0) {
        visibility = '4';
    }
    return visibility;
}

function syncItemToMagento(itemRec, sessionID) {
    var itemId = itemRec.getId();
    var itemType = itemRec.getRecordType();

    var childItems = getChildItems(itemId);// this is for associated products - php call

    for (var color in childItems) {
        try {
            // search in custom record for existance
            var syncInfo = MatrixParentSyncStatus.getSyncInfo(itemId, color);
            if (syncInfo.sync && !!syncInfo.id) {
                var itemParentRec = nlapiLoadRecord(itemType, itemId);
                // TODO: generalized
                var itemBodyFieldsData = getItemBodyFieldsData(itemRec, itemParentRec, color);
                // adding magento id getting from custom record
                itemBodyFieldsData.magentoId = syncInfo.magentoId;

                // check if item already sync with magento
                var isSync = checkIfAlreadySync(itemType, itemId, sessionID, syncInfo, 'PARENT');

                // update the item it is already exist
                if (isSync) {
                    var updateProductXML = getUpdateItemXML(itemBodyFieldsData, sessionID, false);
                    itemBodyFieldsData.visibility = getVisibilityForUpdatingItem(itemId, color);
                    var responseMagento = validateItemExportResponse(soapRequestToMagento(updateProductXML), 'update');
                    if (responseMagento.status == false) {
                        var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                        var msg = 'Item having NS Id: ' + itemId + ' has not exported. -- ' + errMsg;
                        nlapiLogExecution("ERROR", " Error From Magento " + msg);
                    } else {
                        nlapiLogExecution("DEBUG", 'ITEM CREATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
                        var magId = responseMagento.result;

                        nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
                        associateChilds(childItems, color, itemBodyFieldsData.sku);
                    }
                } else {
                    // create item in magento it is new item

                    itemBodyFieldsData.visibility = '1'; // Not visible for new items until its images are synced
                    var createProductXML = getCreateItemXML(itemBodyFieldsData, sessionID, 'PARENT');
                    var responseMagento = validateItemExportResponse(soapRequestToMagento(createProductXML), 'create');
                    if (!responseMagento.status) {
                        var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                        var msg = 'Item having NS Id: ' + itemId + ' has not exported. -- ' + errMsg;
                        nlapiLogExecution("ERROR", " Error From Magento " + msg);
                    } else {
                        nlapiLogExecution("DEBUG", 'ITEM CREATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
                        var magId = responseMagento.result;

                        var fields = [];
                        var data = [];

                        fields.push(ItemConstant.Fields.MagentoSync);
                        data.push('T');

                        fields.push(ItemConstant.Fields.MagentoSyncStatus);
                        data.push('10');

                        //fields.push(ItemConstant.Fields.Export);
                        //data.push('F');

                        nlapiSubmitField(itemType, itemId, fields, data);

                        var obj = {};
                        obj[MatrixParentSyncStatus.FieldName.MagentoId] = magId;
                        obj[MatrixParentSyncStatus.FieldName.MagentoSku] = itemBodyFieldsData.sku;
                        obj[MatrixParentSyncStatus.FieldName.MagentoSyncStatus] = '10';
                        MatrixParentSyncStatus.upsert(obj, syncInfo.id);
                        nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
                        associateChilds(childItems, color, itemBodyFieldsData.sku);
                    }
                }
            } else {
                nlapiLogExecution('DEBUG', 'Item Not Sync', 'Item has already synced - ItemId: ' + itemId + ' , Color: ' + color);
            }
        } catch (ex) {
            nlapiLogExecution('ERROR', 'Item Not Sync', 'ItemId: ' + itemId + ' , Color: ' + color + ' Error Msg: ' + ex.toString());
        }
    }
    try {
        var fields = [];
        var data = [];

        fields.push(ItemConstant.Fields.Export);
        data.push('F');

        nlapiSubmitField(itemType, itemId, fields, data);
    } catch (ex) {
        nlapiLogExecution('ERROR', 'Item Not Updated', 'ItemId: ' + itemId + ' Error Msg: ' + ex.toString());
    }
}

function scheduled(type) {
    try {
        // handle the script to run only between 1 am to 7 am inclusive
        if (!isRunningTime()) {
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '0');
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

            var itemsToExport = getItemsToExport(ItemConstant.SavedSearch.ParentMatrixItems);
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
                            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '0');
                            return;
                        }
                        if (rescheduleIfRequired(null)) {
                            return;
                        }
                    }
                    itemsDone.push(itemId);
                    //return;//test
                }
            }

            // update status and start scheduling script for parent item export
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '0');
            var status = nlapiScheduleScript(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, ItemConstant.Script.IISYNC_UTIILIY.DeploymentId);
            nlapiLogExecution('DEBUG', 'Status: ' + status, 'Script Id: ' + ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId);
            if (status === 'QUEUED') {
                ScheduledScriptStatus.updateStatus(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, '1');
            }

        } else {
            nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'scheduled', e.toString());
    }
    // if let suppose an error has occurred or license expire
    // update status
    ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '0');
}