var ItemDao = (function() {
    return {
        MagentoSyncOperation: {
            CREATE: 'create',
            UPDATE: 'update'
        },
        MagentoSyncItemType: {
            INV_NON_MATRIX: 'InventoryNonMatrix',
            INV_MATRIX_PARENT: 'InventoryMatrixParent',
            INV_MATRIX_CHILD: 'InventoryMatrixChild'
        },
        getTypeForFactory: function(itemInternalId) {
            var rec = nlapiSearchRecord('item', null, [new nlobjSearchFilter('internalid', null, 'is', itemInternalId), new nlobjSearchFilter('matrix', null, 'is', 'F')], [new nlobjSearchColumn('type'), new nlobjSearchColumn('subtype')]);
            var itemTypeObj = {};
            if (!!rec && rec.length > 0) // Non-Matrix
            {
                if (rec[0].getValue('type') === 'InvtPart') itemTypeObj.itemType = this.MagentoSyncItemType.INV_NON_MATRIX;
            } else //Matrix
            {
                rec = nlapiSearchRecord('item', null, [new nlobjSearchFilter('internalid', null, 'is', itemInternalId), new nlobjSearchFilter('matrix', null, 'is', 'T'), new nlobjSearchFilter('matrixchild', null, 'is', 'F')], [new nlobjSearchColumn('type'), new nlobjSearchColumn('subtype')]);
                if (!!rec && rec.length > 0) {
                    if (rec[0].getValue('type') === 'InvtPart') itemTypeObj.itemType = this.MagentoSyncItemType.INV_MATRIX_PARENT;
                } else {
                    rec = nlapiSearchRecord('item', null, [new nlobjSearchFilter('internalid', null, 'is', itemInternalId), new nlobjSearchFilter('matrix', null, 'is', 'T'), new nlobjSearchFilter('matrixchild', null, 'is', 'F')], [new nlobjSearchColumn('type'), new nlobjSearchColumn('subtype')]);
                    if (!!rec && rec.length > 0) {
                        if (rec[0].getValue('type') === 'InvtPart') itemTypeObj.itemType = this.MagentoSyncItemType.INV_MATRIX_CHILD;
                    }
                }
            }
            return itemTypeObj;
        },
        getStoreItemIdAssociativeArray: function(data) {
            var storeIdItemIdArray;
            var associativeArray = [];
            if (!!data) {
                storeIdItemIdArray = JSON.parse(data);
                if (!!storeIdItemIdArray && storeIdItemIdArray.length > 0) {
                    for (var i = 0; i < storeIdItemIdArray.length; i++) {
                        associativeArray[storeIdItemIdArray[i].StoreId] = storeIdItemIdArray[i].MagentoId;
                    }
                }
            }
            return associativeArray;
        },
        getMagentoCategories: function(itemRec) {
            var categories = [];
            var categoryWithMagentoIds = [];
            var categoriesSynchedWithMagento;
            var fils = [];
            var filterExpressionCategory = [];
            var mainFilterExpression = [];
            var cols = [];
            for (var i = 1; i <= itemRec.getLineItemCount('sitecategory'); i++) {
                categories.push(itemRec.getLineItemValue('sitecategory', 'category', i));
                filterExpressionCategory.push(['custrecord_nscategoryid', 'is', itemRec.getLineItemValue('sitecategory', 'category', i)]);
                filterExpressionCategory.push('or');
            }
            if (!!categories && categories.length > 0) {
                filterExpressionCategory.pop();
                mainFilterExpression.push(filterExpressionCategory);
                mainFilterExpression.push('and');
                mainFilterExpression.push(['custrecord_magentoid', 'isnot', '']);
                cols.push(new nlobjSearchColumn('custrecord_magentoid'));
                categoriesSynchedWithMagento = nlapiSearchRecord('customrecord_magentocategories', null, mainFilterExpression, cols);
                for (var i = 0; i < categoriesSynchedWithMagento.length; i++) categoryWithMagentoIds.push(categoriesSynchedWithMagento[i].getValue('custrecord_magentoid'));
            }
            return categoryWithMagentoIds;
        },
        updateNSMagentoData: function(itemInternalId, magentoId, existingMagentoReferenceInfo, store, magentoCall) {
            var createOrUpdateMagentoJSONRef = ItemDao.MagentoSyncOperation.CREATE;
            var magentoIdObjArrStr;
            if (!!existingMagentoReferenceInfo) createOrUpdateMagentoJSONRef = ItemDao.MagentoSyncOperation.UPDATE;
            magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, magentoId, createOrUpdateMagentoJSONRef, existingMagentoReferenceInfo);
            if (magentoCall === ItemDao.MagentoSyncOperation.CREATE) nlapiSubmitField('inventoryitem', itemInternalId, ['custitem_magentoid', 'custitem_magentosyncdev'], [magentoIdObjArrStr, 'T']);
            else nlapiSubmitField('inventoryitem', itemInternalId, ['custitem_magentosyncdev'], ['T']);
        }
    };
})();