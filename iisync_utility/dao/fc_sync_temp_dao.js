var IISyncUtilityTemp = (function() {
	return {
		INTERNAL_ID: 'customrecord_IISyncUtilitytemp',
		FieldName: {
			RECORD_TYPE: 'custrecord_fc_st_recordtype',
			INTERNAL_ID: 'custrecord_fc_st_internalid',
			IDS: 'custrecord_fc_st_ids'
		},
		getById: IISyncUtilityBaseType.getById,
		getAll: IISyncUtilityBaseType.getAll,
		getObject: IISyncUtilityBaseType.getObject,
		getSearchColumns: IISyncUtilityBaseType.getSearchColumns,
		upsert: IISyncUtilityBaseType.upsert,
		remove: IISyncUtilityBaseType.remove
	};
})();