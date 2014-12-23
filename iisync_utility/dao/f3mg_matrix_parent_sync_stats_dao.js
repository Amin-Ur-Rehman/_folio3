/**
 * Created by zahmed on 22-Oct-14.
 */

MatrixParentSyncStatus = (function () {
    return {
        InternalId: 'customrecord_f3_matrix_parent_sync_stats',
        FieldName: {
            ParentMatrixItem: 'custrecord_mpss_parent_matrix_item',
            Color: 'custrecord_mpss_color',
            MagentoId: 'custrecord_mpss_magento_id',
            MagentoSku: 'custrecord_mpss_magento_sku',
            MagentoSyncStatus: 'custrecord_mpss_magento_sync_status'
        },
        upsert: function (data, id) {
            try {
                var rec = !!id ? nlapiLoadRecord(this.InternalId, id) : nlapiCreateRecord(this.InternalId);
                for (var field in data) {
                    rec.setFieldValue(field, data[field]);
                }
                id = nlapiSubmitRecord(rec);
                nlapiLogExecution('DEBUG', 'MatrixParentSyncStatus.upsert', id);
            } catch (e) {
                nlapiLogExecution('ERROR', 'MatrixParentSyncStatus.upsert', e.toString());
            }
            return id;
        },
        lookup: function (filters) {
            var result = [];
            try {
                var cols = [];
                var fils = filters || [];
                for (var i in this.FieldName) {
                    cols.push(new nlobjSearchColumn(this.FieldName[i]));
                }
                result = nlapiSearchRecord(this.InternalId, null, fils, cols) || [];
            } catch (e) {
                nlapiLogExecution('ERROR', 'MatrixParentSyncStatus.lookup', e.toString());
            }
            return result;
        },
        getSyncInfo: function (itemId, color) {
            var syncInfo = {
                sync: false,
                id: null
            };
            try {
                var id;
                var filters = [];
                filters.push(new nlobjSearchFilter(this.FieldName.ParentMatrixItem, null, 'anyof', [itemId]));
                filters.push(new nlobjSearchFilter(this.FieldName.Color, null, 'is', color + ''));

                var configurableItems = this.lookup(filters);
                if (configurableItems.length === 0) {
                    var data = {};
                    data[this.FieldName.ParentMatrixItem] = itemId;
                    data[this.FieldName.Color] = color;
                    // create entry in custom record for configurable product
                    id = this.upsert(data);
                    syncInfo.sync = true;
                    syncInfo.id = id;
                } else {
                    //var magentoId = configurableItems[0].getValue(this.FieldName.MagentoId);
                    var magentoSku = configurableItems[0].getValue(this.FieldName.MagentoSku);
                    id = configurableItems[0].getId();
                    if (!magentoSku) {
                        syncInfo.sync = true;
                        syncInfo.id = id;
                    }
                }
            } catch (e) {
                nlapiLogExecution('ERROR', 'MatrixParentSyncStatus.getSyncInfo', e.toString());
            }
            return syncInfo;
        }
    };
})();