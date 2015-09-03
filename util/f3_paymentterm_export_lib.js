/**
 * Created by wahajahmed on 8/6/2015.
 */

/**
 * PaymentTermExportHelper class that has the functionality of Payment Term Export methods
 */
var PaymentTermExportHelper = (function () {
    return {
        /**
         * Get payment term record
         * @param internalId
         * @param store
         * @returns {*}
         */
        getPaymentTerm: function (internalId, store) {
            var paymentTermObject = null;
            try {
                var paymentTermRecord = nlapiLoadRecord(ConnectorConstants.NSRecordTypes.PaymentTerm, internalId, null);
                var paymentTermObject = {};
                if (paymentTermRecord !== null) {
                    paymentTermObject.storeId = '1';
                    paymentTermObject.nsObj = paymentTermRecord;
                    paymentTermObject.name = paymentTermRecord.getFieldValue('name') || '';
                    paymentTermObject.discountType = 'percent';
                    paymentTermObject.daysUntilNetDue =  paymentTermRecord.getFieldValue('daysuntilnetdue') || '';
                    paymentTermObject.rate =  paymentTermRecord.getFieldValue('discountpercent') || '';
                    paymentTermObject.daysUntilExpiry =  paymentTermRecord.getFieldValue('daysuntilexpiry') || '';
                    paymentTermObject.preferred =  paymentTermRecord.getFieldValue('preferred') || '';
                    paymentTermObject.isInactive = paymentTermRecord.getFieldValue('isinactive') || '';
                }
            } catch (e) {
                Utility.logException('PaymentTermExportHelper.getPaymentTerm', e);
            }
            //Utility.logDebug('getPaymentTerm', JSON.stringify(paymentTermObject));
            return paymentTermObject;
        },

        /**
         * Send request to megento store
         * @param orderRecord
         */
        sendRequestToMagento: function(internalId, paymentTermRecord) {

            var response = {status: true, magentoId: '', message: ''};
            var updateRecord = false;
            try {
                Utility.logDebug('PaymentTermExportHelper.sendRequestToMagento', 'Start');
                if (!paymentTermRecord) {
                    return null;
                }
                var magentoData = RecordsMagentoData.getRecord(internalId, ConnectorConstants.NSRecordTypes.PaymentTerm);
                //Utility.logDebug('magentoData', !!magentoData ? JSON.stringify(magentoData) : '');
                if(!!magentoData && !!magentoData.otherMagentoData) {
                    paymentTermRecord['record_ids'] = JSON.parse(magentoData.otherMagentoData);
                    updateRecord = true;
                }
                //Utility.logDebug('paymentTermRecord', JSON.stringify(paymentTermRecord));
                var storeId = '1';
                var magentoUrl = this.getMagentoUrl(storeId);
                //Utility.logDebug('magentoUrl', magentoUrl);

                var authHeaderName = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Name;
                var authHeaderValue = WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Value;
                var requestHeaders = {};
                requestHeaders[authHeaderName] = authHeaderValue;

                var requestParam = {"apiMethod": "upsertPaymentTerm", "data": JSON.stringify(paymentTermRecord)};
                Utility.logDebug('requestParam', JSON.stringify(requestParam));
                //Utility.logDebug('requestHeaders', JSON.stringify(requestHeaders));

                var resp = nlapiRequestURL(magentoUrl, requestParam, requestHeaders, 'POST');
                var responseBody = resp.getBody();
                Utility.logDebug('export payment term responseBody', responseBody);
                var responseMagento = JSON.parse(responseBody);

                if (responseMagento.status) {
                    //Utility.logDebug('debug', 'Step-6');
                    //Utility.logDebug('record_ids', responseMagento.data.record_ids);
                    if(!updateRecord) {
                        PaymentTermExportHelper.setPriceLevelMagentoIds(responseMagento.data.record_ids, internalId);
                    }

                } else {
                    response.status = false;
                    response.message = responseMagento.message;
                    //Log error with fault code
                    Utility.logDebug('Error from magento', 'payment term Id:  ' + internalId + ' Not Synched Due to Error  :  ' + responseMagento.message);
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
                nlapiLogExecution('ERROR', 'error in PaymentTermExportHelper.sendRequestToMagento', error);
                PaymentTermExportHelper.markRecords(internalId, ' Not Synched Due to Error  :  ' + error);
            }

            Utility.logDebug('PaymentTermExportHelper.sendRequestToMagento', 'end');

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
         Sets Magento Id in the Order record
         * @param parameter
         */
        setPriceLevelMagentoIds: function (magentoIds, paymentTermId) {
            try {
                if(!!magentoIds) {
                    var objRecordsMagentoData = {};
                    objRecordsMagentoData[RecordsMagentoData.FieldName.RecordId] = paymentTermId;
                    objRecordsMagentoData[RecordsMagentoData.FieldName.RecordType] = ConnectorConstants.NSRecordTypes.PaymentTerm;
                    objRecordsMagentoData[RecordsMagentoData.FieldName.MagentoId] = '';
                    objRecordsMagentoData[RecordsMagentoData.FieldName.OtherMagentoData] = JSON.stringify(magentoIds);
                    objRecordsMagentoData[RecordsMagentoData.FieldName.Description] = '';
                    RecordsMagentoData.upsert(objRecordsMagentoData);
                }
            } catch (e) {
                Utility.logException('PaymentTermExportHelper.setPriceLevelMagentoIds', e);
            }
        }
    };
})();
