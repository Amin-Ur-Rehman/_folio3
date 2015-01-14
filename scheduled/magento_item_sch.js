/**
 * Created by zahmed on 13-Jan-15.
 *
 * Description:
 * - This script is responsible for syncing inventory quantity and pricing to Magento store(s)
 * -
 * Referenced By:
 * -
 * Dependency:
 * - Script Parameters:
 *   - InternalId - custscriptcustscriptinternalid - Free-Form Text
 *   - Start Date - custscript_start_date - Date/Time
 * -
 * - Script Id:
 *   - customscript_magento_item_sync_sch
 * -
 * - Deployment Id:
 *   - customdeploy_magento_item_sync_sch
 * -
 * - Scripts:
 *   - accessMagento.js
 *   - connector_common_records.js
 *   - folio3ConnectorLicenseVerification.js
 *   - mc_sync_constants.js
 *   - f3_inventory_sync_script_dao.js
 *   - f3_utility_methods.js
 */

function ws_soaftsubm(type) {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        // inititlize constants
        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;

        //Getting Session
        var context = nlapiGetContext();

// TODO: update the item in all store same time

        externalSystemConfig.forEach(function (store) {
            try {

                // set the percent complete parameter to 0.00
                context.setPercentComplete(0.00);
                // set store for ustilizing in other functions
                ConnectorConstants.CurrentStore = store;

                var soprice = store.entitySyncInfo.item.priceLevel;
                Utility.logDebug('priceLevel', soprice);


                var scriptStartDate = context.getSetting('SCRIPT', ScriptParameter.ScriptStartDate);
                var lastModifiedDate = ConnectorCommon.getLastModifiedDate();

                if (!scriptStartDate) {
                    var currentDate = Utility.getDateUTC(0);
                    scriptStartDate = nlapiDateToString(currentDate, 'datetimetz');
                }


                var sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);

                if (!sessionID) {
                    Utility.logDebug('sessionID', 'sessionID is empty');
                    return;
                }

                Utility.logDebug('startup', 'Start Syncing');


                var ctx = nlapiGetContext();
                var paramInternalId = ctx.getSetting('SCRIPT', ScriptParameter.LastInternalId);
                Utility.logDebug('Param', paramInternalId);
                do {
                    // Fetching next 1000 records
                    var filter = [];
                    var column = [];

                    filter.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', !!paramInternalId ? paramInternalId : '-1', null));
                    filter.push(new nlobjSearchFilter('custitem_magentosyncdev', null, 'is', 'T', null));
                    filter.push(new nlobjSearchFilter('lastmodifieddate', null, 'onorafter', lastModifiedDate, null));

                    var col = new nlobjSearchColumn('internalid', null, null);
                    col.setSort(false);
                    column.push(col);
                    column.push(new nlobjSearchColumn('modified', null, null));

                    var records = nlapiSearchRecord('item', null, filter, column) || [];

                    Utility.logDebug('parammm', paramInternalId);
                    var skip = false;

                    if (records.length > 0) {

                        // processing records  //records.length
                        for (var j = 0; j < records.length; j++) {
                            skip = false;
                            var product_id = records[j].getId();

                            if (j == 0) {
                                Utility.logDebug('1st ProductId', product_id);
                            }
                            if (j >= records.length - 1) {
                                Utility.logDebug('Last ProductId', product_id);
                                paramInternalId = product_id;
                            }

                            var itemRec = nlapiLoadRecord(records[j].getRecordType(), product_id, null);
                            var magentoId = itemRec.getFieldValue('custitem_magentoid');

                            var product = {};
                            // product.queenStock = itemRec.getFieldValue('custitem_queenst_stock');
                            if (!ConnectorCommon.isDevAccount()) {
                                product.price = itemRec.getLineItemValue('price1', 'price_1_', soprice) || 0;// base price, soprice = 1, price1 = GBP
                                var locLine = itemRec.findLineItemValue('locations', 'location', '1');// Goddiva Warehouse Main : Goddiva Warehouse
                                //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', locLine) || 0;
                                product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', locLine) || 0;
                            } else {
                                product.price = itemRec.getLineItemValue('price1', 'price_1_', soprice) || 0;
                                //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', 1) || 0;
                                product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', 1) || 0;
                            }

                            var productRecordtype = records[j].getRecordType();
                            var matrixType = itemRec.getFieldValue('matrixtype');

                            // if matrix parent then getting magento ids from custom records
                            if (matrixType === 'PARENT') {
                                var mgParentRecs = getMagentoParents(product_id);
                                for (var p in mgParentRecs) {
                                    var mgParentRec = mgParentRecs[p];
                                    var mgProductId = mgParentRec.getValue('custrecord_mpss_magento_id');
                                    product.magentoSKU = mgProductId;
                                    syncProduct(product, productRecordtype, product_id, sessionID, true);
                                }
                                // Updated Successfully
                                Utility.logDebug('item id: ' + product_id, 'configurable items are synced successfully');
                                //nlapiSubmitField(productRecordtype, product_id, 'custitem_item_sync', 'F');
                            } else {
                                // if child matrix item
                                product.magentoSKU = magentoId;
                                syncProduct(product, productRecordtype, product_id, sessionID, false);
                            }

                            var usageRemaining = ctx.getRemainingUsage();
                            if (usageRemaining < 2000) {
                                var params = [];
                                params[ScriptParameter.LastInternalId] = product_id;
                                params[ScriptParameter.ScriptStartDate] = scriptStartDate;
                                Utility.logDebug('Scheduled', product_id);
                                nlapiScheduleScript('customscript_magento_item_sync_sch', 'customdeploy_magento_item_sync_sch', params);
                                return true;
                            }

                            context.setPercentComplete(Math.round(((100 * j) / records.length) * 100) / 100);  // calculate the results

                            // displays the percentage complete in the %Complete column on
                            // the Scheduled Script Status page
                            context.getPercentComplete();  // displays percentage complete
                        }


                        Utility.logDebug('index', j + ' productId  ' + product_id + ' usageLimt  ' + usageRemaining);
                    }


                } while (records != null);


            } catch (e) {
                Utility.logException('ws_soaftsubm', e);
            }

            // update date in custom record
            InventorySyncScript.updateStatus(store.CurrentStore.systemDisplayName, scriptStartDate);

        });

    } else {
        Utility.logDebug('Validate', 'License has expired');
    }
}

function getMagentoParents(itemId) {
    var result = [];
    try {
        var cols = [];
        var fils = [];
        fils.push(new nlobjSearchFilter('custrecord_mpss_parent_matrix_item', null, 'anyof', [itemId], null));
        cols.push(new nlobjSearchColumn('custrecord_mpss_parent_matrix_item', null, null));
        cols.push(new nlobjSearchColumn('custrecord_mpss_magento_id', null, null));
        cols.push(new nlobjSearchColumn('custrecord_mpss_magento_sku', null, null));
        result = nlapiSearchRecord('customrecord_f3_matrix_parent_sync_stats', null, fils, cols) || [];
    } catch (e) {
        Utility.logException('MatrixParentSyncStatus.lookup', e);
    }
    return result;
}

function syncProduct(product, productRecordtype, product_id, sessionID, isParent) {
    try {
        var itemXML;
        // check if Magento Item is in Netsuite
        if (product.magentoSKU != null) {

            //var magID = ConnectorCommon.getProductMagentoID(sessionID, product);
            var magID = product.magentoSKU;
            itemXML = XmlUtility.getUpdateItemXML(product, sessionID, magID, isParent);
            var responseMagento = XmlUtility.validateItemExportResponse(XmlUtility.soapRequestToMagento(itemXML), 'update');
            // If due to some reason Magento item is unable to update
            // Send Email Magento Side error
            if (responseMagento.status === false) {
                var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                var msg = 'Item having Magento Id: ' + magID + ' has not exported. of SKU  -- ' + product.magentoSKU + "FC" + responseMagento.faultCode + '--' + responseMagento.faultString;
                //   var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                // generateErrorEmail(msg, configuration, 'item');
                Utility.logDebug(" Error From Magento " + msg, '');
            } else {
                // Updated Successfully
                Utility.logDebug('item: ' + product_id + ' price: ', +product.price + ' item synced successfully - quantity: ' + product.quatity);
                if (!isParent) {
                    //nlapiSubmitField(productRecordtype, product_id, 'custitem_item_sync', 'F');
                }
            }
        }
    } catch (ex) {
        Utility.logException('syncProduct- product id: ' + product_id, ex);
    }
}

var ScriptParameter = ScriptParameter || {};
ScriptParameter.LastInternalId = 'custscriptcustscriptinternalid';
ScriptParameter.ScriptStartDate = 'custscript_start_date';