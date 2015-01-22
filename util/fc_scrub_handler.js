var FC_ScrubHandler = (function() {

    //region Private

    var ScrubbingTypes =  {
        Lookup : 'lookup',
        Default : 'default',
        DefaultIfEmpty : 'defaultIfEmpty'
    };

    var DefaultIfEmptyScrubbingTypes = {
        Unique: 'unique',
        NonUnique: 'nonUnique'
    }

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
    function scrubDataByLookup(lookupValue, dataValue) {

        var scrubbedValue = '';

        var filters = [];
        var filter = new nlobjSearchFilter('formulatext', null, 'is', lookupValue);
        filter.setFormula('{custrecord_fc_scrub_type}');
        filters.push(filter);
        filters.push(new nlobjSearchFilter('custrecord_fc_scrub_key', null, 'is', dataValue));

        var columns = [];
        columns.push(new nlobjSearchColumn('custrecord_fc_scrub_value'));

        var res = nlapiSearchRecord('customrecord_fc_scrub', null, filters, columns);
        if(!!res && res.length > 0) {
            scrubbedValue = res[0].getValue('custrecord_fc_scrub_value');
        }

        return (!!scrubbedValue ? scrubbedValue : dataValue);
    }



    //endregion

    //region Public

    return {

        getAllScrubsList : function(mappingRecords) {
            var scrubsList = {};
            for (var i = 0; i < mappingRecords.length; i++) {
                var mappingRecord = mappingRecords[i];
                scrubsList[mappingRecord.custrecord_fc_sfm_fieldinternalid] = mappingRecord.custrecord_fc_sfm_scrub;
            }
            return scrubsList;
        },
        getScrubbedData : function(field, dataValue, fieldsScrubsList) {

            //nlapiLogExecution('DEBUG', 'getScrubbedData value of scrubsList', JSON.stringify(fieldsScrubsList));

            var scrubAttrs = fieldsScrubsList[field];
            if(!!scrubAttrs) {
                return this.scrubValue(scrubAttrs, dataValue);
            }

            return dataValue;
        },
        scrubValue : function(strScrubbingAttrs, dataValue) {
            var scrubbedValue = '';
            var scrubbingAttr = null;
            var scrubbingAttrs = getScrubbingAttrs(strScrubbingAttrs);


            if(!!scrubbingAttrs[ScrubbingTypes.Lookup]) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.Lookup];
                scrubbedValue = scrubDataByLookup(scrubbingAttr.value, dataValue);
            }

            if(!!scrubbingAttrs[ScrubbingTypes.Default]) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.Default];
                scrubbedValue = scrubbingAttr.value;
            }

            if(!!scrubbingAttrs[ScrubbingTypes.DefaultIfEmpty] && !dataValue) {
                scrubbingAttr = scrubbingAttrs[ScrubbingTypes.DefaultIfEmpty];
                if(scrubbingAttr.type == DefaultIfEmptyScrubbingTypes.NonUnique) {
                    scrubbedValue = scrubbingAttr.value;
                }
                else if(scrubbingAttr.type == DefaultIfEmptyScrubbingTypes.Unique) {
                    scrubbedValue = guid();
                }

            }

            return (!!scrubbedValue ? scrubbedValue : dataValue);
        }


    }

    //endregion



})();