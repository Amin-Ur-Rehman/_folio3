var CategorySync = (function() {
    return {
        userEventBeforeLoad: function(type, form, request) {
            var url,
                syncWithMagentoSuitelet,
                description = nlapiGetFieldValue('displayname') ? nlapiGetFieldValue('displayname') : nlapiGetFieldValue('itemid');
            url = nlapiResolveURL('SUITELET', 'customscript_instant_sync_category', 'customdeploy_instant_sync_category');
            url += "&categoryid=" + nlapiGetRecordId();
            syncWithMagentoSuitelet = "window.open('" + url + "' , '_blank', 'width=800, height=600, top=200, left=300')"
            form.addButton('custpage_syncwithmagentosuitelet', 'Sync With Magento', syncWithMagentoSuitelet);
        }
    };
})();

function categorySyncBeforeLoad(type, form, request) {
    return CategorySync.userEventBeforeLoad(type, form, request);
}