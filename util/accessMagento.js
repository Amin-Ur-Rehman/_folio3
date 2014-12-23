//var XML_HEADER='<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>';
//var XML_FOOTER='</soapenv:Body></soapenv:Envelope>';
//var URL="http://mystores1.gostorego.com/api/v2_soap";


function getSessionID_From_Magento(userName, apiKey, webserviceUrl) {

    var result = {};
    var loginXML = '';

    loginXML += '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
    loginXML += '    <soapenv:Header/>';
    loginXML += '    <soapenv:Body>';
    loginXML += '        <urn:login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
    loginXML += '            <username xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + userName + '</username>';
    loginXML += '            <apiKey xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + apiKey + '</apiKey>';
    loginXML += '        </urn:login>';
    loginXML += '    </soapenv:Body>';
    loginXML += '</soapenv:Envelope>';

    result.errorMsg = '';

    try {
        var res = nlapiRequestURL(webserviceUrl, loginXML);
        var responseXML = nlapiStringToXML(res.getBody());
        result.data = nlapiSelectValue(responseXML, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:loginResponse/loginReturn");
    } catch (ex) {
        result.errorMsg = ex.toString();
    }

    return result;
}


function soapRequestToMagento(xml) {
    var res = nlapiRequestURL(URL, xml);
    var responseXML = nlapiStringToXML(res.getBody());
    return responseXML;
}


var MGCONFIG = (function () {
    return {
        WebService: {
            //EndPoint: 'http://goddiva.musicaahora.com/index.php/api/v2_soap',
            EndPoint: 'https://goddiva.co.uk/index.php/api/v2_soap',
            UserName: 'wsuser',
            Password: 'Click12345'
        },
        Customer: {},
        SalesOrder: {
            // fetch 1 day old orders
            Days: '1'
        },
        Item: {}
    };
})();


/*

 function getProductCategory_From_Magento(sessionID)
 {

 var productCategoryXML="";


 productCategoryXML=XML_HEADER;

 productCategoryXML=productCategoryXML+"<ns1:catalogCategoryTree>";
 productCategoryXML=productCategoryXML+ '<sessionId xsi:type="xsd:string">'+sessionID+'</sessionId>';
 //salesOrderListXML=salesOrderListXML+ '<parentId xsi:type="xsd:string">'+loginValue+'</parentId>';
 //salesOrderListXML=salesOrderListXML+ '<storeView xsi:type="xsd:string">'+loginValue+'</storeView>';
 productCategoryXML=productCategoryXML+'</ns1:catalogCategoryTree>';



 productCategoryXML=productCategoryXML+XML_FOOTER;

 var res = nlapiRequestURL(URL,productCategoryXML);
 var responseXML = nlapiStringToXML( res.getBody() );


 var topCategory=nlapiSelectValue(responseXML,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryTreeResponse/tree/category_id");
 var topCategory_parentid=nlapiSelectValue(responseXML,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryTreeResponse/tree/parent_id");
 var topCategory_name=nlapiSelectValue(responseXML,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryTreeResponse/tree/name");
 var topCategory_position=nlapiSelectValue(responseXML,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogCategoryTreeResponse/tree/position");
 var result=new Array();

 result[0]=new Array();
 result[0].push(topCategory);
 result[0].push(topCategory_parentid);
 result[0].push(topCategory_name +'-Magento');

 nlapiLogExecution("DEBUG",'Index' + i,'category id '+topCategory + ' parent_id ' + topCategory_parentid + '  name ' +topCategory_name );



 var category_id  =  nlapiSelectValues(responseXML, "//item/category_id");
 var parent_id  =  nlapiSelectValues(responseXML, "//item/parent_id");
 var name  =  nlapiSelectValues(responseXML, "//item/name");
 var is_active  =  nlapiSelectValues(responseXML, "//item/is_active");
 var position  =  nlapiSelectValues(responseXML, "//item/position");
 var level  =  nlapiSelectValues(responseXML, "//item/level");



 for(var i=0;i<category_id.length;i++)
 {
 result[i+1]=new Array();

 result[i+1].push(category_id[i]);
 result[i+1].push(parent_id[i]);
 result[i+1].push(name[i]+'-Magento');

 nlapiLogExecution("DEBUG",'Index' + i,'category id '+category_id[i] + ' parent_id ' + parent_id[i] + '  name ' + name[i]  );
 }


 return result;

 //return responseXML;

 }


 function getProducts_From_Magento(sessionID)
 {
 var productXML="";

 productXML=XML_HEADER;

 productXML=productXML+"<ns1:catalogProductList>";
 productXML=productXML+ '<sessionId xsi:type="xsd:string">'+sessionID+'</sessionId>';
 productXML=productXML+'</ns1:catalogProductList>';

 productXML=productXML+XML_FOOTER;

 var res = nlapiRequestURL(URL,productXML);
 var responseXML = nlapiStringToXML( res.getBody() );


 var products  =  nlapiSelectNodes(responseXML, "//storeView/item");
 var result=new Array();

 for(var i=0;i<products.length;i++)
 {

 result[i]=new Array();

 result[i].push(nlapiSelectValue(products[i],'product_id'));   //Product ID result[i+1].push(
 result[i].push(nlapiSelectValue(products[i],'name'));         //Name result[i+1].push(

 var catids=nlapiSelectValues(products[i],'category_ids/item');
 if (catids!=null)
 {
 result[i].push(catids[catids.length-1]);
 }


 }

 return result;
 //return responseXML;

 }



 function getCustomers_From_Magento(sessionID)
 {
 var customerXML="";

 customerXML=XML_HEADER;

 customerXML=customerXML+"<ns1:customerCustomerList>";
 customerXML=customerXML+ '<sessionId xsi:type="xsd:string">'+sessionID+'</sessionId>';
 customerXML=customerXML+'</ns1:customerCustomerList>';

 customerXML=productXML+XML_FOOTER;

 var res = nlapiRequestURL(URL,productXML);
 var responseXML = nlapiStringToXML( res.getBody() );


 var customers  =  nlapiSelectNodes(responseXML, "//storeView/item");
 var result=new Array();

 for(var i=0;i<customers.length;i++)
 {

 result[i]=new Array();
 result[i].push(nlapiSelectValue(customers[i],'customer_id'));
 result[i].push(nlapiSelectValue(customers[i],'email'));
 result[i].push(nlapiSelectValue(customers[i],'firstname'));
 result[i].push(nlapiSelectValue(customers[i],'middlename'));
 result[i].push(nlapiSelectValue(customers[i],'lastname'));
 result[i].push(nlapiSelectValue(customers[i],'group_id'));
 result[i].push(nlapiSelectValue(customers[i],'prefix'));
 result[i].push(nlapiSelectValue(customers[i],'suffix'));
 result[i].push(nlapiSelectValue(customers[i],'dob'));

 }

 return result;

 //return responseXML;

 }

 */
