/**
 * Created by zahmed on 13-Jan-15.
 *
 * Description:
 * - This script is responsible for importing all the customers & his addresses from Magento store(s)
 * -
 * Referenced By:
 * -
 * Dependency:
 * - Script Parameters:
 *   -
 * -
 * - Script Id:
 *   - customscript_magento_customer_sync
 * -
 * - Deployment Id:
 *   - customdeploy_magento_customer_sync
 * -
 * - Scripts:
 *   - accessMagento.js
 *   - connector_common_records.js
 *   - connector-common-lib.js
 *   - connector-timezone-lib.js
 *   - connector-general.js
 *   - folio3ConnectorLicenseVerification.js
 *   - mc_sync_constants.js
 *   - f3mg_connector_common.js
 */

var URL = '';
// For the safe side its 1000, we calculate , in actual it is 460
var CUSTOMER_IMPORT_MIN_USAGELIMIT = 1000;
var SCRIPT_ID = 'customscript_magento_customer_sync';
var SCRIPT_DEPLOYMENT_ID = 'customdeploy_magento_customer_sync';


function startup() {
    if (MC_SYNC_CONSTANTS.isValidLicense()) {
        // inititlize constants
        ConnectorConstants.initialize();
        // getting configuration
        var externalSystemConfig = ConnectorConstants.ExternalSystemConfig;
        var configuration;
        var sessionID;
        var sessionObj = {};
        var context = nlapiGetContext();
        var result = {};
        var params = [];
        var customerUpdateDate;


        externalSystemConfig.forEach(function (store) {
            // set the percent complete parameter to 0.00
            context.setPercentComplete(0.00);
            // set store for ustilizing in other functions
            ConnectorConstants.CurrentStore = store;

            // Add a Check whether categories synched or not , if not then stop and give msg that ensure the sync of categories first
            try {
                context.setPercentComplete(0.00);  // set the percent complete parameter to 0.00

                var customerFrequency = store.entitySyncInfo.customer.noOfDays;

                customerUpdateDate = ConnectorCommon.getUpdateDate(-1 * customerFrequency);
                Utility.logDebug('soUpdateDate', customerFrequency);

                sessionID = XmlUtility.getSessionIDFromMagento(store.userName, store.password);

                if (!sessionID) {
                    Utility.logDebug('sessionID', 'sessionID is empty');
                    return;
                }

                Utility.logDebug('startup', 'Start Syncing');

                result = syncCustomerMagento(sessionID, customerUpdateDate, configuration);

                if (result.errorMsg != '') {
                    Utility.logDebug('Master Scheduler', 'Job Ending With Message ' + result.errorMsg);
                }
                else {


                    if (result.infoMsg == 'Reschedule') {
                        Utility.logDebug('Rescheduling ', ' i = ' + result.i);
                        params['custscript_internalid'] = result.i;
                        nlapiScheduleScript(SCRIPT_ID, SCRIPT_DEPLOYMENT_ID, params);
                        return true;
                    }
                }

            } catch (ex) {

                // logEntry(jobId,'Error','Unexpected End with Error Message: ' + ex.toString());
            }

        });

    } else {
        Utility.logDebug('Validate', 'License has expired');
    }
}

function syncCustomerMagento(sessionID, updateDate, configuration) {
    var customerXML = "";
    var customer = {};
    var responseMagento;
    var customers;
    var result = {};
    var context;
    var usageRemaining;
    var customerCount;
    var cols = [];
    var leadCreateAttemptResult;
    var enviornment = '';
    var paramInternalId = nlapiGetContext().getSetting('SCRIPT', 'custscript_internalid');
    try {
        result.errorMsg = '';
        result.infoMsg = '';

        customerCount = ConnectorCommon.getMagentoMaxCustomerIdNetsuite(enviornment);
        Utility.logDebug('Count', customerCount);


        if (customerCount.errorMsg != '') {
            result.errorMsg = customerCount.errorMsg;
            return result;
        }

        customer.maxMagentoId = customerCount.data;
        customer.updateDate = updateDate;
        customerXML = XmlUtility.getLoadCustomersXML(customer, sessionID);


        responseMagento = XmlUtility.validateResponseCustomer(XmlUtility.soapRequestToMagento(customerXML));

        if (responseMagento.status == false) {
            result.errorMsg = responseMagento.faultCode + '--' + responseMagento.faultString;
            return result;
        }

        customers = responseMagento.customers;

        if (customers != null)                                   // Move this customer createion code to connector_common_records.js to make it generalize
        {
            var magentoCustomerId = ConnectorConstants.Entity.Fields.MagentoId;


            Utility.logDebug(customers.length + ' Customer(s) Found for Processing ', '');

            for (var i = (paramInternalId == null) ? 0 : paramInternalId, k = 0; i < customers.length; i++, k++) {
                try {
                    var existingCustomerRecords;
                    var entityId = customers[i].firstname + ' ' + customers[i].middlename + customers[i].lastname;
                    var filterExpression;
                    Utility.logDebug('Start Iterating on Customer: ' + entityId, '');
                    filterExpression = [ magentoCustomerId, 'is', customers[i].customer_id];

                    cols = [];

                    cols.push(new nlobjSearchColumn(magentoCustomerId, null, null));                        // Distinct the Parent
                    cols.push(new nlobjSearchColumn('email', null, null));
                    cols.push(new nlobjSearchColumn('entityid', null, null));

                    existingCustomerRecords = ConnectorCommon.getRecords('customer', filterExpression, cols);

                    if (existingCustomerRecords != null) {
                        var CustIdInNS = existingCustomerRecords[0].getId();
                        Utility.logDebug('Start Update Customer', '');
                        ConnectorConstants.Client.updateCustomerInNetSuite(CustIdInNS, customers[i], enviornment, sessionID);
                        Utility.logDebug('End Update Customer  ' + i, '');
                    }
                    else {
                        Utility.logDebug('Start Creating Lead', '');

                        leadCreateAttemptResult = ConnectorConstants.Client.createLeadInNetSuite(customers[i], '', sessionID);

                        if (leadCreateAttemptResult.errorMsg != '') {
                            Utility.logDebug('ERROR', 'End Creating Lead');
                            Utility.logDebug('ERROR', 'End Iterating on Customer: ' + entityId);
                            continue;
                        }
                        else if (leadCreateAttemptResult.infoMsg != '') {
                            Utility.logDebug('End Creating Lead', '');
                            Utility.logDebug('End Iterating on Customer: ' + entityId, '');
                            continue;
                        }

                        Utility.logDebug('End Creating Lead  -  ' + i, '');
                    }

                    // Write Code to handle Re-scheduling in case of going down than min Governance
                    context = nlapiGetContext();
                    usageRemaining = context.getRemainingUsage();

                    if (usageRemaining <= CUSTOMER_IMPORT_MIN_USAGELIMIT) {
                        result.infoMsg = 'Reschedule';
                        result.i = i;
                        return result;
                    }
                } catch (e) {
                    Utility.logException('syncCustomerMagento', e);
                }
                context.setPercentComplete(Math.round(((100 * k) / customers.length) * 100) / 100);  // calculate the results

                // displays the percentage complete in the %Complete column on
                // the Scheduled Script Status page
                context.getPercentComplete();  // displays percentage complete
            }

        }
    }
    catch (ex) {
        result.errorMsg = ex.toString();
        Utility.logException('syncCustomerMagento', ex);
    }

    return result;
}