/**
 * Created by sameer on 8/31/15.
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
 * giftCertificate class that has the functionality of helper methods regarding Gift Certificate Import/Export Logic
 */
var GiftCertificateHelper = (function () {
    return {


        internalId: 'giftcertificateitem',
        fields: {
            itemId: 'itemid',
            itemDisplayName: 'displayname',
            liabilityAccount: 'liabilityaccount',
            inactive: 'isinactive',
            description: 'storedetaileddescription',
            shortDescription: 'storedescription',
            taxSchedule: 'taxschedule',
            urlKey: 'urlcomponent',
            incomeAccount: 'incomeaccount',
            externalId: 'externalid',
            allowOpenAmount: 'custitem_f3mg_price_allow_open_amount',
            openAmountMinValue: 'custitem_f3mg_price_open_amount_min',
            openAmountMaxValue: 'custitem_f3mg_price_open_amount_max'
        },

        /**
         * Get liability Account Value
         * @returns {string}
         */
        getLiabilityAccount: function (storeId) {
            var liability = '';
            var sysConfigs = ExternalSystemConfig.getConfig();
            if(!!sysConfigs) {
                var sysConfig = sysConfigs[storeId];
                if(!!sysConfig) {
                    var entitySyncInfo = sysConfig.entitySyncInfo;
                    if(!!entitySyncInfo && !!entitySyncInfo.giftcertificateitem.liabilityAccount) {
                        liability = entitySyncInfo.giftcertificateitem.liabilityAccount;
                    }
                }
            }
            return liability;
        },

        /**
         * Get Tax Schedule Value
         * @param storeId
         * @returns {string}
         */
        getTaxSchedule: function (storeId) {
            var taxSchedule = '';
            var sysConfigs = ExternalSystemConfig.getConfig();
            if(!!sysConfigs) {
                var sysConfig = sysConfigs[storeId];
                if(!!sysConfig) {
                    var entitySyncInfo = sysConfig.entitySyncInfo;
                    if(!!entitySyncInfo && !!entitySyncInfo.giftcertificateitem.taxSchedule) {
                        taxSchedule = entitySyncInfo.giftcertificateitem.taxSchedule;
                    }
                }
            }
            return taxSchedule;
        },


        /**
         * Get Income Account
         * @param storeId
         * @returns {string}
         */
        getIncomeAccount: function (storeId) {
            var incomeAccount = '';
            var sysConfigs = ExternalSystemConfig.getConfig();
            if(!!sysConfigs) {
                var sysConfig = sysConfigs[storeId];
                if(!!sysConfig) {
                    var entitySyncInfo = sysConfig.entitySyncInfo;
                    if(!!entitySyncInfo && !!entitySyncInfo.giftcertificateitem.incomeaccount) {
                        incomeAccount = entitySyncInfo.giftcertificateitem.incomeaccount;
                    }
                }
            }
            return incomeAccount;
        },


        /**
         * Get gift certificates records to sync
         */
        getRecords: function () {
            var recs;
            var result = [];
            var resultObject;
            recs = RecordsToSync.getRecords(RecordsToSync.RecordTypes.GiftCertificateItem, RecordsToSync.Status.Pending, RecordsToSync.Actions.SyncGiftCertificates);
            if (recs != null && recs.length > 0) {
                for (var i = 0; i < recs.length; i++) {
                    resultObject = {};
                    resultObject.customRecordInternalId = recs[i].internalId;
                    resultObject.internalId = recs[i].recordId;
                    resultObject.recordType = recs[i].recordType;
                    result.push(resultObject);
                }
                //Utility.logDebug('GiftCertificateHelper.getRecords', JSON.stringify(result))
            }

            return result;
        },

        /**
         * Export Gift certificates records to magento
         * @param records
         */
        processRecords: function (records, store) {
            var context = nlapiGetContext();

            Utility.logDebug('inside processRecords', 'processRecords');

            for (var i = 0; i < records.length; i++) {

                this.processRecord(records[i], store);

                if (GiftCertificateExportHelper.rescheduleIfNeeded(context, null)) {
                    return false;
                }
            }
            return true;
        },

        /**
         *
         * @param giftCertificateObject
         * @returns {*}
         */
        upsert: function(giftCertificateObject) {
            Utility.logDebug('log_w', 'creating new record');
            var giftCert = nlapiCreateRecord(this.internalId, null);
            var id = this.setGiftCertificateRecordFields(giftCert, giftCertificateObject);
            return id;
        },

        /**
         *
         * @param searchRec
         * @param giftCertificateObject
         * @returns {*}
         */
        update: function (searchRec, giftCertificateObject) {
            Utility.logDebug('log_w', 'loading record: '+searchRec.getId());
            var giftCert = nlapiLoadRecord(this.internalId, searchRec.getId());
            var id = this.setGiftCertificateRecordFields(giftCert, giftCertificateObject);
            return id;
        },

        /**
         *
         * @param giftCert
         * @param giftCertificateObject
         * @returns {*}
         */
        setGiftCertificateRecordFields : function (giftCert, giftCertificateObject) {
            giftCert.setFieldValue(this.fields.itemId, giftCertificateObject.sku);
            giftCert.setFieldValue(this.fields.itemDisplayName, giftCertificateObject.name);
            giftCert.setFieldValue(this.fields.liabilityAccount, this.getLiabilityAccount(giftCertificateObject.storeId));
            giftCert.setFieldValue(this.fields.taxSchedule, this.getTaxSchedule(giftCertificateObject.storeId));
            giftCert.setFieldValue(this.fields.description, giftCertificateObject.description);
            giftCert.setFieldValue(this.fields.shortDescription, giftCertificateObject.shortDescription);
            giftCert.setFieldValue(this.fields.urlKey, giftCertificateObject.urlKey);
            giftCert.setFieldValue(this.fields.inactive, giftCertificateObject.active === '1' ? 'F' : 'T');

            giftCert.setFieldValue(this.fields.allowOpenAmount, giftCertificateObject.awGcAllowOpenAmount === '1' ? 'T' : 'F');
            giftCert.setFieldValue(this.fields.openAmountMinValue, giftCertificateObject.awGcOpenAmountMin);
            giftCert.setFieldValue(this.fields.openAmountMaxValue, giftCertificateObject.awGcOpenAmountMax);

            giftCert.setFieldValue(this.fields.incomeAccount, this.getIncomeAccount(giftCertificateObject.storeId));

            //Utility.logDebug('log_w', 'setting lineitems');
            this.handleCustomPricingSublistData(giftCert, giftCertificateObject.customPricingData);
            //Utility.logDebug('log_w', 'setted lineitems');

            //Utility.logDebug('log_w', 'submitting record');
            var id = nlapiSubmitRecord(giftCert, true);
            //Utility.logDebug('log_w', 'submitted record');
            return id;
        },

        /**
         * Handle custom pricing sublist data
         */
        handleCustomPricingSublistData: function (giftCertRec, customPricingData) {

            var group = 'recmachcustrecord_f3mg_og_aw_pricing_item';
            var currentCount = giftCertRec.getLineItemCount(group);
            Utility.logDebug('lineitem currentCount', currentCount);
            for (var i = 0; i < currentCount; i++) {
                //Delete all lines
                giftCertRec.removeLineItem(group, 1);
            }
            Utility.logDebug('customPricingData count', customPricingData.length);
            if(!!customPricingData && customPricingData.length > 0) {
                for (var i = 0; i < customPricingData.length; i++) {
                    var obj = customPricingData[i];
                    //Add new lines
                    if(!!obj.magentoId) {
                        Utility.logDebug('log_w', 'adding new line price>>  price:'+ obj.price);
                        giftCertRec.selectNewLineItem(group);
                        giftCertRec.setCurrentLineItemValue(group, "custrecord_f3mg_og_aw_pricing_price", obj.price);
                        giftCertRec.setCurrentLineItemValue(group, "custrecord_f3mg_og_aw_pricing_magentoid", obj.magentoId);
                        giftCertRec.commitLineItem(group);
                    }
                }
            }
        },

        /*handleCustomPricingSublistData: function (giftCertRec, customPricingData) {
            Utility.logDebug('customPricingData count', customPricingData.length);
            if(!!customPricingData && customPricingData.length > 0) {
                var pricingDataArr = this.getPricingDataArray(customPricingData);
                Utility.logDebug('pricingDataArr', JSON.stringify(pricingDataArr));
                var group = 'recmachcustrecord_f3mg_og_aw_pricing_item';
                var currentCount = giftCertRec.getLineItemCount(group);
                Utility.logDebug('lineitem currentCount', currentCount);
                for (var i = 0; i < currentCount; i++) {
                    var linenum = i+1;
                    var id = giftCertRec.getLineItemValue(group, 'id', linenum);
                    Utility.logDebug('id treating', id);
                    var obj = pricingDataArr[id];
                    if(!obj) {
                        // if id not fount in associative array means this line not exist in magento, delete it from netsuite too
                        Utility.logDebug('log_w', 'removing line' + linenum);
                        giftCertRec.removeLineItem(group, linenum);
                        // after deletion a line will reduce from sublist, so reduce counter too.
                        i--;
                        currentCount--;
                    } else {
                        // if id found in associative array means this line exist in magento, update its price
                        Utility.logDebug('log_w', 'updating price>> linenum:' + linenum +' price:'+ obj.price);
                        giftCertRec.setLineItemValue(group, 'custrecord_f3mg_og_aw_pricing_price', linenum, obj.price);
                        giftCertRec.setLineItemValue(group, 'custrecord_f3mg_og_aw_pricing_magentoid', linenum, obj.magentoId);
                    }
                }

                for (var i = 0; i < customPricingData.length; i++) {
                    var obj = customPricingData[i];
                    // If magento id exist in customPricingList from magento and its netsuite internal id not existed, means that line is
                    // added in magento, thats why its netsuite internal not exist, add it in ns sublist
                    if(!obj.internalId && !!obj.magentoId) {
                        Utility.logDebug('log_w', 'adding new line price>>  price:'+ obj.price);
                        giftCertRec.selectNewLineItem(group);
                        //giftCertRec.setCurrentLineItemValue(group, "custrecord_f3mg_og_aw_pricing_item", giftCertRec.getId());
                        giftCertRec.setCurrentLineItemValue(group, "custrecord_f3mg_og_aw_pricing_price", obj.price);
                        giftCertRec.setCurrentLineItemValue(group, "custrecord_f3mg_og_aw_pricing_magentoid", obj.magentoId);
                        giftCertRec.commitLineItem(group);
                    }
                }

            }
        },*/

        /**
         * Provide associative array for pricing data
         */
        getPricingDataArray: function (customPricingData) {
            var arr = {};
            for (var i = 0; i < customPricingData.length; i++) {
                var obj = customPricingData[i];
                if(!!obj.internalId) {
                    arr[obj.internalId] = {price: obj.price, itemId:obj.internalId, magentoId: obj.magentoId};
                }
            }
            return arr;
        },

        /**
         * Export Gift certificates records to magento
         * @param records
         */
        processRecord: function (giftCertificateObj, store) {
            var context = nlapiGetContext();
            Utility.logDebug('processing gift cert item with internal Id: ', giftCertificateObj.internalId);
            try {
                var itemId = giftCertificateObj.internalId;
                var itemType = giftCertificateObj.recordType;
                var itemRec = nlapiLoadRecord(itemType, itemId);
                var itemParentRec;

                var itemParentId = itemRec.getFieldValue('parent');
                var itemParentRec;
                if (!!itemParentId) {
                    itemParentRec = nlapiLoadRecord(itemType, itemParentId);
                }
                // check if item already sync with magento
                var checkResult = this.checkIfAlreadySync(itemRec, store.systemId);
                Utility.logDebug('isSync', checkResult.isSync);
                var itemBodyFieldsData = this.getItemBodyFieldsData(itemId, itemRec, itemParentRec, store, checkResult.magentoId);
                Utility.logDebug('itemBodyFieldsData', JSON.stringify(itemBodyFieldsData));
                // update the item it is already exist
                if (checkResult.isSync) {
                    var updateProductXML = this.getUpdateItemXML(itemBodyFieldsData, store.sessionID, false);
                    Utility.logDebug('updateProductXML', updateProductXML);
                    var responseMagento = this.validateItemExportResponse(XmlUtility.soapRequestToMagento(updateProductXML), 'update');
                    if (responseMagento.status == false) {
                        var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                        var msg = 'Item having NS Id: ' + itemId + ' has not exported while updating. -- ' + errMsg;
                        nlapiLogExecution("ERROR", " Error From Magento " + msg);
                        this.setMagentoData(itemType, itemId, null, null, msg);
                    } else {
                        nlapiLogExecution("DEBUG", 'ITEM UPDATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
                        var magId = responseMagento.result;
                        nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
                    }
                } else {
                    // create item in magento it is new item
                    var createProductXML = this.getCreateItemXML(itemBodyFieldsData, store.sessionID, 'CHILD');
                    Utility.logDebug('createProductXML', createProductXML);
                    var responseMagento = this.validateItemExportResponse(XmlUtility.soapRequestToMagento(createProductXML), 'create');
                    if (responseMagento.status == false) {
                        var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                        var msg = 'Item having NS Id: ' + itemId + ' has not exported while creating. -- ' + errMsg;
                        nlapiLogExecution("ERROR", " Error From Magento " + msg);
                        this.setMagentoData(itemType, itemId, null, null, msg);
                    } else {
                        nlapiLogExecution("DEBUG", 'ITEM CREATED IN MAGENTO', 'SUCCESSFULLY - Item having NS Id: ' + itemId);
                        //var magId = responseMagento.result;
                        var magId = itemBodyFieldsData.sku;
                        var magentoIdsArr = ConnectorCommon.getMagentoIdObjectArrayStringForItem(store.systemId, magId, 'create', itemBodyFieldsData.magentoIdsArr);
                        this.setMagentoData(itemType, itemId, magentoIdsArr, 'T', '');
                        nlapiLogExecution("DEBUG", 'ITEM UPDATED IN NETSUITE SUCCESSFULLY', 'NETSUITE ITEM ID: ' + itemId + ' MAGENTO ITEM ID: ' + magId);
                    }
                }

                RecordsToSync.markProcessed(giftCertificateObj.customRecordInternalId, RecordsToSync.Status.Processed);
            } catch (e) {
                Utility.logException('Error during processRecord, internalId: ' + giftCertificateObj.internalId, e);
            }
        },

        /**
         * Set magento related data in item magento tab
         * @param itemType
         * @param itemId
         * @param magentoIdsArr
         * @param magentoSync
         * @param magentoSyncStatus
         */
        setMagentoData: function (itemType, itemId, magentoIdsArr, magentoSync, magentoSyncStatus) {
            var fields = [];
            var data = [];
            if (!!magentoIdsArr) {
                fields.push(ConnectorConstants.Item.Fields.MagentoId);
                data.push(magentoIdsArr);
            }
            if (!!magentoSync) {
                fields.push(ConnectorConstants.Item.Fields.MagentoSync);
                data.push(magentoSync);
            }
            fields.push(ConnectorConstants.Item.Fields.MagentoSyncStatus);
            data.push(magentoSyncStatus);
            nlapiSubmitField(itemType, itemId, fields, data);
        },

        /**
         * Get xml for get item creation call
         * @param product
         * @param sessionID
         * @param type
         * @returns {*}
         */
        getCreateItemXML: function (product, sessionID, type) {
            var xml;
            xml = XML_HEADER;
            xml = xml + '<urn:catalogProductCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '   <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionID + '</sessionId>';
            xml = xml + '   <type xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + product.type + '</type>';
            xml = xml + '   <set xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + product.attributeSet + '</set>';
            xml = xml + '   <sku xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + product.sku + '</sku>';
            xml = xml + '   <productData xsi:type="urn:catalogProductCreateEntity" xs:type="type:catalogProductCreateEntity" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            xml = xml + '       <categories xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[' + product.categories.length + ']" xs:type="type:catalogProductTierPriceEntity">';
            if (product.categories.length > 0) {
                for (var i = 0; i < product.categories.length; i++) {
                    xml = xml + '           <item xsi:type="xsd:string">' + product.categories[i] + '</item>';
                }
            }
            xml = xml + '       </categories>';
            xml = xml + '       <websites xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[1]" xs:type="type:catalogProductTierPriceEntity">';
            xml = xml + '           <item xsi:type="xsd:string">' + product.websiteId + '</item>';
            xml = xml + '       </websites>';
            xml = xml + '       <name xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.name + '</name>';
            xml = xml + '       <description xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.description + '</description>';
            xml = xml + '       <short_description xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.shortDescription + '</short_description>';
            xml = xml + '       <weight xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.weight + '</weight>';
            xml = xml + '       <status xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.status + '</status>';
            xml = xml + '       <url_key xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.urlComponent + '</url_key>';
            xml = xml + '       <visibility xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.visibility + '</visibility>';
            xml = xml + '       <price xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.price + '</price>';
            xml = xml + '       <tax_class_id xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.taxClass + '</tax_class_id>';
            xml = xml + '       <meta_title xsi:type="xsd:string" xs:type="type:string">' + product.metaTitle + '</meta_title>';
            xml = xml + '       <meta_keyword xsi:type="xsd:string" xs:type="type:string">' + product.metaKeywords + '</meta_keyword>';
            xml = xml + '       <meta_description xsi:type="xsd:string" xs:type="type:string">' + product.metaDescription + '</meta_description>';
            xml = xml + '       <stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';
            xml = xml + '           <qty xsi:type="xsd:string" xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns/">' + product.quantity + '</qty>';
            xml = xml + '           <is_in_stock xsi:type="xsd:int" xs:type="type:int">' + product.stockAvailability + '</is_in_stock>';
            xml = xml + '           <manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.manageStock + '</manage_stock>';
            xml = xml + '           <use_config_manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.useConfigManageStock + '</use_config_manage_stock>';
            xml = xml + '       </stock_data>';

            xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';
            xml = xml + '<single_data xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[4]">';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_allow_open_amount</key>';
            xml = xml + '<value>' + product.allowOpenAmount + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_open_amount_min</key>';
            xml = xml + '<value>' + product.openAmountMinValue + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_open_amount_max</key>';
            xml = xml + '<value>' + product.openAmountMaxValue + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>f3mg_custom_pricing_data</key>';
            xml = xml + '<value>' + JSON.stringify(product.customPricingList)+ '</value>';
            xml = xml + '</item>';
            xml = xml + '</single_data>';
            xml = xml + '</additional_attributes>';

            xml = xml + '   </productData>';
            //xml = xml + '   <storeView xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + product.storeViewId + '</storeView>';
            xml = xml + '</urn:catalogProductCreate>';
            xml = xml + XML_FOOTER;
            return xml;
        },

        /**
         * Validate item export response
         * @param xml
         * @param operation
         * @returns {{}}
         */
        validateItemExportResponse: function (xml, operation) {
            var responseMagento = {};
            var magentoItemID;
            var faultCode;
            var faultString;
            try {
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
                if (operation === 'create') {
                    magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductCreateResponse/result");
                } else if (operation === 'update') {
                    magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");
                }
            } catch (ex) {}
            if (!!faultCode) {
                responseMagento.status = false; // Means There is fault
                responseMagento.faultCode = faultCode; // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            } else if (!!magentoItemID) {
                responseMagento.status = true; // Means There is fault
                responseMagento.result = magentoItemID;
            } else // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            }
            return responseMagento;
        },

        /**
         * Get xml for get item updation call
         * @param product
         * @param sessionID
         * @param isParent
         * @returns {string}
         */
        getUpdateItemXML: function (product, sessionID, isParent) {
            var xml = '';
            xml += XML_HEADER + '<urn:catalogProductUpdate>';
            xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
            xml = xml + '<product xsi:type="xsd:string">' + product.magentoId + '</product>';
            //xml = xml + '<product xsi:type="xsd:string">' + product.sku + '</product>';
            xml = xml + '   <productData xsi:type="urn:catalogProductCreateEntity" xs:type="type:catalogProductCreateEntity" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            xml = xml + '       <categories xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[' + product.categories.length + ']" xs:type="type:catalogProductTierPriceEntity">';
            if (product.categories.length > 0) {
                for (var i = 0; i < product.categories.length; i++) {
                    xml = xml + '           <item xsi:type="xsd:string">' + product.categories[i] + '</item>';
                }
            }
            xml = xml + '       </categories>';
            xml = xml + '       <websites xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[1]" xs:type="type:catalogProductTierPriceEntity">';
            xml = xml + '           <item xsi:type="xsd:string">' + product.websiteId + '</item>';
            xml = xml + '       </websites>';
            xml = xml + '       <name xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.name + '</name>';
            xml = xml + '       <description xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.description + '</description>';
            xml = xml + '       <short_description xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.shortDescription + '</short_description>';
            xml = xml + '       <weight xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.weight + '</weight>';
            xml = xml + '       <status xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.status + '</status>';
            xml = xml + '       <url_key xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.urlComponent + '</url_key>';
            xml = xml + '       <visibility xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.visibility + '</visibility>';
            xml = xml + '       <price xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.price + '</price>';
            xml = xml + '       <aw_gc_open_amount_min xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.price + '</aw_gc_open_amount_min>';

            xml = xml + '       <tax_class_id xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.taxClass + '</tax_class_id>';
            xml = xml + '       <meta_title xsi:type="xsd:string" xs:type="type:string">' + product.metaTitle + '</meta_title>';
            xml = xml + '       <meta_keyword xsi:type="xsd:string" xs:type="type:string">' + product.metaKeywords + '</meta_keyword>';
            xml = xml + '       <meta_description xsi:type="xsd:string" xs:type="type:string">' + product.metaDescription + '</meta_description>';
            xml = xml + '       <stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';
            xml = xml + '           <qty xsi:type="xsd:string" xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns/">' + product.quantity + '</qty>';
            xml = xml + '           <is_in_stock xsi:type="xsd:int" xs:type="type:int">' + product.stockAvailability + '</is_in_stock>';
            xml = xml + '           <manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.manageStock + '</manage_stock>';
            xml = xml + '           <use_config_manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.useConfigManageStock + '</use_config_manage_stock>';
            xml = xml + '       </stock_data>';

            xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';
            xml = xml + '<single_data xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[4]">';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_allow_open_amount</key>';
            xml = xml + '<value>' + product.allowOpenAmount + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_open_amount_min</key>';
            xml = xml + '<value>' + product.openAmountMinValue + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>aw_gc_open_amount_max</key>';
            xml = xml + '<value>' + product.openAmountMaxValue + '</value>';
            xml = xml + '</item>';
            xml = xml + '<item>';
            xml = xml + '<key>f3mg_custom_pricing_data</key>';
            xml = xml + '<value>' + JSON.stringify(product.customPricingList)+ '</value>';
            xml = xml + '</item>';
            xml = xml + '</single_data>';
            xml = xml + '</additional_attributes>';

            xml = xml + '   </productData>';
            //xml = xml + '<storeView xsi:type="xsd:string">' + product.storeViewId + '</storeView>';
            xml = xml + '<identifierType xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + 'sku' + '</identifierType>';
            xml = xml + '</urn:catalogProductUpdate>';
            xml = xml + XML_FOOTER;
            return xml;
        },

        /**
         * Get Items Body Fields Data
         * @param itemRec
         * @param parItemRec
         * @param store
         * @param magentoId
         * @returns {{}}
         */
        getItemBodyFieldsData: function(itemInternalId, itemRec, parItemRec, store, magentoId) {
            var dataObj = {};
            dataObj.additionalAttributes = [];
            dataObj.magentoId = magentoId;
            dataObj.type = store.entitySyncInfo.giftcertificateitem.itemType;
            dataObj.attributeSet = store.entitySyncInfo.giftcertificateitem.attributeSet;
            dataObj.storeViewId = store.entitySyncInfo.giftcertificateitem.storeView;
            dataObj.websiteId = store.entitySyncInfo.giftcertificateitem.websiteId;
            dataObj.categories = [];
            var name = itemRec.getFieldValue('displayname');
            dataObj.name = nlapiEscapeXML(name);
            var storeDescription = itemRec.getFieldValue('storedescription') || '';
            var storeDetailDescription = itemRec.getFieldValue('storedetaileddescription') || '';
            var lineBreakStr = '';
            if (storeDescription && storeDetailDescription) {
                lineBreakStr = this.lineBreak(1);
            }
            dataObj.description = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
            dataObj.shortDescription = nlapiEscapeXML(storeDetailDescription + lineBreakStr + storeDescription);
            dataObj.urlComponent = nlapiEscapeXML(itemRec.getFieldValue('urlcomponent') || '');
            dataObj.metaTitle = nlapiEscapeXML(itemRec.getFieldValue('pagetitle') || '');
            dataObj.metaKeywords = nlapiEscapeXML(itemRec.getFieldValue('searchkeywords' || ''));
            dataObj.metaDescription = dataObj.shortDescription;
            var itemId = (itemRec.getFieldValue('itemid') + '');
            dataObj.sku = nlapiEscapeXML(itemId);
            dataObj.weight = itemRec.getFieldValue('weight') || 0;
            var price = 0;
            if (Utility.isMultiCurrency()) {
                // We will fetch first price level by assuming that it will be USA currency
                price = itemRec.getLineItemValue('price', 'price_1_', 1);
            } else {
                price = itemRec.getFieldValue('rate') || 0;
            }
            dataObj.price = price;
            var quantityLocation = store.entitySyncInfo.item.quantityLocation;
            if (Utility.isMultiLocInvt()) {
                var locLine = itemRec.findLineItemValue('locations', 'location', quantityLocation);
                dataObj.quantity = itemRec.getLineItemValue('locations', 'quantityavailable', locLine) || 0;
            } else {
                dataObj.quantity = itemRec.getFieldValue('quantityavailable') || 0;
            }
            dataObj.customDesign = nlapiEscapeXML('default'); // test
            var displayInWebsite = itemRec.getFieldValue('isonline') === 'T';
            var isInactive = itemRec.getFieldValue('isinactive') === 'T';
            if (isInactive) {
                dataObj.status = '2'; // Disabled
            } else {
                dataObj.status = '1'; // Enabled
            }
            if (displayInWebsite) {
                dataObj.visibility = '4'; //Catalog, Search / visible
            } else {
                dataObj.visibility = '1'; // Not visible
            }
            dataObj.taxClass = store.entitySyncInfo.giftcertificateitem.taxClass;// Default
            dataObj.manageStock = '1';// manage stock
            dataObj.stockAvailability = '1';// is in stock
            dataObj.useConfigManageStock = '0';// use config manage stock
            dataObj.magentoIdsArr = itemRec.getFieldValue(ConnectorConstants.Item.Fields.MagentoId) || '';
            var allowOpenAmount = itemRec.getFieldValue(ConnectorConstants.Item.Fields.AllowOpenAmount) || 'F';
            dataObj.allowOpenAmount = allowOpenAmount === 'T' ? '1' : '0';
            dataObj.openAmountMinValue = itemRec.getFieldValue(ConnectorConstants.Item.Fields.OpenAmountMinValue) || 0;
            dataObj.openAmountMaxValue = itemRec.getFieldValue(ConnectorConstants.Item.Fields.OpenAmountMaxValue) || 0;
            dataObj.customPricingList = MagentoCustomPricingDao.getRecords(itemInternalId);
            dataObj.customPricingData = {
                allowOpenAmount: dataObj.allowOpenAmount,
                openAmountMinValue: dataObj.openAmountMinValue,
                openAmountMaxValue: dataObj.openAmountMaxValue,
                customPricingList: dataObj.customPricingList
            };
            return dataObj;
        },

        /**
         * Line break
         * @param lines
         * @returns {string}
         */
        lineBreak: function (lines) {
            var lineStr = '';
            for (var line = 0; line < lines; line++) {
                lineStr += '<BR>';
            }
            return lineStr;
        },

        /**
         * Check if item already synched
         * @param itemType
         * @param itemId
         * @param sessionID
         * @param syncInfo
         * @param type
         * @returns {*}
         */
        checkIfAlreadySync: function (itemRec, storeId) {
            var isExist = false;
            var magentoId = '';
            var magentoIdsArr = itemRec.getFieldValue(ConnectorConstants.Item.Fields.MagentoId);
            if (!magentoIdsArr) {
                return false;
            } else {
                try {
                    var magentoIds = JSON.parse(magentoIdsArr);
                    for (var i = 0; i < magentoIds.length; i++) {
                        var obj = magentoIds[i];
                        if (obj.StoreId == storeId && !!obj.MagentoId) {
                            isExist = true;
                            magentoId = obj.MagentoId;
                            break;
                        }
                    }
                } catch (e) {}
            }
            return {
                isSync: isExist,
                magentoId: magentoId
            };
        },

        /**
         * Get sync response from magento
         * @param dataObj
         * @returns {Object|*|responseMagento.result|Object.result|_.result}
         */
        getSyncResponse: function (dataObj) {
            var xml = '';
            xml += XML_HEADER;
            xml = xml + '<urn:catalogProductList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<sessionId xsi:type="xsd:string">' + dataObj.sessionId + '</sessionId>';
            xml = xml + '<filters xsi:type="urn:filters">';
            xml = xml + '<filter xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[1]">';
            xml = xml + '<item>';
            xml = xml + '<key>sku</key>';
            xml = xml + '<value>' + dataObj.productSku + '</value>';
            xml = xml + '</item>';
            xml = xml + '</filter>';
            xml = xml + '</filters>';
            xml = xml + '</urn:catalogProductList>';
            xml += XML_FOOTER;
            var response = this.validateItemIDResponse(soapRequestToMagento(xml));
            return response.result;
        },

        /**
         * Validate Item Id Response
         * @param xml
         * @returns {Object}
         */
        validateItemIDResponse: function (xml) {
            var responseMagento = new Object();
            var magentoItemID;
            var faultCode;
            var faultString;
            try {
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
                magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductListResponse/storeView/item/product_id");
            } catch (ex) {}
            if (faultCode != null) {
                responseMagento.status = false; // Means There is fault
                responseMagento.faultCode = faultCode; // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            } else if (magentoItemID != null) {
                responseMagento.status = true; // Means There is fault
                responseMagento.result = magentoItemID;
            } else // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            }
            return responseMagento;
        }
    };
})();