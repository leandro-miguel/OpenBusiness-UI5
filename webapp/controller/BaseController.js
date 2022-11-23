sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./Formatter"
], function (Controller, MessageBox, Formatter) {
	"use strict";
	return Controller.extend("openBusiness.controller.BaseController", {
		formatter: Formatter,
		onInit: function () {
			
		},

		getModel: function (nameModel) {
			return this.getView().getModel(nameModel);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
	});
});