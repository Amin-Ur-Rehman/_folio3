/**
 * Created by zahmed on 22-Dec-14.
 * A general purpose constants file to be used as a common point for constants or hard code values
 * -
 * Referenced By:
 * -
 * Dependencies:
 * - NetSuite APIs
 * - folio3_connector_permission_verification.js
 * -
 */

var F3_PERMISSION_CONSTANTS = {
    permissionJson: null,
    mask: 0,
    features: {},
    /**
     * Feature permission current connector
     * @param {string} featureName
     * @returns {boolean}
     */
    _internalId: '43e91091b7684eb191e748623a1dffbd156721ac9fcb410aa25f785908f5a846',
    isPermitted: function (featureName) {
        var isAllowed = false;
        try {
            if (this.permissionJson === null) {
                var permissionsVerification = new Folio3FeaturesVerification();

                var connectorInfo = {};
                connectorInfo.accountId = nlapiGetContext().company;
                connectorInfo.internalId = this._internalId;

                var permissionResult = permissionsVerification.getPermissions(connectorInfo);
                if (permissionResult.hasOwnProperty('features')) {
                    this.features = permissionResult.features;
                }
                if (permissionResult.hasOwnProperty('mask')) {
                    this.mask = permissionResult.mask;
                }
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'F3_PERMISSION_CONSTANTS.isPermitted', e.toString());
        }

        if (this.features.hasOwnProperty(featureName)) {
            var featureValue = this.features[featureName];
            isAllowed = featureValue & this.mask;
        }

        return !!isAllowed;
    }
};
