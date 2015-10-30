/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module('f3UC')
        .factory('f3Utility', function ($f3Actions) {

            return {

                qs: function (key) {
                    key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
                    var match = location.search.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
                    return match && decodeURIComponent(match[1].replace(/\+/g, " "));
                }

            }

        });

})();
