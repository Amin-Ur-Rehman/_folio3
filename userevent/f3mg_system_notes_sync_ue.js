/**
 * Created by sameer on 8/19/15.
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
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var systemNotesSync = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        userEventAfterSubmit: function (type) {
            var context = nlapiGetContext();
            var executionContext = context.getExecutionContext();
            var record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
            var schedulerScriptId = 'customscript_so_systemnotessync_magento',
                schedulerScriptDepId = 'customdeploy_so_sysntssycnsch_magento';
            if(executionContext !== 'scheduled' && (type == 'edit' || type == 'xedit')) {
                //Only for magento orders
                if (!!record.getFieldValue('custbody_magentoid')) {
                    //Saving sales order id for system note sync
                    var data = {};
                    data['custrecord_f3mg_rts_record_id'] = nlapiGetRecordId();
                    data['custrecord_f3mg_rts_record_type'] = RecordsToSync.RecordTypes.SalesOrder;
                    data['custrecord_f3mg_rts_action'] = RecordsToSync.Actions.SyncSoSystemNotes;
                    data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.Pending;
                    RecordsToSync.upsert(data);
                    nlapiScheduleScript(schedulerScriptId, schedulerScriptDepId);
                }
            }
        }
         /* Code written bt sameer
        userEventAfterSubmit: function (type) {
            try {
                var filters = [],
                    columns = [],
                    // fields that we need to include in search filters
                    fields = [],
                    transaction,
                    historyData = '',
                    record,
                    lastSyncDateTime;

                record = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
                lastSyncDateTime = record.getFieldValue('custbody_history_last_synced');
                if (fields.length > 0)
                    filters.push(new nlobjSearchFilter('field', 'systemnotes', 'anyof', fields));
                if (!!lastSyncDateTime)
                    filters.push(new nlobjSearchFilter('date', 'systemnotes', 'onorafter', lastSyncDateTime));
                filters.push(new nlobjSearchFilter('internalid', null, 'is', nlapiGetRecordId()));
                columns.push(new nlobjSearchColumn('date', 'systemNotes'));
                columns.push(new nlobjSearchColumn('field', 'systemNotes'));
                columns.push(new nlobjSearchColumn('type', 'systemNotes'));
                columns.push(new nlobjSearchColumn('oldvalue', 'systemNotes'));
                columns.push(new nlobjSearchColumn('newvalue', 'systemNotes'));
                transaction = nlapiSearchRecord('transaction', null, filters, columns);


                //Setting last time history synced
                var currentDate = Utility.getDateUTC(0);
                var lastSync = nlapiDateToString(currentDate, 'datetime');
                record.setFieldValue('custbody_history_last_synced', lastSync);
                nlapiSubmitRecord(record, {disabletriggers: true});


                if (!!transaction && transaction.length > 0) {
                    for (var i = 0; i < transaction.length; i++) {
                        if (transaction[i].getValue('oldvalue', 'systemNotes') !== transaction[i].getValue('newvalue', 'systemNotes')) {
                            historyData += transaction[i].getValue('field', 'systemNotes') + ' : ' + transaction[i].getValue('newvalue', 'systemNotes');
                        } else {
                            Utility.logDebug('Value not changed', '');
                        }
                        if (!!historyData && historyData.length > 0) {
                            historyData += '\n';
                        }
                    }
                    Utility.logDebug('historyData', historyData);


                    // validate license
                    if (!MC_SYNC_CONSTANTS.isValidLicense()) {
                        Utility.logDebug('LICENSE', 'Your license has been expired.');
                        return null;
                    }

                    // initialize constants
                    ConnectorConstants.initialize();

                    // getting configuration
                    var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                    var orderIds, externalSystemArr;

                    externalSystemArr = ExportSalesOrders.extractExternalSystems(externalSystemConfig);
                    Utility.logDebug('externalSystemArr', JSON.stringify(externalSystemArr));
                    if (externalSystemArr.length <= 0) {
                        Utility.logDebug('Customer Export Script', 'Store(s) is/are not active');
                        return null;
                    }
                    // SO Sync Logic...
                    try {
                        for (var i in externalSystemArr) {
                            var store = externalSystemArr[i];
                            ConnectorConstants.CurrentStore = store;
                            orderIds = OrderExportHelper.getOrders();
                            if (!!orderIds) {
                                var orderObject = orderIds;
                                try {
                                    Utility.logDebug('Sending request to process order', JSON.stringify(orderObject));
                                    ExportSalesOrders.processOrder(orderObject, store, historyData);
                                } catch (e) {
                                    ExportSalesOrders.markRecords(orderObject.internalId, e.toString());
                                }
                            } else {

                            }
                        }
                    } catch (err) {
                        Utility.logException('ExportSalesOrders.scheduled', err);
                    }
                } else {
                    Utility.logDebug('No System notes Found', '')
                }
            } catch (err) {
                Utility.logException('Error in After Submit', err);
            }
        }
    */
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function systemNotesSyncUserEventAfterSubmit(type) {
    return systemNotesSync.userEventAfterSubmit(type);
}