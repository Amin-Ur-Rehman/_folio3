function addslashes(str) {
    return  (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';
function getRecords(paramInternalId) {
    var filter = new Array();
    var column = new Array();
    filter.push(new nlobjSearchFilter('internalidnumber', null, 'greaterthan', ( paramInternalId === null) ? 0 : paramInternalId));
    filter.push(new nlobjSearchFilter('custitem_item_sync', null, 'is', 'T'));
    //filter.push(new nlobjSearchFilter('parent', null, 'noneof','@NONE@'));
    var col = new nlobjSearchColumn('internalid');
    col.setSort();
    column.push(col);
    var records = nlapiSearchRecord('kititem', null, filter, column);
    return records;
}
function ws_soaftsubm() {

    //Getting Session
    var context = nlapiGetContext();
    URL = MGCONFIG.WebService.EndPoint;
    var webserviceid = MGCONFIG.WebService.UserName;
    var webservicepw = MGCONFIG.WebService.Password;
    var sofrequency = '4';//context.getSetting('SCRIPT', 'custscript_magento_ws_frequency');
    var soprice = '1'; //context.getSetting('SCRIPT', 'custscript_magento_ws_price');
    var itemXML;
    var sessionID;

    // Fetching session
    var sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
    if (sessionObj == null) {
        return false;
    }
    if (sessionObj.errorMsg == '') {
        sessionID = sessionObj.data;
    }
    // End Getting Session

    var ctx = nlapiGetContext();
    var paramInternalId = ctx.getSetting('SCRIPT', 'custscriptcustscriptinternalid');
    nlapiLogExecution('AUDIT', 'Param', paramInternalId);
    do {

        var records = getRecords(paramInternalId);
        nlapiLogExecution('AUDIT', 'parammm', paramInternalId);
        if (records != null) {

            // processing records 
            for (var j = 0; j < records.length; j++) {
                var failed = false;
                // needed for rescheduling
                product_id = records[j].getId();
                if (j == 0)
                    nlapiLogExecution('AUDIT', '1st ProductId', product_id);
                if (j >= records.length - 1) {
                    nlapiLogExecution('AUDIT', 'Last ProductId', product_id);
                    paramInternalId = product_id;
                }

                // current Item
                var loadedKit = nlapiLoadRecord('kititem', product_id);

                // components
                var components = {};
                for (var o = 1; o <= loadedKit.getLineItemCount('member'); o++) {
                    var skip = false;
                    components[loadedKit.getLineItemValue('member', 'item', o)] = {}
                    components[loadedKit.getLineItemValue('member', 'item', o)].quantity = loadedKit.getLineItemValue('member', 'quantity', o);
                }

                // childItems Of KitItem
                var childItems = nlapiSearchRecord('item', '', new nlobjSearchFilter('componentof', '', 'anyof', [records[0].getId()]), [new nlobjSearchColumn('type')]);

                // Processing Child Items
                for (var k = 0; k < childItems.length; k++) {
                    skip = false;
                    var child_product_id = childItems[k].getId();

                    var itemRec = nlapiLoadRecord(childItems[k].getRecordType(), child_product_id);
                    var price = itemRec.getLineItemValue('price1', 'price_1_', soprice);
                    var quatity = itemRec.getLineItemValue('locations', 'quantityonhand', 1)
                    var magentoId = itemRec.getFieldValue('custitem_magentoid');

                    product = new Object();
                    product.price = price;
                    product.quatity = quatity;
                    product.magentoId = magentoId;
                    product.internalId = child_product_id;
                    var desc = itemRec.getFieldValue('purchasedescription');
                    if (desc === null)
                        desc = 'None';
                    product.description = desc;
                    product.name = itemRec.getFieldValue('itemid').replace('&', ' AND ');

                    // check if Magento Item is in Netsuite
                    if (magentoId != null) {

                        components[product.internalId].magentoID = magentoId;
                        itemXML = getUpdateItemXML(product, sessionID);
                        responseMagento = validateItemExportResponse(soapRequestToMagento(itemXML), 'update');

                        // If due to some refilason Magento item is unable to update
                        // Send Email Magento Side error
                        if (responseMagento.status == false) {
                            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                            var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                            // generateErrorEmail(msg, configuration, 'item');
                            nlapiLogExecution("EMERGENCY", " Error From Magento " + msg);
                            failed = true;
                            continue;
                        } else {
                            // Updated Successfully
                            nlapiLogExecution("EMERGENCY", 'state', child_product_id + price + ' item synced successfully' + quatity);
                            // components[child_product_id].magentoID  = product.magentoId;
                        }
                    } else {

                        nlapiLogExecution("EMERGENCY", "Magento Id Doesnt Exist " + child_product_id);

                        var category = {};
                        category.Names = nlapiLookupField(childItems[k].getRecordType(), child_product_id, 'parent', true);
                        category.Ids = [itemRec.getFieldValue('parent')];
                        if (category.Names !== "") {
                            category.Names = category.Names.split(':').reverse();
                            if (category.Names.length > 0) {
                                for (var k = 0; k < category.Names.length; k++) {
                                    var categoryId = nlapiLookupField(childItems[k].getRecordType(), category.Ids[k], 'parent', false);
                                    category.Ids.push(categoryId);
                                }
                            }
                            nlapiLogExecution('DEBUG', "names", category.Names);
                        }

                        category.MagId = [];
                        var magentoIds = [];
                        // I have all the categories in level in array categoryIds
                        for (var t = category.Ids.length - 2; t >= 0; t--) {
                            var categoryMagId = nlapiLookupField(childItems[k].getRecordType(), category.Ids[t], 'custitem_magentoid', false);
                            nlapiLogExecution('DEBUG', "categoryMaGID", categoryMagId);
                            if (categoryMagId === "") {
                                var catObj;
                                if (t === category.Ids.length - 2) {
                                    catObj = { name: category.Names[t], parent: 2 };
                                    nlapiLogExecution('DEBUG', "Names at t ", category.Names[t]);
                                } else {
                                    catObj = { name: category.Names[t], parent: category.MagId[t + 1] };
                                    nlapiLogExecution('DEBUG', "Names at t ", category.Names[t] + "  parent :  " + category.MagId[t + 1]);
                                }

                                var result = getCreateCategoryXML(catObj, sessionID);
                                if (result.status == false) {
                                    failed = true;
                                    skip = true;
                                    nlapiLogExecution('DEBUG', "status", result.status + result.faultCode);
                                }
                                else {
                                    category.MagId[t] = result.attributeid;
                                    magentoIds.push(result.attributeid);
                                    nlapiSubmitField(childItems[k].getRecordType(), category.Ids[t], 'custitem_magentoid', result.attributeid);

                                }
                            }
                            else {
                                magentoIds.push(categoryMagId);
                                category.MagId[t] = categoryMagId;
                                nlapiLogExecution('DEBUG', categoryMagId);
                                // it exists go ahead :D
                            }
                        }
                        if (skip === true) {
                            continue;
                            failed = true;
                        }
                        //   if ( magentoIds.length < 1 )
                        magentoIds.push(2);
                        itemXML = getCreateItemXML(product, sessionID, magentoIds);
                        var responseMagento = validateItemExportResponse(soapRequestToMagento(itemXML), 'create');

                        // If due to some refilason Magento item is unable to update
                        // Send Email Magento Side error
                        if (responseMagento.status == false) {
                            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                            var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                            // generateErrorEmail(msg, configuration, 'item');
                            nlapiLogExecution("EMERGENCY", "Error From Magento " + msg);
                            failed = true;
                            continue;
                        } else {
                            // Updated Successfully
                            nlapiSubmitField(childItems[k].getRecordType(), child_product_id, 'custitem_magentoid', responseMagento.result);
                            components[child_product_id].magentoID = responseMagento.result;
                            nlapiLogExecution("EMERGENCY", 'state', child_product_id + price + ' item synced successfully' + quatity + " With ID " + responseMagento.result);

                        }

                    }

                }


                // If none of childItems fail Process KitItem
                if (failed == false) {
                    var kitMagentoId;
                    if (loadedKit.getFieldValue('custitem_magentoid') != null) {
                        //update magento item
                        kitMagentoId = loadedKit.getFieldValue('custitem_magentoid');

                    } else {

                        // Create Kit Item
                        product = new Object();
                        var magentoId = loadedKit.getFieldValue('custitem_magentoid');
                        var desc = loadedKit.getFieldValue('purchasedescription');
                        if (desc === null)
                            desc = 'None';
                        product.description = desc;
                        product.name = loadedKit.getFieldValue('itemid').replace('&', ' AND ');
                        product.magentoId = magentoId;
                        product.internalId = product_id;

                        var itemXML = getCreateItemXML(product, sessionID, [2], 'grouped');
                        var responseMagento = validateItemExportResponse(soapRequestToMagento(itemXML), 'create');

                        // If due to some refilason Magento item is unable to update
                        // Send Email Magento Side error
                        if (responseMagento.status == false) {
                            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                            var msg = 'Item having Magento Id: ' + product.magentoId + ' has not exported. -- ' + responseMagento.faultCode + '--' + responseMagento.faultString;
                            // generateErrorEmail(msg, configuration, 'item');
                            nlapiLogExecution("EMERGENCY", "Error From Magento " + msg);
                            continue;
                        } else {
                            // Updated Successfully
                            loadedKit.setFieldValue('custitem_magentoid', responseMagento.result);
                            kitMagentoId = responseMagento.result;
                            nlapiSubmitRecord(loadedKit);
                            nlapiLogExecution("EMERGENCY", 'state', product_id + '   KIT item synced successfully With ID ' + responseMagento.result);

                        }


                    }

                    // Link Kit Item With Other Items
                    // i,e items in array =
                    nlapiLogExecution('DEBUG', 'kitMagId', kitMagentoId);
                    nlapiLogExecution('DEBUG', 'components', JSON.stringify(components));

                    for (var item in components) {

                        createLinkWithGroupItem(sessionID, kitMagentoId, { quantity: components[item].quantity, internalId: components[item].magentoID });


                    }

                } else {
                    nlapiLogExecution("Error", 'Some Child Item Failed', product_id);
                    continue;
                }
                var usageRemaining = ctx.getRemainingUsage();
                if (usageRemaining < 2000) {
                    var params = new Array();
                    params['custscriptcustscriptinternalid'] = product_id;
                    nlapiLogExecution("Audit", 'Scheduled', product_id);
                    nlapiScheduleScript('customscript_magento_item_ceta', 'customdeploy_sync', params);
                    return true;
                }
            }


            nlapiLogExecution('Emergency', 'index', j + ' productId  ' + product_id + ' usageLimt  ' + usageRemaining);


        }


    } while (records != null);


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


function getUpdateItemXML(item, sessionID) {

    var xml = '';

    xml = XML_HEADER + '<urn:catalogProductUpdate>';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<product xsi:type="xsd:string">' + item.magentoId + '</product>';

    xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
    xml = xml + '<price xsi:type="xsd:string">' + item.price + '</price>';

    xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';

    xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + item.quatity + '</qty>';
    if (item.quatity >= 1)
        xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';

    xml = xml + '</stock_data>';
    xml = xml + '</productData>';
    xml = xml + '<storeView xsi:type="xsd:string">1</storeView>';
    xml = xml + '</urn:catalogProductUpdate>';
    xml = xml + XML_FOOTER;

    return xml;

}


function getCreateItemXML(product, sessionID, categoryIds, type) {
    var xml = '';

    xml = XML_HEADER + '<urn:catalogProductCreate>';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    if (type == 'grouped')
        xml = xml + '<type xsi:type="xsd:string">' + type + '</type>';
    else
        xml = xml + '<type xsi:type="xsd:string">simple</type>';
    xml = xml + '<set xsi:type="xsd:string">4</set>';
    xml = xml + '<sku xsi:type="xsd:string">' + product.internalId + '</sku>';
    xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
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
    if (type != 'grouped')
        xml = xml + '<price xsi:type="xsd:string">' + product.price + '</price>';
    xml = xml + '<tax_class_id xsi:type="xsd:string">0</tax_class_id>';
    xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';
    if (type != 'grouped')
        xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + product.quatity + '</qty>';
    if (type != 'grouped')
        if (product.quatity >= 1)
            xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';

    xml = xml + '</stock_data>';
    xml = xml + '</productData>';
    xml = xml + '</urn:catalogProductCreate>';
    nlapiLogExecution('DEBUG', 'response', (xml));
    xml = xml + XML_FOOTER;

    return xml;

}


function validateItemExportResponse(xml, operation) {
    var responseMagento = new Object();
    var magentoItemID;
    var faultCode;
    var faultString;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

        if (operation == 'create')
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductCreateResponse/result");
        else if (operation == 'update')
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


    } catch (ex) {
    }

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


function createLinkWithGroupItem(sessionID, internalId, linkproduct) {

    var xml = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
    xml = xml + '<soapenv:Header/>';
    xml = xml + '<soapenv:Body>';
    xml = xml + '<urn:catalogProductLinkAssign soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<type xsi:type="xsd:string">grouped</type>';
    xml = xml + '<product xsi:type="xsd:string">' + internalId + '</product>';
    xml = xml + '<linkedProduct xsi:type="xsd:string">' + linkproduct.internalId + '</linkedProduct>';
    xml = xml + '<data xsi:type="urn:catalogProductLinkEntity">';
    xml = xml + '<product_id xsi:type="xsd:string">' + linkproduct.internalId + '</product_id>';
    xml = xml + '<type xsi:type="xsd:string">simple</type>';
    xml = xml + '<qty xsi:type="xsd:string">' + linkproduct.quantity + '</qty>';
    xml = xml + '</data>';
    xml = xml + '</urn:catalogProductLinkAssign>';
    xml = xml + '</soapenv:Body>';
    xml = xml + '</soapenv:Envelope>';
    nlapiLogExecution('Debug', 'XXXXXX', nlapiXMLToString(xml));

    var xml = soapRequestToMagento(xml);
    var responseMagento = new Object();
    var magentoCatID;
    var faultCode;
    var faultString;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

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

    }
    else {
        responseMagento.status = true;
        responseMagento.attributeid = magentoCatID;

    }

    return responseMagento;

}


