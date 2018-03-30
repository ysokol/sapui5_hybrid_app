sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	var SalesOrderService = Object.extend("my.sapui5_hybrid_app.model.service.SalesOrderService", {
		constructor: function(oODataModel) {
			Object.apply(this);
			this._oODataModel = oODataModel;
		},

		recalcSalesOrderItem: function(sSalesOrderItemPath) {
			var nPrice = this._oODataModel.getProperty(sSalesOrderItemPath + "/Price");
			var nQuantity = this._oODataModel.getProperty(sSalesOrderItemPath + "/Quantity");
			if (nPrice && nQuantity) {
				this._oODataModel.setProperty(sSalesOrderItemPath + "/AmountGross", (nPrice * nQuantity).toString());
			} else {
				this._oODataModel.setProperty(sSalesOrderItemPath + "/AmountGross", "0");
			}
		},

		recalcSalesOrder: function(sSalesOrderPath) {
			var that = this;
			var nOrderTotalGross = 0;
			var sSalesOrderItemPath = "";
			return new Promise(function(resolve, reject) {
				that._oODataModel.readExt(sSalesOrderPath + "/SalesOrderItemDetails")
					.then(oData => {
						for (let oItem of oData.results) {
							sSalesOrderItemPath = that._oODataModel.getRelatedPath(oItem.__metadata.uri);
							that.recalcSalesOrderItem(sSalesOrderItemPath);
							nOrderTotalGross += Number(that._oODataModel.getProperty(sSalesOrderItemPath + "/AmountGross"));
						}
						that._oODataModel.setProperty(sSalesOrderPath + "/OrderTotalGross", nOrderTotalGross.toString());
						resolve();
					});
			});

		}

	});

	return SalesOrderService;
});