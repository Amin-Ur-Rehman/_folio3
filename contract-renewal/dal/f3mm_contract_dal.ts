/// <reference path="../_typescript-refs/SuiteScriptAPITS.d.ts" />
/// <reference path="./f3mm_base_dal.ts" />
/// <reference path="./f3mm_common_dal.ts" />
/**
 * Created by zshaikh on 11/18/2015.
 * -
 * Referenced By:
 * - f3mm_create_contract_api_suitelet.ts
 * - f3mm_create_contract_ui_suitelet.ts
 * -
 * Dependencies:
 * - f3mm_base_dal.ts
 * -
 */

/**
 * This class handles all operations related to Contracts.
 * Following are the responsibilities of this class:
 *  - Load Contracts from Database
 *  - Update / Create Contracts along with its line items
 *  - Generate Quote from Contract
 */
class ContractDAL extends BaseDAL {
    public internalId: string = "customrecord_f3mm_contract";

    public fields = {
        contractNumber: {
            id: "custrecord_f3mm_contract_number",
            type: "text"
        },
        contractVendor: {
            id: "custrecord_f3mm_contract_vendor",
            type: "list"
        },
        customer: {
            id: "custrecord_f3mm_customer",
            type: "list"
        },
        deleted: {
            id: "custrecord_f3mm_deleted",
            type: "checkbox"
        },
        department: {
            id: "custrecord_f3mm_department",
            type: "list"
        },
        discountItemId: {
            id: "custrecord_f3mm_discount_item_id",
            type: "number"
        },
        duration: {
            id: "custrecord_f3mm_contract_duration",
            type: "list"
        },
        endDate: {
            id: "custrecord_f3mm_end_date",
            type: "date"
        },
        id: {
            id: "internalid",
            type: "number"
        },
        memo: {
            id: "custrecord_f3mm_memo",
            type: "text"
        },
        name: {
            id: "name",
            type: "string"
        },
        notification1DayPrior: {
            id: "custrecord_f3mm_notif_1day_prior",
            type: "checkbox"
        },
        notification3DaysPrior: {
            id: "custrecord_f3mm_notif_3days_prior",
            type: "checkbox"
        },
        notification5DaysPrior: {
            id: "custrecord_f3mm_notif_5days_prior",
            type: "checkbox"
        },
        notificationDaysPrior: {
            id: "custrecord_f3mm_notif_days_prior",
            type: "number"
        },
        notificationOnExpiration: {
            id: "custrecord_f3mm_notif_on_expiration",
            type: "checkbox"
        },
        notificationOnQuoteApproval: {
            id: "custrecord_f3mm_notif_on_quote_approval",
            type: "checkbox"
        },
        notificationOnQuoteGenerate: {
            id: "custrecord_f3mm_notif_on_quote_generate",
            type: "checkbox"
        },
        notificationOnRenewal: {
            id: "custrecord_f3mm_notif_on_renewal",
            type: "checkbox"
        },
        poNumber: {
            id: "custrecord_f3mm_po_number",
            type: "text"
        },
        primaryContact: {
            id: "custrecord_f3mm_primary_contact",
            type: "list"
        },
        primaryContactEmail: {
            id: "custrecord_f3mm_primary_contact_email",
            type: "text"
        },
        salesRep: {
            id: "custrecord_f3mm_sales_rep",
            type: "list"
        },
        startDate: {
            id: "custrecord_f3mm_start_date",
            type: "date"
        },
        status: {
            id: "custrecord_f3mm_status",
            type: "list"
        },
        systemId: {
            id: "custrecord_f3mm_system_id",
            type: "text"
        },
        totalQuantitySeats: {
            id: "custrecord_f3mm_total_qty_seats",
            type: "number"
        }
    };

    /**
     * Gets history of contract and contract items based on their ids
     * @param {any} contractIds
     * @param {string} internalId
     * @returns {object} json representation of contract obejct along with contract items and quotes
     */
    public getHistory(contractIds: any, internalId?: string) {
        let filters = [],
            columns = [];
        let history = null;

        if (contractIds && contractIds.length) {

            if (contractIds.constructor === Array) {
                filters.push(new nlobjSearchFilter("internalid", null, "anyof", contractIds));
            } else {
                filters.push(new nlobjSearchFilter("internalid", null, "is", contractIds));
            }

            columns.push(new nlobjSearchColumn("date", "systemNotes", "group"));
            columns.push(new nlobjSearchColumn("field", "systemNotes", "group"));
            columns.push(new nlobjSearchColumn("type", "systemNotes", "group"));
            columns.push(new nlobjSearchColumn("name", "systemNotes", "group"));
            columns.push(new nlobjSearchColumn("oldvalue", "systemNotes", "group"));
            columns.push(new nlobjSearchColumn("newvalue", "systemNotes", "group"));

            // sorting on date field in descending order
            columns[0].setSort(true);

            history = this.getAll(filters, columns, internalId);
        }

        return history;
    }


    /**
     * Gets contract with specified id including details of Items and related Quote
     * @param {string} id
     * @returns {object} json representation of contract obejct along with contract items and quotes
     */
    public getWithDetails(id: string) {

        let contract = null;

        try {
            let commonDAL = new CommonDAL();
            contract = this.get(id);

            if (contract[this.fields.deleted.id] === "T") {
                let err = new Error("the record is deleted");
                F3.Util.Utility.logException("ContractDAL.getWithDetails(id); // id = " + id, err);
                return null;
            }

            let contractItems = contract.sublists.recmachcustrecord_f3mm_ci_contract;
            F3.Util.Utility.logDebug("ContractDAL.getWithDetails(id); // contractItems ", JSON.stringify(contractItems));
            let items = [];
            let contractItemIds = contractItems.map(ci => ci.id);
            let itemIds = contractItems
                .filter(ci => !!ci.custrecord_f3mm_ci_item)
                .map(ci => parseInt(ci.custrecord_f3mm_ci_item.value, 10));
            F3.Util.Utility.logDebug("ContractDAL.getWithDetails(id); // itemIds ", JSON.stringify(itemIds));

            if (itemIds && itemIds.length) {
                items = commonDAL.getItems({
                    itemIds: itemIds
                });

                items.forEach(item => {
                    item.priceLevels = commonDAL.getPriceLevels({
                        itemId: item.id,
                        recordType: item.recordType
                    });
                });
            }

            // attach quotes
            contract.sublists.quotes = commonDAL.getQuotes({
                contractId: id
            });

            F3.Util.Utility.logDebug("ContractDAL.getWithDetails(id); // contract.sublists.quotes", JSON.stringify(contract.sublists.quotes));

            // attach history
            let contractHistory = this.getHistory(id) || [];
            let historyFieldsToExclude = ["Inactive", "Deleted?", "Owner"];
            let contractItemsHistory = this.getHistory(contractItemIds, "customrecord_f3mm_contract_item");
            if (!!contractItemsHistory) {
                contractItemsHistory = contractItemsHistory.filter(cih => cih.field.text === "Item");
                contractHistory = contractHistory.filter(ch => historyFieldsToExclude.indexOf(ch.field.text) <= 0);
                contractHistory = contractHistory.concat(contractItemsHistory);
                contractHistory.sort((item1, item2) => {
                    let date1: any = new Date(item1.date);
                    let date2: any = new Date(item2.date);
                    return date2 - date1;
                });
                contract.history = contractHistory;
            }

            F3.Util.Utility.logDebug("ContractDAL.getWithDetails(id); // contractItemsHistory", JSON.stringify(contractItemsHistory));

            contractItems.forEach(contractItem => {
                if (!!contractItem.custrecord_f3mm_ci_item) {
                    let itemId = contractItem.custrecord_f3mm_ci_item.value;
                    let foundItem = items.filter(item => item.id === itemId)[0];
                    if (!!foundItem) {
                        contractItem.custrecord_f3mm_ci_item.baseprice = foundItem.baseprice;
                        contractItem.custrecord_f3mm_ci_item.displayname = foundItem.displayname;
                        contractItem.custrecord_f3mm_ci_item.itemid = foundItem.itemid;
                        contractItem.custrecord_f3mm_ci_item.priceLevels = foundItem.priceLevels;
                    }
                }
            });

            F3.Util.Utility.logDebug("ContractDAL.getWithDetails(id); // contract", JSON.stringify(contract));
        } catch (ex) {
            F3.Util.Utility.logException("ContractDAL.getWithDetails(id); // id = " + id, ex);
            throw ex;
        }

        return contract;
    }

    /**
     * Search contracts with specified filters
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    public searchContractItems(params) {
        let filters = [];
        let cols = [];
        let contractItemInternalId = "customrecord_f3mm_contract_item";

        if (!!params) {
            if (!!params.contractIds) {
                filters.push(new nlobjSearchFilter("custrecord_f3mm_ci_contract", null, "anyof", params.contractIds));
            }
        }

        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_quantity"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_item"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_price"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_amount"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_item_description"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_price_level"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_contract"));
        cols.push(new nlobjSearchColumn("custrecord_f3mm_ci_item_long_name"));

        let records = super.getAll(filters, cols, contractItemInternalId);
        return records;
    }

    /**
     * Search contracts with specified filters
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    public search(params: any) {
        let result = {
            records: null,
            total: 0
        };
        let filters = [];

        if (!!params) {

            if (!F3.Util.Utility.isBlankOrNull(params.contract_number)) {
                filters.push(new nlobjSearchFilter(this.fields.contractNumber.id, null, "contains", params.contract_number));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.status)) {
                filters.push(new nlobjSearchFilter(this.fields.status.id, null, "anyof", params.status));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.customer)) {
                filters.push(new nlobjSearchFilter(this.fields.customer.id, null, "anyof", params.customer));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.start_date)) {
                filters.push(new nlobjSearchFilter(this.fields.startDate.id, null, "onorafter", params.start_date));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.end_date)) {
                let end_date_criterion = params.end_date_criterion || "onorbefore";
                filters.push(new nlobjSearchFilter(this.fields.endDate.id, null, end_date_criterion, params.end_date));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.sales_rep)) {
                filters.push(new nlobjSearchFilter(this.fields.salesRep.id, null, "anyof", params.sales_rep));
            }

            if (!F3.Util.Utility.isBlankOrNull(params.vendor)) {
                filters.push(new nlobjSearchFilter(this.fields.contractVendor.id, null, "anyof", params.vendor));
            }

            // exclude deleted & inactive records
            filters.push(new nlobjSearchFilter("isinactive", null, "is", params.isinactive === true ? "T" : "F"));
        }

        filters.push(new nlobjSearchFilter(this.fields.deleted.id, null, "is", "F"));

        // get contract records with specified filters
        result.records = super.getAll(filters, null, null, params);

        // fetch contract items
        if (result.records && result.records.length) {
            let commonDAL = new CommonDAL();
            let contractIds = result.records.map(record => record.id);
            let contractItems = this.searchContractItems({contractIds: contractIds});
            result.records.forEach(record => {
                record.sublists = record.sublists || {};
                let filtered = contractItems.filter(ci => ci.custrecord_f3mm_ci_contract.value === record.id);
                record.sublists.recmachcustrecord_f3mm_ci_contract = filtered;

                // attach quotes
                record.sublists.quotes = commonDAL.getQuotes({
                    contractId: record.id
                });
            });
        }

        // count records
        let columns = [new nlobjSearchColumn("internalid", null, "count").setLabel("total")];
        let count = super.getAll(filters, columns)[0];
        result.total = count.total;

        return result;
    }

    /**
     * Generates a Quote from Contract. the contract is loaded based on specified contractId parameter.
     * @param {string} contractId id of the contract to generate contract from
     * @returns {number} id of quote generated from contract
     */
    public generateQuote(params) {

        let result: {
            id: any
        } = null;

        try {
            let contractId = params.contractId;
            let contract = this.getWithDetails(contractId);
            let quote = nlapiCreateRecord("estimate");

            let tranDate = new Date();
            // let expectedClosingDate = new Date();
            // expectedClosingDate.setDate(expectedClosingDate.getDate() + 30); // add 7 days

            // set due date to end date of contract
            let dueDate = contract[this.fields.endDate.id];
            if (!dueDate) {
                dueDate = new Date();
                dueDate = dueDate.setDate(dueDate.getDate() + 30);
                dueDate = nlapiDateToString(dueDate); // add 30 days
            }
            let expectedClosingDate = dueDate;

            quote.setFieldValue("trandate", nlapiDateToString(tranDate)); // mandatory field
            quote.setFieldValue("expectedclosedate", expectedClosingDate); // mandatory field
            quote.setFieldValue("duedate", dueDate); // mandatory field

            // entityStatuses for references
            let proposalStatusId = "10";
            quote.setFieldValue("entitystatus", proposalStatusId); // proposal
            quote.setFieldValue("salesrep", contract[this.fields.salesRep.id].value);
            quote.setFieldValue("entity", contract[this.fields.customer.id].value);
            quote.setFieldValue("custbody_f3mm_quote_contract", contractId); // attach contract record
            quote.setFieldValue("department", contract[this.fields.department.id].value);

            quote.setFieldValue("custbody_estimate_end_user", contract[this.fields.primaryContact.id].value);
            quote.setFieldValue("custbody_end_user_email", contract[this.fields.primaryContactEmail.id]);
            quote.setFieldValue("custbody_f3mm_quote_status", ContractStatus.PENDING_REP_APPROVAL + "");
            quote.setFieldValue("memo", contract[this.fields.memo.id]);
            quote.setFieldValue("discountitem", contract[this.fields.discountItemId.id]);

            let contractItems = contract.sublists.recmachcustrecord_f3mm_ci_contract;
            if (!!contractItems) {
                contractItems.forEach(contractItem => {
                    quote.selectNewLineItem("item");
                    quote.setCurrentLineItemValue("item", "item", contractItem.custrecord_f3mm_ci_item.value);
                    quote.setCurrentLineItemValue("item", "quantity", contractItem.custrecord_f3mm_ci_quantity);
                    quote.setCurrentLineItemValue("item", "price", contractItem.custrecord_f3mm_ci_price_level.value);
                    quote.setCurrentLineItemValue("item", "rate", contractItem.custrecord_f3mm_ci_price);
                    quote.commitLineItem("item");
                });
            }

            let quoteId = nlapiSubmitRecord(quote);

            EmailHelper.sendQuoteGenerationEmail(contract, quoteId);

            result = {
                id: quoteId
            };

        } catch (e) {
            F3.Util.Utility.logException("ContractDAL.generateQuote", e.toString());
            throw e;
        }

        return result;
    }

    /**
     * Delete Contract
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    public delete(contract): {
        id: any
    } {
        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        let record: any = {};
        record.id = contract.id;
        record[this.fields.deleted.id] = "T";
        record.isinactive = "T";

        let id = this.upsert(record);
        let result = {
            id: id
        };
        return result;
    }


    /**
     * Void Selected Contracts
     * @param {object} contractIds array containing ids of contracts to void
     * @returns {number} id of created / updated contract
     */
    public void(contractIds): any[] {
        if (!contractIds) {
            throw new Error("contractIds cannot be null.");
        }

        let result = [];
        let voidStatusId = 5;

        contractIds.forEach(contractId => {
            try {
                let record: any = {};
                record.id = contractId;
                record[this.fields.status.id] = voidStatusId; // void

                let id = this.upsert(record);
                result[contractId] = true;
            } catch (e) {
                F3.Util.Utility.logException("ContractDAL.void", e.toString());
                result[contractId] = false;
            }
        });

        return result;
    }


    /**
     * Export records in csv format
     * @param {object} params json object contain filters data
     * @returns {object[]} array of json representation of contract objects
     */
    public exportToCSV(params) {
        let searchResult = this.search(params);
        let records = searchResult.records;
        let includeHeader = true;
        let contents = "";

        let content = [];
        let temp = [];
        let keysToExclude = ["recordType", "custrecord_f3mm_deleted"];
        let keyObjects = [
            "custrecord_f3mm_contract_vendor",
            "custrecord_f3mm_customer",
            "custrecord_f3mm_department",
            "custrecord_f3mm_primary_contact",
            "custrecord_f3mm_sales_rep",
            "custrecord_f3mm_status"
        ];

        if (includeHeader === true && records.length > 0) {
            let record = records[0];
            for (let key in record) {
                if (keysToExclude.indexOf(key) > -1) {
                    continue;
                }

                let columnName = key;
                columnName = columnName.replace("custrecord_f3mm_", "");
                columnName = columnName.replace(/_/gi, " ");

                if (typeof record[key] === "object" || keyObjects.indexOf(key) > -1) {
                    temp.push(columnName + " id");
                    temp.push(columnName + " name");
                } else {
                    temp.push(columnName);
                }
            }

            content.push(temp);
        }

        // Looping through the search Results
        for (let i = 0; i < records.length; i++) {
            temp = [];
            let record = records[i];

            // Looping through each column and assign it to the temp array
            for (let key in record) {
                if (keysToExclude.indexOf(key) > -1) {
                    continue;
                }

                if (typeof record[key] === "object" || keyObjects.indexOf(key) > -1) {
                    let obj = record[key] || {};
                    temp.push(obj.value);
                    temp.push(obj.text);
                } else {
                    temp.push(record[key]);
                }
            }

            content.push(temp);
        }

        // Looping through the content array and assigning it to the contents string variable.
        for (let z = 0; z < content.length; z++) {
            contents += content[z].toString() + "\n";
        }

        return contents;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    public changeStatus(options): {
        id: any
    } {

        if (!options || !options.cid) {
            throw new Error("contract id cannot be null.");
        }

        let record: any = {};
        record.id = options.cid;
        record[this.fields.status.id] = options.status;

        let id = this.upsert(record);
        let result = {
            id: id
        };

        // update quote as well
        let commonDAL = new CommonDAL();
        let quotes = commonDAL.getQuotes({contractId: id});
        if (quotes && quotes.length) {
            let lastQuote = quotes[quotes.length - 1];
            let quoteRecord: any = {};
            quoteRecord.id = lastQuote.id;
            quoteRecord.custbody_f3mm_quote_status = options.status;
            this.upsert(quoteRecord, null, "estimate");
        }

        return result;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    public update(contract): {
        id: any
    } {

        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        let record: any = {};
        record.id = contract.id;
        record[this.fields.primaryContact.id] = contract.custrecord_f3mm_primary_contact.value;
        record[this.fields.primaryContactEmail.id] = contract.custrecord_f3mm_primary_contact_email;
        record[this.fields.startDate.id] = contract.custrecord_f3mm_start_date;
        record[this.fields.endDate.id] = contract.custrecord_f3mm_end_date;
        record[this.fields.contractNumber.id] = contract.custrecord_f3mm_contract_number;
        record[this.fields.name.id] = contract.custrecord_f3mm_contract_number;
        record[this.fields.memo.id] = contract.custrecord_f3mm_memo;

        let id = this.upsert(record);
        let result = {
            id: id
        };
        return result;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    public updateOrCreate(contract): {
        id: any
    } {

        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        let record = this.prepareDataToUpsert(contract);

        let removeExistingLineItems = true;
        let id = this.upsert(record, removeExistingLineItems);

        if (contract.is_renew === "on") {
            let updatedRecord = this.getWithDetails(id);
            EmailHelper.sendRenewEmail(updatedRecord);
        }

        let result = {
            id: id
        };
        return result;
    }


    /**
     * Create/Update a Contract based on json data passed
     * @param {object} contract json object containing data for contract
     * @returns {number} id of created / updated contract
     */
    public updateNotifications(contract): {
        id: any
    } {

        if (!contract) {
            throw new Error("contract cannot be null.");
        }

        let record = this.prepareDataToUpsert(contract, true);

        let removeExistingLineItems = false;
        let id = this.upsert(record, removeExistingLineItems);

        // if (contract.is_renew === "on") {
        //    let updatedRecord = this.getWithDetails(id);
        //    EmailHelper.sendRenewEmail(updatedRecord);
        // }

        let result = {
            id: id
        };
        return result;
    }

    /**
     * Prepare record to insert in db
     * @param {object} contract json object containing data for contract
     * @returns {object} prepared record object to insert in db
     */
    private prepareDataToUpsert(contract: any, onlyUpdateNotifications = false) {

        let record: any = {};
        record.id = contract.id;

        if ( onlyUpdateNotifications !== true ) {
            record[this.fields.customer.id] = contract.customer;
            record[this.fields.primaryContact.id] = contract.primary_contact;
            record[this.fields.primaryContactEmail.id] = contract.primary_contact_email;
            record[this.fields.contractVendor.id] = contract.vendor;
            record[this.fields.totalQuantitySeats.id] = contract.total_quantity_seats || 0;
            record[this.fields.startDate.id] = contract.start_date;
            record[this.fields.endDate.id] = contract.end_date;
            record[this.fields.memo.id] = contract.memo;
            record[this.fields.salesRep.id] = contract.sales_rep;
            record[this.fields.department.id] = contract.department;
            record[this.fields.contractNumber.id] = contract.contract_number;
            record[this.fields.name.id] = contract.contract_number;
            record[this.fields.status.id] = contract.status;
            record[this.fields.poNumber.id] = contract.po_number;
            record[this.fields.duration.id] = contract.duration;
            record[this.fields.systemId.id] = contract.system_id;
            record[this.fields.discountItemId.id] = contract.discount;
            record[this.fields.notificationDaysPrior.id] = contract.notification_days || "0";
            record[this.fields.notificationOnQuoteGenerate.id] = contract.notification_quote_generation === "on" ? "T" : "F";
        }

        record[this.fields.notification5DaysPrior.id] = contract.notification_5_days === "on" ? "T" : "F";
        record[this.fields.notification3DaysPrior.id] = contract.notification_3_days === "on" ? "T" : "F";
        record[this.fields.notification1DayPrior.id] = contract.notification_1_day === "on" ? "T" : "F";
        record[this.fields.notificationOnExpiration.id] = contract.notification_expiration === "on" ? "T" : "F";
        record[this.fields.notificationOnRenewal.id] = contract.notification_renewal === "on" ? "T" : "F";
        record[this.fields.notificationOnQuoteApproval.id] = contract.notification_quote_approval === "on" ? "T" : "F";

        if ( onlyUpdateNotifications !== true ) {
            if (!!contract.items) {

                let contractItemsSublist = {
                    internalId: "recmachcustrecord_f3mm_ci_contract",
                    keyField: "id",
                    lineitems: []
                };

                contract.items.forEach(item => {
                    let lineitem = {
                        custrecord_f3mm_ci_amount: item.amount,
                        custrecord_f3mm_ci_item: item.item_id,
                        custrecord_f3mm_ci_item_description: item.item_description || "",
                        custrecord_f3mm_ci_item_long_name: item.longname || "",
                        custrecord_f3mm_ci_price: item.price === "-1" ? "" : item.price,
                        custrecord_f3mm_ci_price_level: item.price_level,
                        custrecord_f3mm_ci_quantity: item.quantity,
                        id: item.id || null
                    };

                    contractItemsSublist.lineitems.push(lineitem);
                });

                record.sublists = [];
                record.sublists.push(contractItemsSublist);
            }
        }

        return record;
    }

}
