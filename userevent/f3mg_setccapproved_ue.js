/**
 * Created by zshaikh on 10/9/2015.
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
var SetCCApprovedUE = (function () {


    function getStore(storeId) {

        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
        var sessionID;

        var store = (function (externalSystemConfig, salesOrderStore) {
            var s;
            for (var i in externalSystemConfig) {
                var externalSystem = externalSystemConfig[i];
                if (externalSystem.systemId === salesOrderStore) {
                    s = externalSystem;
                    break;
                }
            }
            return s;
        })(externalSystemConfig, storeId);

        return store;
    }

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
            try {
                Utility.logDebug('SetCCApprovedUE.userEventBeforeLoad();', 'type: ' + type);
                if (type.toString() === 'create' || type.toString() === 'edit') {
                    var paymentMethod = nlapiGetFieldValue('paymentmethod');
                    var fromOtherSystem = nlapiGetFieldValue(ConnectorConstants.Transaction.Fields.FromOtherSystem);
                    var magentoStoreId = nlapiGetFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore);
                    Utility.logDebug('paymentMethod: ', paymentMethod);
                    Utility.logDebug('fromOtherSystem: ', fromOtherSystem);
                    Utility.logDebug('magentoStoreId: ', magentoStoreId);
                    if ( fromOtherSystem === 'T') {
                        var store = getStore(magentoStoreId);
                        ConnectorConstants.CurrentStore = store;
                        var isSupported = RefundExportHelper.isOnlineCapturingPaymentMethod(paymentMethod, store);
                        Utility.logDebug('isSupported: ', isSupported);
                        if (isSupported) {
                            nlapiSetFieldValue('ccapproved', 'T');
                            nlapiSetFieldValue('chargeit', 'F');
                        }
                    }
                }
                Utility.logDebug('SetCCApprovedUE.userEventBeforeLoad();', 'end');
            }
            catch (ex) {
                Utility.logException('Error in SetCCApprovedUE.userEventBeforeLoad', ex);
            }
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
            //TODO: Write Your code here
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
            //TODO: Write Your code here
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
function SetCCApprovedUEUserEventBeforeLoad(type, form, request) {
    return SetCCApprovedUE.userEventBeforeLoad(type, form, request);
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
function SetCCApprovedUEUserEventBeforeSubmit(type) {
    return SetCCApprovedUE.userEventBeforeSubmit(type);
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
function SetCCApprovedUEUserEventAfterSubmit(type) {
    return SetCCApprovedUE.userEventAfterSubmit(type);
}
