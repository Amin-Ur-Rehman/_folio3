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
var minutesAfterReschedule = 15;

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

        test();

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
function getRecords(lastId) {

    //HACK: TODO: Need to remove this hard coded id
    var filter = []; //new nlobjSearchFilter('internalid', null, 'is', 17687); //16573 1846 16580 15718 22215 19331
    if (!lastId) {
        lastId = '0';
    }
    filter.push(new nlobjSearchFilter('internalidnumber', 'parent', 'greaterthanorequalto', lastId, null));
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
            searchResult = nlapiSearchRecord('folder', null, newFilters, mainSearch.getColumns());
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
function rescheduleIfNeeded(context, params) {
    try {
        var usageRemaining = context.getRemainingUsage();

        if (usageRemaining < 4500) {
            rescheduleScript(context, params);
            return true;
        }

        var endTime = (new Date()).getTime();

        var minutes = Math.round(((endTime - startTime) / (1000 * 60)) * 100) / 100;
        nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + startTime);
        // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error

        if (minutes > minutesAfterReschedule) {
            rescheduleScript(context, params);
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
        fileInternalId: null,
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
    // remove space from itemid
    if (itemId.indexOf(' ') > -1) {
        itemId = itemId.replace(/\s{1,}/g, '');
    }
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

        nlapiLogExecution('DEBUG', 'value of xmlRequest', finalXml);

        //    var myXml = nlapiCreateFile('finalXml' + IISyncUtilityCommon.guid() +'.txt', 'PLAINTEXT', finalXml);
        //    myXml.setFolder(40396);
        //    nlapiSubmitFile(myXml);

        itemResponse = soapRequestToMagento(finalXml);
        nlapiLogExecution('DEBUG', 'value of itemResponse', nlapiXMLToString(itemResponse));
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
    var displayInWebSite = currentRecord.getValue('isonline');
    return {
        parentId: parentId,
        color: color,
        displayInWebSite: displayInWebSite
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

    // using and opject to make sure that the record's parent is only processed once
    // as removing of items is done with parentId
    var Removed = {};
    for (var i = 0; i < count; i++) {
        try {
            // handle the script to run only between 1 am to 7 am inclusive
            if (!isRunningTime()) {
                ScheduledScriptStatus.updateStatus(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, '0');
                return;
            }

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

            // Initially the below value will be null , so this will be true
            if (Removed[parentInfo.parentId] != false) {

                RemoveAllImages(parentInfo.parentId);

                // Turning it to false
                // so that this item will not be processed next time
                Removed[parentInfo.parentId] = false;

                nlapiLogExecution('DEBUG', 'Removed');
            }

            var imageResponse = '';


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
                markParentRecord(parentInfo);
                // update product visibility in magento
                updateProductInMagento(parentInfo);
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

            //nlapiLogExecution('DEBUG', 'value of recordImages.length', recordImages.length);

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
                        imageResponse = uploadImageToMagento(currentRecord, itemMagentoId, magentoImageInfo) + imageResponse;
                        nlapiLogExecution('DEBUG', 'repsonsee', nlapiXMLToString(imageResponse));
                    } else {
                        nlapiLogExecution('DEBUG', 'no image found for ', initName);
                    }
                } else {
                    nlapiLogExecution('DEBUG', 'no image found for ', initName);
                }
            }

            markRecords(currentRecord, imageResponse, parentSku);

            // handle rescheduling
            var lastId = parentInfo.parentId;
            var params = [];
            params[IISyncUtilityCommon.ScriptParameters.LastId] = lastId;
            if (rescheduleIfNeeded(context, params)) {
                return;
            }
            /*var hasScheduled = false;
             if (hasScheduled === true) {
             break;
             }*/
        } catch (e) {
            customLogger('ERROR', 'Error during processRecords', e.toString());
        }
    }

    // update status
    ScheduledScriptStatus.updateStatus(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, '0');
    nlapiScheduleScript(ItemConstant.Script.F3MG_MASTER_ITEM_EXPORT.ScriptId, ItemConstant.Script.F3MG_MASTER_ITEM_EXPORT.DeploymentId);
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
function rescheduleScript(ctx, params) {
    var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
    customLogger('DEBUG', 'Item Image Sync: Rescheduling..', 'status =' + status);
}

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function scheduled(type) {
    try {

        // handle the script to run only between 1 am to 7 am inclusive
        if (!isRunningTime()) {
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, '0');
            return;
        }

        customLogger('DEBUG', 'Item Image Syncing Starting', '');
        var ctx = nlapiGetContext();
        var lastId = ctx.getSetting('SCRIPT', IISyncUtilityCommon.ScriptParameters.LastId);
        customLogger('DEBUG', 'lastId: ' + lastId, '');
        var records = getRecords(lastId);

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


/**
 * @param itemMagentoId , imageMagentoFile
 * @returns {Boolean} Response
 */

// This function get the productId and the Filename and removes it from Magento
function removeImageFromMagento(itemMagentoId, imageMagentoFile) {

    var imgRmvResponse = null;
    try {
        var sessionId = loginMagento(IISyncUtilityCommon.MagentoInfo.login, IISyncUtilityCommon.MagentoInfo.password);

        // Make XML
        var xmlRequest = IISyncUtilityCommon.MagentoRequestXml.ImageRemoveXml;

        xmlRequest = xmlRequest.replace('[SESSIONID]', sessionId);
        xmlRequest = xmlRequest.replace('[PRODUCTID]', itemMagentoId);
        xmlRequest = xmlRequest.replace('[FILE]', imageMagentoFile);

        var finalXml = IISyncUtilityCommon.MagentoRequestXml.Header + xmlRequest + IISyncUtilityCommon.MagentoRequestXml.Footer;


        nlapiLogExecution('DEBUG', 'value of xmlRequest', finalXml);


        imgRmvResponse = soapRequestToMagento(finalXml);
        nlapiLogExecution('DEBUG', 'value of response', nlapiXMLToString(imgRmvResponse));
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main uploadImageToMagento itemResponse =', e.toString() + '___itemResponse =' + nlapiXMLToString(imgRmvResponse));
        throw new Error(e.toString());
    }


    var imageRemoveResponse = nlapiSelectValue(imgRmvResponse, '//result');


    nlapiLogExecution('DEBUG', 'value of name and response', +itemMagentoId + "_____" + imageRemoveResponse);

    return imageRemoveResponse;


}

/**
 * @param ID , lIST
 * @returns Converts the array into Filter
 */
function createFilter(id, list) {

    var returnarr = [];
    for (key in list) {
        returnarr[returnarr.length] = ([id, 'is', list[key]]);
        returnarr[returnarr.length] = 'or';
    }
    returnarr.splice(returnarr.length - 1, 1);
    return returnarr;

}


// Takes the productId and Retrieves all list of image file names from magento
function getImagesListMagento(itemMagentoId) {

    var imgListResponse = null;
    try {
        var sessionId = loginMagento(IISyncUtilityCommon.MagentoInfo.login, IISyncUtilityCommon.MagentoInfo.password);

        var xmlRequest = IISyncUtilityCommon.MagentoRequestXml.ImageListXml;

        xmlRequest = xmlRequest.replace('[SESSIONID]', sessionId);
        xmlRequest = xmlRequest.replace('[PRODUCTID]', itemMagentoId);

        var finalXml = IISyncUtilityCommon.MagentoRequestXml.Header + xmlRequest + IISyncUtilityCommon.MagentoRequestXml.Footer;


        nlapiLogExecution('DEBUG', 'value of xmlRequest', finalXml);


        imgListResponse = soapRequestToMagento(finalXml);
        nlapiLogExecution('DEBUG', 'value of response', nlapiXMLToString(imgListResponse));
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error during main uploadImageToMagento itemResponse =', e.toString() + '___itemResponse =' + nlapiXMLToString(imgListResponse));
        throw new Error(e.toString());
    }

    // COnvert response to List
    var imageList = [];
    var imageFiles = nlapiSelectNodes(imgListResponse, '//item');
    if (!!imageFiles) {
        for (var i = 0; i < imageFiles.length; i++) {
            imageList.push(nlapiSelectValue(imageFiles[i], 'file'));
        }
    }

    nlapiLogExecution('DEBUG', 'value of name and response', +itemMagentoId + "_____" + imageList);

    return imageList;
}


// Adding function to get all child items of parent with colors
function getChildItemsWithColor(parentItemId) {

    var fils = [];
    var cols = [];
    var result = [];
    var colors = [];
    var ids = [];

    try {
        fils.push(new nlobjSearchFilter('type', null, 'anyof', ['InvtPart']));
        fils.push(new nlobjSearchFilter('islotitem', null, 'is', 'F'));
        fils.push(new nlobjSearchFilter('matrixchild', null, 'is', 'T'));
        //fils.push(new nlobjSearchFilter('website', null, 'anyof', ['1']));// only fetch goddiva items
        fils.push(new nlobjSearchFilter('parent', null, 'anyof', [parentItemId]));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.Color));
        cols.push(new nlobjSearchColumn('internalid'));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.MagentoId));
        cols.push(new nlobjSearchColumn(ItemConstant.Fields.MagentoSku));
        result = nlapiSearchRecord('item', null, fils, cols) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'getChildItems', e.toString());
    }

    result.forEach(function (rec) {
        var color = rec.getText(ItemConstant.Fields.Color);
        var internalId = rec.getValue('internalid');
        var magentoId = rec.getValue(ItemConstant.Fields.MagentoId);
        var magentoSku = rec.getValue(ItemConstant.Fields.MagentoSku);

        //if (!data.hasOwnProperty(color)) {
        //    data[color] = [];
        //}
        colors.push(color);
        ids.push(internalId);
    });

    nlapiLogExecution('DEBUG', 'color', JSON.stringify(colors));

    return {'colors': colors, 'ids': ids};
}

// This is the function which is called by the main Process records
// this takes the productId of the parent
// Fetches associated configurable products with the parent
// and then gets images they have on magento
// and deletes them one by one
function RemoveAllImages(itemId) {


    var returnRes = getChildItemsWithColor(itemId);


    var arrFilters = [createFilter('custrecord_mpss_color', returnRes.colors)];
    arrFilters.push('and');
    arrFilters.push(['custrecord_mpss_parent_matrix_item', 'is', itemId]);

    nlapiLogExecution('DEBUG', 'arrFilters', arrFilters);

    var searchSiblings = nlapiSearchRecord('customrecord_f3_matrix_parent_sync_stats', '', arrFilters, [new nlobjSearchColumn('custrecord_mpss_magento_id'), new nlobjSearchColumn('custrecord_mpss_magento_sku')]) || [];

    searchSiblings.forEach(function (rec) {
        var id = rec.getValue('custrecord_mpss_magento_id');
        var magSku = rec.getValue('custrecord_mpss_magento_sku');

        var iisyncStatusSearch = nlapiSearchRecord('customrecord_iisync_image_sync_status', '', new nlobjSearchFilter('custrecord_itemsku', '', 'is', magSku));
        if (!!iisyncStatusSearch) {
            for (var o = 0; o < iisyncStatusSearch.length; o++) {
                nlapiDeleteRecord('customrecord_iisync_image_sync_status', iisyncStatusSearch[o].getId());
            }
        }
        var imageNames = getImagesListMagento(id);
        nlapiLogExecution('DEBUG', 'imgNames', JSON.stringify(imageNames));

        for (var i = 0; i < imageNames.length; i++) {
            removeImageFromMagento(id, imageNames[i]);
        }

    });
}


var ItemConstant = ItemConstant || {};
ItemConstant.Fields = {
    MagentoSyncStatus: 'custitem_magento_sync_status',
    MagentoSync: 'custitem_magentosyncdev',
    ItemSync: 'custitem_item_sync',
    MagentoId: 'custitem_magentoid',
    MagentoSku: 'custitem_magento_sku',
    Color: 'custitem3',
    SizeUk: 'custitem4',
    Size: 'custitem2',
    WasPrice: 'custitem44'
};

ItemConstant.Script = {
    IISYNC_UTIILIY: {
        ScriptId: 'customscript_iisync_utility_schedule',
        DeploymentId: 'customdeploy_iisync_utility_schedule'
    },
    F3MG_ITEM_EXPORT_S1: {
        ScriptId: 'customscript_f3mg_item_export_s1_sch',
        DeploymentId: 'customdeploy_f3mg_item_export_s1_sch'
    },
    F3MG_ITEM_EXPORT_S2: {
        ScriptId: 'customscript_f3mg_item_export_s2_sch',
        DeploymentId: 'customdeploy_f3mg_item_export_s2_sch'
    },
    F3MG_MASTER_ITEM_EXPORT: {
        ScriptId: 'customscript_f3mg_master_item_export_sch',
        DeploymentId: 'customdeploy_f3mg_master_item_export_sch'
    }
};


function validateItemExportResponse(xml, operation) {
    var responseMagento = {};
    var magentoItemID;
    var faultCode;
    var faultString;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        if (operation === 'create') {
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductCreateResponse/result");
        }
        else if (operation === 'update') {
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");
        }
    } catch (ex) {
    }

    if (!!faultCode) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
    }
    else if (!!magentoItemID) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = magentoItemID;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);

    }

    return responseMagento;
}

function updateProductInMagento(parentInfo) {
    var parentId = parentInfo.parentId;
    var color = parentInfo.color;

    var fils = [];
    var responseMagento;

    fils.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.ParentMatrixItem, null, 'is', parentId));
    fils.push(new nlobjSearchFilter(MatrixParentSyncStatus.FieldName.Color, null, 'is', color));
    var res = MatrixParentSyncStatus.lookup(fils);

    if (res.length > 0) {
        var magentoId = res[0].getValue(MatrixParentSyncStatus.FieldName.MagentoId);
        var displayInWebSite = parentInfo.displayInWebSite === 'T';
        var visibility;

        if (displayInWebSite) {
            visibility = '4'; //Catalog, Search / visible
        } else {
            visibility = '1'; // Not visible
            // if item visibility is false then no need to update product in magento as it is already set as invisible
            return;
        }

        try {
            var sessionId = loginMagento(IISyncUtilityCommon.MagentoInfo.login, IISyncUtilityCommon.MagentoInfo.password);

            var xmlRequest = IISyncUtilityCommon.MagentoRequestXml.UpdateProductXml;

            xmlRequest = xmlRequest.replace('[SESSIONID]', sessionId);
            xmlRequest = xmlRequest.replace('[PRODUCTID]', magentoId);
            xmlRequest = xmlRequest.replace('[VISIBILITY]', visibility);
            xmlRequest = xmlRequest.replace('[STOREVIEW]', '11');

            var finalXml = IISyncUtilityCommon.MagentoRequestXml.Header + xmlRequest + IISyncUtilityCommon.MagentoRequestXml.Footer;

            nlapiLogExecution('DEBUG', 'value of xmlRequest', finalXml);

            responseMagento = validateItemExportResponse(soapRequestToMagento(finalXml), 'update');

            if (!responseMagento.status) {
                var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                var msg = 'Product having Magento Id: ' + magentoId + ' has not updated. -- ' + errMsg;
                nlapiLogExecution("ERROR", " Error From Magento " + msg);
            } else {
                nlapiLogExecution("DEBUG", 'PRODUCT UPDATED IN MAGENTO', 'SUCCESSFULLY');
            }

        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main updateProductToMagento itemResponse =', e.toString() + '___itemResponse =' + nlapiXMLToString(responseMagento));
        }
    }
}

function parseFloatNum(num) {
    var no = parseFloat(num);
    if (isNaN(no)) {
        no = 0;
    }
    return no;
}

function getDateUTC(offset) {
    var today = new Date();
    var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
    offset = parseInt(parseFloatNum(offset * 60 * 60 * 1000));
    today = new Date(utc + offset);
    return today;
}

function isRunningTime() {
    return true; // todo undo
    var currentDate = getDateUTC(0);
    var dateTime = nlapiDateToString(currentDate, 'datetimetz');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'dateTime: ' + dateTime);
    var time = nlapiDateToString(currentDate, 'timeofday');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'time: ' + time);
    var strArr = time.split(' ');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'time spliting: ' + JSON.stringify(strArr));
    if (strArr.length > 1) {
        var hour = 0;
        var AmPm = strArr[1];
        var timeMinsArr = strArr[0].split(':');

        if (timeMinsArr.length > 0) {
            hour = parseInt(timeMinsArr[0]);
        }
        //nlapiLogExecution('DEBUG', 'isRunningTime', 'AmPm: ' + AmPm + ' hour: ' + hour);
        if (AmPm === 'am' && hour >= 1 && hour < 7) {
            return true;
        }
    }

    return false;
}