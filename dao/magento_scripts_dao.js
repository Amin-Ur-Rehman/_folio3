MAGENTO_SCRIPTS = (function () {
    return {
        CLIENT:{
            MAGENTO_CONFIG_CLIENT: {
                SCRIPT_ID: 'customscript_magentoconfig_cl'
            },
            CATEGORY_INTERFACE_CLIENT:{
                SCRIPT_ID: 'customscript_categoryinterface_cl'
            },
            CUSTOMER_INTERFACE_CLIENT:{
                SCRIPT_ID: 'customscript_customerinterface_cl'
            },
            ITEM_INTERFACE_CLIENT:{
                SCRIPT_ID: 'customscript_iteminterface_cl'
            },
            SALES_ORDER_INTERFACE_CLIENT:{
                SCRIPT_ID: 'customscript_sointerface_cl'
            },
            UNSYNC_INTERFACE_CLIENT:{
                SCRIPT_ID: 'customscript_unsyncinterfaceclient'
            }
            
        },
        SUITELET:{
            MAGENTO_CATEGORY_INTERFACE: {
                SCRIPT_ID: 'customscript_magentocategoryinterface',
                DEPLOYMENT_ID: 'customdeploy_magentocategoryinterface'
            },
            MAGENTO_CUSTOMER_INTERFACE: {
                SCRIPT_ID: 'customscript_magentocustomerinterface',
                DEPLOYMENT_ID: 'customdeploy_magentocustomerinterface'
            },
            MAGENTO_FULFILLMENT_INTERFACE: {
                SCRIPT_ID: 'customscript_magentofulfillmentinterface',
                DEPLOYMENT_ID: 'customdeploy_magentofulfillmentinterface'
            },
            MAGENTO_ITEM_INTERFACE: {
                SCRIPT_ID: 'customscript_magentoiteminterface',
                DEPLOYMENT_ID: 'customdeploy_magentoiteminterface'
            },
            MAGENTO_SALES_ORDER_INTERFACE: {
                SCRIPT_ID: 'customscript_magentosointerface',
                DEPLOYMENT_ID: 'customdeploy_magentosointerface'
            },
            MAGENTO_UNSYNC_INTERFACE: {
                SCRIPT_ID: 'customscript_magentounsyncinterface',
                DEPLOYMENT_ID: 'customdeploy_magentounsyncinterface'
            }
        },
        SCHEDULED:{
            CONNECTOR_CATEGORY_EXPORT_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectorcategoryexport',
                DEPLOYMENT_ID: 'customdeploy_connectorcategoryexport',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_category',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_category',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_category',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_category',
                    JOB_TYPE: 'custscript_jobtype_category'
                }
            },
            CONNECTOR_ITEM_EXPORT_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectoritemexport',
                DEPLOYMENT_ID: 'customdeploy_connectoritemexport',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_itemexport',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_itemexport',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_itemexport',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_itemexport',
                    JOB_TYPE: 'custscript_jobtype_itemexport'
                }
            },
            CONNECTOR_CUSTOMER_IMPORT_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectorcustomerimport',
                DEPLOYMENT_ID: 'customdeploy_connectorcustomerimport',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_customer',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_customer',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_customer',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_customer',
                    JOB_TYPE: 'custscript_jobtype_customer'
                }
            },
            CONNECTOR_ORDER_IMPORT_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectororderimport',
                DEPLOYMENT_ID: 'customdeploy_connectororderimport',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_soimport',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_soimport',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_soimport',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_soimport',
                    JOB_TYPE: 'custscript_jobtype_soimport'
                }
            },
            CONNECTOR_CATEGORY_UNSYNC_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectorcategoryunsync',
                DEPLOYMENT_ID: 'customdeploy_connectorcategoryunsync',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_category_unsync',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_catunsync',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_catunsync',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_catunsync',
                    JOB_TYPE: 'custscript_jobtype_category_unsync',
                    JOB_DESCRIPTION: 'custscript_jobdesc_category_unsync'
                }
            },
            CONNECTOR_FULFILLMENT_EXPORT_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectorfulfillmentexport',
                DEPLOYMENT_ID: 'customdeploy_connectorfulfillmentexport',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_ffexport',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_ffexport',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_ffexport',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_ffexport',
                    JOB_TYPE: 'custscript_jobtype_ffexport'
                }
            },
            CONNECTOR_ITEM_UNSYNC_SCHEDULER:{
                SCRIPT_ID: 'customscript_connectoritemunsync',
                DEPLOYMENT_ID: 'customdeploy_connectoritemunsync',
                PARAMETERS: {
                    JOB_ID: 'custscript_jobid_item_unsync',
                    NEXT_SCHEDULE_DATE: 'custscript_nextscheduledate_itemunsync',
                    NEXT_SCHEDULED_TIME: 'custscript_nextscheduletime_itemunsync',
                    LAST_SCHEDULED_DATE: 'custscript_lastscheduledate_itemunsync',
                    JOB_TYPE: 'custscript_jobtype_item_unsync',
                    JOB_DESCRIPTION: 'custscript_jobdesc_item_unsync'
                }
            }
        }
    }
})();