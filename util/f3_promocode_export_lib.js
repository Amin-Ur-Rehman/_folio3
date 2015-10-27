/**
 * Created by wahajahmed on 8/6/2015.
 */

/**
 * PromoCodesExportHelper class that has the functionality of Helper methods regarding Promo Codes Export logic
 */
var PromoCodesExportHelper = (function () {
    return {
        /**
         * Config data
         */
        config: {
            numberOfUses: {
                singleUse: 'SINGLEUSE',
                multipleUse: 'MULTIPLEUSES'
            }
        },

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
            var oldDate = nlapiAddDays(currentDate, '-' + ageOfRecordsToSyncInDays);
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
                    promoCodeObject.excludeItems = promoCodeRecord.getFieldValue('excludeitems') || '';
                    promoCodeObject.magentoId = promoCodeRecord.getFieldValue(ConnectorConstants.PromoCode.Fields.MagentoId) || '';
                    promoCodeObject.magentoStore = promoCodeRecord.getFieldValue(ConnectorConstants.PromoCode.Fields.MagentoStore) || '';
                    promoCodeObject.magentoSyncStatus = promoCodeRecord.getFieldValue(ConnectorConstants.PromoCode.Fields.MagentoSyncStatus) || '';
                    promoCodeObject.couponCodeList = [];
                    if (promoCodeObject.numberOfUses === this.config.numberOfUses.singleUse) {
                        promoCodeObject.couponCodeList = this.getCouponCodesList(internalId, promoCodeObject.magentoId);
                    }
                    promoCodeObject.itemsList = this.getItemsList(promoCodeRecord);
                }
            } catch (e) {
                Utility.logException('PromoCodeExportHelper.getPromoCode', e);
            }

            //Utility.logDebug('getPromoCode', JSON.stringify(promoCodeObject));
            return promoCodeObject;
        },

        /**
         * Get Coupon code list exist in case of multiple use
         * @param promotionInternalId
         * @returns {*}
         */
        getCouponCodesList: function (promotionInternalId, magentoId) {
            var couponCodesList = [];
            try {
                var magentoCouponListIds = {};
                if (!!magentoId) {
                    var magentoCouponListIdsStr = nlapiLookupField('promotioncode', promotionInternalId, ConnectorConstants.PromoCode.Fields.MagentoCouponsListIDs);
                    if (!!magentoCouponListIdsStr) {
                        magentoCouponListIds = JSON.parse(magentoCouponListIdsStr);
                    }
                }
                var filters = [];
                var arrCols = [];
                filters.push(new nlobjSearchFilter('promotion', null, 'is', promotionInternalId, null));
                arrCols.push(new nlobjSearchColumn('id', null, null));
                arrCols.push(new nlobjSearchColumn('code', null, null));
                arrCols.push(new nlobjSearchColumn('datesent', null, null));
                arrCols.push(new nlobjSearchColumn('recipient', null, null));
                arrCols.push(new nlobjSearchColumn('usecount', null, null));
                arrCols.push(new nlobjSearchColumn('used', null, null));
                var records = nlapiSearchRecord('couponcode', null, filters, arrCols);
                if (!!records && records.length > 0) {
                    for (var i = 0; i < records.length; i++) {
                        var record = records[i];
                        var obj = {};
                        obj.id = record.getValue('id');
                        obj.code = record.getValue('code');
                        //obj.datesent = record.getValue('datesent');
                        //obj.recipient = record.getValue('recipient');
                        //obj.usecount = record.getValue('usecount');
                        //obj.used = record.getValue('used');
                        var magentoId = magentoCouponListIds[obj.id];
                        obj.record_id = !!magentoId ? magentoId : '';
                        couponCodesList.push(obj);
                    }
                }

            } catch (e) {
                Utility.logException('PromoCodeExportHelper.getPromotionCodesList', e);
            }

            //Utility.logDebug('getCouponCodesList', JSON.stringify(couponCodesList));
            return couponCodesList;
        },

        /**
         * Get item list exist in the case if line items exist which are either excluded or included
         * @param promoCodeRecord
         * @return {Array}
         */
        getItemsList: function (promoCodeRecord) {
            var itemsList = [];

            var itemsCount = promoCodeRecord.getLineItemCount("items") || 0;
            for (var line = 1; line <= itemsCount; line++) {
                var itemId = promoCodeRecord.getLineItemValue("items", "item", line);
                itemsList.push(itemId);
            }

            return itemsList;
        },

        /**
         * Send request to megento store
         * @param internalId
         * @param promoCodeRecord
         * @return {*}
         */
        sendRequestToExternalSystem: function (internalId, promoCodeRecord) {

            var response = {status: true, magentoId: '', message: ''};
            try {
                Utility.logDebug('PromoCodesExportHelper.sendRequestToExternalSystem', 'Start');
                if (!promoCodeRecord) {
                    return null;
                }
                Utility.logDebug('promoCodeRecord', JSON.stringify(promoCodeRecord));

                if (!promoCodeRecord.magentoStore) {
                    response.status = false;
                    response.message = 'Please select "MAGENTO STORE" field for data export.';
                    return response;
                }
                if (!!promoCodeRecord.magentoId) {
                    promoCodeRecord.record_id = promoCodeRecord.magentoId;
                }

                ConnectorConstants.initialize();
                // getting configuration
                var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                var store = externalSystemConfig[promoCodeRecord.magentoStore];
                // setting global values for future use
                ConnectorConstants.CurrentStore = store;
                ConnectorConstants.CurrentWrapper = F3WrapperFactory.getWrapper(store.systemType);
                ConnectorConstants.CurrentWrapper.initialize(store);

                var responseMagento = ConnectorConstants.CurrentWrapper.upsertCoupons(promoCodeRecord);

                if (responseMagento.status) {
                    //Utility.logDebug('debug', 'Step-6');
                    //Utility.logDebug('rule_id', responseMagento.data.record_id);
                    response.magentoId = responseMagento.data.record_id;
                    var couponCodesData = '';
                    if (promoCodeRecord.numberOfUses === this.config.numberOfUses.singleUse
                        && !!responseMagento.data.couponCodeList && responseMagento.data.couponCodeList.length > 0) {
                        var couponCodesList = this.extractCouponCodeListData(responseMagento.data.couponCodeList);
                        couponCodesData = JSON.stringify(couponCodesList);
                    }
                    PromoCodesExportHelper.setPromoCodeMagentoId(responseMagento.data.record_id, couponCodesData, internalId);
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
                nlapiLogExecution('ERROR', 'error in PromoCodesExportHelper.sendRequestToExternalSystem', error);
                PromoCodesExportHelper.markRecords(internalId, ' Not Synched Due to Error  :  ' + error);
            }

            Utility.logDebug('PromoCodesExportHelper.sendRequestToExternalSystem', 'end');

            return response;
        },

        /**
         * Extract coupon Code List data from response
         * @param couponCodeList
         */
        extractCouponCodeListData: function (couponCodeList) {
            var couponListArr = {};
            if (!!couponCodeList && couponCodeList.length > 0) {
                for (var i = 0; i < couponCodeList.length; i++) {
                    var obj = couponCodeList[i];
                    couponListArr[obj.id] = obj.record_id;
                }
            }
            return couponListArr;
        },

        /**
         * Get magento url for coupon code creation
         * @param storeId
         */
        getMagentoUrl: function (storeId) {
            var magentoUrl = '';
            var sysConfigs = ExternalSystemConfig.getConfig();
            if (!!sysConfigs) {
                var sysConfig = sysConfigs[storeId];
                if (!!sysConfig) {
                    var entitySyncInfo = sysConfig.entitySyncInfo;
                    if (!!entitySyncInfo && !!entitySyncInfo.promotioncode.magentoUrl) {
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
        setPromoCodeMagentoId: function (magentoId, couponCodeData, promoCodeId) {
            try {
                nlapiSubmitField('promotioncode', promoCodeId,
                    [ConnectorConstants.PromoCode.Fields.TransferredToMagento,
                        ConnectorConstants.PromoCode.Fields.MagentoSyncStatus,
                        ConnectorConstants.PromoCode.Fields.MagentoId,
                        ConnectorConstants.PromoCode.Fields.MagentoCouponsListIDs],
                    ['T', '', magentoId, couponCodeData]);
            } catch (e) {
                Utility.logException('PromoCodesExportHelper.setPromoCodeMagentoId', e);
                PromoCodesExportHelper.markRecords(promoCodeId, e.toString());
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
