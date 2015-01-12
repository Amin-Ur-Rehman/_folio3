/**
 * Created by zahmed on 26-Dec-14.
 *
 * Description:
 * - This file contains commonly used methods
 * -
 * Referenced By:
 * - connector_salesorder_sch.js
 * - connector_customer_sch_new.js
 * - connector_item_sch.js
 * Dependency:
 * -
 */

function parseFloatNum(num) {
    var no = parseFloat(num);
    if (isNaN(no)) {
        no = 0;
    }
    return no;
}

function getDateUTC(offset) {
    var today = new Date();
    var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
    offset = parseInt(parseFloatNum(offset * 60 * 60 * 1000));
    today = new Date(utc + offset);
    return today;
}

function logException(fn, e) {
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
}

function logDebug(title, description) {
    if (!!window.console) {
        console.log('DEBUG :: ' + title + ' :: ' + description);
    } else {
        nlapiLogExecution('DEBUG', title, description);
    }
}