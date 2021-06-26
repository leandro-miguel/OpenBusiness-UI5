sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"./Formatter"
], function (Controller, JSONModel, MessageBox, Formatter) {
	"use strict";

	return Controller.extend("requisitions.requisitions.controller.BaseController", {
		formatter: Formatter,
		
		onInit: function () {

		},
		
		getUserInfo: function () {
			var userModel = this.getModel("userModel");
			var oModel = this.getModel("oModel");		
			oModel.setProperty("/companySelectBusy", true);	
			
			var _userInfoRetrieve = function onCompleted(oEvent) {
				if (oEvent.getParameter("success")) {
					var obj = oEvent.getSource();
					
					var userEmail = obj.getData().email;
					
					if (userEmail) {
						userModel.setProperty("/userId", userEmail.split("@")[0]);
						userModel.setProperty("/company", userEmail.split("@")[1].toUpperCase());
					}
					
					if (obj.getData().employeenumber !== undefined) {
						//Azure AD Login
						userModel.setProperty("/userId", obj.getData().employeenumber);
						userModel.setProperty("/company", obj.getData().userId.split("@")[1].toUpperCase());
					}

					this.loginConnection("CONSULTA", oModel);
				} else {
					//this.userError();
				}
			}.bind(this);
			userModel.loadData("/services/userapi/attributes");
			userModel.attachRequestCompleted(_userInfoRetrieve.bind(this));
		},
		
		loginConnection: function (type, oModel) {
			
			var url = "/destinations/B1Connection/login";
			var userModel = this.getModel("userModel");
			var oUserModel = userModel.getData();

			oModel.setProperty("/companySelectBusy", true);
			
			$.ajax({
				"url": url,
				"method": "POST",
				"timeout": 0,
				"headers": {
					"x-api-key": oUserModel.token,
					"Content-Type": "application/json"
				},
				"data": JSON.stringify({
					"Usuario": oUserModel.userId,
					"Cliente": oUserModel.company,
					"Tipo": type
				}),
				success: function (data) {
					//get company list and 
					if (data[0].IdEmpresas !== undefined) {
						userModel.setProperty("/division", data[0].Perfil);
						
						var companyData = [];
						for (var i = 0; i < data.length; i++) {
							if (data[i].Filiais.length > 0) {
								companyData.push(data[i]);
							}
						}

						oModel.setProperty("/Companies", companyData);
						oModel.setProperty("/companySelectBusy", false);
					} else {
						MessageBox.alert(this.getModel("i18n").getResourceBundle().getText("updateUser"));
					}
				}.bind(this),
				error: function (error) {
					MessageBox.alert(this.getModel("i18n").getResourceBundle().getText("systemUnavailable"));
					// this.setBusy(false);
				}.bind(this)
			});
		},

		updateUserData: function (oEvt) {
			var oModel = this.getModel("oModel");
			this.loginConnection("INICIAL", oModel);
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