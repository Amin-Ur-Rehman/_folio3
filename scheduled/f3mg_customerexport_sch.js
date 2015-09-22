var ScheduledScriptConstant = {
    Minutes: 50,
    RemainingUsage: 1000,
    StartTime: (new Date()).getTime()
};

var errorMsg='';

function customerExport() {

    if (MC_SYNC_CONSTANTS.isValidLicense()) {

        // inititlize constants
        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
        var context = nlapiGetContext();
        var customerIds;
        var customerRecord;
        var requsetXML;
        var responseMagento;
        var magentoResposeOnCustomer;
        var usageRemaining;
        var magentoIdObjArrStr;
        var nsCustomerUpdateStatus;
        var customerAddresses;
        var allAddressedSynched;
        var externalSystemArr = [];
        var scannedAddressForMagento;
        var magentoReferences;
        var customerSynched;
        var magentoStoreAndCustomer;



        externalSystemConfig.forEach(function(store) {
            ConnectorConstants.CurrentStore = store;
            var sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);
            if (!sessionID) {
                Utility.logDebug('sessionID', 'sessionID is empty');
                return;
            }
            store.sessionID = sessionID;
            // push store object after getting id for updating items in this store
            externalSystemArr.push(store);

        });

        if (externalSystemArr.length === 0) {
            Utility.logDebug('Customer Export Script', 'Customer Export is not enabled');
            return;
        }


        try {

            //Get ids of all customer which has custentity_magentosync_dev (Magento Sync) field marked No
            customerIds = CUSTOMER.getCustomers();

            //Is Customer(s) Exists for Sync
            if (customerIds != null && customerIds.length > 0) {

                for (var c = 0; c < customerIds.length; c++) {


                    nlapiLogExecution('audit','Customer:' + customerIds[c].internalId +'  S.No:' + c + ' Started');

                    Utility.logDebug('Customer ' + customerIds[c].internalId);
                    errorMsg='';

                    try {
                        externalSystemArr.forEach(function(store) {

                            try {


                                magentoReferences = customerIds[c].magentoCustomerIds;
                                magentoStoreAndCustomer = getStoreCustomerIdAssociativeArray(magentoReferences);

                                //Decide whether to Create or Update Customer
                                if (isBlankOrNull(magentoReferences) || isBlankOrNull(magentoStoreAndCustomer[store.systemId]) || magentoStoreAndCustomer[store.systemId] === '0') {

                                    Utility.logDebug('Customer Create Block ' + magentoReferences);

                                    customerSynched = createCustomerInMagento(customerIds[c], store);

                                    Utility.logDebug('End Create Block ');


                                } else {

                                    Utility.logDebug('Customer Update Block ');

                                    //Update Customer for Current Store
                                    customerSynched = updateCustomerInMagento(customerIds[c], store, magentoStoreAndCustomer[store.systemId], magentoReferences);

                                    Utility.logDebug('End Update Block ');


                                }


                            } catch (ex) {

                                Utility.logDebug('Internal Catch Block, Iternation failed for Customer + Store : ' + customerIds[c].internalId + ' StoreId:' + store.systemId, ex.toString());

                            }

                        });


                        if (customerSynched) {
                            nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoSync(customerIds[c].internalId);
                        }
                        else {

                            if(isBlankOrNull(errorMsg))
                                errorMsg='Unknown Error';

                            CUSTOMER.setCustomerMagentoSync_Error(customerIds[c].internalId, errorMsg);
                        }

                        if (rescheduleIfRequired(null)) {
                            return;
                        }

                    } catch (ex) {

                        CUSTOMER.setCustomerMagentoSync_Error(customerIds[c].internalId,ex.toString());

                        Utility.logDebug('Internal Catch Block, Iternation failed for Customer : ' + customerIds[c].internalId, ex.toString());

                    }

                    nlapiLogExecution('audit','Customer:' + customerIds[c].internalId +'  S.No:' + c + ' Ended');

                }
            }
        } catch (ex) // main Try

        {

            Utility.logDebug('Catch Block', ex.toString());

        }


    }


}


function getStoreCustomerIdAssociativeArray(data) {
    var storeIdCustomerIdArray;
    var associativeArray = [];

    if (!!data) {
        storeIdCustomerIdArray = JSON.parse(data);

        if (!!storeIdCustomerIdArray && storeIdCustomerIdArray.length > 0) {
            for (var i = 0; i < storeIdCustomerIdArray.length; i++) {
                associativeArray[storeIdCustomerIdArray[i].StoreId] = storeIdCustomerIdArray[i].MagentoId;
            }
        }

    }

    return associativeArray;
}


function createCustomerInMagento(nsCustomerObject, store, existingMagentoReferenceInfo) {

    var customerRecord = CUSTOMER.getCustomer(nsCustomerObject.internalId, store);
    var requsetXML;
    var responseMagento;
    var addressSynched;
    var customerSynched = false;
    var createOrUpdateMagentoJSONRef = 'create';



    if (!!customerRecord) {


        requsetXML = CUSTOMER.getMagentoCreateCustomerRequestXML(customerRecord, store.sessionID);
        Utility.logDebug('customer_requsetXML ', requsetXML);
        Utility.logDebug('store_wahaj ', JSON.stringify(store));
        responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'create');
        Utility.logDebug('responseMagento_wahaj ', JSON.stringify(responseMagento));
        if (!!responseMagento && !!responseMagento.status && responseMagento.status) {


            if (!!existingMagentoReferenceInfo)
                createOrUpdateMagentoJSONRef = 'update';

            magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoCustomerId, createOrUpdateMagentoJSONRef, existingMagentoReferenceInfo,customerRecord.password);


            nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr, nsCustomerObject.internalId);

            customerRecord = CUSTOMER.getCustomer(nsCustomerObject.internalId, store);


            //Address Sync
            if (nsCustomerUpdateStatus) {

                customerSynched = createAddressesInMagento(customerRecord, store, responseMagento.magentoCustomerId);
            }

            nlapiSubmitRecord(customerRecord.nsObj);


        } else {
            errorMsg=responseMagento.faultCode + '    ' + responseMagento.faultString;
            Utility.logDebug('errored responseMagento ', responseMagento.faultCode + '    ' + responseMagento.faultString);
        }

    }

    return customerSynched;

}

function updateCustomerInMagento(nsCustomerObject, store, magentoId, existingMagentoReferenceInfo) {

    var customerRecord = CUSTOMER.getCustomer(nsCustomerObject.internalId, store);
    var requsetXML;
    var responseMagento;
    var addressSynched;
    var customerSynched = false;


    if (!!customerRecord) {

        customerRecord.magentoId = magentoId;
        requsetXML = CUSTOMER.getMagentoUpdateCustomerRequestXML(customerRecord, store.sessionID);

        responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'update');

        if (!!responseMagento && !!responseMagento.status && responseMagento.status && responseMagento.updated == "true") {

            //magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, magentoId, 'update', existingMagentoReferenceInfo);

            //nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr, nsCustomerObject.internalId);

            customerRecord = CUSTOMER.getCustomer(nsCustomerObject.internalId, store);


            //if (nsCustomerUpdateStatus) {
                //Address Sync
                customerSynched = updateAddressesInMagento(customerRecord, store, magentoId);
            //}

            nlapiSubmitRecord(customerRecord.nsObj);

        } else {
            errorMsg=responseMagento.faultCode + '    ' + responseMagento.faultString;
            Utility.logDebug('responseMagento ', responseMagento.faultCode + '    ' + responseMagento.faultString);
        }

    }

    return customerSynched;

}


function createAddressesInMagento(customerRecordObject, store, magentoCustomerId) {


    var customerAddresses = CUSTOMER.getNSCustomerAddresses(customerRecordObject);
    var scannedAddressForMagento;
    var requsetXML;
    var responseMagento;
    var allAddressedSynched = true;
    var createOrUpdateMagentoJSONRef = 'create';
    var thisStoreAddressInfo;


    for (var adr = 0; adr < customerAddresses.length; adr++) {

        scannedAddressForMagento = ConnectorCommon.getScannedAddressForMagento(customerAddresses[adr]);

        if (scannedAddressForMagento) {
            allAddressedSynched = createSingleAddressInMagento(customerRecordObject, customerAddresses[adr], (adr + 1), scannedAddressForMagento, magentoCustomerId, store);
        }


    }


    return allAddressedSynched;
}


function updateAddressesInMagento(customerRecordObject, store, magentoCustomerId) {


    var customerAddresses = CUSTOMER.getNSCustomerAddresses(customerRecordObject);
    var scannedAddressForMagento;
    var allAddressedSynched = true;
    var otherStoreAddressInfo;
    var createOrUpdateMagentoJSONRef = 'create';
    var thisStoreAddressInfo;
    var currentAddressStoresInfo;
    var magentoIdStoreRef;


    for (var adr = 0; adr < customerAddresses.length; adr++) {

        scannedAddressForMagento = ConnectorCommon.getScannedAddressForMagento(customerAddresses[adr]);

        if (scannedAddressForMagento) {

            magentoIdStoreRef = customerAddresses[adr].magentoIdStoreRef;
            currentAddressStoresInfo = getStoreCustomerIdAssociativeArray(magentoIdStoreRef);


            if (isBlankOrNull(magentoIdStoreRef) || isBlankOrNull(currentAddressStoresInfo[store.systemId]) || currentAddressStoresInfo[store.systemId] === '0') //Create
            {
                allAddressedSynched = createSingleAddressInMagento(customerRecordObject, customerAddresses[adr], (adr + 1), scannedAddressForMagento, magentoCustomerId, store);

            } else if (currentAddressStoresInfo[store.systemId] !== '-1') {
                //Address Update
                allAddressedSynched = UpdateSingleAddressInMagento(customerRecordObject, customerAddresses[adr], (adr + 1), scannedAddressForMagento, magentoCustomerId, store, currentAddressStoresInfo);
            }


        }

    }


    return allAddressedSynched;


}


function createSingleAddressInMagento(customerRecordObject, customerAddressObj, customerAddressLineNo, scannedAddressForMagento, magentoCustomerId, store) {
    var addressCreated = true;
    var requsetXML;
    var responseMagento;
    var otherStoreAddressInfo;
    var thisStoreAddressInfo;
    var currentAddressSubRecord;
    var createOrUpdateMagentoJSONRef = 'create';

    requsetXML = CUSTOMER.getMagentoCreateAddressRequestXML(scannedAddressForMagento, store.sessionID, magentoCustomerId);

    responseMagento = XmlUtility.validateCustomerAddressExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'create');

    if (!responseMagento.status) {

        errorMsg=errorMsg+'   ' + responseMagento.faultCode + '    ' + responseMagento.faultString; ;
        addressCreated = false;

    } else {

        otherStoreAddressInfo = customerAddressObj.magentoIdStoreRef;

        if (!!isBlankOrNull(otherStoreAddressInfo))
            createOrUpdateMagentoJSONRef = 'update';

        Utility.logDebug('address store info  ', 'store.systemId  ' + store.systemId + '    ' + responseMagento.magentoAddressId + '    ' + createOrUpdateMagentoJSONRef + '    ' + JSON.stringify(otherStoreAddressInfo));


        thisStoreAddressInfo = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoAddressId, createOrUpdateMagentoJSONRef, otherStoreAddressInfo);


        customerRecordObject.nsObj.selectLineItem('addressbook', customerAddressLineNo);

        currentAddressSubRecord = customerRecordObject.nsObj.editCurrentLineItemSubrecord('addressbook', 'addressbookaddress');
        currentAddressSubRecord.setFieldValue(ConnectorConstants.OtherCustom.MagentoId, thisStoreAddressInfo);
        currentAddressSubRecord.commit();

        customerRecordObject.nsObj.commitLineItem('addressbook');

    }


    return addressCreated;
}


function UpdateSingleAddressInMagento(customerRecordObject, customerAddressObj, customerAddressLineNo, scannedAddressForMagento, magentoCustomerId, store, currentAddressStoresInfo) {
    var addressCreated = true;
    var requsetXML;
    var responseMagento;

    requsetXML = CUSTOMER.getMagentoUpdateAddressRequestXML(scannedAddressForMagento, store.sessionID, currentAddressStoresInfo[store.systemId]);

    responseMagento = XmlUtility.validateCustomerAddressExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'update');

    if (!responseMagento.status) {
        errorMsg=errorMsg+'   ' + responseMagento.faultCode + '    ' + responseMagento.faultString; ;
        addressCreated = false;
    }

    return addressCreated;
}


// check if the script is required to be scheduled
function rescheduleIfRequired(params) {
    var context = nlapiGetContext();
    var endTime;
    var minutes;

    endTime = (new Date()).getTime();
    minutes = Math.round(((endTime - ScheduledScriptConstant.StartTime) / (1000 * 60)) * 100) / 100;

    if (context.getRemainingUsage() < ScheduledScriptConstant.RemainingUsage) {
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    if (minutes > ScheduledScriptConstant.Minutes) {
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    return false;
}