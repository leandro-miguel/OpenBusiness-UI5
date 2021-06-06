sap.ui.define([
    "sap/ui/core/mvc/Controller",

], function (Controller) {
    "use strict";
    return Controller.extend("treinamentoseidor2021.controller.formatter", {

        //o order date do xml vai cair dentro do parametro data 
        formatacaoData: function (data) {
            return new Date(data).toLocaleDateString();
        },

        //Essa funçao faz com que posso formatar a coluna.
        Highlight: function (obj) {
            if (obj && obj.CustomerID === 'VINET') {
                return "Indication01";
            } else {
                return "Indication05";
            }
        },

    });

});