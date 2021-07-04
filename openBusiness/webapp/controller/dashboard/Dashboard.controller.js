sap.ui.define([
	"sap/ui/core/mvc/Controller",
    "../BaseController"
], function(
	Controller
) {
	"use strict";

	return Controller.extend("openBusiness.controller.dashboard.Dashboard", {

        onInit: function () {

        },
        navToClient: function (oEvent) {
            
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("RouteCliente", {
                
            });
        }
	});
});