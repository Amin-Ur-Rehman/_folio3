/**
 * Created by wahajahmed on 8/11/2015.
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
 * WotpClient class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var RecordsToSyncUE = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function (type, form, request) {
            //TODO: Write Your code here
        },
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit
         *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF)
         *                      markcomplete (Call, Task)
         *                      reassign (Case)
         *                      editforecast (Opp, Estimate)
         * @returns {Void}
         */
        userEventBeforeSubmit: function (type) {



        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, delete, xedit,
         *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
         *                      pack, ship (IF only)
         *                      dropship, specialorder, orderitems (PO only)
         *                      paybills (vendor payments)
         * @returns {Void}
         */
        userEventAfterSubmit: function (type) {
            try {
                if (type.toString() === 'create' || type.toString() === 'edit') {
                    var recordId = nlapiGetRecordId();
                    var recordType = nlapiGetRecordType();
                    nlapiLogExecution('DEBUG', 'recordId  #  recordType', recordId + '  #  ' + recordType);
                    if(this.recordEligibleToSync(type, recordType)) {
                        var recordToSyncObj = {};
                        recordToSyncObj[RecordsToSync.FieldName.RecordId] = recordId;
                        recordToSyncObj[RecordsToSync.FieldName.RecordType] = recordType;
                        recordToSyncObj[RecordsToSync.FieldName.Status] = RecordsToSync.Status.Pending;
                        RecordsToSync.upsert(recordToSyncObj);

                        var params = [];
                        params[ConnectorConstants.ScheduleScriptInvokedFormUserEvent] = 'T';
                        var status = nlapiScheduleScript(ConnectorConstants.SuiteScripts.ScheduleScript.CustomerExportToMagento.id,
                            ConnectorConstants.SuiteScripts.ScheduleScript.CustomerExportToMagento.deploymentIdInvokedFormUserEvent, params);
                        nlapiLogExecution('DEBUG', 'schedule script status', status);
                    }
                }
            }
            catch (ex) {
                var err = '';
                if (ex instanceof nlobjError) {
                    err = 'Code: ' + ex.getCode() + ',  Detail: ' + ex.getDetails();
                } else {
                    err = ex.toString();
                }
                nlapiLogExecution('ERROR', 'error in RecordsToSyncUE.userEventAfterSubmit', err);
            }
        },

        /**
         * Check if record is eligible to sync or not
         * @param recordType
         */
        recordEligibleToSync: function(type, recordType) {
            if(recordType == RecordsToSync.RecordTypes.Customer) {
                if(type == 'create') {
                    return true;
                }
                var oldRecord = nlapiGetOldRecord();
                var newRecord = nlapiGetNewRecord();
                var oldTaxableFieldValue, newTaxableFieldValue;
                if(!!oldRecord) {
                    oldTaxableFieldValue = oldRecord.getFieldValue('taxable');
                }
                if(!!newRecord) {
                    newTaxableFieldValue = newRecord.getFieldValue('taxable');
                }
                nlapiLogExecution('DEBUG', 'oldTaxableFieldValue  #  newTaxableFieldValue', oldTaxableFieldValue + '  #  ' + newTaxableFieldValue);
                if(oldTaxableFieldValue != newTaxableFieldValue) {
                    return true;
                } else {
                    return false;
                }

            } else {
                return true;
            }
        }
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function RecordsToSyncUserEventBeforeLoad(type, form, request) {
    return RecordsToSyncUE.userEventBeforeLoad(type, form, request);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit
 *                      approve, reject, cancel (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF)
 *                      markcomplete (Call, Task)
 *                      reassign (Case)
 *                      editforecast (Opp, Estimate)
 * @returns {Void}
 */
function RecordsToSyncUserEventBeforeSubmit(type) {
    return RecordsToSyncUE.userEventBeforeSubmit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, delete, xedit,
 *                      approve, cancel, reject (SO, ER, Time Bill, PO & RMA only)
 *                      pack, ship (IF only)
 *                      dropship, specialorder, orderitems (PO only)
 *                      paybills (vendor payments)
 * @returns {Void}
 */
function RecordsToSyncUserEventAfterSubmit(type) {
    return RecordsToSyncUE.userEventAfterSubmit(type);
}
