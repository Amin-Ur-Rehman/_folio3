/**
 * Created by zahmed on 07-Aug-14.
 */

function beforeSubmit(type) {
    try {
        if (MC_SYNC_CONSTANTS.isValidLicense()) {
            logContextInfo(type);
            if (type.toString() === 'create' || type.toString() === 'edit') {
                nlapiSetFieldValue('custitem_item_sync', 'T');
            }
        } else {
            nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
        }
    }
    catch (ex) {
        nlapiLogExecution('DEBUG', 'beforeSubmit', ex);
    }
}

function start(type) {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        logContextInfo(type);
        if (type.toString() === 'create' || type.toString() === 'edit') {
            var recid = nlapiGetRecordId();
            var rectype = nlapiGetRecordType();
            var rec = nlapiLoadRecord(rectype, recid);
            nlapiLogExecution('debug', rectype + recid);
            if (!!rec) {
                try {
                    rec.setFieldValue('custitem_item_sync', 'T');
                    nlapiLogExecution('debug', 'done ' + nlapiSubmitRecord(rec));
                }
                catch (ex) {
                    nlapiLogExecution('DEBUG', 'ex', ex);
                }
            }
        }
    } else {
        nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
    }
}

function logContextInfo(type) {
    var ctx = nlapiGetContext();
    nlapiLogExecution('DEBUG', 'type: ' + type, 'context: ' + ctx.getExecutionContext());
    nlapiLogExecution('DEBUG', 'scriptid: ' + ctx.getScriptId(), 'deployementid: ' + ctx.getDeploymentId());
}