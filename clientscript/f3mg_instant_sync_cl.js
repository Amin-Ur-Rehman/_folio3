/**
 * Created by zahmed on 13-Mar-15.
 * Description:
 * - This class is reponsible for invoking a suitelet which will sync the record to Magento
 * Referenced By:
 * -
 * -
 * Dependencies:
 * -
 * -
 */

/**
 * InstantSync class that has the actual functionality of client script.
 * All business logic will be encapsulated in this class.
 */
var InstantSync = (function () {
    return {
        popupWindowHandler: null,
        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Access mode: create, copy, edit
         * @returns {Void}
         */
        clientPageInit: function (type) {
            //jQuery(document).ready(function(){ this.processRecord(); });
            this.processRecord();
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @returns {Boolean} True to continue save, false to abort save
         */
        clientSaveRecord: function () {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Boolean} True to continue changing field value, false to abort value change
         */
        clientValidateField: function (type, name, linenum) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @param {Number} linenum Optional line item number, starts from 1
         * @returns {Void}
         */
        clientFieldChanged: function (type, name, linenum) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @param {String} name Field internal id
         * @returns {Void}
         */
        clientPostSourcing: function (type, name) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientLineInit: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to save line item, false to abort save
         */
        clientValidateLine: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Void}
         */
        clientRecalc: function (type) {

        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item insert, false to abort insert
         */
        clientValidateInsert: function (type) {

            return true;
        },

        /**
         * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
         * @appliedtorecord recordType
         *
         * @param {String} type Sublist internal id
         * @returns {Boolean} True to continue line item delete, false to abort delete
         */
        clientValidateDelete: function (type) {

            return true;
        },
        openPopupWindow: function (element, url) {
            this.popupWindowHandler = window.open(url, "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=200, left=200, width=400, height=400");
        },

        appendDiv: function () {
            var addDiv = "<div id='overlay' style='position: fixed;top: 0;left: 0;width: 100%;" +
                "height: 100%;background-color: #000;filter: alpha(opacity=80);-moz-opacity: 0.8;-khtml-opacity: 0.8;opacity: .8;z-index: 10000;" +
                " display: none;'>" +
                "<div class='theText' style='color: #FFFFFF; font-size:20px; font-weight:700;" +
                " margin-top:15%; margin-left: 40%;'> <br><br>Please Wait. Syncing is In Process...<br><br></div>" +
                "</div>";

            jQuery('body').append(addDiv);

            jQuery('#overlay').fadeIn();
        },

        getHiddenData: function () {
            var data = {};
            data.postData = {};

            data.url = nlapiGetFieldValue('custpage_url');

            data.postData.recordId = nlapiGetFieldValue('custpage_recordid');
            data.postData.recordType = nlapiGetFieldValue('custpage_recordtype');
            data.postData.storeId = nlapiGetFieldValue('custpage_storeid');

            return data;
        },

        successFunction: function (result) {
            jQuery('#overlay').fadeOut();
            alert(result.msg);
            window.close();
        },
        failureFunction: function (jqXHR, textStatus) {
            jQuery('#overlay').fadeOut();
            if (textStatus === 'timeout') {
                alert('Request timeout');
            } else {
                alert(textStatus);
                var result = JSON.parse(jqXHR.responseText);
            }
        },


        syncToMagento: function (url, postData) {
            var self = this;

            jQuery.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                timeout: 45000
            }).done(function (d) {
                self.successFunction(d);
            }).fail(function (jqXHR, textStatus) {
                self.failureFunction(jqXHR, textStatus);
            });

        },

        processRecord: function () {
            debugger;
            // append div in body
            this.appendDiv();
            // get data from hidden fields
            var hiddenData = this.getHiddenData();
            // make ajax request
            this.syncToMagento(hiddenData.url, hiddenData.postData);
        }
    };
})();


/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Access mode: create, copy, edit
 * @returns {Void}
 */
function InstantSyncclientPageInit(type) {
    return InstantSync.clientPageInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @returns {Boolean} True to continue save, false to abort save
 */
function InstantSyncclientSaveRecord() {

    return
    return InstantSync.clientSaveRecord();
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Boolean} True to continue changing field value, false to abort value change
 */
function InstantSyncclientValidateField(type, name, linenum) {

    return InstantSync.clientValidateField(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @param {Number} linenum Optional line item number, starts from 1
 * @returns {Void}
 */
function InstantSyncclientFieldChanged(type, name, linenum) {
    return InstantSync.clientFieldChanged(type, name, linenum);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @param {String} name Field internal id
 * @returns {Void}
 */
function InstantSyncclientPostSourcing(type, name) {
    return InstantSync.clientPostSourcing(type, name);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function InstantSyncclientLineInit(type) {
    return InstantSync.clientLineInit(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to save line item, false to abort save
 */
function InstantSyncclientValidateLine(type) {

    return InstantSync.clientValidateLine(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Void}
 */
function InstantSyncclientRecalc(type) {
    return InstantSync.clientRecalc(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item insert, false to abort insert
 */
function InstantSyncclientValidateInsert(type) {

    return InstantSync.clientValidateInsert(type);
}

/**
 * The recordType (internal id) corresponds to the "Applied To" record in your script deployment.
 * @appliedtorecord recordType
 *
 * @param {String} type Sublist internal id
 * @returns {Boolean} True to continue line item delete, false to abort delete
 */
function InstantSyncclientValidateDelete(type) {

    return InstantSync.clientValidateDelete(type);
}
