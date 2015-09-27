/**
 * Created by smehmood on 2/16/2015.

 /**
 * F3_Itemprice_Utility class that has the functionality of getting item price
 */
var F3_Itemprice_Utility = (function() {
    return {
        MULTICURRENCY_FEATURE: nlapiGetContext().getFeature('MULTICURRENCY'),
        MULTIPRICE_FEATURE: nlapiGetContext().getFeature('MULTPRICE'),
        QUANTITYPRICING_FEATURE: nlapiGetContext().getFeature('QUANTITYPRICING'),
        getPrice: function(itemRecord, currencyInternalId, priceLevelInternalId, quantity) {
            try {
                var price;
                var lineNo;
                var qty1;
                var qty2;
                var qty3;
                var qty4;
                var priceFound = false;
                //No Feature Enabled
                if (!this.MULTICURRENCY_FEATURE && !this.MULTIPRICE_FEATURE && !this.QUANTITYPRICING_FEATURE) {
                    price = itemRecord.getFieldValue('rate');
                } else if (this.MULTICURRENCY_FEATURE && !this.MULTIPRICE_FEATURE && !this.QUANTITYPRICING_FEATURE) {
                    if (!!currencyInternalId) {
                        lineNo = itemRecord.findLineItemValue('price', 'currency', currencyInternalId);
                        if (!!lineNo) price = itemRecord.getLineItemValue('price', 'price', lineNo);
                    }
                } else if (!this.MULTICURRENCY_FEATURE && !this.MULTIPRICE_FEATURE && !this.QUANTITYPRICING_FEATURE) {
                    if (!!priceLevelInternalId) {
                        lineNo = itemRecord.findLineItemValue('price', 'pricelevel', priceLevelInternalId);
                        price = itemRecord.getLineItemValue('price', 'price_1_', lineNo);
                    }
                } else if (!this.MULTICURRENCY_FEATURE && !this.MULTIPRICE_FEATURE && this.QUANTITYPRICING_FEATURE) {
                    qty1 = itemRecord.getFieldValue('pricequantity2');
                    qty2 = itemRecord.getFieldValue('pricequantity3');
                    qty3 = itemRecord.getFieldValue('pricequantity4');
                    qty4 = itemRecord.getFieldValue('pricequantity5');
                    if (!!quantity) {
                        if (!!qty4) {
                            if (quantity > parseFloat(qty4)) {
                                price = itemRecord.getLineItemValue('price', 'price_5_', 1);
                                priceFound = true;
                            }
                        }
                        if (!!qty3 && !priceFound) {
                            price = itemRecord.getLineItemValue('price', 'price_4_', 1);
                            priceFound = true;
                        }
                        if (!!qty2) {
                            price = itemRecord.getLineItemValue('price', 'price_3_', 1);
                            priceFound = true;
                        }
                        if (!!qty1) {
                            price = itemRecord.getLineItemValue('price', 'price_2_', 1);
                            priceFound = true;
                        }
                    } else {
                        price = itemRecord.getLineItemValue('price', 'price_1_', 1);
                    }
                } else if (!this.MULTICURRENCY_FEATURE && this.MULTIPRICE_FEATURE && this.QUANTITYPRICING_FEATURE) {
                    if (!!priceLevelInternalId) {
                        lineNo = itemRecord.findLineItemValue('price', 'pricelevel', priceLevelInternalId);
                        if (!!lineNo) {
                            qty1 = itemRecord.getFieldValue('pricequantity2');
                            qty2 = itemRecord.getFieldValue('pricequantity3');
                            qty3 = itemRecord.getFieldValue('pricequantity4');
                            qty4 = itemRecord.getFieldValue('pricequantity5');
                            if (!!quantity) {
                                if (!!qty4) {
                                    if (quantity > parseFloat(qty4)) {
                                        price = itemRecord.getLineItemValue('price', 'price_5_', lineNo);
                                        priceFound = true;
                                    }
                                }
                                if (!!qty3 && !priceFound) {
                                    price = itemRecord.getLineItemValue('price', 'price_4_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty2) {
                                    price = itemRecord.getLineItemValue('price', 'price_3_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty1) {
                                    price = itemRecord.getLineItemValue('price', 'price_2_', lineNo);
                                    priceFound = true;
                                }
                            } else {
                                price = itemRecord.getLineItemValue('price', 'price_1_', lineNo);
                            }
                        }
                    }
                } else if (this.MULTICURRENCY_FEATURE && !this.MULTIPRICE_FEATURE && this.QUANTITYPRICING_FEATURE) {
                    if (!!currencyInternalId) {
                        var lineNo = itemRecord.findLineItemValue('price', 'currency', currencyInternalId);
                        if (!!lineNo) {
                            qty1 = itemRecord.getFieldValue('pricequantity2');
                            qty2 = itemRecord.getFieldValue('pricequantity3');
                            qty3 = itemRecord.getFieldValue('pricequantity4');
                            qty4 = itemRecord.getFieldValue('pricequantity5');
                            if (!!quantity) {
                                if (!!qty4) {
                                    if (quantity > parseFloat(qty4)) {
                                        price = itemRecord.getLineItemValue('price', 'price_5_', lineNo);
                                        priceFound = true;
                                    }
                                }
                                if (!!qty3 && !priceFound) {
                                    price = itemRecord.getLineItemValue('price', 'price_4_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty2) {
                                    price = itemRecord.getLineItemValue('price', 'price_3_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty1) {
                                    price = itemRecord.getLineItemValue('price', 'price_2_', lineNo);
                                    priceFound = true;
                                }
                            } else {
                                price = itemRecord.getLineItemValue('price', 'price_1_', lineNo);
                            }
                        }
                    }
                } else if (this.MULTICURRENCY_FEATURE && this.MULTIPRICE_FEATURE && !this.QUANTITYPRICING_FEATURE) {
                    if (!!currencyInternalId && !!priceLevelInternalId) {
                        lineNo = itemRecord.findLineItemValue('price' + currencyInternalId, 'pricelevel', priceLevelInternalId);
                        price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_1_', lineNo);
                    }
                } else if (this.MULTICURRENCY_FEATURE && this.MULTIPRICE_FEATURE && this.QUANTITYPRICING_FEATURE) {
                    if (!!currencyInternalId && !!priceLevelInternalId) {
                        lineNo = itemRecord.findLineItemValue('price' + currencyInternalId, 'pricelevel', priceLevelInternalId.toString());
                        if (!!lineNo) {
                            qty1 = itemRecord.getFieldValue('pricequantity2');
                            qty2 = itemRecord.getFieldValue('pricequantity3');
                            qty3 = itemRecord.getFieldValue('pricequantity4');
                            qty4 = itemRecord.getFieldValue('pricequantity5');
                            if (!!quantity) {
                                if (!!qty4) {
                                    if (quantity > parseFloat(qty4)) {
                                        price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_5_', lineNo);
                                        priceFound = true;
                                    }
                                }
                                if (!!qty3 && !priceFound) {
                                    price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_4_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty2) {
                                    price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_3_', lineNo);
                                    priceFound = true;
                                }
                                if (!!qty1) {
                                    price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_2_', lineNo);
                                    priceFound = true;
                                }
                            } else {
                                price = itemRecord.getLineItemValue('price' + currencyInternalId, 'price_1_', lineNo);
                            }
                        }
                    }
                }
                return price;
            } catch (ex) {
                nlapiLogExecution('debug', 'Msg', ex.toString());
            }
        }
    };
})();