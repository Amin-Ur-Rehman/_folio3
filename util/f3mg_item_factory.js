F3ItemFactory = (function() {
    return {
        /**
         * Init method
         */
        createItem: function(type, internalId) {
            var item = null;
            switch (type) {
                case ItemDao.MagentoSyncItemType.INV_NON_MATRIX:
                    item = new F3Item_InventoryNonMatrix(internalId);
                    break;
                default:
                    item = new F3ItemBase(internalId);
            }
            item.itemType = type;
            return item;
        }
    };
})();

function F3ItemBase(itemInternalId) {
    var self = {
        internalId: itemInternalId,
        getItemFields: function() {
            var arrFils = [];
            var arrCols = [];
            var resultObject;
            var result = [];
            arrFils.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
            arrCols.push(new nlobjSearchColumn('custrecord_item_nsfield'));
            arrCols.push(new nlobjSearchColumn('custrecord_item_mgfield'));
            arrCols.push(new nlobjSearchColumn('custrecord_item_xmlnsxs'));
            arrCols.push(new nlobjSearchColumn('custrecord_item_xsitype'));
            arrCols.push(new nlobjSearchColumn('custrecord_item_xstype'));
            var recs = nlapiSearchRecord('customrecord_magento_itemsync_flds', null, arrFils, arrCols);
            if (recs != null && recs.length > 0) {
                for (var i = 0; i < recs.length; i++) {
                    resultObject = new Object();
                    resultObject.nsField = recs[i].getValue('custrecord_item_nsfield');
                    resultObject.mgField = recs[i].getValue('custrecord_item_mgfield');
                    resultObject.xsType = recs[i].getValue('custrecord_item_xstype');
                    resultObject.xsiType = recs[i].getValue('custrecord_item_xsitype');
                    resultObject.xmlnsXs = recs[i].getValue('custrecord_item_xmlnsxs');
                    result.push(resultObject);
                }
            }
        },
        instantSyncToMagento: function() {},
        syncToMagento: function() {}
    }
    return self;
}

function F3Item_InventoryNonMatrix(itemInternalId) {
    var item = new F3ItemBase(itemInternalId);
    item.instantSyncToMagento = function() {
        var arrFils = [];
        var itemRec;
        var result = [];
        var arrCols = [];
        var resultObject;
        var itemFields;
        var magentoFieldObj;
        var magentoFieldData = [];
        var xmlToJson = new X2JS();
        var jsonData = {};
        var tempObj = {};
        var productData = {};
        var tempProperties = {};
        var categories = {};
        var websites = {};
        var externalSystemArr = [];
        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
        var responseObj = {};
        var magentoCategories;
        var magentoStoreAndItem;
        var magentoReferences;
        var resXML;
        var xml;
        var magentoOperation;
        var stockData;
        var runtimeValues = {};
        var jsonObjForXML;
        itemRec = nlapiLoadRecord('inventoryitem', item.internalId);
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
            // Add Code to handle response
        }
        if (!!itemRec) {
            externalSystemArr.forEach(function(store) {
                try {
                    magentoReferences = itemRec.getFieldValue('custitem_magentoid');
                    magentoStoreAndItem = ItemDao.getStoreItemIdAssociativeArray(magentoReferences);
                    runtimeValues["sessionId"] = store.sessionID;
                    runtimeValues["websites"] = [];
                    runtimeValues["websites"][0] = {
                        "systemid": store.systemId
                    };
                    if (isBlankOrNull(magentoReferences) || isBlankOrNull(magentoStoreAndItem[store.systemId]) || magentoStoreAndItem[store.systemId] === '0') {
                        magentoOperation = ItemDao.MagentoSyncOperation.CREATE;
                    } else {
                        magentoOperation = ItemDao.MagentoSyncOperation.UPDATE;
                        runtimeValues["magentoItemId"] = magentoStoreAndItem[store.systemId];
                    }
                    jsonObjForXML = FieldMappingDao.getJsonForXML(FieldMappingDao.MagentoSyncRecord.Item, magentoOperation, runtimeValues, itemRec);
                    xml = xmlToJson.json2xml_str(jsonObjForXML);
                    var rec = nlapiCreateRecord('customrecord_dummaydata');
                    rec.setFieldValue('custrecord_xmldata', xml);
                    nlapiSubmitRecord(rec);
                    xml = MagentoWrapper.XmlHeader + xml + MagentoWrapper.XmlFooter;
                    resXML = MagentoWrapper.validateItemOperationResponse(MagentoWrapper.soapRequestToServerSpecificStore(xml, store), magentoOperation);
                    if (resXML.status) {
                        responseObj.ItemID = resXML.magentoItemId;
                        responseObj.Status = true;
                        responseObj.UserMessage = "Item Synched Successfully";
                        responseObj.TechnicalMessage = "";
                        ItemDao.updateNSMagentoData(item.internalId, responseObj.ItemID, itemRec.getFieldValue('custitem_magentoid'), store, magentoOperation);
                    } else {
                        responseObj.Status = false;
                        responseObj.UserMessage = resXML.faultString;
                        responseObj.TechnicalMessage = resXML.faultCode + resXML.faultString;
                    }
                } catch (ex) {
                    responseObj.Status = false;
                    responseObj.UserMessage = "System Error";
                    responseObj.TechnicalMessage = ex.toString();
                    Utility.logDebug(responseObj.TechnicalMessage);
                }
            });
            /*}   else {
             responseObj.Status = false;
             responseObj.UserMessage = "No Category Is Synched With Magento";
             responseObj.TechnicalMessage = "No Category Is Synched With Magento";
             }*/
        }
        return responseObj;
    }
    return item;
}

function F3Item_InventoryMatrix(itemInternalId) {
    var item = new F3ItemBase();
    return item;
}