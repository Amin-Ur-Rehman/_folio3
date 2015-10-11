/**
 * Created by Ubaid Baig on 2.7.15
 *
 * Class Name: ShopifyWrapper
 *
 * Description:
 * - This script is responsible for handling Shopfiy API
 * -
 * Referenced By:
 * -
 * -
 * Dependency:
 *   -
 *   -
 */

/**
 * This is a Wrapper Class for Shopify API
 */
ShopifyWrapper = (function () {

    //region Private Methods

    /**
     * Parses Single Sales Order Response
     * @param serverOrder
     * @returns {*|{customer_id, increment_id, shippingAddress, billingAddress, payment}}
     */
    function parseSingleSalesOrderResponse(serverOrder) {

        var localOrder = ConnectorModels.salesOrderModel();

        localOrder.increment_id = serverOrder.id;

        if (serverOrder.shipping_lines && serverOrder.shipping_lines.length > 0) {
            localOrder.shipping_amount = serverOrder.shipping_lines[0].price;
            localOrder.shipment_method = serverOrder.shipping_lines[0].code;
        }

        if (serverOrder.customer) {
            localOrder.customer_id = serverOrder.customer.id;

            localOrder.email = serverOrder.customer.email;
            localOrder.firstname = serverOrder.customer.first_name;
            localOrder.middlename = ' ';
            localOrder.lastname = serverOrder.customer.last_name;
            localOrder.group_id = serverOrder.customer.customer_group_id;
            localOrder.prefix = '';
            localOrder.suffix = '';
            localOrder.dob = '';
            localOrder.customer_firstname = localOrder.firstname;
            localOrder.customer_middlename = localOrder.middlename;
            localOrder.customer_lastname = localOrder.lastname;
        }

        if (serverOrder.shipping_address) {
            localOrder.shippingAddress.address_id = 0;
            localOrder.shippingAddress.city = serverOrder.shipping_address.city;
            localOrder.shippingAddress.country_id = serverOrder.shipping_address.country_code;
            localOrder.shippingAddress.firstname = serverOrder.shipping_address.first_name;
            localOrder.shippingAddress.lastname = serverOrder.shipping_address.last_name;
            localOrder.shippingAddress.postcode = serverOrder.shipping_address.zip;
            localOrder.shippingAddress.region = serverOrder.shipping_address.province_code;
            localOrder.shippingAddress.region_id = serverOrder.shipping_address.province_code;
            localOrder.shippingAddress.street = serverOrder.shipping_address.address1;
            localOrder.shippingAddress.telephone = serverOrder.shipping_address.phone;
            localOrder.shippingAddress.is_default_billing = false;
            localOrder.shippingAddress.is_default_shipping = true;
        }

        if (serverOrder.billing_address) {
            localOrder.billingAddress.address_id = 0;
            localOrder.billingAddress.city = serverOrder.billing_address.city;
            localOrder.billingAddress.country_id = serverOrder.billing_address.country_code;
            localOrder.billingAddress.firstname = serverOrder.billing_address.first_name;
            localOrder.billingAddress.lastname = serverOrder.billing_address.last_name;
            localOrder.billingAddress.postcode = serverOrder.billing_address.zip;
            localOrder.billingAddress.region = serverOrder.billing_address.province_code;
            localOrder.billingAddress.region_id = serverOrder.billing_address.province_code;
            localOrder.billingAddress.street = serverOrder.billing_address.address_1 + ' ' + serverOrder.billing_address.address_2;
            localOrder.billingAddress.telephone = serverOrder.billing_address.phone;
            localOrder.billingAddress.is_default_billing = true;
            localOrder.billingAddress.is_default_shipping = false;
        }

        if (serverOrder.line_items && serverOrder.line_items.length > 0) {

            for (var i = 0; i < serverOrder.line_items.length; i++) {
                var serverLineItem = serverOrder.line_items[i];
                localOrder.products.push(parseSingleProductResponse(serverLineItem));
            }

        }

        return localOrder;
    }

    /**
     * Parses Sales Order Response
     * @param serverResponse
     * @returns {Array}
     */
    function parseSalesOrderResponse(serverResponse) {
        var finalResult = [];

        try {
            if (!!serverResponse && serverResponse.length > 0) {
                for (var i = 0; i < serverResponse.length; i++) {
                    var serverOrder = serverResponse[i];

                    Utility.logDebug('serverOrder = ', JSON.stringify(serverOrder));

                    var localOrder = parseSingleSalesOrderResponse(serverOrder);

                    Utility.logDebug('localOrder = ', JSON.stringify(localOrder));
                    finalResult.push(localOrder);
                }
            }
        } catch (e) {
            Utility.logException('Error during parseSalesOrderResponse', e);
        }

        Utility.logDebug('finalResult of parseSalesOrderResponse = ', JSON.stringify(finalResult));
        return finalResult;
    }

    /**
     * Parses Single Product Response
     * @param serverProduct
     * @returns {*|{increment_id, shipping_amount, shipment_method, quantity}}
     */
    function parseSingleProductResponse(serverProduct) {
        var localProduct = ConnectorModels.productModel();

        localProduct.increment_id = serverProduct.id;
        localProduct.shipping_amount = serverProduct.price;
        localProduct.shipment_method = serverProduct.shipment_method;
        localProduct.product_id = serverProduct.sku;
        localProduct.qty_ordered = serverProduct.quantity;
        localProduct.fulfillment_service = serverProduct.fulfillment_service;
        localProduct.fulfillment_status = serverProduct.fulfillment_status;
        localProduct.gift_card = serverProduct.gift_card;
        localProduct.grams = serverProduct.grams;
        localProduct.id = serverProduct.id;
        localProduct.price = serverProduct.price;
        localProduct.requires_shipping = serverProduct.requires_shipping;
        localProduct.sku = serverProduct.sku;
        localProduct.taxable = serverProduct.taxable;
        localProduct.title = serverProduct.title;
        localProduct.variant_id = serverProduct.variant_id;
        localProduct.variant_title = serverProduct.variant_title;
        localProduct.vendor = serverProduct.vendor;
        localProduct.name = serverProduct.name;
        localProduct.variant_inventory_management = serverProduct.variant_inventory_management;
        localProduct.properties = serverProduct.properties;
        localProduct.product_exists = serverProduct.product_exists;
        localProduct.fulfillable_quantity = serverProduct.fulfillable_quantity;
        localProduct.total_discount = serverProduct.total_discount;
        localProduct.tax_lines = serverProduct.tax_lines;

        return localProduct;
    }

    /**
     * Parses Product Response
     * @param serverResponse
     * @returns {Array}
     */
    function parseProductResponse(serverResponse) {
        var finalResult = [];
        try {
            if (!!serverResponse && serverResponse.length > 0) {
                for (var i = 0; i < serverResponse.length; i++) {
                    var serverProduct = serverResponse[i];

                    var localProduct = parseSingleProductResponse(serverProduct);

                    finalResult.push(localProduct);
                }
            }
        } catch (e) {
            Utility.logException('Error during parseProductResponse', e);
        }

        return finalResult;
    }


    function parseFulfillmentResponse(serverResponse) {
        var finalResult = [];
        try {
            if (!!serverResponse && serverResponse.length > 0) {
                for (var i = 0; i < serverResponse.length; i++) {
                    var serverFulfillment = serverResponse[i];

                    var localFulfillment = parseSingleSalesOrderResponse(serverFulfillment);

                    finalResult.push(localFulfillment);
                }
            }
        } catch (e) {
            Utility.logException('Error during parseFulfillmentResponse', e);
        }

        return finalResult;
    }


    function parseSingleCustomerAddressResponse(serverAddress) {

        var localAddress = ConnectorModels.addressModel();

        localAddress.address_id = serverAddress.id;
        localAddress.city = serverAddress.city;
        localAddress.country_id = serverAddress.country_code;
        localAddress.firstname = serverAddress.first_name;
        localAddress.lastname = serverAddress.last_name;
        localAddress.postcode = serverAddress.zip;
        localAddress.region = serverAddress.province_code;
        localAddress.region_id = serverAddress.province_code;
        localAddress.street = serverAddress.address1;
        localAddress.telephone = serverAddress.phone;

        localAddress.is_default_billing = false;
        localAddress.is_default_shipping = false;

        if (!!serverAddress.default && (serverAddress.default === true ||
            serverAddress.default === 'true')) {
            localAddress.is_default_billing = true;
            localAddress.is_default_shipping = true;
        }

        return localAddress;
    }

    /**
     * Parses Customer Address Response
     * @param serverResponse
     * @returns {Array}
     */
    function parseCustomerAddressResponse(serverResponse) {
        var finalResult = [];

        try {
            if (!!serverResponse && serverResponse.length > 0) {
                for (var i = 0; i < serverResponse.length; i++) {
                    var serverAddress = serverResponse[i];

                    Utility.logDebug('server Address = ', JSON.stringify(serverAddress));

                    var localAddress = parseSingleCustomerAddressResponse(serverAddress);

                    Utility.logDebug('local Address = ', JSON.stringify(localAddress));
                    finalResult.push(localAddress);
                }
            }
        } catch (e) {
            Utility.logException('Error during parseCustomerAddressResponse', e);
        }

        Utility.logDebug('finalResult of parseCustomerAddressResponse = ', JSON.stringify(finalResult));
        return finalResult;
    }

    /**
     * Sends request to server
     * @param httpRequestData
     */
    function sendRequest(httpRequestData) {

        var finalUrl = ShopifyWrapper.ServerUrl + httpRequestData.additionalUrl;

        Utility.logDebug('Request final = ', finalUrl);
        var res = null;

        if (!httpRequestData.headers) {
            httpRequestData.headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                //"Authorization":
                //    "Basic YjM4OGQ3ZjZlOWY4YjRhODNlOGMzNzI3YTgxZTBmMGI6MWExN2QzMGExZDYyNmVlY2U1M2QzNjZhYjBiMmIyNDA="
                "Authorization": "Basic " + ShopifyWrapper.AuthHeader
            };
        }

        Utility.logDebug('Request headers = ', JSON.stringify(httpRequestData.headers));

        if (httpRequestData.method === 'GET') {
            res = nlapiRequestURL(finalUrl, null, httpRequestData.headers);
        } else {
            var postDataString = typeof httpRequestData.postData === "object" ?
                JSON.stringify(httpRequestData.postData) : httpRequestData.postData;

            res = nlapiRequestURL(finalUrl, postDataString, httpRequestData.headers, httpRequestData.method);
        }

        var body = res.getBody();

        var serverResponse = eval('(' + body + ')');

        return serverResponse;
    }

    //endregion

    //region Public Methods

    return {

        /**
         * Init method
         */
        initialize: function (storeInfo) {
            if (!!storeInfo) {
                ShopifyWrapper.ServerUrl = storeInfo.endpoint;
            } else if (!!ConnectorConstants.CurrentStore) {
                ShopifyWrapper.ServerUrl = ConnectorConstants.CurrentStore.endpoint;
            }
        },
        RequestHeader: '',
        RequestFooter: '',

        UserName: '',
        Password: '',
        AuthHeader: '',

        ServerUrl: 'https://b388d7f6e9f8b4a83e8c3727a81e0f0b:1a17d30a1d626eece53d366ab0b2b240@f3-test-store-001.myshopify.com/admin/',

        /**
         * Gets supported Date Format
         * @returns {string}
         */
        getDateFormat: function () {
            return 'ISO';
        },

        getSessionIDFromServer: function (userName, apiKey) {
            var sessionID = 'DUMMY_SESSION_ID';

            ShopifyWrapper.UserName = userName;
            ShopifyWrapper.Password = apiKey;

            if (!!base64_encode) {
                ShopifyWrapper.AuthHeader = base64_encode(ShopifyWrapper.UserName + ':' + ShopifyWrapper.Password);
            }

            return sessionID;
        },

        /**
         * Gets Sales Order from Server
         * @param order
         * @param sessionID
         * @returns {*}
         */
        getSalesOrders: function (order, sessionID) {

            var httpRequestData = {
                additionalUrl: 'orders.json?created_at_min=' + order.updateDate,
                method: 'GET'
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                orders: []
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

                if (!!serverResponse && serverResponse.orders) {
                    serverFinalResponse.orders = parseSalesOrderResponse(serverResponse.orders);
                } else {
                    Utility.logDebug('Error in order response', JSON.stringify(serverResponse));
                }

            } catch (e) {
                serverFinalResponse.faultCode = 'SERVER_ERROR';
                serverFinalResponse.faultString = e.toString();

                Utility.logException('Error during getSalesOrders', e);
            }

            // If some problem
            if (!serverFinalResponse.status) {
                var result = {
                    status: false
                };
                result.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
                return result;
            }

            return serverFinalResponse;
        },

        /**
         * Gets Sales Order information for individual order
         * @param increment_id
         * @param sessionID
         * @returns {{status: boolean, faultCode: string, faultString: string}}
         */
        getSalesOrderInfo: function (increment_id, sessionID) {
            var httpRequestData = {
                additionalUrl: 'orders.json?ids=' + increment_id,
                method: 'GET'
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: ''
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during getSalesOrders', e);
            }

            if (!!serverResponse && serverResponse.orders) {
                var orders = parseSalesOrderResponse(serverResponse.orders);

                if (!!orders && orders.length > 0) {
                    serverFinalResponse.customer_id = orders[0].customer_id;
                    serverFinalResponse.shippingAddress = orders[0].shippingAddress;
                    serverFinalResponse.billingAddress = orders[0].billingAddress;
                    serverFinalResponse.payment = orders[0].payment;
                    serverFinalResponse.products = orders[0].products;
                }
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        /**
         * Updates item to server
         * @param product
         * @param sessionID
         * @param magID
         * @param isParent
         * @returns {{status: boolean, faultCode: string, faultString: string}}
         */
        updateItem: function (product, sessionID, magID, isParent) {

            // first get the product id here
            var productInfo = ShopifyWrapper.getProduct(sessionID, product, '&fields=variants');

            var firstProduct = productInfo[0];

            var httpRequestData = {
                additionalUrl: 'products/' + magID + '.json',
                method: 'PUT',
                postData: {
                    product: {
                        id: magID,
                        variants: [{
                            id: firstProduct.variants[0].id,
                            price: product.price,
                            inventory_quantity: product.quantity,
                            product_id: magID
                        }
                        ]
                    }
                }
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                product: {}
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during updateItem', e);
            }

            if (!!serverResponse && serverResponse.product) {
                serverFinalResponse.product = parseSingleProductResponse(serverResponse.product);

            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        /**
         * Gets Product from the server
         * @param sessionID
         * @param product
         * @param variantRequest
         * @returns {*}
         */
        getProduct: function (sessionID, product, variantRequest) {

            var httpRequestData = {
                additionalUrl: 'products.json?ids=' + product.magentoSKU +
                (!!variantRequest && variantRequest.length > 0 ? variantRequest : ''),
                method: 'GET'
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                product: {}
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during getProduct', e);
            }

            if (!!serverResponse && serverResponse.products) {
                serverFinalResponse.product = parseProductResponse(serverResponse.products);


            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        hasDifferentLineItemIds: function () {
            return false;
        },

        createFulfillment: function (sessionID, serverItemIds, serverSOId) {

            var httpRequestData = {
                additionalUrl: 'orders/' + serverSOId + '/fulfillments.json',
                method: 'PUT',
                postData: {
                    "fulfillment": {
                        "tracking_number": null,
                        "line_items": []
                    }
                }
            };

            for (var i = 0; i < serverItemIds.length; i++) {
                var serverItem = serverItemIds[i];
                httpRequestData.postData.fulfillment.line_items.push(serverItem);
            }

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                result: []
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during createFulfillment', e);
            }

            if (!!serverResponse && serverResponse.orders) {
                var fulfillmentArray = parseFulfillmentResponse(serverResponse);

                if (!!fulfillmentArray && fulfillmentArray.length > 0) {
                    serverFinalResponse.result = fulfillmentArray;
                }
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        createTracking: function (result, carrier, carrierText, tracking, sessionID, serverSOId) {
            var trackingRequest = ShopifyWrapper.createTrackingRequest(result, carrier, carrierText, tracking, sessionID);

            var responseTracking = ShopifyWrapper.validateTrackingCreateResponse(ShopifyWrapper.soapRequestToServer(trackingRequest));

            return responseTracking;


            var httpRequestData = {
                additionalUrl: 'orders/' + serverSOId + '/fulfillments.json',
                method: 'PUT',
                postData: {
                    "fulfillment": {
                        "tracking_number": tracking
                    }
                }
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                result: []
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during createFulfillment', e);
            }

            if (!!serverResponse && serverResponse.orders) {
                var fulfillmentArray = parseFulfillmentResponse(serverResponse);

                if (!!fulfillmentArray && fulfillmentArray.length > 0) {
                    serverFinalResponse.result = fulfillmentArray;
                }
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        getCustomerAddress: function (customer_id, sessionID) {

            var httpRequestData = {
                additionalUrl: 'customers/' + customer_id + '/addresses.json',
                method: 'GET'
            };

            var serverResponse = null;

            // Make Call and Get Data
            var serverFinalResponse = {
                status: false,
                faultCode: '',
                faultString: '',
                addresses: []
            };

            try {
                serverResponse = sendRequest(httpRequestData);
                serverFinalResponse.status = true;

            } catch (e) {
                Utility.logException('Error during getCustomerAddress', e);
            }

            if (!!serverResponse && serverResponse.addresses) {
                serverFinalResponse.addresses = parseCustomerAddressResponse(serverResponse.addresses);
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        createSalesOrder: function (internalId, orderRecord, store, sessionId) {
        },

        upsertCustomer: function () {
        },
        requiresAddressCall: function () {
            return true;
        },
        upsertCustomerAddress: function () {
        }
    };

    //endregion

})();