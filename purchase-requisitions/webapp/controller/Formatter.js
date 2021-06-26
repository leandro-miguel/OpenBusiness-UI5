sap.ui.define(function () {
	"use strict";

	var Formatter = {
		
		branchFormatter: function (branch) {
			if (branch) {
				var oModel = this.getModel("oModel");

				var branchData = oModel.getProperty("/Branches");

				for (var j = 0; j < branchData.length; j++) {
					if (branch === branchData[j].idFilial) {
						return branchData[j].nomeFilial;
					}
				}
			}
			
			return "";
		},

		approvalStatusTextFormatter: function (U_Resu_work) {
			var statusAprov = "Pendente";

			if (U_Resu_work === "Aprov") {
				statusAprov = "Aprovado";
			}

			if (U_Resu_work === "Recu") {
				statusAprov = "Rejeitado";
			}

			return statusAprov;
		},

		approvalStatusStateFormatter: function (U_Resu_work) {
			var stateAprov = "Information";
			
			if (U_Resu_work && U_Resu_work === "Aprov") {
				stateAprov = "Success";
			}

			if (U_Resu_work && U_Resu_work === "Recu") {
				stateAprov = "Error";
			}

			return stateAprov;
		},

		approvalStatusHighlightFormatter: function (U_Resu_work) {
			var stateAprov = "Indication05";

			if (U_Resu_work === "Aprov") {
				stateAprov = "Indication04";
			}

			if (U_Resu_work === "Recu") {
				stateAprov = "Indication02";
			}

			return stateAprov;
		},

		myApprovalFormatter: function (U_Resu_work_indi) {
			var oModel = this.getModel("oModelApprovalsPanelList");
			var division = oModel.getProperty("/division");

			var minhaAprov = "Pendente";

			if (division && division === "Aprovador") {
				if (U_Resu_work_indi === "Aprov") {
					minhaAprov = "Aprovado";
				}
				if (U_Resu_work_indi === "Recu") {
					minhaAprov = "Rejeitado";
				}
			}

			return minhaAprov;
		},

		canceledFormatter: function (canceled) {
			var text = "";

			if (canceled && canceled === "N") {
				text = "Não";
			} else if (canceled && canceled === "Y") {
				text = "Sim";
			}

			return text;
		},
		
		canceledColorFormatter: function (canceled) {
			var stateAprov = null;

			if (canceled && canceled === "Y") {
				stateAprov = "Indication01";
			}

			return stateAprov;
		},
		
		iconApprovalStatusFormatter: function (U_Resu_work_indi) {
			var icon = "sap-icon://pending";
			
			if (U_Resu_work_indi) {
				if (U_Resu_work_indi == "Aprov") {
					icon = "sap-icon://accept";
				} else if (U_Resu_work_indi == "Recu") {
					icon = "sap-icon://decline";
				}
			}
			
			return icon;
		},
		
		statusApprovalStatusFormatter: function (U_Resu_work_indi) {
			var status = "Pendente";
			
			if (U_Resu_work_indi) {
				if (U_Resu_work_indi == "Aprov") {
					status = "Aprovou";
				}
				if (U_Resu_work_indi == "Recu") {
					status = "Rejeitou";
				}
			}
			
			return status;
		},
		
		nameApprovalStatusFormatter: function (U_NomeAprovador) {
			var name = "Desconhecido";
			
			if (U_NomeAprovador != null) {
				name = U_NomeAprovador;
			}
			
			return name;
		},
		
		dateApprovalStatusFormatter: function (U_Data_resu_indi) {
			var date = "N/A";
			
			if (U_Data_resu_indi != null) {
				date = U_Data_resu_indi;
			}
			
			return date;
		}
		
	};

	return Formatter;

}, /* bExport= */ true);