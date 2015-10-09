/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module('f3UC')
        .factory('f3StoreId', ['f3Utility', function (f3Utility) {

            return f3Utility.qs('store_id')

        }]);

})();
