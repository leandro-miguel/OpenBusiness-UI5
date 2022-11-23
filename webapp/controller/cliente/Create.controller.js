sap.ui.define([
    "../BaseController",
    "../../model/CreateModel",
    "../Formatter",
    "sap/m/MessageBox",
], function (Controller, CreateModel, Formatter, MessageBox) {
    "use strict";

    return Controller.extend("openBusiness.controller.cliente.Create", {
        formatter: Formatter,
        onInit: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteCreateCliente").attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: function () {

            const oModel = this.getModel("oCreateModel");
            const oBundle = this.getResourceBundle();
            oModel.setProperty("/ViewTitle", oBundle.getText("createClient"));
            this.setDateValues();
        },

        setDateValues: function () {

            var oModel = this.getModel("oCreateModel");      
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

        _onObjectMatchedDetail: function () {
            var oModel = this.getModel("oCreateModel");
            oModel.setProperty("/ViewTitle", oBundle.getText("CreateClient"));
        },

        async onCreate(){      
            const oModel = this.getModel("oCreateModel");
            const userModel = this.getModel("userModel");
            const oUserModel = userModel.getData();      
            const oBundle = this.getResourceBundle();
            this.getView().setBusy(true);

            if (this.validateFields(oModel)) { // Valida todos os campos do cabeçalho e da lista de items (caso tenha algum item)
                const obj = this.buildObject(oModel);
                const oCreateModel = new CreateModel();
               
                if (this.edit) {
                    url = "/destinations/B1Connection/pedidocompraatualizar";
                    obj.servicoSL = "Drafts";
                    obj.campoChave = oModel.getProperty("/DocEntryDocumento");
                }
                debugger
                const data = JSON.stringify(obj);
                const fnPromise = await oCreateModel.callAjaxFunction(oUserModel.token, data);

                if(fnPromise.message == "cadastrado"){
                    MessageBox.alert(oBundle.getText(fnPromise.message), {
                        onClose: () => {
                            this.updateScreenInfo();
                            window.location.reload();
                        }
                    });
                }else{
                    MessageBox.alert(oBundle.getText(fnPromise.message), {
                        onClose: () => {
                            this.updateScreenInfo();
                            window.location.reload();
                        }
                    });
                }
            } else {
                MessageBox.alert(oBundle.getText("sendMissingFields"));
                this.getView().setBusy(false);
            }
        },

        buildObject: function (oModel) {

            var obj = {};

            obj.firstname = oModel.getProperty("/firstName");
            obj.phone1 = oModel.getProperty("/phone1");
            obj.lastname = oModel.getProperty("/lastName");
            obj.datenasc = oModel.getProperty("/dateNasc"); //como inverter a data
            obj.phone2 = oModel.getProperty("/phone2");
            obj.cpf = oModel.getProperty("/cpf");
            obj.street = oModel.getProperty("/street");
            obj.city = oModel.getProperty("/city");
            obj.cep = oModel.getProperty("/cep");
            obj.numberhouse = oModel.getProperty("/number");
            obj.state = oModel.getProperty("/idState");

            return obj;
        },

        selectState: function (oEvent) {
            
            var idState = oEvent.getParameter("selectedItem").getProperty("key"),
                oModel = this.getModel("oCreateModel");          
                oModelGeral = this.getModel("oModel");

            oModelGeral.setProperty("/idState", idState);
            oModel.setProperty("/idState", idState);
            oModel.setProperty("/companySelected", true);
            oModel.setProperty("/busyTable", false);
        },

        validateFields: function (oModel) {

            var auxCount = 0;

            if (!oModel.getProperty("/firstName") || oModel.getProperty("/firstName").length === 0) {
                oModel.setProperty("/firstNameState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/firstNameState", "None");
            }


            if (!oModel.getProperty("/lastName") || oModel.getProperty("/lastName").length === 0) {
                oModel.setProperty("/lastNameState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/lastNameState", "None");
            }

            if (!oModel.getProperty("/phone1") || oModel.getProperty("/phone1").length === 0) {
                oModel.setProperty("/phoneState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/phoneState", "None");
            }

            if (!oModel.getProperty("/cpf") || oModel.getProperty("/cpf").length === 0) {
                oModel.setProperty("/cpfState", "Error");
                auxCount++;
            } else {
                oModel.setProperty("/cpfState", "None");
            }

            oModel.updateBindings();

            if (auxCount > 0) {
                return false;
            } else {
                return true;
            }
        },

        onCancel: function () {
            alert("cancelado");
            this.updateScreenInfo();
        },

        updateScreenInfo: function () {
            var oModel = this.getModel("oCreateModel");      
            oModel.setProperty("/firstName", "");
            oModel.setProperty("/dateNasc", "");
            oModel.setProperty("/cpf", "");
            oModel.setProperty("/lastName", "");
            oModel.setProperty("/Phone", "");
            oModel.setProperty("/phone1", "");
            oModel.setProperty("/Street", "");
            oModel.setProperty("/City", "");
            oModel.setProperty("/cep", "");
            oModel.setProperty("/number", "");
            oModel.setProperty("/State", "");
        },
        navBack: function () {
            window.history.go(-1);
        },
    });
});