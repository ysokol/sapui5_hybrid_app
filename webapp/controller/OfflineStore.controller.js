/*global location */
sap.ui.define([
		"my/sapui5_hybrid_app/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"my/sapui5_hybrid_app/model/formatter"
	], function (BaseController, JSONModel, formatter) {
		"use strict";

		return BaseController.extend("my.sapui5_hybrid_app.controller.OfflineStore", {

			formatter: formatter,

			/* =========================================================== */
			/* lifecycle methods                                           */
			/* =========================================================== */

			onInit : function () {
				this.setModel(this.getComponentModel());
				this.getView().setModel(this.getComponentModel());
			},
			
			onErrorsArchiveRefresh : function () {
				this.getComponentModel().refresh();
			},
			
			onDataStoreFix  : function () {
				debugger;
				var that = this;
				this.getComponentModel().read("/SalesOrderItems?$expand=SalesOrderDetails", {
					success: function(oData) {
						oData.results.forEach(function(soItem) {
							if (soItem["@com.sap.vocabularies.Offline.v1.inErrorState"]) {
								var def_uri = soItem.SalesOrderDetails.__deferred.uri.replace("https://myorderss0004431717trial.hanatrial.ondemand.com:443/MyOrders/odata", "");
								def_uri = def_uri.replace("https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata", "");
								that.getComponentModel().read(def_uri, {
									success: function(oData2) {
										var uri = soItem.__metadata.uri.replace("https://myorderss0004431717trial.hanatrial.ondemand.com:443/MyOrders/odata", "");
										uri = uri.replace("https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata", "");
										that.getComponentModel().setProperty(uri + "/SalesOrder", oData2.SalesOrder);
										that.getComponentModel().submitChanges();

									}
								});
							}
						}); 
					}
				});
			},
			
			onDataStoreFlush : function (oEvent) {
				
				
				this.getComponentOfflineStoreService().flushStore();                         
			},
			
			onDataStoreRefresh : function (oEvent) {
				this.getComponentOfflineStoreService().refreshStore();                         
			},
			
			onDataStoreClear : function (oEvent) {
				this.getComponentOfflineStoreService().clearStore();
			},
			
			onDataStoreOpen: function (oEvent) {
				this.getComponentOfflineStoreService().openStore();
			},
			
			onDataStoreClose: function (oEvent) {
				this.getComponentOfflineStoreService().closeStore();
			}
		});

	}
);