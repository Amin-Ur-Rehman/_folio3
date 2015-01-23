// uservent start: creating shipment in Magento
function setShipmentIdInFulFillment(shipmentId) {
    var rec = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId(), null);
    rec.setFieldValue(ConnectorConstants.Transaction.Fields.MagentoId, shipmentId + '');
    rec.setFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore, ConnectorConstants.CurrentStore.systemId);
    nlapiSubmitRecord(rec);
}

function syncFulfillmentsMagento(sessionID, magentoSO) {
    var fulfillmentXML;
    var responseMagento;
    var magentoSOId = magentoSO.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoId);
    var magentoItemIds = ConnectorCommon.getMagentoItemIds();

    // getting xml for creating fulfillemnt/shipment in Magento
    fulfillmentXML = XmlUtility.getCreateFulfillmentXML(sessionID, magentoItemIds, magentoSOId);
    Utility.logDebug('XmlUtility.getCreateFulfillmentXML', 'EOS ' + fulfillmentXML);

    // create shipment in Magento
    responseMagento = XmlUtility.validateFulfillmentExportResponse(XmlUtility.soapRequestToMagento(fulfillmentXML));

    if (!responseMagento.status) {
        Utility.logDebug('Error', 'Export fulfillment record -- ID: ' + '--' + responseMagento.faultCode + '--' + responseMagento.faultString);

        return;
    }
    else {
        Utility.logDebug('set magento shipment id', 'Im Setting ID ' + responseMagento.result);
        //nlapiSetFieldValue(ConnectorConstants.Transaction.Fields.MagentoId, responseMagento.result);

        // from SO
        var carrier = magentoSO.getFieldValue('shipcarrier');
        var totalPackages = nlapiGetLineItemCount('package');
        var carrierText = magentoSO.getFieldText('shipmethod');

        Utility.logDebug('carrier', carrier);
        Utility.logDebug('totalPackages', totalPackages);
        Utility.logDebug('carrierText', carrierText);

        for (var p = 1; p <= totalPackages; p++) {
            var tracking = nlapiGetLineItemValue('package', 'packagetrackingnumber', p);
            if (Utility.isBlankOrNull(tracking)) {
                tracking = 0;
            }
            // Setting Tracking Number
            var trackingXML = XmlUtility.createTrackingXML(responseMagento.result, carrier, carrierText, tracking, sessionID);
            var responseTracking = XmlUtility.validateTrackingCreateResponse(XmlUtility.soapRequestToMagento(trackingXML));
            Utility.logDebug('CHECK', 'I tried setting shipment tracking id Got this in response : ' + responseTracking.result);
        }
    }

    return responseMagento;
}

function startup(type) {
    try {

        // checking license validation
        if (!MC_SYNC_CONSTANTS.isValidLicense()) {
            Utility.logDebug('Validate', 'License has expired');
            return;
        }

        // only executes code when license is valid and type is create
        if (type.toString() === 'create') {

            var orderId = nlapiGetFieldValue('orderid');
            var recType = ConnectorCommon.getRecordTypeOfTransaction(orderId);

            // if fulfillment is not creating from sales order then terminate
            if (recType.toString() !== 'salesorder') {
                return;
            }

            var magentoSO = nlapiLoadRecord('salesorder', orderId, null);
            var salesOrderStore = magentoSO.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoStore);
            var salesOrderMagentoId = magentoSO.getFieldValue(ConnectorConstants.Transaction.Fields.MagentoId);

            // if not sales order is not synced with magento then terminate
            if (Utility.isBlankOrNull(salesOrderStore) || Utility.isBlankOrNull(salesOrderMagentoId)) {
                return;
            }

            ConnectorConstants.initialize();
            // getting configuration
            var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
            var sessionID;

            var store = (function (externalSystemConfig, salesOrderStore) {
                var s;
                for (var i in externalSystemConfig) {
                    var externalSystem = externalSystemConfig[i];
                    if (externalSystem.systemId === salesOrderStore) {
                        s = externalSystem;
                        break;
                    }
                }
                return s;
            })(externalSystemConfig, salesOrderStore);

            ConnectorConstants.CurrentStore = store;
            sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);

            // if session id is not captured then terminate
            if (Utility.isBlankOrNull(sessionID)) {
                Utility.logDebug('sessionID', 'sessionID is empty');
                return;
            }

            var response = syncFulfillmentsMagento(sessionID, magentoSO);

            if (response) {
                setShipmentIdInFulFillment(response.result);
            }

        }
    } catch (e) {
        Utility.logException('startup - afterSubmit', e);
    }
}