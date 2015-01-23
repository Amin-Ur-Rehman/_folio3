/**
 * Created by zahmed on 26-Dec-14.
 *
 * Class Name: Utility
 * -
 * Description:
 * - This class contains commonly used methods
 * -
 * Referenced By:
 * - connector_salesorder_sch.js
 * - connector_customer_sch_new.js
 * - connector_item_sch.js
 * -
 * Dependency:
 * -
 */

Utility = (function () {
    return {
        /**
         * Init method
         */
        initialize: function () {

        },
        /**
         * Convert number to float
         *
         * @param {number,string,int} [num] string/integer/float number
         * @restriction returns 0 if num parameter is invalid
         * @return {float} floating number
         *
         * @since    Jan 12, 2015
         */
        parseFloatNum: function (num) {
            var no = parseFloat(num);
            if (isNaN(no)) {
                no = 0;
            }
            return no;
        },
        /**
         * This function returns the date using the given specified offset
         *
         * @param {number} offset number
         * @return {date} returns date
         *
         * @since    Jan 12, 2015
         */
        getDateUTC: function (offset) {
            var today = new Date();
            var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
            offset = parseInt(this.parseFloatNum(offset * 60 * 60 * 1000));
            today = new Date(utc + offset);
            return today;
        },
        /**
         * This function prints error logs in NetSuite server script or in browser console.
         *
         * @param {string} fn function name
         * @param {nlobjError, Exception}  e NetSuite or JavaScript error object
         * @return {void}
         *
         * @since    Jan 12, 2015
         */
        logException: function (fn, e) {
            var err = '';
            if (e instanceof nlobjError) {
                err = 'System error: ' + e.getCode() + '\n' + e.getDetails();
            }
            else {
                err = 'Unexpected error: ' + e.toString();
            }
            if (!!window.console) {
                console.log('ERROR :: ' + fn + ' :: ' + err);
            } else {
                nlapiLogExecution('ERROR', fn, err);
            }
        },
        /**
         * This function prints debug logs in NetSuite server script or in browser console.
         *
         * @param {string} title
         * @param {string}  description
         * @return {void}
         *
         * @since    Jan 12, 2015
         */
        logDebug: function (title, description) {
            if (!!window.console) {
                console.log('DEBUG :: ' + title + ' :: ' + description);
            } else {
                nlapiLogExecution('DEBUG', title, description);
            }
        },
        isBlankOrNull: function (str) {
            return str == null || str == undefined || typeof (str) == 'undefined' || str == 'undefined' || (str + '').trim().length == 0;
        },
        addZeroes: function (vle, requiredLength) {
            vle = vle.toString();
            var i = vle.length;

            while (i < requiredLength) {

                vle = '0' + vle;
                i++;
            }

            return vle;
        },
        // convert into to digits
        convertIntToDigit: function (num, length) {
            var str = '';
            if (!isNaN(num)) {
                num = parseInt(num);
                if (num >= 0) {
                    var numArr = new String(num);
                    if (numArr.length < length) {
                        var diff = length - numArr.length;
                        for (var i = 0; i < diff; i++) {
                            str += '0';
                        }
                    }
                    str += num;
                }
            }
            return str;
        },
        addslashes: function (str) {
            return  (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
        },
<<<<<<< HEAD

=======
>>>>>>> 805a7813f40e533f9ecf69ddb9fa19267938c4c4
        /**
         * Calculate the size of object
         * @param {object} obj
         * @return {number} Returns the count of attributes of object at first level
         */
        objectSize: function (obj) {
            var size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    size++;
                }
            }
            return size;
<<<<<<< HEAD
        },
        /**
         * Get Empty string for null
         * @param data
         * @return {data, ''}
         */        getBlankForNull: function (data) {
            var returnValue;
            if (this.isBlankOrNull(data)) {
                returnValue = '';
            } else {
                returnValue = data;
            }
            return returnValue;
        },
        /**
         * Check if NetSuite Account Type is One World
         * @return {boolean}
         */
        isOneWorldAccount: function () {
            return nlapiGetContext().getFeature('SUBSIDIARIES');
        },
        /**
         * Check if MultiLocation is enabled
         * @return {boolean}
         */
        isMultiLocInvt: function () {
            return nlapiGetContext().getFeature('MULTILOCINVT');
=======
>>>>>>> 805a7813f40e533f9ecf69ddb9fa19267938c4c4
        }

    };
})();