sap.ui.define([
    'sap/ui/Device',
	'sap/ui/core/mvc/Controller',
	'sap/ui/model/json/JSONModel',
    '../BaseController'
], function(
	Device, Controller, JSONModel) {
	"use strict";

	return Controller.extend("openBusiness.controller.dashboard.Dashboard", {

        onInit : function() {
			this.oModel = new JSONModel("oModel");
			this.oModel.loadData(sap.ui.require.toUrl("openBusiness/model/model.json"), null, false);
			this.getView().setModel(this.oModel);
		},

		onItemSelect : function(oEvent) {
			var item = oEvent.getParameter('item');
			this.byId("pageContainer").to(this.getView().createId(item.getKey()));
		},

		onMenuButtonPress : function() {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		navToCreateClient: function (oEvent) {
            
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteCreateCliente", {
                
            });
        },
        navToListClient: function (oEvent) {
            
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteListClient", {
                
            });
        },
		navToCalendar: function (oEvent) {
            
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Calendar", {
                
            });
        },

	});
});