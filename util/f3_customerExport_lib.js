CUSTOMER= {


getCustomers : function(allStores,storeId)
{

    var arrFils = new Array();
    var recs;
    var result = new Array();
    var arrCols = new Array();
    var resultObject;

    if (!allStores)
        arrFils.push(new nlobjSearchFilter('custentity_f3mg_magento_stores', null, 'is', storeId));

    arrFils.push(new nlobjSearchFilter('internalid',null,'is','1542'));

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

    setCustomerMagentoId : function(magentoId,customerId)
{
        var result=false;

        try {

            nlapiSubmitField('customer',customerId,'custentity_magento_custid',magentoId);
            result=true;

        }catch (ex) {}


        return result;

},

    setCustomerMagentoSync : function(customerId)
    {
        var result=false;

        try {

            nlapiSubmitField('customer',customerId,'custentity_magentosync_dev','T');

        }catch (ex) {}


        return result;

    }
,
getCustomer :function(customerInternalId,storeInfo)
{

    var customerRecord=nlapiLoadRecord('customer',customerInternalId);
    var customerDataObject;
    var customerAddresses;
    var customerAddressObject;


    if(customerRecord!=null)
    {
        customerDataObject=new Object();


        customerDataObject.email=customerRecord.getFieldValue('email');
        customerDataObject.firstname=customerRecord.getFieldValue('firstname');
        customerDataObject.middlename=customerRecord.getFieldValue('middlename');
        customerDataObject.lastname=customerRecord.getFieldValue('lastname');
        customerDataObject.password=customerRecord.getFieldValue('password');
        customerDataObject.website_id="";
        customerDataObject.store_id=storeInfo.systemId;
        customerDataObject.group_id="";
        customerDataObject.prefix=customerRecord.getFieldValue('salutation');
        customerDataObject.suffix="";
        customerDataObject.dob="";
        customerDataObject.taxvat="";
        customerDataObject.gender="";
        customerDataObject.nsObj=customerRecord;

    }

    return customerDataObject;

},

    getNSCustomerAddresses :function(customerRecord)
    {
        var customerAddresses=new Array();
        var addressObject;

        for(var i=1;i<=customerRecord.getLineItemCount('addressbook');i++)
        {
            addressObject=new Object();
            addressObject.defaultshipping=customerRecord.getLineItemValue('addressbook','defaultshipping',i);
            addressObject.defaultbilling=customerRecord.getLineItemValue('addressbook','defaultbilling',i);
            addressObject.country=customerRecord.getLineItemValue('addressbook','country',i);
            addressObject.firstname=customerRecord.getLineItemValue('addressbook','addressee',i);
            addressObject.telephone=customerRecord.getLineItemValue('addressbook','phone',i);
            addressObject.city=customerRecord.getLineItemValue('addressbook','city',i);
            addressObject.street1=customerRecord.getLineItemValue('addressbook','addr1',i);
            addressObject.street2=customerRecord.getLineItemValue('addressbook','addr2',i);
            addressObject.region=customerRecord.getLineItemValue('addressbook','state',i);
            addressObject.region_text=customerRecord.getLineItemText('addressbook','state',i);
            addressObject.postcode=customerRecord.getLineItemValue('addressbook','zip',i);

            customerAddresses.push(addressObject);
        }

        return customerAddresses;

    },

    getMagentoRequestXML :function(customerDataObject,sessionId)
    {
        var xml='';

        if(customerDataObject!=null)
        {
            xml=xml+'<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
            xml=xml+'                <soapenv:Header/>';
            xml=xml+'   <soapenv:Body>';
            xml=xml+'       <urn:customerCustomerCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml=xml+'           <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">'+sessionId+'</sessionId>';
            xml=xml+'            <customerData xsi:type="urn:customerCustomerEntityToCreate" xs:type="type:customerCustomerEntityToCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';

            xml=xml+'                <customer_id xsi:type="xsd:int" xs:type="type:int"/>';
                            //<!--Optional:-->
            xml=xml+'                            <email xsi:type="xsd:string" xs:type="type:string">'+customerDataObject.email+'</email>';
                            //<!--Optional:-->
            xml=xml+'                            <firstname xsi:type="xsd:string" xs:type="type:string">'+customerDataObject.firstname+'</firstname>';
                            //<!--Optional:-->
            xml=xml+'                            <lastname xsi:type="xsd:string" xs:type="type:string">'+customerDataObject.lastname+'</lastname>';
                            //<!--Optional:-->
            xml=xml+'                <middlename xsi:type="xsd:string" xs:type="type:string"></middlename>';
                            //<!--Optional:-->
            xml=xml+'                <password xsi:type="xsd:string" xs:type="type:string"></password>';
                            //<!--Optional:-->
            xml=xml+'                            <website_id xsi:type="xsd:int" xs:type="type:int">'+customerDataObject.website_id+'</website_id>';
                            //<!--Optional:-->
            xml=xml+'                            <store_id xsi:type="xsd:int" xs:type="type:int">'+customerDataObject.store_id+'</store_id>';
                            //<!--Optional:-->
            xml=xml+'                            <group_id xsi:type="xsd:int" xs:type="type:int">'+customerDataObject.group_id+'</group_id>';
                            //<!--Optional:-->
            xml=xml+'              <prefix xsi:type="xsd:string" xs:type="type:string"></prefix>';
                            //<!--Optional:-->
            xml=xml+'                            <suffix xsi:type="xsd:string" xs:type="type:string"></suffix>';
                            //<!--Optional:-->
            xml=xml+'                            <dob xsi:type="xsd:string" xs:type="type:string"></dob>';
                            //<!--Optional:-->
            xml=xml+'                            <taxvat xsi:type="xsd:string" xs:type="type:string"></taxvat>';
                            //<!--Optional:-->
            xml=xml+'                            <gender xsi:type="xsd:int" xs:type="type:int">'+customerDataObject.gender+'</gender>';
            xml=xml+'                        </customerData>';
            xml=xml+'                    </urn:customerCustomerCreate>';
            xml=xml+'    </soapenv:Body>';
            xml=xml+'</soapenv:Envelope>';

        }

        return xml;

    }

,

    getMagentoAddressRequestXML :function(customerAddressObject,sessionId,magentoCustomerId) {
        var xml = '';
        var firstName;
        var lastName;
        var names;

        nlapiLogExecution('debug','magentoCustomerId',magentoCustomerId);
        if (customerAddressObject != null) {

            names=getFirstNameLastName();

            xml = xml + '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:customerAddressCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '            <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + sessionId + '</sessionId>';
            xml = xml + '            <customerId xsi:type="xsd:int" xs:type="type:int" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + magentoCustomerId + '</customerId>';
            xml = xml + '            <addressData xsi:type="urn:customerAddressEntityCreate" xs:type="type:customerAddressEntityCreate" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            //                <!--You may enter the following 16 items in any order-->
            //                <!--Optional:-->
            xml = xml + '                <city xsi:type="xsd:string" xs:type="type:string">'+getBlankIfNull(customerAddressObject.city)+'</city>';
            //                <!--Optional:-->
            xml = xml + '                <company xsi:type="xsd:string" xs:type="type:string">'+getBlankIfNull(customerAddressObject.company)+'</company>';
            //                <!--Optional:-->
            xml = xml + '                <country_id xsi:type="xsd:string" xs:type="type:string">'+getBlankIfNull(customerAddressObject.country)+'</country_id>';
            //                <!--Optional:-->
            xml = xml + '                <fax xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.fax) + '</fax>>';
            //                <!--Optional:-->
            xml = xml + '                <firstname xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.firstname) + '</firstname>';
            //                <!--Optional:-->
            xml = xml + '                <lastname xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.lastname) + '</lastname>';
            //                <!--Optional:-->
            xml = xml + '                <middlename xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.middlename) + '</middlename>>';
            //                <!--Optional:-->
            xml = xml + '                <postcode xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.postcode) + '</postcode>';
            //                <!--Optional:-->
            xml = xml + '                <prefix xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.prefix) + '</prefix>';
            //                <!--Optional:-->
            xml = xml + '                <region_id xsi:type="xsd:int" xs:type="type:int">' + getBlankIfNull(customerAddressObject.region_id) + '</region_id>';
            //                <!--Optional:-->
            xml = xml + '                <region xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.region) + '</region>';
            //                <!--Optional:-->

            xml = xml + '<street xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[]" xs:type="type:string">';
            xml = xml + '    <item>' + getBlankIfNull(customerAddressObject.street1) + '</item>';
            xml = xml + '    <item>' + getBlankIfNull(customerAddressObject.street2) + '</item>';
            xml = xml + '</street>';
            xml = xml + ' <suffix xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.suffix) + '</suffix>';


            //                <!--Optional:-->
            xml = xml + '                <telephone xsi:type="xsd:string" xs:type="type:string">' + getBlankIfNull(customerAddressObject.telephone) + '</telephone>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_billing xsi:type="xsd:boolean" xs:type="type:boolean">' + getBlankIfNull(customerAddressObject.defaultbilling) + '</is_default_billing>';
            //                <!--Optional:-->
            xml = xml + '                <is_default_shipping xsi:type="xsd:boolean" xs:type="type:boolean">' + getBlankIfNull(customerAddressObject.defaultshipping) + '</is_default_shipping>';
            xml = xml + '            </addressData>';
            xml = xml + '        </urn:customerAddressCreate>';
            xml = xml + '    </soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';


        }

        return xml;
    }



};




function getBlankIfNull(data) {
    if (data == null)
        return '';
    else
        return data;
}


function getFirstNameLastName(data) {

    var array=data.split(' ');
    var firstName='';
    var lastName;
    var result=new Array();

    lastName=array[array.length-1];

    for(var i=0;i<array.length-1;i++) {
        firstName = firstName + array[i] +' ';

    }

    firstName=firstName.trim();

    result.push(firstName);
    result.push(lastName);


}