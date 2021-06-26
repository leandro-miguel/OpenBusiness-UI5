sap.ui.define([
	"../BaseController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/MessageBox"
], function (Controller, History, MessageBox) {
	"use strict";

	return Controller.extend("requisitions.requisitions.controller.offer.createOfferP2", {
		onInit: function () {
			
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteOfferP2").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function (oEvent) {
			var oModel = this.getModel("oModelCreateOffer");
			var providerItens = oModel.getProperty("/providerItens");
			var itens = oModel.getProperty("/Itens");
			
			if (providerItens && providerItens.length > 0) {
				var aAux = [];
				var oAux = {};

				for (var i = 0; i < providerItens.length; i++) {
					oAux = {
						provider: providerItens[i].CardCode,
						providerName: providerItens[i].CardName,
						itens: []
					};
					
					for (var j = 0; j < itens.length; j++) {
						var index = itens[j].provider.findIndex(function (item) {
							return item.CardCode === providerItens[i].CardCode;
						});
						
						if (index >= 0) {
							var auxObj = {};
							auxObj = Object.assign(auxObj, itens[j]); // Se não fizer isso, os objetos estarão apontando para o mesmo espaço de memória, ocasionando seleção múltipla na tabela, ao clicar em selecionar os itens.
							oAux.itens.push(auxObj);
						}
					}
					
					aAux.push(oAux);
				}
				oModel.setProperty("/itensXprovider", aAux);
				oModel.setProperty("/SaveEnabled", true);
			} else {
				oModel.setProperty("/SaveEnabled", false);
				oModel.setProperty("/itensXprovider", []);
			}
			
			this.getView().setBusy(false);
		},

		onAdd: function (oEvent) {
			var tableContext = oEvent.getSource().getBindingContext("oModelCreateOffer").sPath;
			var oModel = this.getModel("oModelCreateOffer");

			var objProvider = oModel.getProperty(tableContext);

			objProvider.itens.map(function (item) {
				if (item.selected) {
					item.codeStatus = "1";
					item.status = "Incluído";
				}
			});

			oModel.setProperty(tableContext, objProvider);
		},

		onDelete: function (oEvent) {
			var tableContext = oEvent.getSource().getBindingContext("oModelCreateOffer").sPath;
			var oModel = this.getModel("oModelCreateOffer");

			var objProvider = oModel.getProperty(tableContext);

			objProvider.itens.map(function (item) {
				if (item.selected) {
					item.codeStatus = "2";
					item.status = "Não Incluído";
				}
			});

			oModel.setProperty(tableContext, objProvider);
		},

		onSaveOffer: function (tipoOperacao) {
			this.getView().setBusy(true);
			var oModel = this.getModel("oModelCreateOffer");
			var url = "/destinations/B1Connection/ofertainsere";

			var solicitante = oModel.getProperty("/defaultEmployeeID");
			var solicitanteNome = oModel.getProperty("/defaultEmployeeName");

			if (oModel.getProperty("/solicitanteColaboradorIDValue") &&
				oModel.getProperty("/SelectedRequester") === this.employeeString) {
				solicitante = oModel.getProperty("/solicitanteColaboradorIDValue");
				solicitanteNome = oModel.getProperty("/solicitanteColaboradorValue");
			} else if (oModel.getProperty("/solicitanteUsuarioIDValue") &&
				oModel.getProperty("/SelectedRequester") === this.userString) {
				solicitante = oModel.getProperty("/solicitanteUsuarioIDValue");
				solicitanteNome = oModel.getProperty("/solicitanteUsuarioValue");
			}

			var itens = oModel.getProperty("/Itens");
			var provider = oModel.getProperty("/providerItens");
			var itensXprovider = oModel.getProperty("/itensXprovider");

			itens = itens.map(function (item) {
				// var req;
				// var reqL = 
				return {
					"U_ItemCode": item.itemCode,
					"U_Descricao": item.itemDescription,
					"U_Fornecedores": item.providerCount,
					"U_DtNecessaria": item.requiredDate,
					"U_QtdeNecess": item.requiredQuantity,
					"U_Requisicao": 0,
					"U_RequisicaoL": 0
				};
			}.bind(oModel));

			provider = provider.map(function (item) {
				return {
					"U_FornCod": item.CardCode,
					"U_FornNome": item.CardName
				};
			}.bind(oModel));

			var auxProvider = [];

			for (var i = 0; i < itensXprovider.length; i++) {
				for (var j = 0; j < itensXprovider[i].itens.length; j++) {
					auxProvider.push({
						"U_FornCod": itensXprovider[i].CardCode, //CardCode
						"U_FornNome": itensXprovider[i].CardName, // CardName
						"U_ItemCode": itensXprovider[i].itens[j].itemCode,
						"U_Descricao": itensXprovider[i].itens[j].itemDescription,
						"U_Status": itensXprovider[i].itens[j].codeStatus, // 1 - Incluido 2- Não incluido
						"U_LineIdItem": itensXprovider[i].itens[j].lineIdItem,
						"U_QtdeDisp": 0,
						"U_Indisponivel": "N",
						"U_DtEntrega": null,
						"U_DtResposta": null,
						"U_HrReposta": null,
						"U_Desconto": 0,
						"U_PrecoDesc": 0,
						"U_Observacao": "",
						"U_StatusResposta": "1", // 1 Aberto 2 - Respondido
						"U_PrecoUnit": 0,
						"U_PrecoTotal": 0,
						"U_Unidade": ""
					});
				}
			}

			var obj = {
				"tipoOperacao": tipoOperacao,
				"idEmpresa": oModel.getProperty("/companySelectedKey"),
				"U_Empresa": oModel.getProperty("/companySelectedKey"),
				"servicoSL": "SDPC_UDO_OFT",
				"U_Departamento": oModel.getProperty("/department"),
				"U_Status": "1", // 2 - Aguardando evio / 2 - Enviado 
				"U_DtValidoAte": oModel.getProperty("/validUntil"),
				"U_DtDocumento": oModel.getProperty("/documentDate"),
				"U_DtNecessaria": oModel.getProperty("/requiredDate"),
				"U_DtLancto": oModel.getProperty("/releaseDate"),
				"U_Titular": oModel.getProperty("/owner"),
				"U_ID_Solicitante": solicitante,
				"U_SolicitanteNome": solicitanteNome,
				"U_Filial": oModel.getProperty("/branch"),
				"U_Requisicao": 0,
				"U_Observacao": oModel.getProperty("/observation"),
				"SDPC_OFT0Collection": itens,
				"SDPC_OFT1Collection": provider,
				"SDPC_OFT2Collection": auxProvider
			};

			var data = JSON.stringify(obj);

			var promise = this.callAjaxFunction(url, data, "POST");
			var bundle = this.getResourceBundle();

			promise.then(function (param) {
				if (param.message !== undefined) {
					MessageBox.alert(param.message, {
						onClose: function (oAction) {
							this.reloadModels();
						}.bind(this)
					});
				} else {
					MessageBox.alert(bundle.getText("sendOfferSuccess"), {
						onClose: function (oAction) {
							this.reloadModels();
						}.bind(this)
					});
				}
				
				this.getView().setBusy(false);
			}.bind(this), function (param) {
				bundle = this.getResourceBundle();
				MessageBox.alert(bundle.getText("systemUnavailable"));
			}.bind(this));
		},
		
		reloadModels: function () {
			var oModelCreateOffer = this.getModel("oModelCreateOffer");
			oModelCreateOffer.setData({});
			oModelCreateOffer.setProperty("/enabled", false);
			oModelCreateOffer.setProperty("/solicitanteColaboradorVisible", false);
			oModelCreateOffer.setProperty("/solicitanteUsuarioVisible", false);
			oModelCreateOffer.setProperty("/Itens", []);
			oModelCreateOffer.setProperty("/providerItens", []);
			this.getView().setBusy(false);
			
			this.onNavBack();	
		},

		onNavBack: function () {
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();
			this.getView().setBusy(false);

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteOffer", true);
			}
		}
	});
});