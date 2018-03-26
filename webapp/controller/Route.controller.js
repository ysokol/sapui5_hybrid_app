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
			this._oRouteService = new RouteService(this.getComponentModel());

			this.getRouter().getRoute("Route").attachPatternMatched(this._onObjectMatched, this);

			/*var wayPoint1 = new openui5.googlemaps.Waypoint(); 
			var wayPoint2 = new openui5.googlemaps.Waypoint(); 
			var wayPoint3 = new openui5.googlemaps.Waypoint(); 
			wayPoint1.location = 'Homebush';
			wayPoint2.location = 'Bankstown';
			wayPoint3.location = 'Menai';*/

			var directions = {
				name: "",
				lat: 0,
				lng: 0,
				start: '',
				end: '',
				travelMode: openui5.googlemaps.TravelMode.driving,
				stops: []
			};

			debugger;
			this._oDirectionsModel = new JSONModel(
				directions
			);

			this.getView().setModel(this._oDirectionsModel, "directions");
			//var oContext = new sap.ui.model.Context(this._oDirectionsModel, "/data");

			//this.byId("routeMapId").setBindingContext(oContext);
			//this.byId("input123").bindElement("");
			//this.byId("input124").setBindingContext(oContext);
			//this.byId("input125").setBindingContext(oContext);

		},

		refreshMap: function(sRoutePath) {
			var that = this;
			var sCurrentRoutePath = (sRoutePath) ? sRoutePath : this.getView().getElementBinding().getPath();

			that.getComponentModel().readExt(sCurrentRoutePath + "/VisitDetails").then(function(oData) {
				var oFirstVisit = null;
				var oLastVisit = null;
				var iCounter = 0;
				var aWaypoints = [];
				if (oData.results.length >= 2) {
					oLastVisit = oData.results.pop();
					for (let oVisit of oData.results) {
						if (!oFirstVisit) {
							oFirstVisit = oVisit;
						} else {
							aWaypoints.push({
								location: oVisit.GeoPosition
							});
						}
					}

					that._oDirectionsModel.setProperty("/lat", oFirstVisit.GeoPosition.split(',')[0].trim());
					that._oDirectionsModel.setProperty("/lng", oFirstVisit.GeoPosition.split(',')[1].trim());

					that._oDirectionsModel.setProperty("/start", oFirstVisit.GeoPosition);
					that._oDirectionsModel.setProperty("/end", oLastVisit.GeoPosition);
					that._oDirectionsModel.setProperty("/stops", aWaypoints);
				}
			});
		},

		onRouteMap: function(oEvent) {
			this.refreshMap();
			//var sObjPath = this.getView().getElementBinding().getPath().substring(1);
			//this.getRouter().navTo("routeMap", {
			//	objectPath: sObjPath
			//});
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
						.then(() => that.refreshMap(sCurrentRoutePath));
				});
		},

		onVisitDelete: function(oEvent) {
			var sCurrentRoutePath = this.getView().getElementBinding().getPath();
			var that = this;
			
			this.getComponentModel().removeExt(oEvent.getParameter("listItem").getBindingContext().getPath())
			.then(() => that._oRouteService.recalcVisitCount(sCurrentRoutePath))
			.then(() => that.getComponentModel().submitChangesExt())
			.then(() => that.refreshMap(sCurrentRoutePath));
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