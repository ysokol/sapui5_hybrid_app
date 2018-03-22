/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/model/json/JSONModel"
], function(BaseController, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Route", {

		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("route").attachPatternMatched(this._onObjectMatched, this);

			/*var wayPoint1 = new openui5.googlemaps.Waypoint(); 
			var wayPoint2 = new openui5.googlemaps.Waypoint(); 
			var wayPoint3 = new openui5.googlemaps.Waypoint(); 
			wayPoint1.location = 'Homebush';
			wayPoint2.location = 'Bankstown';
			wayPoint3.location = 'Menai';*/
			
			var directions = {
				name: "Bondi Beach",
				lat: -33.890542,
				lng: 151.274856,
				start: 'Manly',
				end: 'Cronulla',
				travelMode: openui5.googlemaps.TravelMode.driving,
				stops: [{
					location: "Homebush"
				}, {
					location: "Bankstown"
				}]
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

		onRouteMap: function(oEvent) {
			var sObjPath = this.getView().getElementBinding().getPath().substring(1);
			this.getRouter().navTo("routeMap", {
				objectPath: sObjPath
			});
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
					that.getComponentModel().create(sCurrentRoutePath + "/VisitDetails", {
						Route: sRoute,
						Visit: that.getUtils().stringPad(parseInt(maxItem) + 10, 5),
						RouteDetails: {
							__metadata: {
								uri: sCurrentRoutePath.substring(1)
							}
						}
					});
				});
		},

		onVisitDelete: function(oEvent) {
			this.getComponentModel().remove(oEvent.getSource().getParent().getBindingContext().getPath());
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