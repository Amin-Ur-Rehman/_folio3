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
                dummyItemRec.setFieldValue('displayname', ConnectorConstants.CurrentStore.entitySyncInfo.item.displayname);
                dummyItemRec.setFieldValue('incomeaccount', ConnectorConstants.CurrentStore.entitySyncInfo.item.incomeaccount);
                dummyItemRec.setFieldValue('cogsaccount', ConnectorConstants.CurrentStore.entitySyncInfo.item.cogsaccount);
                dummyItemRec.setFieldValue('assetaccount', ConnectorConstants.CurrentStore.entitySyncInfo.item.assetaccount);
                //dummyItemRec.setFieldValue('includechildren', 'T'); doesn't exist
                //dummyItemRec.setFieldValue('taxschedule', '1');
                //dummyItemRec.setLineItemValue('price1', 'price_1_', 1, 0);
                dummyItemId = nlapiSubmitRecord(dummyItemRec, true, true);
            } catch (ex) {
                Utility.logException('ConnectorCommon.createDummyItemInNS', ex);
            }
            return dummyItemId;
        },
        getShippingCarrierAndMethod2: function (shippingDescription) {
            return ConnectorConstants.NSToMGShipMap[shippingDescription] || '';
        },
        isDevAccount: function () {
            var ctx = nlapiGetContext();

            if (ctx.getCompany() === 'TSTDRV1228763') {
                return true;
            }
            return false;
        },
        getOrderClass: function (storeId) {
            if (storeId.toString() === '1') {
                // space store id  on  magento = 1
                return '3';//Space
            }
            if (storeId.toString() === '7') {
                // live science store id  on  magento = 7
                return '2';//LiveScience
            }
            if (storeId.toString() === '6') {
                // hermen street store id  on  magento = 6
                return '27';//Herman Street
            }
            if (storeId.toString() === '5') {
                //  toms hardware store id  on  magento = 5
                return '31';// BOM : Tom's Hardware
            }
            return '';
        },
        setAddressV2: function (rec, address, isShipAddr, isBillAddr) {
            var addr = '';

            if (isShipAddr == isBillAddr) {
                addr = 'Address';
            } else if (isShipAddr == 'T') {
                //rec.setFieldValue('shipaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone + '\n Street : ' + address.street + '\n Country : ' + address.country + '\n Zip : ' + address.zip + '\n State : ' + address.state + '\n City : ' + address.city);
                rec.setFieldValue('shipaddress', this.getFormattedAddress(address));
            }
            else if (isBillAddr == 'T') {
                //rec.setFieldValue('billaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone + '\n Street : ' + address.street + '\n Country : ' + address.country + '\n Zip : ' + address.zip + '\n State : ' + address.state + '\n City : ' + address.city);
                rec.setFieldValue('billaddress', this.getFormattedAddress(address));
            }

            var stAddr = address.street;

            var stAddr1;
            var stAddr2;

            var subStr;
            var index;
            if (stAddr.length > 150) {
                subStr = stAddr.substring(0, 150);
                index = subStr.lastIndexOf(' ');

                stAddr1 = stAddr.substring(0, index);
                stAddr2 = stAddr.substring(index + 1);
            } else {
                stAddr1 = stAddr;
                stAddr2 = '';
            }


            return rec;

            /*address.company=nlapiSelectValue(addresses[i],'company');

             address.region=nlapiSelectValue(addresses[i],'region');
             address.region_id=nlapiSelectValue(addresses[i],'region_id');
             address.street=nlapiSelectValue(addresses[i],'street');*/
        },
        setPayment: function (rec, payment) {
            if (payment.method.toString() === 'ccsave') {
                rec.setFieldValue('paymentmethod', this.getCCType(payment.ccType));
                rec.setFieldValue('ccapproved', 'T');
                return;
            }
            //paypal_direct
            if (payment.method.toString() === 'paypal_direct') {
                rec.setFieldValue('paymentmethod', this.getCCType(payment.ccType));
                rec.setFieldValue('pnrefnum', payment.authorizedId);
                rec.setFieldValue('ccapproved', 'T');
                return;
            }
            //paypal_express
            if (payment.method.toString() === 'paypal_express') {
                rec.setFieldValue('paymentmethod', '7');// paypal
                rec.setFieldValue('paypalauthid', payment.authorizedId);// paypal
                return;
            }
        },
        getNetsuiteProductIdByMagentoIdViaMap: function (netsuiteMagentoProductMap, magentoID) {

            // MagentoID contains Array of Object
            var netsuiteId = '';
            var isSerial = '';
            var retObj = {};
            for (var x = 0; x < netsuiteMagentoProductMap.length; x++) {

                if (netsuiteMagentoProductMap[x].magentoID == magentoID) {
                    netsuiteId = netsuiteMagentoProductMap[x].internalId;
                    isSerial = netsuiteMagentoProductMap[x].isSerialItem;
                    retObj.netsuiteId = netsuiteId;
                    retObj.isSerial = isSerial;
                    break;
                }

            }
            retObj.netsuiteId = netsuiteId;
            retObj.isSerial = isSerial;
            return retObj;

        },
        getCouponCode: function (orderIncrementId) {
            try {
                var postData = {
                    "isFetchCode": true,
                    "data": JSON.stringify({"orderIncrementId": orderIncrementId})
                };
                var response = nlapiRequestURL('<TODO: URL>', postData).getBody();
                var data = JSON.parse(response);
                Utility.logDebug('getCouponCode: data', JSON.stringify(data));
                if (data.status) {
                    return data.couponCode;
                } else {
                    if (data.error) {
                        Utility.logDebug('Server Response getCouponCode', data.error);
                    }
                }
            } catch (ex) {
                Utility.logException('ConnectorCommon.getCouponCode', ex);
            }
            return '';
        },
        getFormattedAddress: function (address) {
            var templateArray = {};
            templateArray.ALL = '<$firstname$> <$lastname$>\n<$street$>\n<$city$> <$state$> <$zip$>';
            //template_array['US'] = '<$attention$>\n<$addressee$>\n<$addr1$>\n<$addr2$>\n<$addr3$>\n<$city$> <$state$> <$zip$>\n<$country$>';
            var template = templateArray.ALL;
            if (Utility.isBlankOrNull(template)) {
                template = '<$firstname$> <$lastname$>\n<$street$>\n<$city$> <$state$> <$zip$>';
            }

            var val;

            val = address.firstname || '';
            template = template.replace('<$firstname$>', val);
            val = address.lastname || '';
            template = template.replace('<$lastname$>', val);
            val = address.street || '';
            template = template.replace('<$street$>', val);
            val = address.city || '';
            template = template.replace('<$city$>', val);
            val = address.state || '';

            if (address.country === 'US' || address.country === 'CA') {
                val = this.getStateShortName(val) || '';
            }

            template = template.replace('<$state$>', val);
            val = address.zip || '';
            template = template.replace('<$zip$>', val);

            template = template.replace(/<\$.*?\$>/g, '');
            template = template.replace(/(\n){2}/g, '\n');
            template = template.replace(/\n\s*/g, '\n');
            while (template.indexOf('\n') == 0) {
                template = template.substring(1);
            }

            return template;
        },
        getStateShortName: function (stateName) {
            stateName += '';
            for (var i in US_CA_States) {
                if (i.toLowerCase() === stateName.toLowerCase()) {
                    return US_CA_States[i];
                }
            }
            return stateName;
        },
        getCCType: function (ccType) {
            ccType += '';
            // Visa
            if (ccType === '001' || ccType === '0001' || ccType === 'VI') {
                return '5';
            }
            // Master Card
            if (ccType === '002' || ccType === '0002' || ccType === 'MC') {
                return '4';
            }
            // American Express
            if (ccType === '003' || ccType === '0003' || ccType === 'AE') {
                return '6';
            }
            // Discover
            if (ccType === '004' || ccType === '0004' || ccType === 'DI') {// Diners in Magento
                return '3';// Discover
            }
            return '';
        },
        isOrderSynced: function (orderId, storeId) {
            var magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
            var magentoSyncId = 'custbody_magentosyncdev';
            var fils = [];
            fils.push(new nlobjSearchFilter(ConnectorConstants.Transaction.Fields.MagentoStore, null, 'is', storeId, null));
            fils.push(new nlobjSearchFilter(magentoIdId, null, 'is', orderId, null));
            fils.push(new nlobjSearchFilter(magentoSyncId, null, 'is', 'T', null));
            var res = nlapiSearchRecord('transaction', null, fils, null);

            if (res && res.length > 0) {
                return true;
            }
            return false;
        },
        getUpdateDate: function (days) {
            var currentDate = new Date();
            var soUpdateDate;
            soUpdateDate = nlapiAddDays(currentDate, days);
            //soUpdateDate=addZeroes(soUpdateDate.getDate(),2) + '-' + addZeroes((soUpdateDate.getMonth()+1),2) + '-' +  soUpdateDate.getFullYear() + ' ' + soUpdateDate.getHours()  + ':'+ soUpdateDate.getMinutes() + ':' + '00';
            soUpdateDate = soUpdateDate.getFullYear() + '-' + Utility.addZeroes((soUpdateDate.getMonth() + 1), 2) + '-' + Utility.addZeroes(soUpdateDate.getDate(), 2) + ' ' + Utility.addZeroes(soUpdateDate.getHours(), 2) + ':' + Utility.addZeroes(soUpdateDate.getMinutes(), 2) + ':' + '00';

            return soUpdateDate
        },
        setAddresses: function (rec, addresses) {
            Utility.logDebug('in setAddresses() start', addresses.toSource());

            //this.removeAllLineItems(rec, 'addressbook');

            for (var i in addresses) {
                if (addresses[i].is_default_billing && addresses[i].is_default_shipping) {
                    rec = this.setAddress(rec, addresses[i], 'T', 'T');
                    break;
                }
                else if (addresses[i].is_default_billing == true) {
                    rec = this.setAddress(rec, addresses[i], 'F', 'T');
                } else if (addresses[i].is_default_shipping == true) {
                    rec = this.setAddress(rec, addresses[i], 'T', 'F');
                }
            }
            Utility.logDebug('DEBUG', 'in setAddresses() end');
            return rec;
        },
        removeAllLineItems: function (rec, sublist) {
            if (rec) {
                var totalLines = rec.getLineItemCount(sublist);
                for (var line = totalLines; line >= 1; line--) {
                    rec.removeLineItem(sublist, line);
                }
            }
        },
        setAddress: function (rec, address, isShipAddr, isBillAddr) {
            Utility.logDebug('in setAddress() start', address.toSource());
            var addr = '';

            if (isShipAddr == isBillAddr) {
                addr = 'Address';
            } else if (isShipAddr == 'T') {
                addr = 'Shipping Address';
            }
            else if (isBillAddr == 'T') {
                addr = 'Billing Address';
            }

            var stAddr = address.street;

            var stAddr1;
            var stAddr2;

            var subStr;
            var index;
            if (stAddr.length > 150) {
                subStr = stAddr.substring(0, 150);
                index = subStr.lastIndexOf(' ');

                stAddr1 = stAddr.substring(0, index);
                stAddr2 = stAddr.substring(index + 1);
            } else {
                stAddr1 = stAddr;
                stAddr2 = '';
            }

            // check if address already exist
            address.addressee = address.firstname + ' ' + address.lastname;
            address.zip = address.postcode;
            address.addr1 = stAddr1;
            address.addr2 = stAddr2;
            if (ConnectorCommon.addressExists(address, isBillAddr, isShipAddr, rec)) {
                return;
            }


            rec.setFieldValue('phone', address.telephone);
            rec.selectNewLineItem('addressbook');

            rec.setCurrentLineItemValue('addressbook', 'label', addr);
            rec.setCurrentLineItemValue('addressbook', 'defaultshipping', isShipAddr);
            rec.setCurrentLineItemValue('addressbook', 'defaultbilling', isBillAddr);
            rec.setCurrentLineItemValue('addressbook', 'addr1', stAddr1);
            rec.setCurrentLineItemValue('addressbook', 'addr2', stAddr2);
            rec.setCurrentLineItemValue('addressbook', 'addressee', address.firstname + ' ' + address.lastname);
            rec.setCurrentLineItemValue('addressbook', 'phone', address.telephone);
            rec.setCurrentLineItemValue('addressbook', 'country', address.country_id);
            rec.setCurrentLineItemValue('addressbook', 'zip', address.postcode);
            try {
                rec.setCurrentLineItemValue('addressbook', 'state', address.region);
            } catch (ex) {
                Utility.logException('State is a select Field', ex);
                rec.setCurrentLineItemText('addressbook', 'state', address.region);
            }

            rec.setCurrentLineItemValue('addressbook', 'city', address.city);

            rec.commitLineItem('addressbook');

            Utility.logDebug('DEBUG', 'in setAddress() start');
            return rec;
        },
        getMagentoMaxCustomerIdNetsuite: function (enviornment) {
            var cols = new Array();
            var maxValue;
            var result = new Object();

            var magentoCustomerIdId;

            if (enviornment == 'production') {
                magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
            } else {
                magentoCustomerIdId = ConnectorConstants.Entity.Fields.MagentoId;
            }

            try {

                result.errorMsg = '';

                cols.push(new nlobjSearchColumn(magentoCustomerIdId, null, 'max'));


                var recs = nlapiSearchRecord('customer', null, null, cols);

                if (recs && recs.length > 0) {
                    maxValue = recs[0].getValue(magentoCustomerIdId, null, 'max');
                }
                else
                    maxValue = 0;

                if (maxValue == null || maxValue == '')
                    maxValue = 0;

                result.data = maxValue;

            } catch (ex) {
                result.errorMsg = ex.toString();
            }

            return result;
        },
        getNetsuiteProductIdsByMagentoIds: function (magentoIds, enviornment) {
            var cols = [];
            var filterExpression = "";
            var resultArray = [];
            var result = {};
            var magentoIdId;

            if (enviornment === 'production') {
                magentoIdId = 'custitem_magentoid';
            } else {
                //magentoIdId = 'custitem_magento_sku';
                magentoIdId = ConnectorConstants.Item.Fields.MagentoId;
            }

            result.errorMsg = '';

            try {
                filterExpression = "[[";
                for (var x = 0; x < magentoIds.length; x++) {
                    // multiple store handling
                    var magentoIdForSearching = ConnectorCommon.getMagentoIdForSearhing(ConnectorConstants.CurrentStore.systemId, magentoIds[x].product_id);
                    filterExpression = filterExpression + "['" + magentoIdId + "','contains','" + magentoIdForSearching + "']";
                    if ((x + 1) < magentoIds.length) {
                        filterExpression = filterExpression + ",'or' ,";
                    }
                }

                filterExpression = filterExpression + ']';
                filterExpression += ',"AND",["type", "anyof", "InvtPart", "NonInvtPart"]]';
                Utility.logDebug(' filterExpression', filterExpression);
                filterExpression = eval(filterExpression);
                cols.push(new nlobjSearchColumn(magentoIdId, null, null));

                var recs = nlapiSearchRecord('item', null, filterExpression, cols);

                if (recs && recs.length > 0) {
                    for (var i = 0; i < recs.length; i++) {
                        var obj = {};
                        obj.internalId = recs[i].getId();
                        // multiple store handling
                        var magentoIdObjArr = !!recs[i].getValue(magentoIdId) ? JSON.parse(recs[i].getValue(magentoIdId)) : [];
                        obj.magentoID = this.getMagentoIdFromObjArray(magentoIdObjArr, ConnectorConstants.CurrentStore.systemId);
                        resultArray[resultArray.length] = obj;
                    }
                }
                result.data = resultArray;
            } catch (ex) {
                Utility.logException('Error in getNetsuiteProductIdByMagentoId', ex);
                result.errorMsg = ex.toString();
            }
            return result;
        },
        // Don't use yet
        getShippingCarrierAndMethod: function (shipmentMethod) {
            var methodObj = {};
            var methodArr = (shipmentMethod + '').split('_');
            if (methodArr.length > 0) {
                switch (methodArr[0]) {
                    case 'royalmail':
                        switch (methodArr[1]) {
                            case 'firstclassrecordedsignedfor':
                                methodObj.method = '2707';
                                break;
                            case 'secondclassrecordedsignedfor':
                                methodObj.method = '2707';
                                break;
                            default :
                                methodObj.method = '2707';
                        }
                        break;
                    /*case 'ups':
                     methodObj.carrier = methodArr[0];
                     switch (methodArr[1]) {
                     case 'GND':
                     methodObj.method = '1837';// UPS Ground
                     break;
                     case '3DS':
                     methodObj.method = '1846';// UPS 3 Dyas Select
                     break;
                     case '2AD':
                     methodObj.method = '1845';// UPS 2nd Day Air
                     break;
                     case '1DA':
                     methodObj.method = '1838';// UPS Next Day Air
                     break;
                     default :
                     methodObj.method = '1837'; // UPS Ground
                     }
                     break;*/
                    case 'flatrate':
                        methodObj.carrier = '';
                        methodObj.method = '2707';// Royal Mail (Rep. of Ireland)
                        break;
                    case 'freeshipping':
                        methodObj.carrier = '';
                        methodObj.method = '2707';
                        break;
                    default :
                        methodObj.carrier = '';
                        methodObj.method = '2707';
                }
            }

            return methodObj;
        },
        // Don't use yet
        generateErrorEmail: function (message, configuration, type) {
            Utility.logDebug('Error', 'Email Sent');
            var author = -5;
            var recipient = '';
            recipient = 'zahmed@folio3.com'; // TODO: will change for production account
            var subject = '';

            if (type == 'item')
                subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Item';
            else if (type == 'customer')
                subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Customer';
            else if (type == 'order')
                subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Order';


            var body = message;

            if (recipient == '') {
                Utility.logDebug('DEBUG', 'Emails can not send. Recipient is Empty.');
                return;
            }

            try {
                //nlapiSendEmail(author, recipient, subject, body);
            } catch (ex) {
                Utility.logException('Error in generating email./n', ex);
            }

        },
        // Don't use yet
        getFulfillments: function (enviornment) {
            var filters = [];
            var cols = [];
            var arr = [];
            var result = {};
            var magentoIdId;
            var magentoSyncId;
            var magentoFuflillmentIdId;
            var magentoFuflillmentSyncId;

            if (enviornment == 'production') {
                magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
                magentoSyncId = 'custbody_magentosync';
                magentoFuflillmentIdId = 'custbody_magentoffid';
                magentoFuflillmentSyncId = 'custbody_magentoffsync';
            } else {
                magentoIdId = ConnectorConstants.Transaction.Fields.MagentoId;
                magentoSyncId = 'custbody_magentosyncdev';
                magentoFuflillmentIdId = 'custbody_magentoffiddev';
                magentoFuflillmentSyncId = 'custbody_magentoffsyncdev';
            }

            filters.push(new nlobjSearchFilter(magentoSyncId, 'appliedtotransaction', 'is', 'T', null));   // Ready for Magento Sync
            filters.push(new nlobjSearchFilter(magentoIdId, 'appliedtotransaction', 'isnotempty', null, null));
            filters.push(new nlobjSearchFilter(magentoFuflillmentSyncId, null, 'is', 'F', null));
            filters.push(new nlobjSearchFilter(magentoFuflillmentIdId, null, 'isempty', null, null));
            filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T', null));

            cols.push(new nlobjSearchColumn(magentoIdId, 'appliedtotransaction', null));

            result.errorMsg = '';

            try {
                var recs = nlapiSearchRecord('itemfulfillment', null, filters, cols);
                if (recs && recs.length > 0) {
                    for (var x = 0; x < recs.length; x++) {

                        /*var itemFulFillmentRec = nlapiLoadRecord('itemfulfillment',recs[x].getId());
                         var itemsLength=itemFulFillmentRec.getLineItemCount('item');
                         var itemsArr=new Array();

                         for(var line=1;line<=itemsLength;line++){
                         var tempItem={};
                         tempItem['itemId']=itemFulFillmentRec.getLineItemValue('item','item',line);
                         tempItem['itemQty']=itemFulFillmentRec.getLineItemValue('item','quantity',line);
                         itemsArr.push(tempItem);
                         }
                         */

                        var obj = {};
                        obj.internalId = recs[x].getId();
                        obj.magentoSOId = recs[x].getValue(magentoIdId, 'appliedtotransaction');
                        obj.magentoId = recs[x].getValue(magentoIdId) ? recs[x].getValue(magentoIdId) : '';

                        arr[arr.length] = obj;
                    }

                    result.data = arr;
                }

            } catch (ex) {

                result.errorMsg = ex.toString();

            }

            return result;
        },
        // Don't use yet
        updateFulfillmentsMagentoID: function (internalId, magentoID, sync, enviornment) {
            Utility.logDebug('Enter in updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);

            var magentoFulfillmentIdId;
            var magentoFulfillmentSyncId;

            if (enviornment === 'production') {
                magentoFulfillmentIdId = 'custbody_magentoffid';
                magentoFulfillmentSyncId = 'custbody_magentoffsync';
            } else {
                magentoFulfillmentIdId = 'custbody_magentoffiddev';
                magentoFulfillmentSyncId = 'custbody_magentoffsyncdev';
            }

            var rec = nlapiLoadRecord('itemfulfillment', internalId, null);

            rec.setFieldValue(magentoFulfillmentIdId, magentoID);
            rec.setFieldValue(magentoFulfillmentSyncId, sync);

            try {
                nlapiSubmitRecord(rec);
                Utility.logDebug('Exit from updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);
                return true;

            } catch (ex) {
                Utility.logException('updateFulfillmentsMagentoID', ex);
                return false;
            }
        },
        // Don't use yet
        getSystemConfiguration: function () {
            var config = {};
            var result = {};
            var configRec;

            result.errorMsg = '';

            try {
                configRec = nlapiLoadConfiguration('accountingpreferences');
            } catch (ex) {
                Utility.logException('Reading System Configuration', ex);
                result.errorMsg = 'Reading System Configuration -- ' + ex.message;
                return result;
            }

            config.unshippedinvoices = configRec.getFieldValue('unshippedinvoices');

            result.systemConfiguration = config;
            return result;
        },
        // Don't use yet
        createInvoice: function (id, invoiceNum) {
            var result = {};
            var rec;

            result.errorMsg = '';

            try {
                rec = nlapiTransformRecord('salesorder', id, 'invoice');
                rec.setFieldValue('tranid', invoiceNum);
                result.invoiceId = nlapiSubmitRecord(rec);
            } catch (ex) {
                Utility.logException('Creating Invoice', ex);
                result.errorMsg = 'Creating Invoice -- ' + ex.message;
                return result;
            }
            return result;
        },
        // Don't use yet
        createCustomerPayment: function (id) {
            var result = {};
            var rec;

            result.errorMsg = '';

            try {
                rec = nlapiTransformRecord('invoice', id, 'customerpayment');
                // rec.setFieldValue('paymentmethod',12);
                result.customerPaymentId = nlapiSubmitRecord(rec);

            } catch (ex) {
                Utility.logException('Creating Customer Payment', ex);
                result.errorMsg = 'Creating Customer Payment -- ' + ex.message;
                return result;
            }
            return result;
        },

        getAuthorizedId: function (statusHistory) {
            var authorizedId = '';

            for (var i = 0; i < statusHistory.length; i++) {
                var comment = nlapiSelectValue(statusHistory[i], 'comment') + '';
                if (comment.indexOf('Captured amount') !== -1 && comment.indexOf('Transaction ID:') !== -1) {
                    authorizedId = comment.substring(comment.indexOf('"') + 1, comment.lastIndexOf('"'));
                    break;
                }
            }

            return authorizedId;
        },
        isSame: function (shippingAddress, billingAddress) {
            if (shippingAddress.city + '' === billingAddress.city + '' &&
                shippingAddress.country + '' === billingAddress.country + '' &&
                shippingAddress.firstname + '' === billingAddress.firstname + '' &&
                shippingAddress.lastname + '' === billingAddress.lastname + '' &&
                shippingAddress.zip + '' === billingAddress.zip + '' &&
                shippingAddress.state + '' === billingAddress.state + '' &&
                shippingAddress.region_id + '' === billingAddress.region_id + '' &&
                shippingAddress.street + '' === billingAddress.street + '' &&
                shippingAddress.phone + '' === billingAddress.phone + '') {
                return true;
            }

            return false;
        },
        /**
         * method is related to the cyber source's date format
         * subtract 6 hours from date
         * @param {date string} dateString
         * @return {string}
         */
        getDate: function (dateString) {
            //accept format = "2014-07-09 20:18:14";
            if (dateString) {

                var b = dateString.split(' ');
                var c = b[0].split('-');
                var t = b[1].split(':');

                var date = new Date(c[0], c[1] - 1, c[2], t[0], t[1], t[2], 0);//var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
                //"2014-07-09 20:18:14"

                date = new Date(date.getTime() - (6 * 60 * 60 * 1000));// -6 hr

                var d = date.getFullYear() + '-' +
                    Utility.convertIntToDigit(date.getMonth() + 1, 2) + '-' +
                    Utility.convertIntToDigit(date.getDate(), 2) + ' ' +
                    Utility.convertIntToDigit(date.getHours(), 2) + ':' +
                    Utility.convertIntToDigit(date.getMinutes(), 2) + ':' +
                    Utility.convertIntToDigit(date.getSeconds(), 2);

                d = date.getFullYear() + Utility.convertIntToDigit(date.getMonth() + 1, 2) + Utility.convertIntToDigit(date.getDate(), 2);

                return d;
            }
        },
        getProductMagentoID: function (sessionID, product) {
            var xml = XmlUtility.getProductListXML(sessionID, product);
            var response = XmlUtility.validateGetIDResponse(XmlUtility.soapRequestToMagento(xml));
            if (response.status) {
                return response.result;
            }
        },
        getLastModifiedDate: function () {
            var res = InventorySyncScript.lookup(new nlobjSearchFilter(InventorySyncScript.FieldName.Name, null, 'is', 'Last Run Date', null));
            var dateTime;
            if (res.length > 0) {
                dateTime = res[0].getValue(InventorySyncScript.FieldName.LastRunDateTime) + '';
                dateTime = dateTime.toLowerCase();
                dateTime = nlapiDateToString(nlapiStringToDate(dateTime, 'datetime'), 'datetime');
            }
            if (!dateTime) {
                dateTime = '1/12/2014 6:00 pm';
            }
            return dateTime;
        },
        /**
         * Get Magento Id for setting in multiselect Field
         * @param storeId
         * @param magentoId
         */
        getMagentoIdForSearhing: function (storeId, magentoId) {
            var magentoFormattedId = ConnectorConstants.MagentoIdFormat;
            magentoFormattedId = magentoFormattedId.replace('<STOREID>', storeId);
            magentoFormattedId = magentoFormattedId.replace('<MAGENTOID>', magentoId);
            return magentoFormattedId;
        },
        /**
         * Getting magento id from array of objects with specified storeId
         * @param {object[],[]} magentoIdObjArr
         * @param {string} storeId
         * @return {string} Return magento id
         */
        getMagentoIdFromObjArray: function (magentoIdObjArr, storeId) {
            var magentoId = null;
            for (var i in magentoIdObjArr) {
                var magentoIdObj = magentoIdObjArr[i];
                if (magentoIdObj.StoreId === storeId) {
                    magentoId = magentoIdObj.MagentoId;
                    break;
                }
            }
            return magentoId;
        },
        getMagentoIdObjectArrayString: function (storeId, magentoId, type, existingId) {

            var magentoIdObjArr = [];

            if (type === 'create') {
                var obj1 = {};

                obj1.StoreId = storeId;
                obj1.MagentoId = magentoId;
                magentoIdObjArr.push(obj1);
            }
            else if (type === 'update') {
                if (!!existingId) {
                    var isAlreadyExist = false;
                    magentoIdObjArr = JSON.parse(existingId);
                    for (var i in magentoIdObjArr) {
                        var tempMagentoIdObj = magentoIdObjArr[i];
                        if (tempMagentoIdObj.StoreId === storeId) {
                            isAlreadyExist = true;
                            tempMagentoIdObj.MagentoId = magentoId;
                        }
                    }
                    if (!isAlreadyExist) {
                        var obj2 = {};

                        obj2.StoreId = storeId;
                        obj2.MagentoId = magentoId;
                        magentoIdObjArr.push(obj2);
                    }
                } else {
                    var obj3 = {};

                    obj3.StoreId = storeId;
                    obj3.MagentoId = magentoId;
                    magentoIdObjArr.push(obj3);
                }
            }

            return JSON.stringify(magentoIdObjArr);
        },
<<<<<<< HEAD
        getMagentoIdFromObjArray: function (magentoIdObjArr, storeId) {
            var magentoId = null;
            for (var i in magentoIdObjArr) {
                var magentoIdObj = magentoIdObjArr[i];
                if (magentoIdObj.StoreId === storeId) {
                    magentoId = magentoIdObj.MagentoId;
                    break;
                }
            }
            return magentoId;
        },
        getScannedAddressForMagento: function (netsuiteAddressObject) {

            var result = true;
            var magentoStateCode;

            nlapiLogExecution('debug','netsuiteAddressObject',JSON.stringify(netsuiteAddressObject));

            if (!!netsuiteAddressObject) {

                if (isBlankOrNull(netsuiteAddressObject.firstname) || isBlankOrNull(netsuiteAddressObject.lastname) || isBlankOrNull(netsuiteAddressObject.street1) || isBlankOrNull(netsuiteAddressObject.city) || isBlankOrNull(netsuiteAddressObject.country) || isBlankOrNull(netsuiteAddressObject.telephone)) {
                    result = false;

                    nlapiLogExecution('debug','block-1');
                }
                else {
                    //Will be handled via Custom Record to set the countries for which State is mandatory
                    if (netsuiteAddressObject.country == 'US' || netsuiteAddressObject.country == 'CA') {
                        if (isBlankOrNull(netsuiteAddressObject.region)) {
                            result = false;

                            nlapiLogExecution('debug','block-2');

                        }
                        else {

                            nlapiLogExecution('debug','block-3-a' ,netsuiteAddressObject.region );

                            magentoStateCode = FC_ScrubHandler.scrubValue('{"lookup": {"value":"State"}}', netsuiteAddressObject.region);

                            nlapiLogExecution('debug','block-3-b' ,netsuiteAddressObject.region );

                            if (!isBlankOrNull(magentoStateCode)) {
                                netsuiteAddressObject.region = magentoStateCode;
                                netsuiteAddressObject.region_text = '';
                            }
                            else {
                                result = false;
                                nlapiLogExecution('debug','block-3-c');

                            }
                        }

                    }
                    else
                    {
                        netsuiteAddressObject.region='';

                    }

                }


            }
            else
                result = false;


            if (!result)
                netsuiteAddressObject = null;


            nlapiLogExecution('debug','netsuiteAddressObject scanned',JSON.stringify(netsuiteAddressObject));


            return netsuiteAddressObject;


=======
        getRecordTypeOfTransaction: function (id) {
            var type = null;
            if (id) {
                var fils = [];
                fils.push(new nlobjSearchFilter('mainline', null, 'is', 'T', null));
                fils.push(new nlobjSearchFilter('internalid', null, 'anyof', [id], null));

                var result = nlapiSearchRecord('transaction', null, fils, null) || [];

                if (result.length > 0) {
                    type = result[0].getRecordType();
                }
            }
            return type;
        },
        // get array of items exist in fulfillment
        getFulfillmentItems: function () {
            var itemsIdArr = [];
            var itemsQuantity = nlapiGetLineItemCount('item');
            for (var line = 1; line <= itemsQuantity; line++) {
                var itemId = nlapiGetLineItemValue('item', 'item', line);
                if (itemsIdArr.indexOf(itemId) === -1) {
                    itemsIdArr.push(itemId);
                }
            }
            return itemsIdArr;
        },
        /**
         * get magento item ids mapping
         * @return {object}
         */
        getMagentoItemIds: function () {
            var magentoItemIds = {};
            // get all items data exist in fulfillment
            var fulfillmentItems = this.getFulfillmentItems();

            var fils = [];
            var cols = [];
            var result;

            fils.push(new nlobjSearchFilter('internalid', null, 'anyof', fulfillmentItems, null));
            cols.push(new nlobjSearchColumn(ConnectorConstants.Item.Fields.MagentoId, null, null));

            result = nlapiSearchRecord('item', null, fils, cols) || [];

            if (result.length > 0) {
                for (var i in result) {
                    var magentoId = result[i].getValue(ConnectorConstants.Item.Fields.MagentoId);
                    magentoId = !Utility.isBlankOrNull(magentoId) ? JSON.parse(magentoId) : [];
                    magentoId = ConnectorCommon.getMagentoIdFromObjArray(magentoId, ConnectorConstants.CurrentStore.systemId);
                    if (!Utility.isBlankOrNull(magentoId)) {
                        magentoItemIds[result[i].getId()] = magentoId;
                    }
                }
            }
            return magentoItemIds;
        },

        // functions related to cybersource - need to move respective library
        getCyberSourceCaptureXML: function (magentoSO) {
            // required merchant id, secret key, refrence code, items and quantity mapping, currency, authentication id
            var xml = '';
            xml += '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:schemas-cybersource-com:transaction-data-1.104">';
            xml += '    <soapenv:Header>';
            xml += '        <wsse:Security soapenv:mustUnderstand="1" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">';
            xml += '            <wsse:UsernameToken>';
            xml += '                <wsse:Username>' + cyberSouceConfig.merchantId + '</wsse:Username>';
            xml += '                <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wssusername-token-profile-1.0#PasswordText">' + cyberSouceConfig.secretId + '</wsse:Password>';
            xml += '            </wsse:UsernameToken>';
            xml += '        </wsse:Security>';
            xml += '    </soapenv:Header>';
            xml += '    <soapenv:Body>';
            xml += '        <urn:requestMessage xmlns="urn:schemas-cybersource-com:transaction-data-1.104">';
            xml += '            <urn:merchantID>' + cyberSouceConfig.merchantId + '</urn:merchantID>';
            var soId = magentoSO.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoId);
            xml += '           <urn:merchantReferenceCode>' + soId + '</urn:merchantReferenceCode>';

            //xml += '<urn:clientApplication>Credit Card Settlement</urn:clientApplication>';

            // magentoItemIds is a global object contains the magento item id
            var itemId = '0';
            var itemQty = '1';
            var unitPrice = magentoSO.getFieldValue('total');
            xml += '            <urn:item id="' + itemId + '">';
            xml += '                <urn:unitPrice>' + unitPrice + '</urn:unitPrice>';
            xml += '                <urn:quantity>' + itemQty + '</urn:quantity>';
            xml += '            </urn:item>';

            xml += '            <urn:purchaseTotals>';
            xml += '                <urn:currency>USD</urn:currency>';
            xml += '            </urn:purchaseTotals>';

            xml += '<urn:ccCaptureService run="true">';
            xml += '<urn:authRequestID>' + magentoSO.getFieldValue('pnrefnum') + '</urn:authRequestID>';
            xml += '</urn:ccCaptureService>';

            xml += '        </urn:requestMessage>';
            xml += '    </soapenv:Body>';
            xml += '</soapenv:Envelope>';

            return xml;
        },
        // load the configuration from custom record and return as an object
        getCyberSourceConfiguration: function () {
            var config = {};
            var rec;
            try {
                rec = nlapiLoadRecord('customrecord_cybersource_configuration', 1);
                config.merchantId = rec.getFieldValue('custrecord_csc_merchant_id');
                config.secretId = rec.getFieldValue('custrecord_csc_secret_key');
                config.reportingUser = rec.getFieldValue('custrecord_csc_reporting_user');
                config.reportingUserPass = rec.getFieldValue('custrecord_csc_reporting_user_pass');
            } catch (ex) {
                nlapiLogExecution('DEBUG', 'getCyberSourceConfiguration', ex.toString());
            }
            return config;
        },
        isValidResponse: function (resXML) {
            var faultCode = nlapiSelectValue(resXML, "soap:Envelope/soap:Body/soap:Fault/faultcode");
            var faultString = nlapiSelectValue(resXML, "soap:Envelope/soap:Body/soap:Fault/faultstring");

            if (faultCode) {
                nlapiLogExecution('ERROR', 'isValidResponse - faultCode: ' + faultCode, 'faultString: ' + faultString);
                return false;
            }

            return true;
        },
        getCaptureCreditCardRes: function (resXML) {
            //TODO: update if required
            var resObj = {};
            var replyMsg = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage");
            var purchaseTotal = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage/c:purchaseTotals");
            var ccCaptureReply = nlapiSelectNode(resXML, "soap:Envelope/soap:Body/c:replyMessage/c:ccCaptureReply");

            resObj.merchantReferenceCode = nlapiSelectValue(replyMsg, 'c:merchantReferenceCode');
            resObj.requestID = nlapiSelectValue(replyMsg, 'c:requestID');
            resObj.decision = nlapiSelectValue(replyMsg, 'c:decision');
            resObj.reasonCode = nlapiSelectValue(replyMsg, 'c:reasonCode');
            resObj.requestToken = nlapiSelectValue(replyMsg, 'c:requestToken');

            resObj.purchaseTotals = {};
            resObj.purchaseTotals.currency = nlapiSelectValue(purchaseTotal, 'c:currency');

            resObj.ccCaptureReply = {};
            resObj.ccCaptureReply.reasonCode = nlapiSelectValue(ccCaptureReply, 'c:reasonCode');
            resObj.ccCaptureReply.requestDateTime = nlapiSelectValue(ccCaptureReply, 'c:requestDateTime');
            resObj.ccCaptureReply.amount = nlapiSelectValue(ccCaptureReply, 'c:amount');
            resObj.ccCaptureReply.reconciliationID = nlapiSelectValue(ccCaptureReply, 'c:reconciliationID');

            return resObj;
        },
        captureCreditCard: function (magentoSO) {
            nlapiLogExecution('DEBUG', 'In captureCreditCard()');
            var xml = this.getCyberSourceCaptureXML(magentoSO);
            nlapiLogExecution('DEBUG', 'get request xml from getCyberSourceCaptureXML()', xml);
            var resXML = this.soapRequestToCS(xml);
            nlapiLogExecution('DEBUG', 'get response xml from cybersource' + nlapiXMLToString(resXML));

            csResponse = resXML;
            /*if (isValidResponse(resXML)) {
             var captureCreditCardRes = getCaptureCreditCardRes(resXML);
             nlapiLogExecution('DEBUG', 'captureCreditCardRes', JSON.stringify(captureCreditCardRes));
             // set values in fulfillment ???
             }*/
            nlapiLogExecution('DEBUG', 'Out captureCreditCard()');
        },
        soapRequestToCS: function (xml) {
            var res = nlapiRequestURL('https://ics2wstest.ic3.com/commerce/1.x/transactionProcessor/CyberSourceTransaction_1.104.wsdl', xml);
            var responseXML = res.getBody();
            return responseXML;
<<<<<<< HEAD
>>>>>>> 805a7813f40e533f9ecf69ddb9fa19267938c4c4
        }


=======
        },
        /**
         * Check if address exist
         * @param add
         * @param isBilling
         * @param isShipping
         * @param rec
         * @return {boolean}
         */
        addressExists: function (add, isBilling, isShipping, rec) {
            for (var t = 1; t <= rec.getLineItemCount('addressbook'); t++) {
                if (rec.getLineItemValue('addressbook', 'addr1', t) == add.addr1.replace(/"/g, '') &&
                    rec.getLineItemValue('addressbook', 'addr2', t) == add.addr2.replace(/"/g, '') &&
                    rec.getLineItemValue('addressbook', 'addressee', t) == add.addressee.replace(/"/g, '') &&
                    rec.getLineItemValue('addressbook', 'city', t) == add.city.replace(/"/g, '') &&
                    rec.getLineItemValue('addressbook', 'state', t) == add.state.replace(/"/g, '') &&
                    rec.getLineItemValue('addressbook', 'zip', t) == add.zip.replace(/"/g, '')) {
                    if (isShipping === 'T') {
                        rec.setLineItemValue('addressbook', 'defaultshipping', t, isShipping);
                    }
                    if (isBilling === 'T') {
                        rec.setLineItemValue('addressbook', 'defaultbilling', t, isBilling);
                    }
                    return true;
                }
            }
            return false;
        }

>>>>>>> 3e6d506a88a3b540561cda52aaa3c675e5a2a2b5
    };
})();