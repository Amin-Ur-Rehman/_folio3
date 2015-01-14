/**
 * Created by zahmed on 14-Jan-15.
 *
 * Class Name: F3ClientFactory
 *
 * Description:
 * - This script is responsible for returning the object on client basis.
 * -
 * Referenced By:
 * -
 * -
 * Dependency:
 * -
 * -
 */

/**
 * F3ClientFactory class that has the functionality of
 */
var F3ClientFactory = (function () {
    return {
        /**
         * Init method
         */
        createClient: function (type) {
            var client = new F3ClientBase();

            switch (type) {
                case 'PurestColloids':
                    client = new F3PurestColloidsClient();
                    break;
                case 'Jet':
                    client = new F3JetClient();
                    break;
                default :
                    client = new F3ClientBase();
            }
            return client;
        }
    };
})();


/**
 * This class is responsible for setting the default fields in Magento Connector entities
 * @param name
 * @returns {{setCustomerFields: setCustomerFields, itemFetch: itemFetch, setSalesOrderFields: setSalesOrderFields, setCustomerAddressFields: setCustomerAddressFields}}
 * @constructor
 */
function F3ClientBase() {

    var speed = 100;
    function openWings() {
        console.log('open wing callled');
    }
    function doFly() {
        openWings();
        self.move();
    }

    var self = {
        /**
         * Description of method setCustomerFields
         * @param parameter
         */
        setCustomerFields: function (rec) {
            try {

            } catch (e) {
                nlapiLogExecution('ERROR', 'Error during main setCustomerFields', e.toString());
            }
        },

        /**
         * Description of method itemFetch
         * @param parameter
         */
        itemFetch: function (parameter) {
            try {

            } catch (e) {
                nlapiLogExecution('ERROR', 'Error during main itemFetch', e.toString());
            }
        },

        /**
         * Description of method setSalesOrderFields
         * @param parameter
         */
        setSalesOrderFields: function (rec) {
            try {

            } catch (e) {
                nlapiLogExecution('ERROR', 'Error during main setSalesOrderFields', e.toString());
            }
        },

        /**
         * Description of method setCustomerAddressFields
         * @param parameter
         */
        setCustomerAddressFields: function (rec) {
            try {

            } catch (e) {
                nlapiLogExecution('ERROR', 'Error during main setCustomerAddressFields', e.toString());
            }
        }
    };
    return self;
}

/**
 *
 * @returns {*}
 * @constructor
 */
function F3PurestColloidsClient() {
    var currentClient = F3ClientBase();

    return currentClient;
}

/**
 *
 * @returns {*}
 * @constructor
 */
function F3JetClient() {
    var currentClient = F3ClientBase();

    currentClient.setCustomerAddressFields = function () {
        Utility.logDebug('F3JetClient','setCustomerAddressFields');
    }

    return currentClient;
}