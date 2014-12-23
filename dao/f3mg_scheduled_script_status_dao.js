/**
 * Created by zahmed on 02-Dec-14.
 */

ScheduledScriptStatus = (function () {
    return {
        InternalId: 'customrecord_scheduled_script_status',
        FieldName: {
            ScriptId: 'custrecord_sss_script_id',
            Status: 'custrecord_sss_status'
        },
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id) : nlapiCreateRecord(this.InternalId);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG', 'ScheduledScriptStatus.upsert', id);
            } catch (e) {
                nlapiLogExecution('ERROR', 'ScheduledScriptStatus.upsert', e.toString());
            }
            return id;
        },
        lookup: function (filters) {
            var result = [];
            try {
                var cols = [];
                var fils = filters || [];
                for (var i in this.FieldName) {
                    cols.push(new nlobjSearchColumn(this.FieldName[i]));
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                nlapiLogExecution('ERROR', 'ScheduledScriptStatus.lookup', e.toString());
            }
            return result;
        },
        updateStatus: function (scriptId, status) {
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.ScriptId, null, 'is', scriptId));
            var result = this.lookup(fils);

            var obj = {};
            obj[this.FieldName.ScriptId] = scriptId;
            obj[this.FieldName.Status] = status;

            if (result.length === 0) {
                this.upsert(obj, null);
            } else {
                this.upsert(obj, result[0].getId());
            }
        },
        isAlreadyRunning: function () {
            // check if any script id already running
            var fils = [];
            fils.push(new nlobjSearchFilter(this.FieldName.Status, null, 'is', '1', null));
            var result = this.lookup(fils);
            if (result.length === 0) {
                return false;
            }
            return true;
        }
    };
})();