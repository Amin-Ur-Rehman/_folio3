var IISyncUtilityItemImageSyncStatus = (function () {
    return {
        INTERNAL_ID: 'customrecord_iisync_image_sync_status',
        FieldName: {
            RECORD_ITEM_ID: 'custrecord_itemid',
            RECORD_IMAGE_VALUE: 'custrecord_imagevalue',
            RECORD_ITEM_SKU: 'custrecord_itemsku'
        },
        getById: IISyncUtilityBaseType.getById,
        getAll: IISyncUtilityBaseType.getAll,
        getObject: IISyncUtilityBaseType.getObject,
        getSearchColumns: IISyncUtilityBaseType.getSearchColumns,
        upsert: IISyncUtilityBaseType.upsert,
        remove: IISyncUtilityBaseType.remove
    };
})();