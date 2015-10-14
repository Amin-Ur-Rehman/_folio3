/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("SearchOrdersController", SearchOrdersController);

    function SearchOrdersController(f3StoreId) {
        console.log('SearchMagentoOrdersController');

        this.storeId = f3StoreId;
    }

})();
