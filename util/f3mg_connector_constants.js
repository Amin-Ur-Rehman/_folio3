/**
 * Created by zahmed on 13-Jan-15.
 */

/**
 * ConnectorConstants class that has the functionality of
 */
var ConnectorConstants = (function () {
    return {
        ExternalSystemConfig: null,
        CurrentStore: null,
        DummyItem: {
            ItemId: 'unmatched_magento_item',
            Id: null
        },
        Entity: {
            Fields: {
                MagentoId: 'custentity_magento_custid'
            }
        },
        Transaction: {
            Fields: {
                MagentoId: 'custbody_magentoid'
            }
        },
        Item: {
            Fields: {
                MagentoId: ''
            }
        },

        /**
         * Init method
         */
        initialize: function () {
            this.ExternalSystemConfig = ExternalSystemConfig.getConfig();
            this.DummyItem.Id = ConnectorCommon.getDummyItemId(this.DummyItem.ItemId);
        }

    };
})();