/**
 * Created by hatimali on 8/3/2017.
 */



function afterSubmit(type) {

    try {
        var InventoryDetail_lotNumber, InventoryDetail_exp_date, InventoryDetail_quantity;
        var sublistType = "" , fldName , itemsCount,itemName , subRecordCount;
        var RecordType = nlapiGetRecordType();
        if (RecordType) {
            if (RecordType == 'itemreceipt') {
                sublistType = 'item';
                fldName = 'itemname';
            }
            else if (RecordType == 'workorder') {
                sublistType = 'item';
                fldName = 'item';
            }
            else if (RecordType == 'inventoryadjustment' || RecordType == 'inventorytransfer') {
                sublistType = "inventory";
                fldName = 'item';
            }
            itemsCount = nlapiGetLineItemCount(sublistType);
            nlapiLogExecution('DEBUG', 'Item Count', itemsCount);

            for (var line = 1; line <= itemsCount; line++) { // Loop on All Line Items
                var subrecord = nlapiViewLineItemSubrecord(sublistType, 'inventorydetail', line);
                nlapiLogExecution('DEBUG', 'Sub record 1', JSON.stringify(subrecord));
                subRecordCount = subrecord.getLineItemCount('inventoryassignment');
                nlapiLogExecution('DEBUG', 'Sub record Line Item Count', subRecordCount);
                itemName = nlapiGetLineItemValue(sublistType, fldName, line);

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
                        nlapiLogExecution('DEBUG', 'LotRecordInformation Record ID', LotRecordInformation[0].getId());
                        var name = LotRecordInformation[0].getValue('name');
                        var Lot_Number = LotRecordInformation[0].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                        var cultivation_Method = LotRecordInformation[0].getText('custrecordcultmethod'); // Cultivation Method
                        var expiry_Date = LotRecordInformation[0].getValue('custrecord_expirydate');  // Expiry Date

                        var date_Created = LotRecordInformation[0].getValue('created');                // Date Created
                        var product_Category = LotRecordInformation[0].getText('custrecordlotprodcategory'); // Product Category
                        var product_Name = LotRecordInformation[0].getValue('custrecordlotproduct'); // Product
                        var extraction_Date = LotRecordInformation[0].getValue('custrecord_distillationdate');  // Extraction Date
                        var extraction_Method = LotRecordInformation[0].getText('custrecord_distmethod');  // Extraction Method
                        var countryOfOrigin = LotRecordInformation[0].getText('custrecord_countryoforigin');  // Extraction Method

                        var record = getLotNumberRecord(InventoryDetail_lotNumber, itemName, fldName); // Search for Lot Number Record
                        nlapiLogExecution('DEBUG', 'Inventory Number Record', JSON.stringify(record));

                        if (record.length <= 0) {
                            nlapiLogExecution('DEBUG', 'No Inventory Number Record Exist');
                            break;
                        }
                        else if (record.length > 0) {
                            setLotNumberRecord(record, expiry_Date , Lot_Number, cultivation_Method, extraction_Date,extraction_Method, countryOfOrigin);
                        }
                    }
                }
            }

            setPurchaseOrderLineItemsSubRecords(RecordType, sublistType); // This Function Backtrack PO and set Inventory Detail SubRecords

            nlapiLogExecution('DEBUG', 'Done');

        } else {
            console.log("Its Parent don't exist, please open this subrecord from any record");
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
    var search = nlapiSearchRecord("item", null, new nlobjSearchFilter("itemid", null, "is", itemName));
    if (!!search) {
        itemId = search[0].getId();
    }
    return itemId;
}

function setLotNumberRecord(record, expiry_Date , Lot_Number, cultivation_Method, extraction_Date,extraction_Method, countryOfOrigin){
    nlapiLogExecution('DEBUG', '---> Search Record Length', record.length);
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
    if (RecordType == 'itemreceipt' || RecordType == 'inventoryadjustment') {
        InventoryDetail_lotNumber = subrecord.getCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
    }
    if (RecordType == 'inventorytransfer' || RecordType == 'workorder') {
        InventoryDetail_lotNumber = subrecord.getCurrentLineItemValue('inventoryassignment', 'issueinventorynumber');
    }
  //  InventoryDetail_lotNumber = InventoryDetail_lotNumber.toUpperCase();
    return InventoryDetail_lotNumber;
}

function setPurchaseOrderLineItemsSubRecords(RecordType, sublistType) {
    var InventoryDetail_lotNumber2, InventoryDetail_exp_date2, InventoryDetail_quantity2;
    var PurchaseOrderID = nlapiGetFieldValue('createdfrom');
    var PurchaseorderRecord = nlapiLoadRecord('purchaseorder', PurchaseOrderID);
    var lotNamesSubRecordPO = "",  lotNamesSubRecordPOArray = [];
    var count =0;
    var lineItemCountPO = PurchaseorderRecord.getLineItemCount('item');
    for (var line = 1; line <= lineItemCountPO; line++) {
        var subsubrecord = nlapiViewLineItemSubrecord(sublistType, 'inventorydetail', line); // Sub record of Item Receipt Line Item
        nlapiLogExecution('DEBUG', 'Sub record of Item Receipt', JSON.stringify(subsubrecord));
        var subRecordCountItemDetail = subsubrecord.getLineItemCount('inventoryassignment');
        PurchaseorderRecord.selectLineItem('item', line);
        //   var POsubrecord = PurchaseorderRecord.createSubrecord('inventorydetail');
        var POsubrecord = PurchaseorderRecord.editCurrentLineItemSubrecord('item', 'inventorydetail');
        if (!POsubrecord) {
            POsubrecord = PurchaseorderRecord.createCurrentLineItemSubrecord('item', 'inventorydetail');
        }

        nlapiLogExecution('DEBUG', 'Purchase Order Sub Rec', JSON.stringify(POsubrecord));
        var subrecordLineItemCount = POsubrecord.getLineItemCount('inventoryassignment'); // PO sub record count before removing line Items

        removeSubrecordLineItems(POsubrecord); // Remove all line Items from PO SubRecord to avoid any duplicates or qunatity issues

        subrecordLineItemCount = POsubrecord.getLineItemCount('inventoryassignment'); // Count after removing line Items

        for (var c = 1; c <= subRecordCountItemDetail; c++) {
            subsubrecord.selectLineItem('inventoryassignment', c);
            InventoryDetail_lotNumber2 = getInventoryDetailLotName(subsubrecord, RecordType);
            nlapiLogExecution('DEBUG', 'Lot Name (PO subrecord LineItem)', InventoryDetail_lotNumber2);
            InventoryDetail_exp_date2 = subsubrecord.getCurrentLineItemValue('inventoryassignment', 'expirationdate');
            InventoryDetail_quantity2 = subsubrecord.getCurrentLineItemValue('inventoryassignment', 'quantity');

             lotNamesSubRecordPO = lotNamesSubRecordPO + InventoryDetail_lotNumber2+ ', '; //  storing Lot Name from SubRecord of PO
             lotNamesSubRecordPOArray.push(InventoryDetail_lotNumber2);
            POsubrecord.selectNewLineItem('inventoryassignment');

            if (RecordType == 'itemreceipt' || RecordType == 'inventoryadjustment') {
                POsubrecord.setCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber', InventoryDetail_lotNumber2);
            }
            else if (RecordType == 'inventorytransfer' || RecordType == 'workorder') {
                POsubrecord.setCurrentLineItemValue('inventoryassignment', 'issueinventorynumber', InventoryDetail_lotNumber2);
            }
            POsubrecord.setCurrentLineItemValue('inventoryassignment', 'expirationdate', InventoryDetail_exp_date2);
            nlapiLogExecution('DEBUG', 'Quantittyyyy', InventoryDetail_quantity2);
            POsubrecord.setCurrentLineItemValue('inventoryassignment', 'quantity', InventoryDetail_quantity2);

            POsubrecord.commitLineItem('inventoryassignment');

            subrecordLineItemCount = POsubrecord.getLineItemCount('inventoryassignment');
            nlapiLogExecution('DEBUG', 'setPOLineItemsSubRecordsFromItemReceipt', 'subrecordLineItemCount: ' + subrecordLineItemCount);
        }

        POsubrecord.commit();
        nlapiLogExecution('DEBUG', 'lotNamesSubRecordPO', JSON.stringify(lotNamesSubRecordPO));
        for(var x=0; x<lotNamesSubRecordPOArray.length; x++) {
            var lotname = lotNamesSubRecordPO.split(',');
            nlapiLogExecution('DEBUG', 'Last last check please', JSON.stringify(lotNamesSubRecordPOArray[x]));
            var LotInformationRecord = getLotInformationRecord(lotNamesSubRecordPOArray[x]); // Function getting Custom Lot Record
            nlapiLogExecution('DEBUG', 'Lot Information Record Length', LotInformationRecord.length);
            if (LotInformationRecord.length > 0) {
                var vendorLotNumber = LotInformationRecord[0].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                PurchaseorderRecord.setLineItemValue('item', 'custcol_folio3_v_lotnumber', line, vendorLotNumber);
                   PurchaseorderRecord.commitLineItem('item');
            }
            count++;
        }

        PurchaseorderRecord.commitLineItem('item');

        nlapiLogExecution('DEBUG', 'Last last check please', JSON.stringify(POsubrecord));
    }

    var id = nlapiSubmitRecord(PurchaseorderRecord);
}