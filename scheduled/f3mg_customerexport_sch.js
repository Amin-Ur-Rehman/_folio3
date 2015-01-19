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

                if(EXPORT_FOR_ALL_STORES)
                {
                    customerIds=CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES,null);
                }
                else
                {
                    customerIds=CUSTOMER.getCustomers(EXPORT_FOR_ALL_STORES,store.internalId);
                }


                if(customerIds!=null && customerIds.length>0)
                {
                    for(var c=0;c<customerIds.length;c++) {

                        customerRecord=CUSTOMER.getCustomer(customerIds[c].internalId,store);

                        if(!!customerRecord)
                        {
                            requsetXML=getMagentoRequestXML(customerRecord);
                            responseMagento =validateCustomerExportOperationResponse(XmlUtility.soapRequestToMagento(requsetXML),'create');

                            if(responseMagento.status)
                            {
                               //Update Netsuite Customer with Netsuite Customer Id and Store Id

                                var magentoIdObjArrStr = ConnectorCommon.getMagentoIdObjectArrayString(ConnectorConstants.CurrentStore.systemId, responseMagento.magentoCustomerId, 'create', null);


                            }
                            else{

                                //Log error with fault code that this customer is not synched with magento
                                Utility.logDebug('customerId  ' + customerIds[c].internalId  + ' Not Logged Due to Error  :  ' + responseMagento.faultString);


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

            });


        }catch(e)
        {
            Utility.logException('customerExport', e);
        }





    }


}


