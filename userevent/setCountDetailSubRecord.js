/*
created on 10/2/2017 by Hatimali
 */

function beforeSubmit(type) {
    var itemsCount, sublistType = "item", fldName = "item", itemName, subRecordCount;
    var countDetail_lotnum, countDetail_quantity;
    itemsCount = nlapiGetLineItemCount(sublistType);
    nlapiLogExecution('DEBUG', 'item count', itemsCount);
    for (var line = 1; line <= itemsCount; line++) {
        itemName = nlapiGetLineItemText(sublistType, fldName, line);
        nlapiLogExecution('DEBUG', 'itemName ', itemName);
        var subrecord = nlapiViewLineItemSubrecord(sublistType, 'countdetail', line);
        nlapiLogExecution('DEBUG', 'Sub Record of Count Detail ', JSON.stringify(subrecord));
        if (!!subrecord) {
            subRecordCount = subrecord.getLineItemCount('inventorydetail');
            nlapiLogExecution('DEBUG', 'Sub Record Count ', subRecordCount);
            for (var i = 1; i <= subRecordCount; i++) { // loop for each item Subrecord lineItems
                subrecord.selectLineItem('inventorydetail', i);
                countDetail_lotnum = subrecord.getCurrentLineItemValue('inventorydetail', 'inventorynumber');
                countDetail_quantity = subrecord.getCurrentLineItemValue('inventorydetail', 'quantity');
                nlapiLogExecution('DEBUG', 'countDetail_lotnum ', countDetail_lotnum);
                nlapiLogExecution('DEBUG', 'countDetail_quantity', countDetail_quantity);
                var LotRecordInformation = getLotInformationRecord(countDetail_lotnum); // Function getting Custom Lot Record
                nlapiLogExecution('DEBUG', 'LotRecordInformation Length', LotRecordInformation.length);
                if (LotRecordInformation.length <= 0) {
                    throw nlapiCreateError("ERROR", "The lot number entered "+ countDetail_lotnum+" does not exist. Please create the lot number.", true);
                }
                if (LotRecordInformation.length > 0) {
                    for (var x = 0; x < LotRecordInformation.length; x++) {
                        var name = LotRecordInformation[x].getValue('name');
                        if(name == countDetail_lotnum) {
                        } else {
                            throw nlapiCreateError("ERROR", "The lot number entered "+ countDetail_lotnum + " is incorrect or relates to a different product. Please re-enter.", true);
                        }
                    }
                }

            }
        }
    }
}

function getLotInformationRecord(countDetail_lotnum) {
    var Columns = [];  var filters = [];
    filters.push(new nlobjSearchFilter('name', null, 'is', countDetail_lotnum)); // Vendor Lot Number

    Columns.push(new nlobjSearchColumn('custrecordvendorlotnum', null, null)); // Vendor Lot Number
    Columns.push(new nlobjSearchColumn('custrecordcultmethod', null, null)); // CULTIVATION METHOD
    Columns.push(new nlobjSearchColumn('name', null, null)); // Name
    Columns.push(new nlobjSearchColumn('custrecordlotproduct', null, null)); // Product
    Columns.push(new nlobjSearchColumn('custrecord_expirydate', null, null)); // Expiry Date
    Columns.push(new nlobjSearchColumn('created', null, null));  // Date Created
    Columns.push(new nlobjSearchColumn('custrecordlotprodcategory', null, null)); // Product Category
    Columns.push(new nlobjSearchColumn('custrecord_distillationdate', null, null)); //  Extraction Date
    Columns.push(new nlobjSearchColumn('custrecord_distmethod', null, null)); // Extraction Method
    Columns.push(new nlobjSearchColumn('custrecord_countryoforigin', null, null)); // Extraction Method

    var LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || []; // Search on Custom Record - Lot Information
    nlapiLogExecution('DEBUG', 'LotRecordInformation Record Object', JSON.stringify(LotRecordInformation));

    return LotRecordInformation;
}