/**
 * Created by ubaig on 28/08/2015.
 * TODO:
 * -
 * -
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */


var FCProductsDao = (function () {
    return {
        INTERNAL_ID: 'customrecord_fc_products',
        FieldName: {
            RECORD_ID: 'custrecord_record_id',
            ID: 'id',
            NAME: 'name'
        },
        getType: function (typeInternalId) {
            var arr = this.getAll([new nlobjSearchFilter(this.FieldName.INTERNAL_ID, null, 'is', typeInternalId)]);
            return arr.length == 1 ? arr[0] : null;
        },

        getById: FC_Synch_BaseType.getById,
        getAll: FC_Synch_BaseType.getAll,
        getObject: FC_Synch_BaseType.getObject,
        getSearchColumns: FC_Synch_BaseType.getSearchColumns
    };
})();
