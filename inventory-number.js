/*
This file is deployed on Lot Number Record in order to disable fields on the record.
 */
function beforeLoad(type, form, request) {
    nlapiLogExecution('DEBUG', 'beforeLoad', '');

    var script = '<script> NS.jQuery(function(){  \n' +
                'nlapiDisableField("expirationdate", "true");' +                     // EXPIRATION DATE
                'nlapiDisableField("custitemnumberlot_extraction_date", "true");' +  // EXTRACTION DATE
                'nlapiDisableField("custitemnumberlot_vendor_no", "true");' +        // VENDOR LOT NUMBER
                'nlapiDisableField("custitemnumberlot_extact_meth", "true");' +        // EXTRACTION METHOD
                'nlapiDisableField("custitemnumberlot_cult_meth", "true");' +          // CULTIVATION METHOD
                'nlapiDisableField("custitemnumberlot_country", "true");  })' +        // COUNTRY OF ORIGIN
               ' </script>';
    nlapiLogExecution('DEBUG', 'beforeLoad' , 'After Disable Field Set');

    form.addField('custpage_inlinescript', 'inlinehtml', 'Html').setDefaultValue(script);
}


