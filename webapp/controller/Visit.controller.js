/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/core/routing/History",
	"my/sapui5_hybrid_app/model/service/RouteService",
	"sap/m/MessageBox"
], function(BaseController, formatter, History, RouteService, MessageBox) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Visit", {

		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("Visit").attachPatternMatched(this._onObjectMatched, this);
			this._oRouteService = new RouteService(this.getComponentModel(), this.getComponentModel("routeMapModel"));
		},

		onVisitOpen: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().setProperty(sVisitPath + "/Status", "OPENED");

			that.getComponentModel().submitChangesExt()
				.then((oData) => that.getComponentModel().readExt(sVisitPath + "/RouteDetails"))
				.then((oData) => that._oRouteService.recalcVisitCount(that.getComponentModel().getRelatedPath(oData.__metadata.uri)))
				.then(() => that.getComponentModel().submitChangesExt());

		},

		onVisitClose: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().setProperty(sVisitPath + "/Status", "CLOSED");

			that.getComponentModel().submitChangesExt()
				.then((oData) => that.getComponentModel().readExt(sVisitPath + "/RouteDetails"))
				.then((oData) => that._oRouteService.recalcVisitCount(that.getComponentModel().getRelatedPath(oData.__metadata.uri)))
				.then(() => that.getComponentModel().submitChangesExt());
		},

		onVisitSave: function(oEvent) {
			var that = this;
			that.getComponentModel().submitChangesExt();
		},

		onCustomerSelected: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().readExt(oEvent.getParameter("selectedItem").getBindingContext().getPath())
				.then(oData => that.getComponentModel().setProperty(sVisitPath + "/GeoPosition", oData.GeoPosition));
		},

		onEquipmentAddPress: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getNumberRangeService().getNextNumber({
					sEntity: "Equipments",
					sProperty: "Equipment",
					sInitialValue: "0000000000",
					iStep: 10
				})
				.then((sNextNumber) =>
					that.getComponentModel().createExt("/Equipments", {
						Equipment: sNextNumber,
						Description: "New Equipment",
						Customer: that.getComponentModel().getProperty(sVisitPath + "/Customer")
					})
				);
		},
		
		onEquipmentScanBarcode: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();
			
			that.getComponenetBarcodeScannerService().scanBarcode()
				.then(function(sCode) {
					that.getComponentModel().readExt("/Equipments('" + sCode.substring(0, 10) + "')")
						.then(oData => that.getRouter().navTo("Equipment", {
							objectPath: "Equipments('" + sCode.substring(0, 10) + "')"
						}))
						.catch(oException => MessageBox.confirm("Eqipment id '" + sCode + "' not found, do you want to create it?", {
							onClose: function(oAction) {
								if (oAction === sap.m.MessageBox.Action.OK) {
									that.getComponentModel().createExt("/Equipments", {
										Equipment: sCode.substring(0, 10),
										Description: "New Equipment",
										Customer: that.getComponentModel().getProperty(sVisitPath + "/Customer")
									});
								}		
							}
						}));
				});
		},

		onEquipmentDelete: function(oEvent) {
			this.getComponentModel().removeExt(oEvent.getParameter("listItem").getBindingContext().getPath());
		},

		onEquipmentPress: function(oEvent) {
			var oSelListItem = oEvent.getSource();
			var sObjPath = oSelListItem.getBindingContext().getPath().substring(1);

			this.getRouter().navTo("Equipment", {
				objectPath: sObjPath
			});
		},
		
		onSalesOrderAdd: function(oEvent) {
			var that = this;
			var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();
			var sSalesOrderInitialNumber = "0000000000";
			var iStep = 10;
			
			if (this.isMobileDevice()) {
				sSalesOrderInitialNumber = "$1";
				iStep = 1;
			}
			
			that.getNumberRangeService().getNextNumber({
					sEntity: "SalesOrders",
					sProperty: "SalesOrder",
					sInitialValue: sSalesOrderInitialNumber,
					iStep: iStep
				})
				.then((sNextNumber) =>
					that.getComponentModel().createExt("/SalesOrders", {
						SalesOrder: sNextNumber,
						Currency: "RUB",
						Customer: that.getComponentModel().getProperty(sVisitPath + "/Customer"),
						Status: "DRAFT",
						Comment: "New Sales Order"
					})
				);
		},
		
		onSalesOrderDelete: function(oEvent) {
			this.getComponentModel().removeExt(oEvent.getParameter("listItem").getBindingContext().getPath());
		},
		
		onSalesOrderPress: function(oEvent) {
			var oSelListItem = oEvent.getSource();
			var sObjPath = oSelListItem.getBindingContext().getPath().substring(1);

			this.getRouter().navTo("SalesOrder", {
				objectPath: sObjPath
			});
		},

		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		_onObjectMatched: function(oEvent) {
			var objectPath = oEvent.getParameter("arguments").objectPath;
			var that = this;
			if (objectPath && objectPath !== "") {
				that.getModel().metadataLoaded()
					.then(function() {
						that._bindView("/" + objectPath); // Mobile Version
					})
					.catch(function() {
						// Metadata Not loaded :[o]
					});
			}
		},

		_bindView: function(sObjectPath) {
			debugger;
			this.getView().bindElement({
				path: sObjectPath
			});

			var oFilter = new sap.ui.model.Filter("Customer", sap.ui.model.FilterOperator.EQ,
				this.getComponentModel().getProperty(sObjectPath + "/Customer"));
			this.getView().byId("EquipmentListId").getBinding("items").filter([oFilter]);
		}

	});

});