/**
 * Created by hatimali on 8/22/2017.
 */
var CONSTANTS = {
    PROCESSING_STATUS: {
        "PendingProcessing": 1,
        "Processed":2,
        "Error": 3
    }
};

function afterSubmit(type) {
    try {
        nlapiLogExecution('DEBUG', 'afterSubmit(): START', '');
        nlapiLogExecution('DEBUG', 'Record ID', nlapiGetRecordId());
        var lotInformationRecord = nlapiLoadRecord(nlapiGetRecordType(), nlapiGetRecordId());
        var vendorLotNumber = lotInformationRecord.getFieldValue('custrecordvendorlotnum'); // Vendor Lot Number
        var serialLotNumber = lotInformationRecord.getFieldValue('name'); //Serial/Lot Number

        var sysDate = new Date();
        var activityRecord = [];
        var lotNumberActivityRecord = searchLotNumberActivityRecord(vendorLotNumber, serialLotNumber);

        if(lotNumberActivityRecord.length <= 0) {
            nlapiLogExecution('DEBUG', 'Lot Number Activity Record Not Found', '');
            activityRecord = nlapiCreateRecord('customrecord_lot_number_activity_record', {recordmode: 'dynamic'});
        }
        else if (lotNumberActivityRecord.length > 0) {
            var activityRecordId = lotNumberActivityRecord[0].getId();
            activityRecord = nlapiLoadRecord('customrecord_lot_number_activity_record', activityRecordId);
            nlapiLogExecution('DEBUG', 'Lot Number Activity Record Found', JSON.stringify(activityRecord));
        }
        activityRecord.setFieldValue('custrecord_vendor_lot_number', vendorLotNumber);
        activityRecord.setFieldValue('custrecord_processing_status',CONSTANTS.PROCESSING_STATUS.PendingProcessing);
        activityRecord.setFieldValue('custrecord_pushed_on', sysDate);
        activityRecord.setFieldValue('custrecord_f3_serial', serialLotNumber);

        id = nlapiSubmitRecord(activityRecord, true);

        nlapiLogExecution('DEBUG', 'End', '');

    } catch(e) {
        nlapiLogExecution('ERROR','afterSubmit(): ERROR', e);
    }
}

function searchLotNumberActivityRecord(vendorLotNumber, serialLotNumber){

    var Columns = [];
    var filters = [];
    filters.push(new nlobjSearchFilter('custrecord_vendor_lot_number', null, 'is', vendorLotNumber)); // Vendor Lot Number
    filters.push(new nlobjSearchFilter('custrecord_f3_serial', null, 'is', serialLotNumber)); // Serial Lot Number

    Columns.push(new nlobjSearchColumn('custrecord_vendor_lot_number', null, null)); // Vendor Lot Number
    Columns.push(new nlobjSearchColumn('custrecord_processing_status', null, null)); // Processing Status
    Columns.push(new nlobjSearchColumn('custrecord_processed_lot_number_id', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_pushed_on', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_processed_on_date', null, null)); //
    Columns.push(new nlobjSearchColumn('custrecord_f3_serial', null, null)); // Serial/ Lot Number

    var lotNumberActivityRecord = nlapiSearchRecord('customrecord_lot_number_activity_record', null, filters, Columns) || [];
    return lotNumberActivityRecord;
}
function setLotNumberActivityRecord(lotNumberActivityRecord) {

}