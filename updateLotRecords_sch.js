///<reference path="SuiteScriptAPITS.d.ts"/>
/**
 * Created by hatimali on 8/25/2017.
 */
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
                nlapiYieldScript();
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
            filters.push(new nlobjSearchFilter('custrecord_processing_status', null, 'is', 'Pending Processing'));
            Columns.push(new nlobjSearchColumn('custrecord_vendor_lot_number', null, null)); // Vendor Lot Number
            Columns.push(new nlobjSearchColumn('custrecord_f3_serial', null, null)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('custrecord_processing_status', null, null)); // PROCESSING STATUS
            var LotActivityRecord = nlapiSearchRecord('customrecord_lot_number_activity_record', null, filters, Columns) || []; // Search on Custom Record - Lot Number Activity Record
            return LotActivityRecord;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getRecordsToProcess()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.getCorresspondingLotNumberRecords = function (vendorLotNumber) {
        try {
            var Columns = [];
            var filters = [];
            filters.push(new nlobjSearchFilter('custitemnumberlot_vendor_no', null, 'is', vendorLotNumber)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('custitemnumberlot_vendor_no', null, null)); // Vendor Lot Number
            Columns.push(new nlobjSearchColumn('inventorynumber', null, null)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('expirationdate', null, null)); // EXPIRATION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extraction_date', null, null)); // EXTRACTION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extact_meth', null, null)); // EXTRACTION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_cult_meth', null, null)); // CULTIVATION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_country', null, null)); //COUNTRY OF ORIGIN
            var lotNumberRecords = nlapiSearchRecord('inventorynumber', null, filters, Columns) || []; // Search on Custom Record - Lot Number Activity Record
            return lotNumberRecords;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getCorresspondingLotNumberRecords()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.getLotInformationRecord = function (vendorLotNumber, name) {
        try {
            var Columns = [];
            var filters = [];
            filters.push(new nlobjSearchFilter('custrecordvendorlotnum', null, 'is', vendorLotNumber)); // Vendor Lot Number
            //        filters.push(new nlobjSearchFilter('expirationdate', null, 'is', name));  // Serial/ Lot Number
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
            var LotInformationRecord = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || []; // Search on Custom Record - Lot Information
            nlapiLogExecution('DEBUG', 'LotRecordInformation Record Object', JSON.stringify(LotInformationRecord));
            return LotInformationRecord;
        }
        catch (e) {
            nlapiLogExecution('ERROR', 'Error In getLotInformationRecord()', e);
        }
    };
    ;
    UpdateRecordSch.prototype.setLotNumberRecord = function (lotNumberRecord, expiry_Date, Lot_Number, cultivation_Method, extraction_Date, extraction_Method, countryOfOrigin) {
        try {
            var LotNumberRecord = nlapiLoadRecord('inventorynumber', lotNumberRecord[0].getId());
            nlapiLogExecution('DEBUG', 'Lot Number Record Object', JSON.stringify(LotNumberRecord));
            LotNumberRecord.setFieldValue('expirationdate', expiry_Date);
            LotNumberRecord.setFieldValue('custitemnumberlot_vendor_no', Lot_Number);
            LotNumberRecord.setFieldText('custitemnumberlot_cult_meth', cultivation_Method);
            LotNumberRecord.setFieldValue('custitemnumberlot_extraction_date', extraction_Date);
            LotNumberRecord.setFieldText('custitemnumberlot_extact_meth', extraction_Method);
            LotNumberRecord.setFieldText('custitemnumberlot_country', countryOfOrigin);
            var id = nlapiSubmitRecord(LotNumberRecord, true);
            nlapiLogExecution('DEBUG', 'RECORD SUBMITTED', '');
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
            var lotInfoRecordSearch = void 0;
            var lotInfoRecord = void 0;
            var vendorLotNumber = void 0;
            var serialLotNumber = void 0;
            var lotNoRecord = void 0;
            var lotActivityRecords = this.getRecordsToProcess();
            if (!!lotActivityRecords && lotActivityRecords.length > 0) {
                for (var i = 0; i < lotActivityRecords.length; i++) {
                    try {
                        this.rescheduleIfNeeded();
                        customRecord = lotActivityRecords[i];
                        vendorLotNumber = customRecord.getValue('custrecord_vendor_lot_number'); // Vendor Lot Number
                        serialLotNumber = customRecord.getValue('custrecord_f3_serial'); //Serial/Lot Number
                        nlapiLogExecution('DEBUG', 'LOT ACTIVITY - Vendor Lot Number', vendorLotNumber);
                        lotNumberRecord = this.getCorresspondingLotNumberRecords(vendorLotNumber);
                        nlapiLogExecution('DEBUG', 'Lot Number Record Length', lotNumberRecord.length);
                        for (var j = 0; j < lotNumberRecord.length; j++) {
                            lotInfoRecordSearch = this.getLotInformationRecord(vendorLotNumber, serialLotNumber);
                            if (lotInfoRecordSearch.length > 0) {
                                nlapiLogExecution('DEBUG', 'LotRecordInformation Record ID', lotInfoRecordSearch[1].getId());
                                var name_1 = lotInfoRecordSearch[1].getValue('name');
                                var Lot_Number = lotInfoRecordSearch[1].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                                var cultivation_Method = lotInfoRecordSearch[1].getText('custrecordcultmethod'); // Cultivation Method
                                var expiry_Date = lotInfoRecordSearch[1].getValue('custrecord_expirydate'); // Expiry Date
                                var extraction_Date = lotInfoRecordSearch[1].getValue('custrecord_distillationdate'); // Extraction Date
                                var extraction_Method = lotInfoRecordSearch[1].getText('custrecord_distmethod'); // Extraction Method
                                var countryOfOrigin = lotInfoRecordSearch[1].getText('custrecord_countryoforigin'); // Extraction Method
                                this.setLotNumberRecord(lotNumberRecord, expiry_Date, Lot_Number, cultivation_Method, extraction_Date, extraction_Method, countryOfOrigin);
                            }
                        }
                    }
                    catch (e) {
                        nlapiLogExecution('ERROR', 'Error in Records Iteration', e);
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
