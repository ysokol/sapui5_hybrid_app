sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function(JSONModel) {
	"use strict";

	return {
		_offlineStore: null,
		_deviceModel: null,

		init: function(uiComponent) {
			var properties = {
				"name": "SalesOrdersStore",
				"host": "hcpms-s0004431717trial.hanatrial.ondemand.com",
				"port": "443",
				"https": true,
				"storePath": "/sdcard",
				"serviceRoot": "/my_orders_odata",
				"definingRequests": {
					"SalesOrders": "/SalesOrders?$expand=SalesOrderItemDetails",
					"SalesOrderItems": "/SalesOrderItems?$expand=SalesOrderDetails",
					"Customers": "/Customers",
					"Materials": "/Materials",
					"UnitOfMeasures": "/UnitOfMeasures"
				}
			};
			this._offlineStore = sap.OData.createOfflineStore(properties);
			this._deviceModel = uiComponent.getModel("mobileDevice");
		},
		
		openStore: function() {
			this._offlineStore.open($.proxy(this.storeOpenSuccess, this), $.proxy(this.storeOpenFailed, this));
		},
		
		flushStore: function() {
			this._offlineStore.flush($.proxy(this.requestQSuccessCallback, this), $.proxy(this.errorCallback, this), $.proxy(this.onProgress, this));
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
			/*var statusStr = " contains items to be flushed";
			if (qStatus.isEmpty) {
				statusStr = " is empty";
			}*/
		}
	};

});