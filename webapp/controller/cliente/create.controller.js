sap.ui.define([
	"../BaseController",
    "sap/ui/model/json/JSONModel",
    "../Formatter",
    "sap/m/MessageBox",
], function(Controller, JSONModel, Formatter, MessageBox) {
	"use strict";

	return Controller.extend("openBusiness.controller.cliente.Create", {

		onInit: function () {
			this.getView().setModel(new JSONModel(), "oModelCreateClient");

            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			 oRouter.getRoute("RouteCreateCliente").attachPatternMatched(this._onObjectMatched, this);
			 //oRouter.getRoute("RouteDetailCreate").attachPatternMatched(this._onObjectMatchedDetail, this);
        },
		_onObjectMatched:function(){

			var oModel = this.getModel("oModelCreateClient");
			var oBundle = this.getResourceBundle();	

			oModel.setProperty("/ViewTitle", oBundle.getText("createClient"));
			this.setDateValues();
		},

		setDateValues: function () {
	
			var oModel = this.getModel("oModelCreateClient");
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

			oModel.setProperty("/currentDate", date);
  
            // this.byId("dataEntrega").setMinDate(new Date());
            // this.byId("dataLancamento").setDateValue(new Date());
            // this.byId("dataDocumento").setDateValue(new Date());
        },

		_onObjectMatchedDetail:function(){
		
			var oModel = this.getModel("oModelCreateClient");
			var oBundle = this.getResourceBundle();	

			oModel.setProperty("/ViewTitle", oBundle.getText("CreateClient"));
		},

        onCreate:function(){
            
            var oModel = this.getModel("oModelCreateClient");
            var oBundle = this.getResourceBundle();
            this.getView().setBusy(true);

            if (this.validateFields(oModel)) { // Valida todos os campos do cabeçalho e da lista de items (caso tenha algum item)
                    var obj = this.buildObject(oModel);
                    var url = "https://api-erp-tg.herokuapp.com/cliente";

                    if (this.edit) {
						url = "/destinations/B1Connection/pedidocompraatualizar";
						obj.servicoSL = "Drafts";
						obj.campoChave = oModel.getProperty("/DocEntryDocumento");                      
					}

					var data = JSON.stringify(obj);

					var promise = this.callAjaxFunction(url, data, "POST");

					promise.then(function (param) {
						if(param.message==="cadastrado"){
							alert(param.message);
						}else{
							alert(param.message);
						}
						this.getView().setBusy(false);
						this.updateScreenInfo();
					}.bind(this), function (param) {
						var oBundle = this.getResourceBundle();
						MessageBox.alert(oBundle.getText("systemUnavailable"));
						this.getView().setBusy(false);
					}.bind(this));
				
			} else {
				MessageBox.alert(oBundle.getText("sendMissingFields"));
				this.getView().setBusy(false);
			}
        },

        buildObject: function (oModel) {   
			
            var obj = {};
        
            obj.nome_clientes = oModel.getProperty("/firstName")
            //objOrder.nome_clientes = oModel.getProperty("/firstName");
            obj.telefone = oModel.getProperty("/Phone");
           
            return obj;
        },

        validateFields: function (oModel) {
        
            var auxCount = 0;

            if (!oModel.getProperty("/firstName") || oModel.getProperty("/firstName").length === 0) {
                oModel.setProperty("/firstNameState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/firstNameState", "None");
            }

            if (!oModel.getProperty("/Phone") || oModel.getProperty("/Phone").length === 0) {
                oModel.setProperty("/PhoneState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/PhoneState", "None");
            }

            oModel.updateBindings();

            if (auxCount > 0) {
                return false;
            } else {
                return true;
            }
        },

        onCancel: function(){
            alert("cancelado");
			this.updateScreenInfo();
        },

		updateScreenInfo: function () {
			var oModel = this.getModel("oModelCreateClient");
			oModel.setProperty("/firstName","");
			oModel.setProperty("/dateNasc","");
			oModel.setProperty("/cpf","");
			oModel.setProperty("/lastName","");
			oModel.setProperty("/Phone","");
			oModel.setProperty("/phone1","");
			oModel.setProperty("/Street","");
			oModel.setProperty("/City","");
			oModel.setProperty("/cep","");
			oModel.setProperty("/number","");
			oModel.setProperty("/State","");
		},
		navBack: function () {
            window.history.go(-1);
        },
	});
});