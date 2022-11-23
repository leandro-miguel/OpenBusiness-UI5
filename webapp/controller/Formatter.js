sap.ui.define([
    "sap/ui/core/mvc/Controller",

], function (Controller) {
    "use strict";
    return Controller.extend("openBusiness.controller.Formatter", {

        formatacaoData: function (data) {
            return new Date(data).toLocaleDateString();
        },
        
        Highlight: function (obj) {
            if (obj && obj.CustomerID === 'VINET') {
                return "Indication01";
            } else {
                return "Indication05";
            }
        },

    });

});