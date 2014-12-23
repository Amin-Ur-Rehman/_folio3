/**
 * Created by zahmed on 22-Oct-14.
 */

var XML_HEADER = '<soapenv:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:Magento" xmlns:soapenc="http://schemas.xmlsoap.org/soap/encoding/"><soapenv:Header/><soapenv:Body>';
var XML_FOOTER = '</soapenv:Body></soapenv:Envelope>';

var ItemConstant = ItemConstant || {};
ItemConstant.Fields = {
    MagentoSyncStatus: 'custitem_magento_sync_status',
    MagentoSync: 'custitem_magentosyncdev',
    ItemSync: 'custitem_item_sync',
    MagentoId: 'custitem_magentoid',
    MagentoSku: 'custitem_magento_sku',
    Color: 'custitem3',
    SizeUk: 'custitem4',
    Size: 'custitem2',
    WasPrice: 'custitem44',
    Export: 'custitem_mg_export'
};

ItemConstant.MagentoCred = {
    // http://goddiva.musicaahora.com/index.php/api/v2_soap
    // http://202.142.150.39:4545/netmag/index.php/api/v2_soap
    //SoapUrl: 'http://kanban.folio3.com:4545/netmag/index.php/api/v2_soap',
    //SoapUrl: 'http://goddiva.musicaahora.com/index.php/api/v2_soap/index/',
    SoapUrl: 'https://goddiva.co.uk/index.php/api/v2_soap',
    UserName: 'wsuser',
    Password: 'Click12345'
};
ItemConstant.Url = {
    //ConfigurableProduct: 'http://kanban.folio3.com:4545/netmag/simple-configurable.php'
    //ConfigurableProduct: 'http://goddiva.musicaahora.com/simple-configurable.php'
    ConfigurableProduct: 'https://goddiva.co.uk/simple-configurable.php',
    CouponCode: 'https://goddiva.co.uk/get-couponcode.php'
};

ItemConstant.SavedSearch = {
    //ChildMatrixItems: 'customsearch_f3_child_matrix_items',
    //ChildMatrixItems: 'customsearch409',
    ChildMatrixItems: 'customsearch427',
    //ParentMatrixItems: 'customsearch_f3_child_matrix_items_2',
    //ParentMatrixItems: 'customsearch411',
    ParentMatrixItems: 'customsearch428',
    MatrixParentSyncStatus: 'customsearch_f3_mat_par_sync_stats',
    MatrixItemsForTierPricing: 'customsearch_f3_child_matrix_items_3',
    ItemsForSyncing: 'customsearch_iisync_item_list_7' //'customsearch_iisync_item_list', images
};
ItemConstant.ScriptParam = {
    Index: 'custscript_index'// for f3mg_item_category_sch.js
};

ItemConstant.Script = {
    IISYNC_UTIILIY: {
        ScriptId: 'customscript_iisync_utility_schedule',
        DeploymentId: 'customdeploy_iisync_utility_schedule'
    },
    F3MG_ITEM_EXPORT_S1: {
        ScriptId: 'customscript_f3mg_item_export_s1_sch',
        DeploymentId: 'customdeploy_f3mg_item_export_s1_sch'
    },
    F3MG_ITEM_EXPORT_S2: {
        ScriptId: 'customscript_f3mg_item_export_s2_sch',
        DeploymentId: 'customdeploy_f3mg_item_export_s2_sch'
    }
};

// TODO: generalize
var Store = Store || {};
Store.storeView = '11';
Store.websiteId = '1';
Store.attributeSet = '9';// attribute set for god diva
Store.Attributes = {
    Color: 'colors',
    Size: 'size_goddiva',
    WasPrice: 'was_price'
};

//Store.storeView = '1';// test
//Store.websiteId = '1';// test
//Store.attributeSet = '4';// test

var FieldsMap = FieldsMap || {};
FieldsMap.BodyFields = {
};

var ScheduledScriptConstant = {
    Minutes: 15,
    RemainingUsage: 1000,
    StartTime: (new Date()).getTime()
};