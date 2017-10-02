/*
created on 10/2/2017 by Hatimali
 */

function beforeLoad() {
    var itemsCount, sublistType = "item", fldName = "item", itemName, subRecordCount;
    var countDetail_lotnum, countDetail_quantity;
    itemsCount = nlapiGetLineItemCount(sublistType);

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
                if (LotRecordInformation.length > 0) {
                    // appy validation here
                }


            }
        }
    }
}

function getLotInformationRecord(InventoryDetail_lotNumber) {
    var Columns = [];  var filters = [];
    filters.push(new nlobjSearchFilter('name', null, 'is', InventoryDetail_lotNumber)); // Vendor Lot Number

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