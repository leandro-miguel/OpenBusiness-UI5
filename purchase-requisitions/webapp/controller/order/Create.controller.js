sap.ui.define([
    "../BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/ui/core/library"
], function (Controller, JSONModel, MessageBox, Dialog, DialogType, Button, ButtonType, Text, MessageToast, coreLibrary) {
    "use strict";

    return Controller.extend("requisitions.requisitions.controller.order.Create", {
        onInit: function () {

            this.getView().setModel(new JSONModel(), "oModelCreateOrder");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteCreateOrder").attachPatternMatched(this._onObjectMatchedCreate, this);
            oRouter.getRoute("RouteDetailOrder").attachPatternMatched(this._onObjectMatchedDetail, this);
        },

        _onObjectMatchedCreate: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var oBundle = this.getResourceBundle();

            this.edit = false;

            oModel.setProperty("/ViewTitle", oBundle.getText("newOrder"));
            oModel.setProperty("/EditVisible", false);
            oModel.setProperty("/CreateVisible", true);
            oModel.setProperty("/approvalsVisible", false);
            oModel.setProperty("/Anexos", []);
            oModel.setProperty("/Enabled", false);
            oModel.setProperty("/PayEnabled", false);
            oModel.setProperty("/rowsCount", 0); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table
            oModel.setProperty("/dimension1Visible", false);
            oModel.setProperty("/dimension2Visible", false);
            oModel.setProperty("/dimension3Visible", false);
            oModel.setProperty("/dimension4Visible", false);
            oModel.setProperty("/dimension5Visible", false);
            oModel.setProperty("/downloadEnabled", false);
            oModel.setProperty("/CompanyEditable", true);
            oModel.setProperty("/updateUserDataVisible", true); // Exibe o botão de atualizar dados do usuário
            oModel.setProperty("/Editable", true);
            oModel.setProperty("/totalprice", "R$ 0,00");
            oModel.setProperty("/PartnerEnabled", false);
            oModel.setProperty("/PayToEnabled", false);
        },

        _onObjectMatchedDetail: function (oEvent) {  
            var obj = oEvent.getParameter("arguments");
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();

            this.edit = true;

            if (obj) {
                
                this.getView().setBusy(true);

                oModel.setProperty("/idEmpresa", obj.U_Empresa);
                oModelGeral.setProperty("/idEmpresa", obj.U_Empresa); // Caso a tela seja atualizada, preenche esse campo novamente, pois ele é preenchido na tela de lista e quando a tela atualiza, ele perde a referência.
                oModel.setProperty("/U_Filial_Nome", obj.U_Filial_Nome);
                oModel.setProperty("/DocNum", obj.DocNum);
                oModel.setProperty("/DocEntryDocumento", obj.DocEntryDocumento);
                oModel.setProperty("/U_Resu_work_indi", obj.U_Resu_work_indi);
                oModel.setProperty("/U_Resu_work", obj.U_Resu_work);
                oModel.setProperty("/ViewTitle", oBundle.getText("detailOrder"));
                oModel.setProperty("/Enabled", true);
                oModel.setProperty("/Editable", false);
                oModel.setProperty("/EditVisible", true);
                oModel.setProperty("/approvalsVisible", true);
                oModel.setProperty("/CompanyEditable", false);
                oModel.setProperty("/updateUserDataVisible", false); // Esconde o botão de atualizar dados do usuário
                oModel.setProperty("/CreateVisible", false);
                oModel.setProperty("/Anexos", []);
                oModel.setProperty("/rowsCount", 0); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table
                oModel.setProperty("/dimension1Visible", false);
                oModel.setProperty("/dimension2Visible", false);
                oModel.setProperty("/dimension3Visible", false);
                oModel.setProperty("/dimension4Visible", false);
                oModel.setProperty("/dimension5Visible", false);
                oModel.setProperty("/downloadEnabled", true);
                oModel.setProperty("/PartnerEnabled", true);
                oModel.setProperty("/PayToEnabled", true);

                if (obj.U_Resu_work === "Aprov" || obj.U_Resu_work === "Recu" || obj.canceled === "Y") {
                    oModel.setProperty("/ApprovedEnabled", false);
                } else {
                    oModel.setProperty("/ApprovedEnabled", true);
                   
                }
                this.getOrder(obj);
            }
        },

        getOrder: function (obj) {  
            
            var service = "PurchaseOrders";

            if (obj.U_Resu_work === "null" || obj.U_Resu_work === "Recu") {
                service = "Drafts";
            }

            var url = "/destinations/B1Connection/pedidocomprabuscar";

            var data = JSON.stringify({
                "idEmpresa": obj.U_Empresa,
                "servicoSL": service + "?$filter=DocEntry eq " + obj.DocEntryDocumento + "&$select=BPL_IDAssignedToInvoice,DocDate,DocDueDate,TaxDate,CardName,CardCode,DocTotalSys,Comments,Address2,Address,AgentCode,JournalMemo,PaymentMethod,ContactPersonCode,PaymentGroupCode,PayToCode,DocumentLines,DocumentsOwner,AttachmentEntry,TransportationCode,DocNum"
                // "servicoSL": service + "?$filter=DocEntry eq " + obj.DocEntryDocumento + "&$select=BPL_IDAssignedToInvoice,DocDate,DocDueDate,TaxDate,CardName,CardCode,DocTotalSys,Comments,Address2,Address,AgentCode,JournalMemo,PaymentMethod,ContactPersonCode,PaymentGroupCode,PayToCode,DocumentLines,DocumentsOwner,TransportationCode,DocNum"
            });

            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                var oModel = this.getModel("oModelCreateOrder");
                if (param.value.length > 0) {
                    this.getView().setBusy(false);
                    //valores diretos
                    oModel.setProperty("/companySelectedKey", obj.U_Empresa);//Empresa
                    oModel.setProperty("/branch", param.value[0].BPL_IDAssignedToInvoice);//Filial
                    oModel.setProperty("/releaseDate", param.value[0].DocDate); //Data de Lançamento
                    oModel.setProperty("/deliveryDate", param.value[0].DocDueDate); //Data de Entrega
                    oModel.setProperty("/dataDocument", param.value[0].TaxDate);//Data do Documento
                    oModel.setProperty("/onLineVendorValue", param.value[0].CardCode);//Fornecedor
                    oModel.setProperty("/onLineVendorValueDesc", param.value[0].CardName);//Fornecedor
                    oModel.setProperty("/BusinessPartCode", param.value[0].CardCode);
                    oModel.setProperty("/rows", param.value[0].DocumentLines); // Itens
                    oModel.setProperty("/totalprice", this.setCurrency(param.value[0].DocTotalSys.toFixed(2).toString())); // Preço Total
                    oModel.setProperty("/documentsOwnerName", param.value[0].DocumentsOwner); //Titulares
                    oModel.setProperty("/comments", param.value[0].Comments); // Observações
                    oModel.setProperty("/devileryPoint", param.value[0].Address2); //Ponto de Entrega
                    oModel.setProperty("/Diary", param.value[0].JournalMemo);//Observação do diário
                    oModel.setProperty("/ShippingName", param.value[0].TransportationCode);//Tipo de Envio
                    oModel.setProperty("/formaPagamentoKey", param.value[0].PaymentMethod);//Forma de Pagamento
                    oModel.setProperty("/condicaoPgtoKey", param.value[0].PaymentGroupCode);//Condições de pagamento
                    oModel.setProperty("/attachmentEntry", param.value[0].AttachmentEntry); // Chave pra realizar download dos anexos
                    oModel.setProperty("/pagarAKey", param.value[0].PayToCode);
                    oModel.setProperty("/ContactPersonCode", param.value[0].ContactPersonCode);
                    
                    this.setPayToList(oModel);
                    this.setUDFs(oModel); //Cria os campos UDFs
                    this.setPaymentForms(oModel);
                    this.setPaymentTermsTypes(oModel);
                    this.setBranches(obj.U_Empresa); //Preenche as Filiais baseado na empresa selecionada
                    this.getDocumentLines(oModel, param.value[0].DocumentLines); // Item do Pedido de compra
                    this.getDocumentOwnerName(oModel, param.value[0].DocumentsOwner); // Preenche o nome do Titular
                    this.getAttachments(oModel, param.value[0].AttachmentEntry); // Preenche os Anexos
                    this.getTransport(oModel, param.value[0].TransportationCode);
                    this.getApprovalData(oModel, obj.DocNum);//Aprovadores
					this.getStatusData(oModel, obj.U_Resu_work);//Status Aprovação
                    this.getContactPerson(oModel,param.value[0].CardCode);
                    this.getNumSAP(oModel, obj.U_Resu_work, obj.U_Resu_work_indi, param.value[0].DocNum);
                    this.onPayToSelect(oModel);
                    
                    oModel.setProperty("/busyTable", true);
                    
                    if(this.getAttachments(oModel, param.value[0].AttachmentEntry) != null){
                        oModel.setProperty("/AnexosBusy", true);  
                    }else{
                        oModel.setProperty("/AnexosBusy", false);  
                    }
                                 
                } else {
                    this.getView().setBusy(false);

                    var oBundle = this.getResourceBundle();
                    MessageBox.alert(oBundle.getText("orderNotFound"));
                }
            }.bind(this), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));

                oModel.setProperty("/ActionButtonEnabled", false);
            }.bind(this));
        },

        getContactPerson(oModel, CardCode){
               
            var oModel = this.getModel("oModelCreateOrder");
            oModel.setProperty("/contactPersonBusy", true);
            
			var url = "/destinations/B1Connection/fornecedorbuscar";
        
            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter=CardCode eq '" + CardCode + "'"
            });
            
            var promise = this.callAjaxFunction(url, data, "POST");
            
            promise.then(function (param) {
                if (param != "Erro Not Found" && param.value.length > 0) {
                    
					for (var i = 0; i < param.value.length; i++) {
                        if (param.value[i].CntctPrsn != null) {
                           
							oModel.setProperty("/contactPerson", param.value[i].CntctPrsn);
                            oModel.setProperty("/contactPersonBusy", false);
						}	
					}  
                } 
            }.bind(this));        
        },

        getTransport: function (oModel, TransportationCode){
           
            if (TransportationCode > 0) {
                var url = "/destinations/B1Connection/tipoenvio";

                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "ShippingTypes?$filter=Code eq " + TransportationCode
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param.value) {
                        //oModel.setProperty("/ShippingName", param.value[0].Code);
                        oModel.setProperty("/ShippingName", param.value[0].Name);
                    }
                }.bind(this), function (param) {
                    var oBundle = this.getResourceBundle();
                    MessageBox.alert(oBundle.getText("systemUnavailable"));
                }.bind(this));
            } else {
                oModel.setProperty("/documentsOwnerNameBusy", false);
                oModel.setProperty("/ShippingName", "");
            }

        },

        getDocumentLines: function (oModel, DocumentLines) {
            var urlVendorDesc = "/destinations/B1Connection/fornecedorbuscar";
            var urlDimension = "/destinations/B1Connection/dimensaobuscar";
            var filterVendorDesc = "";

            DocumentLines.forEach(function (item) {
                filterVendorDesc += "CardCode eq '" + item.LineVendor + "' or ";
            });

            filterVendorDesc = filterVendorDesc.slice(0, -4);

            var dataVendorDesc = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "BusinessPartners?$select=CardCode,CardName&$filter=" + filterVendorDesc
            });

            var dataDimension = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "Dimensions?$filter=IsActive eq 'tYES'"
            });

            var promiseVendorDesc = this.callAjaxFunction(urlVendorDesc, dataVendorDesc, "POST");
            var promiseDimension = this.callAjaxFunction(urlDimension, dataDimension, "POST");
          
            Promise.all([promiseVendorDesc, promiseDimension]).then(function (param) {
                if (param[0].value.length > 1) { // Preenchedo a descrição do Fornecedor
                    for (var i = 0; i < param[0].value.length; i++) {
                        for (var j = 0; j < DocumentLines.length; j++) {
                            if (DocumentLines[j].LineVendor === param[0].value[i].CardCode) {
                                DocumentLines[j].LineVendorDesc = param[0].value[i].CardName;
                            }
                        }
                    }
                } else if (param[0].value.length > 0) {
                    for (var k = 0; k < DocumentLines.length; k++) {
                        DocumentLines[k].LineVendorDesc = param[0].value[0].CardName;
                    }
                }

                if (param[1].value) { // Exibindo as colunas das dimensões
                    for (var i = 0; i < param[1].value.length; i++) {
                        oModel.setProperty("/dimension" + param[1].value[i].DimensionCode + "Visible", param[1].value[i].IsActive === "tYES" ? true :
                            false);
                        oModel.setProperty("/dimension" + param[1].value[i].DimensionCode + "Label", param[1].value[i].DimensionDescription);
                    }
                }

                var lines = [];
                var aux = 0;

                DocumentLines.forEach(function (item) {
                    aux++;
                    lines.push({
                        "itemId": aux,
                        "itemNumber": item.ItemCode,
                        "itemNumberDesc": item.ItemDescription,
                        "category": item.U_SDPC_Desc_Categ,
                        "discount": parseFloat(item.DiscountPercent),
                        "priceInfo": item.UnitPrice ? this.setCurrency(item.UnitPrice.toFixed(2).toString()) : "",
						"totalPrice": item.LineTotal ? this.setCurrency(item.LineTotal.toFixed(2).toString()) : "",
                        "necessaryAmount": item.Quantity,
                        "dimension1": item.CostingCode,
                        "dimension2": item.CostingCode2,
                        "dimension3": item.CostingCode3,
                        "dimension4": item.CostingCode4,
                        "dimension5": item.CostingCode5,
                        "projectCode": item.ProjectCode,
                        "umbrellaCode": item.UmbrellaCode
                    });
                }.bind(this));

                oModel.setProperty("/rowsCount", lines.length); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table e ajuda a marcar o ID do item
                oModel.setProperty("/rows", lines);
                oModel.setProperty("/busyTable", false);

            }.bind(this));
        },

        getDocumentOwnerName: function (oModel, DocumentsOwner) {
            if (DocumentsOwner) {
               
                var url = "/destinations/B1Connection/colaboradores";

                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "EmployeesInfo?$filter=EmployeeID eq " + DocumentsOwner + "&$select=EmployeeID,FirstName"
                });
                
                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param.value) {
                        oModel.setProperty("/documentsOwnerNameBusy", false);
                        oModel.setProperty("/documentsOwnerID", param.value[0].EmployeeID);
                        oModel.setProperty("/documentsOwnerName", param.value[0].FirstName);
                    }else{
                        oModel.setProperty("/documentsOwnerNameBusy", false);
                    }
                }.bind(this), function (param) {
                    var oBundle = this.getResourceBundle();
                    MessageBox.alert(oBundle.getText("systemUnavailable"));
                }.bind(this));
            } else {
                oModel.setProperty("/documentsOwnerNameBusy", false);
            }
            
        },

        getApprovalData: function (oModel, docNum) {            
            oModel.setProperty("/ApprovalsBusy", true);

            var url = "/destinations/B1Connection/aprovadores";
            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "SDPC_UDO(" + docNum + ")/SDPC_WORK_STAT0Collection"
            });
            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                oModel.setProperty("/Approvals", param.SDPC_WORK_STAT0Collection);
                oModel.setProperty("/ApprovalsBusy", false);
            }.bind(this), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));

                oModel.setProperty("/ApprovalsBusy", false);
            }.bind(this));
        },

        getStatusData: function (oModel, U_Resu_work) {     
        
            var statusAprov = "Pendente";

            if (U_Resu_work === "Aprov") {
                statusAprov = "Aprovado";
            }
            if (U_Resu_work === "Recu") {
                statusAprov = "Rejeitado";
            }

            oModel.setProperty("/status", statusAprov);
        },

        getAttachments: function (oModel, AttachmentEntry) { // Neste metódo primeiro é recuperado todos os anexos do documento e após isso é recuperado o arquivo em Base64 e ai sim montado na tela os anexos
    
            if (AttachmentEntry) {
				var url = "/destinations/B1Connection/anexobusca";
				var data = JSON.stringify({
					"idEmpresa": oModel.getProperty("/idEmpresa"),
					"servicoSL": "Attachments2(" + AttachmentEntry + ")"
				});

				var promise = this.callAjaxFunction(url, data, "POST");

				promise.then(function (param) {
					if (param.Attachments2_Lines) {
						var aAux = [];
  
						param.Attachments2_Lines.forEach(function (item) {                           
							aAux.push({
								"fileName": item.U_SDPC_FILENAME + "." + item.FileExtension,
								"fileNameDownload": item.FileName + "." + item.FileExtension,
								"fileNameWithoutExtension": item.U_SDPC_FILENAME,
								"fileExtension": item.FileExtension,
								"fileContent": ""
							});
						}.bind(this));

                        oModel.setProperty("/Anexos", aAux);
                        oModel.setProperty("/AnexosBusy", false);

					} else {
						oModel.setProperty("/AnexosBusy", false);
					}
				}.bind(this), function (param) {
					var oBundle = this.getResourceBundle();
					MessageBox.alert(oBundle.getText("systemUnavailable"));
					oModel.setProperty("/AnexosBusy", false);
				}.bind(this));

			} else {
				oModel.setProperty("/AnexosBusy", false);
			}
        },
  
		base64ToArrayBuffer: function (base64) {
			var binary_string = window.atob(base64);
			var len = binary_string.length;
			var bytes = new Uint8Array(len);
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i);
			}
			return bytes.buffer;
		},

        arrayBufferToBase64: function (buffer) {
            var binary = '';
            var bytes = new Uint8Array(buffer);
            var len = bytes.byteLength;
            for (var i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        },

        getNumSAP: function (oModel, U_Resu_work, U_Resu_work_indi, DocNum) {
            
			if (U_Resu_work !== "null" || U_Resu_work_indi !== "null") {
				var oBundle = this.getResourceBundle();
				oModel.setProperty("/numSAP", " - " + oBundle.getText("numSAP") + ": " + DocNum);
			} else {
				oModel.setProperty("/numSAP", "");
			}
		},

        // --------------------------------------------------------
        // -------------- Header Actions --------------------------
        // --------------------------------------------------------

        onCreateOrder: function () {
            var oModel = this.getModel("oModelCreateOrder");
            var oBundle = this.getResourceBundle();

            this.getView().setBusy(true);

            if (this.validateFields(oModel)) { // Valida todos os campos do cabeçalho e da lista de items (caso tenha algum item)
                if (oModel.getProperty("/rows")) { // Valida se existe alguma linha na lista de items
                    
                    var obj = this.buildObject(oModel);
                    var url = "/destinations/B1Connection/pedidocompraadicionar";

                    if (this.edit) {
						url = "/destinations/B1Connection/pedidocompraatualizar";
						obj.servicoSL = "Drafts";
						obj.campoChave = oModel.getProperty("/DocEntryDocumento");                      
					}

					var data = JSON.stringify(obj);

					var promise = this.callAjaxFunction(url, data, "POST");

					promise.then(function (param) {
						if (param.error !== undefined) {
							MessageBox.alert(oBundle.getText("sendOrderError") + param.error.message.value);
						} else {
							if (param.message !== undefined) {
								if (param.message === "Registro atualizado com sucesso") {
									MessageBox.alert(oBundle.getText("sendOrderMessage") + " " + param.message, {
										onClose: function (oAction) {
											if (this.edit) {
												oModel.setProperty("/ViewTitle", oBundle.getText("detailOrder"));
												oModel.setProperty("/Enabled", true);
												oModel.setProperty("/Editable", false);
												oModel.setProperty("/EditVisible", true);
												oModel.setProperty("/CompanyEditable", false);
												oModel.setProperty("/CreateVisible", false);
											}
										}.bind(this)
									});
								} else {
									MessageBox.alert(oBundle.getText("sendOrderMessage") + " " + param.message);
								}
							} else {
								MessageBox.alert(oBundle.getText("sendOrderSuccess"), {
									onClose: function (oAction) {
										this.getView().setBusy(false);

										if (!this.detail) {
											window.location.reload();
										} else {
											oModel.setProperty("/ViewTitle", oBundle.getText("detailOrder"));
											oModel.setProperty("/Enabled", true);
											oModel.setProperty("/Editable", false);
											oModel.setProperty("/EditVisible", true);
											oModel.setProperty("/CompanyEditable", false);
											oModel.setProperty("/CreateVisible", false);
										}
									}.bind(this)
								});
							}
						}

						this.getView().setBusy(false);
					}.bind(this), function (param) {
						var oBundle = this.getResourceBundle();
						MessageBox.alert(oBundle.getText("systemUnavailable"));
						this.getView().setBusy(false);
					}.bind(this));
				} else {
					MessageBox.alert(oBundle.getText("missingTableItems"));
					this.getView().setBusy(false);
				}
			} else {
				MessageBox.alert(oBundle.getText("sendMissingFields"));
				this.getView().setBusy(false);
			}
		},


        validateFields: function (oModel) {
            var auxCount = 0;

            if (!oModel.getProperty("/companySelectedKey") || oModel.getProperty("/companySelectedKey").length === 0) {
                oModel.setProperty("/companySelectedKeyState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/companySelectedKeyState", "None");
            }

            if (!oModel.getProperty("/branch") || oModel.getProperty("/branch").length === 0) {
                oModel.setProperty("/branchState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/branchState", "None");
            }

            if (!oModel.getProperty("/onLineVendorValue") || oModel.getProperty("/onLineVendorValue").length === 0) {
                oModel.setProperty("/vendorState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/vendorState", "None");
            }

            if (!oModel.getProperty("/deliveryDate") || oModel.getProperty("/deliveryDate").length === 0) {
                oModel.setProperty("/deliveryDateState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/deliveryDateState", "None");
            }

            if (oModel.getProperty("/rows")) {
                oModel.getProperty("/rows").forEach(function (item) {
                    if (!item.itemNumber || item.itemNumber.length === 0) {
                        item.itemNumberState = "Error";
                        auxCount++;
                    } else {
                        item.itemNumberState = "None";
                    }

                    if (!item.necessaryAmount || item.necessaryAmount.length === 0) {
                        item.necessaryAmountState = "Error";
                        auxCount++;
                    } else {
                        item.necessaryAmountState = "None";
                    }
                }.bind(this));
            }

            oModel.updateBindings();

            if (auxCount > 0) {
                return false;
            } else {
                return true;
            }
        },

        buildObject: function (oModel) {   
            var oModelUser = this.getModel("userModel");
            var objOrder = {};
            var lines = [];

            oModel.getProperty("/rows").forEach(function (item) {
                lines.push({
                    "ItemCode": item.itemNumber,
                    "ItemDescription": item.itemNumberDesc,
                    "U_SDPC_Desc_Categ": item.category,
                    "Price": item.priceInfo ? this.getCurrency(item.priceInfo) : 0,
                    "UnitPrice": item.priceInfo ? this.getCurrency(item.priceInfo) : 0,
                    "DiscountPercent": item.discount ? this.getCurrency(item.discount) : 0,
                    "Quantity": item.necessaryAmount,
                    "CostingCode": item.dimension1,
                    "CostingCode2": item.dimension2,
                    "CostingCode3": item.dimension3,
                    "CostingCode4": item.dimension4,
                    "CostingCode5": item.dimension5,
                    "ProjectCode": item.projectCode,
                    "UmbrellaCode": item.UmbrellaCode //Conferir depois se está pegando o campo mesmo

                });
            }.bind(this));

            var anexos = oModel.getProperty("/Anexos");
            var auxAnexos = [];

            if (anexos.length > 0) {
                anexos.forEach(function (item) {                    
                    auxAnexos.push({
                        "Arquivo": this.arrayBufferToBase64(item.fileContent),
                        "Nome": item.fileNameWithoutExtension,
                        "Extensao": item.fileExtension
                    });
                }.bind(this));
            }

            var UDFs = oModel.getProperty("/UDFs");
			var panelContent = this.getView().byId("idPnl").getItems();

			if (panelContent && UDFs && UDFs.length > 0) {
				for (var i = 0; i < UDFs.length; i++) {
					var panelContentIndex = panelContent.map(function (e) {
						return e.getId();
					}).indexOf(UDFs[i].Name);

					if (UDFs[i].ValidValuesMD.length > 0) {
						var combobox = panelContent[panelContentIndex];

						if (combobox.getSelectedItem() != null) {
							objOrder["U_" + UDFs[i].Name] = combobox.getSelectedItem().getKey();
						}
					} else {
						var input = panelContent[panelContentIndex];
						if (input.getValue() != "") {
							objOrder["U_" + UDFs[i].Name] = input.getValue();
						}
					}
				}
			}

            objOrder.AnexoAlterado = oModel.getProperty("/anexoAlterado") ? oModel.getProperty("/anexoAlterado") : false;
            objOrder.Anexos = auxAnexos;
            objOrder.idEmpresa = oModel.getProperty("/companySelectedKey");
            objOrder.servicoSL = "PurchaseOrders";
            objOrder.Usuario = oModelUser.getProperty("/userId");
            objOrder.BPL_IDAssignedToInvoice = parseInt(oModel.getProperty("/branch"), 0);
            objOrder.CardCode = oModel.getProperty("/onLineVendorValue");
            objOrder.CardName = oModel.getProperty("/onLineVendorValueDesc");
            objOrder.ContactPersonCode = oModel.getProperty("/ContactPersonCode");
            objOrder.DocDate = oModel.getProperty("/releaseDate");
            objOrder.DocDueDate = oModel.getProperty("/deliveryDate");
            objOrder.TaxDate = oModel.getProperty("/dataDocument");
            objOrder.DocumentsOwner = oModel.getProperty("/documentsOwnerID");//Titular
            objOrder.Comments = oModel.getProperty("/comments") ? oModel.getProperty("/comments").substr(0, 254) : "";
            objOrder.Address = oModel.getProperty("/BillToText");
            objOrder.DocTotal = oModel.getProperty("/totalprice") ? this.getCurrency(oModel.getProperty("/totalprice")) : 0
            objOrder.PaymentGroupCode = oModel.getProperty("/condicaoPgtoKey");
            objOrder.PaymentMethod = oModel.getProperty("/formaPagamentoKey");
            objOrder.TransportationCode = oModel.getProperty("/ShippingCode");
            objOrder.PayToCode = oModel.getProperty("/pagarAKey") ? oModel.getProperty("/pagarAKey") : oModel.getProperty("/billToDefault");
            objOrder.DocumentLines = lines;

            return objOrder;
        },

        editOrder: function () {
            var oModel = this.getModel("oModelCreateOrder");
            var oBundle = this.getResourceBundle();

            oModel.setProperty("/ViewTitle", oBundle.getText("editOrder"));
            oModel.setProperty("/EditVisible", false);
            oModel.setProperty("/CreateVisible", true);
            oModel.setProperty("/Enabled", true);
            oModel.setProperty("/CompanyEditable", false);
            oModel.setProperty("/Editable", true);            
        },

        cancelOrder: function () {
            var oBundle = this.getResourceBundle();
            var oModel = this.getModel("oModelCreateOrder");

            this.oCancelDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("cancel"),
                content: new Text({
                    text: oBundle.getText("cancelEdit")
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("confirm"),
                    press: function () {
                        window.location.reload(false);
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function () {
                        this.oCancelDialog.destroy();
                    }.bind(this)
                })
            });

            this.oCancelDialog.open();
        },

        navBack: function () {
            window.history.go(-1);
        },

        // --------------------------------------------------------
        // -------------- onCompanySelect routine -----------------
        // --------------------------------------------------------

        onCompanySelect: function (oEvent) {
            var idEmp = oEvent.getParameter("selectedItem").getProperty("key"),
                oModel = this.getModel("oModelCreateOrder"),
                oModelUserData = this.getModel("userModel"),
                oModelGeral = this.getModel("oModel");

            oModelGeral.setProperty("/idEmpresa", idEmp);
            oModel.setProperty("/idEmpresa", idEmp);
            oModel.setProperty("/companySelected", true);
            oModel.setProperty("/busyTable", false);

            //this.setOrderName(oModel, oModelUserData); // Preenche o nome do Solicitante

            //this.setDepartmentsComboBox(oModel); // Preenche o combobox de Departamento

            this.setBranches(idEmp); // Preenche as Filiais baseado na empresa selecionada

            this.setDateValues(); // Preenche os campos de data

            this.setDimensions(oModel); // Altera as colunas da tabela com as dimensões que o cliente possui

            this.setUDFs(oModel); // Cria os campos UDFs

            this.setPaymentTermsTypes(oModel); //Preenche os termos de pagamentos

            this.setPaymentForms(oModel); //Preenche as Formas de Pagamento

            oModel.setProperty("/Enabled", true); // Habilta os campos a serem modificados pelo usuário

            oModel.setProperty("/busyTable", true);

            oModel.setProperty("/EditVisible", false);

            oModel.setProperty("/PartnerEnabled", true);
            debugger
            switch (oModel.getProperty("/idEmpresa")){
                case "1" : 
                oModel.setProperty("/Visible", false);
                break;
                case "2" : 
                oModel.setProperty("/Visible", false);
                break;
                case "3" : 
                oModel.setProperty("/Visible", false);
                break;
                case "4" : 
                oModel.setProperty("/Visible", false);
                break;
                default:
                oModel.setProperty("/Visible", true);
            }
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
        
        setUDFs: function (oModel, skip = 0) {

            var panel = this.getView().byId("idPnl");
			panel.setBusy(true);

			var url = "/destinations/B1Connection/camposusuariospedcompras";
			var servicoSL = "UserFieldsMD?$filter=startswith(TableName, 'OPOR')";

			if (skip > 0) {
				servicoSL = "UserFieldsMD?$filter=startswith(TableName, 'OPOR')&$skip=" + skip;
			}

			var data = JSON.stringify({
				"idEmpresa": oModel.getProperty("/idEmpresa"),
				"servicoSL": servicoSL
			});

			var promise = this.callAjaxFunction(url, data, "POST");

			promise.then(function (param) {
				if (param && param.value && param.value.length > 0) {
					var oModelCreateOrder = this.getModel("oModelCreateOrder");

					for (var i = 0; i < param.value.length; i++) {
						if (param.value[i].Type == "db_Date") {
							var datePicker = new sap.m.DatePicker({
								id: param.value[i].Name,
								valueFormat: "yyyy-MM-dd",
								width: "300px",
                                editable: "{oModelCreateOrder>/Editable}"
							});

							var label = new sap.m.Label({
								text: param.value[i].Description,
								labelFor: param.value[i].Name
							});

							panel.addItem(label);
							panel.addItem(datePicker);

						} else {
							if (param.value[i].ValidValuesMD.length > 0) {
								var select = new sap.m.Select({
									id: param.value[i].Name,
									forceSelection: false,
									width: "300px",
									items: {
										path: "oModelCreateOrder>/" + param.value[i].Name,
										template: new sap.ui.core.Item({
											text: "{oModelCreateOrder>Description}",
											key: "{oModelCreateOrder>Value}",
										})
									},
                                    editable: "{oModelCreateOrder>/Editable}"
								});
								var label = new sap.m.Label({
									text: param.value[i].Description,
									labelFor: param.value[i].Name
								});

								oModelCreateOrder.setProperty("/" + param.value[i].Name, param.value[i].ValidValuesMD);

								panel.addItem(label);
								panel.addItem(select);

							} else {
								var input = new sap.m.Input({
									id: param.value[i].Name,
									showValueHelp: false,
									type: sap.m.InputType.Text,
									value: "",
									width: "300px",
                                    editable: "{oModelCreateOrder>/Editable}"
								});

								var label = new sap.m.Label({
									text: param.value[i].Description,
									labelFor: param.value[i].Name
								});

								panel.addItem(label);
								panel.addItem(input);
							}
						}
					}

					if (!oModelCreateOrder.getProperty("/UDFs") || oModelCreateOrder.getProperty("/UDFs").length === 0) {
						oModelCreateOrder.setProperty("/UDFs", param.value);
					} else {
						oModelCreateOrder.setProperty("/UDFs", param.value.concat(oModelCreateOrder.getProperty("/UDFs")));
					}

					if (param.value.length === 20) {
						this.setUDFs(oModel, skip + 20);
					} else {
						panel.setBusy(false);
					}
				} else {
					panel.setBusy(false);
				}
			}.bind(this), function (param) {
				var oBundle = this.getResourceBundle();
				MessageBox.alert(oBundle.getText("systemUnavailable"));
				panel.setBusy(false);
			}.bind(this));
		},

        // setComboBoxItem: function (oModel, value) {
        //     var comboBox = this.byId(comboBoxId).getItems();

        //     for (var i = 0; i < comboBox.length; i++) {
        //         if (comboBox[i].getProperty("text") === value) { }
        //     }
        // },

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

            // var oModel = this.getModel("oModelCreateOrder");

            this.byId("dataEntrega").setMinDate(new Date());
            this.byId("dataLancamento").setDateValue(new Date());
            this.byId("dataDocumento").setDateValue(new Date());
        },

        // setOrderName: function (oModel, oModelUserData) {
        //  
        //     var url = "/destinations/B1Connection/colaboradores";

        //     var data = JSON.stringify({
        //         "idEmpresa": oModel.getProperty("/idEmpresa"),
        //         "servicoSL": "EmployeesInfo?$filter=U_SDPC_Usuario eq '" + oModelUserData.getProperty("/userId") + "'"
        //     });

        //     var promise = this.callAjaxFunction(url, data, "POST");

        //     promise.then(function (param) {
        //         if (param.value) {
        //             oModel.setProperty("/SelectedOrder", "Colaborador");

        //             oModel.setProperty("/solicitanteLabelVisible", true);
        //             oModel.setProperty("/solicitanteColaboradorVisible", true);
        //             oModel.setProperty("/solicitanteColaboradorValue", param.value[0].FirstName);
        //             oModel.setProperty("/RequestTypeBusy", false);

        //             oModel.setProperty("/defaultEmployeeID", param.value[0].EmployeeID);
        //             oModel.setProperty("/defaultEmployeeName", param.value[0].FirstName);
        //         } else {
        //             MessageBox.alert(param);
        //         }
        //     }.bind(this), function (param) {
        //         var oBundle = this.getResourceBundle();
        //         MessageBox.alert(oBundle.getText("systemUnavailable"));
        //     }.bind(this));
        // },

        // setDepartmentsComboBox: function (oModel) {
        //     
        //     var url = "/destinations/B1Connection/departamento";
        //     var data = JSON.stringify({
        //         "idEmpresa": oModel.getProperty("/idEmpresa"),
        //         "servicoSL": "Departments"
        //     });

        //     var promise = this.callAjaxFunction(url, data, "POST");

        //     promise.then(function (param) {
        //         var data = [];
        //         data.push({
        //             Name: "",
        //             Code: ""
        //         });

        //         if (param.value) {
        //             for (var i = 0; i < param.value.length; i++) {
        //                 data.push({
        //                     Name: param.value[i].Name,
        //                     Code: param.value[i].Code
        //                 });
        //             }

        //             oModel.setProperty("/Departments", data);
        //             oModel.setProperty("/DepartmentsBusy", false);
        //         } else {
        //             MessageBox.alert(param);
        //         }
        //     }.bind(this), function (param) {
        //         var oBundle = this.getResourceBundle();
        //         MessageBox.alert(oBundle.getText("systemUnavailable"));
        //     }.bind(this));
        // },

        setDimensions: function (oModel) {
            
            var url = "/destinations/B1Connection/dimensaobuscar";

            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "Dimensions?$filter=IsActive eq 'tYES'"
            });

            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                if (param.value) {
                    for (var i = 0; i < param.value.length; i++) {
                        this.setProperty("/dimension" + param.value[i].DimensionCode + "Visible", param.value[i].IsActive === "tYES" ? true : false);
                        this.setProperty("/dimension" + param.value[i].DimensionCode + "Label", param.value[i].DimensionDescription);
                    }
                } else {
                    MessageBox.alert(param);
                }

                oModel.setProperty("/busyTable", false);
            }.bind(oModel), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));
            }.bind(this));
        },

        // --------------------------------------------------------
        // ---------------------- Business Partners ---------------
        // --------------------------------------------------------

        onLinePartnerValueSetManual: function (oEvent) {
            var manualValue = oEvent.getParameters().value;
            var manualValueUp = manualValue.toUpperCase();
            var oModel = this.getModel("oModelCreateOrder");
      
            oModel.setProperty("/onLineVendorBusy", true);
            oModel.setProperty("/onLineVendorValue", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função
            oModel.setProperty("/contactPerson", "");
           
            if (manualValue.replace(/\s/g, "") !== "") {
          

                var url = "/destinations/B1Connection/fornecedorbuscar";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter= BPLId eq " + oModel.getProperty("/branch") + " and CardCode eq '" + manualValueUp + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {

                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty("/contactPerson", param.value[0].CntctPrsn);
                        oModel.setProperty("/ContactPersonCode", param.value[0].CntctCode);
                        oModel.setProperty("/onLineVendorValue", param.value[0].CardCode);
                        oModel.setProperty("/onLineVendorValueDesc",param.value[0].CardName);
                        oModel.setProperty("/BusinessPartCode", param.value[0].CardCode);
                        oModel.setProperty("/onLineVendorBusy", false);
                       
                        oModel.setProperty("/PayEnabled", true);
                        oModel.setProperty("/PayToBusy", true);

                        this.setPayToList(oModel);                                          
                    } 
                    else {
                        oModel.setProperty("/onLineVendorValue", "");
                       
                    }
                    oModel.setProperty("/onLineVendorBusy", false);
                }.bind(this), 
                function (param) {
                    oModel.setProperty("/onLineVendorValue", "");
                    oModel.setProperty("/onLineVendorBusy", false); 
                });
            }
            else {
                oModel.setProperty("/onLineVendorValue", "");
                oModel.setProperty("/onLineVendorBusy", false);
            }
           
        },

        onLinePartnerHelpRequest: function (oEvent) {
            
            var oModel = this.getModel("oModelCreateOrder");
            this.openFragmentAndLoad("fragments_help", "PartnerHelpDialog", "fornecedorbuscar", "/partnersCode", "/partnerBusy",
            "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter= BPLId eq " + oModel.getProperty("/branch"), false )
        },

        onPartnerHelpSearch: function (oEvent) {
       
            var sQuery = oEvent.getSource().getValue();
            var UpperSquery = sQuery.toUpperCase();
            var oModel = this.getModel("oModelCreateOrder");
            var servicoSL = "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter=BPLId eq " + oModel.getProperty("/branch");
        
            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                servicoSL = servicoSL + " and (substringof(CardName,'" + UpperSquery + "') or substringof(CardCode,'" + UpperSquery + "')";
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + " or substringof(CardName,'" + upperCase + "') or substringof(CardName,'" + lowerCase +
                    "') or substringof(CardName,'" +
                    nameString + "') or substringof(CardCode,'" + upperCase + "'))";
            }

            this.searchDialog("fornecedorbuscar",
                servicoSL,
                "/partnersCode",               
                "/partnerBusy");
        },

        onPartnerHelpSave: function (oEvent) {
         
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var cardCode = oModelGeral.getProperty(sPath).CardCode;
            var cardName = oModelGeral.getProperty(sPath).CardName;
            var ContactPersonCode = 0;

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
                        oModelGeral.setProperty(sPath + "/LineVendorSelected", false);
                        oModel.setProperty("/BusinessPartCode", cardCode);
                        oModel.setProperty("/CardName", cardName);
                        oModel.setProperty("/onLineVendorValue", cardCode);
                        oModel.setProperty("/onLineVendorValueDesc", cardName);
                        oModel.setProperty("/contactPerson", oModelGeral.getProperty(sPath).CntctPrsn);
                        oModel.setProperty("/contactPersonBusy", false);

                        oModel.setProperty("/ContactPersonCode", oModelGeral.getProperty(sPath).CntctCode);
 
                        this.oApproveDialog.destroy();
                        this.PartnerHelpDialog.close();
                       
                        this.setPayToList(oModel);
                        oModel.setProperty("/PayEnabled", true);
                        oModel.setProperty("/PayToBusy", true);

                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/LineVendorSelected", false);
                        this.oApproveDialog.destroy();

                        
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();

            oModel.setProperty("/contactPersonBusy", true);
        },

        onPartnerHelpPrevious: function (oEvent) {
            
            var oModel = this.getModel("oModelCreateOrder");
            var servicoSL = "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter=BPLId eq " + oModel.getProperty("/branch");
           
        
            this.previousButtonPress("fornecedorbuscar",
                servicoSL,
                "/partnersCode",
                "/ItemsNumberBusy");
        },

        onPartnerHelpNext: function (oEvent) {
            
            var oModel = this.getModel("oModelCreateOrder");
            var servicoSL = "sml.svc/SDPC_FORNECEDOR_CONTATO?$filter=BPLId eq " + oModel.getProperty("/branch");
         
        
            this.nextButtonPress("fornecedorbuscar",
                servicoSL,
                "/partnersCode",
                "/ItemsNumberBusy");
        },

        onPartnerHelpClose: function (oEvent) {
            this.PartnerHelpDialog.close();
        },

        // --------------------------------------------------------
        // -------------- Table Header Actions --------------------
        // --------------------------------------------------------

        onAddItem: function () {
            var oModel = this.getModel("oModelCreateOrder");
            var rowsCount = oModel.getProperty("/rowsCount") + 1;

            oModel.setProperty("/rowsCount", rowsCount); // O rowsCount controla a quantidade de linhas a ser exibido no componente ui.Table e ajuda a marcar o ID do item

            var obj = {
                "itemId": rowsCount,
                "itemCode": "",
                "itemDescription": "",
                "category": "",
                "provider": "",
                "providerDescription": "",
                "requiredDateRow": oModel.getProperty("/requiredDate") ? oModel.getProperty("/requiredDate") : "",
                "necessaryAmount": "",
                "discount": "",
                "priceInfo": "",
                "totalPrice": "",
                "dimension1": "",
                "dimension2": "",
                "dimension3": "",
                "dimension4": "",
                "dimension5": "",
                "projectCode": ""
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
            var oModel = this.getModel("oModelCreateOrder");
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
                var oModel = this.getModel("oModelCreateOrder");

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

                this.setTotal();
            }

        },

        // --------------------------------------------------------
        // -------------- Table Items Actions----------------------
        // --------------------------------------------------------

        // Item Code
        onItemNumberValueSetManual: function (oEvent) {

            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

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
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            this.getModel("oModelCreateOrder").setProperty("/ItemNumberSPath", sPath);

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
            var oModelGeral = this.getModel("oModel");
            var servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

            if (oModelGeral.getProperty("/itemNumberType")) {
                servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES'";
            }

            this.searchDialog("item",
                servicoSL,
                "/itemsNumber",
                "/ItemsNumberBusy");
        },

        onItemNumberHelpSave: function (oEvent) {

            var oModel = this.getModel("oModelCreateOrder");
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

        onItemNumberHelpPrevious: function (oEvent) {
            var oModelGeral = this.getModel("oModel");
            var servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

            if (oModelGeral.getProperty("/itemNumberType")) {
                servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES'";
            }

            this.previousButtonPress("item",
                servicoSL,
                "/ItemsNumber",
                "/ItemsNumberBusy");
        },

        onItemNumberHelpNext: function (oEvent) {
            var oModelGeral = this.getModel("oModel");
            var servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES' and ItemType ne 'itFixedAssets'";

            if (oModelGeral.getProperty("/itemNumberType")) {
                servicoSL = "Items?$filter=PurchaseItem eq 'tYES' and Valid eq 'tYES'";
            }

            this.nextButtonPress("item",
                servicoSL,
                "/ItemsNumber",
                "/ItemsNumberBusy");
        },

        onItemNumberHelpClose: function (oEvent) {
            this.ItemNumberHelpDialog.close();
        },

        /// --------------------------------------------------------
        // -------------- Category --------------------------------
        // --------------------------------------------------------
        onCategoryValueSetManual: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty(sPath + "/categoryBusy", true);
            oModel.setProperty(sPath + "/category", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/categoriabuscar";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "sml.svc/SDPC_CATEGORIABUSCA?$filter=U_Nome_Categ eq '" + manualValue + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty(sPath + "/category", param.value[0].U_Nome_Categ);
                    } else {
                        oModel.setProperty(sPath + "/category", "");
                    }

                    oModel.setProperty(sPath + "/categoryBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty(sPath + "/category", "");
                    oModel.setProperty(sPath + "/categoryBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty(sPath + "/category", "");
                oModel.setProperty(sPath + "/categoryBusy", false);
            }
        },

        onCategoryHelpRequest: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            this.getModel("oModelCreateOrder").setProperty("/CategorySPath", sPath);

            this.openFragmentAndLoad("fragments_help", "CategoryHelpDialog", "categoriabuscar", "/Category", "/CategoryBusy",
                "sml.svc/SDPC_CATEGORIABUSCA");
        },

        onCategoryHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var servicoSL = "sml.svc/SDPC_CATEGORIABUSCA";

            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + "?$filter=substringof(U_Nome_Categ, '" + upperCase + "') or substringof(U_Nome_Categ, '" + lowerCase +
                    "') or substringof(U_Nome_Categ, '" + nameString + "')";
            }

            this.searchDialog("categoriabuscar",
                servicoSL,
                "/Category",
                "/CategoryBusy");
        },

        onCategoryHelpSave: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var CategorySPath = oModel.getProperty("/CategorySPath");
            var category = source.getSelectedItem().getProperty("title");

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
                        oModelGeral.setProperty(sPath + "/U_Nome_CategSelected", false);
                        oModel.setProperty(CategorySPath + "/category", category);

                        this.oApproveDialog.destroy();
                        this.CategoryHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/U_Nome_CategSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onCategoryHelpPrevious: function (oEvent) {
            this.previousButtonPress("categoriabuscar",
                "sml.svc/SDPC_CATEGORIABUSCA",
                "/Category",
                "/CategoryBusy");
        },

        onCategoryHelpNext: function (oEvent) {
            this.nextButtonPress("categoriabuscar",
                "sml.svc/SDPC_CATEGORIABUSCA",
                "/Category",
                "/CategoryBusy");
        },

        onCategoryHelpClose: function (oEvent) {
            this.CategoryHelpDialog.close();
        },

        //--------------------------------------------------------
        // ---------------------- Currency ----------------------
        // --------------------------------------------------------
        priceInfoChange: function (oEvent) {
            if (oEvent) {
                var valor = oEvent.getParameters().value;

                valor = valor.replace(/[!@#$%^&*(),.?\"':{}|_<>]/g, '').replace(/[a-zA-Z]/, '');

                var v = ((valor.replace(/\D/g, '') / 100).toFixed(2) + '').split('.');
                var m = v[0].split('').reverse().join('').match(/.{1,3}/g);
                for (var i = 0; i < m.length; i++) {
                    m[i] = m[i].split('').reverse().join('') + '.';
                }

                var r = m.reverse().join('');

                oEvent.getSource().setValue("R$ " + r.substring(0, r.lastIndexOf('.')) + ',' + v[1]);

                this.setTotalLine(oEvent);
            } else {
                return "";
            }
        },

        discountPercent: function (oEvent) {

            if (oEvent) {
                if (oEvent) {
                    var valor = oEvent.getParameters().value;

                    valor = valor.replace(/[!@#$%^&*(),.?\"':{}|_<>]/g, '').replace(/[a-zA-Z]/, '');

                    oEvent.getSource().setValue(valor);

                    this.setTotalLine(oEvent);
                } else {
                    return "";
                }
            }
        },

        necessaryAmountChange: function (oEvent) {
            if (oEvent) {
                var valor = oEvent.getParameters().value;

                valor = valor.replace(/[!@#$%^&*(),.?\"':{}|_<>]/g, '').replace(/[a-zA-Z]/, '');

                oEvent.getSource().setValue(valor);

                this.setTotalLine(oEvent);
            } else {
                return "";
            }
        },

        setTotalLine: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var oModel = this.getModel("oModelCreateOrder");
            var obj = oModel.getProperty(sPath);

            if (obj.necessaryAmount && obj.necessaryAmount.length > 0) {
                obj.necessaryAmount = obj.necessaryAmount.replace(/[!@#$%^&*()/,.?\"':;-{}|_<>]/g, '').replace(/[a-zA-Z]/, '');
            }

            if (obj.necessaryAmount !== "" && obj.priceInfo !== "" || obj.discount !== "") {
                var v;
                var aux = obj.priceInfo.replace(/[.R$ ]/g, '').replace(",", ".");
                var totalParcial;
                totalParcial = (aux * obj.necessaryAmount).toFixed(2).toString();
                aux = (totalParcial - (totalParcial * obj.discount * 0.01)).toFixed(2).toString(); //total

                if (aux.split('.').length === 1) {
                    v = aux + ".00";
                    v = aux.split('.');
                } else {
                    v = aux.split('.');
                }

                var m = v[0].split('').reverse().join('').match(/.{1,3}/g);
                for (var i = 0; i < m.length; i++) {
                    m[i] = m[i].split('').reverse().join('') + '.';
                }

                var r = m.reverse().join('');

                if (v[1] === undefined) {
                    v[1] = "00";
                } else if (v[1].length === 1) {
                    v[1] += "0";
                }

                obj.totalPrice = "R$ " + r.substring(0, r.lastIndexOf('.')) + ',' + v[1];

                oModel.setProperty("/discount", obj.discount);

                this.setTotal(obj);
            } else {
                obj.totalPrice = "";
            }
        },

        setTotal: function (obj) { //testar amanha

            var oModel = this.getModel("oModelCreateOrder");
            var rows = oModel.getProperty("/rows");
            var total = 0.00;

            rows.forEach(function (item) {
                if (item.totalPrice && item.totalPrice.length > 0) {
                    total += parseFloat(this.getCurrency(item.totalPrice));
                }

            }.bind(this));

            oModel.setProperty("/totalprice", this.setCurrency(total.toFixed(2).toString()));
        },

        getCurrency: function (currency) {
            return currency.toString().replace(/[.R$ ]/g, '').replace(",", "."); // Removendo os pontos do número && Substituindo a vírgula por ponto (Padrão americano)
        },

        setCurrency: function (currency) {
            if (currency) {
                currency = currency.replace(/[!@#$%^&*(),.?\"':{}|_<>]/g, '').replace(/[a-zA-Z]/, '');

                var v = ((currency.replace(/\D/g, '') / 100).toFixed(2) + '').split('.');
                var m = v[0].split('').reverse().join('').match(/.{1,3}/g);
                for (var i = 0; i < m.length; i++) {
                    m[i] = m[i].split('').reverse().join('') + '.';
                }

                var r = m.reverse().join('');

                return "R$ " + r.substring(0, r.lastIndexOf('.')) + ',' + v[1];
            } else {
                return "";
            }
        },

        //--------------------------------------------------------
        // ---------------------- Dist Rules | Dimension ---------
        // --------------------------------------------------------
        onDimensionValueSetManual: function (oEvent, dimension) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty(sPath + "/dimensionBusy" + dimension, true);
            oModel.setProperty(sPath + "/dimension" + dimension, ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/regradedistribuicao";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension + " and FactorCode eq '" +
                        manualValue + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty(sPath + "/dimension" + dimension, param.value[0].FactorCode);
                    } else {
                        oModel.setProperty(sPath + "/dimension" + dimension, "");
                    }

                    oModel.setProperty(sPath + "/dimensionBusy" + dimension, false);
                }.bind(this), function (param) {
                    oModel.setProperty(sPath + "/dimension" + dimension, "");
                    oModel.setProperty(sPath + "/dimensionBusy" + dimension, false);
                }.bind(this));
            } else {
                oModel.setProperty(sPath + "/dimension" + dimension, "");
                oModel.setProperty(sPath + "/dimensionBusy" + dimension, false);
            }
        },

        onDimensionHelpRequestOrder: function (oEvent, dimension) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;

            var oModel = this.getModel("oModelCreateOrder");

            this.getModel("oModelCreateOrder").setProperty("/dimension", dimension);
            this.getModel("oModelCreateOrder").setProperty("/dimensionSPath", sPath);
            this.getModel("oModel").setProperty("/DistRules", []); // Limpa a lista pois pode confundir o usuário ao abrir outra dimensão e os dados ainda estarem lá referente a outra dimensão que ele abriu previamente

            this.openFragmentAndLoad("fragments_help", "DistRulesHelpDialog", "regradedistribuicao", "/DistRules", "/DistRulesBusy",
                "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension, true);
        },

        onDimensionHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var dimension = this.getModel("oModelCreateOrder").getProperty("/dimension");
            var service = "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension + " and (substringof('" + sQuery +
                "', FactorDescription) or substringof('" +
                sQuery + "', FactorCode)";

            if (sQuery != "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                service = service + " or substringof('" + upperCase + "', FactorDescription) or substringof('" + lowerCase +
                    "', FactorDescription) or substringof('" + nameString + "', FactorDescription) or substringof('" + upperCase + "', FactorCode))";
            } else {
                service = "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension;
            }

            this.searchDialog("regradedistribuicao", service, "/DistRules", "/DistRulesBusy");
        },

        onDimensionHelpSave: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var sPath = oEvent.getSource().getSelectedContextPaths()[0];
            var sPathDimension = oModel.getProperty("/dimensionSPath");
            var dimension = oModel.getProperty("/dimension");
            var FactorCode = oEvent.getSource().getSelectedItem().getProperty("title");

            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("confirm"),
                content: new Text({
                    text: oBundle.getText("acceptDistRules")
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("confirm"),
                    press: function () {
                        oModelGeral.setProperty(sPath + "/FactorCodeSelected", false);

                        oModel.setProperty(sPathDimension + "/dimension" + dimension, FactorCode);

                        this.oApproveDialog.destroy();
                        this.DistRulesHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function () {
                        oModelGeral.setProperty(sPath + "/FactorCodeSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onDimensionHelpPrevious: function (oEvent) {
            var dimension = this.getModel("oModelCreateOrder").getProperty("/dimension");
            this.previousButtonPress("regradedistribuicao", "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension,
                "/DistRules", "/DistRulesBusy");
        },

        onDimensionHelpNext: function (oEvent) {
            var dimension = this.getModel("oModelCreateOrder").getProperty("/dimension");
            this.nextButtonPress("regradedistribuicao", "DistributionRules?$filter=Active eq 'tYES' and InWhichDimension eq " + dimension,
                "/DistRules", "/DistRulesBusy");
        },

        onDimensionHelpClose: function (oEvent) {
            this.DistRulesHelpDialog.close();
        },

        //--------------------------------------------------------
        // ---------------------- Project -------------------------
        // --------------------------------------------------------
        onProjectValueSetManual: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty(sPath + "/projectCodeBusy", true);
            oModel.setProperty(sPath + "/projectCode", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/projetos";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "Projects?$filter=Active eq 'tYES' and Code eq '" + manualValue + "'" //and Name? ou and Code
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty(sPath + "/projectCode", param.value[0].Name);
                    } else {
                        oModel.setProperty(sPath + "/projectCode", "");
                    }

                    oModel.setProperty(sPath + "/projectCodeBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty(sPath + "/projectCode", "");
                    oModel.setProperty(sPath + "/projectCodeBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty(sPath + "/projectCode", "");
                oModel.setProperty(sPath + "/projectCodeBusy", false);
            }
        },

        onProjectHelpRequest: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            this.getModel("oModelCreateOrder").setProperty("/ProjectSPath", sPath);

            this.openFragmentAndLoad("fragments_help", "ProjectHelpDialog", "projetos", "/Projects", "/ProjectsBusy",
                "Projects?$filter=Active eq 'tYES'");
        },

        onProjectHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var service = "Projects?$filter=Active eq 'tYES' and (substringof('" + sQuery + "', Name) or substringof('" + sQuery + "', Code)";

            if (sQuery != "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                service = service + " or substringof('" + upperCase + "', Name) or substringof('" + lowerCase + "', Name) or substringof('" +
                    nameString + "', Name) or substringof('" + lowerCase + "', Code))";
            } else {
                service = "Projects?$filter=Active eq 'tYES'";
            }

            this.searchDialog("projetos",
                service,
                "/Projects",
                "/ProjectsBusy");
        },

        onProjectHelpSave: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var ProjectSPath = oModel.getProperty("/ProjectSPath");
            var code = source.getSelectedItem().getProperty("description"); //Aqui estou pegando o code da lista por isso o description

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
                        oModelGeral.setProperty(sPath + "/ProjectSelected", false);
                        oModel.setProperty(ProjectSPath + "/projectCode", code); //Tentar Project e nao project

                        this.oApproveDialog.destroy();
                        this.ProjectHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/ProjectSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onProjectHelpPrevious: function (oEvent) {
            this.previousButtonPress("projetos",
                "Projects?$filter=Active eq 'tYES'",
                "/Projects",
                "/ProjectsBusy");
        },

        onProjectHelpNext: function (oEvent) {
            this.nextButtonPress("projetos",
                "Projects?$filter=Active eq 'tYES'",
                "/Projects",
                "/ProjectsBusy");
        },

        onProjectHelpClose: function (oEvent) {
            this.ProjectHelpDialog.close();
        },

        // --------------------------------------------------------
        // -------------------- Contract--------------------
        // --------------------------------------------------------

        onContractNumValueSetManual: function (oEvent) {

            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty(sPath + "/contractBusy", true);
            oModel.setProperty(sPath + "/contractCode", "");
            oModel.setProperty(sPath + "/contractName", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/contratoguardachuva";
                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "BlanketAgreements?$filter=BPCode eq '" + manualValue + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param !== "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty(sPath + "/contractCode", param.value[0].BPCode);
                        oModel.setProperty(sPath + "/contractName", param.value[0].BPName);
                    } else {
                        oModel.setProperty(sPath + "/contractCode", "");
                        oModel.setProperty(sPath + "/contractName", "");
                    }
                    oModel.setProperty(sPath + "/contractBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty(sPath + "/contractCode", "");
                    oModel.setProperty(sPath + "/contractName", "");
                    oModel.setProperty(sPath + "/contractBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty(sPath + "/contractCode", "");
                oModel.setProperty(sPath + "/contractName", "");
                oModel.setProperty(sPath + "/contractBusy", false);
            }
        },

        onContractHelpRequest: function (oEvent) {
            var sPath = oEvent.getSource().getBindingContext("oModelCreateOrder").sPath;
            this.getModel("oModelCreateOrder").setProperty("/ContractSPath", sPath);

            this.openFragmentAndLoad("fragments_help", "ContractNumHelpDialog", "contratoguardachuva", "/Contract", "/ContractBusy",
                "BlanketAgreements");
        },

        onContractNumHelpSearch: function (oEvent) {

            var sQuery = oEvent.getSource().getValue();
            var servicoSL = "BlanketAgreements";

            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + " or substringof('" + upperCase + "', BPName) or substringof('" + lowerCase +
                    "', BPName) or substringof('" +
                    nameString + "', BPName) or substringof('" + upperCase + "', BPCode))";
            }

            this.searchDialog("contratoguardachuva",
                servicoSL,
                "/Contract",
                "/ContractBusy");
        },

        onContractHelpSave: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var ContractSPath = oModel.getProperty("/ContractSPath");
            var Code = oModelGeral.getProperty(sPath).BPCode
            var Name = oModelGeral.getProperty(sPath).BPName


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
                        oModelGeral.setProperty(sPath + "/U_Nome_CategSelected", false);
                        oModel.setProperty(ContractSPath + "/contractCode", Code);
                        oModel.setProperty(ContractSPath + "/contractName", Name);

                        this.oApproveDialog.destroy();
                        this.ContractNumHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/U_Nome_CategSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onContractNumHelpPrevious: function (oEvent) {
            this.previousButtonPress("contratoguardachuva",
                "BlanketAgreements",
                "/Contract",
                "/ContractBusy");
        },

        onContractNumHelpNext: function (oEvent) {
            this.nextButtonPress("contratoguardachuva",
                "BlanketAgreements",
                "/Contract",
                "/ContractBusy");
        },

        onContractNumHelpClose: function (oEvent) {
            this.ContractNumHelpDialog.close();
        },

        // --------------------------------------------------------
        // -------------------- Shipping Type --------------------
        // --------------------------------------------------------

        onShippingTypeSetManual: function (oEvent) {

            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty("/sendTypeBusy", true);
            oModel.setProperty("/sendType", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/tipoenvio";

                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "ShippingTypes?$filter=Name eq '" + manualValue + "'"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param != "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty("/sendType", param.value[0].Code);
                        oModel.setProperty("/sendType", param.value[0].Name);
                    } else {
                        oModel.setProperty("/sendType", "");
                    }

                    oModel.setProperty("/sendTypeBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty("/sendType", "");
                    oModel.setProperty("/sendTypeBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty("/sendType", "");
                oModel.setProperty("/sendTypeBusy", false);
            }
        },

        onShippingTypeHelpRequest: function (oEvent) {

            this.openFragmentAndLoad("fragments_help", "ShippingTypeHelpDialog", "tipoenvio", "/shippingCode", "/shippingTypesBusy",
                "ShippingTypes");
        },

        onShippingTypeHelpSearch: function (oEvent) {

            var sQuery = oEvent.getSource().getValue();

            var servicoSL = "ShippingTypes";

            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                servicoSL = servicoSL + "?$filter=(substringof('" + sQuery + "', Name) or substringof('" + sQuery + "', Code)";
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + " or substringof('" + upperCase + "', Name) or substringof('" + lowerCase +
                    "', Name) or substringof('" +
                    nameString + "', Name) or substringof('" + upperCase + "', Code))"
            }

            this.searchDialog("tipoenvio",
                servicoSL,
                "/shippingCode",
                "/shippingTypesBusy");
        },

        onShippingTypeHelpSave: function (oEvent) {

            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var ItemNumberSPath = oModel.getProperty("/shippingCode");
            //var cardCode = source.getSelectedItem().getProperty("title"); //itemNumber
            var Code = oModelGeral.getProperty(sPath).Code
            //var cardName = source.getSelectedItem().getProperty("description");//itemNumberDesc
            var Name = oModelGeral.getProperty(sPath).Name
            // var contactPerson = oModelGeral.getProperty(sPath).ContactPerson

            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("confirm"),
                content: new Text({
                    text: oBundle.getText("acceptShipping")
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("confirm"),
                    press: function () {

                        oModelGeral.setProperty(sPath + "/ShippingTypeSelected", false);
                        oModel.setProperty("/ShippingCode", Code);
                        oModel.setProperty("/ShippingName", Name);

                        oModel.setProperty("/shippingTypesBusy", false);

                        this.oApproveDialog.destroy();
                        this.ShippingTypeHelpDialog.close();

                    }.bind(this)
                }),

                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/ShippingTypeSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();

            oModel.setProperty("/shippingTypesBusy", true);
        },

        onShippingTypeHelpPrevious: function (oEvent) {
            this.previousButtonPress("tipoenvio",
                "ShippingTypes",
                "/shippingCode",
                "/shippingTypesBusy");
        },

        onShippingTypeHelpNext: function (oEvent) {
            this.nextButtonPress("tipoenvio",
                "ShippingTypes",
                "/shippingCode",
                "/shippingTypesBusy");
        },

        onShippingTypeHelpClose: function (oEvent) {
            this.ShippingTypeHelpDialog.close();
        },

        // --------------------------------------------------------
        // -------------------- Agent------------------------------
        // --------------------------------------------------------

        onAgentHelpSetManual: function (oEvent) {

            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty("/agentTypeBusy", true);
            oModel.setProperty("/agentType", "");
            oModel.setProperty("/agentCode", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/agente";

                var data = JSON.stringify({
                    "idEmpresa": oModel.getProperty("/idEmpresa"),
                    "servicoSL": "sml.svc/SDPC_AGENTE?$filter=substringof(AgentName,'" + manualValue + "') or substringof(AgentCode,'" + manualValue + "')"
                });

                var promise = this.callAjaxFunction(url, data, "POST");

                promise.then(function (param) {
                    if (param != "Erro Not Found" && param.value.length > 0) {
                        oModel.setProperty("/agentType", param.value[0].AgentName);
                        oModel.setProperty("/agendCode", param.value[0].AgentCode);
                    } else {
                        oModel.setProperty("/agentType", "");
                        oModel.setProperty("/agendCode", "");
                    }
                    oModel.setProperty("/agentTypeBusy", false);
                }.bind(this), function (param) {
                    oModel.setProperty("/agentType", "");
                    oModel.setProperty("/agendCode", "");
                    oModel.setProperty("/agentTypeBusy", false);
                }.bind(this));
            } else {
                oModel.setProperty("/agentType", "");
                oModel.setProperty("/agendCode", "");
                oModel.setProperty("/agentTypeBusy", false);
            }
        },

        onAgentTypeHelpRequest: function (oEvent) {

            this.openFragmentAndLoad("fragments_help", "AgentHelpDialog", "agente", "/agentType", "/agentTypeBusy",
                "sml.svc/SDPC_AGENTE");
        },

        onAgentHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var oModelGeral = this.getModel("oModel");
            var servicoSL = "sml.svc/SDPC_AGENTE?$filter=";

            if (oModelGeral.getProperty("/agentType")) {
                servicoSL = "sml.svc/SDPC_AGENTE";
            }

            if (sQuery && sQuery.replace(/\s/g, "") !== "") {
                servicoSL = servicoSL + "(substringof('" + sQuery + "', AgentName) or substringof('" + sQuery + "', AgentCode)";
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                servicoSL = servicoSL + " or substringof('" + upperCase + "', AgentName) or substringof('" + lowerCase +
                    "', AgentName) or substringof('" +
                    nameString + "', AgentName) or substringof('" + upperCase + "', AgentCode))"
            }

            this.searchDialog("agente",
                servicoSL,
                "/agentType",
                "/agentTypeBusy");

        },

        onAgentTypeHelpSave: function (oEvent) {

            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");
            var oBundle = this.getResourceBundle();
            var source = oEvent.getSource();
            var sPath = source.getSelectedContextPaths()[0];
            var ItemNumberSPath = oModel.getProperty("/agentType");
            //var cardCode = source.getSelectedItem().getProperty("title"); //itemNumber
            var Code = oModelGeral.getProperty(sPath).AgentCode
            //var cardName = source.getSelectedItem().getProperty("description");//itemNumberDesc
            var Name = oModelGeral.getProperty(sPath).AgentName
            // var contactPerson = oModelGeral.getProperty(sPath).ContactPerson

            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: oBundle.getText("confirm"),
                content: new Text({
                    text: oBundle.getText("acceptAgent")
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: oBundle.getText("confirm"),
                    press: function () {

                        oModelGeral.setProperty(sPath + "/AgenteTypeSelected", false);
                        oModel.setProperty("/AgentCode", Code);
                        oModel.setProperty("/AgentName", Name);



                        oModel.setProperty("/agentTypeBusy", false);
                        // oModel.setProperty("/CardName", cardName);
                        // oModel.setProperty("/separation", "-"); //Parâmetro criado para inserir o traço

                        this.oApproveDialog.destroy();
                        this.onAgentHelpClose.close();

                    }.bind(this)
                }),

                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function (oEvent) {
                        oModelGeral.setProperty(sPath + "/AgenteTypeSelected", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();

            oModel.setProperty("/agentTypeBusy", true);
        },

        onAgentTypeHelpPrevious: function (oEvent) {
            this.previousButtonPress("agente",
                "sml.svc/SDPC_AGENTE",
                "/agentType",
                "/agentTypeBusy");
        },

        onAgentTypeHelpNext: function (oEvent) {
            this.nextButtonPress("agente",
                "sml.svc/SDPC_AGENTE",
                "/agentType",
                "/agentTypeBusy");
        },

        onAgentHelpClose: function (oEvent) {
            this.AgentHelpDialog.close();
        },

        // --------------------------------------------------------
        // -------------------- PayTermsTypes ---------------------
        // --------------------------------------------------------

        setPaymentTermsTypes: function (oModel) {        
            var url = "/destinations/B1Connection/condicaopagto";
            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "PaymentTermsTypes"
            });

            oModel.setProperty("/condPgtoBusy", true);

            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                if (param.value) {
                    oModel.setProperty("/condPgtoData", param.value);
                    oModel.setProperty("/condPgtoBusy", false);
                } else {
                    MessageBox.alert(param);
                }
            }.bind(this), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));
            }.bind(this));
        },

        // --------------------------------------------------------
        // -------------------- PayForms --------------------------
        // --------------------------------------------------------

        setPaymentForms: function (oModel) {
            var url = "/destinations/B1Connection/formapagamento";
            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "WizardPaymentMethods"
            });

            oModel.setProperty("/formPgtoBusy", true);

            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                if (param.value) {
                    oModel.setProperty("/formaPagamento", param.value);
                    oModel.setProperty("/formPgtoBusy", false);
                } else {
                    MessageBox.alert(param);
                }
            }.bind(this), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));
            }.bind(this));
        },

        // --------------------------------------------------------
        // -------------------- To Pay ----------------------------
        // --------------------------------------------------------

        setPayToList: function (oModel) {
            var CardCode = oModel.getProperty("/BusinessPartCode");
            
			var url = "/destinations/B1Connection/fornecedorbuscar";

            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "BusinessPartners?$filter=Valid eq 'tYES' and CardType eq 'cSupplier' and CardCode eq '" + CardCode + "'"
            });

            var promise = this.callAjaxFunction(url, data, "POST");

            promise.then(function (param) {
                if (param != "Erro Not Found" && param.value.length > 0) {
                    var payToList = ["",];
					for (var i = 0; i < param.value.length; i++) {		
                        oModel.setProperty("/billToDefault", param.value[0].BilltoDefault);
						for (var j = 0; j < param.value[i].BPAddresses.length; j++) {
							if (param.value[i].BPAddresses[j].AddressType == "bo_BillTo") {
                            
								payToList.push({
									BilltoDefault: param.value[i].BPAddresses[j].AddressName
								});
							}
						}
					}                    
                    oModel.setProperty("/PayToList", payToList); 
                } else {
                    oModel.setProperty("/PayToList", "");                  
                }
                oModel.setProperty("/PayToBusy", false);
                oModel.setProperty("/PayToEnabled", true);   
            }.bind(this));
		},

        onPayToSelect: function (oEvent) {  
            
            var oModel = this.getModel("oModelCreateOrder");
           
            oModel.setProperty("/BillToBusy", true);
                
            var selectedValue = oModel.getProperty("/pagarAKey");
            var CardCode = oModel.getProperty("/BusinessPartCode");
            var url = "/destinations/B1Connection/postquery";
            var data = JSON.stringify({
                "idEmpresa": oModel.getProperty("/idEmpresa"),
                "servicoSL": "QueryService_PostQuery",
                "QueryPath": "$crossjoin(BusinessPartners,BusinessPartners/BPAddresses)",
                "QueryOption": "$expand=BusinessPartners($select=CardCode, CardName),BusinessPartners/BPAddresses($select=AddressType, AddressName, Street, Block, ZipCode, City, Country, State, County)&$filter=BusinessPartners/BPAddresses/AddressName eq '" + selectedValue + "' and BusinessPartners/CardCode eq '" + CardCode + "' and BusinessPartners/Valid eq 'tYES' and BusinessPartners/CardCode eq BusinessPartners/BPAddresses/BPCode and (BusinessPartners/CardType eq 'cSupplier')"
             });           

            var promise = this.callAjaxFunction(url, data, "POST");
            
            promise.then(function (param) {
                if(selectedValue != ""){                   
                    if (param.value) {
                        for (var i = 0; i < param.value.length; i++) {
                            if (param.value[i]["BusinessPartners/BPAddresses"].length > 0) {
                                for (var j = 0; j < param.value[i]["BusinessPartners/BPAddresses"].length; j++) {
                                    if (param.value[i]["BusinessPartners/BPAddresses"][j].AddressType === "B") {        
                                        oModel.setProperty("/BillTo", param.value[i]["BusinessPartners/BPAddresses"][j].AddressName);
                                        
                                        var text = "Nome do endereço: " + param.value[i]["BusinessPartners/BPAddresses"][j].AddressName + "\nRua/Caixa Postal: " +
                                        param.value[i]["BusinessPartners/BPAddresses"][j].Street + "\nBairro: " + param.value[i]["BusinessPartners/BPAddresses"][j].Block + "\nCEP: " +
                                        param.value[i]["BusinessPartners/BPAddresses"][j].ZipCode + "\nCidade: " + param.value[i]["BusinessPartners/BPAddresses"][j].City + "\nPaís: " +
                                        param.value[i]["BusinessPartners/BPAddresses"][j].Country + "\nEstado: " + param.value[i]["BusinessPartners/BPAddresses"][j].State + "\nMunicípio: " +
                                        param.value[i]["BusinessPartners/BPAddresses"][j].County;

                                       
                                        
                                        oModel.setProperty("/BillToText", text);
                                        oModel.setProperty("/BillToBusy", false);
                                    }                            
                                }
                            } else {
                                if (param.value[i]["BusinessPartners/BPAddresses"].AddressType === "B") {        
                                    oModel.setProperty("/BillTo", param.value[i]["BusinessPartners/BPAddresses"].AddressName);
                                    
                                    var text = "Nome do endereço: " + param.value[i]["BusinessPartners/BPAddresses"].AddressName + "\nRua/Caixa Postal: " +
                                    param.value[i]["BusinessPartners/BPAddresses"].Street + "\nBairro: " + param.value[i]["BusinessPartners/BPAddresses"].Block + "\nCEP: " +
                                    param.value[i]["BusinessPartners/BPAddresses"].ZipCode + "\nCidade: " + param.value[i]["BusinessPartners/BPAddresses"].City + "\nPaís: " +
                                    param.value[i]["BusinessPartners/BPAddresses"].Country + "\nEstado: " + param.value[i]["BusinessPartners/BPAddresses"].State + "\nMunicípio: " +
                                    param.value[i]["BusinessPartners/BPAddresses"].County;
                                    
                                    oModel.setProperty("/BillToText", text);
                                    oModel.setProperty("/BillToBusy", false);
                                }       
                            }
                        }
                    }
                    oModel.setProperty("/BillToBusy", false);  
                }else {
                    oModel.setProperty("/BillToText", "");
                    oModel.setProperty("/BillToBusy", false); 
                }
            }.bind(this), function (param) {
                var oBundle = this.getResourceBundle();
                MessageBox.alert(oBundle.getText("systemUnavailable"));
            }.bind(this));

            // if (oEvent.getSource().getSelectedKey() === ""){
            //     oModel.setProperty("/BillToBusy", false);
            // } 
        },

        getSelectedItemText: function (comboBoxId) {
			if (this.byId(comboBoxId).getSelectedItem() !== null) {
				return this.byId(comboBoxId).getSelectedItem().getProperty("text");
			} else {
				return "";
			}
		},

       // --------------------------------------------------------
		// ---------------------- Attachments----------------------
		// --------------------------------------------------------

		onFileDeleted: function (oEvent) {
			var oModel = this.getView().getModel("oModelCreateOrder");
			var list = oModel.getProperty("/Anexos");
			var sPath = oEvent.getParameters().item.getBindingContext("oModelCreateOrder").sPath;
			var obj = oModel.getProperty(sPath);
			var index = "";

			index = list.findIndex(function (item, index) {
				if (item.fileName === obj.fileName) {
					return true;
				}
			});

			list.splice(index, 1);
			oModel.setProperty("/Anexos", list);
			oModel.setProperty("/anexoAlterado", true);
		},

		onFilenameLengthExceed: function (oControlEvent) {
			MessageToast.show("Nome do arquivo muito grande!");
		},

		onFileSizeExceed: function (oControlEvent) {
			MessageToast.show("Arquivo muito grande, limite atual é de 2mb.");
		},

		onFileUploadComplete: function (oEvent) {
			var file = oEvent.getParameter("files")[0];
			file.id = new Date().getTime().toString();
			var oModel = this.getView().getModel("oModelCreateOrder");
			var list = oModel.getProperty("/Anexos");
			var auxList = oModel.getProperty("/AuxAnexos");

			file = auxList.filter(function (item) {
				if (file.fileName === item.fileName) {
					return item;
				}
			});

			list.push(file[0]);

			oModel.setProperty("/Anexos", list);
			oModel.setProperty("/anexoAlterado", true);
		},

		onChangeUploadCollection: function (oEvent) {
			var oModel = this.getView().getModel("oModelCreateOrder");
			var reader = new FileReader();
			var files = oEvent.getParameter("files");
			var promises = [];

			for (var i = 0; i < files.length; i++) {
				var filePromise = new Promise(function (resolve) {
					var reader = new FileReader();
					reader.readAsArrayBuffer(files[i]);
					reader.onload = function (e) {
						var raw = e.target.result;

						resolve({
							"fileName": this.name,
							"fileNameWithoutExtension": this.name.substr(0, this.name.lastIndexOf(".")),
							"recentlyAdded": true,
							"fileExtension": this.name.substr(this.name.lastIndexOf(".") + 1), // teste.pdf --> pdf
							"fileType": this.type,
							"fileSize": this.size,
							"fileContent": raw
						});
					}.bind(this);
					reader.onerror = function (e) {
						MessageToast.show("error");
					};
				}.bind(files[i]));
				promises.push(filePromise);
			}

			var aux = [];

			Promise.all(promises).then(function (fileData) {
				for (var i = 0; i < fileData.length; i++) {
					aux.push(fileData[i]);
				}

				oModel.setProperty("/AuxAnexos", aux);
			});
		},

		onBeforeUploadStarts: function (oEvent) {
			// Stellen die Kopf Parameter slug
			var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
		},

		onDownloadItem: function (oEvent) {
			var sPath = oEvent.getSource().getSelectedItem().getBindingContext("oModelCreateOrder").sPath;
			var oModel = this.getModel("oModelCreateOrder");
			var obj = oModel.getProperty(sPath);
			var oBundle = this.getResourceBundle();

			this.oDownloadDialog = new Dialog({
				type: DialogType.Message,
				title: oBundle.getText("confirmDownload"),
				content: new Text({
					text: oBundle.getText("acceptFile")
				}),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: oBundle.getText("confirm"),
					press: function () {
						oModel.setProperty("/AnexosBusy", true);
						oModel.setProperty(sPath + "/fileSelected", false);
						this.downloadFile(oModel, obj);
						
						this.oDownloadDialog.destroy();
					}.bind(this)
				}),
				endButton: new Button({
					text: oBundle.getText("cancel"),
					press: function () {
						oModel.setProperty(sPath + "/fileSelected", false);
						this.oDownloadDialog.destroy();
					}.bind(this)
				})
			});

			this.oDownloadDialog.open();
		},

		downloadFile: function (oModel, file) {
			if (file.recentlyAdded) {
				sap.ui.core.util.File.save(file.fileContent, file.fileNameWithoutExtension, file.fileExtension);
				oModel.setProperty("/AnexosBusy", false);
			} else {
				var urlDownload = "/destinations/B1Connection/downloadanexo";
				var dataDownload = JSON.stringify({
					"idEmpresa": oModel.getProperty("/idEmpresa"),
					"servicoSL": "Attachments2",
					"AbsoluteEntry": oModel.getProperty("/attachmentEntry"),
					"Filename": file.fileNameDownload
				});
	
				var promise = this.callAjaxFunction(urlDownload, dataDownload, "POST");
	
				promise.then(function (param) {
					sap.ui.core.util.File.save(this.base64ToArrayBuffer(param), file.fileNameDownload, file.fileExtension);
					oModel.setProperty("/AnexosBusy", false);
				}.bind(this), function (error) {
					var oBundle = this.getResourceBundle();
					MessageBox.alert(oBundle.getText("errorFileDownload"));
					oModel.setProperty("/AnexosBusy", false);
				});
			}
		},

        // --------------------------------------------------------
        // -------------------- PDF -------------------------------
        // --------------------------------------------------------

        downloadPDF: function () {
            var oModelGeral = this.getModel("oModel");
            var oModel = this.getModel("oModelCreateOrder");

            var result = oModelGeral.getProperty("/Companies").filter(obj => {
                return obj.IdEmpresas === oModel.getProperty("/companySelectedKey");
            });

            var imgData = result[0].Logo;
            var doc = new jsPDF()
	
            doc.addImage(imgData, 'PNG', 160, 4, 40, 15)
            doc.setDrawColor(0)
            doc.setFillColor(255, 127, 0)
            doc.rect(0, 0, 250, 3, 'F')
            
            doc.text(80, 13, 'Pedido de Compras')
            
            doc.setLineWidth(0.5)
            doc.line(220, 20, 0, 20)
            
            doc.setFontSize(12)
            doc.text(132, 28, 'Número do Pedido:')
            doc.text(180, 28, oModel.getProperty("/DocEntryDocumento"))
            
            doc.text(132, 34, 'Data de Lançamento:')
            doc.text(180, 34, this.dateFormatterPDF(oModel.getProperty("/releaseDate")))
            
            doc.text(132, 40, 'Valido até:')
            doc.text(180, 40, this.dateFormatterPDF(oModel.getProperty("/deliveryDate")))
            
            doc.text(132, 46, 'Data do Documento:')
            doc.text(180, 46, this.dateFormatterPDF(oModel.getProperty("/dataDocument")))
            
            doc.rect(10, 60, 50, 8)
            doc.setFontSize(13)
            doc.text(39, 65.5, 'Empresa:')
            doc.rect(10, 60, 190, 8)
            doc.text(62, 65.5, result[0].Empresas)
    
            doc.rect(10, 68, 50, 8)
            doc.text(48, 73.7, 'Filial:')
            doc.rect(10, 68, 190, 8)
            doc.text(62, 73.7, oModel.getProperty("/U_Filial_Nome"))
            
            doc.rect(10, 76, 50, 8)
            doc.text(34, 81.5, 'Fornecedor:')
            doc.rect(10, 76, 190, 8)
            doc.text(62, 81.5, oModel.getProperty("/onLineVendorValue"))
            
            doc.rect(10, 84, 50, 8)
            doc.text(18.5, 89.5, 'Pessoa de Contato:')
            doc.rect(10, 84, 190, 8)
            doc.text(62, 89.5, oModel.getProperty("/contactPerson"))
            
            doc.setFontSize(20)
            doc.text(10, 105, 'Itens')
            doc.setLineWidth(0.5)
            doc.line(200, 107, 10, 107)

            var rows = oModel.getProperty("/rows");
			var auxRows = [];
			
            rows.forEach(function (item) {
				auxRows.push([
					item.itemNumber, item.itemNumberDesc, item.necessaryAmount,item.priceInfo, item.discount, item.totalPrice
				]);
			}.bind(this));

			auxRows.push(['', '', '', '', 'Total', oModel.getProperty("/totalprice")]);
    
            doc.autoTable({ html: '#table', startY: 110, pageBreak: 'auto', styles: {cellPadding: 5}})
            
            doc.autoTable({
    
            head: [['Cód. Item', 'Descrição do item', 'Quantidade', 'Preço Unitário', '% do Desconto', 'Preço total']],
            body: 	auxRows,
            });
            
            doc.rect(10, 210, 40, 8)
            doc.setFontSize(13)
            doc.text(33, 215.5, 'Titular:')
            doc.rect(10, 210, 190, 8)
            doc.text(52, 215.5, oModel.getProperty("/documentsOwnerName") )
            
            doc.setFontSize(13)
            doc.rect(10, 220, 190, 8)
            doc.text("Observação:", 95, 225);
            doc.rect(10, 228, 190, 30)
            var textField = new TextField();
            textField.Rect = [10, 228, 190, 30];
            textField.multiline = true;
            textField.value = oModel.getProperty("/comments") ? oModel.getProperty("/comments") : ""; 
            doc.addField(textField);
            textField.disabled = true;
            
            doc.save('document.pdf');
        },

        dateFormatterPDF: function (data) {
            if (data) {
                return data.substring(8, 10) + "/" + data.substring(5, 7) + "/" + data.substring(0, 4);
            } else {
                return "";
            }
        },

        handleLiveChange: function (oEvent) {
			var ValueState = coreLibrary.ValueState;

			var oTextArea = oEvent.getSource(),
				iValueLength = oTextArea.getValue().length,
				iMaxLength = oTextArea.getMaxLength(),
				sState = iValueLength > iMaxLength ? ValueState.Warning : ValueState.None;

			oTextArea.setValueState(sState);
		},

        // --------------------------------------------------------
        // -------------------- General Events --------------------
        // --------------------------------------------------------

        onOrderSelect: function (oEvent) {
            var oModel = this.getModel("oModelCreateOrder");
            var type = oModel.getProperty("/SelectedOrder");

            if (type === "Colaborador") {
                oModel.setProperty("/solicitanteColaboradorVisible", true);

                if (oModel.getProperty("/solicitanteUsuarioVisible")) {
                    oModel.setProperty("/solicitanteUsuarioVisible", false);
                }
            }
            if (type === "Usuário") {
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

        onEmployeeValueSetManual: function (oEvent) {
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty("/solicitanteColaboradorBusy", true);
            oModel.setProperty("/solicitanteColaboradorValue", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/colaboradores";
                var oModelUserData = this.getModel("userModel");
                var data = JSON.stringify({
                    "idEmpresa": oModelUserData.getProperty("/idEmp"),
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
            var oModel = this.getModel("oModelCreateOrder");
            oModel.setProperty("/typeEmployee", type);

            this.openFragmentAndLoad("fragments_help", "EmployeeHelpDialog", "colaboradores", "/EmployeeList", "/employeeListDialogBusy",
                "EmployeesInfo");
        },

        onEmployeeHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var service = "EmployeesInfo?$filter=substringof('" + sQuery + "', FirstName)";

            if (sQuery != "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                service = service + " or substringof('" + upperCase + "', FirstName) or substringof('" + lowerCase +
                    "', FirstName) or substringof('" + nameString + "', FirstName)";
                if (!isNaN(sQuery)) {
                    service = service + "or substringof('" + upperCase + "', EmployeeID)";
                }
            } else {
                service = "EmployeesInfo";
            }

            this.searchDialog("colaboradores",
                service,
                "/EmployeeList",
                "/employeeListDialogBusy");
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
            var employeeID = oEvent.getSource().getSelectedItem().getProperty("description");
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");

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
                        oModelGeral.setProperty(sPath + "/SelectedEmployee", false);

                        if (oModel.getProperty("/typeEmployee") === "colaborador") {
                            oModel.setProperty("/solicitanteColaboradorValue", employee);
                        } else {
                            oModel.setProperty("/documentsOwnerName", employee);
                            oModel.setProperty("/documentsOwnerID", employeeID);
                        }

                        this.oApproveDialog.destroy();
                        this.EmployeeHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function () {
                        oModelGeral.setProperty(sPath + "/SelectedEmployee", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onEmployeeHelpClose: function () {
            this.EmployeeHelpDialog.close();
        },

        onUserValueSetManual: function (oEvent) {
            var manualValue = oEvent.getParameters().value;
            var oModel = this.getModel("oModelCreateOrder");

            oModel.setProperty("/solicitanteUsuarioBusy", true);
            oModel.setProperty("/solicitanteUsuarioValue", ""); // Limpa o valor do campo para não haver erros se o usuário salvar antes do retorno da função

            if (manualValue.replace(/\s/g, "") !== "") {
                var url = "/destinations/B1Connection/colaboradores";
                var oModelUserData = this.getModel("userModel");
                var data = JSON.stringify({
                    "idEmpresa": oModelUserData.getProperty("/idEmp"),
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

        onUserHelpSearch: function (oEvent) {
            var sQuery = oEvent.getSource().getValue();
            var service = "Users?$select=UserCode,UserName&$filter=substringof('" + sQuery + "', UserName)";

            if (sQuery != "") {
                var upperCase = sQuery.toUpperCase();
                var lowerCase = sQuery.toLowerCase();
                var nameString = lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
                service = service + " or substringof('" + upperCase + "', UserName) or substringof('" + lowerCase +
                    "', UserName) or substringof('" + nameString + "', UserName) or substringof('" + lowerCase + "', UserCode)";
            } else {
                service = "Users?$select=UserCode,UserName";
            }

            this.searchDialog("usuario",
                service,
                "/UserList",
                "/userListDialogBusy");
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
            var oModel = this.getModel("oModelCreateOrder");
            var oModelGeral = this.getModel("oModel");

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
                        oModelGeral.setProperty(sPath + "/SelectedUser", false);
                        oModel.setProperty("/solicitanteUsuarioValue", user);

                        this.oApproveDialog.destroy();
                        this.UserHelpDialog.close();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: oBundle.getText("cancel"),
                    press: function () {
                        oModelGeral.setProperty(sPath + "/SelectedUser", false);
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
        },

        onUserHelpClose: function () {
            this.UserHelpDialog.close();
        },
    });
});
