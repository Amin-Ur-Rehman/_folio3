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

ConnectorModels = (function () {
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
        },
        /**
         * Make an object array for Customer data fetching from Sales Order
         * @param {object} order
         * @return {Array}
         */
        getCustomerObject: function (order) {
            var result = [];
            var customer = {};

            customer.customer_id = order.customer_id;
            customer.email = order.email;
            customer.firstname = order.firstname;
            customer.middlename = !!order.middlename ? order.middlename : ' ';
            customer.lastname = order.lastname;
            customer.group_id = order.customer_group_id;
            customer.prefix = order.customer_prefix;
            customer.suffix = order.customer_suffix;
            customer.dob = order.customer_dob;
            result.push(customer);

            return result;

        },
        /**
         * Make an array of objects for address data using shipping & billing addresses
         * @param {object} shippingAddress
         * @param {object} billingAddress
         * @return {Array}
         */
        getAddressesFromOrder: function (shippingAddress, billingAddress) {
            var result = [];
            var address = {};
            // checking if both addresses are same
            if (ConnectorCommon.isSame(shippingAddress, billingAddress)) {

                address.city = shippingAddress.city;
                address.country_id = shippingAddress.country;
                address.firstname = shippingAddress.firstname;
                address.lastname = shippingAddress.lastname;
                address.postcode = shippingAddress.zip;
                address.region = shippingAddress.state;
                address.region_id = shippingAddress.region_id;
                address.street = shippingAddress.street;
                address.telephone = shippingAddress.phone;
                address.is_default_billing = true;
                address.is_default_shipping = true;

                result[result.length] = address;
            } else {
                address = {};

                address.city = shippingAddress.city;
                address.country_id = shippingAddress.country;
                address.firstname = shippingAddress.firstname;
                address.lastname = shippingAddress.lastname;
                address.postcode = shippingAddress.zip;
                address.region = shippingAddress.state;
                address.region_id = shippingAddress.region_id;
                address.street = shippingAddress.street;
                address.telephone = shippingAddress.phone;
                address.is_default_billing = false;
                address.is_default_shipping = true;

                result[result.length] = address;

                address = {};

                address.city = billingAddress.city;
                address.country_id = billingAddress.country;
                address.firstname = billingAddress.firstname;
                address.lastname = billingAddress.lastname;
                address.postcode = billingAddress.zip;
                address.region = billingAddress.state;
                address.region_id = billingAddress.region_id;
                address.street = billingAddress.street;
                address.telephone = billingAddress.phone;
                address.is_default_billing = true;
                address.is_default_shipping = false;

                result[result.length] = address;
            }

            return result;
        }
    };
})();