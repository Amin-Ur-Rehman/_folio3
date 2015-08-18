/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 September 2014     Ubaid Baig
 *
 */


function httpGet(dataIn) {

    nlapiLogExecution('DEBUG', 'Inside httpGet input = ', dataIn);
    return processRequest(dataIn);
}

function httpPost(dataIn) {
    nlapiLogExecution('DEBUG', 'Inside httpPost input = ', !dataIn ? "NULL" : JSON.stringify(dataIn));
    return processRequest(dataIn);
}

function httpDelete(dataIn) {
    nlapiLogExecution('DEBUG', 'Inside httpDelete input = ', dataIn);
    return processRequest(dataIn);
}