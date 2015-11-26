/// <reference path="../../_typescript-refs/jquery.d.ts" />
/// <reference path="../../_typescript-refs/es6-promise.d.ts" />

/**
 * Created by zshaikh on 11/19/2015.
 */


class DataManager {

    private _serverUrl = null;
    private _type:string;

    constructor(type:string){
        this._type = type;
    }

    private getServerUrl () {

        if (!this._serverUrl) {
            this._serverUrl = window.apiSuiteletUrl;
            this._serverUrl += '&type=' + this._type; // append type
        }

        return this._serverUrl;
    }


    private getVendorsFromServer(callback) {

        var suiteletUrl = this.getServerUrl();

        return jQuery.get(suiteletUrl, {'action': 'get_vendors'}, function (result) {
            console.log('getPartners(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }

    private getEmployeesFromServer(callback) {

        var suiteletUrl = this.getServerUrl();

        return jQuery.get(suiteletUrl, {'action': 'get_employees'}, function (result) {
            console.log('get_employees(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }


    private getDepartmentFromServer(callback) {

        var suiteletUrl = this.getServerUrl();

        return jQuery.get(suiteletUrl, {'action': 'get_departments'}, function (result) {
            console.log('get_departments(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }


    private getPriceLevelsFromServer(callback) {

        var suiteletUrl = this.getServerUrl();

        return jQuery.get(suiteletUrl, {'action': 'get_pricelevels'}, function (result) {
            console.log('get_departments(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }


    /**
     * Description of method DataManager
     * @param parameter
     */
    getItems (params, callback) {
        try {

            var suiteletUrl = this.getServerUrl();

            var options = {
                'action': 'get_items'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(suiteletUrl, options, function (result) {
                console.log('getItems(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    }


    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    getVendors (callback) {

        var cacheKey = 'partners';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getVendorsFromServer(function (data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    }

    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    getEmployees (callback) {

        var cacheKey = 'employees';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
        }
        else {
            return this.getEmployeesFromServer(function (data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    }


    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    getPriceLevels (callback?) : Promise<any> {

        var cacheKey = 'price_levels';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {

            var promise = new Promise<any>((resolve, reject) => {
                resolve(data);
            });

            callback && callback(data);
            return promise;
        }
        else {
            return this.getPriceLevelsFromServer(function (data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    }



    /**
     * Get Partners from server
     * @param callback {function} the callback function to invoke when data is fetched
     * @returns {obj[]} returns an array of object of partner
     */
    getDepartment (callback) {

        var cacheKey = 'departments';
        var data = $.jStorage.get(cacheKey);

        if (!!data) {
            callback && callback(data);
            return data;
        }
        else {
            return this.getDepartmentFromServer(function (data) {

                $.jStorage.set(cacheKey, data);

                callback && callback(data);
            });
        }

    }

    /**
     * Description of method DataManager
     * @param parameter
     */
    getPrimaryContacts (params, callback) {
        try {

            var suiteletUrl = this.getServerUrl();

            var options = {
                'action': 'get_contacts'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(suiteletUrl, options, function (result) {
                console.log('getPrimaryContacts(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getPrimaryContacts()', e.toString());

            callback && callback(null);
        }
    }

    /**
     * Description of method DataManager
     * @param parameter
     */
    getCustomers (params, callback) {
        try {

            var suiteletUrl = this.getServerUrl();

            var options = {
                'action': 'get_customers'
            };

            var filters = {
                'params': JSON.stringify(params)
            };

            $.extend(options, filters);

            return jQuery.get(suiteletUrl, options, function (result) {
                console.log('getCustomers(); // jquery complete: ', arguments);

                callback && callback(result);

            });

        } catch (e) {
            console.error('ERROR', 'Error during main DataManager.getCustomers()', e.toString());

            callback && callback(null);
        }
    }




    submit(data, callback){

        var suiteletUrl = this.getServerUrl();
        var options = {
            'action': 'submit'
        };

        $.extend(options, {'params': JSON.stringify(data)});

        return jQuery.post(suiteletUrl, options, function (result) {
            console.log('submit(); // jquery complete: ', arguments);

            callback && callback(result);

        });

    }
}