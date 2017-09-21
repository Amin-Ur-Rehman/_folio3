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
                        itemName = parent.nlapiGetLineItemText('inventory', 'item');
                        array = itemName.split(': ');
                        itemName = array[1];
                    }
                    var itemArray = itemName.split("-");
                    var itemMiddleName = itemArray[1];
                //    itemMiddleName = itemMiddleName.toUpperCase();
                    response = checkForValidationInLotInfoRecord(receiptLotFirstName, itemMiddleName, receiptlotNumberName);
                    return response;

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
                    var issuelotNumberName = nlapiGetLineItemText('inventoryassignment', 'issueinventorynumber');
                    console.log('Issue Lot Number' + issuelotNumberName);
                    var issuelotNumberArray = issuelotNumberName.split("-");
                    var issueLotFirstName = issuelotNumberArray[0];
                    console.log("Issue lot Number Array = ",issuelotNumberArray);
                    console.log("Issue lot First Name = ",issueLotFirstName);
                    // issueLotFirstName = issueLotFirstName.toUpperCase();

                    var itemId = parent.nlapiGetLineItemValue('component', 'item');
                    var itemNameObj = nlapiLookupField('item', itemId, ['name']);
                    itemName = itemNameObj.name;
                    console.log("Item Name = ",itemName);
                    var itemArray = itemName.split("-");
                    console.log("Item Name = ",itemArray);
                    var itemMiddleName = itemArray[1];
                    console.log("Item Middle Name = ",itemMiddleName);
                    // itemMiddleName = itemMiddleName.toUpperCase();

                    response = checkForValidationInLotInfoRecord(issueLotFirstName, itemMiddleName, issuelotNumberName);
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
        alert("The Lot name you have entered didn't matches with the middle Item name," +
            "Please try a appropriate one !!");
        return false;
    }
    else {
        if (itemMiddleName == lotFirstName) {
            console.log(lotFirstName);
            filters.push(new nlobjSearchFilter('name', null, 'is', lotNumberName));
            LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];
            if (LotRecordInformation.length <= 0) {
                alert('The Lot first name you have entered is correct but the ' +
                    'Complete Lot name is Incorrect, Please try a appropriate one !!');
                return false;
            }
            else if (LotRecordInformation.length > 0) {
                return true;
            }
        }
        else {
            alert("The Lot name you have entered didn't matches with the middle Item name," +
                "Please try a appropriate one !!");
            return false;
        }
    }

}