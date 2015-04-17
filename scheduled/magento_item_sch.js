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
 *   - folio3ConnectorLicenseVerification.js
 *   - mc_sync_constants.js
 *   - f3_inventory_sync_script_dao.js
 *   - f3_utility_methods.js
 *   - f3mg_connector_constants.js
 *   - f3mg_connector_common.js
 *   - f3mg_xml_utility.js
 *   - f3_external_system_config_dao.js
 *   - f3_client_factory.js
 *   - f3mg_ns_mg_shipping_methods_map_dao.js
 */

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
/**
 * Sync inventory quantity and price for matirx child and parent products to magento
 * @param product
 * @param productRecordtype
 * @param product_id
 * @param sessionID
 * @param isParent
 */
function syncProduct(product, productRecordtype, product_id, sessionID, isParent) {
    try {
        var itemXML;
        // check if Magento Item is in Netsuite
        if (!Utility.isBlankOrNull(product.magentoSKU)) {
            var magID = ConnectorCommon.getProductMagentoID(sessionID, product);
            //var magID = product.magentoSKU;
            if (Utility.isBlankOrNull(magID)) {
                Utility.logDebug('Product couldn\'t update', product.magentoSKU);
                return;
            }
            itemXML = XmlUtility.getUpdateItemXML(product, sessionID, magID, isParent);
            var responseMagento = XmlUtility.validateItemExportResponse(XmlUtility.soapRequestToMagento(itemXML), 'update');
            // If due to some reason Magento item is unable to update
            // Send Email Magento Side error
            if (!responseMagento.status) {
                var msg = 'Item having Magento Id: ' + magID + ' has not exported. of SKU  -- ' + product.magentoSKU + "FC" + responseMagento.faultCode + '--' + responseMagento.faultString;
                //   var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                // generateErrorEmail(msg, configuration, 'item');
                Utility.logDebug(" Error From Magento ", msg);
            } else {
                // Updated Successfully
                Utility.logDebug('item: ' + product_id + ' price: ', +product.price + ' item synced successfully - quantity: ' + product.quatity);
            }
        }
    } catch (ex) {
        Utility.logException('syncProduct- product id: ' + product_id, ex);
    }
}

function ws_soaftsubm(type) {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        // inititlize constants
        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
        var context = nlapiGetContext();
        // it is for item sync
        var externalSystemArr = [];

        externalSystemConfig.forEach(function (store) {
            ConnectorConstants.CurrentStore = store;
            if (store.entitySyncInfo.item.isSync) {
                var sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);
                if (!sessionID) {
                    Utility.logDebug('sessionID', 'sessionID is empty');
                    return;
                }
                store.sessionID = sessionID;
                // push store object after getting id for updating items in this store
                externalSystemArr.push(store);
            }
        });

        if (externalSystemArr.length === 0) {
            Utility.logDebug('Item Sync Script', 'Item Sync is not enabled');
            return;
        }

        try {
            // set the percent complete parameter to 0.00
            context.setPercentComplete(0.00);
            // set store for ustilizing in other functions

            var scriptStartDate = context.getSetting('SCRIPT', ConnectorConstants.ScriptParameters.ScriptStartDate);
            var lastModifiedDate = ConnectorCommon.getLastModifiedDate();

            if (Utility.isBlankOrNull(scriptStartDate)) {
                var currentDate = Utility.getDateUTC(-5);
                scriptStartDate = nlapiDateToString(currentDate, 'datetimetz');
            }

            var paramInternalId = context.getSetting('SCRIPT', ConnectorConstants.ScriptParameters.LastInternalId);
            Utility.logDebug('Param', paramInternalId);

            Utility.logDebug('startup', 'Start Syncing');

            do {
                // Fetching next 1000 records
                var filter = [];
                var column = [];

                filter.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', !!paramInternalId ? paramInternalId : '-1', null));
                filter.push(new nlobjSearchFilter(ConnectorConstants.Item.Fields.MagentoSync, null, 'is', 'T', null));
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


                        // handling multiple stores

                        externalSystemArr.forEach(function (store) {
                            ConnectorConstants.CurrentStore = store;

                            var magentoId = itemRec.getFieldValue(ConnectorConstants.Item.Fields.MagentoId);
                            // parse object
                            magentoId = !Utility.isBlankOrNull(magentoId) ? JSON.parse(magentoId) : [];
                            //getting magento id from json array for the store
                            magentoId = ConnectorCommon.getMagentoIdFromObjArray(magentoId, store.systemId);

                            // skip item if no magento id found
                            if (Utility.isBlankOrNull(magentoId)) {
                                return;
                            }

                            // getting store price level
                            var soprice = store.entitySyncInfo.item.priceLevel;
                            Utility.logDebug('priceLevel', soprice);
                            var sessionID = store.sessionID;
                            var quantityLocation = store.entitySyncInfo.item.quantityLocation;

                            var product = {};
                            // product.queenStock = itemRec.getFieldValue('custitem_queenst_stock');
                            if (!ConnectorCommon.isDevAccount()) {
                                // TODO: check multipricing feature
                                product.price = itemRec.getLineItemValue('price', 'price_1_', soprice) || 0;
                                // check  multi location feature
                                if (Utility.isMultiLocInvt()) {
                                    var locLine = itemRec.findLineItemValue('locations', 'location', quantityLocation);
                                    //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', locLine) || 0;
                                    product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', locLine) || 0;
                                } else {
                                    product.quatity = itemRec.getFieldValue('quantityavailable') || 0;
                                }

                            } else {
                                product.price = itemRec.getLineItemValue('price1', 'price_1_', soprice) || 0;
                                //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', 1) || 0;
                                product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', 1) || 0;
                            }

                            var productRecordtype = records[j].getRecordType();
                            var matrixType = itemRec.getFieldValue('matrixtype');

                            // if matrix parent then getting magento ids from custom records
                            // TODO: changes matrix science
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

                            // handle script rescheduling
                            var usageRemaining = context.getRemainingUsage();
                            if (usageRemaining < 2000) {
                                var params = [];
                                params[ConnectorConstants.ScriptParameters.LastInternalId] = product_id;
                                params[ConnectorConstants.ScriptParameters.ScriptStartDate] = scriptStartDate;
                                Utility.logDebug('Scheduled', product_id);
                                nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
                                return true;
                            }

                            context.setPercentComplete(Math.round(((100 * j) / records.length) * 100) / 100);  // calculate the results

                            // displays the percentage complete in the %Complete column on
                            // the Scheduled Script Status page
                            context.getPercentComplete();  // displays percentage complete

                            Utility.logDebug('index', j + ' productId  ' + product_id + ' usageLimt  ' + usageRemaining);
                        });
                    }
                }

            } while (records.length > 0);

            // update date in custom record
            InventorySyncScript.updateStatus('Last Run Date', scriptStartDate);

        } catch (e) {
            Utility.logException('ws_soaftsubm', e);
        }
    } else {
        Utility.logDebug('Validate', 'License has expired');
    }
}