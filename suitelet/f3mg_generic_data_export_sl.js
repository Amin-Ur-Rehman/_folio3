/**
 * Created by wahajahmed on 8/6/2015.
 * TODO:
 * -
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * GenericDataExportManager class that has the actual functionality of generic data export suitelet.
 * All business logic will be encapsulated in this class.
 */
var GenericDataExportManager = (function () {
    return {
        /**
         * main method
         */
        main: function (request, response) {
            if (request.getMethod() === 'GET') {
                var recordId = request.getParameter("recordId");
                var recordType = request.getParameter("recordType");
                var result = this.exportData(recordId, recordType);
                if(!!result && !!result.status) {
                    response.write('Record has been exported to magento. Please close this popup.');
                } else {
                    response.write('Some error occurred during record export:<br /><br />' + result.error);
                }
            }
        },
        /**
         * Export provided record to magento
         * @param recordId
         * @param recordType
         * @returns {*}
         */
        exportData: function(recordId, recordType){
            var result = null;
            if(recordType == ConnectorConstants.NSRecordTypes.PromotionCode) {
                result = this.exportPromotionCode(recordId, recordType);
            }
            else if(recordType == ConnectorConstants.NSRecordTypes.PriceLevel) {
                result = this.exportPriceLevel(recordId, recordType);
            }
            else if(recordType == ConnectorConstants.NSRecordTypes.PaymentTerm) {
                result = this.exportPaymentTerm(recordId, recordType);
            }

            return result;
        },
        /**
         * Export provided Promotion code record to magento
         * @param recordId
         * @param recordType
         * @returns {{status: boolean, error: string}}
         */
        exportPromotionCode: function(recordId, recordType) {
            var status = true;
            var error = '';
            var magentoUrl = '';
            try {
                var internalId = recordId;
                var promoCodeRecord = PromoCodesExportHelper.getPromoCode(internalId, null);
                //Utility.logDebug('promoCodeRecord', JSON.stringify(promoCodeRecord));
                var response = PromoCodesExportHelper.sendRequestToMagento(internalId, promoCodeRecord);
                status = response.status;
                if(!response.status) {
                    error = response.message;
                }
            }
            catch (ex) {
                status = false;
                if (ex instanceof nlobjError) {
                    error = 'Code: ' + ex.getCode() + ',  Detail: ' + ex.getDetails();
                } else {
                    error = ex.toString();
                }
                nlapiLogExecution('ERROR', 'error in GenericDataExportManager.exportPromotionCode', error);
            }

            var result = {
                status: status,
                error: error
            };
            return result;
        },

        exportPriceLevel: function(recordId, recordType) {
            var status = true;
            var error = '';
            var magentoUrl = '';
            try {
                var internalId = recordId;
                var priceLevelRecord = PriceLevelExportHelper.getPriceLevel(internalId, null);
                Utility.logDebug('priceLevelRecord', JSON.stringify(priceLevelRecord));
                var response = PriceLevelExportHelper.sendRequestToMagento(internalId, priceLevelRecord);
                status = response.status;
                if(!response.status) {
                    error = response.message;
                }
            }
            catch (ex) {
                status = false;
                if (ex instanceof nlobjError) {
                    error = 'Code: ' + ex.getCode() + ',  Detail: ' + ex.getDetails();
                } else {
                    error = ex.toString();
                }
                nlapiLogExecution('ERROR', 'error in GenericDataExportManager.exportPriceLevel', error);
            }

            var result = {
                status: status,
                error: error
            };
            return result;
        },

        exportPaymentTerm: function(recordId, recordType) {
            var status = true;
            var error = '';
            var magentoUrl = '';
            try {
                var internalId = recordId;
                var paymentTermRecord = PaymentTermExportHelper.getPaymentTerm(internalId, null);
                Utility.logDebug('paymentTermRecord', JSON.stringify(paymentTermRecord));
                var response = PaymentTermExportHelper.sendRequestToMagento(internalId, paymentTermRecord);
                status = response.status;
                if(!response.status) {
                    error = response.message;
                }
            }
            catch (ex) {
                status = false;
                if (ex instanceof nlobjError) {
                    error = 'Code: ' + ex.getCode() + ',  Detail: ' + ex.getDetails();
                } else {
                    error = ex.toString();
                }
                nlapiLogExecution('ERROR', 'error in GenericDataExportManager.exportPaymentTerm', error);
            }

            var result = {
                status: status,
                error: error
            };
            return result;
        }
    };
})();

/**
 * This is the main entry point for GenericDataExportManager suitelet
 * NetSuite must only know about this function.
 * Make sure that the name of this function remains unique across the project.
 */
function GenericDataExportManagerSuiteletMain(request, response) {
    return GenericDataExportManager.main(request, response);
}