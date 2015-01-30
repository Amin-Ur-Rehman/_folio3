/**
 * Created by zahmed on 21-Aug-14.
 */


CyberSourceSingleTransactionReport = new (function () {
    this.credentials = null;
    this.headers = null;
    this.isSetup = false;
    this.csResponse = null;
    this.initializeHeaders = function () {
        this.headers = [];
        this.headers['Authorization'] = 'Basic ' + base64_encode(this.credentials.username + ':' + this.credentials.password);
    };
    this.setup = function (username, password, merchantId) {
        this.credentials = {};
        this.credentials.username = username;
        this.credentials.password = password;
        this.credentials.merchantId = merchantId;
        this.initializeHeaders();
        this.isSetup = true;
    };
    this.getHeader = function (headerName) {
        return this.headers[headerName];
    };
    this.apiUrls = {
        //general: 'https://ebctest.cybersource.com/ebctest/Query'//
        general: 'https://ebc.cybersource.com/ebc/Query'//
    };
    this.methodXml = {
    };
    this.retieveRequestId = function (merchantReferenceNumber, targetDate) {
        //Setting up Datainput
        var jsonobj = {
            merchantID: this.credentials.merchantId,
            type: "transaction",
            subtype: "transactionDetail",
            requestID: "",// not necessory if merchantReferenceNumber & targetDate exist
            merchantReferenceNumber: merchantReferenceNumber, // SO Number
            targetDate: targetDate,//YYYYMMDD
            versionNumber: "1.9"// 1.7 or onwards
        };
        var h = [];
        h['Authorization'] = this.getHeader('Authorization');
        var result = this.makeRequest(jsonobj, h);
        this.csResponse = result;
        return this.getRequestId(result);
    };
    this.makeRequest = function (body, headers) {
        if (this.isSetup === false) {
            throw new Error("API must be first setup");
        }
        var req = nlapiRequestURL(this.apiUrls.general, body, headers, 'POST');
        var body = null;
        try {
            body = req.getBody();
        }
        catch (e) {
            nlapiLogExecution('DEBUG', 'Error at makeApiRequest' + e.message, e.stack);
            body = e.message;
        }
        return body;
    };
    this.getRequestId = function (responseBody) {
        var requestId = null;
        var xmlString = responseBody;
        var patt = new RegExp('RequestID="[0-9]+"');
        var c = patt.exec(xmlString);
        if (c && c.length > 0) {
            c = c[0];
            requestId = c.substring(c.indexOf('"') + 1, c.lastIndexOf('"'));
        }
        return requestId;
    };
})();