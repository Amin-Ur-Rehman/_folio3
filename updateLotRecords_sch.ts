///<reference path="SuiteScriptAPITS.d.ts"/>

/**
 * Created by hatimali on 8/25/2017.
 */

let CONSTANTS = {
    PROCESSING_STATUS: {
        "PendingProcessing": 1,
        "Processed":2,
        "Error": 3
    }
};

class UpdateRecordSch {

    private startTime = null;
    private minutesAfterReschedule = 50;
    private minUsage = 300;


    private rescheduleIfNeeded() {
        try {
            let context = nlapiGetContext();
            let params = {};
            let usageRemaining = context.getRemainingUsage();

            if (usageRemaining < this.minUsage) {
                nlapiLogExecution('DEBUG', "Rescheduling due to low usage limit", usageRemaining);
                nlapiYieldScript(); // Creates a recovery point and and then reschedules the script and set its governance units reset.
            }

            let endTime = (new Date()).getTime();
            let minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;

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
    }

    /**
     * Mark the record as Processed
     * @param recordId
     */
    private getRecordsToProcess() {
        try {
            let Columns = [];  let filters = [];
            filters.push(new nlobjSearchFilter('custrecord_processing_status', null, 'is', '1'));

            Columns.push(new nlobjSearchColumn('custrecord_lot_name', null, null)); // Serial / Lot Number
            Columns.push(new nlobjSearchColumn('custrecord_lotrecordid', null, null)); // Record ID
            Columns.push(new nlobjSearchColumn('custrecord_processing_status', null, null)); // PROCESSING STATUS

            // Search on Custom Record - Lot Number Activity Record
            let LotActivityRecord = nlapiSearchRecord('customrecord_lot_number_activity_record', null, filters, Columns) || [];

            return LotActivityRecord;
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error In getRecordsToProcess()', e);
        }
    };

    private getCorresspondingLotNumberRecords(serialLotNumber) {
        try {
            let Columns = [];  let filters = [];
            filters.push(new nlobjSearchFilter('inventorynumber', null, 'is', serialLotNumber));  // Serial/ Lot Number

            Columns.push(new nlobjSearchColumn('custitemnumberlot_vendor_no', null, null)); // Vendor Lot Number
            Columns.push(new nlobjSearchColumn('inventorynumber', null, null)); // Serial/ Lot Number
            Columns.push(new nlobjSearchColumn('expirationdate', null, null)); // EXPIRATION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extraction_date', null, null)); // EXTRACTION DATE
            Columns.push(new nlobjSearchColumn('custitemnumberlot_extact_meth', null, null)); // EXTRACTION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_cult_meth', null, null)); // CULTIVATION METHOD
            Columns.push(new nlobjSearchColumn('custitemnumberlot_country', null, null)); //COUNTRY OF ORIGIN
            Columns.push(new nlobjSearchColumn('item', null, null));
            // Search on Custom Record - Lot Number Activity Record
            let lotNumberRecords = nlapiSearchRecord('inventorynumber', null, filters, Columns) || [];
            return lotNumberRecords;
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error In getCorresspondingLotNumberRecords()', e);
        }
    };

    private getLotInformationRecord(name, recordID) {
        try {
            let Columns = [];  let filters = [];
            filters.push(new nlobjSearchFilter('name', null, 'is', name));  // Name
            filters.push(new nlobjSearchFilter('internalid', null, 'anyof', [recordID]));  // Record ID

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

            // Search on Custom Record - Lot Information
            let LotInformationRecord = nlapiSearchRecord('customrecord_lotinformation', null, filters, Columns) || [];
            nlapiLogExecution('DEBUG', 'LotRecordInformation Record Object', JSON.stringify(LotInformationRecord));

            return LotInformationRecord;
        } catch (e) {
            nlapiLogExecution('ERROR', 'Error In getLotInformationRecord()', e);
        }


    };

    private setLotNumberRecord(lotNumberRecord, lotInforRecordobj){
        try {
           // let itemname = lotNumberRecord[x].getText('item');
            let expiry_Date = lotInforRecordobj[3];
            let Lot_Number  = lotInforRecordobj[1];
            let cultivation_Method = lotInforRecordobj[2];
            let extraction_Date = lotInforRecordobj[4];
            let extraction_Method = lotInforRecordobj[5];
            let countryOfOrigin = lotInforRecordobj[6];
            let name = lotInforRecordobj[0];

            let LotNumberRecord = nlapiLoadRecord('inventorynumber', lotNumberRecord.getId());
            nlapiLogExecution('DEBUG', 'Lot Number Record Object', JSON.stringify(LotNumberRecord));

         //   nlapiLogExecution('DEBUG', 'Item Name', itemname);
            LotNumberRecord.setFieldValue('expirationdate', expiry_Date);
            LotNumberRecord.setFieldValue('custitemnumberlot_vendor_no', Lot_Number);
            LotNumberRecord.setFieldText('custitemnumberlot_cult_meth', cultivation_Method);
            LotNumberRecord.setFieldValue('custitemnumberlot_extraction_date', extraction_Date);
            LotNumberRecord.setFieldText('custitemnumberlot_extact_meth', extraction_Method);
            LotNumberRecord.setFieldText('custitemnumberlot_country', countryOfOrigin);
            let id = nlapiSubmitRecord(LotNumberRecord, true);
           // processedRecords += itemname + ', ';

            if(!!id) {
                nlapiLogExecution('DEBUG', 'RECORD SUBMITTED','');
            }
            //return processedRecords;
        }catch (e) {
            nlapiLogExecution('ERROR', 'Error In setLotNumberRecord()', e);
        }

};

    /**
     * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
     * @returns {Void}
     */
    public scheduled(type: string) {
        try {
            nlapiLogExecution('DEBUG', 'Starting');
            this.startTime = (new Date()).getTime();
            let customRecord;
            let lotNumberRecord; let lotActivityRecordId; let processedRecords = "";
            let lotInfoRecordSearch; let lotInfoRecord; let sysDate2;
            let serialLotNumber;
            let LotNumberRecordID; let check =0;
            let lotActivityRecords = this.getRecordsToProcess();
            if(!!lotActivityRecords && lotActivityRecords.length > 0) {
                for(let i = 0; i < lotActivityRecords.length; i++) {
                    try {
                        this.rescheduleIfNeeded();
                        customRecord = lotActivityRecords[i];
                        let activityRecord = nlapiLoadRecord('customrecord_lot_number_activity_record', lotActivityRecords[i].getId());
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
                        else if(lotNumberRecord.length > 0) {
                            nlapiLogExecution('DEBUG', 'Lot Number Record Length', lotNumberRecord.length);
                            for (let j = 0; j < lotNumberRecord.length; j++) {
                                try {
                                    lotInfoRecordSearch = this.getLotInformationRecord(serialLotNumber, LotNumberRecordID);
                                    if (!lotInfoRecordSearch && lotInfoRecordSearch.length <= 0) {
                                        activityRecord.setFieldValue('custrecord_processing_status', '3');
                                     //   lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                                    }
                                    else if (lotInfoRecordSearch.length > 0) {

                                    nlapiLogExecution('DEBUG', 'LotRecordInformation Record ID', lotInfoRecordSearch[0].getId());
                                    let name = lotInfoRecordSearch[0].getText('name');
                                    let Lot_Number = lotInfoRecordSearch[0].getValue('custrecordvendorlotnum'); // Vendor Lot Number
                                    let cultivation_Method = lotInfoRecordSearch[0].getText('custrecordcultmethod'); // Cultivation Method
                                    let expiry_Date = lotInfoRecordSearch[0].getValue('custrecord_expirydate');  // Expiry Date
                                    let extraction_Date = lotInfoRecordSearch[0].getValue('custrecord_distillationdate');  // Extraction Date
                                    let extraction_Method = lotInfoRecordSearch[0].getText('custrecord_distmethod');  // Extraction Method
                                    let countryOfOrigin = lotInfoRecordSearch[0].getText('custrecord_countryoforigin');  // Country of Origin
                                    let lotInforRecordobj = [name, Lot_Number, cultivation_Method, expiry_Date, extraction_Date, extraction_Method, countryOfOrigin];
                                    this.setLotNumberRecord(lotNumberRecord[j],lotInforRecordobj);

                                        let itemname = lotNumberRecord[j].getText('item');
                                        processedRecords += itemname + ', ';
                                        activityRecord.setFieldValue('custrecord_processing_status','2'); // 2 = Processed
                                       // activityRecord.setFieldValue('custrecord_processed_lot_number_id', processedRecords);
                                        sysDate2 = new Date();
                                        activityRecord.setFieldValue('custrecord_processed_on_date', sysDate2);
                                      //  lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                                    }
                                } catch (e) {
                                    nlapiLogExecution('ERROR', 'Error in Getting Corresponding Records Iteration', e);
                                }
                            }
                            activityRecord.setFieldValue('custrecord_processed_lot_number_id', processedRecords);
                            lotActivityRecordId = nlapiSubmitRecord(activityRecord, true);
                        }

                    }catch(e) {
                        nlapiLogExecution('ERROR', 'Error in Lot Activity Records Iteration', e);
                    }
                }
                nlapiLogExecution('DEBUG', 'EDN', '');

            }

        } catch (e) {
            nlapiLogExecution('ERROR', 'Error during  Script working', e.toString());
        }
    };
}

/**
 * @param {String} type Context Types: scheduled, ondemand, userinterface, aborted, skipped
 * @returns {Void}
 */
function UpdateLotRecordScheduled(type) {
    return new UpdateRecordSch().scheduled(type);
}