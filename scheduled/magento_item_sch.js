/**
 * Created by zahmed on 13-Jan-15.
 *
 * Description:
 * - This script is responsible for syncing inventory quantity and pricing to Magento store(s)
 * -
 * Referenced By:
 * -
 * Dependency:
 * - Script Parameters:
 *   - InternalId - custscriptcustscriptinternalid - Free-Form Text
 *   - Start Date - custscript_start_date - Date/Time
 * -
 * - Script Id:
 *   - customscript_magento_item_sync_sch
 * -
 * - Deployment Id:
 *   - customdeploy_magento_item_sync_sch
 * -
 * - Scripts:
 *   - accessMagento.js
 *   - connector_common_records.js
 *   - folio3ConnectorLicenseVerification.js
 *   - mc_sync_constants.js
 *   - f3_inventory_sync_script_dao.js
 *   - f3_utility_methods.js
 */

var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';

function getMagentoID(sessionID, product) {
    var xml;
    xml = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">';
    xml = xml + '<soapenv:Header/>';
    xml = xml + '<soapenv:Body>';
    xml = xml + '<urn:catalogProductList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<filters xsi:type="urn:filters">';
    xml = xml + '<filter xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[1]">';
    xml = xml + '<item>';
    xml = xml + '<key>sku</key>';
    xml = xml + '<value>' + product.magentoSKU + '</value>';
    xml = xml + '</item>';
    xml = xml + '</filter>';
    xml = xml + '</filters>';
    xml = xml + '</urn:catalogProductList>';
    xml = xml + '</soapenv:Body>';
    xml = xml + '</soapenv:Envelope>';

    var response = validateGetIDResponse(soapRequestToMagento(xml));
    if (response.status === true) {
        return response.result;
    }
}

function getUpdateItemXML(item, sessionID, magID, isParent) {
    nlapiLogExecution('DEBUG', 'item json', JSON.stringify(item));

    var xml = '';

    xml = XML_HEADER + '<urn:catalogProductUpdate>';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<product xsi:type="xsd:string">' + magID + '</product>';

    xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
    /*xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';

     xml = xml + '<single_data xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[4]">';
     xml = xml + '<item>';
     xml = xml + '<key>custitem_queenst_stock </key>';
     xml = xml + '<value>' + item.custitem_queenst_stock + '</value>';
     xml = xml + '</item>';
     xml = xml + '<item>';
     xml = xml + '<key>custitem_vault_stock</key>';
     xml = xml + '<value>' + item.custitem_vault_stock + '</value>';
     xml = xml + '</item>';
     xml = xml + '<item>';
     xml = xml + '<key>custitem_annst_stock</key>';
     xml = xml + '<value>' + item.custitem_annst_stock + '</value>';
     xml = xml + '</item>';
     xml = xml + '<item>';
     xml = xml + '<key>custitem_linklogic_stock</key>';
     xml = xml + '<value>' + item.custitem_linklogic_stock + '</value>';
     xml = xml + '</item>';
     xml = xml + '</single_data>';
     xml = xml + '</additional_attributes>';*/

    xml = xml + '<price xsi:type="xsd:string">' + item.price + '</price>';

    xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';

    if (isParent) {
        item.quatity = 0;
    }
    xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + item.quatity + '</qty>';
    if (item.quatity >= 1) {
        xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';
    }

    xml = xml + '</stock_data>';
    xml = xml + '</productData>';
    xml = xml + '<storeView xsi:type="xsd:string">11</storeView>';
    xml = xml + '</urn:catalogProductUpdate>';
    xml = xml + XML_FOOTER;

    return xml;

}

function getCreateCategoryXML(category, sessionID) {
    var categoryXML = '';
    categoryXML = XML_HEADER + '<urn:catalogCategoryCreate>';
    categoryXML = categoryXML + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    categoryXML = categoryXML + '<parentId xsi:type="xsd:string">' + category.parent + '</parentId>';
    categoryXML = categoryXML + '<categoryData xsi:type="urn:catalogCategoryEntityCreate">';
    categoryXML = categoryXML + '<name xsi:type="xsd:string">' + category.name.replace('&', ' AND ') + '</name>';
    categoryXML = categoryXML + '<is_active xsi:type="xsd:int">1</is_active>';
    // categoryXML = categoryXML + '<position xsi:type="xsd:int">'+(category.level+1)+'</position>';
    categoryXML = categoryXML + '<available_sort_by SOAP-ENC:arrayType="xsd:string[0]" xsi:type="urn:ArrayOfString">';
    categoryXML = categoryXML + '<item xsi:type="xsd:string">position</item>';
    categoryXML = categoryXML + '</available_sort_by>';
    categoryXML = categoryXML + '<custom_design xsi:type="xsd:string"></custom_design>';
    categoryXML = categoryXML + '<custom_design_apply  xsi:type="xsd:int"></custom_design_apply>';
    categoryXML = categoryXML + '<custom_design_from xsi:type="xsd:string"></custom_design_from>';
    categoryXML = categoryXML + '<custom_design_to xsi:type="xsd:string"></custom_design_to>';
    categoryXML = categoryXML + '<custom_layout_update xsi:type="xsd:string"></custom_layout_update>';
    categoryXML = categoryXML + '<default_sort_by xsi:type="xsd:string">position</default_sort_by>';
    categoryXML = categoryXML + '<description xsi:type="xsd:string"></description>';
    categoryXML = categoryXML + '<display_mode xsi:type="xsd:string"></display_mode>';
    categoryXML = categoryXML + '<is_anchor xsi:type="xsd:int"></is_anchor>';
    categoryXML = categoryXML + '<landing_page xsi:type="xsd:int"></landing_page>';
    categoryXML = categoryXML + '<meta_description xsi:type="xsd:string"></meta_description>';
    categoryXML = categoryXML + '<meta_keywords xsi:type="xsd:string"></meta_keywords>';
    categoryXML = categoryXML + '<meta_title xsi:type="xsd:string"></meta_title>';
    categoryXML = categoryXML + '<page_layout xsi:type="xsd:string"></page_layout>';
    categoryXML = categoryXML + '<url_key xsi:type="xsd:string"></url_key>';
    categoryXML = categoryXML + '<include_in_menu xsi:type="xsd:int">1</include_in_menu>';
    categoryXML = categoryXML + '</categoryData>';
    categoryXML = categoryXML + '<storeView xsi:type="xsd:string">1</storeView>';
    categoryXML = categoryXML + '</urn:catalogCategoryCreate>';

    categoryXML = categoryXML + XML_FOOTER;
    var xml = soapRequestToMagento(categoryXML);
    var responseMagento = new Object();
    var magentoCatID;
    var faultCode;
    var faultString;

    //saveXML(xml);

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        magentoCatID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryCreateResponse/attribute_id");


    } catch (ex) {
        responseMagento.status = false;
        responseMagento.faultCode = ex;

        nlapiLogExecution('Debug', 'XXXXXX', nlapiXMLToString(xml));
        return responseMagento;
    }


    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Category Delete Operation Faild', responseMagento.faultString);
        //  return ex;
    }
    else if (magentoCatID != null) {
        responseMagento.status = true;
        responseMagento.attributeid = magentoCatID;
        //  return  responseMagento;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';

        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Category Delete Operation Faild', responseMagento.faultString);
        // return 'UX ERROR';
    }


    return responseMagento;


}

function getCreateItemXML(product, sessionID, categoryIds) {
    var xml = '';

    xml = XML_HEADER + '<urn:catalogProductCreate>';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<type xsi:type="xsd:string">simple</type>';
    xml = xml + '<set xsi:type="xsd:string">4</set>';
    xml = xml + '<sku xsi:type="xsd:string">' + product.internalId + '</sku>';
    xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
    xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';

    /*  xml =  xml + '<single_data xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[1]">';
     xml =  xml + '<item>';
     xml =  xml + '<key>custitem_queenst_stock</key>';
     xml =  xml + '<value>56920</value>';
     xml =  xml + '</item>';
     xml =  xml + '</single_data>';
     xml =  xml + '</additional_attributes>';
     */

    xml = xml + '<categories SOAP-ENC:arrayType="xsd:string[' + categoryIds.length + ']" xsi:type="urn:ArrayOfString">';

    if (categoryIds != null && categoryIds.length > 0) {
        for (var i = 0; i < categoryIds.length; i++) {
            xml = xml + ' <item xsi:type="xsd:string">' + categoryIds[i] + '</item>';
        }
    }

    xml = xml + '</categories>';

    xml = xml + '<websites SOAP-ENC:arrayType="xsd:string[1]" xsi:type="urn:ArrayOfString"><item xsi:type="xsd:string">1</item></websites>';
    xml = xml + '<name xsi:type="xsd:string">' + product.name + '</name>';
    xml = xml + '<description xsi:type="xsd:string">' + product.description + '</description>';
    //nlapiLogExecution('Debug','desc',(item.displayname=='')?item.description:item.displayname);
    //xml =  xml + '<short_description xsi:type="xsd:string">'+(item.displayname=='')?item.description:item.displayname+'</short_description>';
    xml = xml + '<short_description xsi:type="xsd:string">' + product.description + '</short_description>';
    xml = xml + '<weight xsi:type="xsd:string">0.0000</weight>';
    xml = xml + '<status xsi:type="xsd:string">1</status>';
    xml = xml + '<visibility xsi:type="xsd:string">4</visibility>';
    xml = xml + '<price xsi:type="xsd:string">' + product.price + '</price>';
    xml = xml + '<tax_class_id xsi:type="xsd:string">0</tax_class_id>';
    xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';

    xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + product.quatity + '</qty>';
    if (product.quatity >= 1)
        xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';

    xml = xml + '</stock_data>';


    xml = xml + '</productData>';
    xml = xml + '</urn:catalogProductCreate>';
    nlapiLogExecution('DEBUG', 'response', (xml));
    xml = xml + XML_FOOTER;

    // saveXML(xml);

    return xml;

}

function validateItemExportResponse(xml, operation) {
    var responseMagento = new Object();
    var magentoItemID;
    var faultCode;
    var faultString;

    //saveXML(nlapiXMLToString(xml));

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        if (operation == 'create')
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductCreateResponse/result");
        else if (operation == 'update')
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


    } catch (ex) {
    }


    //saveXML(xml);

    //saveXML(nlapiXMLToString(xml));

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
    }
    else if (magentoItemID != null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = magentoItemID;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);

    }

    return responseMagento;
}

function validateGetIDResponse(xml) {
    var responseMagento = new Object();
    var magentoItemID;
    var faultCode;
    var faultString;

    //saveXML(nlapiXMLToString(xml));

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");


        magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductListResponse/storeView/item/product_id");


    } catch (ex) {
    }


    //saveXML(xml);

    //saveXML(nlapiXMLToString(xml));

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
    }
    else if (magentoItemID != null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = magentoItemID;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);

    }

    return responseMagento;
}

function addslashes(str) {
    return  (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function ws_soaftsubm(type) {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {

        //Getting Session
        var context = nlapiGetContext();

        var scriptStartDate = context.getSetting('SCRIPT', ScriptParameter.ScriptStartDate);
        var lastModifiedDate = getLastModifiedDate();

        if (!scriptStartDate) {
            var currentDate = Utility.getDateUTC(0);
            scriptStartDate = nlapiDateToString(currentDate, 'datetimetz');
        }

        context.setPercentComplete(0.00);  // set the percent complete parameter to 0.00
        URL = MGCONFIG.WebService.EndPoint;
        var webserviceid = MGCONFIG.WebService.UserName;
        var webservicepw = MGCONFIG.WebService.Password;
        var sofrequency = '4';//context.getSetting('SCRIPT', 'custscript_magento_ws_frequency');
        var soprice = '1'; //context.getSetting('SCRIPT', 'custscript_magento_ws_price');
        var sessionID;
        // Fetching session
        var sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
        if (sessionObj == null) {
            return false;
        }
        if (sessionObj.errorMsg == '') {
            sessionID = sessionObj.data;
        } else {
            return false;
        }

        // End Getting Session
        var ctx = nlapiGetContext();
        var paramInternalId = ctx.getSetting('SCRIPT', ScriptParameter.LastInternalId);
        nlapiLogExecution('AUDIT', 'Param', paramInternalId);
        do {

            // Fetching next 1000 records
            var filter = new Array();
            var column = new Array();
            filter.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', (paramInternalId == null) ? 0 : paramInternalId));
            //filter.push(new nlobjSearchFilter('custitem_item_sync', null, 'is', 'T'));
            filter.push(new nlobjSearchFilter('custitem_magentosyncdev', null, 'is', 'T'));
            filter.push(new nlobjSearchFilter('lastmodifieddate', null, 'onorafter', lastModifiedDate));

            var col = new nlobjSearchColumn('internalid');
            col.setSort(false);
            column.push(col);
            column.push(new nlobjSearchColumn('modified'));
            var records = nlapiSearchRecord('item', null, filter, column);
            nlapiLogExecution('AUDIT', 'parammm', paramInternalId);
            var skip = false;
            if (records && records.length > 0) {

                // processing records  //records.length
                for (var j = 0; j < records.length; j++) {
                    skip = false;
                    var product_id = records[j].getId();

                    if (j == 0) {
                        nlapiLogExecution('AUDIT', '1st ProductId', product_id);
                    }
                    if (j >= records.length - 1) {
                        nlapiLogExecution('AUDIT', 'Last ProductId', product_id);
                        paramInternalId = product_id;
                    }

                    var itemRec = nlapiLoadRecord(records[j].getRecordType(), product_id);
                    var magentoId = itemRec.getFieldValue('custitem_magentoid');

                    var product = {};
                    // product.queenStock = itemRec.getFieldValue('custitem_queenst_stock');
                    if (!isDevAccount()) {
                        product.price = itemRec.getLineItemValue('price1', 'price_1_', soprice) || 0;// base price, soprice = 1, price1 = GBP
                        var locLine = itemRec.findLineItemValue('locations', 'location', '1');// Goddiva Warehouse Main : Goddiva Warehouse
                        //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', locLine) || 0;
                        product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', locLine) || 0;
                    } else {
                        product.price = itemRec.getLineItemValue('price1', 'price_1_', soprice) || 0;
                        //product.quatity = itemRec.getLineItemValue('locations', 'quantityonhand', 1) || 0;
                        product.quatity = itemRec.getLineItemValue('locations', 'quantityavailable', 1) || 0;
                    }

                    var productRecordtype = records[j].getRecordType();
                    var matrixType = itemRec.getFieldValue('matrixtype');

                    // if matrix parent then getting magento ids from custom records
                    if (matrixType === 'PARENT') {
                        var mgParentRecs = getMagentoParents(product_id);
                        for (var p in mgParentRecs) {
                            var mgParentRec = mgParentRecs[p];
                            var mgProductId = mgParentRec.getValue('custrecord_mpss_magento_id');
                            product.magentoSKU = mgProductId;
                            syncProduct(product, productRecordtype, product_id, sessionID, true);
                        }
                        // Updated Successfully
                        nlapiLogExecution("EMERGENCY", 'item id: ' + product_id, 'configurable items are synced successfully');
                        //nlapiSubmitField(productRecordtype, product_id, 'custitem_item_sync', 'F');
                    } else {
                        // if child matrix item
                        product.magentoSKU = magentoId;
                        syncProduct(product, productRecordtype, product_id, sessionID, false);
                    }

                    var usageRemaining = ctx.getRemainingUsage();
                    if (usageRemaining < 2000) {
                        var params = [];
                        params[ScriptParameter.LastInternalId] = product_id;
                        params[ScriptParameter.ScriptStartDate] = scriptStartDate;
                        nlapiLogExecution("Audit", 'Scheduled', product_id);
                        nlapiScheduleScript('customscript_magento_item_sync_sch', 'customdeploy_magento_item_sync_sch', params);
                        return true;
                    }

                    context.setPercentComplete(Math.round(((100 * j) / records.length) * 100) / 100);  // calculate the results

                    // displays the percentage complete in the %Complete column on
                    // the Scheduled Script Status page
                    context.getPercentComplete();  // displays percentage complete
                }


                nlapiLogExecution('Emergency', 'index', j + ' productId  ' + product_id + ' usageLimt  ' + usageRemaining);
            }


        } while (records != null);

        // update date in custom record
        InventorySyncScript.updateStatus('Last Run Date', scriptStartDate);
    } else {
        nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
    }
}

function getMagentoParents(itemId) {
    var result = [];
    try {
        var cols = [];
        var fils = [];
        fils.push(new nlobjSearchFilter('custrecord_mpss_parent_matrix_item', null, 'anyof', [itemId]));
        cols.push(new nlobjSearchColumn('custrecord_mpss_parent_matrix_item'));
        cols.push(new nlobjSearchColumn('custrecord_mpss_magento_id'));
        cols.push(new nlobjSearchColumn('custrecord_mpss_magento_sku'));
        result = nlapiSearchRecord('customrecord_f3_matrix_parent_sync_stats', null, fils, cols) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'MatrixParentSyncStatus.lookup', e.toString());
    }
    return result;
}

function syncProduct(product, productRecordtype, product_id, sessionID, isParent) {
    try {
        var itemXML;
        // check if Magento Item is in Netsuite
        if (product.magentoSKU != null) {

            //var magID = getMagentoID(sessionID, product);
            var magID = product.magentoSKU;
            itemXML = getUpdateItemXML(product, sessionID, magID, isParent);
            responseMagento = validateItemExportResponse(soapRequestToMagento(itemXML), 'update');
            // If due to some reason Magento item is unable to update
            // Send Email Magento Side error
            if (responseMagento.status === false) {
                var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                var msg = 'Item having Magento Id: ' + magID + ' has not exported. of SKU  -- ' + product.magentoSKU + "FC" + responseMagento.faultCode + '--' + responseMagento.faultString;
                //   var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                // generateErrorEmail(msg, configuration, 'item');
                nlapiLogExecution("EMERGENCY", " Error From Magento " + msg);
            } else {
                // Updated Successfully
                nlapiLogExecution("EMERGENCY", 'item: ' + product_id + ' price: ', +product.price + ' item synced successfully - quantity: ' + product.quatity);
                if (!isParent) {
                    //nlapiSubmitField(productRecordtype, product_id, 'custitem_item_sync', 'F');
                }
            }
        }
    } catch (ex) {
        nlapiLogExecution('ERROR', 'syncProduct- product id: ' + product_id, ex.toString());
    }
}

function getLastModifiedDate() {
    var res = InventorySyncScript.lookup(new nlobjSearchFilter(InventorySyncScript.FieldName.Name, null, 'is', 'Last Run Date', null));
    var dateTime;
    if (res.length > 0) {
        dateTime = res[0].getValue(InventorySyncScript.FieldName.LastRunDateTime) + '';
        dateTime = dateTime.toLowerCase();
        dateTime = nlapiDateToString(nlapiStringToDate(dateTime, 'datetime'), 'datetime');
    }
    if (!dateTime) {
        dateTime = '1/12/2014 6:00 pm';
    }
    return dateTime;
}

var ScriptParameter = ScriptParameter || {};
ScriptParameter.LastInternalId = 'custscriptcustscriptinternalid';
ScriptParameter.ScriptStartDate = 'custscript_start_date';