var ScheduledScriptConstant = {
    Minutes: 15,
    RemainingUsage: 1000,
    StartTime: (new Date()).getTime()
};



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
        var externalSystemArr = new Array();
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




                    externalSystemArr.forEach(function(store) {




                        magentoReferences = customerIds[c].magentoCustomerIds;

                        //Decide whether to Create or Update Customer
                        if (isBlankOrNull(magentoReferences)) {
                            //Create Customer for Current Store

                            Utility.logDebug('Not Synched With Any Store', 'Going to Call Create Customer');

                            customerSynched = createCustomerInMagento(customerIds[c], store);

                            Utility.logDebug('Synched Result', customerSynched);

                        } else {
                            //Parse Store and Customer Infor JSON in Customer Record
                            magentoStoreAndCustomer = getStoreCustomerIdAssociativeArray(magentoReferences);


                            Utility.logDebug('Synched with Some Store ', magentoReferences + '    ' + magentoStoreAndCustomer[store.systemId]);


                            //Check whether Customer Created for the Current Store
                            if (isBlankOrNull(magentoStoreAndCustomer[store.systemId]) || magentoStoreAndCustomer[store.systemId] === '0') {
                                Utility.logDebug('Customer Create Block , Synching with other store ');
                                //Create Customer for Current Store
                                customerSynched = createCustomerInMagento(customerIds[c], store, magentoReferences);

                            } else {
                                Utility.logDebug('Customer Update Block ');

                                //Update Customer for Current Store
                                customerSynched = updateCustomerInMagento(customerIds[c], store, magentoStoreAndCustomer[store.systemId], magentoReferences);


                            }


                        }

                        Utility.logDebug('Main Function :   customerSynched ', customerSynched);



                    });


                    if (customerSynched) {
                        nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoSync(customerIds[c].internalId);
                    }

                    if (rescheduleIfRequired(null))
                        return;


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
        responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML), 'create');

        if (!!responseMagento && !!responseMagento.status && responseMagento.status) {

            if (!!existingMagentoReferenceInfo)
                createOrUpdateMagentoJSONRef = 'update';

            magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoCustomerId, createOrUpdateMagentoJSONRef, existingMagentoReferenceInfo);
            nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr, nsCustomerObject.internalId);


            //Address Sync
            if (nsCustomerUpdateStatus) {
                customerSynched = createAddressesInMagento(customerRecord.nsObj, store, responseMagento.magentoCustomerId);
            }

        } else {
            Utility.logDebug('responseMagento ', responseMagento.faultCode + '    ' + responseMagento.faultString);
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




        responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML), 'update');


        Utility.logDebug('responseMagento.updated',(responseMagento.updated)  );

        Utility.logDebug('responseMagento.updated',(responseMagento.updated == true));

        if (!!responseMagento && !!responseMagento.status && responseMagento.status && responseMagento.updated==true) {

            magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, magentoId, 'update', existingMagentoReferenceInfo);



            nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr, nsCustomerObject.internalId);

            if (nsCustomerUpdateStatus)
                customerSynched = true;

            //Address Sync


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


    for (var adr = 0; adr < customerAddresses.length; adr++) {
        scannedAddressForMagento = ConnectorCommon.getScannedAddressForMagento(customerAddresses[adr]);

        if (scannedAddressForMagento) {

            //Address is valid for magento
            requsetXML = CUSTOMER.getMagentoAddressRequestXML(scannedAddressForMagento, store.sessionID, magentoCustomerId);

            responseMagento = XmlUtility.validateCustomerAddressExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'create');

            if (!responseMagento.status) {
                allAddressedSynched = false;
            }
        }


    }


    return allAddressedSynched;
}


function updateAddressesInMagento(customerRecordObject, store) {




}



// check if the script is required to be scheduled
function rescheduleIfRequired(params) {
    var context = nlapiGetContext();
    var endTime;
    var minutes;

    endTime = (new Date()).getTime();
    minutes = Math.round(((endTime - ScheduledScriptConstant.StartTime) / (1000 * 60)) * 100) / 100;

    if (context.getRemainingUsage() < ScheduledScriptConstant.RemainingUsage) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Remaining Usage: ' + context.getRemainingUsage());
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    if (minutes > ScheduledScriptConstant.Minutes) {
        nlapiLogExecution('AUDIT', 'RESCHEDULED', 'Time Elapsed: ' + minutes);
        nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    return false;
}


//Just for reference , will be deleted in next pull requests
function customerExport_deprecated_26012015() {

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
        var externalSystemArr = new Array();
        var scannedAddressForMagento;

        nlapiLogExecution('debug', 'Step-1');

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


            externalSystemArr.forEach(function(store) {

                nlapiLogExecution('debug', 'Step-2');

                if (EXPORT_FOR_ALL_STORES) {
                    customerIds = CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES, null);
                } else {
                    customerIds = CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES, store.internalId);
                }

                nlapiLogExecution('debug', 'Step-3');

                if (customerIds != null && customerIds.length > 0) {
                    for (var c = 0; c < customerIds.length; c++) {

                        customerRecord = CUSTOMER.getCustomer(customerIds[c].internalId, store);

                        nlapiLogExecution('debug', 'Step-4');

                        if (!!customerRecord) {
                            nlapiLogExecution('debug', 'Step-5');

                            requsetXML = CUSTOMER.getMagentoCreateCustomerRequestXML(customerRecord, store.sessionID);

                            nlapiLogExecution('debug', 'store.endpoint', store.endpoint);



                            responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML), 'create');

                            nlapiLogExecution('debug', 'Step-5c');

                            if (!!responseMagento && !!responseMagento.status && responseMagento.status) {
                                nlapiLogExecution('debug', 'Step-6');

                                //Update Netsuite Customer with Netsuite Customer Id and Store Id
                                magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoCustomerId, 'create', null);
                                nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr, customerIds[c].internalId);

                                nlapiLogExecution('debug', 'Step-7 ', magentoIdObjArrStr);


                                magentoIdObjArrStr = JSON.parse(magentoIdObjArrStr);



                                if (nsCustomerUpdateStatus) {

                                    nlapiLogExecution('debug', 'Step-8');

                                    customerAddresses = CUSTOMER.getNSCustomerAddresses(customerRecord.nsObj);
                                    allAddressedSynched = true;

                                    for (var adr = 0; adr < customerAddresses.length; adr++) {
                                        nlapiLogExecution('debug', 'Step-9  magentoIdObjArrStr[0].magentoId ', magentoIdObjArrStr[0].MagentoId);
                                        //Address Create
                                        scannedAddressForMagento = ConnectorCommon.getScannedAddressForMagento(customerAddresses[adr]);

                                        nlapiLogExecution('debug', 'Step-9-b');

                                        if (scannedAddressForMagento) {

                                            nlapiLogExecution('debug', 'Step-9-c');

                                            //Address is valid for magento
                                            requsetXML = CUSTOMER.getMagentoAddressRequestXML(scannedAddressForMagento, store.sessionID, magentoIdObjArrStr[0].MagentoId);

                                            nlapiLogExecution('debug', 'Step-10');

                                            /*
                                             //Temporary Code
                                             var logRec = nlapiCreateRecord('customrecord_dummaydata');

                                             if (!!requsetXML) {
                                             logRec.setFieldValue('custrecord_xmldata', requsetXML);
                                             nlapiSubmitRecord(logRec);

                                             }
                                             */

                                            nlapiLogExecution('debug', 'Step-11');


                                            responseMagento = XmlUtility.validateCustomerAddressExportOperationResponse(XmlUtility.soapRequestToMagentoSpecificStore(requsetXML, store), 'create');

                                            nlapiLogExecution('debug', 'Step-12');

                                            if (!responseMagento.status) {
                                                Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Address Number ' + (parseInt(adr) + 1) + ' is not synched with Magento');
                                                allAddressedSynched = false;

                                            }

                                        } else {

                                            Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Address Number ' + (parseInt(adr) + 1) + ' is not valid for magento');

                                        }

                                    }

                                    if (!allAddressedSynched) {

                                        nsCustomerUpdateStatus = CUSTOMER.setCustomerMagentoSync(magentoIdObjArrStr[0].MagentoId);
                                        if (!nsCustomerUpdateStatus)
                                            Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Customer Data Updated but Addresses Not Updated');

                                    }

                                } else {

                                    Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Not Marked Updated in Netsuite');

                                }



                            } else {

                                //Log error with fault code that this customer is not synched with magento
                                Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Not Synched Due to Error  :  ' + responseMagento.faultString);


                            }


                        }

                        usageRemaining = context.getRemainingUsage();
                        if (usageRemaining < 500) {
                            nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                            return true;
                        }

                    }



                }

                usageRemaining = context.getRemainingUsage();
                if (usageRemaining < 500) {
                    nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
                    return true;
                }

                return;

            });


        } catch (e) {
            Utility.logException('customerExport', e);
        }




    }


}