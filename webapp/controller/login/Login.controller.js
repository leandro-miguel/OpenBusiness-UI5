sap.ui.define([
    'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    '../BaseController'
], function(
	Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("openBusiness.controller.login.Login", {
        onInit: function () {
            this.getView().setModel(new JSONModel(), "oModelLogin");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Login").attachPatternMatched(this._onObjectMatched, this);
            //oRouter.getRoute("RouteDetailCreate").attachPatternMatched(this._onObjectMatchedDetail, this);
        },

        _onObjectMatched: function () {

            var oModel = this.getModel("oModelLogin");
            var oBundle = this.getResourceBundle();

            oModel.setProperty("/ViewTitle", oBundle.getText("createClient"));
            this.setDateValues();
        },
	});
});