/**
 * Created by Ubaid-ur-Rehman Baig on 8/7/2014.
 * A module for verification of Folio3 Connector's License Verification
 * -
 * Referenced By:
 * -
 * Dependencies:
 * - NetSuite APIs
 */

/**
 * Folio3 Connector License Verification class is responsible for validating license of
 * users who uses Folio3 Connectors.
 */
Folio3ConnectorLicenseVerification = (function () {
    var _serverUrl = 'http://productstore.folio3.com/validate_license.json';
    var toEmail = 'ubaig@folio3.com';

    /**
     * Creates instance of the class
     * @constructor
     */
    function Folio3ConnectorLicenseVerification() {
        //We can initialize default values here
    }

    /**
     * Validates license for the specified account
     * @param connectorInfo
     * @returns {*}
     */
    Folio3ConnectorLicenseVerification.prototype.validateLicense = function (connectorInfo) {

        try {
            nlapiLogExecution('DEBUG', 'connectorInfo', JSON.stringify(connectorInfo));
            var URL = _serverUrl;
            var urlString = URL;
            var postData = {
                account_id: connectorInfo.accountId,
                internal_id: connectorInfo.internalId
            };
            var response = nlapiRequestURL(urlString, postData);
            var responseResult = response.getBody();
            var jsonResult = JSON.parse(responseResult);
            nlapiLogExecution('DEBUG', 'jsonResult', JSON.stringify(jsonResult));

            if (jsonResult.Result) {
                return true;
            } else {
                return false;
            }

        } catch (ex) {
            nlapiLogExecution('ERROR', 'error in func validateLicense.', ex.toString());

            try {
                var emailBody = 'error in func validateLicense.' + ex.toString() +
                    ", Account Id = " + connectorInfo.accountId;
                var emailSubject = 'License Validation Error';
                nlapiSendEmail(nlapiGetContext().user, toEmail, emailSubject, emailBody , null, null, null );

                return true;
            } catch (e) {
                nlapiLogExecution('ERROR', 'error in sending email at validateLicense.', ex.toString());
                return false;
            }
        }
    };

    //returns the current instance
    return Folio3ConnectorLicenseVerification;
})();