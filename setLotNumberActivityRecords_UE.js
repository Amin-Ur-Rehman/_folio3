/**
 * Created by hatimali on 8/22/2017.
 */
var CONSTANTS = {
    PROCESSING_STATUS: {
        "PendingProcessing": 1,
        "Processed":2,
        "Error": 3,
        "Lot Number Record Not Found": 4
    }
};

function afterSubmit(type) {
    try {
        nlapiLogExecution('DEBUG', 'afterSubmit(): START', '');
        nlapiLogExecution('DEBUG', 'Record ID', nlapiGetRecordId());
        var lotInformationRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
        var lotName = lotInformationRecord.getFieldValue('name'); // Lot Name
        var recordID = lotInformationRecord.getFieldValue('recordid'); //Lot Number Record ID

        var sysDate = new Date();
        var activityRecord = [];
        var lotNumberActivityRecord = searchLotNumberActivityRecord(lotName, recordID);

        if(lotNumberActivityRecord.length <= 0) {
            nlapiLogExecution('DEBUG', 'Lot Number Activity Record Not Found', '');
            activityRecord = nlapiCreateRecord('customrecord_lot_number_activity_record', {recordmode: 'dynamic'});
        }
        else if (lotNumberActivityRecord.length > 0) {
            var activityRecordId = lotNumberActivityRecord[0].getId();
            activityRecord = nlapiLoadRecord('customrecord_lot_number_activity_record', activityRecordId);
            nlapiLogExecution('DEBUG', 'Lot Number Activity Record Found', JSON.stringify(activityRecord));
        }
        var recordstobeProcessed = this.getRecordstobeProcessed(lotName);
        activityRecord.setFieldValue('custrecord_lot_name', lotName);
        activityRecord.setFieldValue('custrecord_processing_status',CONSTANTS.PROCESSING_STATUS.PendingProcessing);
        activityRecord.setFieldValue('custrecord_pushed_on', sysDate);
        activityRecord.setFieldValue('custrecord_lotrecordid', recordID);
        activityRecord.setFieldValue('custrecordlot_number_tbprocessed', recordstobeProcessed);

        id = nlapiSubmitRecord(activityRecord, true);

        nlapiLogExecution('DEBUG', 'End', '');

    } catch(e) {
        nlapiLogExecution('ERROR','afterSubmit(): ERROR', e);
    }
}

function searchLotNumberActivityRecord(lotName, recordID){

    var Columns = [];
    var filters = [];
    filters.push(new nlobjSearchFilter('custrecord_lot_name', null, 'is', lotName)); // Serial lot Number
    filters.push(new nlobjSearchFilter('custrecord_lotrecordid', null, 'is', recordID)); // Record ID

    Columns.push(new nlobjSearchColumn('custrecord_lot_name', null, null)); // Serial lot Number
    Columns.push(new nlobjSearchColumn('custrecord_processing_status', null, null)); // Processing Status
    Columns.push(new nlobjSearchColumn('custrecord_processed_lot_number_id', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_pushed_on', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_processed_on_date', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_lotrecordid', null, null)); // record ID
    var lotNumberActivityRecord = nlapiSearchRecord('customrecord_lot_number_activity_record', null, filters, Columns) || [];
    return lotNumberActivityRecord;
}

function getRecordstobeProcessed(serialLotNumber) {
    try {
        var Columns = [];  var filters = [];
        filters.push(new nlobjSearchFilter('inventorynumber', null, 'is', serialLotNumber));  // Serial/ Lot Number

        Columns.push(new nlobjSearchColumn('custitemnumberlot_vendor_no', null, null)); // Vendor Lot Number
        Columns.push(new nlobjSearchColumn('inventorynumber', null, null)); // Serial/ Lot Number
        Columns.push(new nlobjSearchColumn('expirationdate', null, null)); // EXPIRATION DATE
        Columns.push(new nlobjSearchColumn('custitemnumberlot_extraction_date', null, null)); // EXTRACTION DATE
        Columns.push(new nlobjSearchColumn('custitemnumberlot_extact_meth', null, null)); // EXTRACTION METHOD
        Columns.push(new nlobjSearchColumn('custitemnumberlot_cult_meth', null, null)); // CULTIVATION METHOD
        Columns.push(new nlobjSearchColumn('custitemnumberlot_country', null, null)); //COUNTRY OF ORIGIN
        Columns.push(new nlobjSearchColumn('item', null, null)); //COUNTRY OF ORIGIN


        // Search on Custom Record - Lot Number Activity Record
        var lotNumberRecords = nlapiSearchRecord('inventorynumber', null, filters, Columns) || [];
        var recordstobeProcessed = "";
        for(var i=0; i< lotNumberRecords.length; i++) {

            recordstobeProcessed += lotNumberRecords[i].getText('item');
            nlapiLogExecution('DEBUG', 'recordstobeProcessed', recordstobeProcessed);
            recordstobeProcessed += ' , ';
        }
        return recordstobeProcessed;
    } catch (e) {
        nlapiLogExecution('ERROR', 'Error In getCorresspondingLotNumberRecords()', e);
    }
}