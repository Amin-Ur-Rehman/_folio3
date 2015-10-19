/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ViewSOSyncLogsController", ViewSOSyncLogsController);


    //ViewSOSyncLogsController.$inject = ['f3StoreId','$http'];
    function ViewSOSyncLogsController(f3StoreId, $http) {
        console.log('ViewSOSyncLogsController');

        var _self = this;
        this.hasRecords = true;

        initGrid();

        function initGrid() {

            var $grid = jQuery("#jqGrid");

            jQuery.jgrid.defaults.width = jQuery('.page-content').outerWidth();

            $grid.jqGrid({
                autowidth: true,
                forceFit: true,
                shrinkToFit: false,
                styleUI: 'Bootstrap',
                emptyrecords: "No records to view",
                datatype: function (options) {
                    console.log('datatype();');

                    var apiUrl = location.href.replace(location.hash, '') + '&method=getSOSyncLogs';
                    $http.get(apiUrl)
                        .success(function(response) {

                            //_self.hasRecords = !response || !response.length;

                            if(!!response && response.length) {
                                $grid[0].addJSONData(response);
                            }
                            else {
                                $grid.clearGridData();
                            }

                        });

                },
                idPrefix: 'row_',
                loadui: 'block',
                hoverrows: false,
                pgbuttons: false,
                pgtext: null,
                beforeSelectRow: function (rowid, e) {
                    return false;
                },
                onSelectRow: function () {
                    return false;
                },
                onRightClickRow: function () {
                    $grid.jqGrid('resetSelection');
                },
                gridComplete: function () {
                    //self.onGridCompleteInner();
                },
                colModel: [
                    {sortable: false, hidden: true, label: '', name: 'guid', key: true},
                    {sortable: false, label: 'Date', name: 'date'},
                    {sortable: false, label: 'Title', name: 'title'},
                    {sortable: false, label: 'Detail', name: 'detail'}
                ],
                viewrecords: true, // show records label in footer
                height: 'auto',
                rowNum: 1000,
                pager: "#jqGridPager"
            });

        }

    }



})();
