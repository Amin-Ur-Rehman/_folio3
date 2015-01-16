/**
 * Created by zahmed on 22-Dec-14.
 */

/**
 * Created by zahmed on 22-Dec-14.
 * A module for verification of Folio3 Connector's Feature Verification
 * -
 * Referenced By:
 * -
 * Dependencies:
 * - NetSuite APIs
 */

/**
 * Folio3 Connector Feature Verification class is responsible for validating feature which
 * will be provided to the users with Folio3 Connectors.
 */
Folio3FeaturesVerification = (function () {
    var _serverUrl = 'http://202.142.150.38:3000/get_permissions.json';

    /**
     * Creates instance of the class
     * @constructor
     */
    function Folio3FeaturesVerification() {
        //We can initialize default values here
    }

    /**
     * Validates license for the specified account
     * @param connectorInfo
     * @returns {*}
     */
    Folio3FeaturesVerification.prototype.getPermissions = function (connectorInfo) {

        var permissionObj = {};
        try {
            nlapiLogExecution('DEBUG', 'connectorInfo', JSON.stringify(connectorInfo));
            var URL = _serverUrl;
            var urlString = URL;
            var postData = {
                account_id: connectorInfo.accountId,
                internal_id: connectorInfo.internalId
            };
            //var response = nlapiRequestURL(urlString, postData);  TODO: undo
            /****************test start****************/
            var response = {};
            response.getBody = function () {
                //return JSON.stringify({permissions: {salesorder: true, customer: true, item: false}, mask: 1023});
                return JSON.stringify({
                    features: {
                        "cybersource": 1,
                        "itemsync": 2,
                        "customersync": 4,
                        "ordersync": 8,
                        "fulfilmentsync": 16,
                        "creditmemosync": 32,
                        "invoicesync": 64,
                        "licensevalidation": 128,
                        "mappingui": 256,
                        "itemexport": 512
                    },
                    mask: 1023
                });
            };
            /****************test end****************/
            var responseResult = response.getBody();
            var jsonResult = JSON.parse(responseResult);
            nlapiLogExecution('DEBUG', 'jsonResult', JSON.stringify(jsonResult));

            if (jsonResult.features) {
                permissionObj.features = jsonResult.features;
                permissionObj.mask = jsonResult.mask;
            }

        } catch (ex) {
            //nlapiLogExecution('ERROR', 'error in func validateLicense.', ex.toString() +
            //  ", connectorInfo = " + JSON.stringify(connectorInfo));
            nlapiLogExecution('ERROR', 'getPermissions', ex.toString());
        }
        return permissionObj;
    };

    //returns the current instance
    return Folio3FeaturesVerification;
})();