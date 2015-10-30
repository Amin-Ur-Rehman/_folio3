/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ExportSalesorderController", ExportSalesorderController);

    function ExportSalesorderController(f3Store) {
        console.log('ExportSalesorderController');

        this.storeId = f3Store.id;
    }

})();
