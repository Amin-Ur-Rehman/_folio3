/**
 * Created by zahmed on 02-Dec-14.
 */

/*
 * Dependency:
 *     f3mg_item_export_constant.js
 *     f3mg_scheduled_script_status_dao.js
 *     f3mg_item_export_searches_priority_dao.js
 *     f3mg_item_export_lib.js
 *
 * Description:-
 *   This script:
 *       Updates the internal ids in the searches used in item item export module.
 *       Initiate the item export scheduled script for child syncing
 * */

function getValuesFromFilter(fil) {
    var val = [];
    for (var i = 2; i < fil.length; i++) {
        val.push((fil[i]));
    }
    return val;
}

function getOldValues(filExp, name) {
    var values = [];
    for (var i in filExp) {
        var fil = filExp[i];
        var filName = fil[0];

        if (filName === name) {
            values = getValuesFromFilter(fil);
            break;
        }
    }
    return values;
}

function removeDuplicate(newValues) {
    var tempArr = [];
    for (var i in newValues) {
        if (!!newValues[i]) {
            tempArr[newValues[i]] = 1;
        }
    }
    newValues = [];
    for (var j in tempArr) {
        newValues.push(j);
    }
    return newValues;
}

function updateFilter(searchId, name, join, operator, value, value2, newValuesArr, reset) {
    var s = nlapiLoadSearch(null, searchId);
    var sFils = s.getFilters();
    var sFilExp = s.getFilterExpression();
    var newFilsObj = getFilterAfterRemoving(sFils, name);
    // handling join for getting values for childs item
    var oldValues = getOldValues(sFilExp, (!!join ? join + '.' : '') + name) || [];
    if (reset) {
        oldValues = [];
    }
    var newValues = oldValues.concat(newValuesArr);
    newValues = removeDuplicate(newValues);
    var newFils = [];
    newFils = newFils.concat(newFilsObj.newFilsArr);
    newFils.push(new nlobjSearchFilter(name, join, operator, value || newValues, value2));
    s.setFilters(newFils);
    s.saveSearch();
}

function getFilterAfterRemoving(filsArr, name) {
    var filDone = [];
    var newFilsArr = [];
    var remFil = null;
    for (var i in filsArr) {
        var fil = filsArr[i];
        var filName = fil.getName();

        // this is to prevent type duplicate filter by system
        if (filDone.indexOf(filName) === -1) {
            if (filName !== name) {
                newFilsArr.push(fil);
            } else {
                remFil = fil;
            }
            filDone.push(filName);
        }
    }
    return {newFilsArr: newFilsArr, remFil: remFil};
}


function getParentIds() {
    var filExp = [
        ["type", "anyof", "InvtPart"],
        "AND",
        ["islotitem", "is", "F"],
        "AND",
        ["matrix", "is", "T"],
        "AND",
        ["custitem_mg_export", "is", "T"]/*,
         "AND",
         ["custitem_magento_sync_status", "isempty", null]*/
    ];
    var res = nlapiSearchRecord('item', null, filExp, null) || [];

    var ids = [];
    for (var i in res) {
        var id = res[i].getId();
        if (ids.indexOf(id)) {
            ids.push(id);
        }
    }

    return ids;
}

function getParentIdsFromChild() {
    var filExp = [
        ["type", "anyof", "InvtPart"],
        "AND",
        ["islotitem", "is", "F"],
        "AND",
        ["matrixchild", "is", "T"],
        "AND",
        ["custitem_mg_export", "is", "T"]/*,
         "AND",
         ["custitem_magento_sync_status", "isempty", null]*/
    ];
    var cols = [];
    cols.push((new nlobjSearchColumn('internalid', 'parent', 'GROUP')).setSort());
    var res = nlapiSearchRecord('item', null, filExp, cols) || [];

    var ids = [];
    for (var i in res) {
        var id = res[i].getValue('internalid', 'parent', 'GROUP');
        if (ids.indexOf(id)) {
            ids.push(id);
        }
    }

    return ids;
}

function getParentIdsFromSearches() {
    var allIds = [];
    var parentIds;
    var parentIdsFromChild;

    parentIds = getParentIds();
    parentIdsFromChild = getParentIdsFromChild();

    allIds = parentIds.concat(parentIdsFromChild);
    allIds = removeDuplicate(allIds);

    return allIds;
}

// one time activity
function getParentIdsFromSearchResult(searchResult) {
    var parentIds = [];
    for (var i in searchResult) {
        var parentId = searchResult[i].getValue('parent', null, 'GROUP');
        parentIds.push(parentId);
    }
    parentIds = removeDuplicate(parentIds);
    return parentIds;
}

// one time activity
function getParentIdsFromSavedSearch() {
    var savedSearchesPriority = SavedSearchesPriority.getPending();
    var result = [];

    for (var i in savedSearchesPriority) {
        var rec = savedSearchesPriority[i];
        var searchId = rec.getValue(SavedSearchesPriority.FieldName.SavedSearchId);

        var searchResult = nlapiSearchRecord(null, searchId) || [];
        if (searchResult.length > 0) {
            result = getParentIdsFromSearchResult(searchResult);
            SavedSearchesPriority.updateStatus(searchId, 'Complete');
            break;
        } else {
            SavedSearchesPriority.updateStatus(searchId, 'Complete');
        }
    }
    return result;
}

function scheduled(type) {
    try {

        // handle the script to run only between 1 am to 7 am inclusive
        if (!isRunningTime()) {
            // if any of the following three scripts is crashed due to any of the reason
            // and if time is not running then reset the status of all script
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '0');
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S2.ScriptId, '0');
            ScheduledScriptStatus.updateStatus(ItemConstant.Script.IISYNC_UTIILIY.ScriptId, '0');
            return;
        }

        //createScriptStatusRecordsIfNecessory();

        // no other item export script is running then scheduled the script
        if (!ScheduledScriptStatus.isAlreadyRunning()) {
            //var parentIds = getParentIdsFromSearches();
            var parentIds = getParentIdsFromSavedSearch();// one time activity
            nlapiLogExecution('DEBUG', 'parentIds', JSON.stringify(parentIds));
            if (parentIds.length > 0) {
                // update the saved searches
                updateFilter(ItemConstant.SavedSearch.ParentMatrixItems, 'internalid', null, 'anyof', null, null, parentIds, true);// parent
                updateFilter(ItemConstant.SavedSearch.ChildMatrixItems, 'internalid', 'parent', 'anyof', null, null, parentIds, true);// child
                updateFilter(ItemConstant.SavedSearch.ItemsForSyncing, 'internalid', 'parent', 'anyof', null, null, parentIds, true);// images

                // this is for testing
                //updateFilter(ItemConstant.SavedSearch.ParentMatrixItems, 'internalid', null, 'anyof', null, null, ["28208", "28221"], true);// parent
                //updateFilter(ItemConstant.SavedSearch.ChildMatrixItems, 'internalid', 'parent', 'anyof', null, null, ["28208", "28221"], true);// child
                //updateFilter(ItemConstant.SavedSearch.ItemsForSyncing, 'internalid', 'parent', 'anyof', null, null, ["28208", "28221"], true);// child

                // need to remove hardcoding
                //updateFilter(ItemConstant.SavedSearch.ParentMatrixItems, 'internalid', null, 'anyof', null, null, ["16252"], true);// parent
                //updateFilter(ItemConstant.SavedSearch.ChildMatrixItems, 'internalid', 'parent', 'anyof', null, null, ["16252"], true);// child
                //updateFilter(ItemConstant.SavedSearch.ItemsForSyncing, 'internalid', 'parent', 'anyof', null, null, ["16252"], true);// child

                var status = nlapiScheduleScript(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, ItemConstant.Script.F3MG_ITEM_EXPORT_S1.DeploymentId);
                nlapiLogExecution('DEBUG', 'Status: ' + status, 'Script Id: ' + ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId);
                if (status === 'QUEUED') {
                    ScheduledScriptStatus.updateStatus(ItemConstant.Script.F3MG_ITEM_EXPORT_S1.ScriptId, '1');
                }

            }
        }

    } catch (ex) {
        nlapiLogExecution('DEBUG', 'scheduled', ex.toString());
    }
}