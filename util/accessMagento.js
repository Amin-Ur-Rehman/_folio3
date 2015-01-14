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