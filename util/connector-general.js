function isRecordExist(recordType,filters)
{
    
    try
    {
        var existingRecord=nlapiSearchRecord(recordType,null,filters,null);
        if (existingRecord!=null) return true; else false;
    
    }catch (e)
    {
        return e;
    }
            
}

function isRecordExistThenGetId(recordType,filters)
{
    
    try
    {
        var existingRecord=nlapiSearchRecord(recordType,null,filters,null);
        if (existingRecord!=null) return existingRecord[0].getId(); else return null;
    
    }catch (e)
    {
        return null;
    }
            
}


function getFirstRecord(recordType,filters,columns)
{
    
    try
    {
        var existingRecord=nlapiSearchRecord(recordType,null,filters,columns);
        
        if (existingRecord!=null) return existingRecord; else return null;
    
    }catch (e)
    {
        return null;
    }
            
}


function getRecords(recordType,filters,columns)
{
    
    try
    {
        var existingRecords=nlapiSearchRecord(recordType,null,filters,columns);
        
        if (existingRecords!=null) return existingRecords; else return null;
    
    }catch (e)
    {
        return null;
    }
            
}


function getMagentoConfiguration()
{
    var cols=new Array();
    var configuration=new Object();
    
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.FREQUENCY));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.ROOT_CATEGORY_ID));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.MAGENTO_ENVIORNMENT));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_URL_DEV));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_ID_DEV));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_PW_DEV));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.STORE_ID_DEV));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEBSITE_DEV));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.ORDER_STATUS_FILTER));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_URL_PRO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_ID_PRO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_PW_PRO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.STORE_ID_PRO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.WEBSITE_PRO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.RECORDS_TO_BE_CREATED));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.ACTION_IF_ITEM_NOT_EXIST));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.NOTIFICATION_EMAIL_SEND_TO));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.NOTIFICATION_EMAIL_SEND_FROM));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.SOAP_HEADER));
    cols.push(new nlobjSearchColumn(MAGENTO_ConfiguratonRecord.FieldName.SOAP_FOOTER));
        
    try
    {
        var existingRecord=nlapiSearchRecord(MAGENTO_ConfiguratonRecord.InternalId,null,null,cols);
        
        if (existingRecord!=null) 
        {
            configuration.enviornment = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.MAGENTO_ENVIORNMENT);
            configuration.sofrequency = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.FREQUENCY);
            configuration.rootcategoryid = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.ROOT_CATEGORY_ID);
            configuration.orderstatusfilter = existingRecord[0].getText(MAGENTO_ConfiguratonRecord.FieldName.ORDER_STATUS_FILTER).split(',');
            configuration.recordstobecreated = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.RECORDS_TO_BE_CREATED);
            configuration.actionifitemnotexist = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.ACTION_IF_ITEM_NOT_EXIST);
            configuration.emailsendto = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.NOTIFICATION_EMAIL_SEND_TO).split(',');// multi-select field
            configuration.emailsendfrom = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.NOTIFICATION_EMAIL_SEND_FROM);
            configuration.soapheader = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.SOAP_HEADER);
            configuration.soapfooter = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.SOAP_FOOTER);
                
            if(configuration.enviornment == 'production'){
                configuration.webserviceurl = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_URL_PRO);
                configuration.webserviceid = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_ID_PRO);
                configuration.webservicepw = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_PW_PRO);
                configuration.storeid = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.STORE_ID_PRO);
                configuration.website = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEBSITE_PRO);
            }else{
                configuration.webserviceurl = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_URL_DEV);
                configuration.webserviceid = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_ID_DEV);
                configuration.webservicepw = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEB_SERVICE_PW_DEV);
                configuration.storeid = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.STORE_ID_DEV);
                configuration.website = existingRecord[0].getValue(MAGENTO_ConfiguratonRecord.FieldName.WEBSITE_DEV);
            }
            return configuration;
        }
        else 
            return null;
    
    }catch (e)
    {
        return null;
    }
            
}



