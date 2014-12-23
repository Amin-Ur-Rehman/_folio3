/**
 * Created with JetBrains WebStorm.
 * User: szaman
 * Date: 12/4/13
 * Time: 10:48 AM
 * To change this template use File | Settings | File Templates.
 */
function getJobMasterList()
{
    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();

    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));
    filters.push(new nlobjSearchFilter(MAGENTO_ConnectorJobRecord.FieldName.OPERATION_TYPE, null, 'is', 'Scheduled'));
    filters.push(new nlobjSearchFilter(MAGENTO_ConnectorJobRecord.FieldName.CURRENT_STATUS, null, 'is', 'Ready'));
    filters.push(new nlobjSearchFilter(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_DATE, null, 'on', 'today'));


    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_START_DATE));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_START_TIME));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_END_TIME));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.TIME_ZONE));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.FREQUENCY));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_DATE));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_TIME));
    cols.push(new nlobjSearchColumn(MAGENTO_ConnectorJobRecord.FieldName.OPERATION));


    var recs = nlapiSearchRecord(MAGENTO_ConnectorJobRecord.InternalId,null,filters,cols);


    if (recs && recs.length > 0) {
        for (var x=0;x<recs.length;x++) {

            obj = new Object();
            obj.internalId = recs[x].getId();
            obj.startdate = recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_START_DATE);
            obj.starttime = recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_START_TIME);
            obj.endtime = recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.SCHEDULE_END_TIME);
            obj.timezone = recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.TIME_ZONE);
            obj.frequency = recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.FREQUENCY);
            obj.nextscheduledate= recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_DATE);
            obj.nextscheduletime= recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_TIME);
            obj.operation= recs[x].getValue(MAGENTO_ConnectorJobRecord.FieldName.OPERATION);
            arr[arr.length] = obj;


        }
    }

    return arr;
}


function getMagentoMaxCustomerIdNetsuite(enviornment)
{
    var cols=new Array();
    var maxValue;
    var result=new Object();

    var magentoCustomerIdId;

    if(enviornment == 'production'){
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
    }else{
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
    }

    try {

        result.errorMsg='';

        cols.push(new nlobjSearchColumn(magentoCustomerIdId,null,'max'));



        var recs = nlapiSearchRecord('customer',null,null,cols);

        if (recs && recs.length > 0){
            maxValue=recs[0].getValue(magentoCustomerIdId,null,'max');
        }
        else
            maxValue=0;

        if (maxValue==null || maxValue=='')
            maxValue=0;

        result.data=maxValue;

    }catch(ex)
    {
        result.errorMsg=ex.toString();
    }


    return result;
}

function getMagentoCustomersNetsuite(enviornment)
{
    var cols=new Array();
    var filters=new Array();
    var obj = null;
    var arr = new Array();

    var magentoCustomerIdId;

    if(enviornment == 'production'){
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
    }else{
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
    }

    filters.push(new nlobjSearchFilter(magentoCustomerIdId, null, 'isnotempty'));             // Active Records Only
    cols.push(new nlobjSearchColumn(magentoCustomerIdId));

    var recs = nlapiSearchRecord('customer',null,filters,cols);

    if (recs && recs.length > 0) {
        for (var x=0;x<recs.length;x++) {

            obj = new Object();
            obj.internalId = recs[x].getId();
            obj.magentoId = recs[x].getValue(magentoCustomerIdId);
            arr[arr.length] = obj;
        }
    }

    return arr;

}


function getCategoryNonMatrix(enviornment)
{
    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();
    var result=new Object();

    var magentoIdId;
    var magentoSyncId;
    var magentoCategoryHierarchyId;

    if(enviornment == 'production'){

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_PRO;

    }else{

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_DEV;

    }

    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));             // Active Records Only
    filters.push(new nlobjSearchFilter('matrix', 'parent', 'is', 'F'));                 // Non Matrix Item
    filters.push(new nlobjSearchFilter('parent', null, 'noneof','@NONE@'));         // Parent is not Null
    filters.push(new nlobjSearchFilter(magentoSyncId, 'parent', 'is', 'F'));   // Ready for Magento Sync

    cols.push(new nlobjSearchColumn('parent',null,'group'));                        // Distinct the Parent
    cols.push(new nlobjSearchColumn('name','parent','group'));
    cols.push(new nlobjSearchColumn(magentoIdId,'parent','group'));
    cols.push(new nlobjSearchColumn(magentoCategoryHierarchyId,'parent','group'));


    result.errorMsg='';

    try
    {
        var recs = nlapiSearchRecord('inventoryitem',null,filters,cols);
        if (recs && recs.length > 0) {
            for (var x=0;x<recs.length;x++) {

                obj = new Object();
                obj.internalId = recs[x].getValue('parent',null,'group');
                obj.name = recs[x].getValue('name','parent','group');
                obj.magentoID=recs[x].getValue(magentoIdId,'parent','group');
                obj.magentoCatHierarchy=recs[x].getValue(magentoCategoryHierarchyId,'parent','group');

                arr[arr.length] = obj;

            }

            result.data=arr;
        }
    }catch (ex)
    {

        result.errorMsg=ex.toString();

    }


    return result;

}



function getItemsNonMatrix(enviornment)
{
    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();
    var result=new Object();

    var magentoIdId;
    var magentoSyncId;
    var magentoEntityId;
    var magentoCategoryHierarchyId;

    if(enviornment == 'production'){

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_PRO;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_PRO;

    }else{

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_DEV;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_DEV;

    }

    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));             // Active Records Only
    filters.push(new nlobjSearchFilter(magentoSyncId, null, 'is', 'F'));   // Ready for Magento Sync
    filters.push(new nlobjSearchFilter(magentoEntityId, null, 'isnot', 'Category'));                 //Only Items
    filters.push(new nlobjSearchFilter('matrix', null, 'is', 'F'));                 // Non Matrix Item
    filters.push(new nlobjSearchFilter('matrixchild', null, 'is', 'F'));                 // Not a Matrix Item Child
    filters.push(new nlobjSearchFilter(MAGENTO_COMMON_Item.FieldName.MAGENTO_ITEM, null, 'is', 'T'));                 // available for magento sync


    cols.push(new nlobjSearchColumn(magentoIdId,'parent'));
    cols.push(new nlobjSearchColumn(magentoCategoryHierarchyId,'parent'));
    cols.push(new nlobjSearchColumn(magentoIdId));
    cols.push(new nlobjSearchColumn('name'));
    cols.push(new nlobjSearchColumn('displayname'));
    cols.push(new nlobjSearchColumn('description'));
    cols.push(new nlobjSearchColumn('price'));



    result.errorMsg='';

    try
    {
        var recs = nlapiSearchRecord('inventoryitem',null,filters,cols);
        if (recs && recs.length > 0) {
            for (var x=0;x<recs.length;x++) {

                obj = new Object();
                obj.internalId = recs[x].getId();
                obj.name = recs[x].getValue('name');
                obj.magentoType='simple';
                obj.description=recs[x].getValue('description');
                obj.displayname=recs[x].getValue('displayname');
                obj.magentoCategoryId=recs[x].getValue(magentoIdId,'parent');
                obj.magentoSet='4';
                obj.price=recs[x].getValue('price');
                obj.categoryHierarchy=recs[x].getValue(magentoCategoryHierarchyId,'parent');
                obj.magentoId=recs[x].getValue(magentoIdId);

                arr[arr.length] = obj;
            }

            result.data=arr;
        }

    }catch(ex)
    {

        result.errorMsg=ex.toString();

    }

    return result;
}

function getSynchedCategoriesNonMatrix(enviornment)
{

    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();
    var result=new Object();

    var magentoIdId;
    var magentoSyncId;

    if(enviornment == 'production'){
        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
    }else{
        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
    }


    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));             // Active Records Only
    filters.push(new nlobjSearchFilter(magentoSyncId, 'parent', 'is', 'T'));   // Synched
    filters.push(new nlobjSearchFilter('matrix', null, 'is', 'F'));                 // Non Matrix Item
    filters.push(new nlobjSearchFilter('parent', null, 'noneof','@NONE@'));         // Parent is not Null


    cols.push(new nlobjSearchColumn('parent',null,'group'));                          // Distinct the Parent
    cols.push(new nlobjSearchColumn('name','parent','group'));                          // Distinct the Parent
    cols.push(new nlobjSearchColumn(magentoIdId,'parent','group'));                          // Distinct the Parent


    var recs;

    result.errorMsg='';

    try{

        recs= nlapiSearchRecord('inventoryitem',null,filters,cols);

        if (recs && recs.length > 0) {
            for (var x=0;x<recs.length;x++) {

                obj = new Object();
                obj.internalId = recs[x].getValue('parent',null,'group');
                obj.name = recs[x].getValue('name','parent','group');
                obj.magentoID = recs[x].getValue(magentoIdId,'parent','group');
                arr[arr.length] = obj;

            }

            result.data=arr;
        }




    }catch (ex){

        result.errorMsg=ex.toString();
    }

    return result;

}



function getSynchedItemsNonMatrix(enviornment)
{
    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();

    var result=new Object();

    var magentoIdId;
    var magentoSyncId;
    var magentoEntityId;

    if(enviornment == 'production'){

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_PRO;

    }else{

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_DEV;

    }


    result.errorMsg='';

    try{

        filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));             // Active Records Only
        filters.push(new nlobjSearchFilter(magentoSyncId, null, 'is', 'T'));   // Ready for Magento Sync
        filters.push(new nlobjSearchFilter('matrix', null, 'is', 'F'));                 // Non Matrix Item
        filters.push(new nlobjSearchFilter('matrixchild', null, 'is', 'F'));                 // Not a Matrix Item Child
        filters.push(new nlobjSearchFilter(magentoEntityId, null, 'isnot', 'Category'));                 //Only Items
        filters.push(new nlobjSearchFilter(MAGENTO_COMMON_Item.FieldName.MAGENTO_ITEM, null, 'is', 'T'));                 // available for magento sync

        cols.push(new nlobjSearchColumn(magentoIdId));


        var recs = nlapiSearchRecord('inventoryitem',null,filters,cols);

        if (recs && recs.length > 0) {
            for (var x=0;x<recs.length;x++) {

                obj = new Object();
                obj.internalId = recs[x].getId();
                obj.magentoID=recs[x].getValue(magentoIdId);
                arr[arr.length] = obj;
            }

            result.data=arr;


        }

    }catch(ex) {
        result.errorMsg=ex.toString();
    }

    return result;
//return arr;
}



function updateCategoryMagentoID(internalId,magentoID,sync,magentoEntity,magentoCategoryHierarchy,enviornment)
{
    var magentoIdId;
    var magentoSyncId;
    var magentoEntityId;
    var magentoCategoryHierarchyId;

    if(enviornment == 'production'){

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_PRO;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_PRO;

    }else{

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_DEV;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_DEV;

    }

    var rec=nlapiLoadRecord('inventoryitem',internalId);

    rec.setFieldValue(magentoIdId,magentoID);
    rec.setFieldValue(magentoSyncId,sync);
    rec.setFieldValue(magentoEntityId,magentoEntity);
    rec.setFieldValue(magentoCategoryHierarchyId,magentoCategoryHierarchy);

    try
    {

        nlapiSubmitRecord(rec);
        return true;

    }catch (ex){
        return false;
    }
}





function unSyncItemRecord(id,enviornment)
{
    var rec;
    var result=new Object();
    result.errorMsg='';

    var magentoIdId;
    var magentoSyncId;
    var magentoEntityId;
    var magentoCategoryHierarchyId;

    if(enviornment == 'production'){

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_PRO;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_PRO;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_PRO;

    }else{

        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Item.FieldName.MAGENTO_SYNC_DEV;
        magentoEntityId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ENTITY_DEV;
        magentoCategoryHierarchyId = MAGENTO_COMMON_Item.FieldName.MAGENTO_HIERARCHY_DEV;

    }

    try
    {
        rec=nlapiLoadRecord('inventoryitem',id);
        rec.setFieldValue(magentoIdId,'');
        rec.setFieldValue(magentoSyncId,'F');
        rec.setFieldValue(magentoEntityId,'');
        rec.setFieldValue(magentoCategoryHierarchyId,'');


        nlapiSubmitRecord(rec);

    }catch (ex){
        result.errorMsg=ex.toString();
    }
    return result;
}

function generateErrorEmail(message,configuration,type){
    nlapiLogExecution('EMERGENCY', 'Error', 'Email Sent');
    var author = 4;
    var recipient = '';
    recipient = 'zahmed@folio3.com'; // TODO: will change for production account
    var subject = '';

    if(type == 'item')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Item';
    else
    if(type == 'customer')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Customer';
    else
    if(type == 'order')
        subject = '[Magento-NetSuite Connector] An error has occurred in manipulating Order';


    var body = message;

    if(recipient==''){
        nlapiLogExecution('DEBUG','Emails can not send. Recipient is Empty.');
        return;
    }

    try{
        //nlapiSendEmail(author, recipient, subject, body);
    }catch(ex){
        nlapiLogExecution('ERROR','Error in generating email./n' + ex.toString());
    }

}

function getRecipientEmails(sendTo){
    var emailIds = '';
    var searchResultEmployees;
    var emailId;

    if(sendTo){
        searchResultEmployees = nlapiSearchRecord('employee', null, new nlobjSearchFilter('internalId',null,'is',sendTo), new nlobjSearchColumn('email'));
        if(searchResultEmployees != null){
            for(var i=0;i<searchResultEmployees.length;i++){
                emailId = searchResultEmployees[i].getValue('email');
                if(emailId){
                    if(emailIds!=''){
                        emailIds += ',';
                    }
                    emailIds += emailId;
                }
            }
        }
    }
    return emailIds;
}

function getNetsuiteCustomerIdByMagentoId(magentoID,enviornment)
{
    var filters=new Array();
    var cols=new Array();

    var magentoCustomerIdId;

    if(enviornment == 'production'){
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
    }else{
        magentoCustomerIdId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
    }

    try
    {
        filters.push(new nlobjSearchFilter(magentoCustomerIdId, null, 'is', magentoID));

        var recs = nlapiSearchRecord('customer',null,filters,null);

        if (recs!=null && recs.length>0)
        {
            return recs[0].getId();

        }
        else
        {
            return 0;
        }
    }catch (ex) {
        nlapiLogExecution('Debug','Error in getNetsuiteCustomerIdByMagentoId');
        return 0;
    }
}

function getNetsuiteProductIdByMagentoId(magentoID)////// not used
{
    var filters=new Array();
    var cols=new Array();

    nlapiLogExecution('Debug','magentoID in getNetsuiteProductIdByMagentoId',magentoID);

    try
    {
        filters.push(new nlobjSearchFilter(MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO, null, 'is', magentoID));
        var recs = nlapiSearchRecord('inventoryitem',null,filters,null);

        if (recs!=null && recs.length>0)
        {
            return recs[0].getId();

        }
        else
        {
            return 0;
        }
    }catch (ex) {
        nlapiLogExecution('Debug','Error in getNetsuiteProductIdByMagentoId');
        return 0;
    }
}


function getNetsuiteProductIdsByMagentoIds(magentoIds,enviornment)
{
    var cols=new Array();

    var filterExpression = "";

    var resultArray=new Array();

    var obj=new Object();

    var result=new Object();

    var magentoIdId;

    if(enviornment == 'production'){
        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_PRO;
    }else{
        magentoIdId = MAGENTO_COMMON_Item.FieldName.MAGENTO_ID_DEV;
    }

    result.errorMsg='';

    try

    {



        filterExpression="[";



        for (var x=0;x<magentoIds.length;x++)

        {

            filterExpression=filterExpression + "['" + magentoIdId + "','is','" + magentoIds[x].product_id + "']";



            if((x+1)<magentoIds.length)

            {

                filterExpression=filterExpression + ",'or' ,";

            }

        }



        filterExpression=filterExpression+']';



        nlapiLogExecution('Debug',' filterExpression',filterExpression);



        filterExpression=eval(filterExpression);



        cols.push(new nlobjSearchColumn(magentoIdId));
        cols.push(new nlobjSearchColumn('isserialitem'));



        var recs = nlapiSearchRecord('inventoryitem',null,filterExpression,cols);



        if (recs && recs.length > 0) {

            for (var i=0;i<recs.length;i++) {

                obj = new Object();

                obj.internalId = recs[i].getId();

                obj.magentoID=recs[i].getValue(magentoIdId);

                obj.isSerialItem=recs[i].getValue('isserialitem');

                resultArray[resultArray.length] = obj;

            }

        }



        result.data=resultArray;
        nlapiLogExecution('Debug',JSON.stringify(result.data));







    }catch (ex) {

        nlapiLogExecution('Debug','Error in getNetsuiteProductIdByMagentoId',ex.toString());

        result.errorMsg=ex.toString();

    }



    return result;
}


function getNetsuiteProductIdByMagentoIdViaMap(netsuiteMagentoProductMap,magentoID)
{

    var netsuiteId='';
    var isSerial='';
    var retObj = new Object();
    for (var x=0;x<netsuiteMagentoProductMap.length;x++) {

        if (netsuiteMagentoProductMap[x].magentoID==magentoID)
        {
            netsuiteId=netsuiteMagentoProductMap[x].internalId;
            isSerial = netsuiteMagentoProductMap[x].isSerialItem;
            retObj.netsuiteId = netsuiteId;
            retObj.isSerial = isSerial;
            break;
        }

    }
    retObj.netsuiteId = netsuiteId;
    retObj.isSerial = isSerial;
    return retObj;

}



function setMasterJobStatus(id,status)
{
    var rec;
    try
    {
        rec=nlapiLoadRecord(MAGENTO_ConnectorJobRecord.InternalId,id);
        rec.setFieldValue(MAGENTO_ConnectorJobRecord.FieldName.CURRENT_STATUS,status);
        nlapiSubmitRecord(rec);

        return true;


    }catch (ex){

        nlapiLogExecution('Debug','setMasterJobStatus-Error',ex.toString());
        return false;
    }


}


function setDetailJobStatus(id,status)
{
    var rec;
    try
    {
        nlapiLogExecution('Debug','record id',id);

        rec=nlapiLoadRecord(MAGENTO_ConnectorJobDatailRecord.InternalId,id);
        rec.setFieldValue(MAGENTO_ConnectorJobDatailRecord.FieldName.STATUS,status);
        nlapiSubmitRecord(rec);

        return true;

    }catch (ex){

        nlapiLogExecution('Debug','setDetailJobStatus-Error',ex.toString());
        return false;
    }
}

function getMasterJobStatus(id)
{
    var rec;
    var status
    try
    {
        nlapiLogExecution('Debug','record id',id);

        rec=nlapiLoadRecord(MAGENTO_ConnectorJobRecord.InternalId,id);

        status=rec.getFieldValue(MAGENTO_ConnectorJobDatailRecord.FieldName.STATUS);

        return status;


    }catch (ex){

        nlapiLogExecution('Debug','getMasterJobStatus-Error',ex.toString());
        return '';
    }


}


function updateJobMaster(record)
{
    var rec=nlapiLoadRecord(MAGENTO_ConnectorJobRecord.InternalId,record.internalId);

    nlapiLogExecution('Debug','Beginning of updateJobMaster');

    //nlapiLogExecution ('Debug','record.schDate',record.nextscheduledate);
    //nlapiLogExecution ('Debug','calculateNextScheduleDate(record.schDate,record.frequency)',calculateNextScheduleDate(record.nextscheduledate,record.frequency));

    rec.setFieldValue(MAGENTO_ConnectorJobRecord.FieldName.LAST_SCHEDULED_ON,record.lastscheduledate);
    rec.setFieldValue(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_DATE,record.nextscheduleDate);
    rec.setFieldValue(MAGENTO_ConnectorJobRecord.FieldName.NEXT_SCHEDULE_TIME,record.nextscheduleTime);
    rec.setFieldValue(MAGENTO_ConnectorJobDatailRecord.FieldName.STATUS,record.status);

    nlapiLogExecution('Debug','All value set of record');

    try
    {
        nlapiSubmitRecord(rec);
        nlapiLogExecution('Debug','Job Master Record Updated Successfully');
        return true;

    }catch (ex)
    {

        //Write Code to Log Error
        return false;
    }
}

function getFulfillments(enviornment){
    var filters=new Array();
    var cols=new Array();
    var obj = null;
    var arr = new Array();
    var result=new Object();
    var magentoIdId;
    var magentoSyncId;
    var magentoFuflillmentIdId;
    var magentoFuflillmentSyncId;

    if(enviornment == 'production'){
        magentoIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_SO_ID_PRO;
        magentoSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_SO_SYNC_PRO;
        magentoFuflillmentIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_ID_PRO;
        magentoFuflillmentSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_SYNC_PRO;
    }else{
        magentoIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_SO_ID_DEV;
        magentoSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_SO_SYNC_DEV;
        magentoFuflillmentIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_ID_DEV;
        magentoFuflillmentSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_SYNC_DEV;
    }

    filters.push(new nlobjSearchFilter(magentoSyncId, 'appliedtotransaction', 'is', 'T'));   // Ready for Magento Sync
    filters.push(new nlobjSearchFilter(magentoIdId,'appliedtotransaction','isnotempty'));
    filters.push(new nlobjSearchFilter(magentoFuflillmentSyncId, null, 'is', 'F'));
    filters.push(new nlobjSearchFilter(magentoFuflillmentIdId, null, 'isempty'));
    filters.push(new nlobjSearchFilter('mainline', null, 'is', 'T'));

    cols.push(new nlobjSearchColumn(magentoIdId,'appliedtotransaction'));

    result.errorMsg='';

    try
    {
        var recs = nlapiSearchRecord('itemfulfillment',null,filters,cols);
        if (recs && recs.length > 0) {
            for (var x=0;x<recs.length;x++) {

                /*var itemFulFillmentRec = nlapiLoadRecord('itemfulfillment',recs[x].getId());
                 var itemsLength=itemFulFillmentRec.getLineItemCount('item');
                 var itemsArr=new Array();

                 for(var line=1;line<=itemsLength;line++){
                 var tempItem={};
                 tempItem['itemId']=itemFulFillmentRec.getLineItemValue('item','item',line);
                 tempItem['itemQty']=itemFulFillmentRec.getLineItemValue('item','quantity',line);
                 itemsArr.push(tempItem);
                 }
                 */

                obj=new Object();
                obj.internalId=recs[x].getId();
                obj.magentoSOId=recs[x].getValue(magentoIdId,'appliedtotransaction');
                obj.magentoId=recs[x].getValue(magentoIdId)?recs[x].getValue(magentoIdId):'';

                arr[arr.length] = obj;
            }

            result.data=arr;
        }

    }catch(ex)
    {

        result.errorMsg=ex.toString();

    }

    return result;
}

function updateFulfillmentsMagentoID(internalId,magentoID,sync,enviornment){
    nlapiLogExecution('DEBUG', 'Enter in updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);

    var magentoFulfillmentIdId;
    var magentoFulfillmentSyncId;

    if(enviornment == 'production'){
        magentoFulfillmentIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_ID_PRO;
        magentoFulfillmentSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_SYNC_PRO;
    }else{
        magentoFulfillmentIdId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_ID_DEV;
        magentoFulfillmentSyncId = MAGENTO_COMMON_Transaction.FieldName.MAGENTO_FF_SYNC_DEV;
    }

    var rec=nlapiLoadRecord('itemfulfillment',internalId);

    rec.setFieldValue(magentoFulfillmentIdId,magentoID);
    rec.setFieldValue(magentoFulfillmentSyncId,sync);

    try
    {
        nlapiSubmitRecord(rec);
        nlapiLogExecution('DEBUG', 'Exit from updateFulfillmentsMagentoID() funciton', 'internalId: ' + internalId + ', magentoID:' + magentoID + ', sync:' + sync);
        return true;

    }catch (ex){
        return false;
    }
}


function updateCustomerInNetSuite(customerId, magentoCustomerObj, enviornment,sessionID){
    var magentoCustomerId;
    var magentoSync;
    var result=new Object();

    if(enviornment == 'production'){
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_PRO;
    }else{
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_DEV;
    }

    var rec = nlapiLoadRecord('customer', customerId);

    var entityId=magentoCustomerObj.firstname+' ' +magentoCustomerObj.middlename  + magentoCustomerObj.lastname;

    //rec.setFieldValue('entityid',entityId); zee
    rec.setFieldValue(magentoCustomerId,magentoCustomerObj.customer_id);
    rec.setFieldValue(magentoSync,'T');
    rec.setFieldValue('email',magentoCustomerObj.email);
    rec.setFieldValue('firstname',magentoCustomerObj.firstname);
    rec.setFieldValue('middlename',magentoCustomerObj.middlename);
    rec.setFieldValue('lastname',magentoCustomerObj.lastname);
  //  rec.setFieldValue('salutation','');

    // zee: get customer address list: start

    var custAddrXML;
    var responseMagento;
    var addresses = new Object();

    custAddrXML=getCustomerAddressXML(magentoCustomerObj.customer_id,sessionID);

    saveXML(custAddrXML);

    responseMagento=validateCustomerAddressResponse(soapRequestToMagento(custAddrXML));

    if (responseMagento.status==false)
    {
        result.errorMsg=responseMagento.faultCode + '--' + responseMagento.faultString;
        nlapiLogExecution('ERROR', 'Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' +  result.errorMsg);
        return result;
    }

    addresses=responseMagento.addresses;

    if(addresses!=null)
    {
        rec = setAddresses(rec,addresses);
    }

    // zee: get customer address list: end


    var id = nlapiSubmitRecord(rec);

    nlapiLogExecution('DEBUG', 'Customer updated in NetSuite', 'Customer Id: ' + id);
}

function updateLeadInNetSuite(leadId, magentoCustomerObj, enviornment){//no
    var magentoCustomerId;
    var magentoSync;
    var result=new Object();

    if(enviornment == 'production'){
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_PRO;
    }else{
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_DEV;
    }

    result.errorMsg='';

    var rec = nlapiLoadRecord('lead', leadId);

    var entityId=magentoCustomerObj.firstname+' ' +magentoCustomerObj.middlename  + magentoCustomerObj.lastname;

    //rec.setFieldValue('entityid',entityId);zee
    rec.setFieldValue(magentoCustomerId,magentoCustomerObj.customer_id);
    rec.setFieldValue(magentoSync,'T');
    rec.setFieldValue('email',magentoCustomerObj.email);
    rec.setFieldValue('firstname',magentoCustomerObj.firstname);
    rec.setFieldValue('middlename',magentoCustomerObj.middlename);
    rec.setFieldValue('lastname',magentoCustomerObj.lastname);
   // rec.setFieldValue('salutation','');

    try
    {
        result = nlapiSubmitRecord(rec);
    }catch (ex){
        result.errorMsg=ex.toString();
    }

    return result;

//nlapiLogExecution('DEBUG', 'Lead updated in NetSuite', 'Lead Id: ' + id);
}

function createLeadInNetSuite(magentoCustomerObj, enviornment, sessionID){

    var magentoCustomerId;
    var magentoSync;
    var result=new Object();

    if(enviornment == 'production'){
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_PRO;
    }else{
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
        magentoSync = MAGENTO_COMMON_Entity.FieldName.MAGENTO_SYNC_DEV;
    }

    result.errorMsg='';
    result.infoMsg='';

    var rec=nlapiCreateRecord('lead');
    rec.setFieldValue('isperson', 'T');

    // zee: get customer address list: start

    var custAddrXML;
    var responseMagento;
    var addresses = new Object();

    custAddrXML=getCustomerAddressXML(magentoCustomerObj.customer_id,sessionID);

    saveXML(custAddrXML);

    responseMagento=validateCustomerAddressResponse(soapRequestToMagento(custAddrXML));

    if (responseMagento.status==false)
    {
        result.errorMsg=responseMagento.faultCode + '--' + responseMagento.faultString;
        nlapiLogExecution('ERROR', 'Importing Customer', 'Customer having Magento Id: ' + magentoCustomerObj.customer_id + ' has not imported. -- ' +  result.errorMsg);
        return result;
    }

    addresses=responseMagento.addresses;

    if(addresses!=null)
    {
        rec = setAddresses(rec,addresses);
    }

    // zee: get customer address list: end
    //var;/// TO DO:
    var entityId=magentoCustomerObj.firstname+' ' +magentoCustomerObj.middlename  + magentoCustomerObj.lastname;

    rec.setFieldValue('isperson','T');
    rec.setFieldValue('autoname','T');

    //rec.setFieldValue('entityid',entityId);zee
    rec.setFieldValue(magentoCustomerId,magentoCustomerObj.customer_id);
    rec.setFieldValue(magentoSync,'T');
    rec.setFieldValue('email',magentoCustomerObj.email);
    rec.setFieldValue('firstname',magentoCustomerObj.firstname);
    rec.setFieldValue('middlename',magentoCustomerObj.middlename);
    rec.setFieldValue('lastname',magentoCustomerObj.lastname);
  //  rec.setFieldValue('salutation','');

    try
    {
        result.id = nlapiSubmitRecord(rec);

    }catch (ex){
        result.errorMsg=ex.toString();
    }

    return result;


}


function existingCustomers(data1,data2,chkOption,existingMagentoId,enviornment)
{
    var entityName;
    var magentoCustomerId;

    if(enviornment == 'production'){
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_PRO;
    }else{
        magentoCustomerId = MAGENTO_COMMON_Entity.FieldName.MAGENTO_ID_DEV;
    }



    if (chkOption=='Magento')
    {
        for(var x=0;x<data1.length;x++)
        {
            nlapiLogExecution('Debug',' data1[x].getValue('+magentoCustomerId+')', data1[x].getValue(magentoCustomerId) );

            if (data1[x].getValue(magentoCustomerId)==data2.customer_id)
            {
                return data1[x].getId();
            }
        }

        return '';
    }
    else if (chkOption=='Entity')
    {
        for(var x=0;x<data1.length;x++)
        {
            nlapiLogExecution('Debug','existingMagentoId',existingMagentoId);
            nlapiLogExecution('Debug','data1[x].getValue(entityid)',data1[x].getValue('entityid'));
            nlapiLogExecution('Debug','data1[x].getValue(entityid)',data1[x].getId());
            nlapiLogExecution('Debug','data2.firstname+data2.middlename+data2.lastname',data2.firstname+' ' +data2.middlename + data2.lastname);

            /*
             if ( (data1[x].getValue('entityid')==data2.firstname+' ' +data2.middlename + ' ' + data2.lastname))
             {
             if (existingMagentoId!='' )
             {
             nlapiLogExecution('Debug','block-1');
             if (existingMagentoId!=data1[x].getId()) return data1[x].getId();
             }
             }else
             {
             nlapiLogExecution('Debug','block-2');
             return data1[x].getId();
             }
             */
            entityName=data2.firstname+' ' +data2.middlename + data2.lastname;
            if ( existingMagentoId!='' )
            {
                if ( (data1[x].getValue('entityid').toUpperCase()==entityName.toUpperCase()) && (existingMagentoId!=data1[x].getId()))
                {
                    return data1[x].getId();
                }
            }
            else
            {
                if ( (data1[x].getValue('entityid').toUpperCase()==entityName.toUpperCase()))
                {
                    return data1[x].getId();
                }
            }

        }

        return '';
    }else{
        return '';
    }
    /* else if (chkOption=='Email')
     {

     for(var x=0;x<data1.length;x++)
     {
     if ( (data1[x].getValue('email')==data2.email))
     {
     if (existingMagentoId!='' )
     {
     if (existingMagentoId!=data1[x].getId()) return data1[x].getId();
     }
     }else
     {
     return data1.getId();
     }
     }


     return '';

     }*/

}


function attemptToCreateLead(existingMagento,customer,enviornment,sessionID)
{

    var soXML;
    var responseOrdersOfCustomer;
    var orders;
    var result=new Object();
    var resultLead;
    soXML = getSalesOrderListByCustomerXML(customer.customer_id,sessionID);

    saveXML(soXML);

    result.infoMsg='';
    result.errorMsg='';

    nlapiLogExecution('Debug','Inside Operation Function-- Before Data Request to Magento');

    responseOrdersOfCustomer=validateResponse(soapRequestToMagento(soXML),'order');
    nlapiLogExecution('Debug','Inside Operation Function-- After Data Request to Magento');

    if (responseOrdersOfCustomer.status==false)
    {
        nlapiLogExecution('Debug',responseOrdersOfCustomer.faultCode + '--' + responseOrdersOfCustomer.faultString);
        result.errorMsg='SO Checking SOAP Request Failed';
    }
    else
    {

        orders=responseOrdersOfCustomer.orders;

        if(orders!=null && orders.length>0){
            // log error and continue
            nlapiLogExecution('DEBUG', 'Skip create customer due to having sales order in magento');
            result.infoMsg='SO Records Exist for This Customer';

        }else{


            resultLead=createLeadInNetSuite(customer, enviornment,sessionID);
            result.id=resultLead.id;

        }

    }

    return result;
}


function getDummyItemId(){
    var result = new Object();
    result.dummyItemId = '';
    result.errorMsg = '';

    try{
        var itemSearchResult = nlapiSearchRecord('item',null,new nlobjSearchFilter('itemid', null,'is','unmatched_magento_item'),null);
        if(itemSearchResult!=null){
            result.dummyItemId = itemSearchResult[0].getId();
        }else{
            var dummyItemResult = createDummyItemInNS();
            if(dummyItemResult.errorMsg!=''){
                result.errorMsg = dummyItemResult.errorMsg;
            }else{
                result.dummyItemId = dummyItemResult.dummyItemId;
            }
        }
    }catch(ex){
        result.errorMsg = ex.message;
    }

    return result;
}

function createDummyItemInNS(){
    var result = new Object();
    result.dummyItemId = '';
    result.errorMsg = '';

    var dummyItemRec = nlapiCreateRecord('inventoryitem');
    dummyItemRec.setFieldValue('itemid','unmatched_magento_item');
    dummyItemRec.setLineItemValue('price','price_1_',1,0);
    try{
        result.dummyItemId = nlapiSubmitRecord(dummyItemRec);
    }catch(ex){
        result.errorMsg = 'Error in creating Dummy Item -- ' + ex.message;
    }
    return result;
}

function getSystemConfiguration(){
    var config = {};
    var result = {};
    var configRec;

    result.errorMsg = '';

    try{
        configRec = nlapiLoadConfiguration('accountingpreferences');
    }catch(ex){
        nlapiLogExecution('ERROR','Reading System Configuration', ex.message);
        result.errorMsg = 'Reading System Configuration -- ' + ex.message;
        return result;
    }

    config.unshippedinvoices = configRec.getFieldValue('unshippedinvoices');

    result.systemConfiguration = config;
    return result;
}

function createInvoice(id){
    var result = {};
    var rec;

    result.errorMsg = '';

    try{
        rec = nlapiTransformRecord('salesorder', id, 'invoice');
        result.invoiceId = nlapiSubmitRecord(rec);
    }catch(ex){
        nlapiLogExecution('ERROR','Creating Invoice', ex.message);
        result.errorMsg = 'Creating Invoice -- ' + ex.message;
        return result;
    }
    return result;
}

function createCustomerPayment(id){
    var result = {};
    var rec;

    result.errorMsg = '';

    try{
        rec = nlapiTransformRecord('invoice', id, 'customerpayment');
        result.customerPaymentId = nlapiSubmitRecord(rec);

    }catch(ex){
        nlapiLogExecution('ERROR','Creating Customer Payment', ex.message);
        result.errorMsg = 'Creating Customer Payment -- ' + ex.message;
        return result;
    }
    return result;
}

function setAddresses(rec,addresses){
    nlapiLogExecution('DEBUG', 'in setAddresses() start',addresses.toSource());

    removeAllLineItems(rec, 'addressbook');

    for(var i in addresses){
        if(addresses[i].is_default_billing == true && addresses[i].is_default_shipping == true){
            rec = setAddress(rec,addresses[i],'T','T');
            break;
        }
        else if(addresses[i].is_default_billing == true){
            rec = setAddress(rec,addresses[i],'F','T');
        }else if(addresses[i].is_default_shipping == true){
            rec = setAddress(rec,addresses[i],'T','F');
        }
    }
    nlapiLogExecution('DEBUG', 'in setAddresses() end');
    return rec;
}

function setAddress(rec,address,isShipAddr,isBillAddr){
    nlapiLogExecution('DEBUG', 'in setAddress() start',address.toSource());
    var addr = '';

    if(isShipAddr == isBillAddr){
        addr = 'Address';
    }else if(isShipAddr == 'T'){
        addr = 'Shipping Address';
    }
    else if(isBillAddr== 'T'){
        addr = 'Billing Address';
    }

    var stAddr = address.street;

    var stAddr1;
    var stAddr2;

    var subStr;
    var index;
    if(stAddr.length>150){
        subStr = stAddr.substring(0, 150);
        index = subStr.lastIndexOf(' ');

        stAddr1 = stAddr.substring(0, index);
        stAddr2 = stAddr.substring(index+1);
    }else{
        stAddr1 = stAddr;
        stAddr2 = '';
    }

    rec.setFieldValue('phone',address.telephone);
    rec.selectNewLineItem('addressbook');

    rec.setCurrentLineItemValue('addressbook', 'label', addr);
    rec.setCurrentLineItemValue('addressbook', 'defaultshipping', isShipAddr);
    rec.setCurrentLineItemValue('addressbook', 'defaultbilling', isBillAddr);
    rec.setCurrentLineItemValue('addressbook', 'addr1', stAddr1);
    rec.setCurrentLineItemValue('addressbook', 'addr2', stAddr2);
    rec.setCurrentLineItemValue('addressbook', 'addressee', address.firstname + ' ' + address.lastname);
    rec.setCurrentLineItemValue('addressbook', 'phone', address.telephone);
    rec.setCurrentLineItemValue('addressbook', 'country', address.country_id);
    rec.setCurrentLineItemValue('addressbook', 'zip', address.postcode);
    try{
        rec.setCurrentLineItemValue('addressbook', 'state', address.region);
    }catch(ex){
        nlapiLogExecution('ERROR', 'State is a select Field');
        rec.setCurrentLineItemText('addressbook', 'state', address.region);
    }

    rec.setCurrentLineItemValue('addressbook', 'city', address.city);

    rec.commitLineItem('addressbook');

    nlapiLogExecution('DEBUG', 'in setAddress() start');
    return rec;
}

function setAddressV2(rec,address,isShipAddr,isBillAddr){
    var addr = '';

    if(isShipAddr == isBillAddr){
        addr = 'Address';
    }else if(isShipAddr == 'T'){
        rec.setFieldValue('shipaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone  + '\n Street : ' + address.street  + '\n Country : ' + address.country + '\n Zip : ' + address.zip  + '\n State : ' + address.state + '\n City : ' + address.city );
    }
    else if(isBillAddr== 'T'){
        rec.setFieldValue('billaddress', address.firstname + ' ' + address.lastname + '\n Phone : ' + address.phone  + '\n Street : ' + address.street  + '\n Country : ' + address.country + '\n Zip : ' + address.zip  + '\n State : ' + address.state + '\n City : ' + address.city );
    }

    var stAddr = address.street;

    var stAddr1;
    var stAddr2;

    var subStr;
    var index;
    if(stAddr.length>150){
        subStr = stAddr.substring(0, 150);
        index = subStr.lastIndexOf(' ');

        stAddr1 = stAddr.substring(0, index);
        stAddr2 = stAddr.substring(index+1);
    }else{
        stAddr1 = stAddr;
        stAddr2 = '';
    }





    return rec;

    /*address.company=nlapiSelectValue(addresses[i],'company');

     address.region=nlapiSelectValue(addresses[i],'region');
     address.region_id=nlapiSelectValue(addresses[i],'region_id');
     address.street=nlapiSelectValue(addresses[i],'street');*/
}

function getCustomerAddressXML(customerID,sessionID){
    var custAddrListXML;

    custAddrListXML=XML_HEADER;

    custAddrListXML=custAddrListXML+'<urn:customerAddressList>';
    custAddrListXML=custAddrListXML+ '<sessionId urn:type="xsd:string">'+sessionID+'</sessionId>';
    custAddrListXML=custAddrListXML+ '<customerId urn:type="xsd:int">'+customerID+'</customerId>';
    custAddrListXML=custAddrListXML+'</urn:customerAddressList>';

    custAddrListXML=custAddrListXML+XML_FOOTER;

    return custAddrListXML;
}

function validateCustomerAddressResponse(xml){
    saveXML(nlapiXMLToString(xml));

    var responseMagento=new Object();

    var customerAddresses  =  nlapiSelectNodes(xml, "//result/item");
    var faultCode= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultcode");
    var faultString= nlapiSelectValue(xml,"SOAP-ENV:Envelope/SOAP-ENV:Body/SOAP-ENV:Fault/faultstring");

    if (faultCode!=null){
        responseMagento.status=false;       // Means There is fault
        responseMagento.faultCode=faultCode;   // Fault Code
        responseMagento.faultString=faultString; //Fault String

    }
    else if (customerAddresses!=null)
    {
        responseMagento.status=true;
        responseMagento.addresses=transformCustAddrListXMLtoArray(customerAddresses);
    }
    else    // Not Attribute ID Found, Nor fault code found
    {
        responseMagento.status=false;
        responseMagento.faultCode='000';
        responseMagento.faultString='Unexpected Error';


    }

    return responseMagento;
}

function transformCustAddrListXMLtoArray(addresses){
    var result=new Array();
    var address;

    for(var i=0;i<addresses.length;i++)
    {
        address=new Object();

        address.customer_address_id=nlapiSelectValue(addresses[i],'customer_address_id');
        address.created_at=nlapiSelectValue(addresses[i],'created_at');
        address.updated_at=nlapiSelectValue(addresses[i],'updated_at');
        address.city=nlapiSelectValue(addresses[i],'city');
        address.company=nlapiSelectValue(addresses[i],'company');
        address.country_id=nlapiSelectValue(addresses[i],'country_id');
        address.firstname=nlapiSelectValue(addresses[i],'firstname');
        address.lastname=nlapiSelectValue(addresses[i],'lastname');
        address.postcode=nlapiSelectValue(addresses[i],'postcode');
        address.region=nlapiSelectValue(addresses[i],'region');
        address.region_id=nlapiSelectValue(addresses[i],'region_id');
        address.street=nlapiSelectValue(addresses[i],'street');
        address.telephone=nlapiSelectValue(addresses[i],'telephone');
        address.is_default_billing=eval(nlapiSelectValue(addresses[i],'is_default_billing'));
        address.is_default_shipping=eval(nlapiSelectValue(addresses[i],'is_default_shipping'));

        result[result.length]=address;
    }

    return result;
}

function removeAllLineItems(rec,sublist){
    if(rec){
        var totalLines = rec.getLineItemCount(sublist);
        for(var line=totalLines;line>=1;line--){
            rec.removeLineItem(sublist,line);
        }
    }
}