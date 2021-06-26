sap.ui.define([
	"./BaseController"
], function (Controller) {
	"use strict";

	return Controller.extend("requisitions.requisitions.controller.App", {
		onInit: function () {
			var hash = window.location.hash;

			this._oRouter = this.getOwnerComponent().getRouter();

			this.getUserInfo();
			
			var date = this.getDate();

			this.getModel("oModel").setProperty("/currentDate", date);

			if (hash === "") {
				window.history.go(-1);
			}

			switch (hash) {
				case '#CreateRequest-Display':
					this._oRouter.navTo("RouteCreateRequest", {}, true);
					break;

				case '#ListRequest-Display':
					this._oRouter.navTo("RouteListRequest", {}, true);
					break;

				case '#DetailRequest-Display':
					this._oRouter.navTo("RouteDetailRequest", {}, true);
					break;
				case '#CreateOrder-Display':
					this._oRouter.navTo("RouteCreateOrder", {}, true);
					break;

				case '#ListOrder-Display':
					this._oRouter.navTo("RouteListOrder", {}, true);
					break;

				case '#DetailOrder-Display':
					this._oRouter.navTo("RouteDetailOrder", {}, true);
					break;
					
				case '#CreateOffer-Display':
					this._oRouter.navTo("RouteOffer", {}, true);
					break;

				case '#CreateOfferP2-Display':
					this._oRouter.navTo("RouteOfferP2", {}, true);
					break;

				default:
					break;

			}
		}
	});
});