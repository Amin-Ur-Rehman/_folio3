/**
 * Created by sameer on 8/20/15.
 */
/**
 * SystemNotesSyncHelper class that has the helper functions to be used for scheduler script to sync system notes with magento
 */
var SystemNotesSyncHelper = (function() {
    return {
        /* Function to get System Notes of Sales Order By InternalId and Last Sync Date
         * @param {soInternalId} string : internal id of sales order
         * @param {lastSyncDate} string : date after which the system notes will be loaded
         */
        getSystemNotesForSalesOrder: function(soInternalId, lastSyncDate) {
            var filters = [],
                columns = [],
            // fields that we need to include in search filters
                fields = [],
                transaction,
                historyData = '',
                record,
                lastSyncDateFormatted;
            result = {};

            result['lastSyncDate'] = null;
            result['historyData'] = '';

            if(!!soInternalId) {

                filters.push(new nlobjSearchFilter('type', null, 'anyof', 'SalesOrd'));
                if(!!lastSyncDate)
                    filters.push(new nlobjSearchFilter('date', 'systemNotes', 'After', lastSyncDate));
                filters.push(new nlobjSearchFilter('internalid', null, 'is', soInternalId));
                columns.push(new nlobjSearchColumn('date', 'systemNotes', 'group'));
                columns.push(new nlobjSearchColumn('field', 'systemNotes', 'group'));
                columns.push(new nlobjSearchColumn('type', 'systemNotes', 'group'));
                columns.push(new nlobjSearchColumn('oldvalue', 'systemNotes', 'group'));
                columns.push(new nlobjSearchColumn('newvalue', 'systemNotes', 'group'));
                Utility.logDebug('before search');

                //sorting on date field
                columns[0].setSort();

                if(filters.length > 0)
                    transaction = nlapiSearchRecord('transaction', null, filters, columns);
                Utility.logDebug('transaction', transaction.length);
                if(!!transaction && transaction.length > 0) {
                    for(var i = 0; i < transaction.length; i++) {
                        if(transaction[i].getValue('field', 'systemNotes', 'group').toLowerCase() !== 'custbody_history_last_synced') {
                            if(transaction[i].getValue('oldvalue', 'systemNotes', 'group') !== transaction[i].getValue('newvalue', 'systemNotes', 'group')) {
                                historyData += transaction[i].getText('field', 'systemNotes', 'group') + ' : ' + transaction[i].getValue('newvalue', 'systemNotes', 'group');
                            } else {
                                Utility.logDebug('Value not changed', '');
                            }
                            if(!!historyData && historyData.length > 0) {
                                historyData += '<br />';
                            }
                        }
                    }
                    lastSyncDateFormatted = nlapiStringToDate(transaction[transaction.length - 1].getValue('date', 'systemNotes', 'group'), 'datetime');
                    Utility.logDebug('lastSyncDateFormatted', lastSyncDateFormatted);
                    lastSyncDateFormatted = Utility.addMinutes(lastSyncDateFormatted, 1);
                    Utility.logDebug('lastSyncDate After adding one minute', nlapiDateToString(lastSyncDateFormatted, 'datetime'));
                    result['lastSyncDate'] = nlapiDateToString(lastSyncDateFormatted, 'datetime');
                    result['historyData'] = historyData;
                }
            }
            return result;
        },
        postSyncActions: function(responseMagento, sourceRecord, queueRecord, lastSync) {
            var data = [];
            if(!!responseMagento && responseMagento.status) {
                //Update Sales Order
                //var currentDate = Utility.getDateUTC(0);
                //var lastSync = nlapiDateToString(currentDate, 'datetime');
                sourceRecord.setFieldValue('custbody_history_last_synced', lastSync);
                nlapiSubmitRecord(sourceRecord, {
                    disabletriggers: true
                });
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
        noSyncActions: function(sourceRecord, queueRecord, lastSync) {
            var data = [];
            //var currentDate = Utility.getDateUTC(0);
            //var lastSync = nlapiDateToString(currentDate, 'datetime');
            sourceRecord.setFieldValue('custbody_history_last_synced', lastSync);
            nlapiSubmitRecord(sourceRecord, {
                disabletriggers: true
            });
            data['id'] = queueRecord.internalId;
            data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.Processed;
            RecordsToSync.upsert(data);
        }
    };
})();