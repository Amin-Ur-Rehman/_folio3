/*
	Functions:
	1) storeMessage(customerNsId,subject,message)
    Comment: It stores the given message to the customer/lead/prospect/contact/vendor/partner/employee message archive (Message Tab).
	
	2) isBlankOrNull(str)
	Comment: It returns true if the given string is not 'undefined', null, empty, else it returns false
 */

var MESSAGE_TRUNC = 1;
var HEADER_TRUNC = 2;
var FOOTER_TRUNC = 3;
var MAILMERGE_TRUNC = 4;
 
var recipientRecords = null;
var recipientRecordsChunk = null;
 
var maxcount = 0;
var part = 1;
var length = 0;

function getTimeStamp() {
    return new Date().getTime() + '';
}

function logError(type, title, e) {
	if ( e instanceof nlobjError ) {
		nlapiLogExecution( type, title, e.getCode() + ' - ' + e.getDetails() );
	}
	else {
		nlapiLogExecution( type, title, e.toString() );
	}
}

function enableDisableControlByName(name, isEnable) {
	var ctrls = document.getElementsByName(name);
	if (ctrls != null && ctrls.length > 0) {
		for (var x=0;x<ctrls.length;x++) {
			if (ctrls[x].disabled) {
				if (isEnable) {
					ctrls[x].disabled = '';
				}
				else {
					ctrls[x].disabled = 'disabled';
				}
			}
			else {
				if (isEnable) {
					ctrls[x].setAttribute('disabled','');
				}
				else {
					ctrls[x].setAttribute('disabled','disabled');
				}
			}
		}
	}
}

function fixSpecialSymbols(msg) {
	var index = -1;
	var str1 = '';
	var str2 = '';
	if (!isBlankOrNull(msg)) {
		for (var x=161;x<=255;x++) {
			while ((index = isCharCode(msg, x)) != -1) {
				str1 = msg.substring(0,index);
				str2 = msg.substring(index + 1);
				msg = str1 + '&#' + x + ';' + str2;
			}
		}
		for (var x=8192;x<=8369;x++) {
			while ((index = isCharCode(msg, x)) != -1) {
				str1 = msg.substring(0,index);
				str2 = msg.substring(index + 1);
				msg = str1 + '&#' + x + ';' + str2;
			}
		}
	}
	return msg;
}

function isCharCode(msg, code) {
	var index = -1;
	for (var x=0;x<msg.length;x++) {
		if (msg.charCodeAt(x) == code) {
			index = x;
			break;
		}
	}
	return index;
}

function isOnlySpaces(str) {
	var status = false;
	if (str != null && typeof(str) != 'undefined' && str.length > 0) {
		while (str.indexOf(' ') == 0) {
			str = str.substring(1);
		}
		if (str.length == 0) {
			status = true;
		}
	}
	return status;
}

function isIECheck(req) {
	var isIEStatus = false;
	var h = req.getAllHeaders();
	for(var head in h) {
		if(h[head].indexOf("MSIE") >= 0) {
			isIEStatus = true;
			break;
		}
	}
	return isIEStatus;
}

function sortNumericArray(arr, isAsc) {
	if (isAsc) {
		return arr.sort(function(a,b) { return a - b; });
	}
	else {
		return arr.sort(function(a,b) { return b - a; });
	}
}

function storeSMSSendConfirmation(nsId, recordType, subject, message, isDeliveryRequired, isPopupSch, popupSchDate, popupSchTime, popupPhone, timeZoneOffset, dayLight, createdBy, groupSMSId, parentEntityId, altname, timeStamp) {
    var msgId = '';
	var defaultEmployee = isBlankOrNull(createdBy) ? nlapiGetUser() : createdBy;
	var receiptId = getNextReceiptId();
	
	if (defaultEmployee < 1 && !isBlankOrNull(nlapiGetContext().getSetting('SCRIPT','custscript_mm_smsreplyemlauthor'))) {
		defaultEmployee = nlapiGetContext().getSetting('SCRIPT','custscript_mm_smsreplyemlauthor');
	}
	try {
		var msg = nlapiCreateRecord('message');
		msg.setFieldValue('author',defaultEmployee);
		if (recordType == 'contact') {
		    company = getCompanyByContact(null, nsId);
		    if (company != null) {
		        msg.setFieldValue('entity', company.getId());
		        msg.setFieldValue('recipient', nsId);
		        msg.setFieldValue('subject', subject);
		    }
		    else {
		        msg.setFieldValue('entity', nsId);
		        msg.setFieldValue('recipient', nsId);
		        msg.setFieldValue('subject', subject);
		    }
		}
		else if (recordType == 'opportunity') {
		    msg.setFieldValue('entity', parentEntityId);
		    msg.setFieldValue('recipient', parentEntityId);
		    msg.setFieldValue('transaction', nsId);
		    msg.setFieldValue('subject', subject + ' [for opportunity internalid: ' + nsId + ']');
		}
		else {
		    msg.setFieldValue('entity', nsId);
		    msg.setFieldValue('recipient', nsId);
		    msg.setFieldValue('subject', subject);
		}
		msg.setFieldValue('message',replaceAll(message,'\n','<br>'));
		msg.setFieldValue('messageType','SMS');
		msgId = nlapiSubmitRecord(msg, true);
		createSMSReceipt(receiptId, msgId, nsId, getCurrentDate(), defaultEmployee, isDeliveryRequired, 'F', null, isPopupSch, popupSchDate, popupSchTime, popupPhone, timeZoneOffset, dayLight, recordType, groupSMSId, replaceAll(message, '\n', '<br>'), altname, timeStamp);
		return receiptId;
	}
	catch(e) {
		logError ('DEBUG', 'Storing Message', e);
		return null;
	}
}
function createSMSReceipt(receiptId, msgId, nsId, msgDate, senderId, isDelReq, isDelRec, delDate, isPopupSch, popupSchDate, popupSchTime, popupPhone, timeZoneOffset, dayLight, recordType, groupSMSId, message, altname, timeStamp) {
	var rec = nlapiCreateRecord('customrecord_mm_sms_receipt');
	rec.setFieldValue('custrecord_mm_sms_receipt_id',parseInt(receiptId));
	rec.setFieldValue('custrecord_mm_sms_receipt_msgid', msgId);
	rec.setFieldValue('custrecord_mm_sms_receipt_message', message);
	rec.setFieldValue('custrecord_mm_sms_receipt_entityid',nsId);
	rec.setFieldValue('custrecord_mm_sms_receipt_sentdate',msgDate);
	rec.setFieldValue('custrecord_mm_sms_receipt_sender',senderId);
	rec.setFieldValue('custrecord_mm_sms_receipt_isdelreq',isDelReq);
	rec.setFieldValue('custrecord_mm_sms_receipt_isdelrec',isDelRec);
	rec.setFieldValue('custrecord_mm_sms_receipt_delrecdate', delDate);
	rec.setFieldValue('custrecord_mm_sms_receipt_altname', altname);
	rec.setFieldValue('custrecord_mm_sms_receipt_timestamp', timeStamp);
	if (!isBlankOrNull(isPopupSch))	rec.setFieldValue('custrecord_mm_sms_receipt_popsch',isPopupSch);
	if (!isBlankOrNull(popupSchDate)) rec.setFieldValue('custrecord_mm_sms_receipt_popschdate',popupSchDate);
	if (!isBlankOrNull(popupSchTime)) rec.setFieldValue('custrecord_mm_sms_receipt_popschtime',popupSchTime);
	if (!isBlankOrNull(popupPhone)) rec.setFieldValue('custrecord_mm_sms_receipt_popphone', popupPhone);
	if (!isBlankOrNull(timeZoneOffset)) rec.setFieldValue('custrecord_mm_sms_receipt_popoffset', timeZoneOffset); else rec.setFieldValue('custrecord_mm_sms_receipt_popoffset', '0');
	if (!isBlankOrNull(dayLight)) rec.setFieldValue('custrecord_mm_sms_receipt_daylightsaving', dayLight); else rec.setFieldValue('custrecord_mm_sms_receipt_daylightsaving', 'F');
	if (isDelReq == 'T') {
	    rec.setFieldValue('custrecord_mm_sms_receipt_deliverystatus', 'Pending');
	}
	else {
	    rec.setFieldValue('custrecord_mm_sms_receipt_deliverystatus', 'Not Requested');
	}
	if (!isBlankOrNull(recordType)) {
	    if (recordType != 'opportunity')
	        rec.setFieldValue('custrecord_mm_sms_receipt_einternalid', nsId);
	    else
	        rec.setFieldValue('custrecord_mm_sms_receipt_ointernalid', nsId);
	}
	if (!isBlankOrNull(groupSMSId)) rec.setFieldValue('custrecord_mm_sms_receipt_groupsmsid', groupSMSId);
	return nlapiSubmitRecord(rec,true);
}
function getNextReceiptId() {
	var temp = nlapiSearchRecord('customrecord_mm_sms_receipt_count',null,null,null);
	var recId = temp[0].getId();
	var rec = null;
	var status = true;
	var dt = '';
	var count = 0;
	do {
		dt = getCurrentDateTime();
		rec = nlapiLoadRecord('customrecord_mm_sms_receipt_count',recId);
		count = rec.getFieldValue('custrecord_mm_sms_receipt_curval');
		if (count > 2147483646) {
			count = 1;
		}
		else {
			count++;
		}
		rec.setFieldValue('custrecord_mm_sms_receipt_curval',count);
		rec.setFieldValue('custrecord_mm_sms_receipt_lastupdated',dt);
		nlapiSubmitRecord(rec, true);
		rec = nlapiLoadRecord('customrecord_mm_sms_receipt_count',recId);
		if (rec.getFieldValue('custrecord_mm_sms_receipt_lastupdated') == dt) {
			status = false;
		}
	} while (status);
	return count;
}
function getSMSReceipt(receiptId, forDelivery) {
	var recs = null;
	var filters = new Array();
	var cols = new Array();
	var obj = null;
	var internalIdMax = -1;
	if (forDelivery) {
		filters.push(new nlobjSearchFilter('custrecord_mm_sms_receipt_isdelrec',null,'is','F'));
	}
    filters.push(new nlobjSearchFilter('custrecord_mm_sms_receipt_id', null, 'equalto', receiptId));
    cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_groupsmsid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_id'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_msgid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_entityid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_einternalid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_ointernalid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_sentdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_sender'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_isdelrec'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_delrecdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popsch'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popschdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popschtime'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popphone'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popoffset'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_daylightsaving'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_timestamp'));
	recs = nlapiSearchRecord('customrecord_mm_sms_receipt',null,filters,cols);
	if (recs && recs.length > 0) {
		obj = new Object();
		for (var x=0;x<recs.length;x++) {
			if (parseFloat(recs[x].getId()) > parseFloat(internalIdMax)) {
				internalIdMax = recs[x].getId();
				obj.internalId = recs[x].getId();
				obj.id = recs[x].getValue('custrecord_mm_sms_receipt_id');
				obj.msgId = recs[x].getValue('custrecord_mm_sms_receipt_msgid');
				obj.entityId = recs[x].getValue('custrecord_mm_sms_receipt_entityid');
				obj.eid = recs[x].getValue('custrecord_mm_sms_receipt_einternalid');
				obj.oid = recs[x].getValue('custrecord_mm_sms_receipt_ointernalid');
				obj.sentDate = recs[x].getValue('custrecord_mm_sms_receipt_sentdate');
				obj.sender = recs[x].getValue('custrecord_mm_sms_receipt_sender');
				obj.isReplyRec = recs[x].getValue('custrecord_mm_sms_receipt_isdelrec');
				obj.replyRecDate = recs[x].getValue('custrecord_mm_sms_receipt_delrecdate');
				obj.popupSch = recs[x].getValue('custrecord_mm_sms_receipt_popsch');
				obj.popupSchDate = recs[x].getValue('custrecord_mm_sms_receipt_popschdate');
				obj.popupSchTime = recs[x].getValue('custrecord_mm_sms_receipt_popschtime');
				obj.popupPhone = recs[x].getValue('custrecord_mm_sms_receipt_popphone');
				obj.popupOffset = recs[x].getValue('custrecord_mm_sms_receipt_popoffset');
				obj.dayLight = recs[x].getValue('custrecord_mm_sms_receipt_daylightsaving');
				obj.groupId = recs[x].getValue('custrecord_mm_sms_receipt_groupsmsid');
				obj.timeStamp = recs[x].getValue('custrecord_mm_sms_receipt_timestamp');
			}
		}
	}
	return obj;
}

function getSMSReceiptsForPopupSch() {
	var recs = null;
	var filters = new Array();
	var cols = new Array();
	var obj = null;
	var arr = new Array();
	filters.push(new nlobjSearchFilter('custrecord_mm_sms_receipt_popsch', null, 'is', 'T'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_groupsmsid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_id'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_msgid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_entityid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_einternalid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_ointernalid'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_sentdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_sender'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_isdelreq'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_isdelrec'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_delrecdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popsch'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popschdate'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popschtime'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popphone'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_popoffset'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_daylightsaving'));
	cols.push(new nlobjSearchColumn('custrecord_mm_sms_receipt_timestamp'));
	recs = nlapiSearchRecord('customrecord_mm_sms_receipt',null,filters,cols);
	if (recs && recs.length > 0) {
		for (var x=0;x<recs.length;x++) {
			obj = new Object();
			obj.internalId = recs[x].getId();
			obj.id = recs[x].getValue('custrecord_mm_sms_receipt_id');
			obj.msgId = recs[x].getValue('custrecord_mm_sms_receipt_msgid');
			obj.entityId = recs[x].getValue('custrecord_mm_sms_receipt_entityid');
			obj.eid = recs[x].getValue('custrecord_mm_sms_receipt_einternalid');
			obj.oid = recs[x].getValue('custrecord_mm_sms_receipt_ointernalid');
			obj.sentDate = recs[x].getValue('custrecord_mm_sms_receipt_sentdate');
			obj.sender = recs[x].getValue('custrecord_mm_sms_receipt_sender');
			obj.isDelReq = recs[x].getValue('custrecord_mm_sms_receipt_isdelreq');
			obj.isReplyRec = recs[x].getValue('custrecord_mm_sms_receipt_isdelrec');
			obj.replyRecDate = recs[x].getValue('custrecord_mm_sms_receipt_delrecdate');
			obj.popupSch = recs[x].getValue('custrecord_mm_sms_receipt_popsch');
			obj.popupSchDate = recs[x].getValue('custrecord_mm_sms_receipt_popschdate');
			obj.popupSchTime = recs[x].getValue('custrecord_mm_sms_receipt_popschtime');
			obj.popupPhone = recs[x].getValue('custrecord_mm_sms_receipt_popphone');
			obj.popupOffset = recs[x].getValue('custrecord_mm_sms_receipt_popoffset');
			obj.dayLight = recs[x].getValue('custrecord_mm_sms_receipt_daylightsaving');
			obj.groupId = recs[x].getValue('custrecord_mm_sms_receipt_groupsmsid');
			obj.timeStamp = recs[x].getValue('custrecord_mm_sms_receipt_timestamp');
			arr[arr.length] = obj;
		}
	}
	return arr;
}

function updateSMSDeliveryReceipt(receiptId, status, dateTimeTz) {
    try {
        var rec = nlapiLoadRecord('customrecord_mm_sms_receipt', receiptId);
        var groupId = null;
        var groupSMS = null;

        groupId = rec.getFieldValue('custrecord_mm_sms_receipt_groupsmsid');
        rec.setFieldValue('custrecord_mm_sms_receipt_isdelrec', 'T');
        rec.setFieldValue('custrecord_mm_sms_receipt_delrecdate', dateTimeTz); // getCurrentDateTime());
        if (!isBlankOrNull(status)) {
            status = status.toLowerCase();
            if (status == 'd') status = 'Delivered';
            else if (status == 'f') status = 'Failed';
            else status = 'Pending';
            rec.setFieldValue('custrecord_mm_sms_receipt_deliverystatus', status);
        }
        nlapiSubmitRecord(rec, true);
    }
    catch (exp) {
        logError('ERROR', 'updateSMSDeliveryReceipt', exp);
    }
	
	//nlapiSubmitField('customrecord_mm_sms_receipt',receiptId,'custrecord_mm_sms_receipt_isdelrec','T');
	//nlapiSubmitField('customrecord_mm_sms_receipt',receiptId,'custrecord_mm_sms_receipt_delrecdate',getCurrentDateTime());
}

function updateSMSDeliveryReceiptForPopupSend(receiptId) {
	var rec = nlapiLoadRecord('customrecord_mm_sms_receipt', receiptId);
	rec.setFieldValue('custrecord_mm_sms_receipt_popsch', 'F');
	nlapiSubmitRecord(rec, true);
}

function isBlankOrNull(str) {
	if (typeof(str) == 'undefined' || str == 'undefined' || str == null || str == '') {
		return true;
	}
	else {
		return false;
	}
}
function isBlankOrNullPopup() {
	var html = 'function isBlankOrNull(str) {';
	html += 'if (typeof(str) == \'undefined\' || str == \'undefined\' || str == null || str == \'\') {';
	html += '	return true;';
	html += '}';
	html += 'else {';
	html += '	return false;';
	html += '}';
	html += '};';
	return html;
}
function getCurrentDate() {
	var dt = new Date();
	return (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear();
}
function getCurrentDateTime() {
	var dt = new Date();
	return (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + dt.getFullYear() + ' ' + dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
				//+ '.' + dt.getMilliseconds();
}
function fixPhoneNumber(p) {
	if (!isBlankOrNull(p)) {
		p = replaceAll(p,'-','');
		p = replaceAll(p,' ','');
		p = replaceAll(p,'(','');
		p = replaceAll(p,')','');
		p = replaceAll(p,'.','');
		p = removePrefixZeros(p);
		return p;
	}
	else {
		return p;
	}
}
function replaceAll(str,str1,str2) {
	while (str.indexOf(str1) >= 0) {
		str = str.replace(str1, str2);
	}
	return str;
}
function replaceAllPopup() {
	var html = 'function replaceAll(str,str1,str2) {';
	html += 'while (str.indexOf(str1) >= 0) {';
	html += '	str = str.replace(str1, str2);';
	html += '}';
	html += 'return str;';
	html += '};';
	return html;
}
function removePrefixZeros(p) {
	while (p.indexOf('0') == 0) {
		p = p.substring(1);
	}
	return p;
}
function storeSMSDeliveryMessage(receiptId,entityId,msgId,delDate,delStatus,eid,oid) {
    var rec = nlapiCreateRecord('customrecord_mm_deliveryreport');
	rec.setFieldValue('custrecord_mm_deliveryreport_receiptid', receiptId);
	if (!isBlankOrNull(oid)) {
	    rec.setFieldValue('custrecord_mm_deliveryreport_ointernalid', oid);
	}
	else if (!isBlankOrNull('eid')) {
	    rec.setFieldValue('custrecord_mm_deliveryreport_einternalid', eid);
	}
	rec.setFieldValue('custrecord_mm_deliveryreport_entityid', entityId);
	rec.setFieldValue('custrecord_mm_deliveryreport_messageid',msgId);
	rec.setFieldValue('custrecord_mm_deliveryreport_deldate',delDate);
	rec.setFieldValue('custrecord_mm_deliveryreport_delstatus',delStatus);
	nlapiSubmitRecord(rec,true);
}

function storeSMSReplyToCompany(entityId, defaultEmployee, message, subject) {
    var rec = loadEntityRecord(entityId, 'contact');
    if (rec) {
        if (!isBlankOrNull(rec.getFieldValue('company'))) {
            var msg = nlapiCreateRecord('message');
	        msg.setFieldValue('entity', rec.getFieldValue('company'));
		    msg.setFieldValue('author', rec.getFieldValue('company'));
		    msg.setFieldValue('recipient', defaultEmployee);
	        msg.setFieldValue('message', message);
	        msg.setFieldValue('messageType', 'SMS');
	        msg.setFieldValue('subject', subject + ' [for Contact:' + rec.getFieldValue('entityid') + ']');
	        msgId = nlapiSubmitRecord(msg, true);
        }    
    }
}

function storeSMSReplyMessage(entityId,subject,message,empNsId,stopSMS,isReply, receipt) {
    var defaultEmployee = empNsId;
    var msgId = null;
    var opRec = null;
	
	if (isBlankOrNull(defaultEmployee)) {
		defaultEmployee = nlapiGetUser();
	}
	if (defaultEmployee < 1 && !isBlankOrNull(nlapiGetContext().getSetting('SCRIPT','custscript_mm_smsreplyemlauthor'))) {
		defaultEmployee = nlapiGetContext().getSetting('SCRIPT','custscript_mm_smsreplyemlauthor');
	}
	var msg = nlapiCreateRecord('message');
	if (isReply == 'T') {
	    if (!isBlankOrNull(receipt.oid)) {
	        opRec = nlapiLoadRecord('opportunity', receipt.oid);
	        if (opRec) {
	            msg.setFieldValue('entity', opRec.getFieldValue('entity'));
	            msg.setFieldValue('author', opRec.getFieldValue('entity'));
	            msg.setFieldValue('recipient', defaultEmployee);
	            msg.setFieldValue('transaction', receipt.oid);
	            msg.setFieldValue('subject', subject + ' [for opportunity internal id: ' + receipt.oid + ']');
	        }
	    }
	    else {
	        msg.setFieldValue('entity', entityId);
	        msg.setFieldValue('author', entityId);
	        msg.setFieldValue('recipient', defaultEmployee);
	        msg.setFieldValue('subject', subject);
	    }
	}
	else {
	    msg.setFieldValue('entity', entityId);
		msg.setFieldValue('author',defaultEmployee);
		msg.setFieldValue('recipient', entityId);
		msg.setFieldValue('subject', subject);
	}
	msg.setFieldValue('message',message);
	msg.setFieldValue('messageType','SMS');
	msgId = nlapiSubmitRecord(msg, true);

	if (!isBlankOrNull(receipt.eid) && isReply == 'T') {
	    storeSMSReplyToCompany(entityId, defaultEmployee, message, subject);
	}

	createReplyLog(receipt, msgId, message);

	var rec = getEntityRecord(entityId);
	if (rec != null) {
		try { 
			rec.setFieldValue('custentity_mm_lastsmssentby', defaultEmployee); 
			rec.setFieldValue('custentity_mm_lastsmsmessage',message);
			if (stopSMS) {
				rec.setFieldValue('custentity_mm_stopsendingsms','T');
			}
			nlapiSubmitRecord(rec, true);
		} catch(e) { 
			logError ('DEBUG', 'Loading Entity Record', e);
		}
	}
}

function createReplyLog(receipt, messageId, message) {
    try {
        var rec = nlapiCreateRecord('customrecord_mm_sms_reply');
        var replyDate = getCurrentDateTimeTz(receipt.popupOffset, receipt.dayLight);
        rec.setFieldValue('custrecord_mm_sms_reply_smsreceiptid', receipt.internalId);
        rec.setFieldValue('custrecord_mm_sms_reply_replymsgid', messageId);
        rec.setFieldValue('custrecord_mm_sms_reply_message', message);
        rec.setFieldValue('custrecord_mm_sms_reply_date', replyDate);
        nlapiSubmitRecord(rec, true);
    }
    catch (exp) {
        logError('ERROR', 'createReplyLog', exp);
    }
}

function messageKeyDown()
{
	mailmergeCount();
    multipartchange(MESSAGE_TRUNC);
}

function messageBlur() {
	mailmergeCount();
    multipartchange(MESSAGE_TRUNC);
}

function headKeyDown(){
	multipartchange(HEADER_TRUNC);
}

function headBlur(){
	multipartchange(HEADER_TRUNC);
}

function footKeyDown(){
	multipartchange(FOOTER_TRUNC);
}

function footBlur(){
	multipartchange(FOOTER_TRUNC);
}

function iemessageKeyDown(){
	mailmergeCount();
    multipartchange(MESSAGE_TRUNC);
}

function iemessageBlur(){
	mailmergeCount();
    multipartchange(MESSAGE_TRUNC);
}

function ieheadKeyDown(){
	multipartchange(HEADER_TRUNC);
}

function ieheadBlur(){
	multipartchange(HEADER_TRUNC);
}

function iefootKeyDown(){
	multipartchange(FOOTER_TRUNC);
}

function iefootBlur(){
	multipartchange(FOOTER_TRUNC);
}

function multipartchange(priority)
{
    if(nlapiGetFieldValue('custpage_chkmultipart') == "F")
    {
        length = maxcount;
        length += String(nlapiGetFieldValue('custpage_txtheader')).length;
        length += String(nlapiGetFieldValue('custpage_txtfooter')).length;
        if(length > 160)
        {
			var _diff = 0;
            var hlength=String(nlapiGetFieldValue('custpage_txtheader')).length;
            var flength=String(nlapiGetFieldValue('custpage_txtfooter')).length;
            var tlength= hlength + flength + maxcount;
			if (isBlankOrNull(priority) || priority == FOOTER_TRUNC) {
				_diff = tlength - 160;						
				if (flength <= _diff) {						
					tlength -= flength;						
					flength = 0;							
				}											
				else {										
					flength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (hlength <= _diff) {						
					tlength -= hlength;						
					hlength = 0;							
				}											
				else {										
					hlength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (maxcount <= _diff) {						
					tlength -= maxcount;						
					maxcount = 0;							
				}											
				else {										
					maxcount -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				nlapiSetFieldValue('custpage_txtfooter',nlapiGetFieldValue('custpage_txtfooter').substring(0, flength)); 
				nlapiSetFieldValue('custpage_txtheader',nlapiGetFieldValue('custpage_txtheader').substring(0, hlength)); 		
				fixMailMergeLength(maxcount);
			}
			else if (priority == HEADER_TRUNC) {
				_diff = tlength - 160;						
				if (hlength <= _diff) {						
					tlength -= hlength;						
					hlength = 0;							
				}											
				else {										
					hlength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (flength <= _diff) {						
					tlength -= flength;						
					flength = 0;							
				}											
				else {										
					flength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (maxcount <= _diff) {						
					tlength -= maxcount;						
					maxcount = 0;							
				}											
				else {										
					maxcount -= _diff;						
					tlength = hlength + flength + maxcount;	
				}
				nlapiSetFieldValue('custpage_txtheader',nlapiGetFieldValue('custpage_txtheader').substring(0, hlength)); 		
				nlapiSetFieldValue('custpage_txtfooter',nlapiGetFieldValue('custpage_txtfooter').substring(0, flength)); 
				fixMailMergeLength(maxcount);
			}
			else if (priority == MESSAGE_TRUNC) {
				_diff = tlength - 160;						
				if (maxcount <= _diff) {						
					tlength -= maxcount;						
					maxcount = 0;							
				}											
				else {										
					maxcount -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (flength <= _diff) {						
					tlength -= flength;						
					flength = 0;							
				}											
				else {										
					flength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}											
				_diff = tlength - 160;						
				if (hlength <= _diff) {						
					tlength -= hlength;						
					hlength = 0;							
				}											
				else {										
					hlength -= _diff;						
					tlength = hlength + flength + maxcount;	
				}
				fixMailMergeLength(maxcount);
				nlapiSetFieldValue('custpage_txtfooter',nlapiGetFieldValue('custpage_txtfooter').substring(0, flength)); 
				nlapiSetFieldValue('custpage_txtheader',nlapiGetFieldValue('custpage_txtheader').substring(0, hlength));
			}
			tlength = mailmergeCount() + flength + hlength;
			setInlineCount (tlength + ' of 160 characters');
        }
		else {
			setInlineCount (length + ' of 160 characters');
		}
    }
    else if(nlapiGetFieldValue('custpage_chkmultipart') == "T")
    {
        length = maxcount;
        length += String(nlapiGetFieldValue('custpage_txtheader')).length;
        length += String(nlapiGetFieldValue('custpage_txtfooter')).length;
        if(length == 0) {
            part = 1;
		}
        else if((length % 153)==0) {
            part = length / 153;
        }
        else {
            part = Math.floor(length / 153);
            part=part+1;
        }
		setInlineCount (length + ' of (153 * ' + part + ') chars');
    }
}

function fixMailMergeLength(len) {
	var txt = nlapiGetFieldValue('custpage_txtmessage');
	var fields = getMailMergeFields();
	var txt1 = '';
	var txt2 = '';
	while (mailmergeCount(txt) > len && txt.length > 0) {
		if (txt.lastIndexOf(']') == (txt.length - 1)) {
			txt1 = txt.substring(0,txt.lastIndexOf(']'));
			if (txt1.lastIndexOf('[') >= 0) {
				txt2 = txt1.substring(txt1.lastIndexOf('[')) + ']';
				if(isAField(txt2, fields)) {
					txt = txt.substring(0,txt.lastIndexOf('['));
				}
				else {
					if (txt.length > 0) {
						txt = txt.substring(0,txt.length - 1);
					}
				}
			}
			else {
				if (txt.length > 0) {
					txt = txt.substring(0,txt.length - 1);
				}
			}
		}
		else {
			if (txt.length > 0) {
				txt = txt.substring(0,txt.length - 1);
			}
		}
	}
	nlapiSetFieldValue('custpage_txtmessage', txt);
}

function isAField(txt, fields) {
	for (var x=0;x<fields.length;x++) {
		if (txt == fields[x].key) {
			return true;
		}
	}
	return false;
}

function countMailMergeFields(txt, fields) {
	var cnt = 0;
	for (var x=0;x<fields.length;x++) {
		while (txt.indexOf(fields[x].key) >= 0) {
			txt = txt.replace(fields[x].key,'');
			cnt++;
		}
	}
	return cnt;
}

function getRecipientRecordsChunk(recipients) {
	recipientRecordsChunk = new Array();
	if (recipients != null && recipients.length > 0 && recipientRecords != null && recipientRecords.length > 0) {
		for (var x=0;x<recipients.length;x++) {
			for (var y=0;y<recipientRecords.length;y++) {
				if (recipientRecords[y].internalid == recipients[x]) {
					recipientRecordsChunk.push(recipientRecords[y]);
					break;
				}
			}
		}
	}
	if (recipientRecordsChunk.length == 0) {
		recipientRecordsChunk = null;
	}
	return recipientRecordsChunk;
}

function mailmergeCount(txt)
{
	var temp = "";
    var recipients=new Array();
	maxcount = 0;
	if (isBlankOrNull(txt)) {
		txt = nlapiGetFieldValue('custpage_txtmessage');
	}
    recipients=nlapiGetFieldValue('custpage_ddlrecipientsvalues');
	if (!isBlankOrNull(recipients)) {
		recipients = recipients.replace(/ /g,'').split(',');//String.fromCharCode(5));
		var colNames=new Array();
		var mmfields = getMergeFields(); //getMailMergeFields();
		if (recipientRecordsChunk == null || recipientRecordsChunk.length == 0) {
			recipientRecordsChunk = getRecipientRecordsChunk(recipients);
		}
		nlapiSetFieldValue('custpage_recipientcount',recipients.length);
	}
	else {
		recipientRecordsChunk = null;
	}
	if (recipientRecordsChunk != null && recipientRecordsChunk.length > 0) {
		for(var x=0;x<recipientRecordsChunk.length;x++)
		{
			temp = txt;
			for(var i=0;i<mmfields.length;i++)
			{
				var fx = mmfields[i].key;
				fx = fx.replace(/ /g,'');
				fx = fx.replace('[','');
				fx = fx.replace(']','');
				fx = fx.toLowerCase();
				while (temp.indexOf(mmfields[i].key) >= 0) {
					temp = temp.replace(mmfields[i].key, recipientRecordsChunk[x][fx]);
				}
			}
			var tempcount = temp.length;
			if(tempcount > maxcount) {
				maxcount = tempcount;
			}
			length += maxcount;
		}
	}
	else {
		maxcount = txt.length;
	}
	return maxcount;
}

function getMergeFields(txt) {
	var arr = [];
	var txt1 = txt;
	
	if (!isBlankOrNull(txt)) {
		while (txt1.indexOf('[') >= 0) {
			txt1 = txt1.substring(txt1.indexOf('[') + 1);
			if (txt1.indexOf('[') != -1 && txt1.indexOf('[') < txt1.indexOf(']')) {
				continue;
			}
			else {
				if (txt1.indexOf(']') > 0) {
					arr.push('[' + txt1.substring(0, txt1.indexOf(']')) + ']')
					txt1 = txt1.substring(txt1.indexOf(']') + 1);
				}
			}
		}
	}
	
	return arr;
}

function getMergeFieldsByRecordType(mmfields, recordType) {
	var mmRecFields = [];
	var fld = '';
	
	try {
		recordType = recordType.toLowerCase();
		if (mmfields != null && mmfields.length > 0) {
			for (var x=0;x<mmfields.length;x++) {
				if (mmfields[x].indexOf(recordType) >= 0) {
					fld = mmfields[x];
					fld = fld.replace('[', '');
					fld = fld.replace(']', '');
					if (fld.indexOf('.') >= 0)
						fld = fld.substring(fld.indexOf('.') + 1);
					mmRecFields.push(fld);
				}
			}
		}
	}
	catch(exp) {
		logError('ERROR', 'getMergeFieldsByRecordType', exp);
	}
	
	return mmRecFields;
}

function getMailMergeFields() {
    var obj = null;
    var mergeFields = new Array();

    obj = new Object();
    obj.key = "[FIRSTNAME]";
    obj.value = "First Name";
    mergeFields[mergeFields.length] = obj;

    obj = new Object();
    obj.key = "[LASTNAME]";
    obj.value = "Last Name";
    mergeFields[mergeFields.length] = obj;

    obj = new Object();
    obj.key = "[COMPANYNAME]";
    obj.value = "Company Name";
    mergeFields[mergeFields.length] = obj;

    return mergeFields;
}

function setInlineCount(chr) {
	nlapiSetFieldValue('custpage_lblinlinecount','<span style="margin-left:50px;margin-right:190px;">' + 
						 (recipientRecordsChunk != null ? recipientRecordsChunk.length : 0) + ' Recipients Selected' +
							'</span><span>' + chr + '</span>');
}

function getMailMergedMessage(message, rec) {
	var mmfields = getMailMergeFields();
	var vl = null;
	if (!isBlankOrNull(message)) {
		for(var i=0;i<mmfields.length;i++)
		{
			var fx = mmfields[i].key;
			fx = fx.replace(/ /g,'');
			fx = fx.replace('[','');
			fx = fx.replace(']','');
			fx = fx.toLowerCase();
			while (message.indexOf(mmfields[i].key) >= 0) {
				vl = rec[fx];
				if (vl == null || typeof(vl) == 'undefined' || vl == '') {
					message = message.replace(mmfields[i].key, '');
				}
				else {
					message = message.replace(mmfields[i].key, rec[fx]);
				}
			}
		}
		message = fixLineBreak(message, false);
	}
	return message;
}

function getMergedMessage(message, rec, recordType) {
	var mmfields = getMergeFields(message);
	var vl = null;
	
	if (!isBlankOrNull(message)) {
		for(var i=0;i<mmfields.length;i++)
		{
			if (mmfields[i].indexOf(recordType) >= 0) {
				var fx = mmfields[i];
				fx = fx.replace('[','');
				fx = fx.replace(']','');
				if (fx.indexOf('.') >= 0)
					fx = fx.substring(fx.indexOf('.') + 1);
				while (message.indexOf(mmfields[i]) >= 0) {
					vl = rec[fx];
					if (vl == null || typeof(vl) == 'undefined' || vl == '') {
						message = message.replace(mmfields[i], '');
					}
					else {
						message = message.replace(mmfields[i], vl);
					}
				}
			}
			else {
				while (message.indexOf(mmfields[i]) >= 0) {
					message = message.replace(mmfields[i], '');
				}
			}
		}
		message = fixLineBreak(message, false);
	}
	return message;
}

function getMergedMessagePreview(message, rec) {
	var mmfields = getMergeFields(message);
	var recordType = rec.getRecordType();
	var pRec = null;
	var vl = null;

	recordType = recordType.toLowerCase();
	if (recordType == 'opportunity') {
	    pRec = nlapiLoadRecord('customer', rec.getFieldValue('entity'));
	}
	if (!isBlankOrNull(message)) {
		for(var i=0;i<mmfields.length;i++)
		{
			if (mmfields[i].indexOf(recordType) >= 0) {
				var fx = mmfields[i];
				fx = fx.replace('[','');
				fx = fx.replace(']','');
				if (fx.indexOf('.') >= 0)
					fx = fx.substring(fx.indexOf('.') + 1);
				while (message.indexOf(mmfields[i]) >= 0) {
				    if (recordType == 'opportunity') {
				        if (fx.indexOf('.') >= 0) {
				            vl = pRec.getFieldValue(fx.substring(fx.indexOf('.') + 1));
				            //vl = isBlankOrNull(vl) ? pRec.getFieldValue(fx.substring(fx.indexOf('.') + 1)) : vl;
				        }
				        else {
				            vl = rec.getFieldValue(fx);
				            //vl = isBlankOrNull(vl) ? rec.getFieldValue(fx) : vl;
				        }
				    }
				    else {
				        vl = rec.getFieldValue(fx);
				        //vl = isBlankOrNull(vl) ? rec.getFieldValue(fx) : vl;
				    }
					if (vl == null || typeof(vl) == 'undefined' || vl == '') {
						message = message.replace(mmfields[i], '');
					}
					else {
						message = message.replace(mmfields[i], vl);
					}
				}
			}
			else {
				while (message.indexOf(mmfields[i]) >= 0) {
					message = message.replace(mmfields[i], '');
				}
			}
		}
		message = fixLineBreak(message, false);
	}
	return message;
}

function getMailMergedMessagePreview(message, rec) {
	var mmfields = getMailMergeFields();
	var vl = null;
	if (!isBlankOrNull(message)) {
		for(var i=0;i<mmfields.length;i++)
		{
			var fx = mmfields[i].key;
			fx = fx.replace(/ /g,'');
			fx = fx.replace('[','');
			fx = fx.replace(']','');
			fx = fx.toLowerCase();
			while (message.indexOf(mmfields[i].key) >= 0) {
				vl = rec.getFieldValue(fx);
				if (vl == null || typeof(vl) == 'undefined' || vl == '') {
					message = message.replace(mmfields[i].key, '');
				}
				else {
					message = message.replace(mmfields[i].key, rec.getFieldValue(fx));
				}
			}
		}
		message = fixLineBreak(message, false);
	}
	return message;
}

function fixLineBreak(str, placeBR) {
	if (placeBR) {
		str = str.replace(/(\r\n|\n|\r)/gm, '_-_');
	}
	else {
		while (str.indexOf('_-_') >= 0) {
			str = str.replace('_-_','\n');
		}
	}
	return str;
}

function replaceBR(str) {
	if (!isBlankOrNull(str)) {
		while (str.indexOf('&lt;BR&gt;') >= 0) { str = str.replace('&lt;BR&gt;','\n'); }
		while (str.indexOf('&lt;br&gt;') >= 0) { str = str.replace('&lt;br&gt;','\n'); }
		while (str.indexOf('&lt;BR/&gt;') >= 0) { str = str.replace('&lt;BR/&gt;','\n'); }
		while (str.indexOf('&lt;br/&gt;') >= 0) { str = str.replace('&lt;br/&gt;','\n'); }
		while (str.indexOf('<BR>') >= 0) { str = str.replace('<BR>','\n'); }
		while (str.indexOf('<br>') >= 0) { str = str.replace('<br>','\n'); }
		while (str.indexOf('<BR/>') >= 0) { str = str.replace('<BR/>','\n'); }
		while (str.indexOf('<br/>') >= 0) { str = str.replace('<br/>','\n'); }
	}
	return str;
}

function getPhonePrefix(nsId, recordType, ph) {
	var dprefix = '';
	var dprefix1 = '';
	var countryCode = '';
	var mmRecFields = [];
	var mmRecFieldsNonOp = [];

	if (recordType == 'opportunity') {
	    mmRecFields = mmRecFields.concat(['st__firstname', 'st__lastname', 'st__entityid', 'st__mobilephone', 'st__phone', 'st__homephone', 'st__altphone', 'st__billcountry', 'st__shipcountry', 'st__country']);
	    recs = getEntityRecords([nsId], mmRecFields, recordType);
	}
	else {
	    mmRecFieldsNonOp = mmRecFields.concat(['altname', 'firstname', 'lastname', 'entityid', 'mobilephone', 'phone', 'homephone', 'altphone', 'billcountry', 'shipcountry', 'country']);
	    try {
	        recs = getEntityRecords([nsId], mmRecFieldsNonOp, recordType);
	    }
	    catch (exp) {
	        mmRecFieldsNonOp = mmRecFields.concat(['firstname', 'lastname', 'entityid', 'mobilephone', 'phone', 'homephone', 'altphone', 'billcountry', 'shipcountry', 'country']);
	        recs = getEntityRecords([nsId], mmRecFieldsNonOp, recordType);
	    }
	}
    if (recs && recs.length > 0) {
		countryCode = getCountryObjSyntax(recs[0]);
		if (countryCode == null) {
			countryCode = nlapiGetContext().getSetting('SCRIPT','custscript_sms_defaultdialingcountry');
			countryCode = getCountryCodeByNsId(countryCode);
		}
		if (countryCode != null) {
			dprefix = getInternationalDialingPrefix(countryCode);
			if (dprefix.length > 1) {
				dprefix1 = dprefix.substring(1);
			}
			else {
				dprefix1 = '';
			}
			if (ph == null) {
				phone = getMobileNumberObjSyntax(recs[0]);
			}
			else {
				phone = ph;
			}
			if (phone != null) {
				phone = fixPhoneNumber(phone);
				if (phone.indexOf(dprefix) == 0 || phone.indexOf('+') == 0) {
					dprefix = '';
				}
				else if (dprefix1.length > 0 && phone.indexOf(dprefix1) == 0) {
					dprefix = '+';
				}
			}
		}
	}
	return dprefix;
}

//Deprecated
function getPreviewButtonScript(isPopup) {
	var html = 	"	var message = '';				" +
				"	var header = '';				" +
				"	var footer = '';				" +
				"	if (" + isPopup + ") {			" +
				"		message = nlapiGetFieldValue('custpage_sms_txtmessagetab');	" +
				"		header = nlapiGetFieldValue('custpage_sms_txtheader'); 		" +
				"		footer = nlapiGetFieldValue('custpage_sms_txtfooter');		" +
				"		message = setLineBreak(message);							" +
				"		header = setLineBreak(header);								" +
				"		footer = setLineBreak(footer);								" +
				"	}																" +
				"	nlapiSetFieldValue('custpage_smspr_message', (header + message + footer)); " +
				"	ShowmainMachine('custpage_smspr_tab');							" +
				"	setWindowChanged(window, false);								" +
				"";
	return html;
}

function storeMessage(customerNsId,subject,message,empNsId) {
	var msg = nlapiCreateRecord('message');
	msg.setFieldValue('author',nlapiGetUser());
	msg.setFieldValue('entity',customerNsId);
	msg.setFieldValue('recipient',customerNsId);
	msg.setFieldValue('message',message);
	msg.setFieldValue('messageType','SMS');
	msg.setFieldValue('subject',subject);
	nlapiSubmitRecord(msg, true);
	
	var rec = getEntityRecord(customerNsId);
	if (rec != null) {
		try { nlapiSubmitField(rec.getRecordType(), rec.getId(), 'custentity_mm_lastsmssentby',nlapiGetUser()); } catch(e) { }
		try { nlapiSubmitField(rec.getRecordType(), rec.getId(), 'custentity_mm_lastsmsmessage',message); } catch(e) { }
	}
}

function addZeroes(vle,requiredLength)
{
    vle=vle.toString();
    var i=vle.length;
    
    while(i<requiredLength)
        {
            
            vle='0'+vle;
            i++;
        }
        
        return vle;
}


function extractCategoryName(categoryChain)
{
    
    var collonIndx;
    collonIndx=categoryChain.lastIndexOf(':');
    
    if (collonIndx==-1)
        return categoryChain;
    else
        {
        return categoryChain.substring(collonIndx+2,categoryChain.length);
        
        }
}


function getNetsuiteDate(magentoDate)
{
    var netsuiteDate;
    netsuiteDate= magentoDate.substring(8,10) + '/' + magentoDate.substring(5,7) +  '/' +magentoDate.substring(0,4) ;
    return netsuiteDate;
    
}



function logEntry(jobId,state,description)
{
     var rec=nlapiCreateRecord('customrecord_magentoconnectorlog');
     rec.setFieldValue('custrecord_jobid',jobId);
     rec.setFieldValue('custrecord_state',state);
     rec.setFieldValue('custrecord_description',description);
     nlapiSubmitRecord(rec);
        
}


function fillTimeInSuitlet(obj) {
	
        
	obj.addSelectOption('','');
		obj.addSelectOption('12:00 am','12:00 am');	obj.addSelectOption('1:00 am','1:00 am'); obj.addSelectOption('2:00 am','2:00 am');
		obj.addSelectOption('3:00 am','3:00 am'); obj.addSelectOption('4:00 am','4:00 am'); obj.addSelectOption('5:00 am','5:00 am');
		obj.addSelectOption('6:00 am','6:00 am'); obj.addSelectOption('7:00 am','7:00 am'); obj.addSelectOption('8:00 am','8:00 am');
		obj.addSelectOption('9:00 am','9:00 am'); obj.addSelectOption('10:00 am','10:00 am'); obj.addSelectOption('11:00 am','11:00 am');
		obj.addSelectOption('12:00 pm','12:00 pm'); obj.addSelectOption('1:00 pm','1:00 pm'); obj.addSelectOption('2:00 pm','2:00 pm');
		obj.addSelectOption('3:00 pm','3:00 pm'); obj.addSelectOption('4:00 pm','4:00 pm'); obj.addSelectOption('5:00 pm','5:00 pm');
		obj.addSelectOption('6:00 pm','6:00 pm'); obj.addSelectOption('7:00 pm','7:00 pm'); obj.addSelectOption('8:00 pm','8:00 pm');
		obj.addSelectOption('9:00 pm','9:00 pm'); obj.addSelectOption('10:00 pm','10:00 pm'); obj.addSelectOption('11:00 pm','11:00 pm');
	
	
}


function fillFrequencyInSuitlet(obj) {
	
	
                obj.addSelectOption('','');
	
                obj.addSelectOption('1_d','Daily Once');
                obj.addSelectOption('1_w','Weekly Once');
                obj.addSelectOption('1_ww','Fortnightly');
                obj.addSelectOption('1_mm','Monthly');
                //obj.addSelectOption('15_m','15 Minutes');	
                //obj.addSelectOption('30_m','30 Minutes');	
                //obj.addSelectOption('45_m','45 Minutes');	
                obj.addSelectOption('1_h','1 Hour');	
                obj.addSelectOption('2_h','2 Hour');	
                obj.addSelectOption('3_h','3 Hour');	
                obj.addSelectOption('4_h','4 Hour');	
                obj.addSelectOption('5_h','5 Hour');	
                obj.addSelectOption('6_h','6 Hour');	
                obj.addSelectOption('7_h','7 Hour');	
                obj.addSelectOption('8_h','8 Hour');	
                obj.addSelectOption('9_h','9 Hour');	
                obj.addSelectOption('10_h','10 Hour');	
                obj.addSelectOption('11_h','11 Hour');	
	
}


function getUpdateDate(days)
{
    var currentDate = new Date();
    var soUpdateDate;
    
    soUpdateDate=nlapiAddDays(currentDate,days);
    
    //soUpdateDate=addZeroes(soUpdateDate.getDate(),2) + '-' + addZeroes((soUpdateDate.getMonth()+1),2) + '-' +  soUpdateDate.getFullYear() + ' ' + soUpdateDate.getHours()  + ':'+ soUpdateDate.getMinutes() + ':' + '00';
    
    soUpdateDate=soUpdateDate.getFullYear()  + '-' + addZeroes((soUpdateDate.getMonth()+1),2) + '-' + addZeroes(soUpdateDate.getDate(),2)  + ' ' + addZeroes(soUpdateDate.getHours(),2)  + ':'+ addZeroes(soUpdateDate.getMinutes(),2) + ':' + '00';
    
    return soUpdateDate
}

function getBlankForNull(data)
{
    var returnValue;
    
    if (isBlankOrNull(data)) returnValue=''; else returnValue=data;
    
    return returnValue;   
    
}


function allnumeric(argValue)  
{   
    var numbers = /^[0-9]+$/;  
    if(argValue.match(numbers))  
    {  
        return true;  
    }  
    else  
    {  
        return false;  
    }  
}