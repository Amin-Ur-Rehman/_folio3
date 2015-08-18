/**
 * Created by wahajahmed on 8/6/2015.
 */

/**
 * PriceLevelExportHelper class that has the functionality of Helper methods
 */
var PriceLevelExportHelper = (function () {
    return {
        /**
         * Get price level record
         * @param internalId
         * @param store
         * @returns {*}
         */
        getPriceLevel: function (internalId, store) {
            var promoCodeObject = null;
            try {
                var priceLevelRecord = nlapiLoadRecord('pricelevel', internalId, null);
                var priceLevelObject = {};
                if (priceLevelRecord !== null) {
                    priceLevelObject.storeId = '';
                    priceLevelObject.nsObj = priceLevelRecord;
                    priceLevelObject.name = priceLevelRecord.getFieldValue('name') || '';
                    priceLevelObject.discount = priceLevelRecord.getFieldValue('discountpct') || '';
                    priceLevelObject.isOnline = priceLevelRecord.getFieldValue('isonline') || '';
                    priceLevelObject.isInactive = priceLevelRecord.getFieldValue('isinactive') || '';
                }
            } catch (e) {
                Utility.logException('PriceLevelExportHelper.getPriceLevel', e);
            }

            //Utility.logDebug('getPriceLevel', JSON.stringify(priceLevelObject));
            return priceLevelObject;
        },

        /**
         * Send request to megento store
         * @param orderRecord
         */
        sendRequestToMagento: function(internalId, priceLevelRecord) {

            var response = {status: true, magentoId: '', message: ''};
            try {
                Utility.logDebug('PriceLevelExportHelper.sendRequestToMagento', 'Start');
                if (!priceLevelRecord) {
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

                var requestParam = {"apiMethod": "upsertShoppingCart", "data": JSON.stringify(priceLevelRecord)};
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
