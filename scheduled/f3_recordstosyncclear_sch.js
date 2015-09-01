/**
 * Created by smehmood on 7/1/2015.
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
 * RecordsToSyncClear class that has the actual functionality of scheduler script.
 */
var RecordsToSyncClear = (function() {
    return {

        startTime: null,
        minutesAfterReschedule: 45,
        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function(type) {
            try {
                if(!this.isRunningTime()) {
                    return;
                }
                nlapiLogExecution('DEBUG', 'Starting', '');
                var ctx = nlapiGetContext();
                var params=[];

                params['noOfDays'] = ctx.getSetting('SCRIPT', 'custscript_noofdaysbefore');

                var records = this.getRecords(params);
                this.startTime = (new Date()).getTime();

                if(records !== null && records.length > 0) {
                    //this.processRecords(records); //markRecords is called from within
                } else {
                    nlapiLogExecution('DEBUG', ' No records found to process', '');
                }
                nlapiLogExecution('DEBUG', ' Ends', '');
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
        getRecords: function(params) {
            nlapiLogExecution('debug', 'getRecords ', 'step-1 ' + JSON.stringify(params));
            var noOfDays =  params['noOfDays'];
            var records = [];
            var currentDate;
            var beforeDateStr;
            if(!!noOfDays) {
                currentDate = Utility.getDateUTC(0);
                noOfDays = -1 * noOfDays;
                beforeDateStr = nlapiDateToString(nlapiAddDays(currentDate, noOfDays));
                nlapiLogExecution('debug','Records Before', beforeDateStr);
                records = RecordsToSync.getRecordsToDelete(beforeDateStr);
            }
            nlapiLogExecution('debug', 'getRecords ', 'step-2  ' + records.length);
            return records;
        },
        /**
         * sends records to Salesforce using its API
         */
        processRecords: function(records) {
            var context = nlapiGetContext();
            nlapiLogExecution('DEBUG', 'inside processRecords', 'processRecords');
            var count = records.length;
            nlapiLogExecution('DEBUG', 'value of count', count);
            var recordObject;

            for(var i = 0; i < count; i++) {

                try {
                    //nlapiDeleteRecord('customrecord_salesrep_translog',records[i].internalId);
                    if(this.rescheduleIfNeeded(context)) {
                        return;
                    }
                } catch(e) {
                    nlapiLogExecution('ERROR', 'Error during processRecords', e.toString());
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

                if(usageRemaining < 100) {
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
function recordsToSyncClearScheduled(type) {
    return RecordsToSyncClear.scheduled(type);
}

