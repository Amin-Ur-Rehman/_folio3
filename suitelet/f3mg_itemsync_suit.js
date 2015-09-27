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
 * f3mg_itemsync_suit class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var F3MG_ItemSync = (function() {
    return {
        main: function(request, response) {
            var itemId = request.getParameter('itemid');
            var categoryRec;
            var responseMsg = '';
            var xml;
            var responseMagento;
            var externalSystemArr = [];
            var result;
            var form;
            var htmlField;
            var jsCode;
            var returnResult = {};
            var itemObj;
            var syncCallResponse;
            if (request.getMethod() === 'GET') {
                Utility.logDebug('itemid in Get ' + itemId);
                form = nlapiCreateForm('', true);
                form.setScript('customscript_itemsyncsuite_cl');
                form.addField('itemid', 'text').setDisplayType('hidden').setDefaultValue(itemId);
                htmlField = form.addField('custpage_req', 'inlinehtml');
                jsCode = ' <script> jQuery(document).ready(function(){ addProcessingDiv(); }); </script>';
                htmlField.setDefaultValue(jsCode);
                response.writePage(form);
            } else if (request.getMethod() === 'POST') {
                itemId = JSON.parse(request.getBody()).itemId;
                itemObj = F3ItemFactory.createItem(ItemDao.getTypeForFactory(itemId).itemType, itemId);
                syncCallResponse = itemObj.instantSyncToMagento();
                returnResult.status = syncCallResponse.Status;
                returnResult.msg = syncCallResponse.UserMessage;
                response.write(JSON.stringify(returnResult));
                Utility.logDebug('response msg ' + responseMsg);
            }
        }
    };
})();
/**
 * This is the main entry point for f3mg_itemsync_suit suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function f3mg_itemsync_suitSuiteletMain(request, response) {
    return F3MG_ItemSync.main(request, response);
}