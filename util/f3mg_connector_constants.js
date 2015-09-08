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
        ScheduleScriptInvokedFormUserEvent: 'custscript_sch_invoke_from_ue',
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
            SalesOrder: 'salesorder',
            CashRefund: 'cashrefund'
        },
        SalesOrderStatus: {
            Cancel: 'C'
        },
        Item: {
            Fields: {
                MagentoId: 'custitem_magentoid',// JSON
                MagentoSync: 'custitem_magentosyncdev',
                MagentoStores: 'custitem_f3mg_magento_stores',// multiselect
                MagentoSyncStatus: 'custitem_f3mg_magento_sync_status',
                ItemId: 'itemid',
                AllowOpenAmount: 'custitem_f3mg_price_allow_open_amount',
                OpenAmountMinValue: 'custitem_f3mg_price_open_amount_min',
                OpenAmountMaxValue: 'custitem_f3mg_price_open_amount_max'
            }
        },
        OtherCustom: {
            MagentoId: 'custrecord_magento_id'// JSON
        },
        PromoCode: {
            Fields: {
                MagentoId: 'custrecord_f3mg_promo_magentoid',
                TransferredToMagento: 'custrecord_f3mg_promo_magentosyncdev',
                MagentoStore: 'custrecord_f3mg_promo_magento_store',
                MagentoSyncStatus: 'custrecord_f3mg_promo_magentosyncstatus',
                LastModifiedDate: 'custrecord_f3mg_promo_lastmodifieddate',
                MagentoCouponsListIDs: 'custrecord_f3mg_promo_magentocouponids'
            }
        },
        MagentoExecutionContext: {
            WebService: 'webservice',
            UserInterface: 'userinterface'
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
        SuiteScripts: {
            Suitelet : {
                GenericDataExport: {
                    id: 'customscript_f3mg_generic_data_exp_sl',
                    deploymentId: 'customdeploy_f3mg_generic_data_exp_sl_de'
                }
            },
            ScheduleScript: {
                CustomerExportToMagento: {
                    id: 'customscript_customer_exportto_magento',
                    deploymentId: 'customdeploy_customer_exportto_magento',
                    deploymentIdInvokedFormUserEvent: 'customdeploy_customer_exportto_magento_2'
                },
                GiftCertificateExportToMagento: {
                    id: 'customscript_gift_certificate_export_sch',
                    deploymentId: 'customdeploy_gift_certificate_export_dep'
                }
            }
        },
        NSRecordTypes : {
            PromotionCode: 'promotioncode',
            PriceLevel: 'pricelevel',
            PaymentTerm : 'term'
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
                UPS_XPD: "ups_XPD",
                UPS_EMPTY: "ups_"
            }
        },
        MagentoCustomerGroups: {
            TaxExempt: "2",
            General: "1"
        },
        MagentoProductTypes: {
            GiftCard: "aw_giftcard"
        },
        /**
         * Init method
         */
        initialize: function () {
            this.ExternalSystemConfig = ExternalSystemConfig.getConfig();
            this.Client = F3ClientFactory.createClient('OrsonGygi');
            this.NSToMGShipMap = NSToMGShipMethodMap.getMap();
        },
        initializeDummyItem: function () {
            this.DummyItem.Id = ConnectorCommon.getDummyItemId(this.DummyItem.ItemId);
        }
    };
})();

