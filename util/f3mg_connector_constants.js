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
                MagentoStore: 'custbody_f3mg_magento_store'
            }
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

        /**
         * Init method
         */
        initialize: function () {
            this.ExternalSystemConfig = ExternalSystemConfig.getConfig();
            this.Client = F3ClientFactory.createClient('Folio3');
            this.NSToMGShipMap = NSToMGShipMethodMap.getMap();
        },
        initializeDummyItem: function () {
            this.DummyItem.Id = ConnectorCommon.getDummyItemId(this.DummyItem.ItemId);
        }
    };
})();

var US_CA_States = {
    //US states
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'Armed Forces Americas': 'AA',
    'Armed Forces Europe': 'AE',
    'Armed Forces Pacific': 'AP',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'GUAM': 'GU',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Puerto Rico': 'PR',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virgin Islands': 'VI',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    // canada states
    'Alberta': 'AB',
    'British Columbia': 'BC',
    'Manitoba': 'MB',
    'New Brunswick': 'NB',
    'Newfoundland': 'NL',
    'Northwest Territories': 'NT',
    'Nova Scotia': 'NS',
    'Nunavut': 'NU',
    'Ontario': 'ON',
    'Prince Edward Island': 'PE',
    'Quebec': 'QC',
    'Saskatchewan': 'SK',
    'Yukon': 'YT'
};