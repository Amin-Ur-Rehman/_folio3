/**
 * Created by sameer on 8/31/15.
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
 * giftCertificate class that has the functionality of
 */
var giftCertificateImport = (function () {
    return {
        /**
         * Init method
         */

        internalId: 'giftcertificateitem',
        fields : {
            itemName: 'itemid',
            liabilityAccount: 'liabilityaccount',
            inactive: 'isinactive',
            description: 'storedetaileddescription',
            shortDescription: 'storedescription',
            taxSchedule: 'taxschedule'
        },
        getLiabilityAccount: function () {
            return '119';
        },
        getTaxSchedule: function () {
            return '1';
        }
    };
})();