/**
 * Created by zahmed on 13-Dec-14.
 */

NSToMGShipMethodMap = (function () {
    return {
        InternalId: 'customrecord_ns_mg_shipping_mehtods_map',
        FieldName: {
            MagentoShppingDesc: 'custrecord_smm_mg_shipping_desc',
            NetSuiteShippingMethod: 'custrecord_smm_ns_shipping_method'
        },
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG', 'NSToMGShipMethodMap.upsert', id);
            } catch (e) {
                nlapiLogExecution('ERROR', 'NSToMGShipMethodMap.upsert', e.toString());
            }
            return id;
        },
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
                nlapiLogExecution('ERROR', 'NSToMGShipMethodMap.lookup', e.toString());
            }
            return result;
        },
        getMap: function () {
            var mapping = {};
            // this script will cater max 100 shipping method mappings
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