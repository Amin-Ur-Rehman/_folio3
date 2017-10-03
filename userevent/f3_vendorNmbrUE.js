/**
 * Created by Amin on 9/8/2017.
 */
function afterSubmit(type) {

    try {
        if (type === 'delete'){ }
        else{


            var InventoryDetail_lotNumber, InventoryDetail_exp_date, InventoryDetail_quantity;
            var sublistType = "" , fldName , itemsCount,itemName , subRecordCount;
            var RecordType = nlapiGetRecordType();
            var recordId = nlapiGetRecordId();
            if (RecordType) {
                if (RecordType === 'purchaseorder') {
                    sublistType = 'item';
                    fldName = 'item_display';
                }
                // else if (RecordType === 'workorder') {
                //     sublistType = 'item';
                //     fldName = 'item';
                // }
                // else if (RecordType === 'inventoryadjustment' || RecordType === 'inventorytransfer') {
                //     sublistType = "inventory";
                //     fldName = 'item';
                // }
                itemsCount = nlapiGetLineItemCount(sublistType);
                //nlapiLogExecution('DEBUG', 'Item Count', itemsCount);
                for (var line = 1; line <= itemsCount; line++) { // Loop on All Line Items
                    var vendLotNumbr = "";
                    itemName = nlapiGetLineItemValue(sublistType, fldName, line);
                    nlapiLogExecution('DEBUG', 'ITEM NAME ', itemName);
                    var subrecord = nlapiViewLineItemSubrecord(sublistType, 'inventorydetail', line);
                    nlapiLogExecution('DEBUG', 'Sub record 1', JSON.stringify(subrecord));
                    if(subrecord) {
                        subRecordCount = subrecord.getLineItemCount('inventoryassignment');
                        //nlapiLogExecution('DEBUG', 'Sub record Line Item Count', subRecordCount);
                        var checkInventoryItemRecord = nlapiSearchRecord("item", null, new nlobjSearchFilter("internalid", null, "anyof", itemName));
                        var itemRecordType = checkInventoryItemRecord[0].getRecordType();

                        for (var i = 1; i <= subRecordCount; i++) { // loop for each item Subrecord lineItems
                            subrecord.selectLineItem('inventoryassignment', i);
                            InventoryDetail_lotNumber = getInventoryDetailLotName(subrecord, RecordType); // Function Return Sub Record Line Item Field (Lot Name)
                            nlapiLogExecution('DEBUG', 'Lot Number Name', InventoryDetail_lotNumber);
                            InventoryDetail_exp_date = subrecord.getCurrentLineItemValue('inventoryassignment', 'expirationdate');
                            InventoryDetail_quantity = subrecord.getCurrentLineItemValue('inventoryassignment', 'quantity');
                            nlapiLogExecution('DEBUG', 'Quanity Array Value', InventoryDetail_quantity);
                            var LotRecordInformation = getLotInformationRecord(InventoryDetail_lotNumber); // Function getting Custom Lot Record
                            nlapiLogExecution('DEBUG', 'LotRecordInformation Length', LotRecordInformation.length);
                            if (LotRecordInformation.length > 0) {
                                for(var x =0; x<LotRecordInformation.length; x++) {
                                    nlapiLogExecution('DEBUG', 'LotRecordInformation Record ID', LotRecordInformation[x].getId());
                                    var name = LotRecordInformation[x].getValue('name');
                                    var Lot_Number = LotRecordInformation[x].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                                    nlapiLogExecution('DEBUG', 'Lot Number from Lot Info Record', Lot_Number);
                                    nlapiLogExecution('DEBUG', 'Record type is ', itemRecordType);
                                    if (itemRecordType == 'lotnumberedinventoryitem' || itemRecordType == 'inventoryitem') {
                                        vendLotNumbr = vendLotNumbr + Lot_Number + ' [' + InventoryDetail_quantity + '] , ';
                                    }
                                    var cultivation_Method = LotRecordInformation[x].getText('custrecordcultmethod'); // Cultivation Method
                                    var expiry_Date = LotRecordInformation[x].getValue('custrecord_expirydate');  // Expiry Date
                                    var date_Created = LotRecordInformation[x].getValue('created');                // Date Created
                                    var product_Category = LotRecordInformation[x].getText('custrecordlotprodcategory'); // Product Category
                                    var product_Name = LotRecordInformation[x].getValue('custrecordlotproduct'); // Product
                                    var extraction_Date = LotRecordInformation[x].getValue('custrecord_distillationdate');  // Extraction Date
                                    var extraction_Method = LotRecordInformation[x].getText('custrecord_distmethod');  // Extraction Method
                                    var countryOfOrigin = LotRecordInformation[x].getText('custrecord_countryoforigin');  // Extraction Method
                                    var record = getLotNumberRecord(InventoryDetail_lotNumber, itemName, fldName); // Search for Lot Number Record
                                    //nlapiLogExecution('DEBUG', 'Inventory Number Record', JSON.stringify(record));
                                    if (record.length <= 0) {
                                        nlapiLogExecution('DEBUG', 'No Inventory Number Record Exist');
                                        break;
                                    }
                                    else if (record.length > 0) {
                                        setLotNumberRecord(record, expiry_Date, Lot_Number, cultivation_Method, extraction_Date, extraction_Method, countryOfOrigin);
                                    }
                                }
                            }
                        }
                        var x = nlapiLoadRecord(RecordType, recordId); // loading current record to get the value
                        x.setLineItemValue('item', 'custcol_folio3_v_lotnumber', line, vendLotNumbr.toString());
                        nlapiSubmitRecord(x); //submitting here because after the loop runs the value got changed
                    }
                }
            }
            else { }
            nlapiLogExecution("Debug","Process","Ended..");
        }
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error', e);
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

/**
 This function is searching for Lot Number Record against two filters
 */
function getLotNumberRecord(InventoryDetail_lotNumber, itemName, fldName) {
    var filters2 = [];
    filters2.push(new nlobjSearchFilter('inventorynumber', null, 'is', InventoryDetail_lotNumber)); // Vendor Lot Number
    filters2.push(new nlobjSearchFilter('item', null, 'anyof', getItemId(itemName))); // Item Name

    var Columns2 = [];
    Columns2.push(new nlobjSearchColumn('custitemnumberlot_vendor_no', null, null)); // Vendor Lot Number
    Columns2.push(new nlobjSearchColumn('custitemnumberlot_cult_meth', null, null)); // CULTIVATION METHOD
    Columns2.push(new nlobjSearchColumn('custitemnumberlot_extraction_date', null, null)); // Extraction date
    Columns2.push(new nlobjSearchColumn('custitemnumberlot_extact_meth', null, null)); // Extraction method
    Columns2.push(new nlobjSearchColumn('expirationdate', null, null)); // Expiry Date
    Columns2.push(new nlobjSearchColumn('custitemnumberlot_country', null, null)); // Expiry Date

    var record = nlapiSearchRecord('inventorynumber', null, filters2, Columns2) || [];

    return record;
}

function getItemId(itemName) {
    var itemId = null;
    //nlapiLogExecution('DEBUG', 'got it', itemName);
    var search = nlapiSearchRecord("item", null, new nlobjSearchFilter("itemid", null, "is", itemName),null);
    if (!!search) {
        itemId = search[0].getId();
    }
    return itemId;
}

function setLotNumberRecord(record, expiry_Date , Lot_Number, cultivation_Method, extraction_Date,extraction_Method, countryOfOrigin){
    nlapiLogExecution('DEBUG', 'Search Record Length', record.length);
    for(var i=0; i < record.length; i++) {
        var record_id = record[i].getId(); // Inventory Number Reoord ID
        var LotNumberRecord = nlapiLoadRecord('inventorynumber', record_id);
        nlapiLogExecution('DEBUG', 'Lot Number Record Object', JSON.stringify(LotNumberRecord));

        LotNumberRecord.setFieldValue('expirationdate', expiry_Date);
        LotNumberRecord.setFieldValue('custitemnumberlot_vendor_no', Lot_Number);
        LotNumberRecord.setFieldText('custitemnumberlot_cult_meth', cultivation_Method);
        LotNumberRecord.setFieldValue('custitemnumberlot_extraction_date', extraction_Date);
        LotNumberRecord.setFieldText('custitemnumberlot_extact_meth', extraction_Method);
        LotNumberRecord.setFieldText('custitemnumberlot_country', countryOfOrigin);
        var id = nlapiSubmitRecord(LotNumberRecord, true);
    }
}

function removeSubrecordLineItems(poSubrecord) {

    var subRecordLineItemCount = poSubrecord.getLineItemCount('inventoryassignment');
    for(var line =1; line <= subRecordLineItemCount; line++) {
        poSubrecord.removeLineItem('inventoryassignment', '1');
    }
}

function getInventoryDetailLotName(subrecord, RecordType) {
    var InventoryDetail_lotNumber;
    if (RecordType === 'purchaseorder' || RecordType === 'inventoryadjustment') {
        InventoryDetail_lotNumber = subrecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
    }
    if (RecordType === 'inventorytransfer' || RecordType === 'workorder') {
        InventoryDetail_lotNumber = subrecord.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
    }
    //  InventoryDetail_lotNumber = InventoryDetail_lotNumber.toUpperCase();
    return InventoryDetail_lotNumber;
}
