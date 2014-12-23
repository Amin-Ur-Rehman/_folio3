var IISyncUtilityRecordsOut = (function() {
	return {
		INTERNAL_ID: 'customrecord_IISyncUtilityrecords_out',
		FieldName: {
			RECORD_TYPE: 'custrecord_fc_sro_recordtype',
			INTERNAL_ID: 'custrecord_fc_sro_internalid',
			JSON: 'custrecord_fc_sro_recordjson',
			STATUS: 'custrecord_fc_sro_status',
			REQUESTED_BY: 'custrecord_fc_sro_requestedby',
			REQUESTED_AT: 'custrecord_fc_sro_requestedat'
		},
		Status: {
		    "New" : "1",
		    "InProcess" : "2",
		    "Completed" : "3",
		    "Failed" : "4"
		},
		getById: IISyncUtilityBaseType.getById,
		getAll: IISyncUtilityBaseType.getAll,
		getByStatus: function(status) {
			return this.getAll([new nlobjSearchFilter(this.FieldName.STATUS, null, 'is', status)]);
		},
		getObject: IISyncUtilityBaseType.getObject,
		getSearchColumns: IISyncUtilityBaseType.getSearchColumns,
		upsert: IISyncUtilityBaseType.upsert,
		remove: IISyncUtilityBaseType.remove
	};
})();
