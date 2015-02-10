CUSTOMER = {



    getCustomers: function() {

        var arrFils = [];
        var recs;
        var result = [];
        var arrCols = [];
        var resultObject;
        var CUSTOMER_STATUSES=ConnectorConstants.CustomerTypesToExport;


        arrFils.push(new nlobjSearchFilter('entitystatus', null, 'anyof',CUSTOMER_STATUSES));

        arrFils.push(new nlobjSearchFilter('custentity_magentosync_dev', null, 'is', 'F'));

        arrCols.push(new nlobjSearchColumn('custentity_magento_custid'));


        recs = nlapiSearchRecord('customer', null, arrFils, arrCols);


        if (recs != null && recs.length > 0) {

            for (var i = 0; i < recs.length; i++) {
                resultObject = new Object();

                resultObject.internalId = recs[i].getId();
                resultObject.magentoCustomerIds = recs[i].getValue('custentity_magento_custid');

                result.push(resultObject);

            }

        }


        return result;
    },

    setCustomerMagentoId: function(magentoId, customerId) {
        var result = false;

        try {


            nlapiSubmitField('customer', customerId, ['custentity_magento_custid'], [magentoId]);

            result = true;

        } catch (ex) {}


        return result;

    },

    setCustomerMagentoSync: function(customerId) {
        var result = false;

        try {

            nlapiSubmitField('customer', customerId, 'custentity_magentosync_dev', 'T');

        } catch (ex) {}


        return result;

    },
    getCustomer: function(customerInternalId, storeInfo) {

        var customerRecord = nlapiLoadRecord('customer', customerInternalId);
        var customerDataObject;
        var customerAddresses;
        var customerAddressObject;
        var names;


        if (customerRecord != null) {
            customerDataObject = new Object();


            customerDataObject.isPerson = customerRecord.getFieldValue('isperson');

            customerDataObject.email = getBlankForNull(customerRecord.getFieldValue('email'));

            customerDataObject.companyName = getBlankForNull(customerRecord.getFieldValue('companyname'));

            customerDataObject.entityid = getBlankForNull(customerRecord.getFieldValue('entityid'));




            if (customerDataObject.isPerson == "T") {
                customerDataObject.firstname = customerRecord.getFieldValue('firstname');
                customerDataObject.middlename = getBlankForNull(customerRecord.getFieldValue('middlename'));
                customerDataObject.lastname = customerRecord.getFieldValue('lastname');
            } else {

                if (customerDataObject.companyName == "") {
                    customerDataObject.companyName = customerDataObject.entityid;
                }

                names = getFirstNameLastName(customerDataObject.companyName);

                customerDataObject.firstname = names['firstName'];
                customerDataObject.middlename = "";
                customerDataObject.lastname = names['lastName'];
            }


            customerDataObject.password = this.getRandomPassword();

            customerDataObject.website_id = "1";
            customerDataObject.store_id = storeInfo.systemId;
            customerDataObject.group_id = "";
            customerDataObject.prefix = getBlankForNull(customerRecord.getFieldValue('salutation'));
            customerDataObject.suffix = "";
            customerDataObject.dob = "";
            customerDataObject.taxvat = "";
            customerDataObject.gender = "";
            customerDataObject.nsObj = customerRecord;

        }

        return customerDataObject;

    },

    getNSCustomerAddresses: function(customerRecordObject) {
        var customerAddresses = [];
        var addressObject;
        var names;
        var customerRecord = customerRecordObject.nsObj;
        var addressSubRecord;

        for (var i = 1; i <= customerRecord.getLineItemCount('addressbook'); i++) {
            addressObject = new Object();
            addressObject.defaultshipping = getBlankForNull(customerRecord.getLineItemValue('addressbook', 'defaultshipping', i));
            addressObject.defaultbilling = getBlankForNull(customerRecord.getLineItemValue('addressbook', 'defaultbilling', i));
            addressObject.country = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'country', i)));



            addressObject.firstname = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'addressee', i)));



            names = getFirstNameLastName(addressObject.firstname);



            addressObject.firstname = nlapiEscapeXML(names['firstName']);
            addressObject.lastname = nlapiEscapeXML(names['lastName']);

            if (addressObject.firstname == "")
                addressObject.firstname = customerRecordObject.firstname;

            if (addressObject.lastname == "")
                addressObject.lastname = customerRecordObject.lastname;

            addressObject.middlename = '';
            addressObject.suffix = '';
            addressObject.prefix = '';
            addressObject.company = '';
            addressObject.prefix = '';
            addressObject.fax = '';
            addressObject.vatnumber = '';


            addressObject.telephone = getBlankForNull(customerRecord.getLineItemValue('addressbook', 'phone', i));
            addressObject.city = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'city', i)));
            addressObject.street1 = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'addr1', i)));
            addressObject.street2 = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'addr2', i)));


            addressObject.region = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'state', i)));
            addressObject.region_text = addressObject.region;


            addressObject.postcode = nlapiEscapeXML(getBlankForNull(customerRecord.getLineItemValue('addressbook', 'zip', i)));


            customerRecord.selectLineItem('addressbook', i);
            addressSubRecord = customerRecord.viewCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
            addressObject.magentoIdStoreRef = getBlankForNull(addressSubRecord.getFieldValue('custrecord_magento_id'));

            customerAddresses.push(addressObject);

        }

        return customerAddresses;

    },

    getMagentoCreateCustomerRequestXML: function(customerDataObject, sessionId) {
        var xml = '';

        if (customerDataObject != null) {
            xml = xml + '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:customerCustomerCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionId + '</sessionId>';
            xml = xml + '<customerData xsi:type="urn:customerCustomerEntityToCreate" xs:type="type:customerCustomerEntityToCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            xml = xml + '<customer_id xsi:type="xsd:int" xs:type="type:int"/>';
            xml = xml + '<email xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.email) + '</email>';
            xml = xml + '<firstname xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.firstname) + '</firstname>';
            xml = xml + '<lastname xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.lastname) + '</lastname>';
            xml = xml + '<middlename xsi:type="xsd:string" xs:type="type:string"></middlename>';
            xml = xml + '<password xsi:type="xsd:string" xs:type="type:string">'+nlapiEscapeXML(customerDataObject.password)+'</password>';
            xml = xml + '<website_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.website_id + '</website_id>';
            xml = xml + '<store_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.store_id + '</store_id>';
            xml = xml + '<group_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.group_id + '</group_id>';
            xml = xml + '<prefix xsi:type="xsd:string" xs:type="type:string"></prefix>';
            xml = xml + '<suffix xsi:type="xsd:string" xs:type="type:string"></suffix>';
            xml = xml + '<dob xsi:type="xsd:string" xs:type="type:string"></dob>';
            xml = xml + '<taxvat xsi:type="xsd:string" xs:type="type:string"></taxvat>';
            xml = xml + '<gender xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.gender + '</gender>';
            xml = xml + '</customerData>';
            xml = xml + '</urn:customerCustomerCreate>';
            xml = xml + '</soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';

        }

        return xml;

    },

    getMagentoUpdateCustomerRequestXML: function(customerDataObject, sessionId) {
        var xml = '';

        if (customerDataObject != null) {

            xml = xml + '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:customerCustomerUpdate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionId + '</sessionId>';
            xml = xml + '<customerId xsi:type="xsd:int" xs:type="type:int" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + customerDataObject.magentoId + '</customerId>';
            xml = xml + '<customerData xsi:type="urn:customerCustomerEntityToCreate" xs:type="type:customerCustomerEntityToCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            xml = xml + '<customer_id xsi:type="xsd:int" xs:type="type:int"/>';
            xml = xml + '<email xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.email) + '</email>';
            xml = xml + '<firstname xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.firstname) + '</firstname>';
            xml = xml + '<lastname xsi:type="xsd:string" xs:type="type:string">' + nlapiEscapeXML(customerDataObject.lastname) + '</lastname>';
            xml = xml + '<middlename xsi:type="xsd:string" xs:type="type:string"></middlename>';
            //xml = xml + '<password xsi:type="xsd:string" xs:type="type:string"></password>';
            xml = xml + '<website_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.website_id + '</website_id>';
            xml = xml + '<store_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.store_id + '</store_id>';
            xml = xml + '<group_id xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.group_id + '</group_id>';
            xml = xml + '<prefix xsi:type="xsd:string" xs:type="type:string"></prefix>';
            xml = xml + '<suffix xsi:type="xsd:string" xs:type="type:string"></suffix>';
            xml = xml + '<dob xsi:type="xsd:string" xs:type="type:string"></dob>';
            xml = xml + '<taxvat xsi:type="xsd:string" xs:type="type:string"></taxvat>';
            xml = xml + '<gender xsi:type="xsd:int" xs:type="type:int">' + customerDataObject.gender + '</gender>';
            xml = xml + '</customerData>';
            xml = xml + '</urn:customerCustomerUpdate>';
            xml = xml + '</soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';
        }

        return xml;

    },

    getMagentoCreateAddressRequestXML: function(customerAddressObject, sessionId, magentoCustomerId) {
        var xml = '';
        var firstName;
        var lastName;
        var names;

        if (customerAddressObject != null) {



            xml = xml + '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:customerAddressCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '            <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionId + '</sessionId>';
            xml = xml + '            <customerId xsi:type="xsd:int" xs:type="type:int" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + magentoCustomerId + '</customerId>';
            xml = xml + '            <addressData xsi:type="urn:customerAddressEntityCreate" xs:type="type:customerAddressEntityCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            //                <!--You may enter the following 16 items in any order-->
            //                <!--Optional:-->
            xml = xml + '                <city xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.city + '</city>';
            //                <!--Optional:-->
            xml = xml + '                <company xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.company + '</company>';
            //                <!--Optional:-->
            xml = xml + '                <country_id xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.country + '</country_id>';
            //                <!--Optional:-->
            xml = xml + '                <fax xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.fax + '</fax>>';
            //                <!--Optional:-->
            xml = xml + '                <firstname xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.firstname + '</firstname>';
            //                <!--Optional:-->
            xml = xml + '                <lastname xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.lastname + '</lastname>';
            //                <!--Optional:-->
            xml = xml + '                <middlename xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.middlename + '</middlename>>';
            //                <!--Optional:-->
            xml = xml + '                <postcode xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.postcode + '</postcode>';
            //                <!--Optional:-->
            xml = xml + '                <prefix xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.prefix + '</prefix>';
            //                <!--Optional:-->
            xml = xml + '                <region_id xsi:type="xsd:int" xs:type="type:int">' + customerAddressObject.region + '</region_id>';
            //                <!--Optional:-->
            xml = xml + '                <region xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.region_text + '</region>';
            //                <!--Optional:-->

            xml = xml + '<street xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[]" xs:type="type:string">';
            xml = xml + '    <item>' + customerAddressObject.street1 + '</item>';
            xml = xml + '    <item>' + customerAddressObject.street2 + '</item>';
            xml = xml + '</street>';
            xml = xml + ' <suffix xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.suffix + '</suffix>';
            xml = xml + ' <fax xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.fax + '</fax>';


            //                <!--Optional:-->
            xml = xml + '                <telephone xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.telephone + '</telephone>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_billing xsi:type="xsd:boolean" xs:type="type:boolean">' + customerAddressObject.defaultbilling + '</is_default_billing>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_shipping xsi:type="xsd:boolean" xs:type="type:boolean">' + customerAddressObject.defaultshipping + '</is_default_shipping>';
            xml = xml + '            </addressData>';
            xml = xml + '        </urn:customerAddressCreate>';
            xml = xml + '    </soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';


        }

        return xml;
    },

    getMagentoUpdateAddressRequestXML: function(customerAddressObject, sessionId, magentoAddressId) {
        var xml = '';
        var firstName;
        var lastName;
        var names;

        if (customerAddressObject != null) {



            xml = xml + '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:customerAddressUpdate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '            <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionId + '</sessionId>';
            xml = xml + '            <addressId xsi:type="xsd:int" xs:type="type:int" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + magentoAddressId + '</addressId>';
            xml = xml + '            <addressData xsi:type="urn:customerAddressEntityCreate" xs:type="type:customerAddressEntityCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            //                <!--You may enter the following 16 items in any order-->
            //                <!--Optional:-->
            xml = xml + '                <city xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.city + '</city>';
            //                <!--Optional:-->
            xml = xml + '                <company xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.company + '</company>';
            //                <!--Optional:-->
            xml = xml + '                <country_id xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.country + '</country_id>';
            //                <!--Optional:-->
            xml = xml + '                <fax xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.fax + '</fax>>';
            //                <!--Optional:-->
            xml = xml + '                <firstname xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.firstname + '</firstname>';
            //                <!--Optional:-->
            xml = xml + '                <lastname xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.lastname + '</lastname>';
            //                <!--Optional:-->
            xml = xml + '                <middlename xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.middlename + '</middlename>>';
            //                <!--Optional:-->
            xml = xml + '                <postcode xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.postcode + '</postcode>';
            //                <!--Optional:-->
            xml = xml + '                <prefix xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.prefix + '</prefix>';
            //                <!--Optional:-->
            xml = xml + '                <region_id xsi:type="xsd:int" xs:type="type:int">' + customerAddressObject.region + '</region_id>';
            //                <!--Optional:-->
            xml = xml + '                <region xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.region_text + '</region>';
            //                <!--Optional:-->

            xml = xml + '<street xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[]" xs:type="type:string">';
            xml = xml + '    <item>' + customerAddressObject.street1 + '</item>';
            xml = xml + '    <item>' + customerAddressObject.street2 + '</item>';
            xml = xml + '</street>';
            xml = xml + ' <suffix xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.suffix + '</suffix>';
            xml = xml + ' <fax xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.fax + '</fax>';


            //                <!--Optional:-->
            xml = xml + '                <telephone xsi:type="xsd:string" xs:type="type:string">' + customerAddressObject.telephone + '</telephone>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_billing xsi:type="xsd:boolean" xs:type="type:boolean">' + customerAddressObject.defaultbilling + '</is_default_billing>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_shipping xsi:type="xsd:boolean" xs:type="type:boolean">' + customerAddressObject.defaultshipping + '</is_default_shipping>';
            xml = xml + '            </addressData>';
            xml = xml + '        </urn:customerAddressUpdate>';
            xml = xml + '    </soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';


        }

        return xml;
    }
    ,
    getRandomPassword:function()
    {
       var randomstring = Math.random().toString(36).slice(-8);
       return randomstring;
    }

};




function getFirstNameLastName(data) {

    var array = data.split(' ');
    var firstName = '';
    var lastName;
    var result = [];

    lastName = array[array.length - 1];

    for (var i = 0; i < array.length - 1; i++) {
        firstName = firstName + array[i] + ' ';

    }

    firstName = firstName.trim();

    result['firstName'] = firstName;
    result['lastName'] = lastName;

    if (isBlankOrNull(result['firstName'])) {
        result['firstName'] = result['lastName'];
    }


    if (isBlankOrNull(result['lastName']))
        result['lastName'] = '';


    return result;

}