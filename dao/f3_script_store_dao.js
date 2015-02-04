/**
 * Created by Ubaid Baig on 04-Feb-15.
 *
 * Description:
 * - This is a Data access class that is written on top of Script Storage Custom Record
 * -
 * Referenced By:
 * -
 * -
 * -
 * -
 * Dependency:
 * - f3_utility_methods.js
 * - f3_base_dao.js
 */

/**
 *
 */
var ScriptStoreDao = (function () {
    return {
        INTERNAL_ID: 'customrecord_f3_script_state_store',
        FieldName: {
            DEPLOYMENT_ID: 'custrecord_deployment_id',
            KEY: 'custrecord_key',
            SCRIPT_ID: 'custrecord_script_id',
            VALUE: 'custrecord_value'
        },
        getById: F3.Storage.BaseDao.getById,
        getAll: F3.Storage.BaseDao.getAll,
        getObject: F3.Storage.BaseDao.getObject,
        getSearchColumns: F3.Storage.BaseDao.getSearchColumns,
        upsert: F3.Storage.BaseDao.upsert,
        remove: F3.Storage.BaseDao.remove,
        /**
         * Sets value in the table
         * @param parameter
         */
        setValue: function (scriptStoreInfo) {
            try {
                this.upsert(scriptStoreInfo);
            } catch (e) {
                Utility.logException('Error during main setValue', e);
            }
        },
        /**
         * gets the value based on key
         * @param parameter
         */
        getValue: function (key) {
            try {
                var arr = this.getAll([new nlobjSearchFilter(this.FieldName.KEY, null, 'is', key, null)]);
                return arr.length == 1 ? arr[0] : null;
            } catch (e) {
                Utility.logException('Error during main getValue', e);
            }
        }
    };
})();