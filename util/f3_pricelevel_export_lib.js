/**
 * Created by wahajahmed on 8/6/2015.
 */

/**
 * PriceLevelExportHelper class that has the functionality of Helper methods regarding Price Level Export Logic
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
                    priceLevelObject.storeId = '1';
                    priceLevelObject.nsObj = priceLevelRecord;
                    priceLevelObject.name = priceLevelRecord.getFieldValue('name') || '';
                    var discountType =  priceLevelRecord.getFieldValue('discountpct') || '';
                    priceLevelObject.discountType = 'percent';
                    if(!!discountType) {
                        var rate = discountType.substring(0, discountType.length - 1);
                        priceLevelObject.rate = Math.abs(parseFloat(rate));
                    } else {
                        priceLevelObject.rate = '';
                    }
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
        sendRequestToExternalSystem: function(internalId, priceLevelRecord) {

            var response = {status: true, magentoId: '', message: ''};
            var updateRecord = false;
            try {
                Utility.logDebug('PriceLevelExportHelper.sendRequestToMagento', 'Start');
                if (!priceLevelRecord) {
                    return null;
                }
                var magentoData = RecordsMagentoData.getRecord(internalId, ConnectorConstants.NSRecordTypes.PriceLevel);
                //Utility.logDebug('magentoData', !!magentoData ? JSON.stringify(magentoData) : '');
                if(!!magentoData && !!magentoData.otherMagentoData) {
                    priceLevelRecord['record_ids'] = JSON.parse(magentoData.otherMagentoData);
                    updateRecord = true;
                }
                //Utility.logDebug('priceLevelRecord', JSON.stringify(priceLevelRecord));
                var storeId = '1';
                var magentoUrl = this.getMagentoUrl(storeId);
                //Utility.logDebug('magentoUrl', magentoUrl);

                var authHeaderName = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Name;
                var authHeaderValue = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Value;
                var requestHeaders = {};
                requestHeaders[authHeaderName] = authHeaderValue;

                var requestParam = {"apiMethod": "upsertPriceLevel", "data": JSON.stringify(priceLevelRecord)};
                Utility.logDebug('requestParam', JSON.stringify(requestParam));
                //Utility.logDebug('requestHeaders', JSON.stringify(requestHeaders));
                var resp = nlapiRequestURL(magentoUrl, requestParam, requestHeaders, 'POST');
                var responseBody = resp.getBody();
                Utility.logDebug('export price level responseBody', responseBody);
                var responseMagento = JSON.parse(responseBody);
                //Utility.logDebug('parsed responseBody', JSON.stringify(responseMagento));

                if (responseMagento.status) {
                    //Utility.logDebug('debug', 'Step-6');
                    //Utility.logDebug('record_ids', responseMagento.data.record_ids);
                    if(!updateRecord) {
                        PriceLevelExportHelper.setPriceLevelMagentoIds(responseMagento.data.record_ids, internalId);
                    }

                } else {
                    response.status = false;
                    response.message = responseMagento.message;
                    //Log error with fault code
                    Utility.logDebug('Error from magento in PriceLevelExport', 'paymentTermId:  ' + internalId + ' Not Synched Due to Error  :  ' + responseMagento.message);
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
                nlapiLogExecution('ERROR', 'error in PriceLevelExportHelper.sendRequestToExternalSystem', error);
            }

            Utility.logDebug('PriceLevelExportHelper.sendRequestToMagento', 'end');

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
                    if(!!entitySyncInfo && !!entitySyncInfo.magentoCustomizedApiUrl) {
                        magentoUrl = entitySyncInfo.magentoCustomizedApiUrl;
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
        setPriceLevelMagentoIds: function (magentoIds, promoCodeId) {
            try {
                if(!!magentoIds) {
                    var objRecordsMagentoData = {};
                    objRecordsMagentoData[RecordsMagentoData.FieldName.RecordId] = promoCodeId;
                    objRecordsMagentoData[RecordsMagentoData.FieldName.RecordType] = ConnectorConstants.NSRecordTypes.PriceLevel;
                    objRecordsMagentoData[RecordsMagentoData.FieldName.MagentoId] = '';
                    objRecordsMagentoData[RecordsMagentoData.FieldName.OtherMagentoData] = JSON.stringify(magentoIds);
                    objRecordsMagentoData[RecordsMagentoData.FieldName.Description] = '';
                    RecordsMagentoData.upsert(objRecordsMagentoData);
                }
            } catch (e) {
                Utility.logException('PriceLevelExportHelper.setPriceLevelMagentoIds', e);
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
