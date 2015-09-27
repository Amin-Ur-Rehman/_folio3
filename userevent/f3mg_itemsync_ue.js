var ItemSync = (function() {
    return {
        userEventBeforeLoad: function(type, form, request) {
            if (ItemDao.getTypeForFactory(nlapiGetRecordId()).itemType === ItemDao.MagentoSyncItemType.INV_NON_MATRIX) {
                var url,
                    syncWithMagentoSuitelet,
                    description = nlapiGetFieldValue('displayname') ? nlapiGetFieldValue('displayname') : nlapiGetFieldValue('itemid');
                url = nlapiResolveURL('SUITELET', 'customscript_instant_sync_item', 'customdeploy_instant_sync_item');
                url += "&itemid=" + nlapiGetRecordId();
                syncWithMagentoSuitelet = "window.open('" + url + "' , '_blank', 'width=800, height=600, top=200, left=300')"
                form.addButton('custpage_syncwithmagentosuitelet', 'Sync With Magento', syncWithMagentoSuitelet);
            }
        }
    };
})();

function itemSyncBeforeLoad(type, form, request) {
    if (type === 'view') {
        return ItemSync.userEventBeforeLoad(type, form, request);
    }
}