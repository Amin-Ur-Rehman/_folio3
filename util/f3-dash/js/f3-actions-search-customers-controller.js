/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("SearchCustomersController", SearchCustomersController);



    function SearchCustomersController(f3Store) {
        console.log('SearchCustomersController');
        console.log('$location.path(): ', f3Store.id);
        this.storeId = f3Store.id;
    }



})();
