/**
 * Created by wahajahmed on 7/10/2015.
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
 * SearchRecord class that has the actual functionality of suitelet.
 * All business logic will be encapsulated in this class.
 */
var SearchRecord = (function () {

    var fontColor = {
        black: 'black',
        red: 'red'
    };

    var netSuiteRecordTypes = {
        salesOrder: 'salesorder',
        cashRefund: 'cashrefund'
    };

    function addFormControls(form, method, selectedData, messageFontColor, message) {

        //create fieldgroup
        var group = form.addFieldGroup( '_fieldgroup', 'Enter Record Info Below:');

        var recordTypeToSelect = '';
        if(!!selectedData && !!selectedData.record_type){
            recordTypeToSelect = selectedData.record_type;
        }
        else {
            recordTypeToSelect = 'salesorder';
        }

        if(method == 'POST'){
            if(!messageFontColor) {
                messageFontColor = fontColor.black;
            }
            var labelField = form.addField('custpage_message_html', 'inlinehtml', '', null, '_fieldgroup').setLayoutType('normal','startcol');
            var messageHtml = '';
            if(messageFontColor == fontColor.red) {
                messageHtml = '<label style="color: '+messageFontColor+';"><b>'+message+'</b></label>';
            } else {
                messageHtml = '<label style="color: '+messageFontColor+';">'+message+'</label>';
            }
            labelField.setDefaultValue(messageHtml);


            if(!!selectedData.netSuiteRecordId) {

                if(selectedData.redirect_to_record == 'T') {
                    nlapiSetRedirectURL('RECORD', recordTypeToSelect, selectedData.netSuiteRecordId.trim(), false);
                }
                else {
                    var url_view_event = nlapiResolveURL('RECORD', recordTypeToSelect, selectedData.netSuiteRecordId.trim(), 'VIEW');
                    form.addField('custpage_url_html', 'inlinehtml', '', null, '_fieldgroup').setDefaultValue('<a href="'+url_view_event+'" target="_blank">'+url_view_event+'</a>');
                }
            }
        }

        var select = form.addField('record_type', 'select', 'Record Type', null, '_fieldgroup');
        select.addSelectOption(netSuiteRecordTypes.salesOrder, 'Sales Order');
        select.addSelectOption(netSuiteRecordTypes.cashRefund, 'Cash Refund');
        if(method == 'GET'){
            select.setLayoutType('normal','startcol');
        }
        select.setDefaultValue(recordTypeToSelect);

        var magentoIdField = form.addField('magento_id', 'text', 'Magento ID', null, '_fieldgroup');
        if(!!selectedData && !!selectedData.magento_id){
            magentoIdField.setDefaultValue(selectedData.magento_id);
        }

        var redirectToRecordToSelect = '';

        if(!!selectedData){
            if(selectedData.redirect_to_record == 'T') {
                redirectToRecordToSelect = 'T';
            } else {
                redirectToRecordToSelect = 'F';
            }
        }
        else {
            redirectToRecordToSelect = 'T';
        }
        form.addField('redirect_to_record', 'checkbox', 'Redirect to Record', null, '_fieldgroup').setDefaultValue(redirectToRecordToSelect);


        if(method == 'POST'){
            // Add custom script to set inline html controls layout
            form.addField('custpage_url_customscripts', 'inlinehtml', null, '_fieldgroup').setDefaultValue('<script type="text/javascript "> setTimeout(function(){ jQuery("#custpage_message_html_val").parent().css({"padding-top": "20px", "padding-bottom": "20px"}); jQuery("#custpage_url_html_val").parent().css({"padding-bottom": "20px"});  }, 10);  </script>')
        }


        form.addSubmitButton('Search');
    }

    return {
        /**
         * Search NetSuite respective record for provided magento Id
         * @param recordType
         * @param magentoId
         */
        searchRecord: function(recordType, magentoId) {
            var netSuiteRecordId = null;
            if(!magentoId) {
                return null;
            }

            var filters = [];

            if(recordType == netSuiteRecordTypes.salesOrder) {
                filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoId, '', 'is', magentoId.trim()));
            }
            else if(recordType == netSuiteRecordTypes.cashRefund) {
                filters.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.CustomerRefundMagentoId, '', 'is', magentoId.trim()));
            }
            var result = nlapiSearchRecord(recordType, null, filters);
            if(!!result && result.length > 0) {
                netSuiteRecordId = result[0].getId();
            }

            return netSuiteRecordId;
        },

        /**
         * main method
         */
        main: function (request, response) {
            var form = nlapiCreateForm('Search Record');
            if (request.getMethod() == 'GET') {
                addFormControls(form, 'GET', null, fontColor.black, '');
            }
            else if (request.getMethod() == 'POST') {
                var selectParams = {};
                selectParams.record_type =  request.getParameter('record_type');
                selectParams.magento_id =  request.getParameter('magento_id');
                selectParams.redirect_to_record =  request.getParameter('redirect_to_record');

                var netSuiteRecordId = this.searchRecord(selectParams.record_type, selectParams.magento_id);
                var  message = '';
                var  messageFontColor = '';
                if(!!netSuiteRecordId) {
                    message = 'Below is the link of searched record:';
                    messageFontColor = fontColor.black;
                    selectParams.netSuiteRecordId = netSuiteRecordId;
                } else {
                    message = 'No Record found for provided Mangento ID.';
                    messageFontColor = fontColor.red;
                }

                addFormControls(form, 'POST', selectParams, messageFontColor, message);
            }

            response.writePage(form);
        }
    };
})();

/**
 * This is the main entry point for SearchRecord suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function SearchRecordSuiteletMain(request, response) {
    return SearchRecord.main(request, response);
}