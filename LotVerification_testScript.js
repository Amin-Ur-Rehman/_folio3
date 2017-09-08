/**
 * Created by hatimali on 8/3/2017.
 */


function validateLine(type) {

    try {
        if(parent) {
            var parentRecord = parent.nlapiGetRecordType();
            if (isAllowedRecordType(parentRecord)) {
                var Columns = [];
                Columns.push(new nlobjSearchColumn('custrecordvendorlotnum', null, null)); // Vendor Lot Number
                //  Columns.push(new nlobjSearchColumn('custrecord_expirydate', null, null)); // Expiry Date
                Columns.push(new nlobjSearchColumn('name', null, null)); // name

                var filters = [];
                var lot_number, InventoryDetail_lotNumber, LotRecordInformation, itemName;

                if (parentRecord == 'itemreceipt' || parentRecord == 'inventoryadjustment') {
                    var receiptlotNumberName = nlapiGetCurrentLineItemValue('inventoryassignment', 'receiptinventorynumber');
                    console.log('Receipt Lot Number Name ' + receiptlotNumberName);
                    var receiptlotNumberArray = receiptlotNumberName.split("-");
                    var receiptLotFirstName = receiptlotNumberArray[0]; // Serial/Lot Number (Inventory Detail)
                  //  receiptLotFirstName = receiptLotFirstName.toUpperCase();

                    itemName = parent.nlapiGetLineItemValue('item', 'itemname');
                    var itemArray = itemName.split("-");
                    var itemMiddleName = itemArray[1];
                //    itemMiddleName = itemMiddleName.toUpperCase();
                    filters.push(new nlobjSearchFilter('name', null, 'contains', receiptLotFirstName)); // name field (Lot Information Record)
                    LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];

                    if (LotRecordInformation.length <= 0) { // Checks if the Lot is returned
                        alert("The Lot name you have entered didn't matches with the middle Item name," +
                            "Please try a appropriate one !!");
                        return false;
                    }
                    else {
                        if (itemMiddleName == receiptLotFirstName) {
                            filters.push(new nlobjSearchFilter('name', null, 'is', receiptlotNumberName));
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
                    filters.push(new nlobjSearchFilter('name', null, 'contains', issueLotFirstName)); // Vendor Lot Number
                    LotRecordInformation = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];

                    if (LotRecordInformation.length <= 0) {
                        alert("The Lot name you have entered didn't matches with the middle Item name," +
                            "Please try a appropriate one !!");
                        return false;
                    }
                    else {
                        if (itemMiddleName == issueLotFirstName) {
                            console.log(issueLotFirstName);
                            filters.push(new nlobjSearchFilter('name', null, 'is', issuelotNumberName));
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
            flag = true;
            break;

        default:
            flag = false;
            break;
    }

    return flag;
}