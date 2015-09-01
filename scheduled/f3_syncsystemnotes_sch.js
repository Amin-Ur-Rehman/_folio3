/**
 * Created by smehmood on 8/26/2015.
 */
/**
 * SyncSystemNotes class that has the actual functionality of scheduler script.
 * This script is responsible to sync sales order system notes with magento (comment history)
 */
var SyncSystemNotes = (function() {
    return {

        startTime: null,
        minutesAfterReschedule: 15,
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function(type) {
            try {
                nlapiLogExecution('DEBUG', 'Starting', '');
                if(MC_SYNC_CONSTANTS.isValidLicense()) {
                    var ctx = nlapiGetContext();
                    // inititlize constants
                    ConnectorConstants.initialize();
                    // getting configuration
                    var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                    var externalSystemArr = [];
                    var records;

                    //Getting sessions of each store
                    externalSystemConfig.forEach(function(store) {
                        ConnectorConstants.CurrentStore = store;
                        var sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);
                        Utility.logDebug('sessionID', sessionID);
                        if(!sessionID) {
                            Utility.logDebug('empty sessionID', 'sessionID is empty');
                            return;
                        }
                        store.sessionID = sessionID;
                        // push store object after getting id for updating items in this store
                        externalSystemArr.push(store);
                    });

                    if(externalSystemArr.length === 0) {
                        Utility.logDebug('SO SystemNotes Sync Script', 'No store configured for sync');
                        return;
                    }

                    records = this.getRecords();
                    this.startTime = (new Date()).getTime();

                    if(records !== null && records.length > 0) {
                        this.processRecords(records, externalSystemArr); //process records
                    } else {
                        nlapiLogExecution('DEBUG', ' No records found to process', '');
                    }
                    nlapiLogExecution('DEBUG', ' Ends', '');
                }
            } catch(e) {
                nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
            }
        },
        //Function to pase number in float
        parseFloatNum: function(num) {
            var no = parseFloat(num);
            if(isNaN(no)) {
                no = 0;
            }
            return no;
        },
        //Function to get Date for specific Time Zone
        getDateUTC: function(offset) {
            var today = new Date();
            var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
            offset = parseInt(this.parseFloatNum(offset * 60 * 60 * 1000));
            today = new Date(utc + offset);
            return today;
        },
        //Function to check whether it is exceeding the time limit of scheduler script execution
        isRunningTime: function() {
            return true; // todo undo
            var currentDate = this.getDateUTC(0);
            var dateTime = nlapiDateToString(currentDate, 'datetimetz');
            var time = nlapiDateToString(currentDate, 'timeofday');

            var strArr = time.split(' ');

            if(strArr.length > 1) {
                var hour = 0;
                var AmPm = strArr[1];
                var timeMinsArr = strArr[0].split(':');

                if(timeMinsArr.length > 0) {
                    hour = parseInt(timeMinsArr[0]);
                }

                if(AmPm === 'am' && hour >= 1 && hour < 7) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Gets record from DAO
         * @returns {*}
         */
        getRecords: function() {
            var records = RecordsToSync.getRecords(RecordsToSync.RecordTypes.SalesOrder, RecordsToSync.Status.Pending, RecordsToSync.Actions.SyncSoSystemNotes);
            return records;
        },
        /**
         * Process data to sync
         */
        processRecords: function(records, externalSystemArr) {
            var context = nlapiGetContext();
            nlapiLogExecution('DEBUG', 'inside processRecords', 'processRecords');
            var count = records.length;
            nlapiLogExecution('DEBUG', 'value of count', count);
            var recordObject;
            var result;
            var history;
            var requestDataObject = {};
            var currentRecord;
            var currentStoreObject;
            var xmlForAddCommentCall;
            var currentDate;
            var lastSync;
            var data = {};
            var responseMagento;
            var lastSyncDate;

            for(var i = 0; i < count; i++) {
                try {
                    //Fetch System Notes
                    currentRecord = nlapiLoadRecord('salesorder', records[i].recordId);
                    requestDataObject.soMagentoId = currentRecord.getFieldValue('custbody_magentoid');
                    lastSync = currentRecord.getFieldValue('custbody_history_last_synced');
                    history = SystemNotesSyncHelper.getSystemNotesForSalesOrder(records[i].recordId, lastSync)['historyData'];
                    lastSyncDate = SystemNotesSyncHelper.getSystemNotesForSalesOrder(records[i].recordId, lastSync)['lastSyncDate'];
                    requestDataObject.history = nlapiEscapeXML(history);
                    currentStoreObject = _.find(externalSystemArr, function(store) {
                        if(!!store) return store.systemId === currentRecord.getFieldValue('custbody_f3mg_magento_store')
                    });
                    nlapiLogExecution('debug','history',JSON.stringify(history));
                    nlapiLogExecution('debug','lastSyncDate',JSON.stringify(lastSyncDate));
                    //If no history then no need to send sync call
                    if(!history) {
                        nlapiLogExecution('debug', 'No History to Sync');
                        SystemNotesSyncHelper.noSyncActions(currentRecord, records[i],lastSyncDate);
                        continue;
                    }
                    //Current Magento Store Configuration Found
                    if(!!currentStoreObject) {
                        //Getting XML for Add Comment Call
                        xmlForAddCommentCall = XmlUtility.getAddSalesOrderCommentXML(currentStoreObject.sessionID, requestDataObject);

                        if(!!xmlForAddCommentCall) {
                            responseMagento = XmlUtility.validateAddCommentResponse(XmlUtility.soapRequestToMagentoSpecificStore(xmlForAddCommentCall, currentStoreObject));
                        }
                        SystemNotesSyncHelper.postSyncActions(responseMagento, currentRecord, records[i],lastSyncDate);
                        if(this.rescheduleIfNeeded(context)) {
                            return;
                        }
                    }
                } catch(e) {
                    nlapiLogExecution('ERROR', 'Error during processRecords', e.toString());
                    data['id'] = records[i].internalId;
                    data['custrecord_f3mg_rts_status'] = RecordsToSync.Status.ProcessedWithError;
                    RecordsToSync.upsert(data);
                }
            }
        },
        /**
         * Reschedules only there is any need
         * @param context Context Object
         * @returns {boolean} true if rescheduling was necessary and done, false otherwise
         */
        rescheduleIfNeeded: function(context, params) {
            try {
                var usageRemaining = context.getRemainingUsage();

                if(usageRemaining < 500) {
                    this.rescheduleScript(context, params);
                    return true;
                }

                var endTime = (new Date()).getTime();

                var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
                nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if(minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            } catch(e) {
                nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
            }
            return false;
        },

        /**
         * Call this method to reschedule current schedule script
         * @param ctx nlobjContext Object
         */
        rescheduleScript: function(ctx, params) {
            var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
        }
    };
})();

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function syncSystemNotesProcessRecordScheduled(type) {
    return SyncSystemNotes.scheduled(type);
}