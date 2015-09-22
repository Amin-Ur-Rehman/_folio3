/**
 * Created by zahmed on 27-May-15.
 *
 * Class Name: ErrorLog
 *
 * Description:
 * - This script is responsible for maintaining error history of imported records
 * -
 * Referenced By:
 * - connection_import_so.js
 * -
 * Dependency:
 * - f3_utility_methods.js
 */
var ErrorLog = (function () {
    return {
        InternalId: 'customrecord_error_log',
        FieldName: {
            RecordType: 'custrecord_el_record_type',
            RecordId: 'custrecord_el_record_id',
            Operation: 'custrecord_el_operation',
            ErrorMessage: 'custrecord_el_error_message'
        },

        System: {
            Magento: 'Magento',
            SalesForce: 'Salesforce',
            Ebay: 'eBay'
        },
        Operation: {
            Import: 'Import From ',
            Export: 'Export To '
        },
        RecordType: {
            SalesOrder: 'Sales Order',
            Customer: 'Customer',
            CustomerAddress: 'Customer Address',
            ItemFulfillment: 'Item Fulfillment'
        },

        /**
         * Create or Update a record with specific name
         *
         * @param {object}data
         * @param {int} [id] The internal ID for the record.
         * @return {int} The internal ID for the record.
         */
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id, null) : nlapiCreateRecord(this.InternalId, null);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec, true, true);
            } catch (e) {
                Utility.logException('ErrorLog.upsert', e);
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
                Utility.logException('ErrorLog.lookup', e);
            }
            return result;
        },
        /**
         *
         * @param {string} recordType
         * @param {string} recordId
         * @param {string} operation
         * @param {string} errorMessage
         */
        logErrorDetails: function (recordType, recordId, operation, errorMessage, system) {
            var data = {};

            data[this.FieldName.RecordType] = recordType;
            data[this.FieldName.RecordId] = recordId;
            data[this.FieldName.Operation] = operation + system;
            data[this.FieldName.ErrorMessage] = errorMessage;

            this.upsert(data);
        }

    };
})();


// ErrorLog.logError(ErrorLog.RecordType.SalesOrder, orderIncrementId, ErrorLog.Operation.Import, e.message, ErrorLog.System.Magento);