sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.OfflineStoreService", {
		constructor: function() {
			Object.apply(this);
			this._offlineStore = null;
			//this._deviceModel = null;
			this._oUiComponent = null;
		},

		init: function(oUiComponent) {
			var properties = {
				"name": "SalesOrdersStore",
				"host": "hcpms-s0004431717trial.hanatrial.ondemand.com",
				"port": "443",
				"https": true,
				"storePath": "/sdcard",
				"serviceRoot": "/my_orders_odata",
				"definingRequests": {
					"Routes": "/Routes?$expand=VisitDetails",
					"Visits": "/Visits?$expand=CustomerDetails,RouteDetails,AttachmentDetails",
					"Audits": "/Audits?$expand=CustomerDetails,EquipmentDetails,VisitDetails",
					"Equipments": "/Equipments?$expand=CustomerDetails,AttachmentDetails,AuditDetails",
					"SalesOrders": "/SalesOrders?$expand=SalesOrderItemDetails,AttachmentDetails,CustomerDetails",
					"SalesOrderItems": "/SalesOrderItems?$expand=SalesOrderDetails",
					"Customers": "/Customers",
					"Materials": "/Materials",
					"UnitOfMeasures": "/UnitOfMeasures",
					"Attachments": "/Attachments?$expand=SalesOrderDetails,EquipmentDetails"
				}
			};
			this._offlineStore = sap.OData.createOfflineStore(properties);
			this._oUiComponent = oUiComponent;
		},

		getComponentModel: function(sModel) {
			return this._oUiComponent.getModel(sModel);
		},

		patchParentLinkForNestedEntities: function(mParameters) {
			debugger;
			var that = this;

			this.getComponentModel().readExt(mParameters.sEntitySetPath, {
					"$expand": mParameters.sParentEntityNavigationProperty
				})
				.then(oData => oData.results.forEach(function(oItem) {
					if (oItem["@com.sap.vocabularies.Offline.v1.inErrorState"]) {
						var sPath = oItem.__metadata.uri.replace(that.getComponentModel().sServiceUrl, "");
						that.getComponentModel().setProperty(sPath + "/" + mParameters.sParentEntityKeyProperty,
							oItem[mParameters.sParentEntityNavigationProperty][mParameters.sParentEntityKeyProperty]);
						that.getComponentModel().submitChanges();
						alert("Patched successfully: " + sPath + "/" + mParameters.sParentEntityKeyProperty);
					}
				}));
		},

		openStore: function() {
			this._offlineStore.open($.proxy(this.storeOpenSuccess, this), $.proxy(this.storeOpenFailed, this));
		},

		flushStore: function() {
			this._offlineStore.flush($.proxy(this.requestQSuccessCallback, this), $.proxy(this.errorCallback, this), $.proxy(this.onProgress,
				this));
		},

		clearStore: function() {
			this._offlineStore.clear($.proxy(this.clearStoreSuccessCallback, this), $.proxy(this.errorCallback, this));
		},

		closeStore: function() {
			this._offlineStore.close($.proxy(this.closeStoreSuccessCallback, this), $.proxy(this.errorCallback, this));
		},

		closeStoreSuccessCallback: function() {
			sap.m.MessageToast.show("Close storage success!", {
				duration: 3000
			});
		},

		clearStoreSuccessCallback: function() {
			sap.m.MessageToast.show("Clear storage success!", {
				duration: 3000
			});
		},

		refreshStore: function() {
			this._offlineStore.refresh($.proxy(this.storeRefreshSuccess, this), $.proxy(this.errorCallback, this));
		},

		storeRefreshSuccess: function() {
			sap.m.MessageToast.show("Offline Data Refresh succeeded :)", {
				duration: 3000
			});
		},

		errorCallback: function(e) {
			console.log("errorCallback(): ");
			console.log(e);

			sap.m.MessageToast.show("Err: " + e, {
				duration: 3000
			});
		},

		onProgress: function(progressStatus) {
			console.log("progressCallback(): ");
			console.log(progressStatus);
		},

		storeOpenSuccess: function() {
			sap.m.MessageToast.show("Offline Data Open succeeded :)", {
				duration: 3000
			});
			sap.OData.applyHttpClient();
			//if (!this.getModel("mobileDevice").getProperty("/isOffline")) {
			//	this._store.refresh($.proxy(this.storeRefreshSuccess, this), $.proxy(this.storeRefreshFailed, this), ["SalesOrders"]);
			//}
		},

		storeOpenFailed: function() {
			alert("Store Open Failed!");
		},

		getRequestQueueStatus: function() {
			sap.m.MessageToast.show("getRequestQueueStatus", {
				duration: 3000
			});
			debugger;
			this._offlineStore.getRequestQueueStatus($.proxy(this.requestQSuccessCallback, this), $.proxy(this.errorCallback, this));
		},

		requestQSuccessCallback: function(qStatus) {
			console.log("requestQSuccessCallback(): ");
			console.log(qStatus);
			sap.m.MessageToast.show("Data flushed successfully :)", {
				duration: 3000
			});
			//var statusStr = " contains items to be flushed";
			//if (qStatus.isEmpty) {
			//	statusStr = " is empty";
			//}
		}
	});
}, /* bExport= */ true);