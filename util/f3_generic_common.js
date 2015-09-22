/**
 * Created by ubaig on 11/9/2014.
 * A general purpose constants file to be used as a common point for constants or hard code values
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        for (var i = 0, len = this.length; i < len; ++i) {
            fn.call(scope, this[i], i, this);
        }
    };
}

var netsuiteBaseUrl = nlapiGetContext().getEnvironment() === 'PRODUCTION' ? "https://system.na1.netsuite.com" : "https://system.sandbox.netsuite.com";

var WsmUtilityCommon = {
    Strings: {
        Title: "Work Order Tracking Project",
        ScriptStart: "<script type='text/javascript' src='",
        ScriptEnd: "'></script>"
    },
    CustomLists : {
        Operations: 'customlist_opseq'
    },
    CurrentOperations: {
        None: '@NONE@'
    },
    BundleInfo: {
        Id: "suitebundle" + nlapiGetContext().getSetting('SCRIPT', 'custscript_wotp_utility_bundle_id')
    },
    FileIds: {
        MainHtml: 'wotp_utility_html.html'
    },
    ApiUrls: {
        //WotpUtilityApiUrl: netsuiteBaseUrl + nlapiResolveURL('SUITELET', 'customscript_wotp_utility_api', 'customdeploy_wotp_utility_api')
    },
    Suitelets: {
        Main: {
            Id: "customscript_wotp_utility_suitelet_sl",
            DeploymentId: "customdeploy_wotp_utility_suitelet_sl"
        },
        Api: {
            Id: 'customscript_wotp_utility_api',
            DeploymentId: 'customdeploy_wotp_utility_api'
        }
    },
    Buttons : {
        SubmitterId : "submitter"
    },
    ClientScripts: {
        SuiteletClientScript: {
            Id: "customscript_wotp_utility_clientscript"
        },
        CliendScriptFcMapping3: {
            Id: "customscript_fc_mapping_cs_3"
        }
    },
    Fields: {
        WorkOrderTrackingSearchId: 'custentity_wotp_utility_detail_search_id'
    },
    SavedSearches: {
        MainWorkOrderSearch: 'customsearch1784',
        DetailWorkOrderSearch: 'customsearch1791'
    },
    getFileUrl: function () {
        try {
            var bundleId = WsmUtilityCommon.BundleInfo.Id;
            nlapiLogExecution('DEBUG', 'value of bundleId', bundleId);
            if (!bundleId || bundleId.length <= 0 || bundleId.toString() === 'suitebundlenull' || bundleId === 'suitebundle9090') {
                return "SuiteScripts/wotp_utility/";
            } else {
                return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/';
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main getFileUrl', e.toString());
        }
    },
    getObject: function (row, cols, rawColumnData) {
        var obj = null;
        if (row) {
            obj = { id: row.getId() };
            var nm = null;
            for (var x = 0; x < cols.length; x++) {
                nm = cols[x].getName();
                var needsText = false;
                if (!!rawColumnData) {
                        for (var j = 0; j < rawColumnData.length; j++) {

                              if (rawColumnData[j].name === nm && rawColumnData[j].formula != null && rawColumnData[j].formula.length > 0) {
                                    nm = rawColumnData[j].label;
                                    break;
                              }
                              if (rawColumnData[j].name === nm && rawColumnData[j].type === 'text') {
                                    needsText = true;
                                    break;
                              }
                        }                                
                }
                if (needsText === true) {
                      obj[nm] = row.getText(cols[x]);
               } else {
                      obj[nm] = row.getValue(cols[x]);
               }
                
            }
        }
        return obj;
    }
};