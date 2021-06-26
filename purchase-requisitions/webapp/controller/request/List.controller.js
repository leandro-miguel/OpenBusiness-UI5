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
	"sap/ui/core/Core",
	"sap/ui/core/library"
], function (Controller, JSONModel, Formatter, MessageBox, Dialog, DialogType, Button, ButtonType, Label, Text, TextArea, Core, coreLibrary) {
	"use strict";

	return Controller.extend("requisitions.requisitions.controller.request.List", {
		formatter: Formatter,

		onInit: function () {
			this.getView().setModel(new JSONModel(), "oModelListRequest");
		},

		onBeforeRendering: function () {
			var oModel = this.getModel("oModelListRequest");

			if (!oModel.getProperty("/companySelected")) {
				oModel.setProperty("/Enabled", false);
				oModel.setProperty("/approvalDivisionVisible", false);
			}
		},

		// --------------------------------------------------------
		// -------------- onCompanySelect routine------------------
		// --------------------------------------------------------
		onCompanySelect: function (oEvent) {
			var idEmp = oEvent.getParameter("selectedItem").getProperty("key"),
				oModel = this.getModel("oModelListRequest"),
				oModelGeral = this.getModel("oModel");

			oModelGeral.setProperty("/idEmpresa", idEmp);
			oModel.setProperty("/idEmpresa", idEmp);
			oModel.setProperty("/companySelected", true);
			
			this.setCountry(idEmp); // Preenche o país baseado na empresa selecionada
			this.setBranches(idEmp); // Preenche as Filiais baseado na empresa selecionada
			this.setApprovalTypeComboBox(oModel); // Preenche os comboBox de aprovação
			this.getPerfil(oModel, idEmp); // Verifica o perfil e habilita campos correspondentes ao perfil
			
			oModel.setProperty("/Enabled", true); // Habilta os campos a serem modificados pelo usuário
		},
		

		getPerfil: function (oModel, idEmp) {
			var oModelCompanies = this.getModel("oModel");
			var data = oModelCompanies.getProperty("/Companies");

			for (var i = 0; i < data.length; i++) {
				if (data[i].IdEmpresas === idEmp) {
					if (data[i].Perfil == "Solicitante") {
						oModel.setProperty("/approvalDivisionVisible", false);
					}

					if (data[i].Perfil == "Aprovador") {
						oModel.setProperty("/approvalDivisionVisible", true);
					}
				}
			}
		},

		setCountry: function (idEmp) {
			var oModelCompanies = this.getModel("oModel");
			var data = oModelCompanies.getProperty("/Companies");

			for (var i = 0; i < data.length; i++) {
				if (data[i].IdEmpresas == idEmp) {
					oModelCompanies.setProperty("/Country", data[i].Pais);
				}
			}
		},

		setBranches: function (idEmp) {
			var oModelCompanies = this.getModel("oModel");
			var data = oModelCompanies.getProperty("/Companies");

			for (var i = 0; i < data.length; i++) {
				if (data[i].IdEmpresas === idEmp) {
					data[i].Filiais.push({
						idFilial: "",
						nomeFilial: ""
					}); // Linha vazia para usuário poder tirar a seleção
					oModelCompanies.setProperty("/Branches", data[i].Filiais);
				}
			}
		},

		setApprovalTypeComboBox: function (oModel) {
			var oBundle = this.getResourceBundle();
			var approvalTypeData = [];

			approvalTypeData.push({
				status: ""
			});
			approvalTypeData.push({
				status: oBundle.getText("pending")
			});
			approvalTypeData.push({
				status: oBundle.getText("approved")
			});
			approvalTypeData.push({
				status: oBundle.getText("rejected")
			});

			oModel.setProperty("/approvalType", approvalTypeData);
		},

		// --------------------------------------------------------
		// --------------------- MultiInput -----------------------
		// --------------------------------------------------------

		onReqNumHelpRequest: function () {
			var oModelUserData = this.getModel("userModel");

			this.openFragmentAndLoad("fragments_help", "ReqNumHelpDialog", "requisicaobuscar", "/RequisitionsList", "/RequisitionsListBusy",
				"sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=U_Usuario eq '" + oModelUserData.getProperty("/userId") +
				"' and U_Tipo_docu eq 'REQ'");
		},

		onReqNumHelpSearch: function (oEvent) {
			var oModelUserData = this.getModel("userModel");
			var sQuery = oEvent.getSource().getValue();
			var servicoSL = "sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=U_Usuario eq '" + oModelUserData.getProperty(
				"/userId") + "' and U_Tipo_docu eq 'REQ'";

			if (sQuery && sQuery.replace(/\s/g, "") !== "") {
				var upperCase = sQuery.toUpperCase();
				var lowerCase = sQuery.toLowerCase();
				var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
				servicoSL = servicoSL + " and (substringof(U_Nume_docu, '" + upperCase + "') or substringof(U_Nume_docu, '" + lowerCase +
					"') or substringof(U_Nume_docu, '" + nameString + "'))";
			}

			this.searchDialog("requisicaobuscar",
				servicoSL,
				"/RequisitionsList",
				"/RequisitionsListBusy");
		},

		onReqNumHelpSave: function (oEvent) {
			var oList = sap.ui.getCore().byId("reqNumList");

			if (oList.getSelectedItems() && oList.getSelectedItems().length > 0) {
				var oModel = this.getModel("oModelListRequest");
				var aux = [];

				oList.getSelectedItems().forEach(function (item) {
					aux.push({
						key: item.getTitle(),
						text: item.getTitle()
					});
				});

				oModel.setProperty("/reqNumTokens", aux);
			}

			oList.removeSelections();
			this.ReqNumHelpDialog.close();
		},

		onReqNumHelpPrevious: function (oEvent) {
			var oModelUserData = this.getModel("userModel");

			this.previousButtonPress("requisicaobuscar",
				"sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=U_Usuario eq '" + oModelUserData.getProperty("/userId") +
				"' and U_Tipo_docu eq 'REQ'",
				"/RequisitionsList",
				"/RequisitionsListBusy");
		},

		onReqNumHelpNext: function (oEvent) {
			var oModelUserData = this.getModel("userModel");

			this.nextButtonPress("requisicaobuscar",
				"sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=U_Usuario eq '" + oModelUserData.getProperty("/userId") +
				"' and U_Tipo_docu eq 'REQ'",
				"/RequisitionsList",
				"/RequisitionsListBusy");
		},

		onReqNumHelpClose: function (oEvent) {
			this.ReqNumHelpDialog.close();
		},

		onUserMultiHelpRequest: function () {
			//var oModelUserData = this.getModel("userModel");

			this.openFragmentAndLoad("fragments_help", "UserMultiHelpDialog", "usuario", "/UserList", "/userListDialogBusy",
			"Users?$select=UserCode,UserName&$filter=Group ne 'ug_Deleted' and Locked eq 'tNO'");
		},

		onUserMultiHelpSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			var service = "Users?$select=UserCode,UserName&$filter=(substringof('" + sQuery + "', UserName) or substringof('" + sQuery +
            "', UserCode) and Group ne 'ug_Deleted' and Locked eq 'tNO'";

			if (sQuery != "") {
				var upperCase = sQuery.toUpperCase();
				var lowerCase = sQuery.toLowerCase();
				var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
				service = service + " or substringof('" + upperCase + "', UserCode) or substringof('" + lowerCase +
					"', UserName) or substringof('" + nameString + "', UserCode) or substringof('" + lowerCase + "', UserCode))";
			} else {
				service = "Users?$select=UserCode,UserName&$filter=Group ne 'ug_Deleted' and Locked eq 'tNO'";
			}

			this.searchDialog("usuario",
				service,
				"/UserList",
				"/userListDialogBusy");
		},

		onUserMultiHelpSave: function (oEvent) {
			var oList = sap.ui.getCore().byId("userMultiList");

			if (oList.getSelectedItems() && oList.getSelectedItems().length > 0) {
				var oModel = this.getModel("oModelListRequest");
				var aux = [];

				oList.getSelectedItems().forEach(function (item) {
					aux.push({
						key: item.getTitle(),
						text: item.getTitle()
					});
				});

				oModel.setProperty("/userTokens", aux);
			}

			oList.removeSelections();
			this.UserMultiHelpDialog.close();
		},

		onUserMultiHelpPrevious: function (oEvent) {
			this.previousButtonPress("usuario",
			"Users?$select=UserCode,UserName&$filter=Group ne 'ug_Deleted' and Locked eq 'tNO'",
				"/UserList",
				"/userListDialogBusy");
		},

		onUserMultiHelpNext: function (oEvent) {
			this.nextButtonPress("usuario",
			"Users?$select=UserCode,UserName&$filter=Group ne 'ug_Deleted' and Locked eq 'tNO'",
				"/UserList",
				"/userListDialogBusy");
		},

		onUserMultiHelpClose: function (oEvent) {
			this.UserMultiHelpDialog.close();
		},

		onEmployeeMultiHelpRequest: function () {
		
			var oModelUserData = this.getModel("userModel");

			this.openFragmentAndLoad("fragments_help", "EmployeeMultiHelpDialog", "colaboradores", "/EmployeeList", "/employeeListDialogBusy",
			"EmployeesInfo?$select=EmployeeID,FirstName,LastName,Active&$filter=Active eq 'tYES'");
		},

		onEmployeeMultiHelpSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
			var service = "EmployeesInfo?$select=EmployeeID,FirstName,LastName,Active&$filter=Active eq 'tYES' and (substringof('" + sQuery + "', FirstName)";
			//var service = "EmployeesInfo?$filter=(substringof('" + sQuery + "', FirstName)";

			if (sQuery != "") {
				var upperCase = sQuery.toUpperCase();
				var lowerCase = sQuery.toLowerCase();
				var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
				service = service + " or substringof('" + upperCase + "', FirstName) or substringof('" + lowerCase +
					"', FirstName) or substringof('" + nameString + "', FirstName) or substringof('" + upperCase + "', EmployeeID))";
			} else {
				service = "EmployeesInfo?$select=EmployeeID,FirstName,LastName,Active&$filter=Active eq 'tYES'";
			}

			this.searchDialog("colaboradores",
				service,
				"/EmployeeList",
				"/employeeListDialogBusy");
		},

		onEmployeeMultiHelpSave: function (oEvent) {
		
			var oList = sap.ui.getCore().byId("employeeMultiList");

			if (oList.getSelectedItems() && oList.getSelectedItems().length > 0) {
				var oModel = this.getModel("oModelListRequest");
				var aux = [];

				oList.getSelectedItems().forEach(function (item) {
					aux.push({
						key: item.getTitle(),
						text: item.getTitle()
					});
				});

				oModel.setProperty("/employeeTokens", aux);
			}

			oList.removeSelections();
			this.EmployeeMultiHelpDialog.close();
		},

		onEmployeeMultiHelpPrevious: function (oEvent) {
			this.previousButtonPress("colaboradores",
			"EmployeesInfo?$select=EmployeeID,FirstName,LastName,Active&$filter=Active eq 'tYES'",
				"/EmployeeList",
				"/employeeListDialogBusy");
		},

		onEmployeeMultiHelpNext: function (oEvent) {
			this.nextButtonPress("colaboradores",
			"EmployeesInfo?$select=EmployeeID,FirstName,LastName,Active&$filter=Active eq 'tYES'",
				"/EmployeeList",
				"/employeeListDialogBusy");
		},

		onEmployeeMultiHelpClose: function (oEvent) {
			this.EmployeeMultiHelpDialog.close();
		},

		// --------------------------------------------------------
		// --------------------- FirterBar -----------------------
		// --------------------------------------------------------

		onSearch: function () {
			var oModel = this.getModel("oModelListRequest");
			oModel.setProperty("/requisitionsItemsBusy", true);

			var aFilter = this.getFilters(oModel);

			var url = "/destinations/B1Connection/requisicaobuscar";
			var body = JSON.stringify({
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": "sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$filter=" + aFilter

			});

			var promise = this.callAjaxFunction(url, body, "POST");

			promise.then(function (param) {
				if (param.value) {
					oModel.setProperty("/requisitionsItems", param.value);
					oModel.setProperty("/requisitionsItemsBusy", false);
					// this.getNum(param.value);
				} else {
					if (param.error) {
						MessageBox.alert(param.error.message.value);
					} else {
						MessageBox.alert(param);
					}
					oModel.setProperty("/requisitionsItemsBusy", false);
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
				oModel.setProperty("/requisitionsItemsBusy", false);
			}.bind(this));

			
		},

		// getNum: function (param) {

		// 	oModel = this.getModel("oModelListRequest");

		// 	if (oModel.getProperty("/U_Stat_work") === "Final") {
		// 		var oBundle = this.getResourceBundle();
		// 		oModel.setProperty("/NumSAP", param.NumSAP);
		// 	} else {
		// 		oModel.setProperty("/DocEntryDocumento",param.DocEntryDocumento);
		// 	}
		// },

		getFilters: function (oModel) {
			var filters = "";
			var oBundle = this.getResourceBundle();
			var oModelUserData = this.getModel("userModel");

			if (oModel.getProperty("/branchFilter")) { // Filtro de Filial
				filters += "U_Filial eq '" + oModel.getProperty("/branchFilter") + "' and ";
			}

			var reqNumTokens = oModel.getProperty("/reqNumTokens");

			if (reqNumTokens && reqNumTokens.length > 0) { // Filtro num requisição
				filters += "(";

				reqNumTokens.forEach(function (item) {
					filters += "U_Nume_docu eq '" + item.key + "' or ";
				});

				filters = filters.slice(0, -4);

				filters += ") and ";
			}

			var userTokens = oModel.getProperty("/userTokens");
			var employeeTokens = oModel.getProperty("/employeeTokens");

			if (userTokens && userTokens.length > 0) { // Filtro solicitante usuário
				filters += "(";

				userTokens.forEach(function (item) {
					filters += "U_Solicitante eq '" + item.key + "' or ";
				});

				filters = filters.slice(0, -4);

				if (!employeeTokens) {
					filters += ") and ";
				}
			}

			if (employeeTokens && employeeTokens.length > 0) { // Filtro solicitante usuário
				if (!userTokerns) {
					filters += "(";
				}

				employeeTokens.forEach(function (item) {
					filters += " U_Solicitante eq '" + item.key + "' or ";
				});

				filters = filters.slice(0, -4);

				filters += ") and ";
			}

			var approvalStatusFilter = oModel.getProperty("/approvalStatusFilter");
			if (approvalStatusFilter && approvalStatusFilter.length > 0) { // Filtro Status Aprovação

				if (approvalStatusFilter === oBundle.getText("pending")) {
					filters += "U_Resu_work eq null and ";
				} else if (approvalStatusFilter === oBundle.getText("approved")) {
					filters += "U_Resu_work eq 'Aprov' and ";
				} else if (approvalStatusFilter === oBundle.getText("rejected")) {
					filters += "U_Resu_work eq 'Recu' and ";
				}
			}

			var myApprovalStatusFilter = oModel.getProperty("/myApprovalStatusFilter");
			if (myApprovalStatusFilter && myApprovalStatusFilter.length > 0) { // Filtro Status Aprovação

				if (myApprovalStatusFilter === oBundle.getText("pending")) {
					filters += "U_Resu_work_indi eq null and ";
				} else if (myApprovalStatusFilter === oBundle.getText("approved")) {
					filters += "U_Resu_work_indi eq 'Aprov' and ";
				} else if (myApprovalStatusFilter === oBundle.getText("rejected")) {
					filters += "U_Resu_work_indi eq 'Recu' and ";
				}
			}

			if (oModel.getProperty("/requiredDate") && oModel.getProperty("/requiredDate").length > 0) { // Filtro Data necessária
				var firstDocumentDate = this.getFormattedDate(oModel.getProperty("/firstRequiredDate"));
				var secondDocumentDate = this.getFormattedDate(oModel.getProperty("/secondRequiredDate"));

				filters += "U_Data_Nec ge '" + firstDocumentDate + "' and U_Data_Nec le '" + secondDocumentDate + "' and ";
			}

			filters += "U_Usuario eq '" + oModelUserData.getProperty("/userId") + "' and U_Tipo_docu eq 'REQ'";

			return filters;
		},

		deleteToken: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("oModelListRequest").sPath;
			var property = sPath.substring(0, sPath.length - 2); // "/propertyTokens/0" -> "/propertyTokens"
			var oModel = this.getModel("oModelListRequest");
			var selectedTokenKey = oEvent.getParameters().token.getKey();

			const filteredTokens = oModel.getProperty(property).filter(function (item) {
				return item.key !== selectedTokenKey;
			});

			oModel.setProperty(property, filteredTokens);
		},

		getFormattedDate: function (Date) {
			var year = Date.getFullYear().toString();
			var month = Date.getMonth() + 1;
			var day = Date.getDate();

			if (month < 10) {
				month = "0" + month.toString();
			}

			if (day < 10) {
				day = "0" + day.toString();
			}

			return year + "-" + month + "-" + day;
		},

		// --------------------------------------------------------
		// --------------------- Table ----------------------------
		// --------------------------------------------------------
		listNextButtonPress: function () {
			var url = "/destinations/B1Connection/requisicaobuscar";
			var oModel = this.getModel("oModelListRequest");
			var skip = oModel.getProperty("/skipPageTable");
			var aFilter = this.getFilters(oModel);
			oModel.setProperty("/requisitionsItemsBusy", true);

			skip = parseInt(skip, 0) + 20;

			var data = JSON.stringify({
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": "sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$skip=" + skip + "&$filter=" + aFilter
			});

			var promise = this.callAjaxFunction(url, data, "POST");

			promise.then(function (param) {
				oModel.setProperty("/currentPageTable", parseInt(oModel.getProperty("/currentPageTable"), 0) + 1);
				oModel.setProperty("/skipPageTable", skip);
				oModel.setProperty("/requisitionsItemsBusy", false);
				oModel.setProperty("/requisitionsItems", param.value);
				oModel.setProperty("/previousTableButtonEnabled", true);

				if (param && param.value && param.value.length < 20) { //no next page
					oModel.setProperty("/nextTableButtonEnabled", false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},

		listPreviousButtonPress: function () {
			var url = "/destinations/B1Connection/requisicaobuscar";
			var oModel = this.getModel("oModelListRequest");
			var skip = oModel.getProperty("/skipPageTable");
			var aFilter = this.getFilters(oModel);

			skip = parseInt(skip, 0) - 20;

			var data = JSON.stringify({
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": "sml.svc/SDPC_BUSCAREQUISICAOAPROVADOR?$orderby=DocNum&$skip=" + skip + "&$filter=" + aFilter
			});

			var promise = this.callAjaxFunction(url, data, "POST");

			promise.then(function (param) {
				var currentPage = parseInt(oModel.getProperty("/currentPageTable"), 0) - 1;

				oModel.setProperty("/currentPageTable", currentPage);
				oModel.setProperty("/skipPageTable", skip);
				oModel.setProperty("/requisitionsItemsBusy", false);
				oModel.setProperty("/requisitionsItems", param.value);
				oModel.setProperty("/nextTableButtonEnabled", true);

				if (currentPage === 1) {
					oModel.setProperty("/previousTableButtonEnabled", false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},

		navToRequestDetail: function (oEvent) {
			var sPath = oEvent.getSource().getBindingContext("oModelListRequest").sPath;
			var oModel = this.getModel("oModelListRequest");
			var objSelected = oModel.getProperty(sPath);

			oModel.setProperty(sPath + "/SelectedItem", false);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteDetailRequest", {
				"DocEntryDocumento": objSelected.DocEntryDocumento,
				"U_Resu_work": objSelected.U_Resu_work ? objSelected.U_Resu_work : "null",
				"DocNum": objSelected.DocNum,
				"canceled": objSelected.CANCELED,
				"U_Empresa": objSelected.U_Empresa,
				"U_Filial_Nome": objSelected.U_Filial_Nome
			});
		},

		onApproveItemPress: function () {
			var oTable = this.getView().byId("requisitionsTable");
			var aSPath = oTable.getSelectedContextPaths();
			var oBundle = this.getResourceBundle();

			if (aSPath.length > 0) {
				this.oApproveDialog = new Dialog({
					title: oBundle.getText("confirm"),
					type: DialogType.Message,
					content: [
						new Label({
							text: oBundle.getText("approveItemMessage"),
							labelFor: "approveNote"
						}),
						new TextArea("approveNote", {
							width: "100%",
							placeholder: oBundle.getText("justification"),
							showExceededText: true,
							rows: 7,
							maxLength: 200,
							liveChange: this.handleLiveChange,
							valueLiveUpdate: true
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						id: "beginButton",
						text: oBundle.getText("approveItem"),
						press: function () {
							var sText = Core.byId("approveNote").getValue();
							this.onApprove(aSPath, sText);
							this.oApproveDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oBundle.getText("cancel"),
						press: function () {
							this.oApproveDialog.destroy(true);
						}.bind(this)
					}),
					afterClose: function () {
						this.oApproveDialog.destroy(true);
					}.bind(this)
				});

				this.oApproveDialog.open();
			} else {
				MessageBox.alert(oBundle.getText("tableSelectLineApprove"));
				this.getView().setBusy(false);
			}
		},

		onApprove: function (aSPath, sText) {
			var oBundle = this.getResourceBundle();

			var oModelUser = this.getModel("userModel");
			var oModel = this.getModel("oModelListRequest");
			var url = "/destinations/B1Connection/aprovacao";
			var aPromise = [];

			this.selectedLength = aSPath.length;
			this.itemsCount = 0;

			for (var i = 0; i < aSPath.length; i++) {
				var obj = oModel.getProperty(aSPath[i]);

				if (obj.U_Resu_work === null && obj.CANCELED && obj.CANCELED === "N") {
					this.callApprovalEndpoint(obj.DocEntryDocumento, "Aprov", obj.DocNum, sText);
				} else if (obj.CANCELED === "S") {
					MessageBox.alert(oBundle.getText("documentAlreadySet1") + obj.DocEntryDocumento + " " + oBundle.getText("documentCanceled"));
					this.itemsCount++;
				} else {
					MessageBox.alert(oBundle.getText("documentAlreadySet1") + obj.DocEntryDocumento + " " + oBundle.getText("documentAlreadySet2"));
					this.itemsCount++;
				}
			}
		},

		callApprovalEndpoint: function (docNum, statusType, approvalNum, sText = "") {
			var oBundle = this.getResourceBundle();
			var oUserModel = this.getModel("userModel");
			var oModel = this.getModel("oModelListRequest");

			this.getView().setBusy(true);

			var url = "/destinations/B1Connection/aprovacao";

			var objData = {
				"Usuario": oUserModel.getProperty("/userId"),
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"statusAprovacao": statusType,
				"docEntryAprovacao": approvalNum.toString()
			};

			if (sText.replace(/\s/g, '') !== "") {
				objData.observacao = sText;
			}

			var promise = this.callAjaxFunction(url, JSON.stringify(objData), "POST");

			promise.then(function (param) {
				if (param.error != undefined) {
					MessageBox.alert(oBundle.getText("processingError") + docNum + ": " + param.error.message.value);
				} else {
					if (param.message != undefined) {
						if (param.message == "Documento ja foi rejeitado anteriormente" || param.message == "Documento ja foi aprovado anteriormente") {
							MessageBox.alert(param.message);
						} else {
							var message = "";
							if (statusType == "Aprov") {
								message = oBundle.getText("approvalMessage") + docNum + " " + oBundle.getText("approvalMessageApproved");
							} else {
								message = oBundle.getText("approvalMessage") + docNum + " " + oBundle.getText("approvalMessageRejected");
							}

							MessageBox.alert(message, {
								onClose: function (oAction) {
									this.onSearch();
								}.bind(this)
							});
						}
					}
				}

				this.getView().setBusy(false);
			}.bind(this), function (param) {
				MessageBox.alert(oBundle.getText("systemUnavailable"));
				this.getView().setBusy(false);
			}.bind(this));
		},

		onRejectItemPress: function () {
			var oTable = this.getView().byId("requisitionsTable");
			var aSPath = oTable.getSelectedContextPaths();
			var oBundle = this.getResourceBundle();

			if (aSPath.length > 0) {
				this.oRejectDialog = new Dialog({
					title: oBundle.getText("reject"),
					type: DialogType.Message,
					content: [
						new Label({
							text: oBundle.getText("rejectItemMessage"),
							labelFor: "rejectNote"
						}),
						new TextArea("rejectNote", {
							width: "100%",
							placeholder: oBundle.getText("justification"),
							showExceededText: true,
							rows: 7,
							maxLength: 200,
							liveChange: this.handleLiveChange,
							valueLiveUpdate: true
						})
					],
					beginButton: new Button({
						type: ButtonType.Emphasized,
						id: "beginButton",
						text: oBundle.getText("rejectItem"),
						press: function () {
							var sText = Core.byId("rejectNote").getValue();
							this.onReject(aSPath, sText);
							this.oRejectDialog.close();
						}.bind(this)
					}),
					endButton: new Button({
						text: oBundle.getText("cancel"),
						press: function () {
							this.oRejectDialog.destroy(true);
						}.bind(this)
					}),
					afterClose: function () {
						this.oRejectDialog.destroy(true);
					}.bind(this)
				});

				this.oRejectDialog.open();
			} else {
				MessageBox.alert(oBundle.getText("tableSelectLineReject"));
				this.getView().setBusy(false);
			}
		},

		onReject: function (aSPath, sText) {
			var oBundle = this.getResourceBundle();
			var oModelUser = this.getModel("userModel");
			var oModel = this.getModel("oModelListRequest");
			var url = "/destinations/B1Connection/aprovacao";
			var aPromise = [];

			this.selectedLength = aSPath.length;
			this.itemsCount = 0;

			for (var i = 0; i < aSPath.length; i++) {
				var obj = oModel.getProperty(aSPath[i]);
				if (obj.U_Resu_work === null && obj.CANCELED && obj.CANCELED === "N") {
					this.callApprovalEndpoint(obj.DocEntryDocumento, "Recu", obj.DocNum, sText);
				} else if (obj.CANCELED === "S") {
					MessageBox.alert(oBundle.getText("documentAlreadySet1") + obj.DocEntryDocumento + " " + oBundle.getText("documentCanceled"));
					this.itemsCount++;
				} else {
					MessageBox.alert(oBundle.getText("documentAlreadySet1") + obj.DocEntryDocumento + " " + oBundle.getText("documentAlreadySet2"));
					this.itemsCount++;
				}

			}
		},

		handleLiveChange: function (oEvent) {
			var ValueState = coreLibrary.ValueState;

			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? ValueState.Warning : ValueState.None;

			// this.ui.core("teste2").setEnabled(false);
			if (iValueLength > iMaxLength) {
				Core.byId("beginButton").setEnabled(false);
			} else {
				Core.byId("beginButton").setEnabled(true);
			}

			oTextArea.setValueState(sState);
		}

		
	});

});
