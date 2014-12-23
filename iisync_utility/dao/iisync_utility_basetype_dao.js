var IISyncUtilityBaseType = (function () {
    return {
        getById: function (internalId) {
            var arr = this.getAll([new nlobjSearchFilter('internalid', null, 'is', internalId)]);
            return arr.length == 1 ? arr[0] : null;
        },
        getAll: function (fils) {
            var recs = null;
            var arr = [];
            var cols = null;
            var obj = null;
            try {
                fils = fils ? fils : [];

                var searchCols = this.getSearchColumns();
                nlapiLogExecution('DEBUG', 'value of searchCols', JSON.stringify(searchCols));

                nlapiLogExecution('DEBUG', 'value of this.INTERNAL_ID', this.INTERNAL_ID);
                recs = nlapiSearchRecord(this.INTERNAL_ID, null, fils, searchCols);

                nlapiLogExecution('DEBUG', 'value of recs', JSON.stringify(recs));
                if (recs && recs.length > 0) {
                    cols = recs[0].getAllColumns();
                    //nlapiLogExecution('DEBUG', 'value of cols', JSON.stringify(cols));
                    for (var x = 0; x < recs.length; x++) {
                        arr.push(this.getObject(recs[x], cols));
                    }
                }
            }
            catch (e) {
                nlapiLogExecution('ERROR', 'IISyncUtilityBaseType.getAll', e.toString());
                throw e;
            }
            return arr;
        },
        getAllSortBy: function (fils, sortCol, isDesc) {
            var recs = null;
            var arr = [];
            var cols = null;
            var obj = null;
            try {
                fils = fils ? fils : [];
                recs = nlapiSearchRecord(this.INTERNAL_ID, null, fils, this.getSearchColumnsSortBy(sortCol, isDesc));
                if (recs && recs.length > 0) {
                    cols = recs[0].getAllColumns();
                    for (var x = 0; x < recs.length; x++) {
                        arr.push(this.getObject(recs[x], cols));
                    }
                }
            }
            catch (e) {
                nlapiLogExecution('ERROR', 'IISyncUtilityBaseType.getAllSortBy', e.toString());
                throw e;
            }
            return arr;
        },
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
        getSearchColumns: function () {
            var cols = [];

            for (var x in this.FieldName) {
                var fieldName = this.FieldName[x];
                nlapiLogExecution('DEBUG', 'value of fieldName', fieldName);
                var searchCol = new nlobjSearchColumn(fieldName.toString(), null, null);
                nlapiLogExecution('DEBUG', 'value of searchCol', JSON.stringify(searchCol));
                cols.push(searchCol);
            }
            return cols;
        },
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
        upsert: function (arg) {
            var id = null;
            var rec = null;
            if (arg) {
                try {
                    rec = (!arg.id || arg.id.length <= 0) ? nlapiCreateRecord(this.INTERNAL_ID) : nlapiLoadRecord(this.INTERNAL_ID, arg.id);
                    delete arg.id;
                    for (var x in arg) {
                        if (!!x && x.length > 0) {
                            rec.setFieldValue(x, arg[x]);
                        }
                    }
                    id = nlapiSubmitRecord(rec, true);
                }
                catch (e) {
                    nlapiLogExecution('ERROR', 'IISyncUtilityBaseType.upsert', e.toString());
                    throw e;
                }
            }
            return id;
        },
        remove: function (id) {
            try {
                nlapiDeleteRecord(this.INTERNAL_ID, id);
            }
            catch (e) {
                nlapiLogExecution('ERROR', 'IISyncUtilityBaseType.delete', e.toString());
                throw e;
            }
        }
    };
})();
