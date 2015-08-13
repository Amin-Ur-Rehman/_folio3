/**
 * Created by zahmed on 14-Jan-15.
 *
 * Referenced By:
 * -
 * -
 * Dependency:
 * - f3_utility_methods.js
 * -
 */

/**
 * This script is responsible for returning the object on client basis.
 */
F3ClientFactory = (function () {
    return {
        /**
         * Init method
         */
        createClient: function (type) {
            var client = null;

            switch (type) {
                case 'PurestColloids':
                    client = new F3PurestColloidsClient();
                    break;
                case 'Jet':
                    client = new F3JetClient();
                    break;
                default :
                    client = new F3ClientBase();
            }

            client.clientType = type;

            return client;
        }
    };
})();

/**
 * This class is responsible for setting the default fields in Magento Connector entities
 * @returns {{setCustomerFields: setCustomerFields, itemFetch: itemFetch, setSalesOrderFields: setSalesOrderFields, setCustomerAddressFields: setCustomerAddressFields}}
 * @constructor
 */
function F3ClientBase() {

    // private member conatins the type of the cleint
    var type = null;

    var self = {
        /**
         * getter
         * @returns {string}
         */
        get clientType() {
            return this.type;
        },
        /**
         * setter
         * @returns {void}
         */
        set clientType(type) {
            this.type = type || 'Folio3';
        },
        /**
         * Description of method setCustomerFields
         * @param {nlobjRecord} rec
         * @return {nlobjRecord}
         */
        setCustomerFields: function (rec) {
            try {

            } catch (e) {
                Utility.logException('setCustomerFields', e);
            }
            return rec;
        },

        /**
         * Description of method itemFetch
         * @return {nlobjSearchResult[],[]}
         */
        itemFetch: function () {
            var result = [];
            try {

            } catch (e) {
                Utility.logException('itemFetch', e);
            }
            return result;
        },

        /**
         * Description of method setSalesOrderFields
         * @param {nlobjRecord} rec
         * @return {nlobjRecord}
         */
        setSalesOrderFields: function (rec) {
            try {

            } catch (e) {
                Utility.logException('setSalesOrderFields', e);
            }
            return rec;
        },

        /**
         * Description of method setCustomerAddressFields
         * @param {nlobjRecord} rec
         * @return {nlobjRecord}
         */
        setCustomerAddressFields: function (rec) {
            try {

            } catch (e) {
                Utility.logException('setCustomerAddressFields', e);
            }
            return rec;
        },

        /**
         * Description of method create sales order
         * @param salesOrderObj
         */
        createSalesOrder: function (salesOrderObj) {

            var order = salesOrderObj.order;
            var invoiceNum = salesOrderObj.invoiceNum;
            var products = salesOrderObj.products;
            var netsuiteMagentoProductMap = salesOrderObj.netsuiteMagentoProductMap;
            var netsuiteCustomerId = salesOrderObj.netsuiteCustomerId;
            var configuration = salesOrderObj.configuration;
            var shippingAddress = salesOrderObj.shippingAddress;
            var billingAddress = salesOrderObj.billingAddress;
            var payment = salesOrderObj.payment;

            var magentoIdId;
            var magentoSyncId;
            var isDummyItemSetInOrder = '';
            var containsSerialized = false;
            var netSuiteItemID;

            magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
            magentoSyncId = ConnectorConstants.Transaction.Fields.MagentoSync;

            var rec = nlapiCreateRecord('salesorder', null);
            Utility.logDebug('setting payment ', '');

            // settting shipping method: start
            var orderShipMethod = order.shipment_method;
            var nsShipMethod = FC_ScrubHandler.getMappedValue('ShippingMethod', orderShipMethod);
            var shippingCarrier;
            var shippingMethod;

            // if no mapping is found then search for default
            if (orderShipMethod === nsShipMethod) {
                nsShipMethod = FC_ScrubHandler.getMappedValue('ShippingMethod', 'DEFAULT_NS');
            }
            nsShipMethod = (nsShipMethod + '').split('_');

            shippingCarrier = nsShipMethod.length === 2 ? nsShipMethod[0] : '';
            shippingMethod = nsShipMethod.length === 2 ? nsShipMethod[1] : '';

            var shippingCost = order.shipping_amount || 0;

            if (!(Utility.isBlankOrNull(shippingCarrier) || Utility.isBlankOrNull(shippingMethod))) {
                rec.setFieldValue('shipcarrier', shippingCarrier);
                rec.setFieldValue('shipmethod', shippingMethod);
                rec.setFieldValue('shippingcost', shippingCost);
            }

            Utility.logDebug('order.shipping_amount ', order.shipping_amount);
            Utility.logDebug('setting method ', nsShipMethod.join(','));

            // settting shipping method: end

            rec.setFieldValue('entity', netsuiteCustomerId);

            if (!ConnectorCommon.isDevAccount()) {
                var orderClass = ConnectorCommon.getOrderClass(order.store_id);
                //rec.setFieldValue('department', '20');// e-Commerce : Herman Street- Cost Service
                //rec.setFieldValue('class', orderClass);
                //rec.setFieldValue('location', 1);//Goddiva Warehous...ddiva Warehouse
                //rec.setFieldValue('shippingtaxcode', '7625');// VAT:SR-GB
            } else {
                rec.setFieldValue('department', '1');// Admin
            }

            //    rec.setFieldValue('shipmethod',732);

            //if ( )shipcarrier  ups nonups

            //Setting shipping
            //ConnectorCommon.setAddressV2(rec, shippingAddress, 'T');
            //Utility.logDebug('Setting Shipping Fields', '');

            //Setting billing
            //ConnectorCommon.setAddressV2(rec, billingAddress, 'F', 'T');
            //Utility.logDebug('Setting Billing Fields', '');

            // set payment details
            //ConnectorCommon.setPayment(rec, payment);


            for (var x = 0; x < products.length; x++) {
                Utility.logDebug('products.length is createSalesOrder', products.length);
                Utility.logDebug('products[x].product_id in createSalesOrder', products[x].product_id);

                var objIDPlusIsSerial = ConnectorCommon.getNetsuiteProductIdByMagentoIdViaMap(netsuiteMagentoProductMap, products[x].product_id);
                netSuiteItemID = objIDPlusIsSerial.netsuiteId;
                var isSerial = objIDPlusIsSerial.isSerial;
                Utility.logDebug('Netsuite Item ID', netSuiteItemID);

                if (!!netSuiteItemID) {
                    rec.setLineItemValue('item', 'item', x + 1, netSuiteItemID);
                    rec.setLineItemValue('item', 'quantity', x + 1, products[x].qty_ordered);
                    rec.setLineItemValue('item', 'price', x + 1, 1);
                    //rec.setLineItemValue('item', 'taxcode', x + 1, '-7');// -Not Taxable-
                }
                else {
                    if (ConnectorConstants.CurrentStore.entitySyncInfo.salesorder.setDummyItem) {
                        Utility.logDebug('Set Dummy Item Id: ', ConnectorConstants.DummyItem.Id);
                        rec.setLineItemValue('item', 'item', x + 1, ConnectorConstants.DummyItem.Id);
                        isDummyItemSetInOrder = true;
                        rec.setLineItemValue('item', 'amount', x + 1, '0');
                        //rec.setLineItemValue('item', 'taxcode', x + 1, '-7');// -Not Taxable-
                    }
                }

                if (isSerial == 'T')
                    containsSerialized = true;


                //    if( soprice != null )

                //    rec.setLineItemValue('item','amount',x+1,95);
            }

            // TODO: if required
            // get coupon code from magento order
            /*var couponCode = ConnectorCommon.getCouponCode(order.increment_id);

             if (couponCode) {
             Utility.logDebug('start setting coupon code', '');
             //rec.setFieldValue('couponcode', couponCode);
             rec.setFieldValue('discountitem', '14733');// item: DISCOUNT
             rec.setFieldValue('discountrate', order.discount_amount || 0);
             Utility.logDebug('end setting coupon code', '');
             }*/

            try {
                rec.setFieldValue(magentoSyncId, 'T');
                rec.setFieldValue(magentoIdId, order.increment_id);
                //rec.setFieldValue('memo', 'Test Folio3');
                if (isDummyItemSetInOrder) {
                    // A = Pending Approval
                    // if order has dummy item then set status to A (Pending Approval)
                    rec.setFieldValue('orderstatus', 'A');
                }
                else {
                    rec.setFieldValue('orderstatus', 'B');
                }

                rec.setFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore, ConnectorConstants.CurrentStore.systemId);

                //rec.setFieldValue('subsidiary', '3');// TODO generalize

                var id = nlapiSubmitRecord(rec, true, true);
                Utility.logDebug('Netsuite SO-ID for magento order ' + order.increment_id, id);
                /*if (isDummyItemSetInOrder) {
                 // if order has dummy item then don't create invoice and customer payment
                 return;
                 }
                 else {
                 // try creating Invoice
                 var invoiceResult = createInvoice(id, invoiceNum);
                 if (invoiceResult.errorMsg != '') {
                 nlapiLogExecution('ERROR', 'Could not create Invoice ', invoiceResult.errorMsg);
                 return;
                 }

                 // Now create Payment
                 var paymentResult = createCustomerPayment(invoiceResult.invoiceId);
                 if (paymentResult.errorMsg != '') {
                 nlapiLogExecution('ERROR', 'Could not create payment ', paymentResult.errorMsg);
                 return;
                 }

                 }*/
            }
            catch (ex) {
                //emailMsg = 'Order having Magento Id: ' + order.increment_id + ' did not created because of an error.\n' + ex.toString() + '.';
                //generateErrorEmail(emailMsg, configuration, 'order');
                Utility.logException('createSalesOrder', ex);
                // }
            }
        },

        /**
         * Description of method: Create Lead Record in NetSuite
         * @param magentoCustomerObj
         * @param sessionID
         * @param isGuest
         * @return {Object}
         */
        createLeadInNetSuite: function (magentoCustomerObj, sessionID, isGuest) {

            var result = {
                errorMsg: '',
                infoMsg: ''
            };

            var rec = nlapiCreateRecord('lead', null);
            //rec.setFieldValue('isperson', 'T');
            //rec.setFieldValue('subsidiary', '3');// TODO: generalize location
            //   rec.setFieldValue('salutation', '');

            // zee: get customer address list: start

            var custAddrXML;
            var responseMagento;
            var addresses = {};

            if (!isGuest) {
                custAddrXML = XmlUtility.getCustomerAddressXML(magentoCustomerObj.customer_id, sessionID);
                responseMagento = XmlUtility.validateCustomerAddressResponse(XmlUtility.soapRequestToMagento(custAddrXML));

                if (!responseMagento.status) {
                    result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                    Utility.logDebug('Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' + result.errorMsg);
                    return result;
                }

                addresses = responseMagento.addresses;

                if (!Utility.isBlankOrNull(addresses)) {
                    rec = ConnectorCommon.setAddresses(rec, addresses);
                }

                // setting sales order addresses
                addresses = magentoCustomerObj.addresses;
                rec = ConnectorCommon.setAddresses(rec, addresses, 'order');

            } else {
                // if guest customer comes

                if (!Utility.isBlankOrNull(addresses)) {
                    rec = ConnectorCommon.setAddresses(rec, magentoCustomerObj.addresses, 'order');
                }
            }

            // zee: get customer address list: end

            rec.setFieldValue('isperson', 'T');
            //rec.setFieldValue('autoname', 'T');

            //rec.setFieldValue('entityid', entityId); zee


            // mulitple stores handling

            var magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(ConnectorConstants.CurrentStore.systemId, isGuest ? 'Guest' : magentoCustomerObj.customer_id, 'create', null);

            if (Utility.isOneWorldAccount()) {
                rec.setFieldValue('subsidiary', ConnectorConstants.CurrentStore.entitySyncInfo.customer.subsidiary);
            }
            rec.setFieldValue(ConnectorConstants.Entity.Fields.MagentoId, magentoIdObjArrStr);
            rec.setFieldValue(ConnectorConstants.Entity.Fields.MagentoSync, 'T');
            rec.setFieldValue('email', magentoCustomerObj.email);
            rec.setFieldValue('firstname', magentoCustomerObj.firstname);
            rec.setFieldValue('middlename', magentoCustomerObj.middlename);
            rec.setFieldValue('lastname', magentoCustomerObj.lastname);//TODO: check
            //  rec.setFieldValue('salutation','');

            try {
                result.id = nlapiSubmitRecord(rec, false, true);
            } catch (ex) {
                result.errorMsg = ex.toString();
                Utility.logException('createLeadInNetSuite', ex);
            }

            return result;
        },

        /**
         * Description of method: Update Customer Record in NetSuite
         * @param customerId
         * @param magentoCustomerObj
         * @param sessionID
         * @return {Object}
         */
        updateCustomerInNetSuite: function (customerId, magentoCustomerObj, sessionID) {
            var result = {};
            var rec = nlapiLoadRecord('customer', customerId, null);

            // mulitple stores handling

            var existingMagentoId = rec.getFieldValue(ConnectorConstants.Entity.Fields.MagentoId);
            var magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(ConnectorConstants.CurrentStore.systemId, magentoCustomerObj.customer_id, 'update', existingMagentoId);

            rec.setFieldValue(ConnectorConstants.Entity.Fields.MagentoId, magentoIdObjArrStr);
            rec.setFieldValue(ConnectorConstants.Entity.Fields.MagentoSync, 'T');
            rec.setFieldValue('email', magentoCustomerObj.email);
            rec.setFieldValue('firstname', magentoCustomerObj.firstname);
            rec.setFieldValue('middlename', magentoCustomerObj.middlename);
            rec.setFieldValue('lastname', magentoCustomerObj.lastname);
            //  rec.setFieldValue('salutation','');

            // zee: get customer address list: start

            var custAddrXML;
            var responseMagento;
            var addresses;

            custAddrXML = XmlUtility.getCustomerAddressXML(magentoCustomerObj.customer_id, sessionID);

            responseMagento = XmlUtility.validateCustomerAddressResponse(XmlUtility.soapRequestToMagento(custAddrXML));

            if (!responseMagento.status) {
                result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
                Utility.logDebug('Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' + result.errorMsg);
                return result;
            }

            addresses = responseMagento.addresses;

            if (!Utility.isBlankOrNull(addresses)) {
                rec = ConnectorCommon.setAddresses(rec, addresses);
            }
            // setting magento addresses from sales order
            addresses = magentoCustomerObj.addresses;
            rec = ConnectorCommon.setAddresses(rec, addresses, 'order');

            // zee: get customer address list: end
            var id = nlapiSubmitRecord(rec, true, true);
            Utility.logDebug('Customer updated in NetSuite', 'Customer Id: ' + id);
        },
        /**
         * Find customer in search result with passed magento id
         * @param results
         * @param magentoId
         * @return {*}
         */
        getResultObjWithMagentoId: function (results, magentoId) {
            var result = null;

            if (!Utility.isBlankOrNull(magentoId)) {
                for (var i = 0; i < results.length && result === null; i++) {
                    var tempMagentoId = results[i].getValue(ConnectorConstants.Entity.Fields.MagentoId) || '';
                    // if id found/ customer is already synced then terminate the loop.
                    if (tempMagentoId.indexOf(magentoId) > 0) {
                        result = results[i];
                    }
                }
            }

            return result;
        },
        /**
         * Find customer in Search result with not synced with current store
         * @param results
         * @return {*}
         */
        getResultObjNotSyncedWithStore: function (results, storeId) {
            var result = null;

            for (var i = 0; i < results.length && result === null; i++) {
                // check if it has passed email id and not synced with current store
                var tempMagentoId = results[i].getValue(ConnectorConstants.Entity.Fields.MagentoId) || '';
                var magentoId = ConnectorCommon.getMagentoIdFromObjArray(tempMagentoId, storeId);
                if (Utility.isBlankOrNull(magentoId)) {
                    result = results[i];
                }

            }

            return result;
        },

        /**
         * Search the customer with email or formatted magentoId
         * @param {string} magentoId
         * @param {string} email
         * @return {object} {status: boolean, [netSuiteInternalId: string], [netSuiteMagentoId: string]}
         */
        searchCustomerInNetSuite: function (email, magentoId) {
            var magentoFormattedId;
            var result;
            var filExp = [];
            var cols = [];
            var results;
            var resultobj = {'status': false};

            magentoFormattedId = ConnectorCommon.getMagentoIdForSearhing(ConnectorConstants.CurrentStore.systemId, magentoId);
            cols.push(new nlobjSearchColumn(ConnectorConstants.Entity.Fields.MagentoId, null, null));
            cols.push(new nlobjSearchColumn('internalid', null, null).setSort(false));

            filExp.push(['email', 'is', email]);

            if (!Utility.isBlankOrNull(magentoId)) {
                filExp.push('OR');
                filExp.push([ConnectorConstants.Entity.Fields.MagentoId, 'contains', magentoFormattedId]);
            }

            results = ConnectorCommon.getRecords('customer', filExp, cols);

            if (results.length > 0) {
                // Assuming that there should be only one customer wiht one Id
                result = this.getResultObjWithMagentoId(results, magentoId);

                // getting first customer search object if not synced with current store
                if (result === null) {
                    result = this.getResultObjNotSyncedWithStore(results, ConnectorConstants.CurrentStore.systemId);
                }

                if (result !== null) {
                    resultobj.netSuiteInternalId = result.getId();
                    resultobj.netSuiteMagentoId = result.getValue(ConnectorConstants.Entity.Fields.MagentoId, null, null);
                    resultobj.status = true;
                }
            }
            return resultobj;
        }
    };
    return self;
}

/**
 * Create an object for Purest Colloids Client
 * @returns {object}
 * @constructor
 */
function F3PurestColloidsClient() {
    var currentClient = new F3ClientBase();

    /**
     * Description of method create sales order
     * @param salesOrderObj
     */
    currentClient.createSalesOrder = function (salesOrderObj) {

        var order = salesOrderObj.order;
        var invoiceNum = salesOrderObj.invoiceNum;
        var products = salesOrderObj.products;
        var netsuiteMagentoProductMap = salesOrderObj.netsuiteMagentoProductMap;
        var netsuiteCustomerId = salesOrderObj.netsuiteCustomerId;
        var configuration = salesOrderObj.configuration;
        var shippingAddress = salesOrderObj.shippingAddress;
        var billingAddress = salesOrderObj.billingAddress;
        var payment = salesOrderObj.payment;

        var magentoIdId;
        var magentoSyncId;
        var isDummyItemSetInOrder = '';
        var containsSerialized = false;
        var netSuiteItemID;

        magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
        magentoSyncId = ConnectorConstants.Transaction.Fields.MagentoSync;

        var rec = nlapiCreateRecord('salesorder', null);
        Utility.logDebug('setting payment ', '');

        //   rec.setFieldValue('tranid', order.increment_id);
        var shipMethodDetail = order.shipment_method;
        shipMethodDetail = (shipMethodDetail + '').split('_');

        var shippingCarrier = shipMethodDetail.length === 2 ? shipMethodDetail[0] : '';
        var shippingMethod = shipMethodDetail.length === 2 ? shipMethodDetail[1] : '';

        shippingCarrier = FC_ScrubHandler.getMappedValue('ShippingCarrier', shippingCarrier);
        shippingMethod = FC_ScrubHandler.getMappedValue('ShippingMethod', shippingMethod);

        var shippingMethodLookupKey = order.shipment_method;
        //Utility.logDebug('shippingMethodLookupKey_w', shippingMethodLookupKey);
        var shippingMethodLookupValue = FC_ScrubHandler.getMappedKeyByValue('ShippingMethod', shippingMethodLookupKey);
        //Utility.logDebug('shippingMethodLookupValue_w', shippingMethodLookupValue);
        if(!!shippingMethodLookupValue && shippingMethodLookupValue != shippingMethodLookupKey) {
            var shippingMethodValuesArray = shippingMethodLookupValue.split('_');
            shippingCarrier = shippingMethodValuesArray.length === 2 ? shippingMethodValuesArray[0] : shippingCarrier;
            shippingMethod = shippingMethodValuesArray.length === 2 ? shippingMethodValuesArray[1] : shippingMethod;
        }

        //Utility.logDebug('finalShippingCarrier_w', shippingCarrier);
        //Utility.logDebug('finalShippingMethod_w', shippingMethod);

        var shippingCost = order.shipping_amount || 0;

        if (!(Utility.isBlankOrNull(shippingCarrier) || Utility.isBlankOrNull(shippingMethod))) {
            rec.setFieldValue('shipcarrier', shippingCarrier);
            rec.setFieldValue('shipmethod', shippingMethod);
            rec.setFieldValue('shippingcost', shippingCost);
        }
        // rec.setFieldValue('taxitem',-2379);

        Utility.logDebug('order.shipping_amount ', order.shipping_amount);
        Utility.logDebug('setting method ', order.shipment_method);

        rec.setFieldValue('entity', netsuiteCustomerId);

        if (!ConnectorCommon.isDevAccount()) {
            var orderClass = ConnectorCommon.getOrderClass(order.store_id);
            //rec.setFieldValue('department', '20');// e-Commerce : Herman Street- Cost Service
            //rec.setFieldValue('class', orderClass);
            //rec.setFieldValue('location', 1);//Goddiva Warehous...ddiva Warehouse
            //rec.setFieldValue('shippingtaxcode', '7625');// VAT:SR-GB
        } else {
            rec.setFieldValue('department', '1');// Admin
        }

        //    rec.setFieldValue('shipmethod',732);

        //if ( )shipcarrier  ups nonups

        //Setting shipping
        //ConnectorCommon.setAddressV2(rec, shippingAddress, 'T');
        //Utility.logDebug('Setting Shipping Fields', '');

        //Setting billing
        //ConnectorCommon.setAddressV2(rec, billingAddress, 'F', 'T');
        //Utility.logDebug('Setting Billing Fields', '');

        // set payment details
        ConnectorCommon.setPayment(rec, payment);


        for (var x = 0; x < products.length; x++) {
            Utility.logDebug('products.length is createSalesOrder', products.length);
            Utility.logDebug('products[x].product_id in createSalesOrder', products[x].product_id);

            var objIDPlusIsSerial = ConnectorCommon.getNetsuiteProductIdByMagentoIdViaMap(netsuiteMagentoProductMap, products[x].product_id);
            netSuiteItemID = objIDPlusIsSerial.netsuiteId;
            var isSerial = objIDPlusIsSerial.isSerial;
            Utility.logDebug('Netsuite Item ID', netSuiteItemID);

            if (!!netSuiteItemID) {
                rec.setLineItemValue('item', 'item', x + 1, netSuiteItemID);
                rec.setLineItemValue('item', 'quantity', x + 1, products[x].qty_ordered);
                rec.setLineItemValue('item', 'price', x + 1, 1);
                rec.setLineItemValue('item', 'taxcode', x + 1, '-7');// -Not Taxable-
            }
            else {
                if (ConnectorConstants.CurrentStore.entitySyncInfo.salesorder.setDummyItem) {
                    Utility.logDebug('Set Dummy Item Id: ', ConnectorConstants.DummyItem.Id);
                    rec.setLineItemValue('item', 'item', x + 1, ConnectorConstants.DummyItem.Id);
                    isDummyItemSetInOrder = true;
                    rec.setLineItemValue('item', 'amount', x + 1, '0');
                    rec.setLineItemValue('item', 'taxcode', x + 1, '-7');// -Not Taxable-
                }
            }

            if (isSerial == 'T')
                containsSerialized = true;


            //    if( soprice != null )

            //    rec.setLineItemValue('item','amount',x+1,95);
        }

        //Utility.logDebug('All items set_w', 'All items set');
        //Utility.logDebug('payment.ccType_w', payment.ccType);
        //Utility.logDebug('payment.authorizedId_w', payment.authorizedId);

        // TODO: if required
        // get coupon code from magento order
        /*var couponCode = ConnectorCommon.getCouponCode(order.increment_id);

         if (couponCode) {
         Utility.logDebug('start setting coupon code', '');
         //rec.setFieldValue('couponcode', couponCode);
         rec.setFieldValue('discountitem', '14733');// item: DISCOUNT
         rec.setFieldValue('discountrate', order.discount_amount || 0);
         Utility.logDebug('end setting coupon code', '');
         }*/

        try {
            rec.setFieldValue(magentoSyncId, 'T');
            rec.setFieldValue(magentoIdId, order.increment_id);
            //rec.setFieldValue('memo', 'Test Folio3');
            if (isDummyItemSetInOrder) {
                // A = Pending Approval
                // if order has dummy item then set status to A (Pending Approval)
                rec.setFieldValue('orderstatus', 'A');
            }
            else {
                rec.setFieldValue('orderstatus', 'B');
            }

            rec.setFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore, ConnectorConstants.CurrentStore.systemId);

            //rec.setFieldValue('subsidiary', '3');// TODO generalize

            Utility.logDebug('Going to submit SO', 'Submitting');
            var id = nlapiSubmitRecord(rec, true, true);
            Utility.logDebug('Netsuite SO-ID for magento order ' + order.increment_id, id);
            /*if (isDummyItemSetInOrder) {
             // if order has dummy item then don't create invoice and customer payment
             return;
             }
             else {
             // try creating Invoice
             var invoiceResult = createInvoice(id, invoiceNum);
             if (invoiceResult.errorMsg != '') {
             nlapiLogExecution('ERROR', 'Could not create Invoice ', invoiceResult.errorMsg);
             return;
             }

             // Now create Payment
             var paymentResult = createCustomerPayment(invoiceResult.invoiceId);
             if (paymentResult.errorMsg != '') {
             nlapiLogExecution('ERROR', 'Could not create payment ', paymentResult.errorMsg);
             return;
             }

             }*/
        }
        catch (ex) {
            //emailMsg = 'Order having Magento Id: ' + order.increment_id + ' did not created because of an error.\n' + ex.toString() + '.';
            //generateErrorEmail(emailMsg, configuration, 'order');
            Utility.logException('createSalesOrder', ex);
            // }
        }
    };

    return currentClient;
}

/**
 * Create an object for JET Client
 * @returns {object}
 * @constructor
 */
function F3JetClient() {
    var currentClient = F3ClientBase();

    /**
     * Description of method setCustomerAddressFields
     * @param {nlobjRecord} rec
     * @return {nlobjRecord}
     */
    currentClient.setCustomerAddressFields = function (rec) {
        Utility.logDebug('F3JetClient', 'setCustomerAddressFields');
        return rec;
    };

    return currentClient;
}

// var client = F3ClientFactory.createClient('Jet');