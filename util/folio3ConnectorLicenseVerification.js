/**
 * Created by Ubaid-ur-Rehman Baig on 8/7/2014.
 * A module for verification of Folio3 Connector's License Verification
 *
 * The reason why nlapiLogExecution is used here, is because we didn't want to clutter this class
 * with the dependency of Utility class
 * -
 * Referenced By:
 * -
 * Dependencies:
 * - NetSuite APIs
 * - ScriptStoreDao [dao/f3_script_store_dao.js]
 */

/**
 * Folio3 Connector License Verification class is responsible for validating license of
 * users who uses Folio3 Connectors.
 */
Folio3ConnectorLicenseVerification = (function () {
    var _serverUrl = 'http://productstore.folio3.com/validate_license.json';
    var _toEmail = 'ubaig@folio3.com';
    var _lastLicenseCheckedOnKey = 'LLCOK';

    /**
     * Returns true or false if we need to send email or not
     * @returns {boolean}
     */
    var shouldSendEmail = function () {
        var shouldSendEmail = false;
        try {
            var infoSavedNow = false;
            var needToInsert = false;
            var licenseInfoCheck = ScriptStoreDao.getValue(_lastLicenseCheckedOnKey);
            //if we have never logged license error logged, lets do it

            if (!!licenseInfoCheck) {
                var lastCheckAt = licenseInfoCheck[ScriptStoreDao.FieldName.VALUE];
                var difference = Math.abs(new Date() - lastCheckAt);
                var differenceInDays = difference / (1000 * 60 * 60 * 24);
                if (differenceInDays > 1) {
                    needToInsert = true;
                }
            }

            if (!licenseInfoCheck || needToInsert === true) {
                licenseInfoCheck = licenseInfoCheck || {};
                licenseInfoCheck[ScriptStoreDao.FieldName.DEPLOYMENT_ID] = nlapiGetContext().getDeploymentId();
                licenseInfoCheck[ScriptStoreDao.FieldName.SCRIPT_ID] = nlapiGetContext().getScriptId();
                licenseInfoCheck[ScriptStoreDao.FieldName.KEY] = _lastLicenseCheckedOnKey;
                licenseInfoCheck[ScriptStoreDao.FieldName.VALUE] = new Date().getTime();

                //save it here in db
                ScriptStoreDao.upsert(licenseInfoCheck);
                infoSavedNow = true;
            }

            shouldSendEmail = needToInsert || infoSavedNow;
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main shouldSendEmail', e.toString());
        }

        return shouldSendEmail;
    }

    /**
     * Sends email about anything that might happen during license validation
     * @param ex Exception that occurred
     * @param accountId account Id in which this is all happening
     * @returns {boolean}
     */
    var sendEmail = function (ex, accountId) {
        try {

            var emailRequired = shouldSendEmail();
            if (emailRequired === true) {
                var emailBody = 'error in func validateLicense.' + ex.toString() +  ", Account Id = " + accountId;
                var emailSubject = '[License Validation Error]';
                nlapiSendEmail(nlapiGetContext().user, _toEmail, emailSubject, emailBody, null, null, null, null);
            }

            return true;
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main sendEmail', e.toString());
            return false;
        }
    };

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
            return sendEmail(ex, connectorInfo.accountId);
        }
    };

    //returns the current instance
    return Folio3ConnectorLicenseVerification;
})();