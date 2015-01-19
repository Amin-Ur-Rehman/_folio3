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

    arrFils.push('custentity_magentosync_dev', null, 'is', 'F');

    arrCols.push('custentity_magento_custid');


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
        customerDataObject.store_id="";
        customerDataObject.group_id="";
        customerDataObject.prefix="";
        customerDataObject.suffix="";
        customerDataObject.dob="";
        customerDataObject.taxvat="";
        customerDataObject.gender="";

    }

    return customerDataObject;

},


    getMagentoRequestXML :function(customerDataObject)
    {
        var xml='';


         if(customerDataObject!=null)
        {
            xml=xml+'<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento">';
            xml=xml+'                <soapenv:Header/>';
            xml=xml+'   <soapenv:Body>';
            xml=xml+'       <urn:customerCustomerCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml=xml+'           <sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">2f9f36781e9d17fb7c3cb1e1958ca7e6</sessionId>';
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
            xml=xml+'                <password xsi:type="xsd:string" xs:type="type:string">'+customerDataObject.password+'</password>';
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



};