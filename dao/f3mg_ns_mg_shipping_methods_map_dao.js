/**
 * Created by zahmed on 13-Dec-14.
 *
 * Description:
 * - This file is responsible for handling shipping methods between NetSuite and Magento
 * -
 * Referenced By:
 * -
 * Dependency:
 * - f3_utility_methods.js
 */

NSToMGShipMethodMap = (function () {
    return {
        InternalId: 'customrecord_ns_mg_shipping_mehtods_map',
        FieldName: {
            MagentoShppingDesc: 'custrecord_smm_mg_shipping_desc',
            NetSuiteShippingMethod: 'custrecord_smm_ns_shipping_method'
        },
        /**
         * Add or update the record
         * @param {object} data
         * @param {inetger} id
         * @return {integer} id
         */
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                Utility.logDebug('NSToMGShipMethodMap.upsert', id);
            } catch (e) {
                Utility.logException('NSToMGShipMethodMap.upsert', e);
            }
            return id;
        },
        /**
         * Return atmost 1000 search records
         * @param {nlobjSearchFilter[],[],null} filters
         * @return {nlobjSearchResult[],[]} {Array}
         */
        lookup: function (filters) {
            var result = [];
            try {
                var cols = [];
                var fils = filters || [];
                for (var i in this.FieldName) {
                    var col = new nlobjSearchColumn(this.FieldName[i], null, null);
                    cols.push(col);
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                Utility.logException('NSToMGShipMethodMap.lookup', e);
            }
            return result;
        },
        /**
         * Get JSON array of shipping methods mapping between NetSuite and Magento
         * @return {object}
         */
        getMap: function () {
            var mapping = {};
            // this script will cater max 100 shipping method mapping
            var res = this.lookup(null);

            for (var i in res) {
                var map = res[i];
                var mgDesc = map.getValue(this.FieldName.MagentoShppingDesc);
                var nsMethod = map.getValue(this.FieldName.NetSuiteShippingMethod);

                if (!mapping.hasOwnProperty(mgDesc)) {
                    mapping[mgDesc] = nsMethod;
                }
            }
            return mapping;
        }
    };
})();