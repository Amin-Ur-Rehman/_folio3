var IISyncUtilityRecordTypes = (function() {
	return {
		INTERNAL_ID: 'customrecord_IISyncUtilityrecordtypes',
		FieldName: {
			NAME: 'name',
			INTERNAL_ID: 'custrecord_fc_srt_recordinternalid',
			SUBLIST_INTERNAL_ID: 'custrecord_fc_srt_recordsublistsid',
			JOIN_INTERNAL_ID: 'custrecord_fc_srt_recordjoinid'
		},
		getType: function(typeInternalId) {
			var arr = this.getAll([new nlobjSearchFilter(this.FieldName.INTERNAL_ID, null, 'is', typeInternalId)]);
			return arr.length == 1 ? arr[0] : null;
		},
		
		getById: IISyncUtilityBaseType.getById,
		getAll: IISyncUtilityBaseType.getAll,
		getObject: IISyncUtilityBaseType.getObject,
		getSearchColumns: IISyncUtilityBaseType.getSearchColumns
	};
})();
