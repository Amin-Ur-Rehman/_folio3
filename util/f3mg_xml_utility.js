/**
 * Created by zahmed on 14-Jan-15.
 *
 * Class Name: XmlUtility
 *
 * Description:
 * - This script is responsible for handling xml
 * -
 * Referenced By:
 * -
 * -
 * Dependency:
 *   -
 *   -
 */

XmlUtility = (function () {
    return {
        /**
         * Init method
         */
        initialize: function () {

        },
        XmlHeader: '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento"><soapenv:Header/><soapenv:Body>',
        XmlFooter: '</soapenv:Body></soapenv:Envelope>',

        soapRequestToMagento: function (xml) {
            var res = nlapiRequestURL(ConnectorConstants.CurrentStore.endpoint, xml);
            var responseXML = nlapiStringToXML(res.getBody());
            return responseXML;
        },
        soapRequestToMagentoSpecificStore: function (xml,store) {
            var res = nlapiRequestURL(store.endpoint, xml);

            var responseXML = nlapiStringToXML(res.getBody());

            return responseXML;
        },
        getSessionIDFromMagento: function (userName, apiKey) {
            var sessionID = null;
            var loginXML = this.getLoginXml(userName, apiKey);
            try {
                var responseXML = this.soapRequestToMagento(loginXML);
                sessionID = nlapiSelectValue(responseXML, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:loginResponse/loginReturn");
            } catch (ex) {
                Utility.logException('ConnectorCommon.getSessionIDFromMagento', ex);
            }

            return sessionID;
        },
        getLoginXml: function (userName, apiKey) {
            var loginXML = '';

            loginXML += this.XmlHeader;
            loginXML += '<urn:login soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            loginXML += '   <username xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + userName + '</username>';
            loginXML += '   <apiKey xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + apiKey + '</apiKey>';
            loginXML += '</urn:login>';
            loginXML += this.XmlFooter;

            return loginXML;
        },
        getSalesOrderListXML: function (order, sessionID) {
            var soXML;

            soXML = this.XmlHeader;
            soXML = soXML + '<urn:salesOrderList>';

            soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';

            soXML = soXML + '<filters xsi:type="urn:filters">';
            soXML = soXML + '<filter SOAP-ENC:arrayType="urn:associativeEntity[0]" xsi:type="urn:associativeArray">';
            soXML = soXML + '</filter>';

            soXML = soXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[2]" xsi:type="urn:complexFilterArray">';

            soXML = soXML + '<item xsi:type="ns1:complexFilter">';

            soXML = soXML + '<key xsi:type="xsd:string">updated_at</key>';
            soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
            soXML = soXML + '<key xsi:type="xsd:string">gt</key>';
            soXML = soXML + '<value xsi:type="xsd:string">' + order.updateDate + '</value>';
            soXML = soXML + '</value>';
            soXML = soXML + '</item>';

            var orderStatusFilster = ConnectorConstants.CurrentStore.entitySyncInfo.salesorder.status;

            soXML = soXML + '<item xsi:type="ns1:complexFilter">';
            soXML = soXML + '<key xsi:type="xsd:string">status</key>';
            soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
            soXML = soXML + '<key xsi:type="xsd:string">in</key>';
            for (var i = 0; i < orderStatusFilster.length; i++) {
                soXML = soXML + '<value xsi:type="xsd:string">' + orderStatusFilster[i] + '</value>';
            }
            soXML = soXML + ' </value>';
            soXML = soXML + '</item>';
            soXML = soXML + '</complex_filter>';

            soXML = soXML + '</filters>';

            soXML = soXML + '</urn:salesOrderList>';
            soXML = soXML + this.XmlFooter;

            return soXML;

        },
        getLoadCustomersXML: function (customer, sessionID) {
            var customerXML;

            customerXML = this.XmlHeader;
            customerXML = customerXML + '<urn:customerCustomerList>';
            customerXML = customerXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
            customerXML = customerXML + '</urn:customerCustomerList>';
            customerXML = customerXML + this.XmlFooter;

            return customerXML;

        },
        getSalesOrderListByCustomerXML: function (customerId, sessionID) {
            var soXML;

            soXML = this.XmlHeader;
            soXML = soXML + '<urn:salesOrderList>';

            soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';

            soXML = soXML + '<filters xsi:type="urn:filters">';
            soXML = soXML + '<filter SOAP-ENC:arrayType="urn:associativeEntity[0]" xsi:type="urn:associativeArray">';
            soXML = soXML + '</filter>';
            soXML = soXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
            soXML = soXML + '<item xsi:type="ns1:complexFilter">';
            soXML = soXML + '<key xsi:type="xsd:string">customer_id</key>';
            soXML = soXML + '<value xsi:type="ns1:associativeEntity">';
            soXML = soXML + '<key xsi:type="xsd:string">eq</key>';
            soXML = soXML + '<value xsi:type="xsd:string">' + customerId + '</value>';

            soXML = soXML + '</value>';
            soXML = soXML + '</item>';
            soXML = soXML + '</complex_filter>';
            soXML = soXML + '</filters>';

            soXML = soXML + '</urn:salesOrderList>';
            soXML = soXML + this.XmlFooter;

            return soXML;

        },
        getInvoiceListXML: function (order, sessionID) {
            var ilXML;

            ilXML = this.XmlHeader;
            ilXML = ilXML + '<urn:salesOrderInvoiceList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            ilXML = ilXML + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
            ilXML = ilXML + '<filters xsi:type="urn:filters">';

            ilXML = ilXML + '<complex_filter SOAP-ENC:arrayType="urn:complexFilter[1]" xsi:type="urn:complexFilterArray">';
            ilXML = ilXML + '<item xsi:type="ns1:complexFilter">';
            ilXML = ilXML + '<key xsi:type="xsd:string">updated_at</key>';
            ilXML = ilXML + '<value xsi:type="ns1:associativeEntity">';
            ilXML = ilXML + '<key xsi:type="xsd:string">gt</key>';
            ilXML = ilXML + '<value xsi:type="xsd:string">' + order.updateDate + '</value>';
            ilXML = ilXML + '</value>';
            ilXML = ilXML + '</item>';
            ilXML = ilXML + '</complex_filter>';
            ilXML = ilXML + '</filters>';
            ilXML = ilXML + '</urn:salesOrderInvoiceList>';
            ilXML = ilXML + this.XmlFooter;
            return ilXML;

        },
        getSalesOrderInfoXML: function (orderid, sessionID) {
            var soXML;

            soXML = this.XmlHeader;
            soXML = soXML + '<urn:salesOrderInfo>';
            soXML = soXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
            soXML = soXML + '<orderIncrementId urn:type="xsd:string">' + orderid + '</orderIncrementId>';
            soXML = soXML + '</urn:salesOrderInfo>';
            soXML = soXML + this.XmlFooter;

            return soXML;

        },
        getUpdateItemXML: function (item, sessionID, magID, isParent) {
            nlapiLogExecution('DEBUG', 'item json', JSON.stringify(item));

            var xml = '';

            xml = this.XmlHeader + '<urn:catalogProductUpdate>';
            xml = xml + '<sessionId>' + sessionID + '</sessionId>';
            xml = xml + '<product>' + magID + '</product>';

            xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
            xml = xml + '<price xsi:type="xsd:string">' + item.price + '</price>';

            xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';

            if (isParent) {
                item.quatity = 0;
            }
            xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + item.quatity + '</qty>';
            if (item.quatity >= 1) {
                xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';
            }

            xml = xml + '</stock_data>';
            xml = xml + '</productData>';
            // TODO: generalize storeView
            xml = xml + '<storeView xsi:type="xsd:string">1</storeView>';
            xml = xml + '</urn:catalogProductUpdate>';
            xml = xml + this.XmlFooter;

            return xml;

        },
        getCreateFulfillmentXML: function (sessionID, magentoItemIds, magentoSOId) {
            Utility.logDebug('getCreateFulfillmentXML', 'Enter in getCreateFulfillmentXML() fun');
            var itemsQuantity = nlapiGetLineItemCount('item');
            var shipmentXML;

            shipmentXML = this.XmlHeader + '<urn:salesOrderShipmentCreate>';
            shipmentXML = shipmentXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
            shipmentXML = shipmentXML + '<orderIncrementId urn:type="xsd:string">' + magentoSOId + '</orderIncrementId>';
            shipmentXML = shipmentXML + '<itemsQty  SOAP-ENC:arrayType="urn:orderItemIdQtyArray[' + itemsQuantity + ']" xsi:type="urn:orderItemIdQty">';
            Utility.logDebug('xml', nlapiEscapeXML(shipmentXML));

            var comment = '';
            for (var line = 1; line <= itemsQuantity; line++) {
                var itemId = magentoItemIds[nlapiGetLineItemValue('item', 'item', line)];
                var itemQty = nlapiGetLineItemValue('item', 'quantity', line);
                if (nlapiGetLineItemValue('item', 'isserialitem', 1) === 'T') {
                    comment = comment + ',' + nlapiGetLineItemValue('item', 'itemdescription', line) + '=' + nlapiGetLineItemValue('item', 'serialnumbers', line);
                }
                else {
                    comment = '-';
                }

                Utility.logDebug('xml', nlapiEscapeXML(shipmentXML));
                shipmentXML = shipmentXML + '<item xsi:type="urn:orderItemIdQty">';
                shipmentXML = shipmentXML + '<order_item_id type="xsd:int">' + itemId + '</order_item_id>';
                shipmentXML = shipmentXML + '<qty type="xsd:double">' + itemQty + '</qty>';
                shipmentXML = shipmentXML + '</item>';
                Utility.logDebug('Quantity', itemId);
                Utility.logDebug('Quantity', itemQty);
                Utility.logDebug('xml', nlapiEscapeXML(shipmentXML));
            }

            shipmentXML = shipmentXML + '</itemsQty>';
            shipmentXML = shipmentXML + ' <comment xsi:type="xsd:string">' + comment + '</comment>';
            shipmentXML = shipmentXML + '</urn:salesOrderShipmentCreate>';

            shipmentXML = shipmentXML + this.XmlFooter;

            Utility.logDebug('getCreateFulfillmentXML', 'Exit from getCreateFulfillmentXML() funciton');

            return shipmentXML;

        },
        createTrackingXML: function (id, carrier, carrierText, tracking, sessionID) {
            // Add TrackingNum for shipment - XML
            var tShipmentXML = '';
            tShipmentXML = this.XmlHeader;
            tShipmentXML = tShipmentXML + '<urn:salesOrderShipmentAddTrack soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            tShipmentXML = tShipmentXML + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
            tShipmentXML = tShipmentXML + '<shipmentIncrementId xsi:type="xsd:string">' + id + '</shipmentIncrementId>';

            tShipmentXML = tShipmentXML + '<carrier xsi:type="xsd:string">' + 'ups' + '</carrier>';

            tShipmentXML = tShipmentXML + '<title xsi:type="xsd:string">' + carrierText + '</title>';
            tShipmentXML = tShipmentXML + '<trackNumber xsi:type="xsd:string">' + tracking + '</trackNumber>';
            tShipmentXML = tShipmentXML + '</urn:salesOrderShipmentAddTrack>';
            tShipmentXML = tShipmentXML + this.XmlFooter;
            nlapiLogExecution('AUDIT', 'XML', nlapiEscapeXML(tShipmentXML));
            return tShipmentXML;
        },
        getCustomerAddressXML: function (customerID, sessionID) {
            var custAddrListXML;

            custAddrListXML = this.XmlHeader;

            custAddrListXML = custAddrListXML + '<urn:customerAddressList>';
            custAddrListXML = custAddrListXML + '<sessionId urn:type="xsd:string">' + sessionID + '</sessionId>';
            custAddrListXML = custAddrListXML + '<customerId urn:type="xsd:int">' + customerID + '</customerId>';
            custAddrListXML = custAddrListXML + '</urn:customerAddressList>';

            custAddrListXML = custAddrListXML + this.XmlFooter;

            return custAddrListXML;
        },
        getCreateItemXML: function (product, sessionID, categoryIds) {
            var xml = '';

            xml = this.XmlHeader + '<urn:catalogProductCreate>';
            xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
            xml = xml + '<type xsi:type="xsd:string">simple</type>';
            xml = xml + '<set xsi:type="xsd:string">4</set>';
            xml = xml + '<sku xsi:type="xsd:string">' + product.internalId + '</sku>';
            xml = xml + '<productData xsi:type="urn:catalogProductCreateEntity">';
            xml = xml + '<additional_attributes xsi:type="urn:catalogProductAdditionalAttributesEntity">';

            xml = xml + '<categories SOAP-ENC:arrayType="xsd:string[' + categoryIds.length + ']" xsi:type="urn:ArrayOfString">';

            if (!Utility.isBlankOrNull(categoryIds) && categoryIds.length > 0) {
                for (var i = 0; i < categoryIds.length; i++) {
                    xml = xml + ' <item xsi:type="xsd:string">' + categoryIds[i] + '</item>';
                }
            }

            xml = xml + '</categories>';

            xml = xml + '<websites SOAP-ENC:arrayType="xsd:string[1]" xsi:type="urn:ArrayOfString"><item xsi:type="xsd:string">1</item></websites>';
            xml = xml + '<name xsi:type="xsd:string">' + product.name + '</name>';
            xml = xml + '<description xsi:type="xsd:string">' + product.description + '</description>';
            xml = xml + '<short_description xsi:type="xsd:string">' + product.description + '</short_description>';
            xml = xml + '<weight xsi:type="xsd:string">0.0000</weight>';
            xml = xml + '<status xsi:type="xsd:string">1</status>';
            xml = xml + '<visibility xsi:type="xsd:string">4</visibility>';
            xml = xml + '<price xsi:type="xsd:string">' + product.price + '</price>';
            xml = xml + '<tax_class_id xsi:type="xsd:string">0</tax_class_id>';
            xml = xml + '<stock_data xsi:type="urn:catalogInventoryStockItemUpdateEntity" xs:type="type:catalogInventoryStockItemUpdateEntity">';

            xml = xml + '<qty xsi:type="xsd:string" xs:type="type:string">' + product.quatity + '</qty>';
            if (product.quatity >= 1) {
                xml = xml + '<is_in_stock xsi:type="xsd:string" xs:type="type:string">' + 1 + '</is_in_stock>';
            }

            xml = xml + '</stock_data>';


            xml = xml + '</productData>';
            xml = xml + '</urn:catalogProductCreate>';
            nlapiLogExecution('DEBUG', 'response', (xml));
            xml = xml + this.XmlFooter;

            return xml;

        },
        getProductListXML: function (sessionID, product) {
            var xml;
            xml = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<soapenv:Header/>';
            xml = xml + '<soapenv:Body>';
            xml = xml + '<urn:catalogProductList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            xml = xml + '<sessionId xsi:type="xsd:string">' + sessionID + '</sessionId>';
            xml = xml + '<filters xsi:type="urn:filters">';
            xml = xml + '<filter xsi:type="urn:associativeArray" soapenc:arrayType="urn:associativeEntity[1]">';
            xml = xml + '<item>';
            xml = xml + '<key>sku</key>';
            xml = xml + '<value>' + product.magentoSKU + '</value>';
            xml = xml + '</item>';
            xml = xml + '</filter>';
            xml = xml + '</filters>';
            xml = xml + '</urn:catalogProductList>';
            xml = xml + '</soapenv:Body>';
            xml = xml + '</soapenv:Envelope>';
            return xml;
        },
        getUpdateFulfillmentXML: function (fulfillmentId, sessionID) {
            nlapiLogExecution('DEBUG', 'Enter in getUpdateFulfillmentXML() funciton', 'fulfillmentId: ' + fulfillmentId);

            var xml = '';

            nlapiLogExecution('DEBUG', 'Exit from getUpdateFulfillmentXML() funciton', 'fulfillmentId: ' + fulfillmentId);

            return xml;

        },

        transformCustAddrListXMLtoArray: function (addresses) {
            var result = [];
            var address;

            for (var i = 0; i < addresses.length; i++) {
                address = {};

                address.customer_address_id = nlapiSelectValue(addresses[i], 'customer_address_id');
                address.created_at = nlapiSelectValue(addresses[i], 'created_at');
                address.updated_at = nlapiSelectValue(addresses[i], 'updated_at');
                address.city = nlapiSelectValue(addresses[i], 'city');
                address.company = nlapiSelectValue(addresses[i], 'company');
                address.country_id = nlapiSelectValue(addresses[i], 'country_id');
                address.firstname = nlapiSelectValue(addresses[i], 'firstname');
                address.lastname = nlapiSelectValue(addresses[i], 'lastname');
                address.postcode = nlapiSelectValue(addresses[i], 'postcode');
                address.region = nlapiSelectValue(addresses[i], 'region');
                address.region_id = nlapiSelectValue(addresses[i], 'region_id');
                address.street = nlapiSelectValue(addresses[i], 'street');
                address.telephone = nlapiSelectValue(addresses[i], 'telephone');
                address.is_default_billing = eval(nlapiSelectValue(addresses[i], 'is_default_billing'));
                address.is_default_shipping = eval(nlapiSelectValue(addresses[i], 'is_default_shipping'));

                result[result.length] = address;
            }

            return result;
        },
        transformSalesOrderListXMLtoArray: function (orders) {
            var result = [];

            for (var i = 0; i < orders.length; i++) {

                var order = {};
                order.increment_id = nlapiSelectValue(orders[i], 'increment_id');
                order.order_id = nlapiSelectValue(orders[i], 'order_id');
                order.created_at = nlapiSelectValue(orders[i], 'created_at');
                order.customer_id = nlapiSelectValue(orders[i], 'customer_id');
                order.firstname = nlapiSelectValue(orders[i], 'firstname');
                order.lastname = nlapiSelectValue(orders[i], 'lastname');
                order.email = nlapiSelectValue(orders[i], 'customer_email');
                order.shipment_method = nlapiSelectValue(orders[i], 'shipping_method');
                order.shipping_description = nlapiSelectValue(orders[i], 'shipping_description');
                order.customer_firstname = nlapiSelectValue(orders[i], 'customer_firstname');
                order.customer_lastname = nlapiSelectValue(orders[i], 'customer_lastname');
                order.grandtotal = nlapiSelectValue(orders[i], 'grand_total');
                order.store_id = nlapiSelectValue(orders[i], 'store_id');
                order.shipping_amount = nlapiSelectValue(orders[i], 'shipping_amount');
                order.discount_amount = nlapiSelectValue(orders[i], 'discount_amount');
                order.customer_middlename = nlapiSelectValue(orders[i], 'customer_middlename');
                order.customer_middlename = order.customer_middlename ? order.customer_middlename : '';

                result.push(order);
            }

            return result;
        },
        transformInvoiceListToArray: function (invoices) {
            var result = [];
            var invoice;
            for (var i = 0; i < invoices.length; i++) {
                invoice = {};
                invoice.increment_id = nlapiSelectValue(invoices[i], 'increment_id');
                invoice.order_id = nlapiSelectValue(invoices[i], 'order_id');
                result[invoice.order_id] = invoice.increment_id;
            }

            return result;
        },
        transformSalesOrderInfoXMLtoshippingAddress: function (shipping) {
            var shippingObj = {};

            shippingObj.street = nlapiSelectValue(shipping[0], 'street');
            shippingObj.city = nlapiSelectValue(shipping[0], 'city');
            shippingObj.phone = nlapiSelectValue(shipping[0], 'telephone');
            shippingObj.state = nlapiSelectValue(shipping[0], 'region');
            shippingObj.region_id = nlapiSelectValue(shipping[0], 'region_id');
            shippingObj.zip = nlapiSelectValue(shipping[0], 'postcode');
            shippingObj.country = nlapiSelectValue(shipping[0], 'country_id');
            shippingObj.firstname = nlapiSelectValue(shipping[0], 'firstname');
            shippingObj.lastname = nlapiSelectValue(shipping[0], 'lastname');

            return shippingObj;
        },
        transformSalesOrderInfoXMLtobillingAddress: function (billing) {
            var billingObj = {};

            billingObj.street = nlapiSelectValue(billing[0], 'street');
            billingObj.city = nlapiSelectValue(billing[0], 'city');
            billingObj.phone = nlapiSelectValue(billing[0], 'telephone');
            billingObj.state = nlapiSelectValue(billing[0], 'region');
            billingObj.region_id = nlapiSelectValue(billing[0], 'region_id');
            billingObj.zip = nlapiSelectValue(billing[0], 'postcode');
            billingObj.country = nlapiSelectValue(billing[0], 'country_id');
            billingObj.firstname = nlapiSelectValue(billing[0], 'firstname');
            billingObj.lastname = nlapiSelectValue(billing[0], 'lastname');

            return billingObj;
        },
        transformSalesOrderInfoXMLtoPayment: function (payment) {
            var paymentObj = {};

            paymentObj.parentId = nlapiSelectValue(payment[0], 'parent_id');
            paymentObj.amountOrdered = nlapiSelectValue(payment[0], 'amount_ordered');
            paymentObj.shippingAmount = nlapiSelectValue(payment[0], 'shipping_amount');
            paymentObj.baseAmountOrdered = nlapiSelectValue(payment[0], 'base_amount_ordered');
            paymentObj.method = nlapiSelectValue(payment[0], 'method');
            paymentObj.ccType = nlapiSelectValue(payment[0], 'cc_type');
            paymentObj.ccLast4 = nlapiSelectValue(payment[0], 'cc_last4');
            paymentObj.ccExpMonth = nlapiSelectValue(payment[0], 'cc_exp_month');
            paymentObj.ccExpYear = nlapiSelectValue(payment[0], 'cc_exp_year');
            paymentObj.paymentId = nlapiSelectValue(payment[0], 'payment_id');

            return paymentObj;
        },
        transformSalesOrderInfoXMLtoArray: function (products) {
            var result = [];
            var product;
            var skuArr = [];

            for (var i = 0; i < products.length; i++) {
                product = {};
                var sku = nlapiSelectValue(products[i], 'sku');
                if (skuArr.indexOf(sku) === -1) {
                    skuArr.push(sku);
                    product.product_id = sku;// TODO: check sku
                    product.qty_ordered = nlapiSelectValue(products[i], 'qty_ordered');
                    // get ammount for dummy item
                    result[result.length] = product;
                }
            }

            return result;
        },
        tranformCustomerXMLtoArray: function (customers) {
            var result = [];
            var customer;
            var middleName;

            for (var i = 0; i < customers.length; i++) {
                customer = {};
                customer.customer_id = nlapiSelectValue(customers[i], 'customer_id');
                customer.email = nlapiSelectValue(customers[i], 'email');
                customer.firstname = nlapiSelectValue(customers[i], 'firstname');
                middleName = Utility.getBlankForNull(nlapiSelectValue(customers[i], 'middlename'));
                customer.middlename = middleName ? middleName + ' ' : '';
                customer.lastname = nlapiSelectValue(customers[i], 'lastname');
                customer.group_id = nlapiSelectValue(customers[i], 'group_id');
                customer.prefix = Utility.getBlankForNull(nlapiSelectValue(customers[i], 'prefix'));
                customer.suffix = nlapiSelectValue(customers[i], 'suffix');
                customer.dob = nlapiSelectValue(customers[i], 'dob');

                result.push(customer);
            }

            return result;
        },

        validateResponse: function (xml, operation) {
            var responseMagento = {};
            var faultCode;
            var faultString;
            if (operation === 'order') {
                var orders = nlapiSelectNodes(xml, "//result/item");
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
                if (!Utility.isBlankOrNull(faultCode)) {
                    responseMagento.status = false;       // Means There is fault
                    responseMagento.faultCode = faultCode;   // Fault Code
                    responseMagento.faultString = faultString; //Fault String
                }
                else if (!Utility.isBlankOrNull(orders)) {
                    responseMagento.status = true;
                    responseMagento.orders = this.transformSalesOrderListXMLtoArray(orders);
                }
                else    // Not Attribute ID Found, Nor fault code found
                {
                    responseMagento.status = false;
                    responseMagento.faultCode = '000';
                    responseMagento.faultString = 'Unexpected Error';
                }
            }
            else if (operation === 'product') {

                var products = nlapiSelectNodes(xml, "//items/item");
                var shipping = nlapiSelectNodes(xml, "//shipping_address");
                var billing = nlapiSelectNodes(xml, "//billing_address");
                var payment = nlapiSelectNodes(xml, "//payment");
                var statusHistory = nlapiSelectNodes(xml, "//status_history/item");
                var authorizedId;
                nlapiLogExecution('DEBUG', 'payment XXL', payment);
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
                if (!Utility.isBlankOrNull(faultCode)) {
                    responseMagento.status = false;       // Means There is fault
                    responseMagento.faultCode = faultCode;   // Fault Code
                    responseMagento.faultString = faultString; //Fault String
                }
                else if (!Utility.isBlankOrNull(products)) {
                    responseMagento.status = true;
                    responseMagento.products = this.transformSalesOrderInfoXMLtoArray(products);
                    responseMagento.shippingAddress = this.transformSalesOrderInfoXMLtoshippingAddress(shipping);
                    responseMagento.billingAddress = this.transformSalesOrderInfoXMLtobillingAddress(billing);
                    responseMagento.payment = this.transformSalesOrderInfoXMLtoPayment(payment);
                    authorizedId = ConnectorCommon.getAuthorizedId(statusHistory);
                    responseMagento.payment.authorizedId = authorizedId;
                }
                else    // Not Attribute ID Found, Nor fault code found
                {
                    //nlapiLogExecution('Debug','Error in validateResponse-operation=product ');
                    responseMagento.status = false;
                    responseMagento.faultCode = '000';
                    responseMagento.faultString = 'Unexpected Error';
                }
            }
            else if (operation === 'invoice') {
                var invoices = nlapiSelectNodes(xml, "//result/item");
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
                if (!Utility.isBlankOrNull(faultCode)) {
                    responseMagento.status = false;       // Means There is fault
                    responseMagento.faultCode = faultCode;   // Fault Code
                    responseMagento.faultString = faultString; //Fault String
                }
                else if (!Utility.isBlankOrNull(invoices)) {
                    responseMagento.status = true;
                    responseMagento.invoices = this.transformInvoiceListToArray(invoices);
                }
                else {
                    // Not Attribute ID Found, Nor fault code found
                    responseMagento.status = false;
                    responseMagento.faultCode = '000';
                    responseMagento.faultString = 'Unexpected Error';
                }
            }
            return responseMagento;
        },
        validateResponseCustomer: function (xml) {

            nlapiLogExecution('Debug', 'validateResponse started');

            nlapiLogExecution('DEBUG', 'response', nlapiXMLToString(xml));

            var responseMagento = {};


            var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
            var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");
            var customers = nlapiSelectNodes(xml, "//storeView/item");

            if (!Utility.isBlankOrNull(faultCode)) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Category Delete Operation Faild', responseMagento.faultString);
            }
            else if (!Utility.isBlankOrNull(customers)) {
                responseMagento.status = true;
                responseMagento.customers = this.tranformCustomerXMLtoArray(customers);
            }
            else    // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';
                nlapiLogExecution('Debug', 'Mageno-Customer Import Operation Faild', responseMagento.faultString);

            }


            return responseMagento;

        },
        validateItemExportResponse: function (xml, operation) {
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


            if (!Utility.isBlankOrNull(faultCode)) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            }
            else if (!Utility.isBlankOrNull(magentoItemID)) {
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
        },
        validateGetIDResponse: function (xml) {
            var responseMagento = {};
            var magentoItemID;
            var faultCode;
            var faultString;

            try {
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");


                magentoItemID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductListResponse/storeView/item/product_id");


            } catch (ex) {
            }

            if (!Utility.isBlankOrNull(faultCode)) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Item Export Operation Faild', responseMagento.faultString);
            }
            else if (!Utility.isBlankOrNull(magentoItemID)) {
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
        },
        validateCustomerAddressResponse: function (xml) {
            var responseMagento = {};

            var customerAddresses = nlapiSelectNodes(xml, "//result/item");
            var faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
            var faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

            if (!Utility.isBlankOrNull(faultCode)) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String

            }
            else if (!Utility.isBlankOrNull(customerAddresses)) {
                responseMagento.status = true;
                responseMagento.addresses = this.transformCustAddrListXMLtoArray(customerAddresses);
            }
            else    // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';


            }

            return responseMagento;
        },

        validateCustomerExportOperationResponse:function(xml,operation)
        {
            var faultCode="";
            var faultString;
            var responseMagento = {};
            responseMagento.status=true;

            try {

                if(operation=="create") {

                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

                    responseMagento.faultCode= faultCode;
                    responseMagento.faultString= faultString;


                    if(!!responseMagento.faultCode) {
                        responseMagento.status=false;
                    }

                    if(responseMagento.status)
                    {
                        magentoCustomerId = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:customerCustomerCreateResponse/result");
                        responseMagento.magentoCustomerId = magentoCustomerId;
                    }

                }

            } catch (ex) {
            }

            return responseMagento;

        },

        validateCustomerAddressExportOperationResponse:function(xml,operation) {
            var faultCode = "";
            var faultString;
            var responseMagento = {};
            responseMagento.status = true;

            try {

                if (operation == "create") {
                    faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                    faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

                    responseMagento.faultCode = faultCode;
                    responseMagento.faultString = faultString;


                    if (!!responseMagento.faultCode != "") {
                        responseMagento.status = false;
                    }

                    if (responseMagento.status) {
                        magentoAddressId = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:customerAddressCreateResponse/result");
                        responseMagento.magentoCustomerId = magentoAddressId;
                    }

                }

            } catch (ex) {
            }


            nlapiLogExecution('debug', 'responseMagento', JSON.stringify(responseMagento));

            return responseMagento;
        },

        validateTrackingCreateResponse: function (xml, operation) {
            nlapiLogExecution('AUDIT', 'XML', nlapiEscapeXML(xml));
            var responseMagento = {};
            var magentoFulfillmentID;
            var faultCode;
            var faultString;


            try {
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

                //  if (operation=='create')
                magentoFulfillmentID = nlapiSelectValue(xml, "//result");
                //else if (operation=='update')
                //magentoFulfillmentID= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


            } catch (ex) {
            }


            if (faultCode != null) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Tracking Number Add Operation Failed', responseMagento.faultString + ' - ' + responseMagento.faultCode);
                ConnectorCommon.generateErrorEmail('Tracking Number Add Operation Failed  ' + responseMagento.faultString, '', 'order');
            }
            else if (magentoFulfillmentID != null) {
                responseMagento.status = true;       // Means There is fault
                responseMagento.result = magentoFulfillmentID;
            }
            else    // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';
                nlapiLogExecution('Debug', 'Tracking Number Add Operation Failed', responseMagento.faultString + ' - ' + responseMagento.faultCode);
                ConnectorCommon.generateErrorEmail('Tracking Number Add Operation Failed ' + responseMagento.faultString, '', 'order');

            }

            return responseMagento;
        },
        validateFulfillmentExportResponse: function (xml, operation) {
            var responseMagento = {};
            var magentoFulfillmentID;
            var faultCode;
            var faultString;


            try {
                faultCode = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
                faultString = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

                //  if (operation=='create')
                magentoFulfillmentID = nlapiSelectValue(xml, "SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:salesOrderShipmentCreateResponse/shipmentIncrementId");
                //else if (operation=='update')
                //magentoFulfillmentID= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/ns1:catalogProductUpdateResponse/result");


            } catch (ex) {
            }


            if (faultCode != null) {
                responseMagento.status = false;       // Means There is fault
                responseMagento.faultCode = faultCode;   // Fault Code
                responseMagento.faultString = faultString; //Fault String
                nlapiLogExecution('Debug', 'Mageno-Fulfillment Export Operation Failed', responseMagento.faultString);
                ConnectorCommon.generateErrorEmail('Fulfilment couldnt get to Magento , Please convey this to folio3 : ' + responseMagento.faultString, '', 'order');
            }
            else if (magentoFulfillmentID != null) {
                responseMagento.status = true;       // Means There is fault
                responseMagento.result = magentoFulfillmentID;
            }
            else    // Not Attribute ID Found, Nor fault code found
            {
                responseMagento.status = false;
                responseMagento.faultCode = '000';
                responseMagento.faultString = 'Unexpected Error';
                nlapiLogExecution('Debug', 'Mageno-Fulfillment Export Operation Failed', responseMagento.faultString);
                ConnectorCommon.generateErrorEmail('Fulfilment couldnt get to Magento , Please convey this to folio3 : ' + responseMagento.faultString, '', 'order');

            }

            return responseMagento;
        },

        /**
         * Description of method getCustomerXmlForSaleOrder
         * @param parameter
         */
        getCustomerXmlForSaleOrder: function (customer) {
            var customerXml = '';

            customerXml = customerXml + '<customer xsi:type="urn:customCustomerEntity" xs:type="type:customCustomerEntity" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            customerXml = customerXml + '<entity xsi:type="urn:shoppingCartCustomerEntity" xs:type="type:shoppingCartCustomerAddressEntity">';
            customerXml = customerXml + '<mode xsi:type="xsd:string" xs:type="type:string">shipping</mode>';
            customerXml = customerXml + '<customer_id xsi:type="xsd:int" xs:type="type:int">' + customer.customerId +'</customer_id>';
            customerXml = customerXml + '<email xsi:type="xsd:string" xs:type="type:string">' + customer.email + '</email>';
            customerXml = customerXml + '<firstname xsi:type="xsd:string" xs:type="type:string">' + customer.firstName + '</firstname>';
            customerXml = customerXml + '<lastname xsi:type="xsd:string" xs:type="type:string">' + customer.lastName + '</lastname>';
            customerXml = customerXml + '<company xs:type="type:string">' + customer.company + '</company>';
            customerXml = customerXml + '<street xs:type="type:string">' + customer.street + '</street>';
            customerXml = customerXml + '<city xs:type="type:string">' + customer.city + '</city>';
            customerXml = customerXml + '<region xs:type="type:string">' + customer.state + '</region>';
            customerXml = customerXml + '<region_id xs:type="type:string">' + customer.state + '</region_id>';
            customerXml = customerXml + '<postcode xs:type="type:string">' + customer.zipCode + '</postcode>';
            customerXml = customerXml + '<country_id xs:type="type:string">' + customer.country + '</country_id>';
            customerXml = customerXml + '<telephone xs:type="type:string">' + customer.telephone + '</telephone>';
            customerXml = customerXml + '<fax xs:type="type:string">' + customer.fax + '</fax>';
            customerXml = customerXml + '<is_default_billing xs:type="type:int">0</is_default_billing>';
            customerXml = customerXml + '<is_default_shipping xs:type="type:int">1</is_default_shipping>';
            customerXml = customerXml + '</entity>';
            customerXml = customerXml + '<address xsi:type="urn:shoppingCartCustomerAddressEntityArray" soapenc:arrayType="urn:shoppingCartCustomerAddressEntity[2]" xs:type="type:shoppingCartCustomerAddressEntity">';
            customerXml = customerXml + '<item>';
            customerXml = customerXml + '<mode xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns/">shipping</mode>';
            customerXml = customerXml + '<firstname xsi:type="xsd:string" xs:type="type:string">' + customer.firstName + '</firstname>';
            customerXml = customerXml + '<lastname xsi:type="xsd:string" xs:type="type:string">' + customer.lastName + '</lastname>';
            customerXml = customerXml + '<company xs:type="type:string">' + customer.company + '</company>';
            customerXml = customerXml + '<street xs:type="type:string">' + customer.street + '</street>';
            customerXml = customerXml + '<city xs:type="type:string">' + customer.city + '</city>';
            customerXml = customerXml + '<region xs:type="type:string">' + customer.state + '</region>';
            customerXml = customerXml + '<region_id xs:type="type:string">' + customer.state + '</region_id>';
            customerXml = customerXml + '<postcode xs:type="type:string">' + customer.zipCode + '</postcode>';
            customerXml = customerXml + '<country_id xs:type="type:string">' + customer.country + '</country_id>';
            customerXml = customerXml + '<telephone xs:type="type:string">' + customer.telephone + '</telephone>';
            customerXml = customerXml + '<fax xs:type="type:string">' + customer.fax + '</fax>';
            customerXml = customerXml + '<is_default_billing xs:type="type:int">0</is_default_billing>';
            customerXml = customerXml + '<is_default_shipping xs:type="type:int">1</is_default_shipping>';
            customerXml = customerXml + '</item>';
            customerXml = customerXml + '<item>';
            customerXml = customerXml + '<mode xn:type="http://www.w3.org/2001/XMLSchema" xmlns:xn="http://www.w3.org/2000/xmlns/">billing</mode>';
            customerXml = customerXml + '<firstname xsi:type="xsd:string" xs:type="type:string">' + customer.firstName + '</firstname>';
            customerXml = customerXml + '<lastname xsi:type="xsd:string" xs:type="type:string">' + customer.lastName + '</lastname>';
            customerXml = customerXml + '<company xs:type="type:string">' + customer.company + '</company>';
            customerXml = customerXml + '<street xs:type="type:string">' + customer.street + '</street>';
            customerXml = customerXml + '<city xs:type="type:string">' + customer.city + '</city>';
            customerXml = customerXml + '<region xs:type="type:string">' + customer.state + '</region>';
            customerXml = customerXml + '<region_id xs:type="type:string">' + customer.state + '</region_id>';
            customerXml = customerXml + '<postcode xs:type="type:string">' + customer.zipCode + '</postcode>';
            customerXml = customerXml + '<country_id xs:type="type:string">' + customer.country + '</country_id>';
            customerXml = customerXml + '<telephone xs:type="type:string">' + customer.telephone + '</telephone>';
            customerXml = customerXml + '<fax xs:type="type:string">' + customer.fax + '</fax>';
            customerXml = customerXml + '<is_default_billing xs:type="type:int">1</is_default_billing>';
            customerXml = customerXml + '<is_default_shipping xs:type="type:int">0</is_default_shipping>';
            customerXml = customerXml + '</item>';
            customerXml = customerXml + '</address>';
            customerXml = customerXml + '</customer>';

            return customerXml;
        },

        /**
         * Description of method getProductsXmlForSaleOrder
         * @param parameter
         */
        getProductsXmlForSaleOrder: function (items) {

            var productXml = '';

            productXml = productXml + '<products xsi:type="urn:shoppingCartProductEntityArray" soapenc:arrayType="urn:shoppingCartProductEntity[1]">';

            for (var counter = 0; counter < items.length; counter++) {
                var item = items[counter];
                productXml = productXml + '<item><sku>' + item.sku  + '</sku><qty>' + item.quantity + '</qty></item>';
            }

            productXml = productXml + '</products>';

            return productXml;
        },

        /**
         * Description of method getShippingAndPaymentXml
         * @param parameter
         */
        getShippingAndPaymentXml: function (shipmentMethod, paymentMethod) {

            var shippingAndPaymentXml = '';

            shippingAndPaymentXml = shippingAndPaymentXml + '<shippingmethod xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">' + shipmentMethod + '</shippingmethod>';
            shippingAndPaymentXml = shippingAndPaymentXml + '<paymentmethod xsi:type="urn:shoppingCartPaymentMethodEntity" xs:type="type:shoppingCartPaymentMethodEntity" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">';
            shippingAndPaymentXml = shippingAndPaymentXml + '<method xsi:type="xsd:string" xs:type="type:string">' + paymentMethod + '</method>';
            shippingAndPaymentXml = shippingAndPaymentXml + '</paymentmethod>';

            return shippingAndPaymentXml;
        },

        /**
         * Creates XML for Sales Order and returns
         * @param orderCreationInfo
         * @param sessionId
         * @returns {string} XML String
         */
        getCreateSalesOrderXml: function (orderCreationInfo, sessionId) {
            var orderXml;
            var customer = orderCreationInfo.customer;
            var items = orderCreationInfo.items;
            var shipmentMethod = orderCreationInfo.shipmentMethod;
            var paymentMethod = orderCreationInfo.paymentMethod;

            orderXml = this.XmlHeader;

            var customerXml = this.getCustomerXmlForSaleOrder(customer);
            var productsXml = this.getProductsXmlForSaleOrder(items);
            var shippingAndPaymentXml = this.getShippingAndPaymentXml(shipmentMethod, paymentMethod);

            orderXml = orderXml + '<urn:folio3_salesOrderCreateSalesOrder soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">';
            orderXml = orderXml + '<sessionId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">341344c61e78abfe03d44d4564b9ad97</sessionId>';
            orderXml = orderXml + '<storeId xsi:type="xsd:string" xs:type="type:string" xmlns:xs="http://www.w3.org/2000/XMLSchema-instance">1</storeId>';
            orderXml = orderXml + customerXml;
            orderXml = orderXml + productsXml;
            orderXml = orderXml + shippingAndPaymentXml;
            orderXml = orderXml + '</urn:folio3_salesOrderCreateSalesOrder>';
            orderXml = orderXml + this.XmlFooter;

            return orderXml;

        }


    };
})();