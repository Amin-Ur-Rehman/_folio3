var ScheduledScriptConstant = {
    Minutes: 15,
    RemainingUsage: 1000,
    StartTime: (new Date()).getTime()
};




function startup()
{
    var arrFils=[];
    var arrCols=[];
    var magentoIdFieldValue;
    var magentoInfoJSon;
    var storeId='1';

    //var CUSTOMER_STATUSES=ConnectorConstants.CustomerTypesToExport;

    arrFils.push(new nlobjSearchFilter('entitystatus', null, 'anyof',['13']));

    arrFils.push(new nlobjSearchFilter('custentity_magentosync_dev', null, 'is', 'T'));

    arrFils.push(new nlobjSearchFilter('custentity_magentopw', null, 'is','empty'));

    arrCols.push(new nlobjSearchColumn('custentity_magento_custid'));


    var recs = nlapiSearchRecord('customer', null, arrFils, arrCols);

    if (recs != null && recs.length > 0) {

        for (var i = 0; i < recs.length; i++) {

            magentoIdFieldValue = recs[i].getValue('custentity_magento_custid');


            if(!!magentoIdFieldValue)
            {
                magentoInfoJSon=JSON.parse(magentoIdFieldValue);

                if (!!magentoInfoJSon && magentoInfoJSon.length > 0)
                {
                    for (var i = 0; i < magentoInfoJSon.length; i++)
                    {
                        if(magentoInfoJSon[i].StoreId === storeId)
                        {
                                nlapiSubmitField('customer',recs[i].getId(),'custentity_magentopw',magentoInfoJSon[i].Password);
                        }
                    }
                }

            }

            if (rescheduleIfRequired(null)) {
                return;
            }

        }

    }

}



// check if the script is required to be scheduled
function rescheduleIfRequired(params) {
    var context = nlapiGetContext();
    var endTime;
    var minutes;

    endTime = (new Date()).getTime();
    minutes = Math.round(((endTime - ScheduledScriptConstant.StartTime) / (1000 * 60)) * 100) / 100;

    if (context.getRemainingUsage() < ScheduledScriptConstant.RemainingUsage) {
        //nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    if (minutes > ScheduledScriptConstant.Minutes) {
        //nlapiScheduleScript(context.getScriptId(), context.getDeploymentId(), params);
        return true;
    }

    return false;
}