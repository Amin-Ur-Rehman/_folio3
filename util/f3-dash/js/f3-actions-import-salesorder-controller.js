/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ImportSalesorderController", ImportSalesorderController);

    function ImportSalesorderController(f3StoreId) {
        console.log('ImportSalesorderController');

        this.storeId = f3StoreId;
    }

})();
