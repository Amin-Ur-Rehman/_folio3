/**
 * Created by smehmood on 3/16/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */
/**
 * f3mg_categorysync_suit class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var F3MG_CategorySync = (function() {
    return {
        main: function(request, response) {
            var categoryId = request.getParameter('categoryid');
            var categoryRec;
            var responseMsg = '';
            var xml;
            var responseMagento;
            var externalSystemArr = [];
            ConnectorConstants.initialize();
            // getting configuration
            var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
            var result;
            var form;
            var htmlField;
            var jsCode;
            var returnResult = {};
            if (request.getMethod() === 'GET') {
                Utility.logDebug('categoryId in Get ' + categoryId);
                form = nlapiCreateForm('', true);
                form.setScript('customscript_categorysyncsuite_cl');
                form.addField('categoryid', 'text').setDisplayType('hidden').setDefaultValue(categoryId);
                htmlField = form.addField('custpage_req', 'inlinehtml');
                jsCode = ' <script> jQuery(document).ready(function(){ addProcessingDiv(); }); </script>';
                htmlField.setDefaultValue(jsCode);
                response.writePage(form);
            } else if (request.getMethod() === 'POST') {
                categoryId = JSON.parse(request.getBody()).categoryId;
                Utility.logDebug('categoryId in Post ' + categoryId);
                categoryRec = CATEGORY.getCategory(categoryId);
                if (!isBlankOrNull(categoryRec.nsParentCategory) && isBlankOrNull(categoryRec.magentoParentID)) {
                    responseMsg = 'Please sync Parent Category with Magento';
                } else {
                    externalSystemConfig.forEach(function(store) {
                        ConnectorConstants.CurrentStore = store;
                        ConnectorConstants.CurrentWrapper = F3WrapperFactory.getWrapper(store.systemType);
                        var sessionID = MagentoWrapper.getSessionIDFromServer(store.userName, store.password);
                        if (!sessionID) {
                            Utility.logDebug('sessionID', 'sessionID is empty');
                            return;
                        }
                        store.sessionID = sessionID;
                        // push store object after getting id for updating items in this store
                        externalSystemArr.push(store);
                    });
                    if (externalSystemArr.length === 0) {
                        responseMsg = 'Category Export is not enabled';
                    }
                    externalSystemArr.forEach(function(store) {
                        try {
                            if (isBlankOrNull(categoryRec.magentoId)) {
                                result = createCategory(categoryRec, store);
                            } else {
                                Utility.logDebug('Update Flow');
                                result = updateCategory(categoryRec, store);
                            }
                            Utility.logDebug('result  ' + result);
                            if (result.indexOf('Success') === -1) {
                                responseMsg = result;
                                returnResult.status = false;
                            } else {
                                responseMsg = 'Category Synched Successfully';
                                returnResult.status = true;
                            }
                        } catch (ex) {
                            responseMsg = 'Category Export Script:  Error On Magento Call';
                            //Utility.logDebug('Internal Catch Block, Category Sync Failed + Store : ' + customerIds[c].internalId + ' StoreId:' + store.systemId, ex.toString());
                            returnResult.status = false;
                        }
                    });
                }
                returnResult.msg = responseMsg;
                response.write(JSON.stringify(returnResult));
                Utility.logDebug('response msg ' + responseMsg);
            }
        }
    };
})();
/**
 * This is the main entry point for f3mg_categorysync_suit suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function f3mg_categorysync_suitSuiteletMain(request, response) {
    return F3MG_CategorySync.main(request, response);
}

function createCategory(categoryRec, store) {
    try {
        var xml = MagentoWrapper.getCreateCategoryXML(categoryRec, store.sessionID);
        var responseString = 'Success';
        var responseMagento = MagentoWrapper.validateCreateCategoryOperationResponse(MagentoWrapper.soapRequestToServerSpecificStore(xml, store), 'create');
        if (!!responseMagento && !!responseMagento.status && responseMagento.status) {
            //responseString = 'MagentoId : ' + responseMagento.magentoCategoryId + '   ns id ' + categoryId;
            CATEGORY.setCategoryMagentoId(responseMagento.magentoCategoryId, categoryRec.internalId);
            responseString = 'Category Synched Successfully, Magento Id is ' + responseMagento.magentoCategoryId;
        } else {
            responseString = responseMagento.faultCode + '    ' + responseMagento.faultString;
        }
    } catch (ex) {
        Utility.logDebug('Error in function createCategory  ' + ex.toString());
        responseString = 'Unknown Error, please check log';
    }
    return responseString;
}

function updateCategory(categoryRec, store) {
    try {
        var xml = MagentoWrapper.getUpdateCategoryXML(categoryRec, store.sessionID);
        var rec = nlapiCreateRecord('customrecord_dummaydata');
        rec.setFieldValue('custrecord_xmldata', xml);
        nlapiSubmitRecord(rec);
        var responseString = 'Success';
        var responseMagento = MagentoWrapper.validateCreateCategoryOperationResponse(MagentoWrapper.soapRequestToServerSpecificStore(xml, store), 'update');
        if (!!responseMagento && !!responseMagento.status && responseMagento.status) {
            responseString = 'Success';
        } else {
            responseString = responseMagento.faultCode + '    ' + responseMagento.faultString;
        }
    } catch (ex) {
        Utility.logDebug('Error in function updateCategory  ' + ex.toString());
        responseString = 'Unknown Error, please check log';
    }
    return responseString;
}