/**
 * Created by wahajahmed on 10/13/2015.
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
// Declaration of all NetSuite SuiteScript 1.0 APIs
/// <reference path="../util/SuiteScriptAPITS.d.ts" />
// Declaration of Existing Custom Libraries methods
/// <reference path="../util/CustomMethods.d.ts" />
/**
 * Wrapper class for magento custom rest api
 */
var MagentoRestApiWrapper = (function (_super) {
    __extends(MagentoRestApiWrapper, _super);
    function MagentoRestApiWrapper() {
        _super.apply(this, arguments);
    }
    /**
     * get Sales Orders Increment Ids list
     * @param fromDate
     * @param statuses
     * @param store
     */
    MagentoRestApiWrapper.prototype.getSalesOrdersList = function (fromDate, statuses, store) {
        var result = {};
        try {
            var customRestApiUrl = store.entitySyncInfo.common.customRestApiUrl;
            var dataObj = {};
            dataObj.fromDate = fromDate;
            dataObj.statuses = statuses;
            var requestParam = { "apiMethod": "getSalesOrderList", "data": JSON.stringify(dataObj) };
            var resp = nlapiRequestURL(customRestApiUrl, requestParam, null, 'POST');
            var responseBody = resp.getBody();
            Utility.logDebug('getSalesOrdersList responseBody', responseBody);
            var responseBodyData = JSON.parse(responseBody);
            if (!!responseBodyData.status) {
                result.status = true;
                result.orders = this.getSalesOrderParsedData(responseBodyData.data.orders);
            }
            else {
                this.setErrorResponse(result, responseBodyData.message);
            }
        }
        catch (ex) {
            this.setErrorResponse(result, ex.toString());
        }
        return result;
    };
    /**
     * Error message response
     * @param result
     * @param errorMessage
     */
    MagentoRestApiWrapper.prototype.setErrorResponse = function (result, errorMessage) {
        result.status = false;
        result.faultCode = 'ERROR';
        result.faultString = errorMessage;
    };
    /**
     * Get Sales order parsed data
     * @param soList
     */
    MagentoRestApiWrapper.prototype.getSalesOrderParsedData = function (soList) {
        var soDataList = [];
        for (var i = 0; i < soList.length; i++) {
            var incrementalId = soList[i];
            var obj = {};
            obj.increment_id = incrementalId;
            soDataList.push(obj);
        }
        return soDataList;
    };
    return MagentoRestApiWrapper;
})(XmlUtility);
//# sourceMappingURL=f3_magento_rest_api_wrapper.js.map