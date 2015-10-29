/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ExecuteCashRefundScriptController", ExecuteCashRefundScriptController);


    // TODO : need to implement inheritance to prevent duplicate code.
    // TODO : we should also consider moving server calls into separate angular services

    function ExecuteCashRefundScriptController(f3Store, $http){
        console.log('ExecuteCashRefundScriptController');

        var viewModel = this;

        this.execute = function () {
            viewModel.showLoadingIcon = true;

            var apiUrl = location.href.replace(location.hash, '') + '&method=executeCashRefundSyncScript';
            $http.get(apiUrl)
                .success(function(response) {
                    viewModel.executionStatus = response.status;
                    viewModel.successMessage = response.success;
                    viewModel.errorMessage = response.error;
                    viewModel.showLoadingIcon = false;
                });
        };
    }


})();
