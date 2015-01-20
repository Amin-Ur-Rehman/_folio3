var EXPORT_FOR_ALL_STORES=true;

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
        var externalSystemArr=new Array();

        nlapiLogExecution('debug','Step-1');

        externalSystemConfig.forEach(function (store) {
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


        try{


            externalSystemArr.forEach(function (store) {

                nlapiLogExecution('debug','Step-2');

                if(EXPORT_FOR_ALL_STORES)
                {
                    customerIds=CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES,null);
                }
                else
                {
                    customerIds=CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES,store.internalId);
                }

                nlapiLogExecution('debug','Step-3');

                if(customerIds!=null && customerIds.length>0)
                {
                    for(var c=0;c<customerIds.length;c++) {

                        customerRecord=CUSTOMER.getCustomer(customerIds[c].internalId,store);

                        nlapiLogExecution('debug','Step-4');

                        if(!!customerRecord)
                        {
                            nlapiLogExecution('debug','Step-5');

                            //Temporary Code
                            var logRec=nlapiCreateRecord('customrecord_dummaydata');

                            requsetXML=CUSTOMER.getMagentoRequestXML(customerRecord,store.sessionID);

                            nlapiLogExecution('debug','store.endpoint',store.endpoint);

                            if(!!requsetXML) {
                                logRec.setFieldValue('custrecord_xmldata',XmlUtility.soapRequestToMagentoSpecificStore(requsetXML,store));
                                nlapiSubmitRecord(logRec);

                            }



                            responseMagento = XmlUtility.validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML),'create');







                            nlapiLogExecution('debug','Step-5c');

                            if(!!responseMagento && !!responseMagento.status && responseMagento.status)
                            {
                                nlapiLogExecution('debug','Step-6');

                               //Update Netsuite Customer with Netsuite Customer Id and Store Id
                                magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(store.systemId, responseMagento.magentoCustomerId, 'create', null);
                                nsCustomerUpdateStatus=CUSTOMER.setCustomerMagentoId(magentoIdObjArrStr,customerIds[c].internalId);

                                nlapiLogExecution('debug','Step-7');

                                /*

                                if(nsCustomerUpdateStatus) {

                                    customerAddresses=CUSTOMER.getNSCustomerAddresses(customerRecord);
                                    allAddressedSynched=true;
                                    for(var adr=0;adr<customerAddresses.length;adr++)
                                    {
                                        //Address Create
                                        requsetXML=CUSTOMER.getMagentoAddressRequestXML(customerAddresses[adr]);
                                        responseMagento = Utility.validateCustomerAddressExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML), 'create');

                                        if(!responseMagento.status)
                                        {
                                            Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Address Number '+ adr+1 + ' is not synched with Magento' );
                                            allAddressedSynched=false;

                                        }

                                    }

                                    if(allAddressedSynched) {

                                        nsCustomerUpdateStatus=CUSTOMER.setCustomerMagentoSync(magentoId);
                                        if(!nsCustomerUpdateStatus)
                                            Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Customer Data Updated but Address Not Updated');

                                    }
                                }
                                else
                                {

                                    Utility.logDebug('customerId  ' + customerIds[c].internalId + ' Not Marked Updated in Netsuite');

                                }

                                */

                            }
                            else{

                                //Log error with fault code that this customer is not synched with magento
                                Utility.logDebug('customerId  ' + customerIds[c].internalId  + ' Not Synched Due to Error  :  ' + responseMagento.faultString);


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


        }catch(e)
        {
            Utility.logException('customerExport', e);
        }





    }


}


