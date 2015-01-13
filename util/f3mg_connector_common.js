/**
 * Created by zahmed on 13-Jan-15.
 *
 * Class Name: ConnectorCommon
 *
 * Description:
 * - This class contains all the methods used in connectors
 * -
 * Referenced By:
 * - connector_salesorder_sch.js
 * - connector_customer_sch_new
 * -
 * Dependencies:
 * - f3mg_utility_methods.js
 * -
 */

var ConnectorCommon = (function () {
    return {
        /**
         * Init method
         */
        initialize: function () {

        },
        getRecords: function (recordType, filters, columns) {
            var result = [];
            try {
                result = nlapiSearchRecord(recordType, null, filters, columns) || [];
            } catch (e) {
                Utility.logException('ConnectorCommon.getRecords', e);
            }
            return result;
        },
        getSessionIDFromMagento: function (userName, apiKey, webserviceUrl) {
            var sessionID = null;
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

            try {
                var responseXML = this.soapRequestToMagento(webserviceUrl, loginXML);
                sessionID = nlapiSelectValue(responseXML, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:loginResponse/loginReturn");
            } catch (ex) {
                Utility.logException('ConnectorCommon.getSessionIDFromMagento', ex);
            }

            return sessionID;
        },
        soapRequestToMagento: function (url, xml) {
            var res = nlapiRequestURL(url, xml);
            var responseXML = nlapiStringToXML(res.getBody());
            return responseXML;
        },
        /**
         * Gets dummy item
         * @param {string} itemId
         * @returns {*}
         */
        getDummyItemId: function (itemId) {
            var dummyItemId = null;

            try {
                var fils = [];
                var result;
                // search existing dummy item
                fils.push(new nlobjSearchFilter('itemid', null, 'is', itemId, null));
                result = nlapiSearchRecord('item', null, fils, null) || [];
                if (result.length > 0) {
                    dummyItemId = result[0].getId();
                } else {
                    dummyItemId = this.createDummyItemInNS(itemId);
                }
            } catch (ex) {
                Utility.logException('ConnectorCommon.getDummyItemId', ex);
            }

            return dummyItemId;
        },

        createDummyItemInNS: function (itemId) {
            var dummyItemId = null;
            try {
                var dummyItemRec = nlapiCreateRecord('inventoryitem', null);
                // dummyItemRec.setLineItemValue('price','price_1_',1,0);
                dummyItemRec.setFieldValue('itemid', itemId);
                dummyItemRec.setFieldValue('displayname', 'Magento Dummy Item');
                dummyItemRec.setFieldValue('incomeaccount', '54');// 4000 Sales
                dummyItemRec.setFieldValue('cogsaccount', '169');// 5000 Materials Purchased
                dummyItemRec.setFieldValue('assetaccount', '120');// 1001 Stock
                //dummyItemRec.setFieldValue('includechildren', 'T'); doesn't exist
                //dummyItemRec.setFieldValue('taxschedule', '1');
                //dummyItemRec.setLineItemValue('price1', 'price_1_', 1, 0);
                dummyItemId = nlapiSubmitRecord(dummyItemRec, true, true);
            } catch (ex) {
                Utility.logException('ConnectorCommon.createDummyItemInNS', ex);
            }
            return dummyItemId;
        }
    };
})();