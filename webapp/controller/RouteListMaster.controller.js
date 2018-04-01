/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.RouteListMaster", {

		formatter: formatter,

		onInit: function() {
		},
		
		onSelectionChange: function(oEvent) {
			var bReplace = !Device.system.phone;
			var oSelListItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var sObjPath = oSelListItem.getBindingContext().getPath().substring(1);
			
			this.getRouter().navTo("Route", {
				objectPath: sObjPath
			}, bReplace);
		},
		
		onRefresh: function() {
			this.byId("RoutesListId").getBinding("items").refresh();
		},
		
		onUpdateFinished: function(oEvent) {
			// update the master list object counter after new data is loaded
			// hide pull to refresh if necessary
			this.byId("pullToRefresh").hide();
		},
		
		onNavToOfflineStore: function(oEvent) {
			this.getRouter().navTo("OfflineStore");
		}

	});

});