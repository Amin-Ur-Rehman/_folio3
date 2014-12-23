
// javascript proxy for webservices
// by Matthias Hertel
/*  */

proxies.MagentoService = {
url: "https://goddiva.co.uk/index.php/api/v2_soap/index/", //"http://kanban.folio3.com:4545/netmag/index.php/api/v2_soap/index/", //
ns: "urn:Magento"
} // proxies.MagentoService

/** End web service session */

proxies.MagentoService.endSession = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.endSession.fname = "endSession";
proxies.MagentoService.endSession.service = proxies.MagentoService;
proxies.MagentoService.endSession.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.endSession.params = [];
proxies.MagentoService.endSession.rtype = [];

/** Login user and retrive session id */

proxies.MagentoService.login = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.login.fname = "login";
proxies.MagentoService.login.service = proxies.MagentoService;
proxies.MagentoService.login.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.login.params = [];
proxies.MagentoService.login.rtype = [];

/** Start web service session */

proxies.MagentoService.startSession = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.startSession.fname = "startSession";
proxies.MagentoService.startSession.service = proxies.MagentoService;
proxies.MagentoService.startSession.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.startSession.params = [];
proxies.MagentoService.startSession.rtype = [];

/** List of available resources */

proxies.MagentoService.resources = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.resources.fname = "resources";
proxies.MagentoService.resources.service = proxies.MagentoService;
proxies.MagentoService.resources.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.resources.params = [];
proxies.MagentoService.resources.rtype = [];

/** List of global faults */

proxies.MagentoService.globalFaults = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.globalFaults.fname = "globalFaults";
proxies.MagentoService.globalFaults.service = proxies.MagentoService;
proxies.MagentoService.globalFaults.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.globalFaults.params = [];
proxies.MagentoService.globalFaults.rtype = [];

/** List of resource faults */

proxies.MagentoService.resourceFaults = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.resourceFaults.fname = "resourceFaults";
proxies.MagentoService.resourceFaults.service = proxies.MagentoService;
proxies.MagentoService.resourceFaults.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.resourceFaults.params = [];
proxies.MagentoService.resourceFaults.rtype = [];

/** List of stores */

proxies.MagentoService.storeList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.storeList.fname = "storeList";
proxies.MagentoService.storeList.service = proxies.MagentoService;
proxies.MagentoService.storeList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.storeList.params = [];
proxies.MagentoService.storeList.rtype = [];

/** Store view info */

proxies.MagentoService.storeInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.storeInfo.fname = "storeInfo";
proxies.MagentoService.storeInfo.service = proxies.MagentoService;
proxies.MagentoService.storeInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.storeInfo.params = [];
proxies.MagentoService.storeInfo.rtype = [];

/** Info about current Magento installation */

proxies.MagentoService.magentoInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.magentoInfo.fname = "magentoInfo";
proxies.MagentoService.magentoInfo.service = proxies.MagentoService;
proxies.MagentoService.magentoInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.magentoInfo.params = [];
proxies.MagentoService.magentoInfo.rtype = [];

/** List of countries */

proxies.MagentoService.directoryCountryList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.directoryCountryList.fname = "directoryCountryList";
proxies.MagentoService.directoryCountryList.service = proxies.MagentoService;
proxies.MagentoService.directoryCountryList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.directoryCountryList.params = [];
proxies.MagentoService.directoryCountryList.rtype = [];

/** List of regions in specified country */

proxies.MagentoService.directoryRegionList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.directoryRegionList.fname = "directoryRegionList";
proxies.MagentoService.directoryRegionList.service = proxies.MagentoService;
proxies.MagentoService.directoryRegionList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.directoryRegionList.params = [];
proxies.MagentoService.directoryRegionList.rtype = [];

/** Retrieve customers */

proxies.MagentoService.customerCustomerList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerCustomerList.fname = "customerCustomerList";
proxies.MagentoService.customerCustomerList.service = proxies.MagentoService;
proxies.MagentoService.customerCustomerList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerCustomerList.params = [];
proxies.MagentoService.customerCustomerList.rtype = [];

/** Create customer */

proxies.MagentoService.customerCustomerCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerCustomerCreate.fname = "customerCustomerCreate";
proxies.MagentoService.customerCustomerCreate.service = proxies.MagentoService;
proxies.MagentoService.customerCustomerCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerCustomerCreate.params = [];
proxies.MagentoService.customerCustomerCreate.rtype = [];

/** Retrieve customer data */

proxies.MagentoService.customerCustomerInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerCustomerInfo.fname = "customerCustomerInfo";
proxies.MagentoService.customerCustomerInfo.service = proxies.MagentoService;
proxies.MagentoService.customerCustomerInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerCustomerInfo.params = [];
proxies.MagentoService.customerCustomerInfo.rtype = [];

/** Update customer data */

proxies.MagentoService.customerCustomerUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerCustomerUpdate.fname = "customerCustomerUpdate";
proxies.MagentoService.customerCustomerUpdate.service = proxies.MagentoService;
proxies.MagentoService.customerCustomerUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerCustomerUpdate.params = [];
proxies.MagentoService.customerCustomerUpdate.rtype = [];

/** Delete customer */

proxies.MagentoService.customerCustomerDelete = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerCustomerDelete.fname = "customerCustomerDelete";
proxies.MagentoService.customerCustomerDelete.service = proxies.MagentoService;
proxies.MagentoService.customerCustomerDelete.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerCustomerDelete.params = [];
proxies.MagentoService.customerCustomerDelete.rtype = [];

/** Retrieve customer groups */

proxies.MagentoService.customerGroupList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerGroupList.fname = "customerGroupList";
proxies.MagentoService.customerGroupList.service = proxies.MagentoService;
proxies.MagentoService.customerGroupList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerGroupList.params = [];
proxies.MagentoService.customerGroupList.rtype = [];

/** Retrieve customer addresses */

proxies.MagentoService.customerAddressList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerAddressList.fname = "customerAddressList";
proxies.MagentoService.customerAddressList.service = proxies.MagentoService;
proxies.MagentoService.customerAddressList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerAddressList.params = [];
proxies.MagentoService.customerAddressList.rtype = [];

/** Create customer address */

proxies.MagentoService.customerAddressCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerAddressCreate.fname = "customerAddressCreate";
proxies.MagentoService.customerAddressCreate.service = proxies.MagentoService;
proxies.MagentoService.customerAddressCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerAddressCreate.params = [];
proxies.MagentoService.customerAddressCreate.rtype = [];

/** Retrieve customer address data */

proxies.MagentoService.customerAddressInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerAddressInfo.fname = "customerAddressInfo";
proxies.MagentoService.customerAddressInfo.service = proxies.MagentoService;
proxies.MagentoService.customerAddressInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerAddressInfo.params = [];
proxies.MagentoService.customerAddressInfo.rtype = [];

/** Update customer address data */

proxies.MagentoService.customerAddressUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerAddressUpdate.fname = "customerAddressUpdate";
proxies.MagentoService.customerAddressUpdate.service = proxies.MagentoService;
proxies.MagentoService.customerAddressUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerAddressUpdate.params = [];
proxies.MagentoService.customerAddressUpdate.rtype = [];

/** Delete customer address */

proxies.MagentoService.customerAddressDelete = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.customerAddressDelete.fname = "customerAddressDelete";
proxies.MagentoService.customerAddressDelete.service = proxies.MagentoService;
proxies.MagentoService.customerAddressDelete.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.customerAddressDelete.params = [];
proxies.MagentoService.customerAddressDelete.rtype = [];

/** Set_Get current store view */

proxies.MagentoService.catalogCategoryCurrentStore = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryCurrentStore.fname = "catalogCategoryCurrentStore";
proxies.MagentoService.catalogCategoryCurrentStore.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryCurrentStore.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryCurrentStore.params = [];
proxies.MagentoService.catalogCategoryCurrentStore.rtype = [];

/** Retrieve hierarchical tree of categories. */

proxies.MagentoService.catalogCategoryTree = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryTree.fname = "catalogCategoryTree";
proxies.MagentoService.catalogCategoryTree.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryTree.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryTree.params = [];
proxies.MagentoService.catalogCategoryTree.rtype = [];

/** Retrieve hierarchical tree of categories. */

proxies.MagentoService.catalogCategoryLevel = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryLevel.fname = "catalogCategoryLevel";
proxies.MagentoService.catalogCategoryLevel.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryLevel.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryLevel.params = [];
proxies.MagentoService.catalogCategoryLevel.rtype = [];

/** Retrieve hierarchical tree of categories. */

proxies.MagentoService.catalogCategoryInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryInfo.fname = "catalogCategoryInfo";
proxies.MagentoService.catalogCategoryInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryInfo.params = [];
proxies.MagentoService.catalogCategoryInfo.rtype = [];

/** Create new category and return its id. */

proxies.MagentoService.catalogCategoryCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryCreate.fname = "catalogCategoryCreate";
proxies.MagentoService.catalogCategoryCreate.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryCreate.params = [];
proxies.MagentoService.catalogCategoryCreate.rtype = [];

/** Update category */

proxies.MagentoService.catalogCategoryUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryUpdate.fname = "catalogCategoryUpdate";
proxies.MagentoService.catalogCategoryUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryUpdate.params = [];
proxies.MagentoService.catalogCategoryUpdate.rtype = [];

/** Move category in tree */

proxies.MagentoService.catalogCategoryMove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryMove.fname = "catalogCategoryMove";
proxies.MagentoService.catalogCategoryMove.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryMove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryMove.params = [];
proxies.MagentoService.catalogCategoryMove.rtype = [];

/** Delete category */

proxies.MagentoService.catalogCategoryDelete = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryDelete.fname = "catalogCategoryDelete";
proxies.MagentoService.catalogCategoryDelete.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryDelete.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryDelete.params = [];
proxies.MagentoService.catalogCategoryDelete.rtype = [];

/** Retrieve list of assigned products */

proxies.MagentoService.catalogCategoryAssignedProducts = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryAssignedProducts.fname = "catalogCategoryAssignedProducts";
proxies.MagentoService.catalogCategoryAssignedProducts.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryAssignedProducts.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryAssignedProducts.params = [];
proxies.MagentoService.catalogCategoryAssignedProducts.rtype = [];

/** Assign product to category */

proxies.MagentoService.catalogCategoryAssignProduct = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryAssignProduct.fname = "catalogCategoryAssignProduct";
proxies.MagentoService.catalogCategoryAssignProduct.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryAssignProduct.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryAssignProduct.params = [];
proxies.MagentoService.catalogCategoryAssignProduct.rtype = [];

/** Update assigned product */

proxies.MagentoService.catalogCategoryUpdateProduct = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryUpdateProduct.fname = "catalogCategoryUpdateProduct";
proxies.MagentoService.catalogCategoryUpdateProduct.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryUpdateProduct.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryUpdateProduct.params = [];
proxies.MagentoService.catalogCategoryUpdateProduct.rtype = [];

/** Remove product assignment from category */

proxies.MagentoService.catalogCategoryRemoveProduct = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryRemoveProduct.fname = "catalogCategoryRemoveProduct";
proxies.MagentoService.catalogCategoryRemoveProduct.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryRemoveProduct.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryRemoveProduct.params = [];
proxies.MagentoService.catalogCategoryRemoveProduct.rtype = [];

/** Set/Get current store view */

proxies.MagentoService.catalogProductCurrentStore = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCurrentStore.fname = "catalogProductCurrentStore";
proxies.MagentoService.catalogProductCurrentStore.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCurrentStore.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCurrentStore.params = [];
proxies.MagentoService.catalogProductCurrentStore.rtype = [];

/** Get list of additional attributes which are not in default create/update list */

proxies.MagentoService.catalogProductListOfAdditionalAttributes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductListOfAdditionalAttributes.fname = "catalogProductListOfAdditionalAttributes";
proxies.MagentoService.catalogProductListOfAdditionalAttributes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductListOfAdditionalAttributes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductListOfAdditionalAttributes.params = [];
proxies.MagentoService.catalogProductListOfAdditionalAttributes.rtype = [];

/** Retrieve products list by filters */

proxies.MagentoService.catalogProductList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductList.fname = "catalogProductList";
proxies.MagentoService.catalogProductList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductList.params = [];
proxies.MagentoService.catalogProductList.rtype = [];

/** Retrieve product */

proxies.MagentoService.catalogProductInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductInfo.fname = "catalogProductInfo";
proxies.MagentoService.catalogProductInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductInfo.params = [];
proxies.MagentoService.catalogProductInfo.rtype = [];

/** Create new product and return product id */

proxies.MagentoService.catalogProductCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCreate.fname = "catalogProductCreate";
proxies.MagentoService.catalogProductCreate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCreate.params = [];
proxies.MagentoService.catalogProductCreate.rtype = [];

/** Update product */

proxies.MagentoService.catalogProductUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductUpdate.fname = "catalogProductUpdate";
proxies.MagentoService.catalogProductUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductUpdate.params = [];
proxies.MagentoService.catalogProductUpdate.rtype = [];

/** Product multi update */

proxies.MagentoService.catalogProductMultiUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductMultiUpdate.fname = "catalogProductMultiUpdate";
proxies.MagentoService.catalogProductMultiUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductMultiUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductMultiUpdate.params = [];
proxies.MagentoService.catalogProductMultiUpdate.rtype = [];

/** Update product special price */

proxies.MagentoService.catalogProductSetSpecialPrice = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductSetSpecialPrice.fname = "catalogProductSetSpecialPrice";
proxies.MagentoService.catalogProductSetSpecialPrice.service = proxies.MagentoService;
proxies.MagentoService.catalogProductSetSpecialPrice.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductSetSpecialPrice.params = [];
proxies.MagentoService.catalogProductSetSpecialPrice.rtype = [];

/** Get product special price data */

proxies.MagentoService.catalogProductGetSpecialPrice = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductGetSpecialPrice.fname = "catalogProductGetSpecialPrice";
proxies.MagentoService.catalogProductGetSpecialPrice.service = proxies.MagentoService;
proxies.MagentoService.catalogProductGetSpecialPrice.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductGetSpecialPrice.params = [];
proxies.MagentoService.catalogProductGetSpecialPrice.rtype = [];

/** Delete product */

proxies.MagentoService.catalogProductDelete = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductDelete.fname = "catalogProductDelete";
proxies.MagentoService.catalogProductDelete.service = proxies.MagentoService;
proxies.MagentoService.catalogProductDelete.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductDelete.params = [];
proxies.MagentoService.catalogProductDelete.rtype = [];

/** Set/Get current store view */

proxies.MagentoService.catalogProductAttributeCurrentStore = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeCurrentStore.fname = "catalogProductAttributeCurrentStore";
proxies.MagentoService.catalogProductAttributeCurrentStore.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeCurrentStore.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeCurrentStore.params = [];
proxies.MagentoService.catalogProductAttributeCurrentStore.rtype = [];

/** Create product attribute set based on another set */

proxies.MagentoService.catalogProductAttributeSetCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetCreate.fname = "catalogProductAttributeSetCreate";
proxies.MagentoService.catalogProductAttributeSetCreate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetCreate.params = [];
proxies.MagentoService.catalogProductAttributeSetCreate.rtype = [];

/** Retrieve attribute list */

proxies.MagentoService.catalogProductAttributeList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeList.fname = "catalogProductAttributeList";
proxies.MagentoService.catalogProductAttributeList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeList.params = [];
proxies.MagentoService.catalogProductAttributeList.rtype = [];

/** Retrieve attribute options */

proxies.MagentoService.catalogProductAttributeOptions = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeOptions.fname = "catalogProductAttributeOptions";
proxies.MagentoService.catalogProductAttributeOptions.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeOptions.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeOptions.params = [];
proxies.MagentoService.catalogProductAttributeOptions.rtype = [];

/** Remove product attribute set */

proxies.MagentoService.catalogProductAttributeSetRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetRemove.fname = "catalogProductAttributeSetRemove";
proxies.MagentoService.catalogProductAttributeSetRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetRemove.params = [];
proxies.MagentoService.catalogProductAttributeSetRemove.rtype = [];

/** Retrieve product attribute sets */

proxies.MagentoService.catalogProductAttributeSetList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetList.fname = "catalogProductAttributeSetList";
proxies.MagentoService.catalogProductAttributeSetList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetList.params = [];
proxies.MagentoService.catalogProductAttributeSetList.rtype = [];

/** Add attribute into attribute set */

proxies.MagentoService.catalogProductAttributeSetAttributeAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetAttributeAdd.fname = "catalogProductAttributeSetAttributeAdd";
proxies.MagentoService.catalogProductAttributeSetAttributeAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetAttributeAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetAttributeAdd.params = [];
proxies.MagentoService.catalogProductAttributeSetAttributeAdd.rtype = [];

/** Remove attribute from attribute set */

proxies.MagentoService.catalogProductAttributeSetAttributeRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetAttributeRemove.fname = "catalogProductAttributeSetAttributeRemove";
proxies.MagentoService.catalogProductAttributeSetAttributeRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetAttributeRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetAttributeRemove.params = [];
proxies.MagentoService.catalogProductAttributeSetAttributeRemove.rtype = [];

/** Create group within existing attribute set */

proxies.MagentoService.catalogProductAttributeSetGroupAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetGroupAdd.fname = "catalogProductAttributeSetGroupAdd";
proxies.MagentoService.catalogProductAttributeSetGroupAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetGroupAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetGroupAdd.params = [];
proxies.MagentoService.catalogProductAttributeSetGroupAdd.rtype = [];

/** Rename existing group */

proxies.MagentoService.catalogProductAttributeSetGroupRename = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetGroupRename.fname = "catalogProductAttributeSetGroupRename";
proxies.MagentoService.catalogProductAttributeSetGroupRename.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetGroupRename.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetGroupRename.params = [];
proxies.MagentoService.catalogProductAttributeSetGroupRename.rtype = [];

/** Remove group from attribute set */

proxies.MagentoService.catalogProductAttributeSetGroupRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeSetGroupRemove.fname = "catalogProductAttributeSetGroupRemove";
proxies.MagentoService.catalogProductAttributeSetGroupRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeSetGroupRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeSetGroupRemove.params = [];
proxies.MagentoService.catalogProductAttributeSetGroupRemove.rtype = [];

/** Get list of possible attribute types */

proxies.MagentoService.catalogProductAttributeTypes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeTypes.fname = "catalogProductAttributeTypes";
proxies.MagentoService.catalogProductAttributeTypes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeTypes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeTypes.params = [];
proxies.MagentoService.catalogProductAttributeTypes.rtype = [];

/** Create new attribute */

proxies.MagentoService.catalogProductAttributeCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeCreate.fname = "catalogProductAttributeCreate";
proxies.MagentoService.catalogProductAttributeCreate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeCreate.params = [];
proxies.MagentoService.catalogProductAttributeCreate.rtype = [];

/** Set/Get current store view */

proxies.MagentoService.catalogCategoryAttributeCurrentStore = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryAttributeCurrentStore.fname = "catalogCategoryAttributeCurrentStore";
proxies.MagentoService.catalogCategoryAttributeCurrentStore.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryAttributeCurrentStore.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryAttributeCurrentStore.params = [];
proxies.MagentoService.catalogCategoryAttributeCurrentStore.rtype = [];

/** Set/Get current store view */

proxies.MagentoService.catalogProductAttributeMediaCurrentStore = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaCurrentStore.fname = "catalogProductAttributeMediaCurrentStore";
proxies.MagentoService.catalogProductAttributeMediaCurrentStore.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaCurrentStore.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaCurrentStore.params = [];
proxies.MagentoService.catalogProductAttributeMediaCurrentStore.rtype = [];

/** Delete attribute */

proxies.MagentoService.catalogProductAttributeRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeRemove.fname = "catalogProductAttributeRemove";
proxies.MagentoService.catalogProductAttributeRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeRemove.params = [];
proxies.MagentoService.catalogProductAttributeRemove.rtype = [];

/** Get full information about attribute with list of options */

proxies.MagentoService.catalogProductAttributeInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeInfo.fname = "catalogProductAttributeInfo";
proxies.MagentoService.catalogProductAttributeInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeInfo.params = [];
proxies.MagentoService.catalogProductAttributeInfo.rtype = [];

/** Update attribute */

proxies.MagentoService.catalogProductAttributeUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeUpdate.fname = "catalogProductAttributeUpdate";
proxies.MagentoService.catalogProductAttributeUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeUpdate.params = [];
proxies.MagentoService.catalogProductAttributeUpdate.rtype = [];

/** Add option to attribute */

proxies.MagentoService.catalogProductAttributeAddOption = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeAddOption.fname = "catalogProductAttributeAddOption";
proxies.MagentoService.catalogProductAttributeAddOption.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeAddOption.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeAddOption.params = [];
proxies.MagentoService.catalogProductAttributeAddOption.rtype = [];

/** Remove option from attribute */

proxies.MagentoService.catalogProductAttributeRemoveOption = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeRemoveOption.fname = "catalogProductAttributeRemoveOption";
proxies.MagentoService.catalogProductAttributeRemoveOption.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeRemoveOption.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeRemoveOption.params = [];
proxies.MagentoService.catalogProductAttributeRemoveOption.rtype = [];

/** Retrieve product types */

proxies.MagentoService.catalogProductTypeList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTypeList.fname = "catalogProductTypeList";
proxies.MagentoService.catalogProductTypeList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTypeList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTypeList.params = [];
proxies.MagentoService.catalogProductTypeList.rtype = [];

/** Retrieve product tier prices */

proxies.MagentoService.catalogProductAttributeTierPriceInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeTierPriceInfo.fname = "catalogProductAttributeTierPriceInfo";
proxies.MagentoService.catalogProductAttributeTierPriceInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeTierPriceInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeTierPriceInfo.params = [];
proxies.MagentoService.catalogProductAttributeTierPriceInfo.rtype = [];

/** Update product tier prices */

proxies.MagentoService.catalogProductAttributeTierPriceUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeTierPriceUpdate.fname = "catalogProductAttributeTierPriceUpdate";
proxies.MagentoService.catalogProductAttributeTierPriceUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeTierPriceUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeTierPriceUpdate.params = [];
proxies.MagentoService.catalogProductAttributeTierPriceUpdate.rtype = [];

/** Retrieve category attributes */

proxies.MagentoService.catalogCategoryAttributeList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryAttributeList.fname = "catalogCategoryAttributeList";
proxies.MagentoService.catalogCategoryAttributeList.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryAttributeList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryAttributeList.params = [];
proxies.MagentoService.catalogCategoryAttributeList.rtype = [];

/** Retrieve attribute options */

proxies.MagentoService.catalogCategoryAttributeOptions = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogCategoryAttributeOptions.fname = "catalogCategoryAttributeOptions";
proxies.MagentoService.catalogCategoryAttributeOptions.service = proxies.MagentoService;
proxies.MagentoService.catalogCategoryAttributeOptions.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogCategoryAttributeOptions.params = [];
proxies.MagentoService.catalogCategoryAttributeOptions.rtype = [];

/** Retrieve product image list */

proxies.MagentoService.catalogProductAttributeMediaList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaList.fname = "catalogProductAttributeMediaList";
proxies.MagentoService.catalogProductAttributeMediaList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaList.params = [];
proxies.MagentoService.catalogProductAttributeMediaList.rtype = [];

/** Retrieve product image data */

proxies.MagentoService.catalogProductAttributeMediaInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaInfo.fname = "catalogProductAttributeMediaInfo";
proxies.MagentoService.catalogProductAttributeMediaInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaInfo.params = [];
proxies.MagentoService.catalogProductAttributeMediaInfo.rtype = [];

/** Retrieve product image types */

proxies.MagentoService.catalogProductAttributeMediaTypes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaTypes.fname = "catalogProductAttributeMediaTypes";
proxies.MagentoService.catalogProductAttributeMediaTypes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaTypes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaTypes.params = [];
proxies.MagentoService.catalogProductAttributeMediaTypes.rtype = [];

/** Upload new product image */

proxies.MagentoService.catalogProductAttributeMediaCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaCreate.fname = "catalogProductAttributeMediaCreate";
proxies.MagentoService.catalogProductAttributeMediaCreate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaCreate.params = [];
proxies.MagentoService.catalogProductAttributeMediaCreate.rtype = [];

/** Update product image */

proxies.MagentoService.catalogProductAttributeMediaUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaUpdate.fname = "catalogProductAttributeMediaUpdate";
proxies.MagentoService.catalogProductAttributeMediaUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaUpdate.params = [];
proxies.MagentoService.catalogProductAttributeMediaUpdate.rtype = [];

/** Remove product image */

proxies.MagentoService.catalogProductAttributeMediaRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductAttributeMediaRemove.fname = "catalogProductAttributeMediaRemove";
proxies.MagentoService.catalogProductAttributeMediaRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductAttributeMediaRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductAttributeMediaRemove.params = [];
proxies.MagentoService.catalogProductAttributeMediaRemove.rtype = [];

/** Retrieve linked products */

proxies.MagentoService.catalogProductLinkList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkList.fname = "catalogProductLinkList";
proxies.MagentoService.catalogProductLinkList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkList.params = [];
proxies.MagentoService.catalogProductLinkList.rtype = [];

/** Assign product link */

proxies.MagentoService.catalogProductLinkAssign = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkAssign.fname = "catalogProductLinkAssign";
proxies.MagentoService.catalogProductLinkAssign.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkAssign.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkAssign.params = [];
proxies.MagentoService.catalogProductLinkAssign.rtype = [];

/** Update product link */

proxies.MagentoService.catalogProductLinkUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkUpdate.fname = "catalogProductLinkUpdate";
proxies.MagentoService.catalogProductLinkUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkUpdate.params = [];
proxies.MagentoService.catalogProductLinkUpdate.rtype = [];

/** Remove product link */

proxies.MagentoService.catalogProductLinkRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkRemove.fname = "catalogProductLinkRemove";
proxies.MagentoService.catalogProductLinkRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkRemove.params = [];
proxies.MagentoService.catalogProductLinkRemove.rtype = [];

/** Retrieve product link types */

proxies.MagentoService.catalogProductLinkTypes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkTypes.fname = "catalogProductLinkTypes";
proxies.MagentoService.catalogProductLinkTypes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkTypes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkTypes.params = [];
proxies.MagentoService.catalogProductLinkTypes.rtype = [];

/** Retrieve product link type attributes */

proxies.MagentoService.catalogProductLinkAttributes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductLinkAttributes.fname = "catalogProductLinkAttributes";
proxies.MagentoService.catalogProductLinkAttributes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductLinkAttributes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductLinkAttributes.params = [];
proxies.MagentoService.catalogProductLinkAttributes.rtype = [];

/** Add new custom option into product */

proxies.MagentoService.catalogProductCustomOptionAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionAdd.fname = "catalogProductCustomOptionAdd";
proxies.MagentoService.catalogProductCustomOptionAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionAdd.params = [];
proxies.MagentoService.catalogProductCustomOptionAdd.rtype = [];

/** Update product custom option */

proxies.MagentoService.catalogProductCustomOptionUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionUpdate.fname = "catalogProductCustomOptionUpdate";
proxies.MagentoService.catalogProductCustomOptionUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionUpdate.params = [];
proxies.MagentoService.catalogProductCustomOptionUpdate.rtype = [];

/** Get full information about custom option in product */

proxies.MagentoService.catalogProductCustomOptionInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionInfo.fname = "catalogProductCustomOptionInfo";
proxies.MagentoService.catalogProductCustomOptionInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionInfo.params = [];
proxies.MagentoService.catalogProductCustomOptionInfo.rtype = [];

/** Get list of available custom option types */

proxies.MagentoService.catalogProductCustomOptionTypes = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionTypes.fname = "catalogProductCustomOptionTypes";
proxies.MagentoService.catalogProductCustomOptionTypes.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionTypes.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionTypes.params = [];
proxies.MagentoService.catalogProductCustomOptionTypes.rtype = [];

/** Retrieve custom option value info */

proxies.MagentoService.catalogProductCustomOptionValueInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionValueInfo.fname = "catalogProductCustomOptionValueInfo";
proxies.MagentoService.catalogProductCustomOptionValueInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionValueInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionValueInfo.params = [];
proxies.MagentoService.catalogProductCustomOptionValueInfo.rtype = [];

/** Retrieve custom option values list */

proxies.MagentoService.catalogProductCustomOptionValueList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionValueList.fname = "catalogProductCustomOptionValueList";
proxies.MagentoService.catalogProductCustomOptionValueList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionValueList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionValueList.params = [];
proxies.MagentoService.catalogProductCustomOptionValueList.rtype = [];

/** Add new custom option values */

proxies.MagentoService.catalogProductCustomOptionValueAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionValueAdd.fname = "catalogProductCustomOptionValueAdd";
proxies.MagentoService.catalogProductCustomOptionValueAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionValueAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionValueAdd.params = [];
proxies.MagentoService.catalogProductCustomOptionValueAdd.rtype = [];

/** Update custom option value */

proxies.MagentoService.catalogProductCustomOptionValueUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionValueUpdate.fname = "catalogProductCustomOptionValueUpdate";
proxies.MagentoService.catalogProductCustomOptionValueUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionValueUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionValueUpdate.params = [];
proxies.MagentoService.catalogProductCustomOptionValueUpdate.rtype = [];

/** Remove value from custom option */

proxies.MagentoService.catalogProductCustomOptionValueRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionValueRemove.fname = "catalogProductCustomOptionValueRemove";
proxies.MagentoService.catalogProductCustomOptionValueRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionValueRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionValueRemove.params = [];
proxies.MagentoService.catalogProductCustomOptionValueRemove.rtype = [];

/** Retrieve list of product custom options */

proxies.MagentoService.catalogProductCustomOptionList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionList.fname = "catalogProductCustomOptionList";
proxies.MagentoService.catalogProductCustomOptionList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionList.params = [];
proxies.MagentoService.catalogProductCustomOptionList.rtype = [];

/** Remove custom option */

proxies.MagentoService.catalogProductCustomOptionRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductCustomOptionRemove.fname = "catalogProductCustomOptionRemove";
proxies.MagentoService.catalogProductCustomOptionRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductCustomOptionRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductCustomOptionRemove.params = [];
proxies.MagentoService.catalogProductCustomOptionRemove.rtype = [];

/** Retrieve list of orders by filters */

proxies.MagentoService.salesOrderList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderList.fname = "salesOrderList";
proxies.MagentoService.salesOrderList.service = proxies.MagentoService;
proxies.MagentoService.salesOrderList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderList.params = [];
proxies.MagentoService.salesOrderList.rtype = [];

/** Retrieve order information */

proxies.MagentoService.salesOrderInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInfo.fname = "salesOrderInfo";
proxies.MagentoService.salesOrderInfo.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInfo.params = [];
proxies.MagentoService.salesOrderInfo.rtype = [];

/** Add comment to order */

proxies.MagentoService.salesOrderAddComment = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderAddComment.fname = "salesOrderAddComment";
proxies.MagentoService.salesOrderAddComment.service = proxies.MagentoService;
proxies.MagentoService.salesOrderAddComment.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderAddComment.params = [];
proxies.MagentoService.salesOrderAddComment.rtype = [];

/** Hold order */

proxies.MagentoService.salesOrderHold = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderHold.fname = "salesOrderHold";
proxies.MagentoService.salesOrderHold.service = proxies.MagentoService;
proxies.MagentoService.salesOrderHold.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderHold.params = [];
proxies.MagentoService.salesOrderHold.rtype = [];

/** Unhold order */

proxies.MagentoService.salesOrderUnhold = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderUnhold.fname = "salesOrderUnhold";
proxies.MagentoService.salesOrderUnhold.service = proxies.MagentoService;
proxies.MagentoService.salesOrderUnhold.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderUnhold.params = [];
proxies.MagentoService.salesOrderUnhold.rtype = [];

/** Cancel order */

proxies.MagentoService.salesOrderCancel = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCancel.fname = "salesOrderCancel";
proxies.MagentoService.salesOrderCancel.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCancel.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCancel.params = [];
proxies.MagentoService.salesOrderCancel.rtype = [];

/** Retrieve list of shipments by filters */

proxies.MagentoService.salesOrderShipmentList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentList.fname = "salesOrderShipmentList";
proxies.MagentoService.salesOrderShipmentList.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentList.params = [];
proxies.MagentoService.salesOrderShipmentList.rtype = [];

/** Retrieve shipment information */

proxies.MagentoService.salesOrderShipmentInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentInfo.fname = "salesOrderShipmentInfo";
proxies.MagentoService.salesOrderShipmentInfo.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentInfo.params = [];
proxies.MagentoService.salesOrderShipmentInfo.rtype = [];

/** Create new shipment for order */

proxies.MagentoService.salesOrderShipmentCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentCreate.fname = "salesOrderShipmentCreate";
proxies.MagentoService.salesOrderShipmentCreate.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentCreate.params = [];
proxies.MagentoService.salesOrderShipmentCreate.rtype = [];

/** Add new comment to shipment */

proxies.MagentoService.salesOrderShipmentAddComment = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentAddComment.fname = "salesOrderShipmentAddComment";
proxies.MagentoService.salesOrderShipmentAddComment.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentAddComment.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentAddComment.params = [];
proxies.MagentoService.salesOrderShipmentAddComment.rtype = [];

/** Add new tracking number */

proxies.MagentoService.salesOrderShipmentAddTrack = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentAddTrack.fname = "salesOrderShipmentAddTrack";
proxies.MagentoService.salesOrderShipmentAddTrack.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentAddTrack.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentAddTrack.params = [];
proxies.MagentoService.salesOrderShipmentAddTrack.rtype = [];

/** Send shipment info */

proxies.MagentoService.salesOrderShipmentSendInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentSendInfo.fname = "salesOrderShipmentSendInfo";
proxies.MagentoService.salesOrderShipmentSendInfo.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentSendInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentSendInfo.params = [];
proxies.MagentoService.salesOrderShipmentSendInfo.rtype = [];

/** Remove tracking number */

proxies.MagentoService.salesOrderShipmentRemoveTrack = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentRemoveTrack.fname = "salesOrderShipmentRemoveTrack";
proxies.MagentoService.salesOrderShipmentRemoveTrack.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentRemoveTrack.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentRemoveTrack.params = [];
proxies.MagentoService.salesOrderShipmentRemoveTrack.rtype = [];

/** Retrieve list of allowed carriers for order */

proxies.MagentoService.salesOrderShipmentGetCarriers = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderShipmentGetCarriers.fname = "salesOrderShipmentGetCarriers";
proxies.MagentoService.salesOrderShipmentGetCarriers.service = proxies.MagentoService;
proxies.MagentoService.salesOrderShipmentGetCarriers.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderShipmentGetCarriers.params = [];
proxies.MagentoService.salesOrderShipmentGetCarriers.rtype = [];

/** Retrieve list of invoices by filters */

proxies.MagentoService.salesOrderInvoiceList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceList.fname = "salesOrderInvoiceList";
proxies.MagentoService.salesOrderInvoiceList.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceList.params = [];
proxies.MagentoService.salesOrderInvoiceList.rtype = [];

/** Retrieve invoice information */

proxies.MagentoService.salesOrderInvoiceInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceInfo.fname = "salesOrderInvoiceInfo";
proxies.MagentoService.salesOrderInvoiceInfo.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceInfo.params = [];
proxies.MagentoService.salesOrderInvoiceInfo.rtype = [];

/** Create new invoice for order */

proxies.MagentoService.salesOrderInvoiceCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceCreate.fname = "salesOrderInvoiceCreate";
proxies.MagentoService.salesOrderInvoiceCreate.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceCreate.params = [];
proxies.MagentoService.salesOrderInvoiceCreate.rtype = [];

/** Add new comment to shipment */

proxies.MagentoService.salesOrderInvoiceAddComment = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceAddComment.fname = "salesOrderInvoiceAddComment";
proxies.MagentoService.salesOrderInvoiceAddComment.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceAddComment.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceAddComment.params = [];
proxies.MagentoService.salesOrderInvoiceAddComment.rtype = [];

/** Capture invoice */

proxies.MagentoService.salesOrderInvoiceCapture = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceCapture.fname = "salesOrderInvoiceCapture";
proxies.MagentoService.salesOrderInvoiceCapture.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceCapture.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceCapture.params = [];
proxies.MagentoService.salesOrderInvoiceCapture.rtype = [];

/** Void invoice */

proxies.MagentoService.salesOrderInvoiceVoid = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceVoid.fname = "salesOrderInvoiceVoid";
proxies.MagentoService.salesOrderInvoiceVoid.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceVoid.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceVoid.params = [];
proxies.MagentoService.salesOrderInvoiceVoid.rtype = [];

/** Cancel invoice */

proxies.MagentoService.salesOrderInvoiceCancel = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderInvoiceCancel.fname = "salesOrderInvoiceCancel";
proxies.MagentoService.salesOrderInvoiceCancel.service = proxies.MagentoService;
proxies.MagentoService.salesOrderInvoiceCancel.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderInvoiceCancel.params = [];
proxies.MagentoService.salesOrderInvoiceCancel.rtype = [];

/** Retrieve list of creditmemos by filters */

proxies.MagentoService.salesOrderCreditmemoList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCreditmemoList.fname = "salesOrderCreditmemoList";
proxies.MagentoService.salesOrderCreditmemoList.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCreditmemoList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCreditmemoList.params = [];
proxies.MagentoService.salesOrderCreditmemoList.rtype = [];

/** Retrieve creditmemo information */

proxies.MagentoService.salesOrderCreditmemoInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCreditmemoInfo.fname = "salesOrderCreditmemoInfo";
proxies.MagentoService.salesOrderCreditmemoInfo.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCreditmemoInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCreditmemoInfo.params = [];
proxies.MagentoService.salesOrderCreditmemoInfo.rtype = [];

/** Create new creditmemo for order */

proxies.MagentoService.salesOrderCreditmemoCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCreditmemoCreate.fname = "salesOrderCreditmemoCreate";
proxies.MagentoService.salesOrderCreditmemoCreate.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCreditmemoCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCreditmemoCreate.params = [];
proxies.MagentoService.salesOrderCreditmemoCreate.rtype = [];

/** Add new comment to shipment */

proxies.MagentoService.salesOrderCreditmemoAddComment = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCreditmemoAddComment.fname = "salesOrderCreditmemoAddComment";
proxies.MagentoService.salesOrderCreditmemoAddComment.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCreditmemoAddComment.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCreditmemoAddComment.params = [];
proxies.MagentoService.salesOrderCreditmemoAddComment.rtype = [];

/** Cancel creditmemo */

proxies.MagentoService.salesOrderCreditmemoCancel = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.salesOrderCreditmemoCancel.fname = "salesOrderCreditmemoCancel";
proxies.MagentoService.salesOrderCreditmemoCancel.service = proxies.MagentoService;
proxies.MagentoService.salesOrderCreditmemoCancel.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.salesOrderCreditmemoCancel.params = [];
proxies.MagentoService.salesOrderCreditmemoCancel.rtype = [];

/** Retrieve stock data by product ids */

proxies.MagentoService.catalogInventoryStockItemList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogInventoryStockItemList.fname = "catalogInventoryStockItemList";
proxies.MagentoService.catalogInventoryStockItemList.service = proxies.MagentoService;
proxies.MagentoService.catalogInventoryStockItemList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogInventoryStockItemList.params = [];
proxies.MagentoService.catalogInventoryStockItemList.rtype = [];

/** Update product stock data */

proxies.MagentoService.catalogInventoryStockItemUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogInventoryStockItemUpdate.fname = "catalogInventoryStockItemUpdate";
proxies.MagentoService.catalogInventoryStockItemUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogInventoryStockItemUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogInventoryStockItemUpdate.params = [];
proxies.MagentoService.catalogInventoryStockItemUpdate.rtype = [];

/** Multi stock item update */

proxies.MagentoService.catalogInventoryStockItemMultiUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogInventoryStockItemMultiUpdate.fname = "catalogInventoryStockItemMultiUpdate";
proxies.MagentoService.catalogInventoryStockItemMultiUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogInventoryStockItemMultiUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogInventoryStockItemMultiUpdate.params = [];
proxies.MagentoService.catalogInventoryStockItemMultiUpdate.rtype = [];

/** Create shopping cart */

proxies.MagentoService.shoppingCartCreate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartCreate.fname = "shoppingCartCreate";
proxies.MagentoService.shoppingCartCreate.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartCreate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartCreate.params = [];
proxies.MagentoService.shoppingCartCreate.rtype = [];

/** Retrieve information about shopping cart */

proxies.MagentoService.shoppingCartInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartInfo.fname = "shoppingCartInfo";
proxies.MagentoService.shoppingCartInfo.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartInfo.params = [];
proxies.MagentoService.shoppingCartInfo.rtype = [];

/** Get total prices for shopping cart */

proxies.MagentoService.shoppingCartTotals = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartTotals.fname = "shoppingCartTotals";
proxies.MagentoService.shoppingCartTotals.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartTotals.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartTotals.params = [];
proxies.MagentoService.shoppingCartTotals.rtype = [];

/** Create an order from shopping cart */

proxies.MagentoService.shoppingCartOrder = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartOrder.fname = "shoppingCartOrder";
proxies.MagentoService.shoppingCartOrder.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartOrder.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartOrder.params = [];
proxies.MagentoService.shoppingCartOrder.rtype = [];

/** Get terms and conditions */

proxies.MagentoService.shoppingCartLicense = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartLicense.fname = "shoppingCartLicense";
proxies.MagentoService.shoppingCartLicense.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartLicense.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartLicense.params = [];
proxies.MagentoService.shoppingCartLicense.rtype = [];

/** Add product(s) to shopping cart */

proxies.MagentoService.shoppingCartProductAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartProductAdd.fname = "shoppingCartProductAdd";
proxies.MagentoService.shoppingCartProductAdd.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartProductAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartProductAdd.params = [];
proxies.MagentoService.shoppingCartProductAdd.rtype = [];

/** Update product(s) quantities in shopping cart */

proxies.MagentoService.shoppingCartProductUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartProductUpdate.fname = "shoppingCartProductUpdate";
proxies.MagentoService.shoppingCartProductUpdate.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartProductUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartProductUpdate.params = [];
proxies.MagentoService.shoppingCartProductUpdate.rtype = [];

/** Remove product(s) from shopping cart */

proxies.MagentoService.shoppingCartProductRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartProductRemove.fname = "shoppingCartProductRemove";
proxies.MagentoService.shoppingCartProductRemove.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartProductRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartProductRemove.params = [];
proxies.MagentoService.shoppingCartProductRemove.rtype = [];

/** Get list of products in shopping cart */

proxies.MagentoService.shoppingCartProductList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartProductList.fname = "shoppingCartProductList";
proxies.MagentoService.shoppingCartProductList.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartProductList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartProductList.params = [];
proxies.MagentoService.shoppingCartProductList.rtype = [];

/** Move product(s) to customer quote */

proxies.MagentoService.shoppingCartProductMoveToCustomerQuote = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartProductMoveToCustomerQuote.fname = "shoppingCartProductMoveToCustomerQuote";
proxies.MagentoService.shoppingCartProductMoveToCustomerQuote.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartProductMoveToCustomerQuote.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartProductMoveToCustomerQuote.params = [];
proxies.MagentoService.shoppingCartProductMoveToCustomerQuote.rtype = [];

/** Set customer for shopping cart */

proxies.MagentoService.shoppingCartCustomerSet = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartCustomerSet.fname = "shoppingCartCustomerSet";
proxies.MagentoService.shoppingCartCustomerSet.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartCustomerSet.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartCustomerSet.params = [];
proxies.MagentoService.shoppingCartCustomerSet.rtype = [];

/** Set customer's addresses in shopping cart */

proxies.MagentoService.shoppingCartCustomerAddresses = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartCustomerAddresses.fname = "shoppingCartCustomerAddresses";
proxies.MagentoService.shoppingCartCustomerAddresses.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartCustomerAddresses.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartCustomerAddresses.params = [];
proxies.MagentoService.shoppingCartCustomerAddresses.rtype = [];

/** Set shipping method */

proxies.MagentoService.shoppingCartShippingMethod = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartShippingMethod.fname = "shoppingCartShippingMethod";
proxies.MagentoService.shoppingCartShippingMethod.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartShippingMethod.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartShippingMethod.params = [];
proxies.MagentoService.shoppingCartShippingMethod.rtype = [];

/** Get list of available shipping methods */

proxies.MagentoService.shoppingCartShippingList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartShippingList.fname = "shoppingCartShippingList";
proxies.MagentoService.shoppingCartShippingList.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartShippingList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartShippingList.params = [];
proxies.MagentoService.shoppingCartShippingList.rtype = [];

/** Set payment method */

proxies.MagentoService.shoppingCartPaymentMethod = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartPaymentMethod.fname = "shoppingCartPaymentMethod";
proxies.MagentoService.shoppingCartPaymentMethod.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartPaymentMethod.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartPaymentMethod.params = [];
proxies.MagentoService.shoppingCartPaymentMethod.rtype = [];

/** Get list of available payment methods */

proxies.MagentoService.shoppingCartPaymentList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartPaymentList.fname = "shoppingCartPaymentList";
proxies.MagentoService.shoppingCartPaymentList.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartPaymentList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartPaymentList.params = [];
proxies.MagentoService.shoppingCartPaymentList.rtype = [];

/** Add coupon code for shopping cart */

proxies.MagentoService.shoppingCartCouponAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartCouponAdd.fname = "shoppingCartCouponAdd";
proxies.MagentoService.shoppingCartCouponAdd.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartCouponAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartCouponAdd.params = [];
proxies.MagentoService.shoppingCartCouponAdd.rtype = [];

/** Remove coupon code from shopping cart */

proxies.MagentoService.shoppingCartCouponRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.shoppingCartCouponRemove.fname = "shoppingCartCouponRemove";
proxies.MagentoService.shoppingCartCouponRemove.service = proxies.MagentoService;
proxies.MagentoService.shoppingCartCouponRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.shoppingCartCouponRemove.params = [];
proxies.MagentoService.shoppingCartCouponRemove.rtype = [];

/** Retrieve list of tags by product */

proxies.MagentoService.catalogProductTagList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTagList.fname = "catalogProductTagList";
proxies.MagentoService.catalogProductTagList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTagList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTagList.params = [];
proxies.MagentoService.catalogProductTagList.rtype = [];

/** Retrieve product tag info */

proxies.MagentoService.catalogProductTagInfo = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTagInfo.fname = "catalogProductTagInfo";
proxies.MagentoService.catalogProductTagInfo.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTagInfo.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTagInfo.params = [];
proxies.MagentoService.catalogProductTagInfo.rtype = [];

/** Add tag(s) to product */

proxies.MagentoService.catalogProductTagAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTagAdd.fname = "catalogProductTagAdd";
proxies.MagentoService.catalogProductTagAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTagAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTagAdd.params = [];
proxies.MagentoService.catalogProductTagAdd.rtype = [];

/** Update product tag */

proxies.MagentoService.catalogProductTagUpdate = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTagUpdate.fname = "catalogProductTagUpdate";
proxies.MagentoService.catalogProductTagUpdate.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTagUpdate.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTagUpdate.params = [];
proxies.MagentoService.catalogProductTagUpdate.rtype = [];

/** Remove product tag */

proxies.MagentoService.catalogProductTagRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductTagRemove.fname = "catalogProductTagRemove";
proxies.MagentoService.catalogProductTagRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductTagRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductTagRemove.params = [];
proxies.MagentoService.catalogProductTagRemove.rtype = [];

/** Set a gift message to the cart */

proxies.MagentoService.giftMessageSetForQuote = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.giftMessageSetForQuote.fname = "giftMessageSetForQuote";
proxies.MagentoService.giftMessageSetForQuote.service = proxies.MagentoService;
proxies.MagentoService.giftMessageSetForQuote.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.giftMessageSetForQuote.params = [];
proxies.MagentoService.giftMessageSetForQuote.rtype = [];

/** Setting a gift messages to the quote item */

proxies.MagentoService.giftMessageSetForQuoteItem = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.giftMessageSetForQuoteItem.fname = "giftMessageSetForQuoteItem";
proxies.MagentoService.giftMessageSetForQuoteItem.service = proxies.MagentoService;
proxies.MagentoService.giftMessageSetForQuoteItem.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.giftMessageSetForQuoteItem.params = [];
proxies.MagentoService.giftMessageSetForQuoteItem.rtype = [];

/** Setting a gift messages to the quote items by products */

proxies.MagentoService.giftMessageSetForQuoteProduct = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.giftMessageSetForQuoteProduct.fname = "giftMessageSetForQuoteProduct";
proxies.MagentoService.giftMessageSetForQuoteProduct.service = proxies.MagentoService;
proxies.MagentoService.giftMessageSetForQuoteProduct.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.giftMessageSetForQuoteProduct.params = [];
proxies.MagentoService.giftMessageSetForQuoteProduct.rtype = [];

/** Add links to downloadable product */

proxies.MagentoService.catalogProductDownloadableLinkAdd = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductDownloadableLinkAdd.fname = "catalogProductDownloadableLinkAdd";
proxies.MagentoService.catalogProductDownloadableLinkAdd.service = proxies.MagentoService;
proxies.MagentoService.catalogProductDownloadableLinkAdd.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductDownloadableLinkAdd.params = [];
proxies.MagentoService.catalogProductDownloadableLinkAdd.rtype = [];

/** Retrieve list of links and samples for downloadable product */

proxies.MagentoService.catalogProductDownloadableLinkList = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductDownloadableLinkList.fname = "catalogProductDownloadableLinkList";
proxies.MagentoService.catalogProductDownloadableLinkList.service = proxies.MagentoService;
proxies.MagentoService.catalogProductDownloadableLinkList.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductDownloadableLinkList.params = [];
proxies.MagentoService.catalogProductDownloadableLinkList.rtype = [];

/** Remove links and samples from downloadable product */

proxies.MagentoService.catalogProductDownloadableLinkRemove = function () { return(proxies.callSoap(arguments)); }
proxies.MagentoService.catalogProductDownloadableLinkRemove.fname = "catalogProductDownloadableLinkRemove";
proxies.MagentoService.catalogProductDownloadableLinkRemove.service = proxies.MagentoService;
proxies.MagentoService.catalogProductDownloadableLinkRemove.action = "urn:Mage_Api_Model_Server_V2_HandlerAction";
proxies.MagentoService.catalogProductDownloadableLinkRemove.params = [];
proxies.MagentoService.catalogProductDownloadableLinkRemove.rtype = [];
