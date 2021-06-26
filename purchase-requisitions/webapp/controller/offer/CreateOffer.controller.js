sap.ui.define([
	"../BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
	"sap/m/Text",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageBox, Dialog, DialogType, Button, ButtonType, Text, MessageToast) {
	"use strict";

	return Controller.extend("requisitions.requisitions.controller.offer.createOffer", {
		onInit: function () {

			this.getView().setModel(new JSONModel(), "oModelCreateOffer");

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteOffer").attachPatternMatched(this._onObjectMatched, this);
		
		},

		_onObjectMatched: function (oEvent) {
			this.getView().setBusy(false);
			var oModel = this.getModel("oModelCreateOffer");
            var oBundle = this.getResourceBundle();	

			oModel.setProperty("/ViewTitle", oBundle.getText("newOffer"));
			oModel.setProperty("/rowsCount", 0);

		},

		onBeforeRendering: function () {
			var oModel = this.getModel("oModelCreateOffer");
			oModel.setProperty("/Editable", false);
			oModel.setProperty("/solicitanteColaboradorVisible", false);
			oModel.setProperty("/solicitanteUsuarioVisible", false);
			oModel.setProperty("/Itens", []);
			oModel.setProperty("/providerItens", []);
		},

		// --------------------------------------------------------
		// -------------- onCompanySelect routine -----------------
		// --------------------------------------------------------
		
		onCompanySelect: function (oEvent) {
			
			var idEmp = oEvent.getParameter("selectedItem").getProperty("key");
				
			var oModel = this.getModel("oModelCreateOffer");
			var oModelUserData = this.getModel("userModel");
			var oModelGeral = this.getModel("oModel");

			oModelGeral.setProperty("/idEmpresa", idEmp);
			oModel.setProperty("/idEmpresa",idEmp);

			oModel.setProperty("/companySelectedKey", true);
			oModel.setProperty("/solicitanteUsuarioVisible", false);
			oModel.setProperty("/solicitanteColaboradorVisible", false);
			oModel.setProperty("/RequestTypeBusy", true);
			oModel.setProperty("/DepartmentsBusy", true);
			oModel.setProperty("/companySelectBusy", false);
			
			this.setRequesterTypeComboBox(oModel); // Preenche o ComboxBox 

			this.setRequesterName(oModel, oModelUserData); // Preenche o nome do Solicitante

			this.setDepartmentsComboBox(oModel, oModelGeral); // Preenche o combobox de Departamento

			this.setBranches(idEmp); // Preenche as Filiais baseado na empresa selecionada

			this.setDateValues(); // Preenche os campos de data

			oModel.setProperty("/Editable", true); // Habilta os campos a serem modificados pelo usuário
		},
		setBranches: function (idEmp) {
			var oModelCompanies = this.getModel("oModel");
			var data = oModelCompanies.getProperty("/Companies");

			for (var i = 0; i < data.length; i++) {
				if (data[i].IdEmpresas === idEmp) {
					oModelCompanies.setProperty("/Branches", data[i].Filiais);
				}
			}
		},

		setRequesterTypeComboBox: function (oModel) {
			//set requesterType combobox
			var oBundle = this.getResourceBundle();

			this.employeeString = oBundle.getText("employee");
			this.userString = oBundle.getText("user");

			var requesterTypeData = [];
			requesterTypeData.push({
				Type: ""
			});

			requesterTypeData.push({
				Type: this.employeeString
			});
			requesterTypeData.push({
				Type: this.userString
			});

			oModel.setProperty("/RequestType", requesterTypeData);
		},

		setRequesterName: function (oModel, oModelUserData) {
		
			var url = "/destinations/B1Connection/colaboradores";

			var data = JSON.stringify({
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": "EmployeesInfo?$filter=U_SDPC_Usuario eq '" + oModelUserData.getProperty("/userId") + "'"
			});

			var promise = this.callAjaxFunction(url, data, "POST");

			promise.then(function (param) {
				if (param.value) {
					this.setComboBoxItem(this.employeeString, "solicitante");

					oModel.setProperty("/solicitanteColaboradorVisible", true);
					oModel.setProperty("/solicitanteColaboradorValue", param.value[0].FirstName);
					oModel.setProperty("/RequestTypeBusy", false);

					oModel.setProperty("/defaultEmployeeID", param.value[0].EmployeeID);
					oModel.setProperty("/defaultEmployeeName", param.value[0].FirstName);
				} else {
					MessageBox.alert(param);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},

		setComboBoxItem: function (value, comboBoxId) {
			var comboBox = this.byId(comboBoxId).getItems();

			for (var i = 0; i < comboBox.length; i++) {
				if (comboBox[i].getProperty("text") === value) {
					this.byId(comboBoxId).setSelectedItem(comboBox[i]);
				}
			}
		},

		onRequesterSelect: function (oEvent) {
			var oModel = this.getModel("oModelCreateOffer");
			var type = oModel.getProperty("/SelectedRequester");

			if (type === this.employeeString) {
				oModel.setProperty("/solicitanteColaboradorVisible", true);

				if (oModel.getProperty("/solicitanteUsuarioVisible")) {
					oModel.setProperty("/solicitanteUsuarioVisible", false);
				}
			}
			if (type === this.userString) {
				oModel.setProperty("/solicitanteUsuarioVisible", true);

				if (oModel.getProperty("/solicitanteColaboradorVisible")) {
					oModel.setProperty("/solicitanteColaboradorVisible", false);
				}
			}
			if (type === "") {
				if (oModel.getProperty("/solicitanteColaboradorVisible")) {
					oModel.setProperty("/solicitanteColaboradorVisible", false);
				}
				if (oModel.getProperty("/solicitanteUsuarioVisible")) {
					oModel.setProperty("/solicitanteUsuarioVisible", false);
				}
			}
		},

		// --------------------------------------------------------
		// -------------- Solicitante/Titular -----------------
		// --------------------------------------------------------

		onEmployeeValueSetManual: function (oEvent) {
			
			var manualValue = oEvent.getParameters().value;
			var oModel = this.getModel("oModelCreateOffer");

			oModel.setProperty("/solicitanteColaboradorBusy", true);
			oModel.setProperty("/solicitanteColaboradorValue", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

			if (manualValue.replace(/\s/g, "") !== "") {
				var url = "/destinations/B1Connection/colaboradores";
				var oModelGeral = this.getModel("oModel");
				var data = JSON.stringify({
					"idEmpresa": oModelGeral.getProperty("/idEmpresa"),
					"servicoSL": "EmployeesInfo?$filter=FirstName eq '" + manualValue + "'"
				});

				var promise = this.callAjaxFunction(url, data, "POST");

				promise.then(function (param) {
					if (param != "Erro Not Found" && param.value.length > 0) {
						oModel.setProperty("/solicitanteColaboradorValue", param.value[0].FirstName);
						oModel.setProperty("/solicitanteColaboradorIDValue", param.value[0].EmployeeID);
					} else {
						oModel.setProperty("/solicitanteColaboradorIDValue", "");
						oModel.setProperty("/solicitanteColaboradorValue", "");
					}

					oModel.setProperty("/solicitanteColaboradorBusy", false);
				}.bind(this), function (param) {
					oModel.setProperty("/solicitanteColaboradorIDValue", "");
					oModel.setProperty("/solicitanteColaboradorValue", "");
					oModel.setProperty("/solicitanteColaboradorBusy", false);
				}.bind(this));
			} else {
				oModel.setProperty("/solicitanteColaboradorIDValue", "");
				oModel.setProperty("/solicitanteColaboradorValue", "");
				oModel.setProperty("/solicitanteColaboradorBusy", false);
			}
		},

		onEmployeeHelpRequest: function (type) {	
			
			var oModel = this.getModel("oModelCreateOffer");
			oModel.setProperty("/typeEmployee", type);

			this.openFragmentAndLoad("fragments_help", "EmployeeHelpDialog", "colaboradores", "/EmployeeList", "/employeeListDialogBusy",
				"EmployeesInfo");
		},

		onEmployeeHelpNext: function (oEvent) {
			this.nextButtonPress("colaboradores",
				"EmployeesInfo",
				"/EmployeeList",
				"/employeeListDialogBusy");
		},

		onEmployeeHelpPrevious: function (oEvent) {
			this.previousButtonPress("colaboradores",
				"EmployeesInfo",
				"/EmployeeList",
				"/employeeListDialogBusy");
		},

		onEmployeeHelpSave: function (oEvent) {
			var oBundle = this.getResourceBundle();
			var sPath = oEvent.getSource().getSelectedContextPaths()[0];
			var employee = oEvent.getSource().getSelectedItem().getProperty("title");
			var oModel = this.getModel("oModelCreateOffer");

			this.oApproveDialog = new Dialog({
				type: DialogType.Message,
				title: oBundle.getText("confirm"),
				content: new Text({
					text: oBundle.getText("acceptEmployee")
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: oBundle.getText("confirm"),
					press: function () {
						oModel.setProperty(sPath + "/SelectedEmployee", false);

						if (oModel.getProperty("/typeEmployee") === "colaborador") {
							oModel.setProperty("/solicitanteColaboradorValue", employee);
						
						} else {
							oModel.setProperty("/documentsOwnerName", employee);
						}

						this.oApproveDialog.destroy();
						this.EmployeeHelpDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: oBundle.getText("cancel"),
					press: function () {
						oModel.setProperty(sPath + "/SelectedEmployee", false);
						this.oApproveDialog.destroy();
					}.bind(this)
				})
			});

			this.oApproveDialog.open();
		},

		onEmployeeHelpClose: function () {
			this.EmployeeHelpDialog.close();
		},

		// --------------------------------------------------------
		// -------------- Usuário -----------------
		// --------------------------------------------------------

		onUserValueSetManual: function (oEvent) {
			var manualValue = oEvent.getParameters().value;
			var oModel = this.getModel("oModelCreateOffer");

			oModel.setProperty("/solicitanteUsuarioBusy", true);
			oModel.setProperty("/solicitanteUsuarioValue", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

			if (manualValue.replace(/\s/g, "") !== "") {
				var url = "/destinations/B1Connection/colaboradores";
				var oModelGeral = this.getModel("oModel");
				var data = JSON.stringify({
					"idEmpresa": oModelGeral.getProperty("/idEmpresa"),
					"servicoSL": "Users?$select=UserCode,UserName&$filter=UserCode eq '" + manualValue + "'"
				});

				var promise = this.callAjaxFunction(url, data, "POST");

				promise.then(function (param) {
					if (param != "Erro Not Found" && param.value.length > 0) {
						oModel.setProperty("/solicitanteUsuarioIDValue", param.value[0].UserCode);
						oModel.setProperty("/solicitanteUsuarioValue", param.value[0].UserName);
					} else {
						oModel.setProperty("/solicitanteUsuarioIDValue", "");
						oModel.setProperty("/solicitanteUsuarioValue", "");
					}

					oModel.setProperty("/solicitanteUsuarioBusy", false);
				}.bind(this), function (param) {
					oModel.setProperty("/solicitanteUsuarioIDValue", "");
					oModel.setProperty("/solicitanteUsuarioValue", "");
					oModel.setProperty("/solicitanteUsuarioBusy", false);
				}.bind(this));
			} else {
				oModel.setProperty("/solicitanteUsuarioIDValue", "");
				oModel.setProperty("/solicitanteUsuarioValue", "");
				oModel.setProperty("/solicitanteUsuarioBusy", false);
			}
		},

		onUserHelpRequest: function (oEvent) {
			this.openFragmentAndLoad("fragments_help", "UserHelpDialog", "usuario", "/UserList", "/userListDialogBusy",
				"Users?$select=UserCode,UserName");
		},

		onUserHelpNext: function (oEvent) {
			this.nextButtonPress("usuario",
				"Users?$select=UserCode,UserName",
				"/UserList",
				"/userListDialogBusy");
		},

		onUserHelpPrevious: function (oEvent) {
			this.previousButtonPress("usuario",
				"Users?$select=UserCode,UserName",
				"/UserList",
				"/userListDialogBusy");
		},

		onUserHelpSave: function (oEvent) {
			var oBundle = this.getResourceBundle();
			var sPath = oEvent.getSource().getSelectedContextPaths()[0];
			var user = oEvent.getSource().getSelectedItem().getProperty("title");
			var oModel = this.getModel("oModelCreateOffer");

			this.oApproveDialog = new Dialog({
				type: DialogType.Message,
				title: oBundle.getText("confirm"),
				content: new Text({
					text: oBundle.getText("acceptUser")
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: oBundle.getText("confirm"),
					press: function () {
						oModel.setProperty(sPath + "/SelectedUser", false);
						oModel.setProperty("/solicitanteUsuarioValue", user);

						this.oApproveDialog.destroy();
						this.UserHelpDialog.close();
					}.bind(this)
				}),
				endButton: new Button({
					text: oBundle.getText("cancel"),
					press: function () {
						oModel.setProperty(sPath + "/SelectedUser", false);
						this.oApproveDialog.destroy();
					}.bind(this)
				})
			});

			this.oApproveDialog.open();
		},

		onUserHelpClose: function () {
			this.UserHelpDialog.close();
		},

		// --------------------------------------------------------
		// -------------- Titular -----------------
		// --------------------------------------------------------

		onTitularValueSetManual: function (oEvent) {
			var manualValue = oEvent.getParameters().value;
			var oModel = this.getModel("oModelCreateOffer");

			oModel.setProperty("/ownerBusy", true);
			oModel.setProperty("/owner", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

			if (manualValue.replace(/\s/g, "") !== "") {
				var url = "/destinations/B1Connection/colaboradores";
				var oModelGeral = this.getModel("oModel");
				var data = JSON.stringify({
					"idEmpresa": oModelGeral.getProperty("/idEmpresa"),
					"servicoSL": "EmployeesInfo?$filter=FirstName eq '" + manualValue + "'"
				});

				var promise = this.callAjaxFunction(url, data, "POST");

				promise.then(function (param) {
					if (param != "Erro Not Found" && param.value.length > 0) {
						oModel.setProperty("/owner", param.value[0].UserName);
					} else {
						oModel.setProperty("/owner", "");
					}

					oModel.setProperty("/ownerBusy", false);
				}.bind(this), function (param) {
					oModel.setProperty("/owner", "");
					oModel.setProperty("/ownerBusy", false);
				}.bind(this));
			} else {
				oModel.setProperty("/owner", "");
				oModel.setProperty("/ownerBusy", false);
			}
		},

		setDepartmentsComboBox: function (oModel, oModelGeral) {
			var url = "/destinations/B1Connection/departamento";
			var data = JSON.stringify({
				"idEmpresa": oModelGeral.getProperty("/idEmpresa"),
				"servicoSL": "Departments"
			});

			var promise = this.callAjaxFunction(url, data, "POST");

			promise.then(function (param) {
				var data = [];
				data.push({
					Name: "",
					Code: ""
				});

				if (param.value) {
					for (var i = 0; i < param.value.length; i++) {
						data.push({
							Name: param.value[i].Name,
							Code: param.value[i].Code
						});
					}

					oModel.setProperty("/Departments", data);
					oModel.setProperty("/DepartmentsBusy", false);
				} else {
					MessageBox.alert(param);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
			}.bind(this));
		},

		// --------------------------------------------------------
		// -------------- Datas -----------------
		// --------------------------------------------------------
		setDateValues: function () {
			var date = new Date();
			var yyyy = date.getFullYear().toString();
			var mm = (date.getMonth() + 2); // getMonth() is zero-based

			var month = mm.toString();
			if (mm == 13) {
				month = "01";
				var year = date.getFullYear() + 1;
				yyyy = year.toString();
			}
			if (mm < 10) {
				month = "0" + mm.toString();
			}

			var day;
			if (date.getDate() < 10) {
				day = "0" + date.getDate().toString();
			} else {
				day = date.getDate().toString();
			}
			var nexMonthDate = yyyy + "-" + month + "-" + day;

			// var oModel = this.getModel("oModelCreateOffer");

			this.byId("dataNecessaria").setMinDate(new Date());
			this.byId("dataLancamento").setDateValue(new Date());
			this.byId("validoAte").setValue(nexMonthDate);
			this.byId("dataDocumento").setDateValue(new Date());
		},

		 // --------------------------------------------------------
        // -------------- Table Header Actions --------------------
        // --------------------------------------------------------

        onAddItem: function () {
			
            var oModel = this.getModel("oModelCreateOffer");
            var rowsCount = oModel.getProperty("/rowsCount") + 1;
			var dateRequerid = oModel.getProperty("/requiredDate");

            oModel.setProperty("/rowsCount", rowsCount); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table e ajuda a marcar o ID do item

            var obj = {
                "itemId": rowsCount,
                "itemCode": "",
                "itemDescription": "",
                "provider": "",
                "requiredDateRow": oModel.setProperty("/requiredDateRow", dateRequerid),
                "necessaryAmount": "",
            };

            var rows = oModel.getProperty("/rows");
            var newRows = [];

            if (rows && rows.length > 0) {
                rows.push(obj);
                oModel.setProperty("/rows", rows);
            } else {
                newRows.push(obj);
                oModel.setProperty("/rows", newRows);
            }

        },

        onRemoveItem: function (oEvent) {
            var oModel = this.getModel("oModelCreateOffer");
            var table = this.getView().byId("table");
            var aIndex = table.getSelectedIndices();

            var rows = oModel.getProperty("/rows");
            var index = "";

            aIndex.reverse().forEach(function (item) { // Ordena a lista de indices em ordem decrescente e remove os itens da lista
                rows.splice(item, 1);
            });

            if (rows && rows.length > 0) {
                for (var i = 0; i < rows.length; i++) { // Modifica os IDs dos itens para a nova ordem das linhas
                    rows[i].itemId = (i + 1);
                };
            }

            oModel.setProperty("/rowsCount", oModel.getProperty("/rowsCount") - aIndex.length); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table
            table.clearSelection();
            oModel.setProperty("/rows", rows);

            this.setTotal();
        },

        onCopyItem: function (oEvent) {
            var table = this.getView().byId("table");
            var aIndex = table.getSelectedIndices();

            if (aIndex && aIndex.length > 0) {
                var oModel = this.getModel("oModelCreateOffer");

                var rows = oModel.getProperty("/rows");
                var auxRows = [];

                for (var i = 0; i < aIndex.length; i++) {
                    auxRows.push({
                        ...rows[aIndex[i]]
                    });
                };

                rows = rows.concat(auxRows);

                if (rows && rows.length > 0) {
                    for (var i = 0; i < rows.length; i++) { // Modifica os IDs dos itens para a nova ordem das linhas
                        rows[i].itemId = (i + 1);
                    };
                }

                oModel.setProperty("/rowsCount", oModel.getProperty("/rowsCount") + aIndex.length); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table
                table.clearSelection();
                oModel.setProperty("/rows", rows);
            }

        },

		// -------------------------------------
		// Botões da tabela de Itens
		// -------------------------------------
		onAdd: function () {
			var oModel = this.getModel("oModelCreateOffer");
			oModel.setProperty("/minDateItemNumber", new Date());
			oModel.setProperty("/dateItemNumber", this.byId("dataNecessaria").getValue());
			oModel.setProperty("/itemNumberValue", "");
			oModel.setProperty("/itemNumberValueDescription", "");
			oModel.setProperty("/ItemsProviderAddItemDialog", []);
			oModel.setProperty("/requiredQuantityAddItem", "");
			this.openFragment("fragments", "addItemDialog");
		},

		onAddNewItem: function () { 
			var oBundle = this.getResourceBundle();
			var oModel = this.getModel("oModelCreateOffer");
			var auxObj = {};
			
			var objItem = {

				itemCode: oModel.getProperty("/itemNumberValue"),
				itemDescription: oModel.getProperty("/itemNumberValueDescription"),
				provider: oModel.getProperty("/ItemsProviderAddItemDialog"),
				requiredDate: oModel.getProperty("/dateItemNumber"),
				requiredQuantity: oModel.getProperty("/requiredQuantityAddItem"),
			};

			if (objItem.itemCode && objItem.itemCode.length > 0 &&
				objItem.requiredDate && objItem.requiredDate.length > 0 &&
				objItem.requiredQuantity && objItem.requiredQuantity.length > 0) {
				var items = oModel.getProperty("/Itens");

				var index = items.findIndex(function (item) {
					return item.ItemCode === objItem.itemCode;
				});

				if (index < 0) {
					this.addOnItemListAndProvidersList(objItem, items, oModel);

					this.addItemDialog.close();
				} else {
					MessageToast.show(oBundle.getText("itemAlreadyExists"));
				}
			} else {
				MessageToast.show(oBundle.getText("fillAllFields"));
			}
		},

		addOnItemListAndProvidersList: function (objItem, items, oModel) {
			var auxObj = {};
			var providersItems = oModel.getProperty("/providerItens");

			auxObj = Object.assign(auxObj, objItem);

			auxObj["provider"] = objItem["provider"];
			auxObj["providerCount"] = objItem["provider"].length;
			auxObj["codeStatus"] = "1";
			auxObj["status"] = "Incluído";
			auxObj["lineIdItem"] = oModel.getProperty("/Itens").length + 1;

			items.push(auxObj);

			for (var i = 0; i < objItem.provider.length; i++) {
				var index = providersItems.findIndex(function (item) {
					return item.CardCode === auxObj["provider"][i].CardCode;
				});

				if (index < 0) {
					providersItems.push(objItem["provider"][i]);
				}
			}

			oModel.setProperty("/Itens", items);
			oModel.setProperty("/providerItens", providersItems);
		},

		onCancelAddNewItem: function () {
			this.addItemDialog.close();
		},

		onCancelEditItem: function () {
			this.editItemDialog.close();
		},

		onDelete: function () {
			var oModel = this.getModel("oModelCreateOffer");
			var items = oModel.getProperty("/Items");
			var selectedItems = this.getView().byId("table").getSelectedItems();

			selectedItems.forEach(function (item) {
				var spath = item.getBindingContextPath();
				
			}.bind(this));

		},
		
		// --------------------------------------------------------
		// -------------- Fornecedor-----------------
		// --------------------------------------------------------
		getProvider: function (ItemPreferredVendors, oModel) {
			var url = "/destinations/B1Connection/fornecedorbuscar";
			var oModelGeral = this.getModel("oModel");
			
			var servico = "and (";
			
			ItemPreferredVendors.forEach(function (item) {
				servico += " substringof('" + item.BPCode + "', CardCode) or";	
			});
			
			servico = servico.slice(0, -2); //Removendo o último "or"
			
			var data = JSON.stringify({
				"idEmpresa": oModelGeral.getProperty("/idEmpresa"),
				"servicoSL": "BusinessPartners?$select=CardCode,CardName&$filter=Valid eq 'tYES' " + servico + ")"
			});
			
			var promise = this.callAjaxFunction(url, data, "POST");
			
			promise.then(function (param) {
				oModel.setProperty("/ItemsProviderAddItemDialog", param.value);
				oModel.setProperty("/ItemsProviderAddItemDialogBusy", false);
			}.bind(this), function (param) {
				oModel.setProperty("/ItemsProviderAddItemDialog", []);
				oModel.setProperty("/ItemsProviderAddItemDialogBusy", false);
			}.bind(this));	
		},

		// --------------------------------------------------------
		// -------------- Item -----------------
		// --------------------------------------------------------
		onItemNumberValueSetManual: function (oEvent) {
			
			var sPath = oEvent.getSource().getBindingContext("oModelCreateOffer").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOffer");

            oModel.setProperty(sPath + "/itemNumberBusy", true);
            oModel.setProperty(sPath + "/itemNumber", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função
            oModel.setProperty(sPath + "/itemNumberDesc", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/item";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets' and ItemCode eq '" + manualValue + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty(sPath + "/itemNumber", param.value[0].ItemCode);
                        oModel.setProperty(sPath + "/itemNumberDesc", param.value[0].ItemName);
                    } else {
                        oModel.setProperty(sPath + "/itemNumber", "");
                        oModel.setProperty(sPath + "/itemNumberDesc", "");
                    }

                    oModel.setProperty(sPath + "/itemNumberBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty(sPath + "/itemNumber", "");
                    oModel.setProperty(sPath + "/itemNumberDesc", "");
                    oModel.setProperty(sPath + "/itemNumberBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty(sPath + "/itemNumber", "");
                oModel.setProperty(sPath + "/itemNumberDesc", "");
                oModel.setProperty(sPath + "/itemNumberBusy", false);
            }
		},

		onItemNumberHelpRequest: function (oEvent) {
			
			var sPath = oEvent.getSource().getBindingContext("oModelCreateOffer").sPath;
            this.getModel("oModelCreateOffer").setProperty("/ItemNumberSPath", sPath);

            this.openFragmentAndLoad("fragments_help", "ItemNumberHelpDialog", "item", "/ItemsNumber", "/ItemsNumberBusy",
                "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets'");
		},

		onItemNumberHelpSearch: function (oEvent) {
			var sQuery = oEvent.getSource().getValue();
            var oModelGeral = this.getModel("oModel");
            var servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

            if (oModelGeral.getProperty("/itemNumberType")) {
                servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES'";
            }

            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                servicoSL = servicoSL + " and (substringof('" + sQuery + "', ItemName) or substringof('" + sQuery + "', ItemCode)";
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + " or substringof('" + upperCase + "', ItemName) or substringof('" + lowerCase +
                    "', ItemName) or substringof('" +
                    nameString + "', ItemName) or substringof('" + upperCase + "', ItemCode))";
            }

            this.searchDialog("item",
                servicoSL,
                "/ItemsNumber",
                "/ItemsNumberBusy");
		},

		onSwitchItemNumberChanged: function () {
			var oModel = this.getModel("oModelCreateOffer");
			var servicoSL = "Items?$filter=Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

			if (oModel.getProperty("/itemNumberType")) {
				servicoSL = "Items?$filter=Valid eq 'tYES'";
			}

			this.searchDialog("item",
				servicoSL,
				"/itemNumber",
				"/itemNumberListDialogBusy");
		},

		onItemNumberHelpNext: function (oEvent) {
			var oModel = this.getModel("oModelCreateOffer");
			var servicoSL = "Items?$filter=Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

			if (oModel.getProperty("/itemNumberType")) {
				servicoSL = "Items?$filter=Valid eq 'tYES'";
			}

			this.nextButtonPress("item",
				servicoSL,
				"/itemNumber",
				"/itemNumberListDialogBusy");
		},

		onItemNumberHelpPrevious: function (oEvent) {
			var oModel = this.getModel("oModelCreateOffer");
			var servicoSL = "Items?$filter=Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

			if (oModel.getProperty("/itemNumberType")) {
				servicoSL = "Items?$filter=Valid eq 'tYES'";
			}

			this.previousButtonPress("item",
				servicoSL,
				"/itemNumber",
				"/itemNumberListDialogBusy");
		},

		// onItemNumberHelpSave: function (oEvent) {
		// 	var oBundle = this.getResourceBundle();
		// 	var source = oEvent.getSource();
		// 	var sPath = source.getSelectedContextPaths()[0];
		// 	var itemNumber = source.getSelectedItem().getProperty("title");
		// 	var oModel = this.getModel("oModelCreateOffer");
			
		// 	this.oApproveDialog = new Dialog({
		// 		type: DialogType.Message,
		// 		title: oBundle.getText("confirm"),
		// 		content: new Text({
		// 			text: oBundle.getText("acceptItem")
		// 		}),
		// 		beginButton: new Button({
		// 			type: ButtonType.Emphasized,
		// 			text: oBundle.getText("confirm"),
		// 			press: function () {
		// 				var aItemNumber = oModel.getProperty("/itemNumber");

		// 				var index = aItemNumber.findIndex(function (item) {
		// 					return item.ItemCode === itemNumber;
		// 				});

		// 				oModel.setProperty(sPath + "/SelectedItemNumber", false);
		// 				oModel.setProperty("/itemNumberValue", aItemNumber[index].ItemCode);
		// 				oModel.setProperty("/itemNumberValueDescription", aItemNumber[index].ItemName);
						
		// 				if (aItemNumber[index].ItemPreferredVendors && aItemNumber[index].ItemPreferredVendors.length > 0) {
		// 					oModel.setProperty("/ItemsProviderAddItemDialogBusy", true);
		// 					this.getProvider(aItemNumber[index].ItemPreferredVendors, oModel);
		// 				}

		// 				this.oApproveDialog.destroy();
		// 				this.ItemNumberHelpDialog.close();
		// 			}.bind(this)
		// 		}),
		// 		endButton: new Button({
		// 			text: oBundle.getText("cancel"),
		// 			press: function (oEvent) {
		// 				oModel.setProperty(sPath + "/SelectedItemNumber", false);
		// 				this.oApproveDialog.destroy();
		// 			}.bind(this)
		// 		})
		// 	});

		// 	this.oApproveDialog.open();
		// },

		onItemNumberHelpSave: function (oEvent) {

            var oModel = this.getModel("oModelCreateOffer");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var ItemNumberSPath = oModel.getProperty("/ItemNumberSPath");
            var itemNumber = source.getSelectedItem().getProperty("title");
            var itemNumberDesc = source.getSelectedItem().getProperty("description");

            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("confirm"),
                content: new Text({
                    text: oBundle.getText("acceptItem")
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("confirm"),
                    press: function () {
                        oModelGeral.setProperty(sPath + "/ItemCodeSelected", false);
                        oModel.setProperty(ItemNumberSPath + "/itemNumber", itemNumber);
                        oModel.setProperty(ItemNumberSPath + "/itemNumberDesc", itemNumberDesc);

                        this.oApproveDialog.destroy();
                        this.ItemNumberHelpDialog.close();

                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/ItemCodeSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

		onItemNumberHelpClose: function () {
			this.ItemNumberHelpDialog.close();
		},

		// --------------------------------------------------------
		// -------------- navegaçao -----------------
		// --------------------------------------------------------

		onPressNextPage: function (oEvent) {
			
			var oModel = this.getModel("oModelCreateOffer");
			
			if (oModel.getProperty("/companySelectedKey") && oModel.getProperty("/companySelectedKey").length !== false && 
				oModel.getProperty("/branch") && oModel.getProperty("/branch").length > 0 && 
				oModel.getProperty("/requiredDate") && oModel.getProperty("/requiredDate").length > 0) {
				this.getView().setBusy(true);
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("TargetOfferP2");
			} else {
				var bundle = this.getResourceBundle();
				MessageBox.alert(bundle.getText("fillAllFields"));
			}
		}
	});
});