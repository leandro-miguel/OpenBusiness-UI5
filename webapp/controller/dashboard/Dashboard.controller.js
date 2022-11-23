sap.ui.define([
	'../BaseController',
    'sap/ui/Device',
	'sap/ui/model/json/JSONModel',
], function(Controller, Device, JSONModel) {
	"use strict";

	return Controller.extend("openBusiness.controller.dashboard.Dashboard", {

        onInit : function() {
		
			this.getView().setModel(new JSONModel(), "oModelDashboard");
			this.getView().setModel(new JSONModel(), "oModel");
			
			var oModel = this.getModel("oModelDashboard");
			
			oModel.loadData(sap.ui.require.toUrl("openBusiness/model/model.json"), null, false);
			
			this.getView().setModel(oModel);

			this.teste();
		},

		teste:function(){
			var oModel = this.getModel("oModel");
			oModel.setProperty("/visible", true);
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

		
		navToEnter: function(oEvent){
			var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Login", {
                
            });
		},

		onNavRegister: function(){
   
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("Register", {
                
            });
        },

	});
});