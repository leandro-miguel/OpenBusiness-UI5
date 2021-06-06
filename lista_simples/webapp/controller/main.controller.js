sap.ui.define([
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'./formatter.controller',
],
	function (JSONModel, Filter, FilterOperator, formatter) {
		"use strict";

		return formatter.extend("treinamentoseidor2021.controller.main", {
			//Primeiro metodo executado antes do render

			onInit: function () {
				var model = new JSONModel(); //declaro o objeto com nome de Model do tipo JSONModel, ela é uma variável global

				this.getView().setModel(model, "oModelList"); //instacio o Objeto do qual recebe o nome de oModelList. Objeto Dinamico

				//var bIsPhone = Device.system.phone,
				//let svgLogo = sap.ui.require.toUrl("treinamentoseidor2021/images/sap-logo.svg");
				//oImgModel;

				//Pegando a Imagem
				let svgLogo = sap.ui.require.toUrl("treinamentoseidor2021/images/sap-logo.svg");
				model.setProperty("/svgLogo", svgLogo); //o objeto tem esses valores. Objeto estático da figura do qual recebe o nome de /svgLogo e o valor da variavel img
				//O barra / é importante no nome do svgLogo, caso contrário não poderá renderizar a imagem
			},

			//função de procurar
			onSearch: async function (oEvent) {
				var model = this.getView().getModel("oModelList");

				//model.setProperty("/timeBusy", true); //o objeto tem esses valores do qual se refere ao busy

				//Aqui é onde pego o input do filtro

				//Esse filtro é bom para outros tipos de solução.
				//var filterValue = oEvent.getParameters().selectionSet[0].getValue();

				let filterValue = model.getProperty("/filtro1");

				//Crio uma array e um objeto do qual terá os valores de CustomerID de Orders
				var array = [];

				//É preciso notar que ao mudar o input, devemos mudar tbm o .lenght desse if 
				if (filterValue && filterValue.length > 0) { //O filtro só vai funcionar se o algo for digitado no campo do filtro
					var objFilter = new Filter("CustomerID", FilterOperator.EQ, filterValue);
					array.push(objFilter);
				}

				var table = this.getView().byId("idTable");

				table.bindItems({
					path: "/Orders",
					filters: array,
					template: this.getView().byId("ColumnListItem"),
					templateShareable: true
				});

				//A promisse é a maneira mais correta em fazer uma chamada no backend

				// var promise = this.getList(array); //É o um array pois as vezes podem conter mais de um valor.

				// promise.then(function (param) {//sucesso
				// 	var item = this.getView().getModel("oModelList"); //
				// 	item.setProperty("/items", param.results); //eu seto na variavel as propriedades que ela buscou. O nome dessas propriedades se chama param.results (do qual pode ser acessado no console do browser) 
				//  model.setProperty("/items", param.results);

				// 	//Essa sintaxe faz com que com que minha Busy pare ao carregar os dados. Porém ele é custosa quando a tabela é contém muitos dados
				// 	//this.getView().byId("idTable").sortBusy("false");
				// 	//O jeito mais correto é esse, pego o objeto do qual insiro o valor de /timeBusy
				// 	model.setProperty("/timeBusy", false);

				// }.bind(this), function (param) {//erro
				// 	//erro
				// }.bind(this));
			},

			navToDetail: function (oEvent) {

				//var sPath = oEvent.getSource().getSelectedItem().getProperty("title"); //Consegue-se pegar essa sintaxe através do console do navegador.
				var sPath = oEvent.getSource().getSelectedContextPaths()[0];

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.navTo("RouteDetalhe", {
					path: sPath.substring(1)
				});//Navega na rota detalhe e me passa o caminho que ao clicar com o mouse guarda na variavel sPath. path é o nome da variável utilizada no json
			},

			// //Função do qual me retorna os valores dos xml da promisse
			// getList: function (array) {
			// 	//Consome a minha oData model
			// 	var odataModel = this.getView().getModel();

			// 	//Uma Promise é um objeto que representa a eventual conclusão ou falha de uma operação assincrona.
			// 	return new Promise(function (res, rej) {
			// 		//Lendo o Odata Model no com parametro Orders
			// 		odataModel.read("/Orders", {
			// 			//insiro o metodo Get
			// 			method: "GET",
			// 			//insirindo o filtro, ou seja, faço o Get a partir do meu filtro
			// 			filters: array,
			// 			//urlParameters: { "$top": "5", "$skip": "20", "$select": "CustomerID" },
			// 			refreshAfterChange: true,
			// 			success: function (oData, response) {
			// 				res(oData);
			// 			}.bind(this),
			// 			error: function (oError) {
			// 				rej("Erro");
			// 			}
			// 		});
			// 	});
			// },

			// //o order date do xml vai cair dentro do parametro data 
			// formatacaoData: function (data) {
			// 	return new Date(data).toLocaleDateString();
			// },

			// //Essa funçao faz com que posso formatar a coluna.
			// Highlight: function (obj) {
			// 	if (obj && obj.CustomerID === 'VINET') {
			// 		return "Indication01";
			// 	} else {
			// 		return "Indication05";
			// 	}
			// },

		});
	});
