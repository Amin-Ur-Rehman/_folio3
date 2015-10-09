/**
 * Created by ubaig on 10/07/2015.
 * TODO:
 * -
 * -
 * -
 * Referenced By:
 * -
 * -
 * -
 * Dependencies:
 * -
 * -
 * -
 * -
 */

/**
 * This is a Wrapper Class for Woo Commerce API
 */
WooWrapper = (function () {

    //region Private Methods

    /**
     * Parses Single Sales Order Response
     * @param serverOrder
     * @returns {*|{customer_id, increment_id, shippingAddress, billingAddress, payment}}
     */
    function parseSingleSalesOrderResponse(serverOrder) {

        var localOrder = ConnectorModels.salesOrderModel();

        localOrder.increment_id = serverOrder.order_number;

        if (serverOrder.shipping_lines && serverOrder.shipping_lines.length > 0) {
            localOrder.shipping_amount = serverOrder.shipping_lines[0].total;
            localOrder.shipment_method = serverOrder.shipping_lines[0].method_id;
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
            localOrder.shippingAddress.country_id = serverOrder.shipping_address.country;
            localOrder.shippingAddress.firstname = serverOrder.shipping_address.first_name;
            localOrder.shippingAddress.lastname = serverOrder.shipping_address.last_name;
            localOrder.shippingAddress.postcode = serverOrder.shipping_address.postcode;
            localOrder.shippingAddress.region = serverOrder.shipping_address.state;
            localOrder.shippingAddress.region_id = serverOrder.shipping_address.state;
            localOrder.shippingAddress.street = serverOrder.shipping_address.address_1 + ' ' + serverOrder.shipping_address.address_2;
            localOrder.shippingAddress.telephone = "";
            // TODO: handle flag conditionally
            localOrder.shippingAddress.is_default_billing = false;
            localOrder.shippingAddress.is_default_shipping = true;
        }

        if (serverOrder.billing_address) {
            localOrder.billingAddress.address_id = 0;
            localOrder.billingAddress.city = serverOrder.billing_address.city;
            localOrder.billingAddress.country_id = serverOrder.billing_address.country;
            localOrder.billingAddress.firstname = serverOrder.billing_address.first_name;
            localOrder.billingAddress.lastname = serverOrder.billing_address.last_name;
            localOrder.billingAddress.postcode = serverOrder.billing_address.postcode;
            localOrder.billingAddress.region = serverOrder.billing_address.state;
            localOrder.billingAddress.region_id = serverOrder.billing_address.state;
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
        localProduct.item_id = "";

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
        /*var finalResult = [];
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
         }*/
        var finalResult = {
            isOrderStatusCompleted: false
        };
        try {
            if (serverResponse.hasOwnProperty("status") && serverResponse.status.toString() === "completed") {
                finalResult.isOrderStatusCompleted = true;
                finalResult.orderNumber = serverResponse.order_number;
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
        localAddress.region = serverAddress.province;
        localAddress.region_id = serverAddress.province;
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

                Utility.logDebug('server Customer = ', JSON.stringify(serverResponse));

                var localAddress = parseSingleCustomerAddressResponse(serverResponse.billing_address);

                finalResult.push(localAddress);

                localAddress = parseSingleCustomerAddressResponse(serverResponse.shipping_address);

                finalResult.push(localAddress);

            }
        } catch (e) {
            Utility.logException('Error during parseCustomerAddressResponse', e);
        }

        Utility.logDebug('finalResult of parseCustomerAddressResponse = ', JSON.stringify(finalResult));
        return finalResult;
    }

    /**
     * Parses Customer Response
     * @param serverResponse
     */
    function parseCustomerResponse(serverResponse) {

    }

    /**
     * Sends request to server
     * @param httpRequestData
     */
    function sendRequest(httpRequestData) {

        var finalUrl = WooWrapper.ServerUrl + httpRequestData.url;

        httpRequestData.url = finalUrl;

        Utility.logDebug('Request final = ', finalUrl);

        var oauth = OAuth({
            consumer: {
                public: WooWrapper.UserName,
                secret: WooWrapper.Password
            },
            last_ampersand: true,
            signature_method: 'HMAC-SHA256'
        });

        var finalInfo = oauth.authorize(httpRequestData, null);

        Utility.logDebug('finalInfo = ', JSON.stringify(finalInfo));

        var signedUrl = oauth.generateQueryParam(finalInfo);

        finalUrl = httpRequestData.url + '?' + signedUrl;

        var res = null;

        if (!httpRequestData.headers) {
            httpRequestData.headers = {
                "Accept": "application/json",
                "Content-Type": "application/json"
            };
        }

        Utility.logDebug('Request headers = ', JSON.stringify(httpRequestData.headers));
        Utility.logDebug('httpRequestData = ', JSON.stringify(httpRequestData));

        var body = '';
        var serverResponse = null;

        if (httpRequestData.method === 'GET') {
            if (typeof nlapiRequestURL !== "undefined") {
                Utility.logDebug("httpRequestData.method === GET", "");
                res = nlapiRequestURL(finalUrl, null, httpRequestData.headers);
                body = res.getBody();
                Utility.logDebug("res", res.getBody());
                Utility.logDebug("code", res.getCode());
                serverResponse = eval('(' + body + ')');
            } else {
                jQuery.ajax({
                    url: finalUrl,
                    async: false
                }).done(function (result) {
                    res = result;
                    serverResponse = res;
                });
            }

        } else {
            var postDataString =
                typeof httpRequestData.postData === "object" ?
                    JSON.stringify(httpRequestData.postData) : httpRequestData.postData;

            if (typeof nlapiRequestURL !== "undefined") {
                Utility.logDebug("httpRequestData.method !== GET", "");
                res = nlapiRequestURL(finalUrl, postDataString, httpRequestData.headers, httpRequestData.method);
                Utility.logDebug("res", res.getBody());
                Utility.logDebug("code", res.getCode());
                body = res.getBody();
                serverResponse = eval('(' + body + ')');

            } else {
                jQuery.ajax({
                    url: finalUrl,
                    method: httpRequestData.method,
                    async: false,
                    dataType: 'json',
                    contentType: 'application/json',
                    data: postDataString
                }).done(function (result) {
                    res = result;
                    serverResponse = res;
                });
            }

        }

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
                WooWrapper.ServerUrl = storeInfo.endpoint;
            } else if (!!ConnectorConstants && !!ConnectorConstants.CurrentStore) {
                WooWrapper.ServerUrl = ConnectorConstants.CurrentStore.endpoint;
            }
        },

        UserName: '',
        Password: '',
        AuthHeader: '',

        ServerUrl: 'http://nsmg.folio3.com:4545/woosite2/wc-api/v3/',

        /**
         * Gets supported Date Format
         * @returns {string}
         */
        getDateFormat: function () {
            return 'ISO';
        },

        getSessionIDFromServer: function (userName, apiKey) {
            var sessionID = 'DUMMY_SESSION_ID';

            WooWrapper.UserName = userName;
            WooWrapper.Password = apiKey;

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
                url: 'orders',
                method: 'GET',
                data: {
                    created_at_min: order.updateDate
                }
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
                url: 'orders',
                method: 'GET',
                data: {
                    ids: increment_id
                }
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
            /*var productInfo = WooWrapper.getProduct(sessionID, product, '&fields=variants');
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
             };*/
            var httpRequestData = {
                url: 'products/' + magID.toString(),
                method: 'PUT',
                postData: {
                    product: {
                        regular_price: product.price,
                        sale_price: 0,
                        stock_quantity: product.quantity
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
                url: 'products',
                method: 'GET',
                data: {
                    "filter[sku]": product.magentoSKU
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
                Utility.logException('Error during getProduct', e);
            }

            if (!!serverResponse && serverResponse.hasOwnProperty("products") && serverResponse.products.length > 0) {
                serverFinalResponse.product = parseSingleProductResponse(serverResponse.products[0]);
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        /**
         * This method should create a shippment on WOO Commerce but
         * there is no shipment record on WOO Commerce. So,
         * change order status to Complete as an alternate & will be
         * assumed as shipped order in WOO
         * @param sessionID
         * @param serverItemIds
         * @param serverSOId
         * @return {{status: boolean, faultCode: string, faultString: string, result: Array}}
         *
         * Note: There is no shipment record in WOO, so no partial fulfillment is supported
         */
        createFulfillment: function (sessionID, serverItemIds, serverSOId) {

            var httpRequestData = {
                url: 'orders/' + serverSOId,
                method: 'PUT',
                postData: {
                    "order": {
                        "status": "completed"
                    }
                }
            };

            /*for (var i = 0; i < serverItemIds.length; i++) {
             var serverItem = serverItemIds[i];
             httpRequestData.postData.fulfillment.line_items.push(serverItem);
             }*/

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

            if (!!serverResponse && serverResponse.order) {
                var fulfillmentObj = parseFulfillmentResponse(serverResponse.order);

                // check if order status is changed to complete
                if (!!fulfillmentObj && fulfillmentObj.isOrderStatusCompleted) {
                    // for setting order id as shipment id in item fulfillment
                    serverFinalResponse.result = fulfillmentObj.orderNumber;
                }
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        createTracking: function (result, carrier, carrierText, tracking, sessionID, serverSOId) {
            var noteTemplate = "Carrier: <CARRIER> \nTitle: <TITLE> \nTracking Number: <TRACKING_NUMBER>";

            var note = noteTemplate.replace("<CARRIER>", carrier || "");
            note = note.replace("<TITLE>", carrierText || "");
            note = note.replace("<TRACKING_NUMBER>", tracking || "");

            var httpRequestData = {
                url: 'orders/' + serverSOId + '/notes',
                method: 'POST',
                postData: {
                    "order_note": {
                        "note": note,
                        "customer_note": false
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

            if (!!serverResponse && serverResponse.order_note) {
                serverFinalResponse.result.push(serverResponse.order_note);
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        getCustomerAddress: function (customer_id, sessionID) {

            var httpRequestData = {
                url: 'customers/' + customer_id,
                method: 'GET',
                data: {
                    //id: customer_id
                }
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

            if (!!serverResponse && serverResponse.customer) {
                serverFinalResponse.addresses = parseCustomerAddressResponse(serverResponse.customer);
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },

        createSalesOrder: function (internalId, orderRecord, store, sessionId) {

            function getSalesOrderData(orderRecord) {
                var data = {};
                data.order = {};

                data.order.customer_id = "";
                data.order.line_items = [];
                data.order.billing_address = {};
                data.order.shipping_address = {};
                data.order.shipping_lines = [];
                data.order.payment_details = {};

                // set customer
                data.order.customer_id = orderRecord.customer.customerId;

                // set products in main object
                var items = orderRecord.items;
                for (var i in items) {
                    var item = items[i];

                    var itemObj = {};
                    //itemObj.product_id = 546 // TODO: change sku with id if not work
                    itemObj.sku = item.sku;
                    itemObj.quantity = item.quantity;

                    data.order.line_items.push(itemObj);
                }

                var addresses = orderRecord.customer.addresses;
                // set billing address
                data.order.billing_address.first_name = "John";
                data.order.billing_address.last_name = "Doe";
                data.order.billing_address.address_1 = "969 Market";
                data.order.billing_address.address_2 = "";
                data.order.billing_address.city = "San Francisco";
                data.order.billing_address.state = "CA";
                data.order.billing_address.postcode = "94103";
                data.order.billing_address.country = "US";
                data.order.billing_address.email = "john.doe@example.com";
                data.order.billing_address.phone = "(555) 555-555";

                // set set shipping address

                // set shipping lines

                data.order.shipping_lines.push({
                    method_id: "flat_rate",
                    method_title: "Flat Rate",
                    total: orderRecord.shipmentInfo.shipmentCost
                });

                // set payment details

                data = {
                    "order": {
                        "payment_details": {
                            "method_id": "bacs",
                            "method_title": "Direct Bank Transfer",
                            "paid": true
                        },
                        "billing_address": {
                            "first_name": "John",
                            "last_name": "Doe",
                            "address_1": "969 Market",
                            "address_2": "",
                            "city": "San Francisco",
                            "state": "CA",
                            "postcode": "94103",
                            "country": "US",
                            "email": "john.doe@example.com",
                            "phone": "(555) 555-5555"
                        },
                        "shipping_address": {
                            "first_name": "John",
                            "last_name": "Doe",
                            "address_1": "969 Market",
                            "address_2": "",
                            "city": "San Francisco",
                            "state": "CA",
                            "postcode": "94103",
                            "country": "US"
                        },
                        "customer_id": 2,
                        "line_items": [
                            {
                                "product_id": 546,
                                "quantity": 2
                            },
                            {
                                "product_id": 613,
                                "quantity": 1
                            }
                        ],
                        "shipping_lines": [
                            {
                                "method_id": "flat_rate",
                                "method_title": "Flat Rate",
                                "total": 10
                            }
                        ]
                    }
                };

                return data;
            }

            var httpRequestData = {
                url: 'orders',
                method: 'POST',
                data: getSalesOrderData(orderRecord)
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
                Utility.logException('Error during createSalesOrder', e);
            }

            if (!!serverResponse && serverResponse.order) {
                var order = parseSingleSalesOrderResponse(serverResponse.order);

                if (!!order) {
                    serverFinalResponse.customer_id = order.customer_id;
                    serverFinalResponse.shippingAddress = order.shippingAddress;
                    serverFinalResponse.billingAddress = order.billingAddress;
                    serverFinalResponse.payment = order.payment;
                    serverFinalResponse.products = order.products;
                }

                // TODO: also need to set Line Items here - currenlty it is now needed

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

        upsertCustomer: function (customerRecord, store, type) {

            function getCustomerData(customerRecord, type) {
                var data = {};

                data.customer = {};
                data.email = customerRecord.email;
                data.first_name = customerRecord.firstname;
                data.last_name = customerRecord.lastname;

                if (type.toString() === "create") {
                    data.username = "";
                    data.password = customerRecord.password || "";
                }

                function getDefaultAddresses(customerRecord) {
                    var addresses = customerRecord.addresses;

                    var billingAddress = null;
                    var shippingAddress = null;

                    function getAddress(address, type) {
                        var data = {};

                        data.first_name = address.firstname || "";
                        data.last_name = address.lastname || "";
                        data.company = address.company || "";
                        data.address_1 = address.street1 || "";
                        data.address_2 = address.street2 || "";
                        data.city = address.city || "";
                        data.state = address.region || "";
                        data.postcode = address.postcode || "";
                        data.country = address.country || "";

                        if (type.toString() === "billing") {
                            data.email = "";
                            data.phone = address.telephone || "";
                        }

                        return data;
                    }

                    for (var i in addresses) {
                        var address = addresses[i];

                        var defaultshipping = address.defaultshipping;
                        var defaultbilling = address.defaultbilling;

                        if (shippingAddress === null && defaultshipping.toString() === "T") {
                            shippingAddress = getAddress(address, "shipping");
                        }

                        if (billingAddress === null && defaultbilling.toString() === "T") {
                            billingAddress = getAddress(address, "billing");
                        }

                        if (!!billingAddress && !!shippingAddress) {
                            break;
                        }
                    }

                    return {
                        shippingAddress: shippingAddress || {},
                        billingAddress: billingAddress || {}
                    };
                }

                var defaultAddresses = getDefaultAddresses(customerRecord);

                data.customer.billing_address = defaultAddresses.shippingAddress;
                data.customer.shipping_address = defaultAddresses.billingAddress;

                return data;
            }

            // handling of endpoints for update or create customer
            var httpRequestData = {
                url: 'customers' + (type.toString() === "update" ? "/" + customerRecord.magentoId : ""),
                method: 'POST',
                data: getCustomerData(customerRecord, type)
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

            if (!!serverResponse && serverResponse.order) {
                var customer = parseCustomerResponse(serverResponse.order);

                if (!!customer) {
                    serverFinalResponse.result = customer;
                }
            }

            // If some problem
            if (!serverFinalResponse.status) {
                serverFinalResponse.errorMsg = serverFinalResponse.faultCode + '--' + serverFinalResponse.faultString;
            }

            return serverFinalResponse;
        },
        requiresAddressCall: function () {
            return false;
        },
        upsertCustomerAddress: function () {
            // no need to implement this function for WOO
            // address will be with in the customer create/update call
        }
    };

    //endregion

})();


/*
 {
 "storeId": "1",
 "nsObj": {
 "total": 480,
 "taxtotal": 0,
 "paypalprocess": false,
 "location": {
 "name": "San Francisco",
 "internalid": "2"
 },
 "billingschedule": [
 {
 "billamount": 480,
 "billdate": "10/9/2015"
 }
 ],
 "terms": {
 "name": "Net 30",
 "internalid": "2"
 },
 "entity": {
 "name": "Zeeshan Ahmed Siddiqui",
 "internalid": "2377"
 },
 "billingaddress": {
 "zip": "35005",
 "dropdownstate": {
 "name": "Alabama",
 "internalid": "AL"
 },
 "addr1": "48 Loyang Way #03-00",
 "override": false,
 "addrtext": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "state": "AL",
 "addressee": "Zeeshan Ahmed",
 "custrecord_magento_id": "[{\"StoreId\":\"2\",\"MagentoId\":\"-1\"}]",
 "country": {
 "name": "United States",
 "internalid": "US"
 },
 "city": "California"
 },
 "billzip": "35005",
 "exchangerate": 1,
 "handlingcost": 0,
 "estgrossprofitpercent": "100.0%",
 "shipaddresslist": {
 "name": "48 Loyang Way #03-00",
 "internalid": "246185"
 },
 "tobefaxed": false,
 "shipaddressee": "Zeeshan Ahmed",
 "iladdrbook": [],
 "recordtype": "salesorder",
 "totalcostestimate": 0,
 "shipzip": "35005",
 "billaddressee": "Zeeshan Ahmed",
 "shipcity": "California",
 "shipstate": "AL",
 "custbody_fmt_req_financial_app": false,
 "createddate": "10/9/2015 12:34 am",
 "subtotal": 480,
 "currencyname": "USA",
 "billcountry": {
 "name": "United States",
 "internalid": "US"
 },
 "shipaddr1": "48 Loyang Way #03-00",
 "paypaloverride": false,
 "ismultishipto": false,
 "custbody_fmt_finance_app": false,
 "email": "zahmed@folio3.com",
 "billcity": "California",
 "custbody_magentosyncdev": false,
 "shipaddress": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "tranid": "110121936400",
 "shipcomplete": false,
 "billaddress": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "custbody_fmt_finance_declined": false,
 "custbody_f3mg_magento_store": {
 "name": "Folio3 WOO",
 "internalid": "2"
 },
 "ccapproved": false,
 "currency": {
 "name": "USA",
 "internalid": "1"
 },
 "lastmodifieddate": "10/9/2015 6:42 am",
 "shipmethod": {
 "name": "USPS Parcel Post",
 "internalid": "732"
 },
 "id": "15368",
 "custbody_f3mg_dont_sync_to_magento": false,
 "shippingaddress_text": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "getauth": false,
 "tobeprinted": false,
 "billingaddress_text": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "shipcountry": {
 "name": "United States",
 "internalid": "US"
 },
 "isrecurringpayment": false,
 "trandate": "10/9/2015",
 "billaddresslist": {
 "name": "48 Loyang Way #03-00",
 "internalid": "246185"
 },
 "billstate": "AL",
 "shippingaddress": {
 "zip": "35005",
 "dropdownstate": {
 "name": "Alabama",
 "internalid": "AL"
 },
 "addr1": "48 Loyang Way #03-00",
 "override": false,
 "addrtext": "Zeeshan Ahmed\n48 Loyang Way #03-00 \nCalifornia AL 35005\nUnited States",
 "state": "AL",
 "addressee": "Zeeshan Ahmed",
 "custrecord_magento_id": "[{\"StoreId\":\"2\",\"MagentoId\":\"-1\"}]",
 "country": {
 "name": "United States",
 "internalid": "US"
 },
 "city": "California"
 },
 "giftcertapplied": 0,
 "customform": {
 "name": "Z - Ramsey Sales Order Form - Line GP",
 "internalid": "251"
 },
 "shipdate": "10/11/2015",
 "item": [
 {
 "amount": 480,
 "commitinventory": {
 "name": "Available Qty",
 "internalid": "1"
 },
 "commitmentfirm": false,
 "costestimate": 0,
 "costestimaterate": 0,
 "costestimatetype": {
 "name": "Average Cost",
 "internalid": "AVGCOST"
 },
 "createwo": false,
 "isclosed": false,
 "item": {
 "name": "lumia-430",
 "internalid": "1263"
 },
 "itemisfulfilled": "F",
 "porate": 0,
 "price": {
 "name": "Base Price",
 "internalid": "1"
 },
 "quantity": 2,
 "quantityavailable": 86,
 "quantitycommitted": 2,
 "rate": 240,
 "shipgroup": 1,
 "taxcode": {
 "name": "-Not Taxable-",
 "internalid": "-8"
 }
 }
 ],
 "estgrossprofit": 480,
 "shipgroup": [
 {
 "destinationaddress": "48 Loyang Way #03-00 California AL 35005 United States",
 "destinationaddressref": "246185",
 "handlingrate": 0,
 "handlingtaxamt": 0,
 "handlingtaxcode": {
 "name": "-Not Taxable-",
 "internalid": "-7"
 },
 "id": 1,
 "isfulfilled": "F",
 "shippingmethod": "USPS Parcel Post",
 "shippingmethodref": "732",
 "shippingrate": 0,
 "shippingtaxamt": 0,
 "shippingtaxcode": {
 "name": "-Not Taxable-",
 "internalid": "-7"
 },
 "sourceaddressref": "DEFAULT",
 "weight": 2
 }
 ],
 "billaddr1": "48 Loyang Way #03-00",
 "tobeemailed": false
 },
 "history": "NetSuite Ship Carrier: NONUPS NetSuite Ship Method: USPS%20Parcel%20Post ",
 "status": "B",
 "cancelledMagentoSOId": "",
 "customer": {
 "mode": "customer",
 "customerId": 2,
 "email": "zahmed@folio3.com",
 "firstName": "Zeeshan Ahmed",
 "lastName": "Siddiqui",
 "company": "",
 "street": "",
 "city": "",
 "state": "",
 "stateId": "",
 "country": "",
 "telephone": "",
 "fax": "",
 "isDefaultBilling": "",
 "isDefaultShipping": "",
 "zipCode": "",
 "internalId": 2377,
 "magentoCustid": "[{\"StoreId\":\"2\",\"MagentoId\":2},{\"StoreId\":\"1\",\"MagentoId\":141}]",
 "addresses": [
 {
 "mode": "shipping",
 "isDefaultBilling": "0",
 "isDefaultShipping": "1",
 "firstName": "Zeeshan Ahmed",
 "lastName": "Siddiqui",
 "company": "",
 "fax": "",
 "street": "48 Loyang Way #03-00",
 "telephone": "123-123-1234",
 "attention": "",
 "addressee": "Zeeshan Ahmed",
 "city": "California",
 "state": "Alabama",
 "stateId": "AL",
 "country": "US",
 "zipCode": "35005",
 "addressId": ""
 },
 {
 "mode": "billing",
 "isDefaultBilling": "1",
 "isDefaultShipping": "0",
 "firstName": "Zeeshan Ahmed",
 "lastName": "Siddiqui",
 "company": "",
 "fax": "",
 "street": "48 Loyang Way #03-00",
 "telephone": "123-123-1234",
 "attention": "",
 "addressee": "Zeeshan Ahmed",
 "city": "California",
 "state": "Alabama",
 "stateId": "AL",
 "country": "US",
 "zipCode": "35005",
 "addressId": ""
 }
 ]
 },
 "items": [
 {
 "itemId": "1263",
 "sku": "lumia-430",
 "quantity": "2",
 "price": "240.00",
 "giftInfo": {}
 }
 ],
 "shipmentInfo": {
 "shipmentMethod": "flatrate_flatrate",
 "shipmentCost": 0
 },
 "paymentInfo": {
 "paymentMethod": "checkmo"
 },
 "giftCertificates": []
 }*/