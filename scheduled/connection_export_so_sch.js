/**
 * Created by ubaig on 01/23/2015.
 * Description:
 * - This script is reponsible for exporting sales orders from Magento to NetSuite
 * -
 * Referenced By:
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
         * Gets Orders based on the the Store Id
         * @param allStores
         * @param storeId
         * @return {object[],[]}
         */
        getOrders: function (allStores, storeId) {
            var filters = [];
            var records;
            var result = [];
            var arrCols = [];
            var resultObject;

            if (!allStores) {
                filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoStore, null, 'is', storeId, null));
            } else {
                filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoStore, null, 'noneof', '@NONE@', null));
            }

            filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T', null));
            filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoSync, null, 'is', 'F', null));
            filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoId, null, 'anyof', '@NONE@', null));
            arrCols.push(new nlobjSearchColumn(ConnectorConstants.Transaction.Fields.MagentoId, null, null));
            arrCols.push(new nlobjSearchColumn(ConnectorConstants.Transaction.Fields.MagentoStore, null, null));

            records = nlapiSearchRecord('transaction', null, filters, arrCols);

            if (!Utility.isBlankOrNull(records) && records.length > 0) {

                for (var i = 0; i < records.length; i++) {
                    resultObject = {};

                    resultObject.internalId = records[i].getId();
                    resultObject.magentoOrderIds = records[i].getValue(ConnectorConstants.Transaction.Fields.MagentoId, null, null);
                    resultObject.magentoStore = records[i].getValue(ConnectorConstants.Transaction.Fields.MagentoStore, null, null);

                    result.push(resultObject);
                }
            }
            return result;
        },
        /**
         * Append customer data in orderDataObject for exporting sales order
         * @param orderRecord
         * @param orderDataObject
         */
        appendCustomerInDataObject: function (orderRecord, orderDataObject) {
            var obj = {};

            var entityId = parseInt(orderRecord.getFieldValue('entity'));
            var customerRec = null;
            try {
                customerRec = nlapiLoadRecord('customer', entityId, null);
            }
            catch (e) {
                Utility.logException('OrderExportHelper.appendCustomerInDataObject', e);
            }

            if (Utility.isBlankOrNull(customerRec)) {
                return;
            }

            /* Customer Creation Data */

            // We only cater existing customer in Magento so far
            obj.mode = 'customer';// it can be guest, register & customer
            obj.customerId = ConnectorCommon.getMagentoIdFromObjArray(customerRec.getFieldValue(ConnectorConstants.Entity.Fields.MagentoId), ConnectorConstants.CurrentStore.systemId);
            obj.email = customerRec.getFieldValue('email') || '';
            obj.firstName = customerRec.getFieldValue('firstname') || '';
            obj.lastName = customerRec.getFieldValue('lastname') || '';
            obj.company = '';
            obj.street = '';
            obj.city = '';
            obj.state = '';
            obj.stateId = '';
            obj.country = '';
            obj.telephone = '';
            obj.fax = '';
            obj.isDefaultBilling = '';
            obj.isDefaultShipping = '';
            obj.zipCode = '';

            // cater billing and shipping addresses
            obj.addresses = [];

            var shippingAddressId = orderRecord.getFieldValue('shipaddresslist');
            var shipAddr = {};
            var billingAddressId = orderRecord.getFieldValue('billaddresslist');
            var billAddr = {};
            var line;

            if (!Utility.isBlankOrNull(shippingAddressId)) {
                line = customerRec.findLineItemValue('addressbook', 'internalid', shippingAddressId);

                shipAddr.mode = 'shipping';
                shipAddr.firstName = customerRec.getFieldValue('firstname') || '';
                shipAddr.lastName = customerRec.getFieldValue('lastname') || '';
                shipAddr.company = customerRec.getFieldValue('companyname') || '';
                shipAddr.street = ( customerRec.getLineItemValue('addressbook', 'addr1', line) + ' ' + customerRec.getLineItemValue('addressbook', 'addr2', line) ) || '';
                shipAddr.city = customerRec.getLineItemValue('addressbook', 'city', line) || '';
                shipAddr.state = customerRec.getLineItemValue('addressbook', 'state', line) || '';
                shipAddr.stateId = customerRec.getLineItemValue('addressbook', 'state', line) || '';
                shipAddr.country = customerRec.getLineItemValue('addressbook', 'addr1', line) || '';
                shipAddr.telephone = customerRec.getFieldValue('phone') || '';
                shipAddr.fax = customerRec.getFieldValue('fax') || '';
                shipAddr.isDefaultBilling = '0';
                shipAddr.isDefaultShipping = '1';
                shipAddr.zipCode = customerRec.getLineItemValue('addressbook', 'zip', line) || '';

                obj.addresses.push(shipAddr);

            } else {
                //todo: write logic here
            }

            if (!Utility.isBlankOrNull(billingAddressId)) {
                line = customerRec.findLineItemValue('addressbook', 'internalid', billingAddressId);

                billAddr.mode = 'billing';
                billAddr.firstName = customerRec.getFieldValue('firstname') || '';
                billAddr.lastName = customerRec.getFieldValue('lastname') || '';
                billAddr.company = customerRec.getFieldValue('companyname') || '';
                billAddr.street = ( customerRec.getLineItemValue('addressbook', 'addr1', line) + ' ' + customerRec.getLineItemValue('addressbook', 'addr2', line) ) || '';
                billAddr.city = customerRec.getLineItemValue('addressbook', 'city', line) || '';
                billAddr.state = customerRec.getLineItemValue('addressbook', 'state', line) || '';
                billAddr.stateId = customerRec.getLineItemValue('addressbook', 'state', line) || '';
                billAddr.country = customerRec.getLineItemValue('addressbook', 'addr1', line) || '';
                billAddr.telephone = customerRec.getFieldValue('phone') || '';
                billAddr.fax = customerRec.getFieldValue('fax') || '';
                billAddr.isDefaultBilling = '1';
                billAddr.isDefaultShipping = '0';
                billAddr.zipCode = customerRec.getLineItemValue('addressbook', 'zip', line) || '';

                obj.addresses.push(billAddr);

            } else {
                //todo: write logic here
            }

            orderDataObject.customer = obj;
        },
        /**
         * Append items data in orderDataObject for exporting sales order
         * @param orderRecord
         * @param orderDataObject
         */
        appendItemsInDataObject: function (orderRecord, orderDataObject) {
            var arr = [];

            try {
                var itemId;
                var itemQty;
                var itemPrice;
                var line;
                var itemIdsArr = [];
                var totalLines = orderRecord.getLineItemCount('item');

                for (line = 1; line <= totalLines; line++) {
                    itemId = orderRecord.getLineItemValue('item', 'item', line);
                    if (!Utility.isBlankOrNull(itemId) && itemIdsArr.indexOf(itemId) === -1) {
                        itemIdsArr.push(itemId);
                    }
                }

                // need to cater non-synced items
                var magentoItemsMap = ConnectorCommon.getMagentoItemIds(itemIdsArr);

                for (line = 1; line <= totalLines; line++) {
                    itemId = orderRecord.getLineItemValue('item', 'item', line);
                    itemId = magentoItemsMap[itemId] || '';
                    itemQty = orderRecord.getLineItemValue('item', 'item', line) || 0;
                    itemPrice = orderRecord.getLineItemValue('item', 'item', line) || 0;

                    var obj = {
                        sku: itemId,
                        quantity: itemQty,
                        price: itemPrice
                    };
                    arr.push(obj);
                }
            }
            catch (e) {
                Utility.logException('OrderExportHelper.appendItemsInDataObject', e);
            }

            orderDataObject.items = arr;
        },
        /**
         * Append Shipping information in orderDataObject for exporting sales order
         * @param orderRecord
         * @param orderDataObject
         */
        appendShippingInfoInDataObject: function (orderRecord, orderDataObject) {
            var obj = {};

            obj.shipmentMethod = 'flatrate_flatrate';

            orderDataObject.shipmentInfo = obj;
        },

        /**
         * Append Shipping information in orderDataObject for exporting sales order
         * @param orderRecord
         * @param orderDataObject
         */
        appendPaymentInfoInDataObject: function (orderRecord, orderDataObject) {
            var obj = {};

            obj.paymentMethod = 'checkmo';

            orderDataObject.paymentInfo = obj;
        },

        /**
         * Gets a single Order
         * @param parameter
         */
        getOrder: function (orderInternalId, storeInfo) {
            var orderDataObject = null;
            try {
                var orderRecord = nlapiLoadRecord('salesorder', orderInternalId, null);

                if (orderRecord !== null) {
                    orderDataObject = {};

                    orderDataObject.storeId = '1';
                    orderDataObject.nsObj = orderRecord;

                    this.appendCustomerInDataObject(orderRecord, orderDataObject);
                    this.appendItemsInDataObject(orderRecord, orderDataObject);
                    this.appendShippingInfoInDataObject(orderRecord, orderDataObject);
                    this.appendPaymentInfoInDataObject(orderRecord, orderDataObject);
                }
            } catch (e) {
                Utility.logException('OrderExportHelper.getOrder', e);
            }

            return orderDataObject;
        },

        /**
         Sets Magento Id in the Order record
         * @param parameter
         */
        setOrderMagentoId: function (magentoId, orderId) {
            try {
                nlapiSubmitField('salesorder', orderId, [ConnectorConstants.Transaction.Fields.MagentoSync, ConnectorConstants.Transaction.Fields.MagentoId], ['T', magentoId]);
            } catch (e) {
                Utility.logException('OrderExportHelper.setOrderMagentoId', e);
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

        startTime: (new Date()).getTime(),
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

            return externalSystemArr;
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

            ConnectorCommon.createLogRec(orderObject.internalId, requestXml);

            Utility.logDebug('store.endpoint', store.endpoint);

            responseMagento = XmlUtility.validateAndTransformResponse(XmlUtility.soapRequestToMagento(requestXml), XmlUtility.transformCreateSalesOrderResponse);

            Utility.logDebug('debug', 'Step-5c');

            if (responseMagento.status) {
                Utility.logDebug('debug', 'Step-6');

                OrderExportHelper.setOrderMagentoId(responseMagento.data.orderIncrementId, orderObject.internalId);

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

                try {
                    var that = this;
                    externalSystemArr.forEach(function (store) {

                        ConnectorConstants.CurrentStore = store;

                        Utility.logDebug('debug', 'Step-2');

                        orderIds = OrderExportHelper.getOrders(false, store.systemId);

                        Utility.logDebug('debug', 'Step-3');

                        if (orderIds.length > 0) {
                            for (var c = 0; c < orderIds.length; c++) {

                                var orderObject = orderIds[c];

                                that.processOrder(orderObject, store);

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
                    Utility.logException('ExportSalesOrders.scheduled - Iterating Orders', e);
                }
                Utility.logDebug(' Ends', '');

            } catch (e) {
                Utility.logException('ExportSalesOrders.scheduled', e);
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
                Utility.logDebug('Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if (minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            } catch (e) {
                Utility.logException('ExportSalesOrders.rescheduleIfNeeded', e);
            }
            return false;
        },

        /**
         * sends records to Salesforce using its API
         */
        processRecords: function (records) {
            var context = nlapiGetContext();

            Utility.logDebug('inside processRecords', 'processRecords');

            //HACK: Need to remove this
            var count = records.length;

            Utility.logDebug('value of count', count);

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
                    Utility.logException('ExportSalesOrders.processRecords', e);
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