sap.ui.define(
    [
        "sap/ui/base/Object",
    ],
    function (Object) {
        "use strict";
        return Object.extend("openBusiness.model.CreateModel", {
            
            constructor: function () {
                
            },

            callAjaxFunction: function (token, data) {
                
                const url = "https://api-erp-tg.herokuapp.com/cliente";

                return new Promise(function (resolved, rejected) {
                    $.ajax({
                        "url": url,
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "x-api-key": token,
                            "Content-Type": "application/json"
                        },
                        "data": data,
                        success: function (data) {
                            resolved(data);
                        }.bind(this),
                        error: function (error) {
                            rejected(error);
                        }.bind(this)
                    });
                }.bind(this));
            },

            callAjaxFunctionTcc: function (url, method) {
                debugger
                const userModel = this.getModel("userModel");
                const oUserModel = userModel.getData();
    
                return new Promise(function (resolved, rejected) {
                    $.ajax({
                        "url": url,
                        "method": method,
                        "timeout": 0,
                        "headers": {
                            "x-api-key": oUserModel.token,
                            "Content-Type": "application/json"
                        },
                        success: function (param) {
                            resolved(param);
                        }.bind(this),
                        error: function (error) {
                            rejected(error);
                        }.bind(this)
                    });
                }.bind(this));
            },
        });
    }
);