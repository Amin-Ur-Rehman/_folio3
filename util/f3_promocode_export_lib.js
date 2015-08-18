/**
 * Created by wahajahmed on 8/6/2015.
 */

/**
 * PromoCodesExportHelper class that has the functionality of Helper methods
 */
var PromoCodesExportHelper = (function () {
    return {
        /**
         * Gets Orders based on the the Store Id
         * @param allStores
         * @param storeId
         * @return {object[],[]}
         */
        getPromoCodes: function (allStores, storeId) {
            var filters = [];
            var records;
            var result = [];
            var arrCols = [];
            var resultObject;

            Utility.logDebug('getting promo codes for storeId', storeId);

            var ageOfRecordsToSyncInDays = ConnectorConstants.CurrentStore.entitySyncInfo.promotioncode.ageOfRecordsToSyncInDays;
            //Utility.logDebug('ageOfRecordsToSyncInDays', ageOfRecordsToSyncInDays);

            var currentDate = Utility.getDateUTC(0);
            //Utility.logDebug('currentDate', currentDate);
            var oldDate = nlapiAddDays(currentDate, '-'+ageOfRecordsToSyncInDays);
            //Utility.logDebug('oldDate', oldDate);
            oldDate = nlapiDateToString(oldDate);
            //Utility.logDebug('first nlapiDateToString', oldDate);
            oldDate = oldDate.toLowerCase();
            //Utility.logDebug('oldDate toLowerCase', oldDate);
            oldDate = nlapiDateToString(nlapiStringToDate(oldDate, 'datetime'), 'datetime');
            //Utility.logDebug('oldNetsuiteDate', oldDate);
            //      8/6/2015 12:34 pm
            filters.push(new nlobjSearchFilter(ConnectorConstants.PromoCode.Fields.LastModifiedDate, null, 'onorafter', oldDate, null));

            if (!allStores) {
                filters.push(new nlobjSearchFilter(ConnectorConstants.PromoCode.Fields.MagentoStore, null, 'is', storeId, null));
            } else {
                filters.push(new nlobjSearchFilter(ConnectorConstants.PromoCode.Fields.MagentoStore, null, 'noneof', '@NONE@', null));
            }
            //filters.push(new nlobjSearchFilter('internalid', null, 'is', '7173', null));
            filters.push(new nlobjSearchFilter(ConnectorConstants.PromoCode.Fields.TransferredToMagento, null, 'is', 'F', null));
            filters.push(new nlobjSearchFilter(ConnectorConstants.PromoCode.Fields.MagentoId, null, 'isempty', null, null));

            arrCols.push((new nlobjSearchColumn('internalid', null, null)).setSort(false));
            arrCols.push(new nlobjSearchColumn(ConnectorConstants.PromoCode.Fields.MagentoId, null, null));
            arrCols.push(new nlobjSearchColumn(ConnectorConstants.PromoCode.Fields.MagentoStore, null, null));

            records = nlapiSearchRecord('promotioncode', null, filters, arrCols);

            if (!Utility.isBlankOrNull(records) && records.length > 0) {

                for (var i = 0; i < records.length; i++) {
                    resultObject = {};

                    resultObject.internalId = records[i].getId();
                    resultObject.magentoPromoCodeIds = records[i].getValue(ConnectorConstants.PromoCode.Fields.MagentoId, null, null);
                    resultObject.magentoStore = records[i].getValue(ConnectorConstants.PromoCode.Fields.MagentoStore, null, null);

                    result.push(resultObject);
                }
            }
            return result;
        },
        /**
         * Get Bill/Ship Address either from customer or sales order for sales order export
         * @param orderRecord
         * @param customerRec
         * @param {string} type {shippingaddress, billingaddress}
         * @param addressId
         * @return {object}
         */


        /**
         * Gets a single Order
         * @param parameter
         */
        getPromoCode: function (internalId, store) {
            var promoCodeObject = null;
            try {
                var promoCodeRecord = nlapiLoadRecord('promotioncode', internalId, null);

                if (promoCodeRecord !== null) {
                    promoCodeObject = {};

                    promoCodeObject.storeId = '1';
                    promoCodeObject.nsObj = promoCodeRecord;
                    promoCodeObject.name = promoCodeRecord.getFieldValue('name') || '';
                    promoCodeObject.startDate = promoCodeRecord.getFieldValue('startdate') || '';
                    promoCodeObject.endDate = promoCodeRecord.getFieldValue('enddate') || '';
                    promoCodeObject.discount = promoCodeRecord.getFieldValue('discount') || '';
                    promoCodeObject.discountText = promoCodeRecord.getFieldText('discount') || '';
                    promoCodeObject.discountType = promoCodeRecord.getFieldValue('discounttype') || '';
                    promoCodeObject.rate = promoCodeRecord.getFieldValue('rate') || '';
                    promoCodeObject.applyDiscountTo = promoCodeRecord.getFieldValue('applydiscountto') || '';
                    promoCodeObject.applyDiscountToText = promoCodeRecord.getFieldText('applydiscountto') || '';
                    promoCodeObject.freeShipMethod = promoCodeRecord.getFieldValue('freeshipmethod') || '';
                    promoCodeObject.freeShipMethodText = promoCodeRecord.getFieldText('freeshipmethod') || '';
                    promoCodeObject.description = promoCodeRecord.getFieldValue('description') || '';
                    promoCodeObject.isPublic = promoCodeRecord.getFieldValue('ispublic') || '';
                    promoCodeObject.isInactive = promoCodeRecord.getFieldValue('isinactive') || '';
                    promoCodeObject.displayLineDiscounts = promoCodeRecord.getFieldValue('displaylinediscounts') || '';
                    promoCodeObject.numberOfUses = promoCodeRecord.getFieldValue('usetype') || '';
                    promoCodeObject.couponCode = promoCodeRecord.getFieldValue('code') || '';
                }
            } catch (e) {
                Utility.logException('PromoCodeExportHelper.getPromoCode', e);
            }

            //Utility.logDebug('getPromoCode', JSON.stringify(promoCodeObject));
            return promoCodeObject;
        },

        /**
         * Send request to megento store
         * @param orderRecord
         */
        sendRequestToMagento: function(internalId, promoCodeRecord) {

            var response = {status: true, magentoId: '', message: ''};
            try {
                Utility.logDebug('PromoCodesExportHelper.sendRequestToMagento', 'Start');
                if (!promoCodeRecord) {
                    return null;
                }
                var magentoId = nlapiLookupField('promotioncode', internalId, ConnectorConstants.PromoCode.Fields.MagentoId);
                // If record is not already sync to magento, only create functionality yet
                /*if(!magentoId) {

                }*/

                var storeId = nlapiLookupField('promotioncode', internalId, ConnectorConstants.PromoCode.Fields.MagentoStore);
                //Utility.logDebug('storeId', storeId);
                if(!storeId) {
                    response.status = false;
                    response.message = 'Please select "MAGENTO STORE" field for data export.';
                    return response;
                }
                var magentoUrl = this.getMagentoUrl(storeId);
                //Utility.logDebug('magentoUrl', magentoUrl);

                var authHeaderName = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Name;
                var authHeaderValue = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Value;
                var requestHeaders = {};
                requestHeaders[authHeaderName] = authHeaderValue;

                var requestParam = {"apiMethod": "upsertShoppingCart", "data": JSON.stringify(promoCodeRecord)};
                //Utility.logDebug('requestParam', JSON.stringify(requestParam));
                //Utility.logDebug('requestHeaders', JSON.stringify(requestHeaders));
                var resp = nlapiRequestURL(magentoUrl, requestParam, requestHeaders, 'POST');
                var responseBody = resp.getBody();
                Utility.logDebug('export promo code responseBody', responseBody);
                var responseMagento = JSON.parse(responseBody);
                //Utility.logDebug('parsed responseBody', JSON.stringify(responseMagento));

                if (responseMagento.status) {
                    //Utility.logDebug('debug', 'Step-6');
                    //Utility.logDebug('rule_id', responseMagento.data.record_id);
                    response.magentoId = responseMagento.data.record_id;
                    PromoCodesExportHelper.setPromoCodeMagentoId(responseMagento.data.record_id, internalId);
                } else {
                    response.status = false;
                    response.message = responseMagento.message;
                    //Log error with fault code
                    Utility.logDebug('Error from magento', 'promoCodeId:  ' + internalId + ' Not Synched Due to Error  :  ' + responseMagento.message);
                    PromoCodesExportHelper.markRecords(internalId, ' Not Synched Due to Error  :  ' + responseMagento.message);
                }
            }
            catch (ex) {
                var error = '';
                if (ex instanceof nlobjError) {
                    error = 'Code: ' + ex.getCode() + ',  Detail: ' + ex.getDetails();
                } else {
                    error = ex.toString();
                }
                response.status = false;
                response.message = error;
                nlapiLogExecution('ERROR', 'error in PromoCodesExportHelper.sendRequestToMagento', error);
                PromoCodesExportHelper.markRecords(internalId, ' Not Synched Due to Error  :  ' + error);
            }

            Utility.logDebug('PromoCodesExportHelper.sendRequestToMagento', 'end');

            return response;
        },

        /**
         * Get magento url for coupon code creation
         * @param storeId
         */
        getMagentoUrl : function(storeId) {
            var magentoUrl = '';
            var sysConfigs = ExternalSystemConfig.getConfig();
            if(!!sysConfigs) {
                var sysConfig = sysConfigs[storeId];
                if(!!sysConfig) {
                    var entitySyncInfo = sysConfig.entitySyncInfo;
                    if(!!entitySyncInfo && !!entitySyncInfo.promotioncode.magentoUrl) {
                        magentoUrl = entitySyncInfo.promotioncode.magentoUrl;
                    }
                }
            }
            return magentoUrl;
        },

        /**
         * Marks record as completed
         */
        markRecords: function (promoCodeId, msg) {

            try {
                nlapiSubmitField('promotioncode', promoCodeId, ConnectorConstants.PromoCode.Fields.MagentoSyncStatus, msg);
            } catch (e) {
                Utility.logException('PromoCodesExportHelper.markRecords', e);
            }
        },

        /**
         Sets Magento Id in the Order record
         * @param parameter
         */
        setPromoCodeMagentoId: function (magentoId, promoCodeId) {
            try {
                nlapiSubmitField('promotioncode', promoCodeId, [ConnectorConstants.PromoCode.Fields.TransferredToMagento, ConnectorConstants.PromoCode.Fields.MagentoSyncStatus, ConnectorConstants.PromoCode.Fields.MagentoId], ['T', '', magentoId]);
            } catch (e) {
                Utility.logException('PromoCodesExportHelper.setPromoCodeMagentoId', e);
                ExportSalesOrders.markRecords(orderId, e.toString());
            }
        },
        /**
         * Description of method setOrderMagentoSync
         * @param parameter
         */
        setOrderMagentoSync: function (orderId) {
            var result = false;
            try {
                nlapiSubmitField('transaction', orderId, 'custbody_magentosync_dev', 'T');
                result = true;
            } catch (e) {
                Utility.logException('OrderExportHelper.setOrderMagentoSync', e);
            }

            return result;
        }
    };
})();
