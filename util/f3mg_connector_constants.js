/**
 * Created by zahmed on 13-Jan-15.
 */

/**
 * ConnectorConstants class that has the constants used in the connector
 */

/**
 * Magento Id Format: [{"<StoreName>":"","MagentoId":""},{"<StoreName>":"","MagentoId":""}]
 */

ConnectorConstants = (function () {
    return {
        MagentoIdFormat: '{"StoreId":"<STOREID>","MagentoId":"<MAGENTOID>"}',
        MagentoDefault: {
            State: 'New Jersey',
            StateId: 'NJ',
            Country: 'US',
            City: 'US',
            Telephone: '123-123-1234',
            Zip: '08060',
            Address : 'No Address Line'
        },
        CustomerTypesToExport: ['13'],      //Customer Or Lead Or Prospectus or All etc
        DefaultAddressId: '-1',
        ExternalSystemConfig: [],
        CurrentStore: {},
        Client: null,
        NSToMGShipMap: {},
        DummyItem: {
            ItemId: 'unmatched_magento_item',
            Id: null
        },
        Entity: {
            Fields: {
                MagentoId: 'custentity_magento_custid',// JSON
                MagentoSync: 'custentity_magentosync_dev',
                MagentoStore: 'custentity_f3mg_magento_stores'// multiselect
            }
        },
        Transaction: {
            Fields: {
                MagentoId: 'custbody_magentoid',
                MagentoSync: 'custbody_magentosyncdev',
                MagentoStore: 'custbody_f3mg_magento_store',
                MagentoSyncStatus: 'custbody_f3mg_magento_sync_status',
                CancelledMagentoSOId: 'custbody_f3mg_cancelled_mg_so_id',
                CustomerRefundMagentoId: 'custbody_cash_refund_magentoid',
                DontSyncToMagento: 'custbody_f3mg_dont_sync_to_magento'
            }
            ,
            Columns: {
                MagentoOrderId: 'custcol_mg_order_item_id'
            }
        },
        NSTransactionStatus: {
            PendingApproval: 'Pending Approval',
            PendingFulfillment: 'Pending Fulfillment'
        },
        NSTransactionTypes: {
            SalesOrder: 'salesorder'
        },
        Item: {
            Fields: {
                MagentoId: 'custitem_magentoid',// JSON
                MagentoSync: 'custitem_magentosyncdev',
                MagentoStores: 'custitem_f3mg_magento_stores'// multiselect
            }
        },
        OtherCustom: {
            MagentoId: 'custrecord_magento_id'// JSON
        },
        ShippingMethod: {
            UPS: 'ups',
            FedEx: 'nonups'
        },
        ScriptParameters: {
            LastStoreIdSalesOrder: 'custscript_last_store_id_salesorder',
            LastStoreIdCusttomer: 'custscript_last_store_id_customer',

            LastInternalId: 'custscriptcustscriptinternalid',
            ScriptStartDate: 'custscript_start_date'
        },
        RetryAction: {
            Messages: {
                SpecifyShippingMethod: "Please specify a shipping method."
            },
            RecordTypes: {
                SalesOrder: "salesorder"
            }

        },
        DefaultValues: {
            shippingMethod: {
                UPS_GND: "ups_GND",
                UPS_XPD: "ups_XPD"
            }
        },
        /**
         * Init method
         */
        initialize: function () {
            this.ExternalSystemConfig = ExternalSystemConfig.getConfig();
            this.Client = F3ClientFactory.createClient('PurestColloids');
            this.NSToMGShipMap = NSToMGShipMethodMap.getMap();
        },
        initializeDummyItem: function () {
            this.DummyItem.Id = ConnectorCommon.getDummyItemId(this.DummyItem.ItemId);
        }
    };
})();

