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
 * GiftCertificateUE class that has the actual functionality of gift certificate user event.
 * All business logic will be encapsulated in this class.
 */
var GiftCertificateUE = (function () {
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
                        if(!RecordsToSync.checkRecordAlreadyExist(recordId, recordType, RecordsToSync.Status.Pending)){
                            var recordToSyncObj = {};
                            recordToSyncObj[RecordsToSync.FieldName.RecordId] = recordId;
                            recordToSyncObj[RecordsToSync.FieldName.RecordType] = recordType;
                            recordToSyncObj[RecordsToSync.FieldName.Status] = RecordsToSync.Status.Pending;
                            recordToSyncObj[RecordsToSync.FieldName.Action] = RecordsToSync.Actions.SyncGiftCertificates;
                            RecordsToSync.upsert(recordToSyncObj);
                        }
                        //var params = [];
                        //params[ConnectorConstants.ScheduleScriptInvokedFormUserEvent] = 'T';
                        var status = nlapiScheduleScript(ConnectorConstants.SuiteScripts.ScheduleScript.GiftCertificateExportToMagento.id,
                            ConnectorConstants.SuiteScripts.ScheduleScript.GiftCertificateExportToMagento.deploymentId);
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
            return true;
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
function GiftCertificateUserEventBeforeLoad(type, form, request) {
    return GiftCertificateUE.userEventBeforeLoad(type, form, request);
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
function GiftCertificateUserEventBeforeSubmit(type) {
    return GiftCertificateUE.userEventBeforeSubmit(type);
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
function GiftCertificateUserEventAfterSubmit(type) {
    return GiftCertificateUE.userEventAfterSubmit(type);
}
