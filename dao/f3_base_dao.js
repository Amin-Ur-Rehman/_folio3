/**
 * Created by Ubaid Baig on 04-Feb-15.
 *
 * Description:
 * - This is a generic base class that has basic methods for CRUD operations on record type
 * -
 * Referenced By:
 * -
 * -
 * -
 * -
 * Dependency:
 * - f3_utility_methods.js
 */

var F3 = F3 || {};
F3.Storage = F3.Storage || {};

/**
 * This is a generic base class that has basic methods for CRUD operations on record type
 */
F3.Storage.BaseDao = (function () {
    return {
        /**
         * Gets record by Internal Id value you provide
         * @param internalId
         * @returns {*}
         */
        getById: function (internalId) {
            var arr = this.getAll([new nlobjSearchFilter('internalid', null, 'is', internalId)]);
            return arr.length == 1 ? arr[0] : null;
        },

        /**
         * Gets All records based on the filter you pass in
         * @param filters
         * @returns {Array}
         */
        getAll: function (filters) {
            var recs = null;
            var arr = [];
            var cols = null;
            var obj = null;
            try {
                filters = filters ? filters : [];

                var searchCols = this.getSearchColumns();
                recs = nlapiSearchRecord(this.INTERNAL_ID, null, filters, searchCols);
                if (recs && recs.length > 0) {
                    cols = recs[0].getAllColumns();

                    for (var x = 0; x < recs.length; x++) {
                        arr.push(this.getObject(recs[x], cols));
                    }
                }
            }
            catch (e) {
                Utility.logException('FC_Synch_BaseType.getAll', e);
                throw e;
            }
            return arr;
        },

        /**
         * Gets all records based on the filters, and sorts it accordingly
         * @param filters
         * @param sortCol
         * @param isDesc
         * @returns {Array}
         */
        getAllSortBy: function (filters, sortCol, isDesc) {
            var recs = null;
            var arr = [];
            var cols = null;
            var obj = null;
            try {
                filters = filters ? filters : [];
                recs = nlapiSearchRecord(this.INTERNAL_ID, null, filters, this.getSearchColumnsSortBy(sortCol, isDesc));
                if (recs && recs.length > 0) {
                    cols = recs[0].getAllColumns();
                    for (var x = 0; x < recs.length; x++) {
                        arr.push(this.getObject(recs[x], cols));
                    }
                }
            }
            catch (e) {
                Utility.logException('FC_Synch_BaseType.getAllSortBy', e);
                throw e;
            }
            return arr;
        },

        /**
         * Gets the value of object, based on row and column
         * @param row
         * @param cols
         * @returns {*}
         */
        getObject: function (row, cols) {
            var obj = null;
            if (row) {
                obj = { id: row.getId() };
                var nm = null;
                for (var x = 0; x < cols.length; x++) {
                    nm = cols[x].getName();
                    obj[nm] = row.getValue(cols[x]);
                }
            }
            return obj;
        },

        /**
         * Gets serach column based on the current fields.
         * @returns {Array}
         */
        getSearchColumns: function () {
            var cols = [];

            for (var x in this.FieldName) {
                var fieldName = this.FieldName[x];
                var searchCol = new nlobjSearchColumn(fieldName.toString(), null, null);
                cols.push(searchCol);
            }
            return cols;
        },

        /**
         * Creates Search Column
         * @param sortCol
         * @param isDesc
         * @returns {Array}
         */
        getSearchColumnsSortBy: function (sortCol, isDesc) {
            var cols = [];
            for (var x in this.FieldName) {
                if (this.FieldName[x] == sortCol) {
                    cols.push(new nlobjSearchColumn(this.FieldName[x]).setSort(isDesc));
                }
                else {
                    cols.push(new nlobjSearchColumn(this.FieldName[x]));
                }
            }
            return cols;
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
                    rec = Utility.isBlankOrNull(arg.id) ? nlapiCreateRecord(this.INTERNAL_ID) : nlapiLoadRecord(this.INTERNAL_ID, arg.id);
                    delete arg.id;
                    for (var x in arg) {
                        if (!Utility.isBlankOrNull(x)) {
                            rec.setFieldValue(x, arg[x]);
                        }
                    }
                    id = nlapiSubmitRecord(rec, true);
                }
                catch (e) {
                    Utility.logException('FC_Synch_BaseType.upsert', e);
                    throw e;
                }
            }
            return id;
        },

        /**
         * Deletes record from table.
         * @param id
         */
        remove: function (id) {
            try {
                nlapiDeleteRecord(this.INTERNAL_ID, id);
            }
            catch (e) {
                Utility.logException('FC_Synch_BaseType.delete', e);
                throw e;
            }
        }
    }
})();
