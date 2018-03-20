/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Route", {

		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("route").attachPatternMatched(this._onObjectMatched, this);
			
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