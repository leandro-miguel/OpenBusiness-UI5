sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History"
], function (Controller, JSONModel, History) {
    "use strict";
    return Controller.extend("openBusiness.controller.cliente.Detalhe", {

        onInit: function () {
            var model = new JSONModel();

            this.getView().setModel(model, "oModelDetalheCliente");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.getRoute("RouteDetalheCliente").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {

            var sPath = oEvent.getParameter("arguments").path; //peguei os parametros que vieram da rota, o caminho que eu quero nesse caso

            var oDataModel = this.getView().getModel(); //peguei minha oDataModel

            var objDetail = oDataModel.getProperty("/" + sPath); //Me da as propriedades do /sPath e armazena no objOrders

            var oJsonModel = this.getView().getModel("oModelDetalheCliente");

            oJsonModel.setProperty("/objDetail", objDetail); //Minha model terá um propriedade objDetail
        },
    });
});