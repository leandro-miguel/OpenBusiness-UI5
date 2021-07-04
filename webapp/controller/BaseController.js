sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"./Formatter"
], function (Controller, JSONModel, MessageBox, Formatter) {
	"use strict";
	return Controller.extend("openBusiness.controller.BaseController", {
		formatter: Formatter,
		onInit: function () {
			
		},

		getModel: function (nameModel) {
			return this.getView().getModel(nameModel);
		},

		getDate: function () {
			return new Date();
		},

		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		callAjaxFunction: function (url, data, method) {
			var userModel = this.getModel("userModel");
			var oUserModel = userModel.getData();

			return new Promise(function (resolved, rejected) {
				$.ajax({
					"url": url,
					"method": method,
					"timeout": 0,
					"headers": {
						"x-api-key": oUserModel.token,
						"Content-Type": "application/json"
					},
					"data": data,
					success: function (data) {
						resolved(data);
					}.bind(this),
					error: function (error) {
						rejected(error);
					}.bind(this)
				});
			}.bind(this));
		},

		openFragment: function (folder, dialogName) {
			if (!this[dialogName]) {
				this[dialogName] = sap.ui.xmlfragment("requisitions.requisitions.view." + folder + "." + dialogName, this);
				this.getView().addDependent(this[dialogName]);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this[dialogName]);
			}

			this[dialogName].open();
		},

		openFragmentAndLoad: function (folder, dialogName, urlServiceID, listProperty, busyProperty, servicoSL, reload = false) {
			
			if (!this[dialogName]) {
				var url = "/destinations/B1Connection/" + urlServiceID;
				var oModelUserData = this.getModel("userModel");
				var oModel = this.getModel("oModel");
				oModel.setProperty(busyProperty, true);
				
				this[dialogName] = sap.ui.xmlfragment("requisitions.requisitions.view." + folder + "." + dialogName, this);
				this.getView().addDependent(this[dialogName]);
				jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this[dialogName]);
				
				var data = {
					"idEmpresa": oModel.getProperty("/idEmpresa"),
					"servicoSL": servicoSL
				};

				var promise = this.callAjaxFunction(url, JSON.stringify(data), "POST");

				promise.then(function (param) {
					oModel.setProperty("/currentPage", "1");
					oModel.setProperty("/skipPage", "0");
					oModel.setProperty(busyProperty, false);
					oModel.setProperty(listProperty, param.value);

					if (param && param.value && param.value.length < 20) { //no next page
						oModel.setProperty("/nextDialogButtonEnabled", false);
					} else {
						oModel.setProperty("/nextDialogButtonEnabled", true);
					}
					
					oModel.setProperty("/previousDialogButtonEnabled", false);
				}.bind(this), function (param) {
					var oBundle = this.getResourceBundle();
					MessageBox.alert(oBundle.getText("systemUnavailable"));
				}.bind(this));
			} else if (reload) {
				this[dialogName].close();
				this[dialogName].destroy();
				this[dialogName] = undefined;
				this.openFragmentAndLoad(folder, dialogName, urlServiceID, listProperty, busyProperty, servicoSL);
			}
			
			this[dialogName].open();
		},

		searchDialog: function (urlServiceID, servicoSL, listProperty, busyProperty) {
			var url = "/destinations/B1Connection/" + urlServiceID;
			var oModel = this.getModel("oModel");
			oModel.setProperty(busyProperty, true);

			var data = {
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": servicoSL
			};

			

			var promise = this.callAjaxFunction(url, JSON.stringify(data), "POST");

			promise.then(function (param) {
				oModel.setProperty("/currentPage", "1");
				oModel.setProperty("/skipPage", "0");
				oModel.setProperty(busyProperty, false);
				oModel.setProperty(listProperty, param.value);

				if (param && param.value && param.value.length < 20) { //no next page
					oModel.setProperty("/previousDialogButtonEnabled", false);
					oModel.setProperty("/nextDialogButtonEnabled", false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},

		nextButtonPress: function (urlServiceID, servicoSL, listProperty, busyProperty) {
			var url = "/destinations/B1Connection/" + urlServiceID;
			var oModel = this.getModel("oModel");
			var skip = oModel.getProperty("/skipPage");
			var skipAux = "";
			oModel.setProperty(busyProperty, true);

			skip = parseInt(skip, 0) + 20;
			
			if (servicoSL.includes("filter") || servicoSL.includes("select")) {
				skipAux = "&$skip=" + skip.toString();
			} else {
				skipAux = "?$skip=" + skip.toString();
			}

			var data = {
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": servicoSL + skipAux
			};

		

			var promise = this.callAjaxFunction(url, JSON.stringify(data), "POST");

			promise.then(function (param) {
				oModel.setProperty("/currentPage", parseInt(oModel.getProperty("/currentPage"), 0) + 1);
				oModel.setProperty("/skipPage", skip);
				oModel.setProperty(busyProperty, false);
				oModel.setProperty(listProperty, param.value);
				oModel.setProperty("/previousDialogButtonEnabled", true);

				if (param && param.value && param.value.length < 20) { //no next page
					oModel.setProperty("/nextDialogButtonEnabled", false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},
		
		previousButtonPress: function (urlServiceID, servicoSL, listProperty, busyProperty) {
			var url = "/destinations/B1Connection/" + urlServiceID;
			var oModel = this.getModel("oModel");
			var skip = oModel.getProperty("/skipPage");
			var skipAux = "";
			oModel.setProperty(busyProperty, true);
			
			skip = parseInt(skip, 0) - 20;

			if (servicoSL.includes("filter") || servicoSL.includes("select")) {
				skipAux = "&$skip=" + skip.toString();
			} else {
				skipAux = "?$skip=" + skip.toString();
			}

			var data = {
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": servicoSL
			};

		

			var promise = this.callAjaxFunction(url, JSON.stringify(data), "POST");

			promise.then(function (param) {
				var currentPage = parseInt(oModel.getProperty("/currentPage"), 0) - 1;

				oModel.setProperty("/currentPage", currentPage);
				oModel.setProperty("/skipPage", skip);
				oModel.setProperty(busyProperty, false);
				oModel.setProperty(listProperty, param.value);
				oModel.setProperty("/nextDialogButtonEnabled", true);

				if (currentPage === 1) {
					oModel.setProperty("/previousDialogButtonEnabled", false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		}
	});
});