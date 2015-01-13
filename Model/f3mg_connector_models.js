/**
 * Created by zahmed on 13-Jan-15.
 *
 * Class Name: ConnectorModels
 *
 * Description:
 * - This class is responsible for creating objects
 * -
 * Referenced By:
 * - connector_salesorder_sch.js
 * -
 * Dependency:
 * - Script Parameters:
 * -
 * - Script Id:
 *   -
 * -
 * - Deployment Id:
 *   -
 * -
 * - Scripts:
 *   -
 */

var ConnectorModels = (function () {
    return {
        /**
         * Init method
         */
        initialize: function () {

        },
        /**
         * This function sets make an object from the passing arguments
         * @param {object} order
         * @param {string} invoiceNum
         * @param {object[]} products
         * @param {object[]} netsuiteMagentoProductMap
         * @param {string} CustIdInNS
         * @param {string} configuration
         * @param {object} shippingAddress
         * @param {object} billingAddress
         * @param {object} payment
         * @returns {object}
         */
        getSalesOrderObject: function (order, invoiceNum, products, netsuiteMagentoProductMap, CustIdInNS, configuration, shippingAddress, billingAddress, payment) {
            var salesOrderObject = {};

            salesOrderObject.order = order;
            salesOrderObject.invoiceNum = invoiceNum;
            salesOrderObject.products = products;
            salesOrderObject.netsuiteMagentoProductMap = netsuiteMagentoProductMap;
            salesOrderObject.netsuiteCustomerId = CustIdInNS;
            salesOrderObject.configuration = configuration;
            salesOrderObject.shippingAddress = shippingAddress;
            salesOrderObject.billingAddress = billingAddress;
            salesOrderObject.payment = payment;

            return salesOrderObject;
        }
    };
})();