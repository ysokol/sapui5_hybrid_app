/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/core/routing/History",
	"my/sapui5_hybrid_app/model/service/RouteService"
], function(BaseController, formatter, History, RouteService) {
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
			//var sVisitPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().submitChangesExt();
			//.then((oData) => that.getComponentModel().readExt(sVisitPath + "/RouteDetails"))
			//.then((oData) => that._oRouteService.refreshMapDataModel(that.getComponentModel().getRelatedPath(oData.__metadata.uri)));
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
		
		onEquipmentScanBarcode: function(oEvent) {
			this.getComponenetBarcodeScannerService().scanBarcode().then(sCode => alert(sCode));
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
			//Add the filtered object oStorage after every filter to access the previous filtered data
			//oStorage.put("previousFilteredList","yourobj"); 

		}

	});

});