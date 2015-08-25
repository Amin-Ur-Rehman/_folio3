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
 * RecordsToSync class that has the functionality of record manipulation for 'Records To Sync' custom record
 */
var RecordsMagentoData = (function () {
    return {
        InternalId: 'customrecord_f3mg_records_magento_data',
        FieldName: {
            RecordId: 'custrecord_f3mg_rmd_record_id',
            RecordType: 'custrecord_f3mg_rmd_record_type',
            MagentoId: 'custrecord_f3mg_rmd_magento_id',
            OtherMagentoData: 'custrecord_f3mg_rmd_other_magento_data',
            Description: 'custrecord_f3mg_rmd_description'
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
                Utility.logException('RecordsMagentoData.lookup', e);
            }
            return result;
        },
        /**
         * Getting record information from custom table
         * @returns {Array} Returns an array of objects
         */
        getRecord: function (recordId, recordType) {
            var obj = null;
            var filters = [];
            filters.push(new nlobjSearchFilter(this.FieldName.RecordId,null,'is',recordId));
            filters.push(new nlobjSearchFilter(this.FieldName.RecordType,null,'is',recordType));
            var res = this.lookup(filters);
            if(!!res && res.length > 0) {
                var rec = res[0];
                var internalId = rec.getId();
                var recordId = rec.getValue(this.FieldName.RecordId, null, null);
                var recordType = rec.getValue(this.FieldName.RecordType, null, null);
                var magentoId = rec.getValue(this.FieldName.MagentoId, null, null);
                var otherMagentoData = rec.getValue(this.FieldName.OtherMagentoData, null, null);
                obj = {
                    internalId: internalId,
                    recordId: recordId,
                    recordType: recordType,
                    magentoId: magentoId,
                    otherMagentoData: otherMagentoData
                };
            }
            //Utility.logDebug('RecordsMagentoData.getRecord', JSON.stringify(obj));
            return obj;
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
                    Utility.logException('RecordsMagentoData.upsert', e);
                }
            }
            return id;
        }

    };
})();