/**
 * Created by zahmed on 12-Jan-15.
 *
 * Description:
 * - This file is responsible for maintaining last running time of item sync module
 * -
 * Referenced By:
 * - connector_item_sch.js
 * -
 * Dependency:
 * - f3_utility_methods.js
 */

InventorySyncScript = (function () {
    return {
        InternalId: 'customrecord_inventory_sync_script',
        FieldName: {
            LastRunDateTime: 'custrecord_iss_last_run_date',// last run date time
            Name: 'custrecord_iss_name'
        },
        /**
         * Create or Update a record with specific name
         *
         * @param {object}  data
         * @param {int}     id The internal ID for the record.
         * @return {int}    id The internal ID for the record.
         *
         * @since    Jan 12, 2015
         */
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec, true, true);
            } catch (e) {
                logException('InventorySyncScript.upsert', e);
            }
            return id;
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
                    cols.push(new nlobjSearchColumn(this.FieldName[i], null, null));
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                logException('InventorySyncScript.lookup', e);
            }
            return result;
        },
        /**
         * Update status in the record with specific name
         *
         * @param {string} name
         * @param {datetime} lastRunDateTime
         * @return {void}
         *
         * @since    Jan 12, 2015
         */
        updateStatus: function (name, lastRunDateTime) {
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.Name, null, 'is', name, null));
            var result = this.lookup(fils);

            var obj = {};
            obj[this.FieldName.Name] = name;
            obj[this.FieldName.LastRunDateTime] = lastRunDateTime;

            if (result.length === 0) {
                this.upsert(obj, null);
            } else {
                this.upsert(obj, result[0].getId());
            }
        }
    };
})();