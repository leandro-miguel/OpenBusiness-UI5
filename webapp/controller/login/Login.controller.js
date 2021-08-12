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
            this.getView().setModel(new JSONModel(), "oModelCreateLogin");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Login").attachPatternMatched(this._onObjectMatched, this);
            //oRouter.getRoute("RouteDetailCreate").attachPatternMatched(this._onObjectMatchedDetail, this);
        },

        _onObjectMatched: function () {

            var oModel = this.getModel("oModelCreateLogin");
            var oBundle = this.getResourceBundle();

            oModel.setProperty("/ViewTitle", oBundle.getText("createClient"));
            this.setDateValues();
        },

        _modelData: {
			selectEnabled: true,
			colorSet: "ColorSet5",
			shades: [
				CellColorShade.ShadeA,
				CellColorShade.ShadeB,
				CellColorShade.ShadeC,
				CellColorShade.ShadeD,
				CellColorShade.ShadeE,
				CellColorShade.ShadeF

			],
			contrastCells: []
		},

		_fillModel: function (oData) {
			var oModel = this.getView().getModel();
			oModel.setData(oData);
		},

		handleChecked: function (oEvent) {
			var bChecked = oEvent.getParameter("selected");

			if (bChecked) {
				this._fillModel(this._modelData);
			} else {
				this._modelData = this.getView().getModel().getData();
				this._fillModel({ selectEnabled: false });
			}
		},

		handleContrastCellSelection: function (oEvent) {
			var oView = this.getView(),
				oItem = oEvent.getParameter("changedItem"),
				bSelected = oEvent.getParameter("selected"),
				oBLCell = oView.byId(oItem.getKey());

			if (!oBLCell) {
				return;
			}

			if (bSelected) {
				oBLCell.addStyleClass("sapContrast").addStyleClass("sapContrastPlus");
			} else {
				oBLCell.removeStyleClass("sapContrast").removeStyleClass("sapContrastPlus");
			}
		}


	});
});