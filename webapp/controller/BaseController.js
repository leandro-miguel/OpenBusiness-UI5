sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./Formatter"
], function (Controller, Formatter) {
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