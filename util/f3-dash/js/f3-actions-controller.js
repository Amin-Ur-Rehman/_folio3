/**
 * Created by zshaikh on 10/8/2015.
 */

(function() {

    'use strict';

    angular.module("f3UC")
        .controller("ActionsController", ActionsController);

    function ActionsController($f3Actions, $state, f3StoreId) {

        console.log('ActionsController', arguments);
        console.log('$f3Actions', $f3Actions);

        //this.selectedAction = null;

        this.storeId = f3StoreId;
        this.groupedActions = {};
        this.actions = [];



        this.menuState = [];




        var allActions = $f3Actions.getAll();
        for (var key in allActions) {
            var action = allActions[key];

            if (!!action.group) {

                this.groupedActions[action.group] = this.groupedActions[action.group] || [];
                this.groupedActions[action.group].push({
                    title: action.title,
                    key: key,
                    action: action.action
                });

            } else {
                this.actions.push({
                    title: action.title,
                    key: key,
                    action: action.action
                });
            }
        }


        //this.go = function() {
        //    console.log('ActionsController.go();');
        //    console.log(this.selectedAction);
        //
        //    if ( !!this.selectedAction.action ) {
        //        this.selectedAction.action();
        //
        //        $state.go('actions');
        //    }
        //    else {
        //        //alert('navigate to: ' + this.selectedAction.key);
        //        $state.go('actions.' + this.selectedAction.key);
        //    }
        //}
    }

})();
