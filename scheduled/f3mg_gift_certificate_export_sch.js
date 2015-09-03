/**
 * Created by wahajahmed on 8/27/2015.
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
 * GiftCardExportHelper class that has the actual functionality of Gift Certificate records export functionality.
 * All business logic will be encapsulated in this class.
 */
var GiftCertificateExportHelper = (function () {
    return {

        startTime: null,
        minutesAfterReschedule: 15,

        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {
                this.startTime = (new Date()).getTime();

                if (!MC_SYNC_CONSTANTS.isValidLicense()) {
                    Utility.logDebug('LICENSE', 'Your license has been expired.');
                    return null;
                }

                // initialize constants
                ConnectorConstants.initialize();

                // getting configuration
                var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
                var context = nlapiGetContext();
                var orderIds, externalSystemArr;

                nlapiLogExecution('DEBUG', 'Starting', '');
                externalSystemArr = this.extractExternalSystems(externalSystemConfig);
                if (externalSystemArr.length <= 0) {
                    Utility.logDebug('Gift Certificate Export Script', 'Store(s) is/are not active');
                    return null;
                }

                for (var i in externalSystemArr) {
                    var store = externalSystemArr[i];
                    ConnectorConstants.CurrentStore = store;
                    Utility.logDebug('debug', 'Step-2');
                    var records = this.getRecords();
                    Utility.logDebug('debug', 'Step-3');
                    if (!!records&& records.length > 0) {
                        Utility.logDebug('fetched gift cert items count', records.length);
                        var completed = GiftCertificateHelper.processRecords(records, store);
                        if(!completed) {
                            // Processing not completed, and rescheduled
                            return null;
                        }
                    }
                    else {
                        nlapiLogExecution('DEBUG', ' No records found to process', '');
                    }
                    if (this.rescheduleIfNeeded(context, null)) {
                        return null;
                    }
                }
                nlapiLogExecution('DEBUG', ' Ends', '');
            }
            catch (e) {
                nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
            }
        },

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
        getRecords: function () {
            return GiftCertificateHelper.getRecords();
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
                nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

                if (minutes > this.minutesAfterReschedule) {
                    this.rescheduleScript(context, params);
                    return true;
                }

            }
            catch (e) {
                nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
            }
            return false;
        },

        /**
         * sends records to magento using its API
         */
        processRecords: function (records) {
            var context = nlapiGetContext();


            nlapiLogExecution('DEBUG', 'inside processRecords', 'processRecords');

            //HACK: Need to remove this
            var count = records.length;

            nlapiLogExecution('DEBUG', 'value of count', count);

            for (var i = 0; i < count; i++) {
                try {



                    if (this.rescheduleIfNeeded(context, null)) {
                        return;
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error during processRecords', e.toString());
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
function GiftCertificateExportHelperScheduled(type) {
    return GiftCertificateExportHelper.scheduled(type);
}