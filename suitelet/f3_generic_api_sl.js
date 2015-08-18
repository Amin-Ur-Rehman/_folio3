/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       11 September 2014     Ubaid Baig
 *
 */


/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suite_api(request, response) {
    var outResponse = {};
    try {
        //nlapiLogExecution('DEBUG', 'test_w', 'call is here');
        var header = request.getHeader(WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Name);

        if (header === WsmUtilityApiConstants.Header.NetSuiteMagentoConnector.Value) {
            outResponse = processRequest(request, response);
        } else {
            throwError('DEV_ERR', 'Invalid Call', true);
        }
    }
    catch (e) {
        outResponse.Result = WsmUtilityApiConstants.Response.Result.Error;
        outResponse.Message = e.name + ", " + e.message;

        nlapiLogExecution('DEBUG', 'outResponse', JSON.stringify(outResponse));
    }

    response.setContentType('JSON');
    response.write(JSON.stringify(outResponse));
}