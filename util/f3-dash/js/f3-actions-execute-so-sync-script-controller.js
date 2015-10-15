/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ExecuteSOSyncScriptController", ExecuteSOSyncScriptController);


    // TODO : need to implement inheritance to prevent duplicate code.
    // TODO : we should also consider moving server calls into separate angular services

    function ExecuteSOSyncScriptController(f3StoreId, $http) {
        console.log('ExecuteSOSyncScriptController');

        var viewModel = this;

        this.execute = function () {
            viewModel.showLoadingIcon = true;

            var apiUrl = location.href.replace(location.hash, '') + '&method=executeSOSyncScript';
            $http.get(apiUrl)
                .success(function(response) {
                    viewModel.successMessage = response.success;
                    viewModel.errorMessage = response.error;
                    viewModel.showLoadingIcon = false;
                });
        };
    }


})();
