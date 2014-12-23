/**
 * Created by zahmed on 14-Oct-14.
 */

// Ceating parent items as configurable in Magento
// getting items with status 10 from customer record
// set status to 30 after adding tier pricing if found

var context = nlapiGetContext();

function getCatalogCategoryUpdateXML(data, sessionID) {
    var xml = '';
    xml += XML_HEADER;
    xml += '<urn:catalogCategoryUpdate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    xml += '    <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionID + '</sessionId>';
    xml += '    <categoryId xsi:type="xsd:int" xs:type="type:int" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + data.mgCat + '</categoryId>';
    xml += '    <categoryData xsi:type="urn:catalogCategoryEntityCreate" xs:type="type:catalogCategoryEntityCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
    xml += '        <available_sort_by xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[' + data.availableSortBy.length + ']" xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns">';
    for (var i in data.availableSortBy) {
        xml += '        <item>' + data.availableSortBy[i] + '</item>';
    }
    xml += '        </available_sort_by>';
    xml += '        <default_sort_by xsi:type="xsd:string">' + data.defaultSortBy + '</default_sort_by>';
    xml += '        <description xsi:type="xsd:string">' + data.detailDescription + '</description>';
    xml += '        <meta_description xsi:type="xsd:string">' + data.metaTagHtml + '</meta_description>';
    xml += '        <meta_keywords xsi:type="xsd:string">' + data.searchKeywords + '</meta_keywords>';
    xml += '        <meta_title xsi:type="xsd:string" xs:type="type:string">' + data.pageTitle + '</meta_title>';
    //xml += '        <url_key xsi:type="xsd:string">' + data.urlKey + '</url_key>';
    xml += '    </categoryData>';
    xml += '    <storeView xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + data.storeView + '</storeView>';
    xml += '</urn:catalogCategoryUpdate>';
    xml += XML_FOOTER;

    return xml;
}

function validateCatalogCategoryUpdateResponse(xml) {
    var responseMagento = {};
    var faultCode;
    var faultString;
    var result;

    try {
        faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
        faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
        result = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryUpdateResponse/id");
    } catch (ex) {
    }

    if (faultCode != null) {
        responseMagento.status = false;       // Means There is fault
        responseMagento.faultCode = faultCode;   // Fault Code
        responseMagento.faultString = faultString; //Fault String
        nlapiLogExecution('Debug', 'Mageno Catalog Category Update Operation Faild', responseMagento.faultString);
    }
    else if (result !== null) {
        responseMagento.status = true;       // Means There is fault
        responseMagento.result = result;
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status = false;
        responseMagento.faultCode = '000';
        responseMagento.faultString = 'Unexpected Error';
        nlapiLogExecution('Debug', 'Mageno Catalog Category Update Operation Faild', responseMagento.faultString);

    }
    return responseMagento;
}

function getTextFromHtmlString(htmlString) {
    htmlString += '';

    nlapiLogExecution('DEBUG', 'Before', htmlString);
    htmlString = htmlString.replace(/<(SPAN|P|H1|H­ 2){1}.*h1>/i, '');
    htmlString = htmlString.replace(/<[^>]*>/g, '');

    nlapiLogExecution('DEBUG', 'After', htmlString);

    return htmlString;
}

function syncCategoryToMagento(nsCat, mgCat, sessionID) {
    try {
        var data = {};

        var siteCategoryRec = nlapiLoadRecord('sitecategory', nsCat);
        var detailDescription = getTextFromHtmlString(siteCategoryRec.getFieldValue('storedetaileddescription'));
        var pageTitle = siteCategoryRec.getFieldValue('pagetitle') || '';
        var searchKeywords = siteCategoryRec.getFieldValue('searchkeywords') || '';
        var metaTagHtml = siteCategoryRec.getFieldValue('metataghtml') || '';

        data.detailDescription = nlapiEscapeXML(detailDescription);
        data.pageTitle = nlapiEscapeXML(pageTitle);
        data.searchKeywords = nlapiEscapeXML(searchKeywords);
        data.metaTagHtml = nlapiEscapeXML(metaTagHtml);
        data.mgCat = mgCat;
        data.storeView = Store.storeView;
        data.availableSortBy = ['position'];
        data.defaultSortBy = 'position';

        var xml = getCatalogCategoryUpdateXML(data, sessionID);

        var responseMagento = validateCatalogCategoryUpdateResponse(soapRequestToMagento(xml));
        if (!responseMagento.status) {
            var errMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            var msg = 'Category NS Id: ' + nsCat + ' has not updated. -- ' + errMsg;
            nlapiLogExecution("ERROR", " Error From Magento " + msg);
        } else {
            nlapiLogExecution("DEBUG", 'Category in Magento updated', 'SUCCESSFULLY - Category NS Id: ' + nsCat + '  Category MG Id: ' + mgCat);
        }
    } catch (ex) {
        nlapiLogExecution("ERROR", "syncCategoryToMagento", ex.toString());
    }
}


function scheduled(type) {
    try {
        if (MC_SYNC_CONSTANTS.isValidLicense()) {
            URL = ItemConstant.MagentoCred.SoapUrl;
            var webserviceid = ItemConstant.MagentoCred.UserName;
            var webservicepw = ItemConstant.MagentoCred.Password;
            var sessionID;

            // Fetching session
            var sessionObj = getSessionID_From_Magento(webserviceid, webservicepw, URL);
            if (sessionObj === null) {
                return false;
            }
            if (sessionObj.errorMsg === '') {
                sessionID = sessionObj.data;
            } else {
                nlapiLogExecution('ERROR', 'Error in Getting login session', sessionObj);
                return false;
            }
            // End Getting Session

            var index = context.getSetting('SCRIPT', ItemConstant.ScriptParam.Index) || 0;
            var count = 0;
            var categoriesToUpdate = site.godDivaCategories;
            for (var i = index; i < categoriesToUpdate.length; i++) {
                var category = categoriesToUpdate[i];

                var nsCat = category.value;
                var mgCat = category.magValue;

                if (!!mgCat && !!nsCat && !isNaN(nsCat) && parseInt(nsCat) > 0) {
                    syncCategoryToMagento(nsCat, mgCat, sessionID);
                    count++;
                    if (count === -1) {
                        break;
                    }
                }

                if (context.getRemainingUsage() < 5000) {
                    var params = {};
                    params[ItemConstant.ScriptParam.Index] = i;
                    nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
                }
            }
        } else {
            nlapiLogExecution('DEBUG', 'Validate', 'License has expired');
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'scheduled', e.toString());
    }
}