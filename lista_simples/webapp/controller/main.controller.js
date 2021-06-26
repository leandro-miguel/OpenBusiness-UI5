sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'./formatter.controller',
],
	function (JSONModel, Filter, FilterOperator, formatter) {
		"use strict";

		return formatter.extend("treinamentoseidor2021.controller.main", {
			onInit: function () {
				var model = new JSONModel(); 

				this.getView().setModel(model, "oModelList"); 

				//Pegando a Imagem
				let svgLogo = sap.ui.require.toUrl("treinamentoseidor2021/images/sap-logo.svg");
				model.setProperty("/svgLogo", svgLogo); 
			},

			onSearch: async function (oEvent) {
				var model = this.getView().getModel("oModelList");

				let filterValue = model.getProperty("/filtro1");

				var array = [];

				if (filterValue && filterValue.length > 0) { 
					var objFilter = new Filter("CustomerID", FilterOperator.EQ, filterValue);
					array.push(objFilter);
				}

				var table = this.getView().byId("idTable");

				table.bindItems({
					path: "/Orders",
					filters: array,
					template: this.getView().byId("ColumnListItem"),
					templateShareable: true
				});
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
