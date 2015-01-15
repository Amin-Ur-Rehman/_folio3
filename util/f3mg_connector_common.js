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
                var postData = {"isFetchCode": true, "data": JSON.stringify({"orderIncrementId": orderIncrementId})};
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

            this.removeAllLineItems(rec, 'addressbook');

            for (var i in addresses) {
                if (addresses[i].is_default_billing == true && addresses[i].is_default_shipping == true) {
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
        }
    };
})();