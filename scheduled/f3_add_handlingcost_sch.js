/**
 * Created by zahmed on 25-Mar-15.
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
 * AddHandlingCost class that has the actual functionality of adding handling cost in synced magento orders
 * All business logic will be encapsulated in this class.
 */
var AddHandlingCost = (function () {
    return {

        minutesAfterReschedule: 50,
        startTime: (new Date()).getTime(),

        /**
         * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
         * @returns {Void}
         */
        scheduled: function (type) {
            try {

                var ctx = nlapiGetContext();

                var records = this.getRecords();

                if (records !== null && records.length > 0) {
                    this.processRecords(records); //markRecords is called from within
                } else {
                    nlapiLogExecution('DEBUG', ' No records found to process', '');
                }

                nlapiLogExecution('DEBUG', ' Ends', '');
            }
            catch (e) {
                nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
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

            var records = null;

            records = nlapiSearchRecord(null, 81);

            if (!records) {
                records = [];
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

                if (usageRemaining < 500) {
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
         * sends records to Salesforce using its API
         */
        processRecords: function (records) {
            var context = nlapiGetContext();


            nlapiLogExecution('DEBUG', 'inside processRecords', 'processRecords');

            //HACK: Need to remove this
            var count = records.length;

            nlapiLogExecution('DEBUG', 'value of count', count);

            for (var i = 0; i < count; i++) {
                var id = '';
                try {
                    var record = records[i];


                    var handlingCost = record.getValue('handlingcost');
                    var incrementId = record.getValue('custbody_magentoid');
                    id = record.getId();

                    nlapiLogExecution('DEBUG', 'Order ID ' + id, 'HandlingCost ' + handlingCost);

                    var baseUrl = 'https://www.purestcolloids.com/cart';
                    var url = baseUrl + '/f3-add-handling-cost-in-order.php?incrementid=' + incrementId + '&cost=' + handlingCost + '&method=setcost';

                    var response = nlapiRequestURL(url);

                    if (!!response) {
                        var responseObj = JSON.parse(response.getBody());

                        if (responseObj.status) {
                            this.markRecords(id);
                        }
                    }

                    if (this.rescheduleIfNeeded(context, null)) {
                        return;
                    }

                } catch (e) {
                    nlapiLogExecution('ERROR', 'Error during processRecords ' + id, e.toString());
                }
            }
        },

        /**
         * Marks record as completed
         */
        markRecords: function (id) {

            try {
                nlapiSubmitField('salesorder', id, 'custbody_handling_cost', 'T');
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
function AddHandlingCostScheduled(type) {
    return AddHandlingCost.scheduled(type);
}