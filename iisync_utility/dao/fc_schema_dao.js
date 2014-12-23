var FC_Schema = (function () {
    return {
        INTERNAL_ID: 'customrecord_fc_schema',
        FieldName: {
        	INTERNAL_ID: 'internalid',
            RECORD_TYPE: 'custrecord_fc_schema_recordtype',
            FIELDS: 'custrecord_fc_schema_fields',
            CUSTOM_FIELDS: 'custrecord_fc_schema_customfields',
            COLUMNS: 'custrecord_fc_schema_searchcolumns',
            FILTERS: 'custrecord_fc_schema_searchfilters'
        },
        getById: IISyncUtilityBaseType.getById,
        getAll: IISyncUtilityBaseType.getAll,
        getAllSortBy: IISyncUtilityBaseType.getAllSortBy,
        getObject: IISyncUtilityBaseType.getObject,
        getSearchColumns: IISyncUtilityBaseType.getSearchColumns,
        getSearchColumnsSortBy: IISyncUtilityBaseType.getSearchColumnsSortBy,
        upsert: IISyncUtilityBaseType.upsert,
        remove: IISyncUtilityBaseType.remove,
       getByType: function (nsRecordType) {
            var fils = [ new nlobjSearchFilter(this.FieldName.RECORD_TYPE, null, 'is', nsRecordType) ];
            var recs = this.getAll(fils);
            return (recs && recs.length > 0 ? recs[0] : null);
        },
        setCustomField: function(id, cfield) {
        	nlapiSubmitField(this.INTERNAL_ID, id, this.FieldName.CUSTOM_FIELDS, cfield);
        }
    };
})();
