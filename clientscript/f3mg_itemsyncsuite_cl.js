/**

 */
var ItemSyncClient = (function() {
    return {
        addProcessingDiv: function() {
            var addDiv = "<div id='overlay' style='position: fixed;top: 0;left: 0;width: 100%;" + "height: 100%;background-color: #000;filter: alpha(opacity=80);-moz-opacity: 0.8;-khtml-opacity: 0.8;opacity: .8;z-index: 10000;" + " display: none;'>" + "<div class='theText' style='color: #FFFFFF; font-size:20px; font-weight:700;" + " margin-top:15%; margin-left: 40%;'> <br><br>Please Wait. Item Sync is In Process...<br><br></div>" + "</div>";
            jQuery('body').append(addDiv);
            jQuery('#overlay').fadeIn();
            var url = nlapiResolveURL('SUITELET', 'customscript_instant_sync_item', 'customdeploy_instant_sync_item');
            var result;
            var postData = {};
            postData.itemId = nlapiGetFieldValue('itemid');
            jQuery.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(postData),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                timeout: 45000
            }).done(function(d) {
                successFunction(d);
            }).fail(function(jqXHR, textStatus) {
                jQuery('#overlay').fadeOut();
                if (textStatus === 'timeout') {
                    alert('Request timeout');
                } else {
                    alert(textStatus);
                    result = JSON.parse(jqXHR.responseText);
                }
            });
        },
        successFunction: function() {
            jQuery('#overlay').hide();
            alert(result.msg);
            window.close();
        }
    };
})();

function addProcessingDiv() {
    return ItemSyncClient.addProcessingDiv();
}

function successFunction(result) {
    return ItemSyncClient.successFunction();
}