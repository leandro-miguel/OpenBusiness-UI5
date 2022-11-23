sap.ui.define([
	"../BaseController",
    "sap/ui/model/json/JSONModel",
    "../Formatter",
    "sap/m/MessageBox",
],function (Controller, JSONModel, Formatter, MessageBox) {
    "use strict";

    return Controller.extend("openBusiness.controller.cliente.List",  {
        formatter: Formatter,
			
			onInit: function () {
			
				this.getView().setModel(new JSONModel(), "oModelClientList");
				
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteListClient").attachPatternMatched(this.onBeforeRendering, this);
			},

			onBeforeRendering:function(){
		
				var oModel = this.getModel("oModelClientList");
				var oBundle = this.getResourceBundle();	
				//Pegando a Imagem
				// let svgLogo = sap.ui.require.toUrl("openBusiness/images/ui5.png");
				// oModel.setProperty("/svgLogo", svgLogo); 

				oModel.setProperty("/Title", oBundle.getText("client"));
			},

			onSearch: async function () {
				
				var oModel = this.getModel("oModelClientList");
				oModel.setProperty("/clientsBusy", true);
				//var aFilter = this.getFilters(oModel);

				var url = "https://api-erp-tg.herokuapp.com/cliente"
				
				var promise = this.callAjaxFunctionTcc(url, "GET");

				promise.then(function (param) {
					if (param) {
						oModel.setProperty("/clients", param);
						oModel.setProperty("/clientsBusy", false);
					} else {
						if (param.error) {
							MessageBox.alert(param.error.message.value);
						} else {
						MessageBox.alert("É preciso inserir a empresa!");
						//MessageBox.alert(param);
						}
						oModel.setProperty("/orderItemsBusy", false);
					}

					oModel.setProperty("/currentPageTable", "1");
					oModel.setProperty("/skipPageTable", "0");

					if (param && param.length < 20) { //no next page
						oModel.setProperty("/nextTableButtonEnabled", false);
					} else {
						oModel.setProperty("/nextTableButtonEnabled", true);
					}
					oModel.setProperty("/previousTableButtonEnabled", false);
				}.bind(this), function (param) {
					var oBundle = this.getResourceBundle();
					MessageBox.alert(oBundle.getText("systemUnavailable"));
					oModel.setProperty("/orderItemsBusy", false);
				}.bind(this));

				
			},

			aFilter: function(){
				var filters = "";
				var oBundle = this.getResourceBundle();
				var oModel = this.getModel("oModelClientList");
				var name = oModel.getProperty("/nameFilter");
	
				// Filtro de Filial
				if (name) {
					filters += "U_Filial eq '" + oModel.getProperty("/branchFilter") + "' and ";
				}

				filters += "U_Usuario eq '" + oModelUserData.getProperty("/userId") + "'and U_Tipo_docu eq 'PED'";
	
				return filters;
			},
	

			navToDetail: function (oEvent) {

				var sPath = oEvent.getSource().getSelectedContextPaths()[0];

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteDetalhe", {
					path: sPath.substring(1)
				});
			},

			navBack: function () {
				window.history.go(-1);
			},
		});
	});
