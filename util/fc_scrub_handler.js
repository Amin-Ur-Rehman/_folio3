var FC_ScrubHandler = (function () {

    //region Private

    var ScrubbingTypes = {
        Lookup: 'lookup',
        Default: 'default',
        DefaultIfEmpty: 'defaultIfEmpty'
    };

    var DefaultIfEmptyScrubbingTypes = {
        Unique: 'unique',
        NonUnique: 'nonUnique'
    };

    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })();

    /*
     Get scrubbing attributes
     */
    function getScrubbingAttrs(scrubbingAttr) {
        var parsedData = JSON.parse(scrubbingAttr);
        return parsedData;
    }

    /*
     Search lookup key with it corresponding value in 'customrecord_fc_scrub' custom record and return its value
     */
    function scrubDataByLookup(lookupValue, dataValue, isByValue) {

        var scrubbedValue = '';

        var key, value;

        if (!!isByValue) {
            key = 'custrecord_fc_scrub_value';
            value = 'custrecord_fc_scrub_key';
        } else {
            key = 'custrecord_fc_scrub_key';
            value = 'custrecord_fc_scrub_value';
        }

        var filters = [];
        var filter = new nlobjSearchFilter('formulatext', null, 'is', lookupValue, null);
        filter.setFormula('{custrecord_fc_scrub_type}');
        filters.push(filter);

        filters.push(new nlobjSearchFilter(key, null, 'is', dataValue, null));

        var columns = [];
        columns.push(new nlobjSearchColumn(value, null, null));

        var res = nlapiSearchRecord('customrecord_fc_scrub', null, filters, columns);
        if (!!res && res.length > 0) {
            scrubbedValue = res[0].getValue(value, null, null);
        }

        return (!!scrubbedValue ? scrubbedValue : dataValue);
    }


    //endregion

    //region Public

    return {
        /**
         * Get List of Scrubs for all fields in provided record
         * @return {*}
         * Note: Supported only for first 1000 scrubs
         */
        getAllScrubsList: function () {
            var scrubsList = {};

            // if scrub is already fecthed the return extisng one
            if (Object.keys(ConnectorConstants.ScrubsList).length > 0) {
                return ConnectorConstants.ScrubsList;
            }

            var columns = [];
            columns.push(new nlobjSearchColumn("custrecord_fc_system", null, null));
            columns.push(new nlobjSearchColumn("custrecord_fc_scrub_type", null, null));
            columns.push(new nlobjSearchColumn("custrecord_fc_scrub_key", null, null));
            columns.push(new nlobjSearchColumn("custrecord_fc_scrub_value", null, null));
            columns.push(new nlobjSearchColumn("internalid", null, null).setSort(false));

            var res = nlapiSearchRecord('customrecord_fc_scrub', null, null, columns);

            if (!!res && res.length > 0) {
                for (var i in res) {
                    var scrub = res[i];
                    var system = scrub.getValue("custrecord_fc_system") || "";
                    var type = scrub.getText("custrecord_fc_scrub_type") || "";
                    var key = scrub.getValue("custrecord_fc_scrub_key") || "";
                    var value = scrub.getValue("custrecord_fc_scrub_value") || "";

                    if (!scrubsList.hasOwnProperty(system)) {
                        scrubsList[system] = {};
                    }

                    if (!scrubsList[system].hasOwnProperty(type)) {
                        scrubsList[system][type] = {};
                    }

                    scrubsList[system][type][key] = value;
                }
            }

            return scrubsList;
        },

        /**
         * Find value by system, scrub type and key
         * @param {string} system
         * @param {string} type
         * @param {string} key
         * @return {string}
         * Note: If system value is found as blank string it means that it will be a global scrub
         * and saved in ""(blank) attribute in global object.
         */
        findValue: function (system, type, key) {
            var value = key;
            var scrubsList = ConnectorConstants.ScrubsList;
            if (scrubsList.hasOwnProperty(system)) {
                var _system = scrubsList[system];
                if (_system.hasOwnProperty(type)) {
                    var _type = _system[type];
                    if (_type.hasOwnProperty(key)) {
                        value = _type[key];
                    }
                }
            }
            return value;
        },

        /*
         Provide Scrubbed(cleaned) value of provided field
         Its fetched scrub attributes from provided fieldsScrubsList for this particular field
         */
        getScrubbedData: function (field, dataValue, fieldsScrubsList) {

            //nlapiLogExecution('DEBUG', 'getScrubbedData value of scrubsList', JSON.stringify(fieldsScrubsList));

            var scrubAttrs = fieldsScrubsList[field];
            if (!!scrubAttrs) {
                return this.scrubValue(scrubAttrs, dataValue);
            }

            return dataValue;
        },

        /*
         Apply data cleansing on data value on the basis of provided scrubbing attributes (strScrubbingAttrs)
         */
        scrubValue: function (strScrubbingAttrs, dataValue) {
            var scrubbedValue = '';
            var scrubbingAttr = null;
            var scrubbingAttrs = getScrubbingAttrs(strScrubbingAttrs);


            if (!!scrubbingAttrs[ScrubbingTypes.Lookup]) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.Lookup];
                scrubbedValue = scrubDataByLookup(scrubbingAttr.value, dataValue);
            }

            if (!!scrubbingAttrs[ScrubbingTypes.Default]) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.Default];
                scrubbedValue = scrubbingAttr.value;
            }

            if (!!scrubbingAttrs[ScrubbingTypes.DefaultIfEmpty] && !dataValue) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.DefaultIfEmpty];
                if (scrubbingAttr.type == DefaultIfEmptyScrubbingTypes.NonUnique) {
                    scrubbedValue = scrubbingAttr.value;
                }
                else if (scrubbingAttr.type == DefaultIfEmptyScrubbingTypes.Unique) {
                    scrubbedValue = guid();
                }

            }

            return (!!scrubbedValue ? scrubbedValue : dataValue);
        },

        /*
         Get mapped value of provided key of a given Object type from 'customrecord_fc_scrub' custom record
         */
        getMappedValue: function (objectType, key) {
            var val = scrubDataByLookup(objectType, key);
            return val;
        },
        /*
         Get mapped key of provided value of a given Object type from 'customrecord_fc_scrub' custom record
         */
        getMappedKeyByValue: function (objectType, value) {
            var val = scrubDataByLookup(objectType, value, true);
            return val;
        },

        /**
         * For shipping methods mapping from Magento to NetSuite using custom script column
         * @param objectType
         * @param key
         * @param dataObj
         * @return {*}
         * @private
         */
        _scrubDataByLookup: function (objectType, key, dataObj) {
            var scrubbedValue = '';
            var script;

            var filters = [];

            var filter = new nlobjSearchFilter('formulatext', null, 'is', objectType, null);
            filter.setFormula('{custrecord_fc_scrub_type}');
            filters.push(filter);

            filters.push(new nlobjSearchFilter('custrecord_fc_scrub_key', null, 'is', key, null));

            var columns = [];
            columns.push(new nlobjSearchColumn('custrecord_fc_scrub_value', null, null));
            columns.push(new nlobjSearchColumn('custrecord_fc_scrub_script', null, null));

            var res = nlapiSearchRecord('customrecord_fc_scrub', null, filters, columns);
            if (!!res && res.length > 0) {
                // get javascript code
                script = res[0].getValue('custrecord_fc_scrub_script', null, null);
                if (!!script) {
                    // make a javascript function using code of string
                    var customFunction = new Function('return ' + script)();
                    // call the recently made method
                    scrubbedValue = customFunction(dataObj);
                } else {
                    scrubbedValue = res[0].getValue('custrecord_fc_scrub_value', null, null);
                }
            }

            return !!scrubbedValue ? scrubbedValue : key;
        },
        /**
         * Get value by key
         * @param objectType
         * @param key
         * @param dataObj
         * @return {*}
         * @private
         */
        _getMappedValue: function (objectType, key, dataObj) {
            var val = this._scrubDataByLookup(objectType, key, dataObj);
            return val;
        }

    };

    //endregion


})();