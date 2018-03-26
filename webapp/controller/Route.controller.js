/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_hybrid_app/model/service/RouteService"
], function(BaseController, formatter, JSONModel, RouteService) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Route", {

		formatter: formatter,

		onInit: function() {
			this._oRouteService = new RouteService(this.getComponentModel(), this.getComponentModel("routeMapModel"));

			this.getRouter().getRoute("Route").attachPatternMatched(this._onObjectMatched, this);

			this._oDirectionsModel = this.getComponentModel("routeMapModel");

			this.getView().setModel(this.getComponentModel("routeMapModel"), "directions");

		},

		refreshMap: function(sRoutePath) {
			var sCurrentRoutePath = (sRoutePath) ? sRoutePath : this.getView().getElementBinding().getPath();
			this._oRouteService.refreshMapDataModel(sCurrentRoutePath);
		},

		onRouteMap: function(oEvent) {
			this.refreshMap();
		},

		onVisitPress: function(oEvent) {
			var oSelListItem = oEvent.getSource();
			var sObjPath = oSelListItem.getBindingContext().getPath().substring(1);

			this.getRouter().navTo("visit", {
				objectPath: sObjPath
			});
		},

		onVisitAdd: function(oEvent) {
			var sCurrentRoutePath = this.getView().getElementBinding().getPath();
			var sRoute = this.getComponentModel().getProperty(sCurrentRoutePath).Route;
			var maxItem = "00000";
			var that = this;
			var mODataFilter = {
				"$top": "1",
				"$orderby": "Visit desc"
			};
			that.getComponentModel().readExt(sCurrentRoutePath + "/VisitDetails", mODataFilter)
				.then(function(oData) {
					if (oData.results[0]) {
						maxItem = oData.results[0].Visit;
					}
					that.getComponentModel().createExt(sCurrentRoutePath + "/VisitDetails", {
							Route: sRoute,
							Visit: that.getUtils().stringPad(parseInt(maxItem) + 10, 5),
							Status: "PLAN",
							RouteDetails: {
								__metadata: {
									uri: sCurrentRoutePath.substring(1)
								}
							}
						})
						.then(() => that._oRouteService.recalcVisitCount(sCurrentRoutePath))
						.then(() => that.getComponentModel().submitChangesExt())
						.then(() => that._oRouteService.refreshMapDataModel(sCurrentRoutePath));
				});
		},

		onVisitDelete: function(oEvent) {
			var sCurrentRoutePath = this.getView().getElementBinding().getPath();
			var that = this;
			
			this.getComponentModel().removeExt(oEvent.getParameter("listItem").getBindingContext().getPath())
			.then(() => that._oRouteService.recalcVisitCount(sCurrentRoutePath))
			.then(() => that.getComponentModel().submitChangesExt())
			.then(() => that._oRouteService.refreshMapDataModel(sCurrentRoutePath));
		},

		onRouteSave: function(oEvent) {
			this.getComponentModel().submitChanges();
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
			} else {
				this.refreshMap(objectPath);
			}
		},

		_bindView: function(sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath
			});
			this.refreshMap();
			/*, // + "?$expand=SalesOrderItemDetails", // / - requried for web, for mobile not required
			events: {
				change: this._onBindingChange.bind(this),
				dataRequested: function() {
					//oViewModel.setProperty("/busy", true);
				},
				dataReceived: function() {
					//oViewModel.setProperty("/busy", false);
				}
			}*/

		}

	});

});