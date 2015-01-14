/**
 * Created by ubaig on 8/4/2014.
 * A general purpose constants file to be used as a common point for constants or hard code values
 * -
 * Referenced By:
 * - fc_mapping_suitelet_3.js
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */

var MC_SYNC_CONSTANTS = {
    /**
     * Validates license for current connector
     * @returns {boolean}
     */
    _internalId: '43e91091b7684eb191e748623a1dffbd156721ac9fcb410aa25f785908f5a846',
    isValidLicense: function () {
        return true;// testing
        // test license check
        if ((new Date()).getTime() <= (new Date('1/15/2015')).getTime() && (new Date().getTime() <= 1421262000000)) {
            return true;
        } else {
            return false;
        }

        var isValidLicense = false;
        try {
            var licenseVerification = new Folio3ConnectorLicenseVerification();

            var connectorInfo = {};
            connectorInfo.accountId = nlapiGetContext().company;
            connectorInfo.internalId = this._internalId;

            var validationResult = licenseVerification.validateLicense(connectorInfo);

            //if we really get false from server response, it means license is not valid now.
            if (validationResult === false) {
                isValidLicense = false;
            } else {
                isValidLicense = true;
            }

        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main validateLicense', e.toString());
        }

        return isValidLicense;
    }
};