/**
 * Created by zahmed on 1-Dec-14.
 */

function removeAsteric(str) {
    str += '';

    str = str.replace(/\*/g, '');

    return str;
}

function lineBreak(lines) {
    var lineStr = '';
    for (var line = 0; line < lines; line++) {
        lineStr += '<BR>';
    }
    return lineStr;
}

// TODO: generalize
function getCategoryId(siteCatId) {
    var godDivaCategories = site.godDivaCategories;
    for (var i in godDivaCategories) {
        var category = godDivaCategories[i];
        if (category.value === siteCatId) {
            return category.magValue;
        }
    }
    return '';
}

function validateItemIDResponse(xml) {
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

function getSyncResponse(dataObj) {
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

    var response = validateItemIDResponse(soapRequestToMagento(xml));

    return response.result;
}

function checkIfAlreadySync(itemType, itemId, sessionID, syncInfo, type) {
    var dataObj = {};
    var magentoSKU;
    if (type === 'CHILD') {
        var itemRec = nlapiLoadRecord(itemType, itemId);
        magentoSKU = itemRec.getFieldValue(ItemConstant.Fields.MagentoSku);
    } else {
        // if type is Parent
        magentoSKU = syncInfo.magentoSku;
    }

    // of sku does not exist it means create new procut in magento
    if (!magentoSKU) {
        return false;
    }

    dataObj.sessionId = sessionID;
    dataObj.productSku = magentoSKU;
    dataObj.storeView = Store.storeView;
    dataObj.identifierType = 'sku';

    var isExist = getSyncResponse(dataObj);

    return isExist;
}

function getUpdateItemXML(product, sessionID, isParent) {
    var xml = '';

    xml += XML_HEADER + '<urn:catalogProductUpdate>';
    xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
    xml = xml + '<product xsi:type="xsd:string">' + product.magentoId + '</product>';
    xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
    xml = xml + '   <price xsi:type="xsd:string">' + product.price + '</price>';

    xml = xml + '   <stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';
    if (isParent) {
        product.quatity = 0;
    }
    xml = xml + '       <qty xsi:type="xsd:string" xs:type="type:string">' + product.quantity + '</qty>';
    if (product.quatity >= 1) {
        xml = xml + '   <is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';
    }
    xml = xml + '</stock_data>';

    xml = xml + '   <status xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.status + '</status>';
    xml = xml + '   <visibility xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">' + product.visibility + '</visibility>';
    xml = xml + '</productData>';
    xml = xml + '<storeView xsi:type="xsd:string">' + product.storeViewId + '</storeView>';
    xml = xml + '</urn:catalogProductUpdate>';
    xml = xml + XML_FOOTER;

    return xml;
}

function validateItemExportResponse(xml, operation) {
    var responseMagento = {};
    var magentoItemID;
    var faultCode;
    var faultString;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        if (operation === 'create') {
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductCreateResponse/result");
        }
        else if (operation === 'update') {
            magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");
        }
    } catch (ex) {
    }

    if (!!faultCode) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
    }
    else if (!!magentoItemID) {
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

// getting all the item having status zero or empty and those are matrix child items
function getItemsToExport(id) {
    var records = [];
    try {
        records = nlapiSearchRecord(null, id) || [];
    } catch (e) {
        nlapiLogExecution('ERROR', 'getItemsToExport', e.toString());
    }
    return records;
}

function getItemCategories(parItemRec) {
    var categories = [];

    if (!!parItemRec) {
        var totalLines = parItemRec.getLineItemCount('sitecategory');
        for (var line = 1; line <= totalLines; line++) {
            var siteId = parItemRec.getLineItemValue('sitecategory', 'website', line) + '';
            var siteCatId = parItemRec.getLineItemValue('sitecategory', 'category', line) + '';
            if (siteId === '1' && siteCatId) {// goddiva NS store id = 1
                var categoryId = getCategoryId(siteCatId);
                if (categoryId) {
                    categories.push(categoryId);
                }
            }
        }
    }

    return categories;
}

function getColor(color) {
    return site.color[color] || '';
}

function getSize(size) {
    return site.size[size] || '';
}

// check if the script is required to be scheduled
function rescheduleIfRequired(params) {
    var context = nlapiGetContext();
    var endTime;
    var minutes;

    endTime = (new Date()).getTime();
    minutes = Math.round(((endTime - ScheduledScriptConstant.StartTime) / (1000 * 60)) * 100) / 100;

    if (context.getRemainingUsage() < ScheduledScriptConstant.RemainingUsage) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Remaining Usage: ' + context.getRemainingUsage());
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    if (minutes > ScheduledScriptConstant.Minutes) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Time Elapsed: ' + minutes);
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    return false;
}

function getMagentoItemType(itemRec, matrixType) {
    var type = itemRec.getRecordType();

    switch (type) {
        case 'inventoryitem':
            if (matrixType === 'PARENT') {
                type = 'configurable';
            } else {
                type = 'simple';
            }
            break;
        case 'noninventoryitem':
        case 'otherchargeitem':
        case 'serviceitem':
            type = 'virtual';
            break;
        case 'kititem':
            type = '';
            break;
        case 'descriptionitem':
            type = '';
            break;
        case 'discountitem':
            type = '';
            break;
        case 'giftcertificateitem':
            type = '';
            break;
        case 'markupitem':
            type = '';
            break;
        default:
            type = 'simple';
    }
    return type;
}

function getCreateItemXML(product, sessionID, type) {
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
    xml = xml + '       <custom_design xsi:type="xsd:string" xs:type="type:string">' + product.customDesign + '</custom_design>';

    if (type === 'PARENT') {
        xml = xml + '       <has_options xsi:type="xsd:string">0</has_options>';
        xml = xml + '       <options_container xsi:type="xsd:string">container1</options_container>';
        product.quatity = 0;
    }

    xml = xml + '       <stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';
    xml = xml + '           <qty xsi:type="xsd:string" xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns/">' + product.quantity + '</qty>';
    xml = xml + '           <is_in_stock xsi:type="xsd:int" xs:type="type:int">' + product.stockAvailability + '</is_in_stock>';
    xml = xml + '           <manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.manageStock + '</manage_stock>';
    xml = xml + '           <use_config_manage_stock xsi:type="xsd:int" xs:type="type:int">' + product.useConfigManageStock + '</use_config_manage_stock>';
    xml = xml + '       </stock_data>';

    // set additional attributes: start

    xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';
    xml = xml + '    <single_data xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[' + product.additionalAttributes.length + ']">';

    product.additionalAttributes.forEach(function (addAttr) {
        xml = xml + '        <item>';
        xml = xml + '            <key xsi:type="xsd:string">' + addAttr.key + '</key>';
        xml = xml + '            <value xsi:type="xsd:string">' + addAttr.value + '</value>';
        xml = xml + '        </item>';
    });

    xml = xml + '    </single_data>';
    xml = xml + '</additional_attributes>';
    // set additional attributes: end

    xml = xml + '   </productData>';
    xml = xml + '   <storeView xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + product.storeViewId + '</storeView>';
    xml = xml + '</urn:catalogProductCreate>';

    xml = xml + XML_FOOTER;

    //nlapiLogExecution('DEBUG', 'request XML', xml);

    return xml;

}

function parseFloatNum(num) {
    var no = parseFloat(num);
    if (isNaN(no)) {
        no = 0;
    }
    return no;
}

function getDateUTC(offset) {
    var today = new Date();
    var utc = today.getTime() + (today.getTimezoneOffset() * 60000);
    offset = parseInt(parseFloatNum(offset * 60 * 60 * 1000));
    today = new Date(utc + offset);
    return today;
}

function isRunningTime() {
    return true; // todo undo
    var currentDate = getDateUTC(0);
    var dateTime = nlapiDateToString(currentDate, 'datetimetz');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'dateTime: ' + dateTime);
    var time = nlapiDateToString(currentDate, 'timeofday');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'time: ' + time);
    var strArr = time.split(' ');
    //nlapiLogExecution('DEBUG', 'isRunningTime', 'time spliting: ' + JSON.stringify(strArr));
    if (strArr.length > 1) {
        var hour = 0;
        var AmPm = strArr[1];
        var timeMinsArr = strArr[0].split(':');

        if (timeMinsArr.length > 0) {
            hour = parseInt(timeMinsArr[0]);
        }
        nlapiLogExecution('DEBUG', 'isRunningTime', 'AmPm: ' + AmPm + ' hour: ' + hour);
        if (AmPm === 'am' && hour >= 1 && hour < 7) {
            return true;
        }
    }

    return false;
}