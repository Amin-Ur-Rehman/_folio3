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


var netsuiteBaseUrl = nlapiGetContext().environment === 'PRODUCTION' ? "https://system.netsuite.com" : "https://system.sandbox.netsuite.com";

var IISyncUtilityCommon = {
    Strings: {
        Title: "Work Order Tracking Project",
        ScriptStart: "<script type='text/javascript' src='",
        ScriptEnd: "'></script>"
    },
    CustomLists: {
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
        WotpUtilityApiUrl: netsuiteBaseUrl
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
    ScriptParameters: {
        LastId: 'custscript_iisync_utility_sch_last_id'
    },
    Fields: {
        custitemthumbcolor1: 'custitemthumbcolor1',
        custitemcatcolor2: 'custitemcatcolor2',
        custitem1: 'custitem1',
        custitem5: 'custitem5',
        custitem7: 'custitem7',
        custitem8: 'custitem8',
        custitem17: 'custitem17',
        custitem21: 'custitem21',
        custitem25: 'custitem25',
        custitemcatcolor3: 'custitemcatcolor3',
        custitem6: 'custitem6',
        custitem9: 'custitem9',
        custitem22: 'custitem22',
        custitem26: 'custitem26',
        custitem19: 'custitem19',
        custitem23: 'custitem23',
        custitem27: 'custitem27',
        custitem20: 'custitem20',
        custitem24: 'custitem24',
        custitem28: 'custitem28'


    },
    ImageTypes: {
        allzoom: 'image',
        allproduct: 'image', //small_image
        itemlist: 'small_image', //'small_image',
        allthumb: 'thumbnail'
    },
    NetSuiteMagentoMapping: {
        custitemthumbcolor1: 'custitemthumbcolor1',
        custitemcatcolor2: 'custitemcatcolor2',
        custitem1: 'custitem1',
        custitem5: 'custitem5',
        custitem7: 'custitem7',
        custitem8: 'custitem8',
        custitem17: 'custitem17',
        custitem21: 'custitem21',
        custitem25: 'custitem25'
    },
    SavedSearches: {
        ItemsForSyncing: 'customsearch_iisync_item_list_7', //'customsearch_iisync_item_list',
        ItemRecordFiles: 'customsearch_iisync_item_files'
    },
    ImageCombinations: [
        "_back.jpg", "_back_l.jpg", "_back_t.jpg", "_back_itemlist.jpg",
        "_front.jpg", "_front_l.jpg", "_front_t.jpg", "_front_itemlist.jpg",
        "_co.jpg", "_co_l.jpg", "_co_t.jpg", "_co_itemlist.jpg",
        "_dt.jpg", "_dt_l.jpg", "_dt_t.jpg", "_dt_itemlist.jpg"
    ],
    MagentoRequestXml: {
        Header: '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"><soapenv:Header/><soapenv:Body>',
        ImageUploadXml: '<urn:catalogProductAttributeMediaCreate soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><sessionId xsi:type="xsd:string">[SESSIONID]</sessionId><product xsi:type="xsd:string">[PRODUCTID]</product><data xsi:type="urn:catalogProductAttributeMediaCreateEntity"><file xsi:type="urn:catalogProductImageFileEntity"><content xsi:type="xsd:string">[CONTENT]</content><mime xsi:type="xsd:string">[MIME]</mime><name xsi:type="xsd:string">[NAME]</name></file><label xsi:type="xsd:string">[LABEL]</label><position xsi:type="xsd:string">[POSITION]</position><types xsi:type="urn:ArrayOfString" soapenc:arrayType="xsd:string[]"><item>[TYPE]</item></types><exclude xsi:type="xsd:string">[EXCLUDE]</exclude></data><storeView xsi:type="xsd:string">0</storeView></urn:catalogProductAttributeMediaCreate>',
        Footer: '</soapenv:Body></soapenv:Envelope>',
        ImageListXml: '<urn:catalogProductAttributeMediaList soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><sessionId xsi:type="xsd:string">[SESSIONID]</sessionId><product xsi:type="xsd:string">[PRODUCTID]</product></urn:catalogProductAttributeMediaList>',
        ImageRemoveXml: '<urn:catalogProductAttributeMediaRemove soapenv:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/"><sessionId xsi:type="xsd:string">[SESSIONID]</sessionId><product xsi:type="xsd:string">[PRODUCTID]</product><file xsi:type="xsd:string">[FILE]</file></urn:catalogProductAttributeMediaRemove>',
        UpdateProductXml: '<urn:catalogProductUpdate><sessionId xsi:type="xsd:string">[SESSIONID]</sessionId><product xsi:type="xsd:string">[PRODUCTID]</product><productData xsi:type="urn:catalogProductCreateEntity"><visibility xsi:type="xsd:string" xs:type="type:catalogProductTierPriceEntity">[VISIBILITY]</visibility></productData><storeView xsi:type="xsd:string">[STOREVIEW]</storeView></urn:catalogProductUpdate>'
    },
    MagentoInfo: {
        login: 'wsuser',
        password: 'Click12345',
        sessionId: null,
        //apiUrl: 'http://goddiva.musicaahora.com/index.php/api/v2_soap/index/',
        apiUrl: 'https://goddiva.co.uk/index.php/api/v2_soap',
        storeId: 0
    },
    getFileUrl: function () {
        try {
            var bundleId = IISyncUtilityCommon.BundleInfo.Id;
            nlapiLogExecution('DEBUG', 'value of bundleId', bundleId);
            if (!bundleId || bundleId.length <= 0 || bundleId.toString() === 'suitebundlenull' || bundleId === 'suitebundle9090') {
                return "SuiteScripts/iisync_utility/";
            } else {
                return "SuiteBundles/Bundle " + bundleId.replace('suitebundle', '') + '/';
            }
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during main getFileUrl', e.toString());
        }
    },
    guid: (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        };
    })()
}