/**
 * Created by zahmed on 13-Dec-14.
 */

SavedSearchesPriority = (function () {
    return {
        InternalId: 'customrecord_itemexport_searches_priorit',
        FieldName: {
            SavedSearchId: 'custrecord_iesp_saved_search_id',
            Priority: 'custrecord_iesp_priority',
            Status: 'custrecord_iesp_status'
        },
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG', 'SavedSearchesPriority.upsert', id);
            } catch (e) {
                nlapiLogExecution('ERROR', 'SavedSearchesPriority.upsert', e.toString());
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
                    // always sort by priority
                    if (this.FieldName[i] === this.FieldName.Priority) {
                        col.setSort(false);
                    }
                    cols.push(col);
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                nlapiLogExecution('ERROR', 'SavedSearchesPriority.lookup', e.toString());
            }
            return result;
        },
        updateStatus: function (savedSearchId, status) {
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.SavedSearchId, null, 'is', savedSearchId, null));
            var result = this.lookup(fils);

            var obj = {};
            obj[this.FieldName.SavedSearchId] = savedSearchId;
            obj[this.FieldName.Status] = status;

            if (result.length === 0) {
                this.upsert(obj, null);
            } else {
                this.upsert(obj, result[0].getId());
            }
        },
        getPending: function () {
            // check if any script id already running
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.Status, null, 'is', 'Pending', null));
            var result = this.lookup(fils);
            return result;
        }
    };
})();