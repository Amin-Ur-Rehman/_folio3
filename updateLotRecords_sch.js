///<reference path="SuiteScriptAPITS.d.ts"/>
/**
 * Created by hatimali on 8/25/2017.
 */
var CONSTANTS = {
    PROCESSING_STATUS: {
        "PendingProcessing": 1,
        "Processed": 2,
        "Error": 3
    }
};
var UpdateRecordSch = (function () {
    function UpdateRecordSch() {
        this.startTime = null;
        this.minutesAfterReschedule = 50;
        this.minUsage = 300;
    }
    UpdateRecordSch.prototype.rescheduleIfNeeded = function () {
        try {
            var context = nlapiGetContext();
            var params = {};
            var usageRemaining = context.getRemainingUsage();
            if (usageRemaining < this.minUsage) {
                nlapiLogExecution('DEBUG', "Rescheduling due to low usage limit", usageRemaining);
                nlapiYieldScript(); // Creates a recovery point and and then reschedules the script and set its governance units reset.
            }
            var endTime = (new Date()).getTime();
            var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
            // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error
            if (minutes > this.minutesAfterReschedule) {
                nlapiLogExecution('DEBUG', 'Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
                nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
                return true;
            }
        }
        catch (e) {
            //nlapiLogExecution('ERROR', 'Error during schedule: ', +JSON.stringify(e) + ' , usageRemaining = ');
        }
        return false;
    };
    /**
     * Mark the record as Processed
     * @param recordId
     */
    UpdateRecordSch.prototype.getRecordsToProcess = function () {
        try {
            var Columns = [];
            var filters = [];
            filters.push(new nlobjSearchFilter('custrecord_processing_status', null, 'is', '1'));
            Columns.push(new nlobjSearchColumn('custrecord_lot_name', null, null)); // Serial / Lot Number
            Columns.push(new nlobjSearchColumn('custrecord_lotrecordid', null, null)); // Record ID
            Columns.push(new nlobjSearchColumn('custrecord_processing_status', null, null)); // PROCESSING STATUS
            // Search on Custom Record - Lot Number Activity Record
            var LotActivityRecord = nlapiSearchRecord('customrecord_lot_number_activity_record', null, filters, Columns) || [];
            return LotActivityRecord;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getRecordsToProcess()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.getCorresspondingLotNumberRecords = function (serialLotNumber) {
        try {
            var Columns = [];
            var filters = [];
            filters.push(new nlobjSearchFilter('inventorynumber', null, 'is', serialLotNumber)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('custitemnumberlot_vendor_no', null, null)); // Vendor Lot Number
            Columns.push(new nlobjSearchColumn('inventorynumber', null, null)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('expirationdate', null, null)); // EXPIRATION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extraction_date', null, null)); // EXTRACTION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extact_meth', null, null)); // EXTRACTION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_cult_meth', null, null)); // CULTIVATION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_country', null, null)); //COUNTRY OF ORIGIN
            Columns.push(new nlobjSearchColumn('item', null, null));
            // Search on Custom Record - Lot Number Activity Record
            var lotNumberRecords = nlapiSearchRecord('inventorynumber', null, filters, Columns) || [];
            return lotNumberRecords;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getCorresspondingLotNumberRecords()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.getLotInformationRecord = function (name, recordID) {
        try {
            var Columns = [];
            var filters = [];
            filters.push(new nlobjSearchFilter('name', null, 'is', name)); // Name
            filters.push(new nlobjSearchFilter('internalid', null, 'anyof', [recordID])); // Record ID
            Columns.push(new nlobjSearchColumn('custrecordvendorlotnum', null, null)); // Vendor Lot Number
            Columns.push(new nlobjSearchColumn('custrecordcultmethod', null, null)); // CULTIVATION METHOD
            Columns.push(new nlobjSearchColumn('name', null, null)); // Name
            Columns.push(new nlobjSearchColumn('custrecordlotproduct', null, null)); // Product
            Columns.push(new nlobjSearchColumn('custrecord_expirydate', null, null)); // Expiry Date
            Columns.push(new nlobjSearchColumn('created', null, null)); // Date Created
            Columns.push(new nlobjSearchColumn('custrecordlotprodcategory', null, null)); // Product Category
            Columns.push(new nlobjSearchColumn('custrecord_distillationdate', null, null)); //  Extraction Date
            Columns.push(new nlobjSearchColumn('custrecord_distmethod', null, null)); // Extraction Method
            Columns.push(new nlobjSearchColumn('custrecord_countryoforigin', null, null)); // Extraction Method
            // Search on Custom Record - Lot Information
            var LotInformationRecord = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];
            nlapiLogExecution('DEBUG', 'LotRecordInformation Record Object', JSON.stringify(LotInformationRecord));
            return LotInformationRecord;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getLotInformationRecord()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.setLotNumberRecord = function (lotNumberRecord, lotInforRecordobj) {
        try {
            // let itemname = lotNumberRecord[x].getText('item');
            var expiry_Date = lotInforRecordobj[3];
            var Lot_Number = lotInforRecordobj[1];
            var cultivation_Method = lotInforRecordobj[2];
            var extraction_Date = lotInforRecordobj[4];
            var extraction_Method = lotInforRecordobj[5];
            var countryOfOrigin = lotInforRecordobj[6];
            var name_1 = lotInforRecordobj[0];
            var LotNumberRecord = nlapiLoadRecord('inventorynumber', lotNumberRecord.getId());
            nlapiLogExecution('DEBUG', 'Lot Number Record Object', JSON.stringify(LotNumberRecord));
            //   nlapiLogExecution('DEBUG', 'Item Name', itemname);
            LotNumberRecord.setFieldValue('expirationdate', expiry_Date);
            LotNumberRecord.setFieldValue('custitemnumberlot_vendor_no', Lot_Number);
            LotNumberRecord.setFieldText('custitemnumberlot_cult_meth', cultivation_Method);
            LotNumberRecord.setFieldValue('custitemnumberlot_extraction_date', extraction_Date);
            LotNumberRecord.setFieldText('custitemnumberlot_extact_meth', extraction_Method);
            LotNumberRecord.setFieldText('custitemnumberlot_country', countryOfOrigin);
            var id = nlapiSubmitRecord(LotNumberRecord, true);
            // processedRecords += itemname + ', ';
            if (!!id) {
                nlapiLogExecution('DEBUG', 'RECORD SUBMITTED', '');
            }
            //return processedRecords;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In setLotNumberRecord()', e);
        }
    };
    ;
    /**
     * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
     * @returns {Void}
     */
    UpdateRecordSch.prototype.scheduled = function (type) {
        try {
            nlapiLogExecution('DEBUG', 'Starting');
            this.startTime = (new Date()).getTime();
            var customRecord = void 0;
            var lotNumberRecord = void 0;
            var lotActivityRecordId = void 0;
            var processedRecords = "";
            var lotInfoRecordSearch = void 0;
            var lotInfoRecord = void 0;
            var sysDate2 = void 0;
            var serialLotNumber = void 0;
            var LotNumberRecordID = void 0;
            var check = 0;
            var lotActivityRecords = this.getRecordsToProcess();
            if (!!lotActivityRecords && lotActivityRecords.length > 0) {
                for (var i = 0; i < lotActivityRecords.length; i++) {
                    try {
                        this.rescheduleIfNeeded();
                        customRecord = lotActivityRecords[i];
                        var activityRecord = nlapiLoadRecord('customrecord_lot_number_activity_record', lotActivityRecords[i].getId());
                        serialLotNumber = customRecord.getValue('custrecord_lot_name'); // Lot Name
                        LotNumberRecordID = customRecord.getValue('custrecord_lotrecordid'); //LotNumberRecordID
                        nlapiLogExecution('DEBUG', 'LOT ACTIVITY - Serial Lot Number', serialLotNumber);
                        nlapiLogExecution('DEBUG', 'LOT ACTIVITY - Record ID', LotNumberRecordID);
                        lotNumberRecord = this.getCorresspondingLotNumberRecords(serialLotNumber);
                        nlapiLogExecution('DEBUG', 'Lot Number Record Length', lotNumberRecord.length);
                        if (lotNumberRecord.length <= 0) {
                            activityRecord.setFieldValue('custrecord_processing_status', '4'); // 4 = No Lot Number Record
                            lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                        }
                        else if (lotNumberRecord.length > 0) {
                            nlapiLogExecution('DEBUG', 'Lot Number Record Length', lotNumberRecord.length);
                            for (var j = 0; j < lotNumberRecord.length; j++) {
                                try {
                                    lotInfoRecordSearch = this.getLotInformationRecord(serialLotNumber, LotNumberRecordID);
                                    if (!lotInfoRecordSearch && lotInfoRecordSearch.length <= 0) {
                                        activityRecord.setFieldValue('custrecord_processing_status', '3');
                                        //   lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                                    }
                                    else if (lotInfoRecordSearch.length > 0) {
                                        nlapiLogExecution('DEBUG', 'LotRecordInformation Record ID', lotInfoRecordSearch[0].getId());
                                        var name_2 = lotInfoRecordSearch[0].getText('name');
                                        var Lot_Number = lotInfoRecordSearch[0].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                                        var cultivation_Method = lotInfoRecordSearch[0].getText('custrecordcultmethod'); // Cultivation Method
                                        var expiry_Date = lotInfoRecordSearch[0].getValue('custrecord_expirydate'); // Expiry Date
                                        var extraction_Date = lotInfoRecordSearch[0].getValue('custrecord_distillationdate'); // Extraction Date
                                        var extraction_Method = lotInfoRecordSearch[0].getText('custrecord_distmethod'); // Extraction Method
                                        var countryOfOrigin = lotInfoRecordSearch[0].getText('custrecord_countryoforigin'); // Country of Origin
                                        var lotInforRecordobj = [name_2, Lot_Number, cultivation_Method, expiry_Date, extraction_Date, extraction_Method, countryOfOrigin];
                                        this.setLotNumberRecord(lotNumberRecord[j], lotInforRecordobj);
                                        var itemname = lotNumberRecord[j].getText('item');
                                        processedRecords += itemname + ', ';
                                        activityRecord.setFieldValue('custrecord_processing_status', '2'); // 2 = Processed
                                        // activityRecord.setFieldValue('custrecord_processed_lot_number_id', processedRecords);
                                        sysDate2 = new Date();
                                        activityRecord.setFieldValue('custrecord_processed_on_date', sysDate2);
                                        //  lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                                    }
                                }
                                catch (e) {
                                    nlapiLogExecution('ERROR', 'Error in Getting Corresponding Records Iteration', e);
                                }
                            }
                            activityRecord.setFieldValue('custrecord_processed_lot_number_id', processedRecords);
                            lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                        }
                    }
                    catch (e) {
                        nlapiLogExecution('ERROR', 'Error in Lot Activity Records Iteration', e);
                    }
                }
                nlapiLogExecution('DEBUG', 'EDN', '');
            }
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
        }
    };
    ;
    return UpdateRecordSch;
}());
/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function UpdateLotRecordScheduled(type) {
    return new UpdateRecordSch().scheduled(type);
}
