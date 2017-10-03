/**
 * Created by hatimali on 8/3/2017.
 */


function validateLine(type) {

    try {
        if(parent) {
            var parentRecord = parent.nlapiGetRecordType();
            if (isAllowedRecordType(parentRecord)) {

                var lot_number, InventoryDetail_lotNumber, LotRecordInformation, itemName, itemId, response, array;

                if (parentRecord == 'itemreceipt' || parentRecord == 'inventoryadjustment' || parentRecord == 'purchaseorder') {
                    var receiptlotNumberName = nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
                    console.log('Receipt Lot Number Name ' + receiptlotNumberName);
                    var receiptlotNumberArray = receiptlotNumberName.split("-");
                    var receiptLotFirstName = receiptlotNumberArray[0]; // Serial/Lot Number (Inventory Detail)
                  //  receiptLotFirstName = receiptLotFirstName.toUpperCase();
                    if(parentRecord == 'itemreceipt') {
                        itemName = parent.nlapiGetLineItemValue('item', 'itemname');
                    }
                    else if(parentRecord == 'purchaseorder') {
                        itemName = parent.nlapiGetLineItemText('item', 'item');
                    }
                    else if(parentRecord == 'inventoryadjustment') {
                        itemName = nlapiGetFieldText('item');
                       // array = itemName.split(': ');
                       // itemName = array[1];
                    }
                    else if(parentRecord == 'inventorycount') {

                    }
                    var itemArray = itemName.split("-");
                    var itemMiddleName = itemArray[1];
                //    itemMiddleName = itemMiddleName.toUpperCase();
                    response = checkForValidationInLotInfoRecord(receiptLotFirstName, itemMiddleName, receiptlotNumberName);
                    return response;

                }
                if(parentRecord == 'inventorycount') {

                }

                if (parentRecord == 'inventorytransfer' || parentRecord == 'workorder') {
                    var issuelotNumberName = nlapiGetLineItemText('inventoryassignment', 'issueinventorynumber');
                    console.log('Issue Lot Number' + issuelotNumberName);
                    var issuelotNumberArray = issuelotNumberName.split("-");
                    var issueLotFirstName = issuelotNumberArray[0];
                   // issueLotFirstName = issueLotFirstName.toUpperCase();

                    itemName = parent.nlapiGetLineItemText('item', 'item');
                    var itemArray = itemName.split("-");
                    var itemMiddleName = itemArray[1];
                   // itemMiddleName = itemMiddleName.toUpperCase();
                    response = checkForValidationInLotInfoRecord(issueLotFirstName, itemMiddleName, issuelotNumberName);
                    return response;
                }

                if (parentRecord == 'assemblybuild') {
                    response = true;
                    var isMainLine = !!nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
                    if (isMainLine) {
                        var issuelotNumberName = nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
                        console.log('Issue Lot Number' + issuelotNumberName);
                        var issuelotNumberArray = issuelotNumberName.split("-");
                        var issueLotFirstName = issuelotNumberArray[0];
                        console.log("Issue lot Number Array = ",issuelotNumberArray);
                        console.log("Issue lot First Name = ",issueLotFirstName);
                        itemName = nlapiGetFieldText('item');
                        console.log("Item Name = ",itemName);
                        var itemArray = itemName.split("-");
                        console.log("Item Name = ",itemArray);
                        var itemMiddleName = itemArray[1];
                        console.log("Item Middle Name = ",itemMiddleName);
                        response = checkForValidationInLotInfoRecord(issueLotFirstName, itemMiddleName, issuelotNumberName);

                    }
                    return response;
                }
                //return response;
            }
        }
           // console.log("Its Parent don't exist, please open this subrecord from any record");
        return true;

    } catch(e) {
        nlapiLogExecution('DEBUG', 'ERROR', e);
    }
}

function isAllowedRecordType (recordType) {
    var flag = false;
    switch (recordType) {
        case "itemreceipt" :
        case "inventorytransfer" :
        case "workorder" :
        case "inventoryadjustment" :
        case "assemblybuild":
        case "purchaseorder":
        case "inventorycount":
            flag = true;
            break;

        default:
            flag = false;
            break;
    }

    return flag;
}

function checkForValidationInLotInfoRecord(lotFirstName, itemMiddleName, lotNumberName) {
    var Columns = [];
    Columns.push(new nlobjSearchColumn('custrecordvendorlotnum', null, null)); // Vendor Lot Number
    Columns.push(new nlobjSearchColumn('name', null, null)); // name
    var filters = [];
    filters.push(new nlobjSearchFilter('name', null, 'contains', lotFirstName)); // Vendor Lot Number
    LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];

    if (LotRecordInformation.length <= 0) {
        alert("The lot number entered is incorrect or relates to a different product. Please re-enter.");
        return false;
    }
    else {
        if (itemMiddleName == lotFirstName) {
            console.log(lotFirstName);
            filters.push(new nlobjSearchFilter('name', null, 'is', lotNumberName));
            LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];
            if (LotRecordInformation.length <= 0) {
                alert("The lot number entered does not exist. Please create the lot number.");
                return false;
            }
            else if (LotRecordInformation.length > 0) {
                return true;
            }
        }
        else {
            alert("The lot number entered is incorrect or relates to a different product. Please re-enter.");
            return false;
        }
    }

}