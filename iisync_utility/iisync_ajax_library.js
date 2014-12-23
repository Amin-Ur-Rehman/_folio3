// ----- global variable for the proxies to webservices. -----

/// <summary>The root object for the proxies to webservices.</summary>
var proxies = {};

proxies.current = null; // the current active webservice call.
proxies.xmlhttp = null; // The current active xmlhttp object.

// ----- global variable for the ajax engine. -----

/// <summary>The root object for the ajax engine.</summary>
var ajax = {};

ajax.current = null; /// The current active AJAX action.
ajax.option = null; /// The options for the current active AJAX action.

ajax.queue = []; /// The pending AJAX actions.
ajax.options = []; /// The options for the pending AJAX actions.

ajax.timer = null; /// The timer for delayed actions.

// ----- AJAX engine and actions implementation -----

///<summary>Start an AJAX action by entering it into the queue</summary>
ajax.Start = function (action, options) {
    ajax.Add(action, options);
    // check if the action should start
    if ((ajax.current === null) && (ajax.timer === null)) {
        ajax._next(false);
    }
}; // ajax.Start

///<summary>Start an AJAX action by entering it into the queue</summary>
ajax.Add = function (action, options) {
    if (action == null) {
        alert("ajax.Start: Argument action must be set.");
        return;

    } else if ((action.queueClear != null) && (action.queueClear == true)) {
        ajax.queue = [];
        ajax.options = [];

    } else if ((ajax.queue.length > 0) && ((action.queueMultiple == null) || (action.queueMultiple == false))) {
        // remove existing action entries from the queue and clear a running timer
        if ((ajax.timer != null) && (ajax.queue[0] == action)) {
            //window.clearTimeout(ajax.timer);
            ajax.timer = null;
        } // if

        var n = 0;
        while (n < ajax.queue.length) {
            if (ajax.queue[n] == action) {
                ajax.queue.splice(n, 1);
                ajax.options.splice(n, 1);
            } else {
                n++;
            } // if
        } // while
    } // if

    if ((action.queueTop == null) || (action.queueTop == false)) {
        // to the end.
        ajax.queue.push(action);
        ajax.options.push(options);

    } else {
        // to the top
        ajax.queue.unshift(action);
        ajax.options.unshift(options);
    } // if
}; // ajax.Add

///<summary>Check, if the next AJAX action can start.
///This is an internal method that should not be called from external.</summary>
///<remarks>for private use only.<remarks>
ajax._next = function (forceStart) {
    var ca = null // current action
    var co = null // current opptions
    var data = null;

    if (ajax.current != null) {
        return;
    } // a call is active: wait more time

    if (ajax.timer != null) {
        return;
    } // a call is pendig: wait more time

    if (ajax.queue.length == 0) {
        return;
    } // nothing to do.

    ca = ajax.queue[0];
    co = ajax.options[0];
    if ((forceStart == true) || (ca.delay == null) || (ca.delay == 0)) {
        // start top action
        ajax.current = ca;
        ajax.queue.shift();
        ajax.option = co;
        ajax.options.shift();

        // get the data
        if (ca.prepare != null) {
            try {
                data = ca.prepare(co);
            } catch (ex) {
            }
        }

        if (ca.call == null) {
            // no call
            ajax.Finsh(data);
        } else {
            // start the call
            ca.call.func = ajax.Finsh;
            ca.call.onException = ajax.Exception;
            ca.call(data);
            // start timeout timer
            if (ca.timeout != null) {
                ajax.timer = null; //window.setTimeout(ajax.Cancel, ca.timeout * 1000);
            }
        } // if

    }
}; // ajax._next

///<summary>The delay time of an action is over.</summary>
ajax.EndWait = function () {
    ajax.timer = null;
    ajax._next(true);
}; // ajax.EndWait

///<summary>The current action timed out.</summary>
ajax.Cancel = function () {
    proxies.cancel(false); // cancel the current webservice call.
    ajax.timer = null;
    ajax.current = null;
    ajax.option = null;
    //window.setTimeout(ajax._next, 200); // give some to time to cancel the http connection.

    ajax._next(true);

}; // ajax.Cancel

///<summary>Finish an AJAX Action the normal way</summary>
ajax.Finsh = function (data) {
    // clear timeout timer if set
    if (ajax.timer != null) {
        //window.clearTimeout(ajax.timer);
        ajax.timer = null;
    } // if

    // use the data
    try {
        if ((ajax.current != null) && (ajax.current.finish != null)) {
            ajax.current.finish(data, ajax.option);
        }
    } catch (ex) {
    }
    // reset the running action
    ajax.current = null;
    ajax.option = null;
    ajax._next(false)
} // ajax.Finsh

///<summary>Finish an AJAX Action with an exception</summary>
ajax.Exception = function (ex) {
    // use the data
    if (ajax.current.onException != null) {
        ajax.current.onException(ex, ajax.option);
    }

    // reset the running action
    ajax.current = null;
    ajax.option = null;
} // ajax.Exception

///<summary>Clear the current and all pending AJAX actions.</summary>
ajax.CancelAll = function () {
    ajax.Cancel();
    // clear all pending AJAX actions in the queue.
    ajax.queue = [];
    ajax.options = [];
}; // ajax.CancelAll

// ----- webservice proxy implementation -----

///<summary>Execute a soap call.
///Build the xml for the call of a soap method of a webservice
///and post it to the server.</summary>
proxies.callSoap = function (args) {
    var p = args.callee;
    var x = null;

    proxies.current = p;
    proxies.xmlhttp = x;

    // envelope start
    var soap = "<?xml version='1.0' encoding='utf-8'?>"
      + "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/'>"
      + "<soap:Body>"
      + "<" + p.fname + " xmlns='" + p.service.ns + "'>";

    // parameters
    for (var n = 0; (n < p.params.length) && (n < args.length); n++) {
        var val = args[n];
        var typ = p.params[n].split(':');

        if ((typ.length == 1) || (typ[1] == "string")) {
            val = String(args[n]).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

        } else if (typ[1] == "int") {
            val = parseInt(args[n]);
        } else if (typ[1] == "float") {
            val = parseFloat(args[n]);

        } else if ((typ[1] == "x") && (typeof(args[n]) == "string")) {
            val = args[n];

        } else if ((typ[1] == "x") && (typeof(XMLSerializer) != "undefined")) {
            val = (new XMLSerializer()).serializeToString(args[n].firstChild);

        } else if (typ[1] == "x") {
            val = args[n].xml;

        } else if ((typ[1] == "bool") && (typeof(args[n]) == "string")) {
            val = args[n].toLowerCase();

        } else if (typ[1] == "bool") {
            val = String(args[n]).toLowerCase();

        } else if (typ[1] == "date") {
            // calculate the xml format for datetime objects from a javascript date object
            var s, ret;
            ret = String(val.getFullYear());
            ret += "-";
            s = String(val.getMonth() + 1);
            ret += (s.length == 1 ? "0" + s : s);
            ret += "-";
            s = String(val.getDate() + 1);
            ret += (s.length == 1 ? "0" + s : s);
            ret += "T";
            s = String(val.getHours() + 1);
            ret += (s.length == 1 ? "0" + s : s);
            ret += ":";
            s = String(val.getMinutes() + 1);
            ret += (s.length == 1 ? "0" + s : s);
            ret += ":";
            s = String(val.getSeconds() + 1);
            ret += (s.length == 1 ? "0" + s : s);
            val = ret;
        } // if
        soap += "<" + typ[0] + ">" + val + "</" + typ[0] + ">"
    } // for

    // envelope end
    soap += "</" + p.fname + ">" + "</soap:Body>" + "</soap:Envelope>";

    var header = {};
    header["SOAPAction"] = p.action;
    header["Content-Type"] = "text/xml; charset=utf-8";

    var response = nlapiRequestURL(p.service.url, soap, header);

    return response.getBody();

}; // proxies.callSoap

// cancel the running webservice call.
// raise: set raise to false to prevent raising an exception
proxies.cancel = function (raise) {
    var cc = proxies.current;
    var cx = proxies.xmlhttp;

    if (raise == null) {
        raise == true;
    }

    if (proxies.xmlhttp != null) {
        proxies.xmlhttp.onreadystatechange = function () {
        };
        proxies.xmlhttp.abort();
        if (raise && (proxies.current.onException != null)) {
            proxies.current.onException("WebService call was canceled.");
        }
        proxies.current = null;
        proxies.xmlhttp = null;
    } // if
}; // proxies.cancel

// px is a proxies.service.func object !
proxies.EnableCache = function (px) {
    // attach an empty _cache object.
    px._cache = {};
}; // proxies.EnableCache

// check, if a call is currently waiting for a result
proxies.IsActive = function () {
    return(proxies.xmlhttp != null);
}; // proxies.IsActive

proxies._processResponse = function (response) {
    var ret = null;

    var body = response.getBody();

    return body;
};

///<summary>Callback method to show the result of a soap call in an alert box.</summary>
///<remarks>To set up a debug output in an alert box use:
///proxies.service.method.corefunc = proxies.alertResult;</remarks>
proxies.alertResult = function () {
    var x = proxies.xmlhttp;

    if (x.readyState == 4) {
        if (x.status == 200) {
            if (x.responseXML.documentElement.firstChild.firstChild.firstChild == null) {
                alert("(no result)");
            }
            else {
                alert(x.responseXML.documentElement.firstChild.firstChild.firstChild.firstChild.nodeValue);
            }

        } else if (x.status == 404) {
            alert("Error!\n\nThe webservice could not be found.");

        } else if (x.status == 500) {
            // a SoapException
            var ex = new Error();
            ex.name = "SoapException";
            var n = x.responseXML.documentElement.firstChild.firstChild.firstChild;
            while (n != null) {
                if (n.nodeName == "faultcode") {
                    ex.message = n.firstChild.nodeValue;
                }
                if (n.nodeName == "faultstring") {
                    ex.description = n.firstChild.nodeValue;
                }
                n = n.nextSibling;
            } // while
            alert("The server threw an exception.\n\n" + ex.message + "\n\n" + ex.description);

        } else if (x.status == 502) {
            alert("Error!\n\nThe server could not be found.");

        } else {
            // no classified response.
            alert("Result-Status:" + x.status + "\n" + x.responseText);
        } // if

        proxies.xmlhttp = null;
        proxies.current = null;
    } // if
}; // proxies.alertResult

///<summary>Show all the details of the returned data of a webservice call.
///Use this method for debugging transmission problems.</summary>
///<remarks>To set up a debug output in an alert box use:
///proxies.service.method.corefunc = proxies.alertResponseText;</remarks>
proxies.alertResponseText = function () {
    if (proxies.xmlhttp.readyState == 4) {
        alert("Status:" + proxies.xmlhttp.status + "\nRESULT:" + proxies.xmlhttp.responseText);
    }
}; // proxies.alertResponseText

///<summary>show the details about an exception.</summary>
proxies.alertException = function (ex) {
    var s = "Exception:\n\n";

    if (ex.constructor == String) {
        s = ex;
    } else {
        if ((ex.name != null) && (ex.name != "")) {
            s += "Type: " + ex.name + "\n\n";
        }

        if ((ex.message != null) && (ex.message != "")) {
            s += "Message:\n" + ex.message + "\n\n";
        }

        if ((ex.description != null) && (ex.description != "") && (ex.message != ex.description)) {
            s += "Description:\n" + ex.description + "\n\n";
        }
    } // if
    alert(s);
}; // proxies.alertException

///<summary>Get a browser specific implementation of the XMLDOM object, containing a XML document.</summary>
///<param name="xmlText">the xml document as string.</param>
ajax._getXMLDOM = function (xmlText) {
    var obj = null;

    if ((document.implementation != null) && (typeof document.implementation.createDocument == "function")) {
        // Gecko / Mozilla / Firefox
        var parser = new DOMParser();
        obj = parser.parseFromString(xmlText, "text/xml");

    } else {
        // IE
        try {
            obj = new ActiveXObject("MSXML2.DOMDocument");
        } catch (e) {
        }

        if (obj == null) {
            try {
                obj = new ActiveXObject("Microsoft.XMLDOM");
            } catch (e) {
            }
        } // if

        if (obj != null) {
            obj.async = false;
            obj.validateOnParse = false;
        } // if
        obj.loadXML(xmlText);
    } // if
    return(obj);
}; // _getXMLDOM

///<summary>show the details of a javascript object.</summary>
///<remarks>This helps a lot while developing and debugging.</remarks> 
function inspectObj(obj) {
    var s = "InspectObj:";

    if (obj == null) {
        s = "(null)";
        alert(s);
        return;
    } else if (obj.constructor == String) {
        s = "\"" + obj + "\"";
    } else if (obj.constructor == Array) {
        s += " _ARRAY";
    } else if (typeof(obj) == "function") {
        s += " [function]" + obj;

    } else if ((typeof(XMLSerializer) != "undefined") && (obj.constructor == XMLDocument)) {
        s = "[XMLDocument]:\n" + (new XMLSerializer()).serializeToString(obj.firstChild);
        alert(s);
        return;

    } else if ((obj.constructor == null) && (typeof(obj) == "object") && (obj.xml != null)) {
        s = "[XML]:\n" + obj.xml;
        alert(s);
        return;
    }

    for (p in obj) {
        try {
            if (obj[p] == null) {
                s += "\n" + String(p) + " (...)";

            } else if (typeof(obj[p]) == "function") {
                s += "\n" + String(p) + " [function]";

            } else if (obj[p].constructor == Array) {
                s += "\n" + String(p) + " [ARRAY]: " + obj[p];
                for (n = 0; n < obj[p].length; n++) {
                    s += "\n  " + n + ": " + obj[p][n];
                }

            } else {
                s += "\n" + String(p) + " [" + typeof(obj[p]) + "]: " + obj[p];
            } // if
        } catch (e) {
            s += e;
        }
    } // for
    alert(s);
}; // inspectObj