sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	var SalesOrderService = Object.extend("my.sapui5_hybrid_app.model.service.SalesOrderService", {
		constructor: function(oODataModel, oProcessModel) {
			Object.apply(this);
			this._oODataModel = oODataModel;
			this._oProcessModel = oProcessModel;

			var oProcessFlowData = {
				"nodes": [{
					"id": "1",
					"lane": "0",
					"title": "Sales Order 1",
					"titleAbbreviation": "SO 1",
					"children": ["10"],
					"isTitleClickable": true,
					"state": "Positive",
					"stateText": "OK status",
					"focused": true,
					"texts": ["Sales Order Document Overdue long text for the wrap up all the aspects", "Not cleared"]
				}, {
					"id": "10",
					"lane": "1",
					"title": "Outbound Delivery 1",
					"titleAbbreviation": "OD 1",
					"children": [],
					"state": "Negative",
					"stateText": "NOT OK",
					"texts": ["text 1", "text 2"]
				}],
				"lanes": [{
					"id": "0",
					"icon": "sap-icon://order-status",
					"label": "Order Entry",
					"position": 0
				}, {
					"id": "1",
					"icon": "sap-icon://monitor-payments",
					"label": "Order Submission",
					"position": 1
				}, {
					"id": "2",
					"icon": "sap-icon://payment-approval",
					"label": "Credit Check",
					"position": 2
				}, {
					"id": "3",
					"icon": "sap-icon://money-bills",
					"label": "Invoicing",
					"position": 3
				}, {
					"id": "4",
					"icon": "sap-icon://payment-approval",
					"label": "Payment Processing",
					"position": 4
				}]
			};
			this._oProcessModel.setData(oProcessFlowData);

		},

		refreshStatusModel: function(sSalesOrderPath) {
			var aProcessNodes = [];
			aProcessNodes.push({});
			aProcessNodes[0].id = "10";
			aProcessNodes[0].lane = "0";
			aProcessNodes[0].state = "Positive";
			aProcessNodes[0].stateText = "Draft Saved";
			aProcessNodes[0].title = "Sales Order Draft # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");
			aProcessNodes[0].titleAbbreviation = "SO Draft # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");

			if (this._oODataModel.getProperty(sSalesOrderPath + "/Status") === "SUBMITTED" || this._oODataModel.getProperty(sSalesOrderPath + "/Status") === "RELEASED") {
				aProcessNodes.push({});
				aProcessNodes[1].id = "20";
				aProcessNodes[1].lane = "1";
				aProcessNodes[1].state = "Positive";
				aProcessNodes[1].stateText = "Submitted";
				aProcessNodes[1].title = "Sales Order # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");
				aProcessNodes[1].titleAbbreviation = "SO # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");

				aProcessNodes[0].children = ["20"];
			}
			
			if (this._oODataModel.getProperty(sSalesOrderPath + "/Status") === "RELEASED") {
				aProcessNodes.push({});
				aProcessNodes[2].id = "30";
				aProcessNodes[2].lane = "2";
				aProcessNodes[2].state = "Positive";
				aProcessNodes[2].stateText = "Credit Released";
				aProcessNodes[2].title = "Sales Order # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");
				aProcessNodes[2].titleAbbreviation = "SO # " + this._oODataModel.getProperty(sSalesOrderPath + "/SalesOrder");

				aProcessNodes[1].children = ["30"];
			}

			this._oProcessModel.setProperty("/nodes", aProcessNodes);
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
			debugger;
			var that = this;
			var nOrderTotalGross = 0;

			/*for (let sSalesOrderItemPath of that._oODataModel.getProperty(sSalesOrderPath).SalesOrderItemDetails.__list) {
				nOrderTotalGross += Number(that._oODataModel.getProperty("/" + sSalesOrderItemPath + "/AmountGross"));
			}

			that._oODataModel.setProperty(sSalesOrderPath + "/OrderTotalGross", nOrderTotalGross.toString());*/

			//that._oODataModel.
			return new Promise(function(resolve, reject) {
				that._oODataModel.readExt(sSalesOrderPath, {
						"$expand": "SalesOrderItemDetails"
					})
					.then(() => {
						for (let sSalesOrderItemPath of that._oODataModel.getProperty(sSalesOrderPath).SalesOrderItemDetails.__list) {
							nOrderTotalGross += Number(that._oODataModel.getProperty("/" + sSalesOrderItemPath + "/AmountGross"));
						}

						that._oODataModel.setProperty(sSalesOrderPath + "/OrderTotalGross", nOrderTotalGross.toString());
					})
					/*that._oODataModel.readExt(sSalesOrderPath + "/SalesOrderItemDetails")
						.then(oData => {
							for (let oItem of oData.results) {
								sSalesOrderItemPath = that._oODataModel.getRelatedPath(oItem.__metadata.uri);
								//that.recalcSalesOrderItem(sSalesOrderItemPath);
								nOrderTotalGross += Number(that._oODataModel.getProperty(sSalesOrderItemPath + "/AmountGross"));
							}
							that._oODataModel.setProperty(sSalesOrderPath + "/OrderTotalGross", nOrderTotalGross.toString());
							resolve();
						});*/
			});

		}

	});

	return SalesOrderService;
});