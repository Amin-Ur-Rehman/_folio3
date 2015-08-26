/**
 * Created by sameer on 8/20/15.
 */

/**
 * SystemNotesSyncHelper class that has the helper functions to be used for scheduler script to sync system notes with magento
 */
var SystemNotesSyncHelper = (function () {
    return {
        /* Function to get System Notes of Sales Order By InternalId and Last Sync Date
         * @param {soInternalId} string : internal id of sales order
         * @param {lastSyncDate} string : date after which the system notes will be loaded
         */
        getSystemNotesForSalesOrder: function (soInternalId, lastSyncDate) {
            var filters = [],
                columns = [],
            // fields that we need to include in search filters
                fields = [],
                transaction,
                historyData = '',
                record;

            if (!!soInternalId) {
                if (fields.length > 0)
                    filters.push(new nlobjSearchFilter('field', 'systemnotes', 'anyof', fields));
                nlapiLogExecution('debug','lastSyncDate',lastSyncDate);
                if (!!lastSyncDate)
                    filters.push(new nlobjSearchFilter('date', 'systemnotes', 'onorafter', lastSyncDate));
                filters.push(new nlobjSearchFilter('internalid', null, 'is', soInternalId));
                columns.push(new nlobjSearchColumn('date', 'systemNotes'));
                columns.push(new nlobjSearchColumn('field', 'systemNotes'));
                columns.push(new nlobjSearchColumn('type', 'systemNotes'));
                columns.push(new nlobjSearchColumn('oldvalue', 'systemNotes'));
                columns.push(new nlobjSearchColumn('newvalue', 'systemNotes'));
                transaction = nlapiSearchRecord('transaction', null, filters, columns);

                if (!!transaction && transaction.length > 0) {
                    for (var i = 0; i < transaction.length; i++) {
                        if (transaction[i].getValue('oldvalue', 'systemNotes') !== transaction[i].getValue('newvalue', 'systemNotes')) {
                            historyData += transaction[i].getValue('field', 'systemNotes') + ' : ' + transaction[i].getValue('newvalue', 'systemNotes');
                        } else {
                            Utility.logDebug('Value not changed', '');
                        }
                        if (!!historyData && historyData.length > 0) {
                            historyData += '<br />';
                        }
                    }
                }
            }
            return historyData;
        },
        postSyncActions: function (responseMagento, sourceRecord, queueRecord) {
            var data = [];
            if (!!responseMagento && responseMagento.status) {
                //Update Sales Order
                var currentDate = Utility.getDateUTC(0);
                var lastSync = nlapiDateToString(currentDate, 'datetime');
                sourceRecord.setFieldValue('custbody_history_last_synced', lastSync);
                nlapiSubmitRecord(sourceRecord, {disabletriggers: true});
                //Update Records To Sync Custom Record
                data['id'] = queueRecord.internalId;
                data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.Processed;
                RecordsToSync.upsert(data);
            } else {
                data['id'] = records[i].internalId;
                data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.ProcessedWithError;
                RecordsToSync.upsert(data);
            }
        },
        noSyncActions: function (sourceRecord, queueRecord) {
            var data = [];
            var currentDate = Utility.getDateUTC(0);
            var lastSync = nlapiDateToString(currentDate, 'datetime');
            sourceRecord.setFieldValue('custbody_history_last_synced', lastSync);
            nlapiSubmitRecord(sourceRecord, {disabletriggers: true});
            data['id'] = queueRecord.internalId;
            data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.Processed;
            RecordsToSync.upsert(data);
        }
    };
})();
