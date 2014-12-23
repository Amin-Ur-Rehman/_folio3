var IISyncUtilityCustomList = function(internalId) {
	return {
		INTERNAL_ID: internalId,
		FieldName: {
			NAME: 'name'
		},
		getAll: IISyncUtilityBaseType.getAll,
		getObject: IISyncUtilityBaseType.getObject,
		getSearchColumns: IISyncUtilityBaseType.getSearchColumns
	};
};

var IISyncUtilityLists = (function() {
	return {
		STATUS: IISyncUtilityCustomList('customlist_IISyncUtilitystatus')
	};
})();