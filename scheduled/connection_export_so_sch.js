/**
 * Created by ubaig on 01/23/2015.
 * TODO:
 * -
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
var OrderExportHelper = (function () {
    return {
        /**
         * Gets Order based on the the Store Id
         */
        getOrders: function (allStores, storeId) {
            var filters = [];
            var records;
            var result = [];
            var arrCols = [];
            var resultObject;

            if (!allStores) {
                filters.push(new nlobjSearchFilter('custentity_f3mg_magento_stores', null, 'is', storeId));
            }

            filters.push(new nlobjSearchFilter('custentity_magentosync_dev', null, 'is', 'F'));
            arrCols.push(new nlobjSearchColumn('custentity_magento_orderid'));

            records = nlapiSearchRecord('transaction', null, filters, arrCols);

            if (records != null && records.length > 0) {

                for (var i = 0; i < records.length; i++) {
                    resultObject = {};

                    resultObject.internalId = records[i].getId();
                    resultObject.magentoOrderIds = records[i].getValue('custentity_magento_orderid');

                    result.push(resultObject);
                }
            }
            return result;
        },

        /**
         * Gets a single Order
         * @param parameter
         */
        getOrder: function (orderInternalId, storeInfo) {
            try {
                var orderRecord = nlapiLoadRecord('transaction ', orderInternalId);
                var orderDataObject = null;

                if (orderRecord != null)  {

                    orderDataObject = {};

                    orderDataObject.email = orderRecord.getFieldValue('email');
                    orderDataObject.firstname = orderRecord.getFieldValue('firstname');
                    orderDataObject.middlename = orderRecord.getFieldValue('middlename');
                    orderDataObject.lastname = orderRecord.getFieldValue('lastname');
                    orderDataObject.password = orderRecord.getFieldValue('password');
                    orderDataObject.website_id = "";
                    orderDataObject.store_id = storeInfo.systemId;
                    orderDataObject.group_id = "";
                    orderDataObject.prefix = orderRecord.getFieldValue('salutation');
                    orderDataObject.suffix = "";
                    orderDataObject.dob = "";
                    orderDataObject.taxvat = "";
                    orderDataObject.gender = "";
                    orderDataObject.nsObj = orderRecord;
                }
            } catch (e) {
                Utility.logException('Error during main getOrder', e);
            }

            return orderDataObject;
        },

        /**
         Sets Magento Id in the Order record
         * @param parameter
         */
        setOrderMagentoId: function (magentoId, orderId) {
            try {

            } catch (e) {
                Utility.logDebug('ERROR', 'Error during main setOrderMagentoId', e.toString());
            }
        },

        /**
         * Description of method setOrderMagentoSync
         * @param parameter
         */
        setOrderMagentoSync: function (orderId) {
            var result = false;
            try {
                nlapiSubmitField('transaction',orderId,'custentity_magentosync_dev','T');
                result = true;
            } catch (e) {
                Utility.logDebug('ERROR', 'Error during main setOrderMagentoSync', e.toString());
            }

            return result;
        },

        /**
         * Gets magento Request XML by the information passed
         * @param orderRecord
         * @param sessionId
         */
        getMagentoRequestXml: function (orderRecord, sessionId) {
            return XmlUtility.getCreateSalesOrderXml(orderRecord, sessionId);
        }
    };
})();


/**
 * ExportSalesOrders class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var ExportSalesOrders = (function () {
    return {

        startTime: null,
        minutesAfterReschedule: 15,

        /**
         * Extracts external System Information from the database
         * @param externalSystemConfig
         */
        extractExternalSystems: function (externalSystemConfig) {
            var externalSystemArr = [];

            externalSystemConfig.forEach(function (store) {
                ConnectorConstants.CurrentStore = store;
                var sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);
                if (!sessionID) {
                    Utility.logDebug('sessionID', 'sessionID is empty');
                    return;
                }
                store.sessionID = sessionID;
                // push store object after getting id for updating items in this store
                externalSystemArr.push(store);

            });
        },

        /**
         * Processes Records
         * @param orderObject
         * @param store
         * @returns {{orderRecord: *, requsetXML: *, responseMagento: *, magentoIdObjArrStr: *, nsCustomerUpdateStatus: *, customerAddresses: *, allAddressedSynched: *, adr: number, logRec: nlobjRecord}}
         */
        processOrder: function (orderObject, store) {

            var magentoIdObjArrStr,
              nsOrderUpdateStatus,
              requestXml,
              responseMagento;

            var orderRecord = OrderExportHelper.getOrder(orderObject.internalId, store);

            Utility.logDebug('debug', 'Step-4');

            if (!orderRecord) {
                return null;
            }

            Utility.logDebug('debug', 'Step-5');

            requestXml = OrderExportHelper.getMagentoRequestXml(orderRecord, store.sessionID);

            Utility.logDebug('store.endpoint', store.endpoint);

            responseMagento = XmlUtility.soapRequestToMagento(requestXml);

            Utility.logDebug('debug', 'Step-5c');

            if (!!responseMagento && !!responseMagento.status && responseMagento.status) {
                Utility.logDebug('debug', 'Step-6');

                //Update Netsuite Customer with Netsuite Customer Id and Store Id
                magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoOrderId, 'create', null);

                nsOrderUpdateStatus = OrderExportHelper.setOrderMagentoId(magentoIdObjArrStr, orderObject.internalId);

            } else {
                //Log error with fault code that this customer is not synched with magento
                Utility.logDebug('final stuff', 'orderId  ' + orderObject.internalId + ' Not Synched Due to Error  :  ' + responseMagento.faultString);
            }
        },

        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {

                if (!MC_SYNC_CONSTANTS.isValidLicense()) {
                    Utility.logDebug('LICENSE', 'Your license has been expired.');
                    return false;
                }

                // handle the script to run only between 1 am to 7 am inclusive
                if (!this.isRunningTime()) {
                    return false;
                }

                // initialize constants
                ConnectorConstants.initialize();
                // getting configuration
                var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                var context = nlapiGetContext();
                var orderIds, usageRemaining, externalSystemArr;

                Utility.logDebug('Starting', '');

                externalSystemArr = this.extractExternalSystems(externalSystemConfig);

                if (externalSystemArr.length <= 0) {
                    Utility.logDebug('Customer Export Script', 'Customer Export is not enabled');
                    return false;
                }

                this.startTime = (new Date()).getTime();

                try {
                    externalSystemArr.forEach(function (store) {

                        Utility.logDebug('debug', 'Step-2');

                        orderIds = OrderExportHelper.getOrders(false, store.internalId);

                        Utility.logDebug('debug', 'Step-3');

                        if (orderIds != null && orderIds.length > 0) {
                            for (var c = 0; c < orderIds.length; c++) {

                                var orderObject = orderIds[c];

                                this.processOrder(orderObject, store);

                                usageRemaining = context.getRemainingUsage();

                                if (usageRemaining < 500) {
                                    nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                                    return true;
                                }
                            }
                        }

                        usageRemaining = context.getRemainingUsage();
                        if (usageRemaining < 500) {
                            nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                            return true;
                        }

                        return;
                    });
                } catch (e) {
                    Utility.logException('customerExport', e);
                }
                Utility.logDebug(' Ends', '');

            } catch (e) {
                Utility.logException('Error during  Script working: ', e);
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
         * Gets record from DAO
         * @returns {*}
         */
        getRecords: function (lastId) {

            //HACK: TODO: Need to remove this hard coded id
            var filter = [];
            if (!lastId) {
                lastId = '0';
            }
            filter.push(new nlobjSearchFilter('internalidnumber', 'parent', 'greaterthanorequalto', lastId, null));
            //TODO: Put your logic here
            var records = null;

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

                if (usageRemaining < 4500) {
                    this.rescheduleScript(context, params);
                    return true;
                }

                var endTime = (new Date()).getTime();

                var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
                Utility.logDebug('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if (minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            } catch (e) {
                Utility.logDebug('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
            }
            return false;
        },

        /**
         * sends records to Salesforce using its API
         */
        processRecords: function (records) {
            var context = nlapiGetContext();

            Utility.logDebug('DEBUG', 'inside processRecords', 'processRecords');

            //HACK: Need to remove this
            var count = records.length;

            Utility.logDebug('DEBUG', 'value of count', count);

            for (var i = 0; i < count; i++) {
                try {
                    // handle the script to run only between 1 am to 7 am inclusive
                    if (!this.isRunningTime()) {

                        return;
                    }

                    if (this.rescheduleIfNeeded(context, params)) {
                        return;
                    }

                } catch (e) {
                    Utility.logDebug('ERROR', 'Error during processRecords', e.toString());
                }
            }
        },

        /**
         * Marks record as completed
         */
        markRecords: function () {

            try {
                //TODO: Write your own logic here
            } catch (e) {

            }
        },

        /**
         * Call this method to reschedule current schedule script
         * @param ctx nlobjContext Object
         */
        rescheduleScript: function (ctx, params) {
            var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
        }
    };
})();

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function ExportSalesOrdersScheduled(type) {
    return ExportSalesOrders.scheduled(type);
}