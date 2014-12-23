/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       14 July 2014     Ubaid Baig
 *
 *
 * Dependencies
 * - fc_query_engine.js
 * - fc_query_generator.js
 * - fc_sf_result_format.js
 *
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       23 July 2014     Ubaid
 *
 *SL2
 *  Record Type Control - distinct sourced from [TBL-SS.RecordType]
 *  Saved Search Control - sourced from [TBL-SS.SavedSearch] filter by [Record Type Control] at CL3 level
 *  Custom jquery Sublist – customized & populated at CL3 level
 *  Hidden field to hold the selected record internalids
 *  User can select any number of shown records in any page and then click Submit
 *
 *
 */


/*
 Global variables to reschedule script based on time limit.
 * */
var startTime;
var minutesAfterReschedule = 50;

/**
 * Get request method
 * @param request
 * @param response
 * @param notice
 */
function getMethod(request, response, notice) {
    try {

        var form, // NetSuite Form
          html; // inline html type field to display custom html

        form = nlapiCreateForm('Item Image Syncing');
        html = form.addField('inlinehtml', 'inlinehtml', '');

        //loginMagento(IISyncUtilityCommon.MagentoInfo.login, IISyncUtilityCommon.MagentoInfo.password);

        scheduled();

        response.writePage(form);
    } catch (e) {
        nlapiLogExecution('DEBUG', 'value of e', e.toString());
        throw e;
    }
}

/**
 * Suitelet main function
 * @param request
 * @param response
 */
function main(request, response) {
    try {
        var notice = '';

        getMethod(request, response, notice);
    } catch (e) {
        //Show error for now
        response.write("Error: " + e.name + ", " + e.message);
    }
}

/**
 * Gets record from DAO
 * @returns {*}
 */
function getRecords() {

    //HACK: TODO: Need to remove this hard coded id
    var filter = null; //new nlobjSearchFilter('internalid', null, 'is', 17687); //16573 1846 16580 15718 22215 19331

    nlapiLogExecution('DEBUG', 'value of ItemsForSyncing', IISyncUtilityCommon.SavedSearches.ItemsForSyncing);
    var records = nlapiSearchRecord(null, IISyncUtilityCommon.SavedSearches.ItemsForSyncing, filter, null);

    return records;
}

/**
 * Description of method getRecordFiles
 * @param searchTerm text based on which files will be searched
 * @return Array itemFiles item array
 */
function getRecordFiles(searchTerm) {
    var newFilters = [];
    var searchResult;
    try {
        var mainSearch = nlapiLoadSearch(null, IISyncUtilityCommon.SavedSearches.ItemRecordFiles);
        var filters = mainSearch.getFilters();

        if (!!filters && filters.length > 0) {
            var f = new nlobjSearchFilter('name', 'file', 'contains', [searchTerm]);
            newFilters.push(f);
            for (var i = 1; i < filters.length; i++) {
                var obj = filters[i];
                newFilters.push(obj);
            }
            searchResult = nlapiSearchRecord('folder', null, newFilters, mainSearch.getColumns() );
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main getRecordFiles', e.toString());
    }
    return searchResult;
}

/**
 * Reschedules only there is any need
 * @param context Context Object
 * @returns {boolean} true if rescheduling was necessary and done, false otherwise
 */
function rescheduleIfNeeded(context) {
    try {
        var usageRemaining = context.getRemainingUsage();

        if (usageRemaining < 4500) {
            rescheduleScript(context);
            return true;
        }

        var endTime = (new Date()).getTime();

        var minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
        nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime);
        // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

        if (minutes > minutesAfterReschedule) {
            rescheduleScript(context);
            return true;
        }

    }
    catch (e) {
        nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ' + usageRemaining);
    }
    return false;
}

/**
 * Description of method getFileByRecordAttributeName
 * @param parameter
 */
function getFileByRecordAttributeName(fileRecord, fileName) {
    var attResult = {
        fileInternalId : null,
        folderName: null
    };
    try {
        var response = null;
        var first = fileRecord[0];

        var col = first.getAllColumns();

        var nameColumn = col[1];
        var idColumn = col[0];
        var folderName = col[2];

        for (var i = 0; i < fileRecord.length; i++) {
            var obj = fileRecord[i];
            var val = obj.getValue(nameColumn);
            if (!!val) {
                val = val.toLowerCase();
            }
            if (val === fileName.toLowerCase()) {
                response = obj;
                break;
            }
        }

        if (!!response) {
            attResult.fileInternalId = response.getValue(idColumn);
            attResult.folderName = response.getValue(folderName);
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main getFileByRecordAttributeName', e.toString());
    }

    return attResult;
}


function getNetSuiteMagentoImageMapping(initName, folderName) {
    var type = 'NULL';
    if (initName.indexOf('front') >= 0) {
        type = IISyncUtilityCommon.ImageTypes[folderName];
    }

    return type;
}

/**
 * Gets item search term from item id/name
 * @param itemId
 * @returns {*}
 */
function getSearchTermByItem(itemId) {

    nlapiLogExecution('DEBUG', 'value of itemId', itemId);
    if (itemId.indexOf('_') > -1) {
        if (itemId.indexOf(':') > -1) {
            return itemId.split('_')[0].split(':')[0].trim();
        } else {
            return itemId.split('_')[0];
        }

    } else if (itemId.indexOf('-') > -1) {
        if (itemId.indexOf(':') > -1) {
            return itemId.split('-')[0].split(':')[0].trim();
        } else {
            return itemId.split('-')[0];
        }

    } else {
        return itemId;
    }
}

function getItemSku(itemId) {
    if (itemId.indexOf('_') > -1) {
        if (itemId.indexOf(':') > -1) {
            return itemId.split(':')[1].trim();
        } else {
            return itemId.split('_')[0];
        }

    } else {
        return itemId;
    }
}

/**
 * call to login into Magento Service
 * @param login
 * @param password
 */
function loginMagento(login, password) {

    //nlapiLogExecution('DEBUG', 'value of login password', login + ' ' + password);
    var sessionResponse = null;
    if (IISyncUtilityCommon.MagentoInfo.sessionId === null) {

        proxies.MagentoService.login.params.push('string');
        proxies.MagentoService.login.params.push('string');
        sessionResponse = proxies.MagentoService.login(login, password); // now call the server

        //nlapiLogExecution('DEBUG', 'value of sessionResponse', sessionResponse);
        var xml = nlapiStringToXML(sessionResponse);

        IISyncUtilityCommon.MagentoInfo.sessionId = nlapiSelectValue(xml, 'SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:loginResponse/loginReturn');
    }
    //nlapiLogExecution('DEBUG', 'value of sessionId', IISyncUtilityCommon.MagentoInfo.sessionId);
    return IISyncUtilityCommon.MagentoInfo.sessionId;

}

/**
 * Description of method getImageUploadXml
 * @param parameter
 */
function getImageUploadXml(magentoImageInfo) {
    var xml = '';
    try {
        xml = IISyncUtilityCommon.MagentoRequestXml.ImageUploadXml;

        xml = xml.replace('[CONTENT]', magentoImageInfo.content);
        xml = xml.replace('[MIME]', magentoImageInfo.mime);
        xml = xml.replace('[POSITION]', magentoImageInfo.position);

        if (magentoImageInfo.initName.indexOf('front_l') >= 0) {
            xml = xml.replace('[TYPE]', 'image</item><item>small_image');
        } else {
            if (magentoImageInfo.types === 'image' || magentoImageInfo.types === 'small_image') {
                xml = xml.replace('[TYPE]', 'NULL');
            } else {
                xml = xml.replace('[TYPE]', magentoImageInfo.types);
            }

        }

        if (magentoImageInfo.initName.indexOf('_back.jpg') >= 0 || magentoImageInfo.initName.indexOf('_back_l.jpg') >= 0) {
            xml = xml.replace('[LABEL]', 'back');
        } else {
            xml = xml.replace('[LABEL]', magentoImageInfo.name);
        }

        xml = xml.replace('[NAME]', magentoImageInfo.name);

        if (magentoImageInfo.initName.indexOf('_l.jpg') > -1) {
            xml = xml.replace('[EXCLUDE]', '0');
        } else {
            xml = xml.replace('[EXCLUDE]', '1');
        }


    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main getImageUploadXml', e.toString());
    }
    return xml;
}

/**
 * makes soap request to Magento
 * @param xml
 * @returns {document}
 */
function soapRequestToMagento(xml) {
    var res = nlapiRequestURL(IISyncUtilityCommon.MagentoInfo.apiUrl, xml);
    var resBody = res.getBody();
    //nlapiLogExecution('DEBUG', 'value of resBody', resBody);
    var responseXML = nlapiStringToXML(resBody);
    return responseXML;
}

/**
 * Calls Magento API to upload Image.
 * @param itemMagentoId
 * @param magentoImageInfo
 */
function uploadImageToMagento(currentRecord, itemMagentoId, magentoImageInfo) {

    var itemResponse = null;
    try {
        var sessionId = loginMagento(IISyncUtilityCommon.MagentoInfo.login, IISyncUtilityCommon.MagentoInfo.password);

        var xmlRequest = getImageUploadXml(magentoImageInfo);

        xmlRequest = xmlRequest.replace('[SESSIONID]', sessionId);
        xmlRequest = xmlRequest.replace('[PRODUCTID]', itemMagentoId + ' ');

        var finalXml = IISyncUtilityCommon.MagentoRequestXml.Header + xmlRequest + IISyncUtilityCommon.MagentoRequestXml.Footer;

        //nlapiLogExecution('DEBUG', 'value of xmlRequest', finalXml);

        //    var myXml = nlapiCreateFile('finalXml' + IISyncUtilityCommon.guid() +'.txt', 'PLAINTEXT', finalXml);
        //    myXml.setFolder(40396);
        //    nlapiSubmitFile(myXml);

        itemResponse = soapRequestToMagento(finalXml);
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main uploadImageToMagento itemResponse =', e.toString() + '___itemResponse =' + nlapiXMLToString(itemResponse));
        throw new Error(e.toString());
    }
    var imageResponse = nlapiSelectValue(itemResponse, 'SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductAttributeMediaCreateResponse/result');

    nlapiLogExecution('DEBUG', 'value of name and response', magentoImageInfo.initName + "_____" + imageResponse);

    return imageResponse;
}

/**
 * Gets proper image name as suggested by client
 * @param name
 * @param currentRecord
 */
function getProperImageName(name, currentRecord, recordSearchTerm) {
    var desc = currentRecord.getValue('purchasedescription');
    var color = currentRecord.getText('custitem3');

    if (!desc) {
        desc = recordSearchTerm;
    }

    var finalName = desc.replace(/ /g, '-') + '-' + color + '-' + recordSearchTerm;

    return finalName;
}


function getParentInfo(currentRecord) {
    var parentId = currentRecord.getValue('internalid', 'parent', null);
    var color = currentRecord.getText('custitem3');

    return {
        parentId: parentId,
        color: color
    };
}

/**
 * Gets parent SKU from DAO
 * @param parentInfo
 */
function getParentSku(parentInfo) {
    var parentSku = null;
    var filters = [];

    nlapiLogExecution('DEBUG', 'value of parentInfo', JSON.stringify(parentInfo));
    filters.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.Color, null, 'is', parentInfo.color));
    filters.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.ParentMatrixItem, null, 'is', parentInfo.parentId));

    var result = MatrixParentSyncStatus.lookup(filters);
    if (result != null && result.length > 0) {

        var r = result[0];
        parentSku = r.getValue(MatrixParentSyncStatus.FieldName.MagentoSku);
    }
    return parentSku;
}



/**
 * sends records to Salesforce using its API
 */
function processRecords(records) {
    var context = nlapiGetContext();
    var processedRecords = [];
    var parentProcessedRecords = [];

    customLogger('DEBUG', 'inside processRecords', 'processRecords');

    //HACK: Need to remove this
    var count = records.length;

    nlapiLogExecution('DEBUG', 'value of count', count);

    for (var i = 0; i < count; i++) {

        var currentRecord = records[i];
        var recordId = currentRecord.getId();

        if (processedRecords.indexOf(recordId) >= 0) {
            continue;
        }

        if (processedRecords.indexOf(recordId) <= -1) {
            processedRecords.push(recordId);
        }

        var parentInfo = getParentInfo(currentRecord);

        var parentSku = getParentSku(parentInfo);


        var imageResponse = '';
        try {

            //nlapiLogExecution('DEBUG', 'Processing Rec id = ', recordId);
            var itemId = currentRecord.getText('itemid');
            if (!itemId || itemId.length <= 0) {
                itemId = currentRecord.getValue('itemid');
            }

            if (!itemId || itemId.length <= 0) {
                //nlapiLogExecution('ERROR', 'Cannot proceed without Item Id / Name', '');
                return false;
            }
            //nlapiLogExecution('DEBUG', 'value of itemId', itemId);

            var itemMagentoId = parentSku; //getItemSku(itemId);//'D1109_BLUE_8'; //currentRecord.getValue('');

            if (parentProcessedRecords.indexOf(itemMagentoId) >= 0) {
                nlapiLogExecution('DEBUG', 'value of parentSku, already processed', parentSku);
                //markParentRecord(parentInfo);
                continue;
            }

            if (parentProcessedRecords.indexOf(itemMagentoId) <= -1) {
                parentProcessedRecords.push(itemMagentoId);
            }

            //adding one more check, to check this record in database.

            var filter = new nlobjSearchFilter(IISyncUtilityItemImageSyncStatus.FieldName.RECORD_ITEM_SKU, null, 'is', parentSku);
            var existingRecords = IISyncUtilityItemImageSyncStatus.getAll(filter);

            if (existingRecords !== null && existingRecords.length > 0) {
                nlapiLogExecution('DEBUG', 'value of parentSku, already processed, found in 2nd check.', parentSku);
                continue;
            }

            nlapiLogExecution('DEBUG', 'value of parentSku, and will process now', parentSku);

            var recordSearchTerm = getSearchTermByItem(itemId);

            nlapiLogExecution('DEBUG', 'value of recordSearchTerm', recordSearchTerm);

            var recordImages = getRecordFiles(recordSearchTerm);

            if (!recordImages || recordImages.length <= 0) {
                nlapiLogExecution('DEBUG', 'no images found for item id =', itemId);
                continue;
            }

            nlapiLogExecution('DEBUG', 'value of recordImages.length', recordImages.length);

            var imagePosition = 0;

            for (var j = 0; j < IISyncUtilityCommon.ImageCombinations.length; j++) {
                var imageInfo = null;
                var magentoImageInfo = {
                    mime: 'image/jpeg'
                };
                magentoImageInfo.position = imagePosition++;

                var obj = IISyncUtilityCommon.ImageCombinations[j];

                var initName = recordSearchTerm + '_' + currentRecord.getText('custitem3') + obj;

                magentoImageInfo.initName = initName;

                nlapiLogExecution('DEBUG', 'value of initName', initName);
                var attrResultInfo = getFileByRecordAttributeName(recordImages, initName);

                //nlapiLogExecution('DEBUG', 'value of attrResultInfo', JSON.stringify(attrResultInfo));
                if (attrResultInfo !== null && attrResultInfo.fileInternalId !== null) {
                    var magentoType = getNetSuiteMagentoImageMapping(initName, attrResultInfo.folderName);

                    //if we need to map / sync this then
                    if (!!magentoType) {

                        magentoImageInfo.types = magentoType;

                        //Here we need to find image file from the Record Values to File Search Stuff

                        if (!!attrResultInfo.fileInternalId) {

                            magentoImageInfo.fileInternalId = attrResultInfo.fileInternalId;

                            //we can process with this image
                            imageInfo = nlapiLoadFile(attrResultInfo.fileInternalId);

                            if (!!imageInfo) {
                                magentoImageInfo.name = getProperImageName(imageInfo.getName(), currentRecord, recordSearchTerm) + '-' + magentoImageInfo.position;
                                magentoImageInfo.content = imageInfo.getValue();
                            }
                        }
                    }

                    //nlapiLogExecution('DEBUG', 'value of initName and magentoImageInfo', initName + 'XX' + JSON.stringify(magentoImageInfo));
                    if (!!magentoImageInfo.content && magentoImageInfo.content.length > 0) {
                        imageResponse = 'NULL'; //uploadImageToMagento(currentRecord, itemMagentoId, magentoImageInfo) + imageResponse;
                    } else {
                        nlapiLogExecution('DEBUG', 'no image found for ', initName);
                    }
                } else {
                    nlapiLogExecution('DEBUG', 'no image found for ', initName);
                }
            }

            //markRecords(currentRecord, imageResponse, parentSku);

            var hasScheduled = false; //rescheduleIfNeeded(context);
            if (hasScheduled === true) {
                break;
            }
        } catch (e) {
            customLogger('ERROR', 'Error during processRecords', e.toString());
        }
    }

}

function markParentRecord(parentRecordInfo) {

    try {
        //set the item status value
        nlapiSubmitField('inventoryitem', parentRecordInfo.parentId, 'custitem_magento_sync_status', '40');
    } catch (e) {
        customLogger('ERROR', 'Error during markParentRecord', e.toString());
    }
}

/**
 * Marks record as completed
 */
function markRecords(currentRecord, status, parentSku) {

    try {
        var itemStatus = {};
        itemStatus[IISyncUtilityItemImageSyncStatus.FieldName.RECORD_ITEM_ID] = currentRecord.getId();
        itemStatus[IISyncUtilityItemImageSyncStatus.FieldName.RECORD_IMAGE_VALUE] = status;
        itemStatus[IISyncUtilityItemImageSyncStatus.FieldName.RECORD_ITEM_SKU] = parentSku;

        IISyncUtilityItemImageSyncStatus.upsert(itemStatus);

        //set the item status value
        nlapiSubmitField('inventoryitem', currentRecord.getId(), 'custitem_magento_sync_status', '40');
    } catch (e) {
        customLogger('ERROR', 'Error during markRecords', e.toString());
    }
}

/**
 * Custom Logging method
 * @param data1
 * @param data2
 * @param data3
 */
function customLogger(data1, data2, data3) {
    if (!window.console) {
        nlapiLogExecution(data1, data2, data3);
    } else {
        console.log(data1 + ' ' + data2 + ' ' + data3);
    }
}

/**
 * Call this method to reschedule current schedule script
 * @param ctx nlobjContext Object
 */
function rescheduleScript(ctx) {
    var status = 'SUITELET'; //nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), []);
    customLogger('DEBUG', 'Item Image Sync: Rescheduling..', 'status =' + status);
}

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    try {
        customLogger('DEBUG', 'Item Image Syncing Starting', '');
        var ctx = nlapiGetContext();
        var records = getRecords();

        startTime = (new Date()).getTime();

        if (records !== null && records.length > 0) {
            processRecords(records); //markRecords is called from within
        } else {
            customLogger('DEBUG', 'Item Image Syncing No records found to process', '');
        }

        customLogger('DEBUG', 'Item Image Syncing Ends', '');
    }
    catch (e) {
        customLogger('ERROR', 'Error during Item Image Syncing Script working', e.toString());
    }
}
