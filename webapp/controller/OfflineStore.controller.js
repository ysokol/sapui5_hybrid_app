/*global location */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, JSONModel, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.OfflineStore", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function() {
			this.setModel(this.getComponentModel());
			this.getView().setModel(this.getComponentModel());
		},

		onErrorsArchiveRefresh: function() {
			this.getComponentModel().refresh();
		},

		onDataStoreFix: function() {
			this.getComponentOfflineStoreService().patchParentLinkForNestedEntities({
				sEntitySetPath: "/SalesOrderItems",
				sParentEntityNavigationProperty: "SalesOrderDetails",
				sParentEntityKeyProperty: "SalesOrder"
			});
			
			this.getComponentOfflineStoreService().patchParentLinkForNestedEntities({
				sEntitySetPath: "/Attachments",
				sParentEntityNavigationProperty: "SalesOrderDetails",
				sParentEntityKeyProperty: "SalesOrder"
			});
		},

		onDataStoreFlush: function(oEvent) {
			this.getComponentOfflineStoreService().flushStore();
		},

		onDataStoreRefresh: function(oEvent) {
			this.getComponentOfflineStoreService().refreshStore();
		},

		onDataStoreClear: function(oEvent) {
			this.getComponentOfflineStoreService().clearStore();
		},

		onDataStoreOpen: function(oEvent) {
			this.getComponentOfflineStoreService().openStore();
		},

		onDataStoreClose: function(oEvent) {
			this.getComponentOfflineStoreService().closeStore();
		},
		
		onAttachmentPushToCloud: function(oEvent) {
			this.getComponentAttachmentService().pushAllToCloudStorage();
		}
	});

});