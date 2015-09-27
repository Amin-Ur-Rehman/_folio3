CATEGORY = {
    categoryLevel: 0,
    getCategory: function(categoryId) {
        var arrFils = [];
        var recs;
        var result = [];
        var arrCols = [];
        var resultObject;
        arrFils.push(new nlobjSearchFilter('internalid', null, 'is', categoryId));
        arrCols.push(new nlobjSearchColumn('name'));
        arrCols.push(new nlobjSearchColumn('custrecord_magentoid'));
        arrCols.push(new nlobjSearchColumn('custrecord_parentcategory'));
        arrCols.push(new nlobjSearchColumn('custrecord_nscategoryid'));
        arrCols.push(new nlobjSearchColumn('isinactive'));
        recs = nlapiSearchRecord('customrecord_magentocategories', null, arrFils, arrCols);
        if (recs != null && recs.length > 0) {
            for (var i = 0; i < recs.length; i++) {
                resultObject = new Object();
                resultObject.internalId = recs[i].getId();
                resultObject.name = recs[i].getValue('name');
                resultObject.magentoId = recs[i].getValue('custrecord_magentoid');
                resultObject.nsCategoryId = recs[i].getValue('custrecord_nscategoryid');
                resultObject.nsParentCategory = recs[i].getValue('custrecord_parentcategory');
                resultObject.active = 1;
                if (recs[i].getValue('isinactive') === 'T') resultObject.active = 0;
                if (!!resultObject.nsParentCategory) {
                    resultObject.magentoParentID = nlapiLookupField('customrecord_magentocategories', resultObject.nsParentCategory, 'custrecord_magentoid');
                }
                this.categoryLevel = 0;
                resultObject.level = this.getCategoryLevel(resultObject.internalId);
                this.categoryLevel = 0;
                //result.push(resultObject);
            }
        }
        return resultObject;
    },
    getCategoryLevel: function(categoryId, parentId) {
        var arrFils = [];
        var recs;
        var result = [];
        var arrCols = [];
        var levelCount;
        if (!isBlankOrNull(parentId)) arrFils.push(new nlobjSearchFilter('internalid', null, 'is', parentId));
        else arrFils.push(new nlobjSearchFilter('internalid', null, 'is', categoryId));
        arrCols.push(new nlobjSearchColumn('name'));
        arrCols.push(new nlobjSearchColumn('custrecord_parentcategory'));
        recs = nlapiSearchRecord('customrecord_magentocategories', null, arrFils, arrCols);
        if (recs != null && recs.length > 0) {
            for (var i = 0; i < recs.length; i++) {
                if (!!recs[i].getValue('custrecord_parentcategory')) {
                    this.categoryLevel++;
                    this.getCategoryLevel(categoryId, recs[i].getValue('custrecord_parentcategory'));
                }
            }
        }
        return this.categoryLevel;
    },
    setCategoryMagentoId: function(magentoId, categoryId) {
        var result = false;
        try {
            nlapiSubmitField('customrecord_magentocategories', categoryId, ['custrecord_magentoid'], [magentoId]);
            result = true;
        } catch (ex) {}
        return result;
    }
};