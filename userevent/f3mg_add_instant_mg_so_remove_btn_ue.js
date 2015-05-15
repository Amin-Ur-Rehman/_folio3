/**
 * Created by wahajahmed on 5/15/2015.
 */

var AddInstantSORemovalBtnHelper = (function () {
    return {
        config: {
            // recordType: {label: '', url: ''}
            salesorder: {
                label: 'Close Magento Sales Order',
                url: '/app/site/hosting/scriptlet.nl?script=customscript_f3mg_instant_syc_suit&deploy=customdeploy_f3mg_instant_syc_suit'
            }
        },
        addInstantSORemovalBtn: function (type, form, request) {
            try {
                if (type.toString() === 'view') {
                    var name,
                        label,
                        script,
                        recordType,
                        url;

                    recordType = nlapiGetRecordType();

                    if (this.config.hasOwnProperty(recordType)) {

                        // TODO: read from configuration
                        name = 'custpage_f3mg_instant_mg_so_remove';
                        label = this.config[recordType].label;
                        var magentoStoreIds = nlapiGetFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore);
                        var magentoSync = nlapiGetFieldValue(ConnectorConstants.Transaction.Fields.MagentoSync);

                        /*url = this.config[recordType].url;
                        url += url.indexOf('?') === -1 ? '?' : '&';
                        url += 'recordid=' + nlapiGetRecordId();
                        url += '&recordtype=' + nlapiGetRecordType();
                        url += '&storeid=' + magentoStoreIds;*/

                        script = "InstantSync.openPopupWindow(this,'" + url + "')";

                        // Show 'Close Magento Sales Order' button if order is synched to magento
                        if(!!magentoStoreIds && magentoSync === 'T') {
                            form.addButton(name, label, 'alert("Yes Its Working..")');
                        }


                        // set client script to run in view mode
                        //form.setScript('customscript_f3mg_instant_syc_cl');

                    }
                }
            } catch (e) {
                Utility.logException('AddInstantSORemovalBtnHelper.addInstantSORemovalBtn', e);
            }
        }
    };
})();

/**
 * All Magento SO removal business logic will be encapsulated in this class.
 */
var AddInstantSORemovalBtn = (function () {
    return {
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Operation types: create, edit, view, copy, print, email
         * @param {nlobjForm} form Current form
         * @param {nlobjRequest} request Request object
         * @returns {Void}
         */
        userEventBeforeLoad: function (type, form, request) {
            AddInstantSORemovalBtnHelper.addInstantSORemovalBtn(type, form, request);
        }
    };
})();

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Operation types: create, edit, view, copy, print, email
 * @param {nlobjForm} form Current form
 * @param {nlobjRequest} request Request object
 * @returns {Void}
 */
function AddMagentoSORemovalBtnBeforeLoad(type, form, request) {
    AddInstantSORemovalBtn.userEventBeforeLoad(type, form, request);
}

