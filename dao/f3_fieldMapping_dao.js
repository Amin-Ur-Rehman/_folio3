var FieldMappingDao = (function() {
    return {
        InternalId: 'customrecord_magentofieldmappings',
        MagentoSyncOperation: {
            CREATE: 'create',
            UPDATE: 'update'
        },
        MagentoSyncRecord: {
            'Item': '1'
        },
        ArrayItemSourceType: {
            'Sublist': 'sublist',
            'Dynamic': 'dynamic'
        },
        getFieldMappings: function(magSyncRec, magOperation) {
            var filters = [];
            var cols = [];
            var levels = {};
            filters.push(new nlobjSearchFilter('custrecord_mappingtype', null, 'is', this.MagentoSyncRecord.Item));
            if (magOperation === this.MagentoSyncOperation.CREATE) filters.push(new nlobjSearchFilter('custrecord_magentocreate', null, 'is', 'T'));
            else if (magOperation === this.MagentoSyncOperation.UPDATE) filters.push(new nlobjSearchFilter('custrecord_magentoupdate', null, 'is', 'T'));
            cols.push(new nlobjSearchColumn('custrecord_fieldmapping'));
            cols.push(new nlobjSearchColumn('custrecord_mappinglevel'));
            var rec = nlapiSearchRecord(this.InternalId, null, filters, cols);
            return rec;
        },
        prepareDataFieldMap: function(mappingRecords) {
            var levels = {};
            var noOfLevels = 0;
            if (!!mappingRecords && mappingRecords.length > 0) {
                for (var i = 0; i < mappingRecords.length; i++) {
                    if (!levels['Level' + mappingRecords[i].getValue('custrecord_mappinglevel')]) {
                        levels['Level' + mappingRecords[i].getValue('custrecord_mappinglevel')] = [];
                        noOfLevels++;
                    }
                    levels['Level' + mappingRecords[i].getValue('custrecord_mappinglevel')].push(JSON.parse(mappingRecords[i].getValue('custrecord_fieldmapping')));
                }
            }
            levels['noOfLevels'] = noOfLevels;
            return levels;
        },
        parseFieldMapping: function(fieldMapping, runtimeValues, record) {
            var tempObj;
            var attribArray;
            var objectsArray = [];
            var arr;
            var objForXML = {};
            var parsedValue;
            for (var i = fieldMapping['noOfLevels']; i > 0; i--) {
                var arr = fieldMapping["Level" + i];
                parsedValue = '';
                for (var fld in arr) {
                    switch (arr[fld]["type"]) {
                        case 'Field':
                            tempObj = {};
                            if (arr[fld]["nsField"] === "") {
                                //Check for Default Value
                                if (arr[fld]["defaultValue"] !== "") {
                                    tempObj["__text"] = arr[fld]["defaultValue"];
                                }
                            } else {
                                parsedValue = record.getFieldValue(arr[fld]["nsField"]);
                                if (!!arr[fld]["lookup"]) {
                                    tempObj["__text"] = this.lookupValue(arr[fld]["lookup"], arr[fld]["lookupField"], parsedValue, arr[fld]["lookupValue"]);
                                } else {
                                    tempObj["__text"] = parsedValue;
                                }
                            }
                            attribArray = arr[fld]["attribs"];
                            if (!!attribArray) {
                                for (var v in attribArray) {
                                    // Need to handle dynamic value inside the attribute value
                                    if (!!attribArray[v] && attribArray[v] != "") tempObj["_" + v] = attribArray[v];
                                }
                            }
                            if (arr[fld]["parent"] !== "") {
                                if (objForXML[arr[fld]["parent"]] == null) {
                                    objForXML[arr[fld]["parent"]] = {};
                                }
                                objForXML[arr[fld]["parent"]][arr[fld]["externalSysField"]] = tempObj;
                            }
                            break;
                        case 'Object':
                            if (arr[fld]["parent"] !== "") {
                                if (objForXML[arr[fld]["parent"]] == null) {
                                    objForXML[arr[fld]["parent"]] = {};
                                }
                                attribArray = arr[fld]["attribs"];
                                if (!!attribArray) {
                                    for (var v in attribArray) {
                                        // Need to handle dynamic value inside the attribute value
                                        if (!!attribArray[v] && attribArray[v] != "") objForXML[arr[fld]["externalSysField"]]["_" + v] = attribArray[v];
                                    }
                                }
                                objForXML[arr[fld]["parent"]][arr[fld]["externalSysField"]] = objForXML[arr[fld]["externalSysField"]];
                            }
                            break;
                        case 'ArrayItem':
                            var itemArray = [];
                            if (arr[fld]["sourceType"] === this.ArrayItemSourceType.Dynamic) {
                                if (!!runtimeValues[arr[fld]["sourceName"]]) {
                                    for (var l = 1; l <= runtimeValues[arr[fld]["sourceName"]].length; l++) {
                                        parsedValue = runtimeValues[arr[fld]["sourceName"]][0]["systemid"];
                                        if (!!arr[fld]["lookup"]) {
                                            itemArray.push(this.lookupValue(arr[fld]["lookup"], arr[fld]["lookupField"], parsedValue, arr[fld]["lookupValue"]));
                                        } else {
                                            itemArray.push(parsedValue);
                                        }
                                    }
                                }
                            } else if (arr[fld]["sourceType"] === this.ArrayItemSourceType.Sublist) {
                                for (var l = 1; l <= record.getLineItemCount(arr[fld]["sourceName"]); l++) {
                                    parsedValue = record.getLineItemValue(arr[fld]["sourceName"], arr[fld]["sourceField"], l);
                                    if (!!arr[fld]["lookup"]) {
                                        itemArray.push(this.lookupValue(arr[fld]["lookup"], arr[fld]["lookupField"], parsedValue, arr[fld]["lookupValue"]));
                                    } else {
                                        itemArray.push(parsedValue);
                                    }
                                }
                            }
                            if (arr[fld]["parent"] !== "") {
                                if (objForXML[arr[fld]["parent"]] == null) {
                                    objForXML[arr[fld]["parent"]] = {};
                                }
                                objForXML[arr[fld]["parent"]][arr[fld]["externalSysField"]] = itemArray;
                            }
                            break;
                        case 'Array':
                            var tempAttribValue;
                            if (arr[fld]["parent"] !== "") {
                                if (objForXML[arr[fld]["parent"]] == null) {
                                    objForXML[arr[fld]["parent"]] = {};
                                }
                                attribArray = arr[fld]["attribs"];
                                if (!!attribArray) {
                                    for (var v in attribArray) {
                                        // Need to handle dynamic value inside the attribute value
                                        if (!!attribArray[v] && attribArray[v] != "") {
                                            tempAttribValue = attribArray[v];
                                            if (tempAttribValue.indexOf('length') > -1) {
                                                tempAttribValue = tempAttribValue.replace('length', objForXML[arr[fld]["externalSysField"]]["item"].length)
                                            }
                                            objForXML[arr[fld]["externalSysField"]]["_" + v] = tempAttribValue;
                                        }
                                    }
                                }
                                objForXML[arr[fld]["parent"]][arr[fld]["externalSysField"]] = objForXML[arr[fld]["externalSysField"]];
                            }
                            break;
                        case 'Dynamic':
                            tempObj = {};
                            tempObj["__text"] = runtimeValues[arr[fld]["dynamicProperty"]];
                            attribArray = arr[fld]["attribs"];
                            if (!!attribArray) {
                                for (var v in attribArray) {
                                    // Need to handle dynamic value inside the attribute value
                                    if (!!attribArray[v] && attribArray[v] != "") tempObj["_" + v] = attribArray[v];
                                }
                            }
                            if (arr[fld]["parent"] !== "") {
                                if (objForXML[arr[fld]["parent"]] == null) {
                                    objForXML[arr[fld]["parent"]] = {};
                                }
                                objForXML[arr[fld]["parent"]][arr[fld]["externalSysField"]] = tempObj;
                            }
                            break;
                    }
                }
            }
            return objForXML;
        },
        getJsonForXML: function(magSyncRec, magOperation, runtimeValues, record) {
            var mappingsRecs = this.getFieldMappings(magSyncRec, magOperation);
            Utility.logDebug("mappingsRecs", JSON.stringify(mappingsRecs));
            var fieldsMap = this.prepareDataFieldMap(mappingsRecs);
            Utility.logDebug("fieldsMap", JSON.stringify(fieldsMap));
            var jsonObj = this.parseFieldMapping(fieldsMap, runtimeValues, record);
            Utility.logDebug("jsonObj", JSON.stringify(jsonObj));
            var result = null;
            if (!!jsonObj["root"]) result = jsonObj["root"];
            return result;
        },
        lookupValue: function(lookupRecordType, lookupSourceField, lookupSourceFieldValue, lookupTargetField) {
            var rec = nlapiSearchRecord(lookupRecordType, null, [new nlobjSearchFilter(lookupSourceField, null, 'is', lookupSourceFieldValue)], [new nlobjSearchColumn(lookupTargetField)]);
            var result = '';
            if (!!rec && rec.length > 0) {
                result = rec[0].getValue(lookupTargetField);
            }
            return result;
        }
    };
})();