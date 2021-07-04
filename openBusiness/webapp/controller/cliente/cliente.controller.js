sap.ui.define([
	"../BaseController",
    "sap/ui/model/json/JSONModel",
    "../Formatter",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/ui/core/Core"
],function (Controller, JSONModel, Formatter, MessageBox, Dialog, DialogType, Button, ButtonType, Label, Text, TextArea, Core) {
    "use strict";

    return Controller.extend("openBusiness.controller.cliente.cliente",  {
        formatter: Formatter,
			
			onInit: function () {
			
				this.getView().setModel(new JSONModel(), "oModelClientList");
				
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteCliente").attachPatternMatched(this.onBeforeRendering, this);
				// oRouter.getRoute("RouteDetailOrder").attachPatternMatched(this._onObjectMatchedDetail, this);
			},

			onBeforeRendering:function(){
		
				var oModel = this.getModel("oModelClientList");
				var oBundle = this.getResourceBundle();	
				//Pegando a Imagem
				let svgLogo = sap.ui.require.toUrl("openBusiness/images/ui5.png");
				oModel.setProperty("/svgLogo", svgLogo); 

				oModel.setProperty("/Title", oBundle.getText("client"));
			},

			onSearch: async function () {
				debugger
				
				var oModel = this.getModel("oModelClientList");
            	var oModelGeral = this.getModel("oModel");
				oModel.setProperty("/clientsBusy", true);
				//var aFilter = this.getFilters(oModel);

				var url = "https://api-erp-tg.herokuapp.com/cliente"
				var body = JSON.stringify({
					// "idEmpresa": oModelGeral.getProperty("/idEmpresa"),
					// "servicoSL": "sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=" + aFilter
				});

				var promise = this.callAjaxFunction(url, body, "GET");

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

					if (param && param.value && param.value.length < 20) { //no next page
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

			navToDetail: function (oEvent) {

				var sPath = oEvent.getSource().getSelectedContextPaths()[0];

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteDetalhe", {
					path: sPath.substring(1)
				});
			},
		});
	});
