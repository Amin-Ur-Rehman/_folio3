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
 * MagentoCustomPricingDao class that has the functionality of record manipulation for 'Magento Custom Pricing' custom record
 */
var MagentoCustomPricingDao = (function () {
    return {
        InternalId: 'customrecord_f3mg_og_aw_pricing',
        FieldName: {
            Item: 'custrecord_f3mg_og_aw_pricing_item',
            Price: 'custrecord_f3mg_og_aw_pricing_price',
            WebsiteID: 'custrecord_f3mg_og_aw_pricing_websiteid',
            MagentoID: 'custrecord_f3mg_og_aw_pricing_magentoid'
        },
        /**
         * Perform a record search using filters and columns.
         * @governance 10 units
         * @restriction returns the first 1000 rows in the search
         *
         * @param {nlobjSearchFilter, nlobjSearchFilter[]} [filters] [optional] A single nlobjSearchFilter object - or - an array of nlobjSearchFilter objects.
         * @return {nlobjSearchResult[]} Returns an array of nlobjSearchResult objects corresponding to the searched records.
         *
         * @since    Jan 12, 2015
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
                Utility.logException('RecordsToSync.lookup', e);
            }
            return result;
        },
        /**
         * Getting record information from custom table
         * @returns {Array} Returns an array of objects
         */
        getRecords: function (itemId) {
            var records = [];
            var filters = [];
            filters.push(new nlobjSearchFilter(this.FieldName.Item,null,'is',itemId));
            var res = this.lookup(filters);
            for (var i = 0; i < res.length; i++) {
                var rec = res[i];
                var internalId = rec.getId();
                var itemId = rec.getValue(this.FieldName.Item, null, null);
                var price = rec.getValue(this.FieldName.Price, null, null);
                var websiteId = rec.getValue(this.FieldName.WebsiteID, null, null);
                var magentoId = rec.getValue(this.FieldName.MagentoID, null, null);
                var obj = {
                    internalId: internalId,
                    itemId: itemId,
                    price: price,
                    websiteId: websiteId,
                    magentoId: magentoId
                };
                records.push(obj);
            }
            //Utility.logDebug('MagentoCustomPricingDao.getRecords', JSON.stringify(records));
            return records;
        },

        /**
         * Either inserts or updates data. Upsert = Up[date] + [In]sert
         * @param arg
         * @returns {*}
         */
        upsert: function (arg) {
            var id = null;
            var rec = null;
            if (arg) {
                try {
                    rec = Utility.isBlankOrNull(arg.id) ? nlapiCreateRecord(this.InternalId) : nlapiLoadRecord(this.InternalId, arg.id);
                    delete arg.id;
                    for (var x in arg) {
                        if (!Utility.isBlankOrNull(x)) {
                            rec.setFieldValue(x, arg[x]);
                        }
                    }
                    id = nlapiSubmitRecord(rec, true);
                }
                catch (e) {
                    Utility.logException('RecordsToSync.upsert', e);
                }
            }
            return id;
        }
    };
})();