/**
 * Created by ubaig on 28/08/2015.
 * TODO:
 * -
 * -
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */


/**
 * Map()
 */
var Map = function () {
    this.data = {};
    this.put = function (k, v) {
        this.data[k] = v;
    };
    this.get = function (k) {
        return this.data[k];
    };
    this.keys = function () {
        var k = [];
        for (var x in this.data) {
            if (x && x != '')
                k.push(x);
        }
        return k;
    };
    this.getMap = function () {
        return this.data;
    };
}
var List = (function () {
    return {
        sort: function (lst, idx) {
            var len = lst.length;
            var temp;
            for (var j = 0; j < len - 1; j++) {
                for (var k = j + 1; k < len; k++) {
                    if (idx) {
                        if (lst[j][idx].toUpperCase() > lst[k][idx].toUpperCase()) {
                            temp = lst[k];
                            lst[k] = lst[j];
                            lst[j] = temp;
                        }
                    }
                    else {
                        if (lst[j].toUpperCase() > lst[k].toUpperCase()) {
                            temp = lst[k];
                            lst[k] = lst[j];
                            lst[j] = temp;
                        }
                    }
                }
            }
        }
    }
})();
var StringUtil = (function () {
    return {
        trim: function (str) {
            return str.replace(/^\s+|\s+$/g, '');
        },
        ltrim: function (str) {
            return str.replace(/^\s+/, '');
        },
        rtrim: function (str) {
            return str.replace(/\s+$/, '');
        },
        isEmpty: function (str) {
            return str == null || typeof(str) == 'undefined' || str.length == 0;
        },
        isEmptyIgnoreSpace: function(str) {
            return this.isEmpty(str) || (str != null && this.trim(str) == '');
        },
        escapeJson: function (str) {
            //str = str.repace(/\'/g, '\'');
        }
    };
})();

var JsonUtil = (function () {
    return {
        removeDuplicate: function (record_type) {
            var types = [], types_obj = [];
            record_type.forEach(function (value){
                if(types.indexOf(value.custrecord_fc_sss_recordtype) === -1){
                    types.push(value.custrecord_fc_sss_recordtype);
                    types_obj.push(value);
                }
            });
            return types_obj;
        }
    };
})();

/**
 * Record Utility Functions
 */
var RecordUtil = (function () {
    return {
        /**
         * Converts a given NetSuite record to json object.
         * @param rec nlobjRecord
         * @returns {{}} json
         * @constructor
         */
        convertRecordToJson: function (rec) {
            var finalJson = {};

            finalJson.recordType = rec.type;
            finalJson.internalid = rec.id;

            var allFields = rec.getAllFields();

            finalJson.fields = [];

            allFields.forEach(function (field) {

                finalJson.fields.push({
                    "internalid": field,
                    "value": rec.getFieldValue(field)
                });
            });

            var lineItems = rec.getAllLineItems();

            //if there are line items, so create an array to fill this
            if (lineItems.length > 0) {
                finalJson.lists = [];

                lineItems.forEach(function (lineItem) {
                    var count = rec.getLineItemCount(lineItem);

                    if (count > 0) {
                        var lineItemFields = rec.getAllLineItemFields(lineItem);

                        var listItem = {};
                        listItem.internalid = lineItem;
                        listItem.rows = [];

                        for (var i = 1; i <= count; i++) {

                            lineItemFields.forEach(function (lineItemField) {
                                listItem.rows.push({
                                    "internalid": lineItemField,
                                    "value": rec.getLineItemValue(lineItem, lineItemField, i)
                                });
                            });
                        }

                        finalJson.lists.push(listItem);
                    }
                });
            }

            return finalJson;
        },
        /**
         * Description of method getJson, gets the json object from record type
         * @param parameter
         */
        getJson: function (rec) {
            var finalJson = {};

            finalJson.recordType = rec.getRecordType();
            finalJson.internalid = rec.getId();

            finalJson.fields = [];
            finalJson.lists = [];

            return finalJson;
        }
    };
})();
