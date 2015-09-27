/**
 * Created by zahmed on 09-Mar-15.
 * Description:
 * - This script export Credit Memo records from NetSuite to Magento
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * OrderExportHelper class that has the functionality of
 */
CreditMemoExportHelper = (function () {
    return {
        /**
         * Get Item Ids from Item sublist
         * @param creditMemoRecord
         * @return {Array}
         */
        getNSItemIds: function (creditMemoRecord) {
            var line;
            var totalLines = creditMemoRecord.getLineItemCount('item');
            var itemIdsArr = [];

            for (line = 1; line <= totalLines; line++) {
                var itemId = creditMemoRecord.getLineItemValue('item', 'item', line);
                if (!Utility.isBlankOrNull(itemId) && itemIdsArr.indexOf(itemId) === -1) {
                    itemIdsArr.push(itemId);
                }
            }

            return itemIdsArr;

        },
        /**
         * Append NetSuit Items in the object
         * @param creditMemoRecord
         * @param creditMemoDataObject
         */
        appendItemsInDataObject: function (creditMemoRecord, creditMemoDataObject) {
            creditMemoDataObject.items = [];

            var totalLines = creditMemoRecord.getLineItemCount('item');

            //var magentoItemsMap = ConnectorCommon.getMagentoItemIds(this.getNSItemIds(creditMemoRecord));

            //Utility.logDebug('appendItemsInDataObject - magentoItemsMap', JSON.stringify(magentoItemsMap));

            //var orderId = creditMemoDataObject.orderId;

            //var magentoOrderItemIdsMap = ConnectorCommon.getMagentoOrderItemIdsMap(orderId, magentoItemsMap);
            //Utility.logDebug('appendItemsInDataObject - magentoOrderItemIdsMap', JSON.stringify(magentoOrderItemIdsMap));

            for (var line = 1; line <= totalLines; line++) {
                var nsId = creditMemoRecord.getLineItemValue('item', 'item', line);
                var qty = creditMemoRecord.getLineItemValue('item', 'quantity', line);

                //var magentoOrderItemIdMap = magentoOrderItemIdsMap.hasOwnProperty(nsId) ? magentoOrderItemIdsMap[nsId] : null;
                //var orderItemId = !!magentoOrderItemIdMap && magentoOrderItemIdMap.hasOwnProperty('orderItemId') ? magentoOrderItemIdMap.orderItemId : null;
                var orderItemId = creditMemoRecord.getLineItemValue('item', ConnectorConstants.Transaction.Columns.MagentoOrderId, line);

                if (!Utility.isBlankOrNull(orderItemId)) {

                    var obj = {};

                    obj.nsId = nsId;
                    obj.qty = qty;
                    obj.orderItemId = orderItemId;

                    creditMemoDataObject.items.push(obj);
                }
            }
            Utility.logDebug('appendItemsInDataObject - creditMemoDataObject.items', JSON.stringify(creditMemoDataObject.items));
        },
        /**
         * Gets a credit memo data object
         * @param parameter
         */
        getCreditMemo: function (orderInternalId) {
            var creditMemoDataObject = null;
            try {
                var creditMemoRecord = nlapiLoadRecord('creditmemo', orderInternalId, null);

                if (creditMemoRecord !== null) {
                    creditMemoDataObject = {};

                    creditMemoDataObject.storeId = creditMemoRecord.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore);
                    creditMemoDataObject.orderId = creditMemoRecord.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoId);
                    creditMemoDataObject.shippingCost = creditMemoRecord.getFieldValue('shippingcost');
                    creditMemoDataObject.comment = creditMemoRecord.getFieldValue('memo');
                    creditMemoDataObject.adjustmentPositive = '';
                    creditMemoDataObject.adjustmentNegative = '';
                    creditMemoDataObject.notifyCustomer = '0';
                    creditMemoDataObject.includeComment = '1';
                    creditMemoDataObject.refundToStoreCreditAmount = '';// store id optional field know itself
                    creditMemoDataObject.nsObj = creditMemoRecord;

                    this.appendItemsInDataObject(creditMemoRecord, creditMemoDataObject);
                }
            } catch (e) {
                Utility.logException('CreditMemoExportHelper.getCreditMemo', e);
            }
            Utility.logDebug('getCreditMemo', JSON.stringify(creditMemoDataObject));

            return creditMemoDataObject;
        },

        /**
         Sets Magento Id in the Order record
         * @param parameter
         */
        setCreditMemoMagentoId: function (magentoId, creditMemoId) {
            try {
                nlapiSubmitField('creditmemo', creditMemoId, [ConnectorConstants.Transaction.Fields.MagentoSync, ConnectorConstants.Transaction.Fields.CreditMemoMagentoId], ['T', magentoId]);
            } catch (e) {
                Utility.logException('CreditMemoExportHelper.setCreditMemoMagentoId', e);
                ExportCreditMemos.markRecords(creditMemoId, e.toString());
            }
        },

        /**
         * Gets magento Request XML by the information passed
         * @param orderRecord
         * @param sessionId
         */
        getMagentoRequestXml: function (orderRecord, sessionId) {
            return MagentoWrapper.getCreditMemoCreateXml(orderRecord, sessionId);
        },

        /**
         * Process credit memo to create memo in magento
         * @param record
         * @param store
         */
        processCreditMemo: function (record, store) {
            try {
                var creditMemoNsId = record.getId();
                // get credit card data
                var creditMemo = this.getCreditMemo(creditMemoNsId);

                if (creditMemo.items.length === 0) {
                    Utility.throwException(null, 'No item found to refund');
                }

                var requestXml = MagentoWrapper.getCreditMemoCreateXml(creditMemo, store.sessionID);
                var responseMagento = MagentoWrapper.validateAndTransformResponse(MagentoWrapper.soapRequestToServer(requestXml), MagentoWrapper.transformCreditMemoCreateResponse);

                if (responseMagento.status) {
                    this.setCreditMemoMagentoId(responseMagento.result.creditMemoId, creditMemoNsId);
                } else {
                    Utility.logDebug('CreditMemoExportHelper.processCreditMemo', responseMagento.faultString);
                    ExportCreditMemos.markRecords(creditMemoNsId, responseMagento.faultString);
                }
            } catch (e) {
                Utility.logException('CreditMemoExportHelper.processCreditMemo', e);
                ExportCreditMemos.markRecords(creditMemoNsId, e.toString());
            }
        }
    };
})();

/**
 * ExportCreditMemos class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
ExportCreditMemos = (function () {
    return {

        startTime: (new Date()).getTime(),
        minutesAfterReschedule: 50,
        usageLimit: 500,
        /**
         * Extracts external System Information from the database
         * @param externalSystemConfig
         */
        extractExternalSystems: function (externalSystemConfig) {
            var externalSystemArr = [];

            externalSystemConfig.forEach(function (store) {
                ConnectorConstants.CurrentStore = store;
                ConnectorConstants.CurrentWrapper = F3WrapperFactory.getWrapper(store.systemType);
                var sessionID = MagentoWrapper.getSessionIDFromServer(store.userName, store.password);
                if (!sessionID) {
                    Utility.logDebug('sessionID', 'sessionID is empty');
                    return;
                }
                store.sessionID = sessionID;
                // push store object after getting id for updating items in this store
                externalSystemArr.push(store);

            });

            return externalSystemArr;
        },
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {

                Utility.logDebug('ExportCreditMemos.scheduled', 'Starting');

                if (!MC_SYNC_CONSTANTS.isValidLicense()) {
                    Utility.logDebug('LICENSE', 'Your license has been expired.');
                    return null;
                }

                // initialize constants
                ConnectorConstants.initialize();

                // getting configuration
                var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                var context = nlapiGetContext();
                var externalSystemArr;

                context.setPercentComplete(0.00);
                Utility.logDebug('Starting', '');

                externalSystemArr = this.extractExternalSystems(externalSystemConfig);

                if (externalSystemArr.length <= 0) {
                    Utility.logDebug('ExportCreditMemos', 'Store(s) is/are not active');
                    return null;
                }

                try {

                    for (var i in externalSystemArr) {

                        var store = externalSystemArr[i];

                        ConnectorConstants.CurrentStore = store;
                        ConnectorConstants.CurrentWrapper = F3WrapperFactory.getWrapper(store.systemType);
                        Utility.logDebug('debug', 'Step-2');

                        var records = this.getRecords(store.systemId);

                        if (records !== null && records.length > 0) {
                            this.processRecords(records, store);
                        } else {
                            Utility.logDebug('ExportCreditMemos.scheduled', 'No records found to process - StoreId: ' + store.systemId);
                        }

                        if (this.rescheduleIfNeeded(context, null)) {
                            return null;
                        }

                        Utility.logDebug('ExportCreditMemos.scheduled', ' Ends');
                    }
                } catch (e) {
                    Utility.logException('ExportCreditMemos.scheduled - Iterating Orders', e);
                }
            } catch (e) {
                Utility.logException('ExportCreditMemos.scheduled', e);
            }
        },

        parseFloatNum: function (num) {
            var no = parseFloat(num);
            if (isNaN(no)) {
                no = 0;
            }
            return no;
        },

        getDateUTC: function (offset) {
            var today = new Date();
            var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
            offset = parseInt(this.parseFloatNum(offset * 60 * 60 * 1000));
            today = new Date(utc + offset);
            return today;
        },

        isRunningTime: function () {
            return true; // todo undo
            var currentDate = this.getDateUTC(0);
            var dateTime = nlapiDateToString(currentDate, 'datetimetz');

            var time = nlapiDateToString(currentDate, 'timeofday');

            var strArr = time.split(' ');

            if (strArr.length > 1) {
                var hour = 0;
                var AmPm = strArr[1];
                var timeMinsArr = strArr[0].split(':');

                if (timeMinsArr.length > 0) {
                    hour = parseInt(timeMinsArr[0]);
                }

                if (AmPm === 'am' && hour >= 1 && hour < 7) {
                    return true;
                }
            }

            return false;
        },

        /**
         * Gets credit memo search records/ids if exist for syncing
         * @return {Array}
         */
        getRecords: function (storeId) {
            var fils = [];
            var records = null;

            try {
                fils.push(new nlobjSearchFilter('mainline', null, 'is', 'T', null));
                fils.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoStore, null, 'is', storeId, null));
                fils.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.CreditMemoMagentoId, null, 'isempty', null, null));
                fils.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoSync, null, 'is', 'T', null));
                fils.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoSyncStatus, null, 'isempty', null, null));

                records = nlapiSearchRecord('creditmemo', null, fils, null);
            } catch (e) {
                Utility.logException('ExportCreditMemos.getRecords', e);
            }

            return records;
        },

        /**
         * Reschedules only there is any need
         * @param context Context Object
         * @returns {boolean} true if rescheduling was necessary and done, false otherwise
         */
        rescheduleIfNeeded: function (context, params) {
            try {
                var usageRemaining = context.getRemainingUsage();

                if (usageRemaining < this.usageLimit) {
                    this.rescheduleScript(context, params);
                    return true;
                }

                var endTime = (new Date()).getTime();

                var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
                Utility.logDebug('Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if (minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            } catch (e) {
                Utility.logException('ExportCreditMemos.rescheduleIfNeeded', e);
            }
            return false;
        },


        /**
         * sends records to Salesforce using its API
         */
        processRecords: function (records, store) {
            var context = nlapiGetContext();
            var params = {};
            var count = records.length;

            Utility.logDebug('ExportCreditMemos.processRecords', 'value of count: ' + count);

            for (var i = 0; i < count; i++) {

                CreditMemoExportHelper.processCreditMemo(records[i], store);

                if (this.rescheduleIfNeeded(context, params)) {
                    return;
                }
            }
        },

        /**
         * Marks record as completed
         */
        markRecords: function (creditMemoId, msg) {
            try {
                nlapiSubmitField('creditmemo', creditMemoId, ConnectorConstants.Transaction.Fields.MagentoSyncStatus, msg);
            } catch (e) {
                Utility.logException('ExportCreditMemos.markRecords', e);
            }
        },

        /**
         * Call this method to reschedule current schedule script
         * @param ctx nlobjContext Object
         */
        rescheduleScript: function (ctx, params) {
            var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
            Utility.logDebug('ExportCreditMemos.rescheduleScript', 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        }
    };
})();

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function ExportCreditMemosScheduled(type) {
    return ExportCreditMemos.scheduled(type);
}