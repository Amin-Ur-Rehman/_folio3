/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("SearchCustomersController", SearchCustomersController);



    function SearchCustomersController(f3StoreId) {
        console.log('SearchCustomersController');
        console.log('$location.path(): ', f3StoreId);
        this.storeId = f3StoreId;
    }



})();
