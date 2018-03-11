sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sapui5_hybrid_app/model/models",
	"my/sapui5_hybrid_app/controller/ListSelector",
	"my/sapui5_hybrid_app/controller/ErrorHandler",
	"my/sapui5_hybrid_app/localService/mockserver",
	"my/sapui5_hybrid_app/utils/OfflineStoreService",
	"my/sapui5_hybrid_app/utils/AttachmentService",
	"my/sapui5_hybrid_app/utils/MyException",
	"my/sapui5_hybrid_app/utils/PushNotificationService"
], function(UIComponent, Device, models, ListSelector, ErrorHandler, MockServer, OfflineStoreService, AttachmentService, MyException, PushNotificationService) {
	"use strict";

	return UIComponent.extend("my.sapui5_hybrid_app.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			this.setModel(models.createMobileDeviceModel(), "mobileDevice");
			this.getModel("mobileDevice").setProperty("/isMobileDevice", document.URL.indexOf('http://') === -1 && document.URL.indexOf(
				'https://') === -1);
			this.getModel("mobileDevice").setProperty("/isOffline", false);
			if (this.getModel("mobileDevice").getProperty("/isMobileDevice")) {
				document.addEventListener('deviceready', $.proxy(this.deviceInit, this), false);
				document.addEventListener("offline", $.proxy(this.onOffline, this), false);
				document.addEventListener("online", $.proxy(this.onOnline, this), false);

			} else {
				this.initComponent();
			}
			
			window.addEventListener('load', function() {
				$.getScript('https://apis.google.com/js/api.js?onload=googleAapiLoaded');
			});
			
			
			window.onerror = function(msg, url, line, col, error) {
				alert(msg);
			};
			
			window.addEventListener('unhandledrejection', function(event) {
				 throw new MyException("Unhandled Rejection", "N/A", event);
			});
			
		},

		deviceInit: function() {
			console.log('onDeviceReady()');
			
			//$.getScript('https://apis.google.com/js/api.js?onload=googleAapiLoaded');

			if (sap.Logger) {
				sap.Logger.setLogLevel(sap.Logger.DEBUG); //enables the display of debug log messages from the Kapsel plugins.
				sap.Logger.debug("Log level set to DEBUG");
			}
			if (navigator.connection.type === Connection.NONE) {
				MockServer.init(); // start mock server in order to handle $metdata request which is not handled by Kapsel offline data 
				this.getModel("mobileDevice").setProperty("/isOffline", true);
			}

			/*var properties = {
				"name": "SalesOrdersStore",
				"host": "hcpms-s0004431717trial.hanatrial.ondemand.com",
				"port": "443",
				"https": true,
				"storePath": "/sdcard",
				"serviceRoot": "/my_orders_odata",
				"definingRequests": {
					"SalesOrders": "/SalesOrders",
					"SalesOrderItems": "/SalesOrderItems",
					"Customers": "/Customers",
					"Materials": "/Materials",
					"UnitOfMeasures": "/UnitOfMeasures"
				}
			};*/
			//this._store = sap.OData.createOfflineStore(properties);
			//this._store.open($.proxy(this.storeOpenSuccess, this), $.proxy(this.storeOpenFailed, this));
			this._offlineStoreService = new OfflineStoreService();
			this._offlineStoreService.init(this);
			this._offlineStoreService.openStore();
			
			this._oPushNotificationService = new PushNotificationService();
			//this._oPushNotificationService.init();
			
			this.initComponent();

		},

		initComponent: function() {

			//alert("my.sapui5_hybrid_app.Component.init()");
			//debugger;
			this.setModel(models.createDeviceModel(), "device");
			//sap.ui.getCore().setModel(this.getModel("device"), "device");
			//sap.ui.getCore().setModel(this.getModel("mobileDevice"), "mobileDevice");
			this.setModel(models.createFLPModel(), "FLP");
			//sap.ui.getCore().setModel(this.getModel("FLP"), "FLP");
			if (this.getModel("mobileDevice").getProperty("/isMobileDevice")) {
				this.setModel(models.createODataModelMobile());
			} else {
				this.setModel(models.createODataModelWeb());
			}
			//MockServer.init(); // start mock server in order to handle $metdata request which is not handled by Kapsel offline data 
			
			// google API bootstrap
			this._attachmentService = new AttachmentService(this, this.getModel());
			
			sap.ui.getCore().setModel(this.getModel());

			this.oListSelector = new ListSelector();
			this._oErrorHandler = new ErrorHandler(this);

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);

			// create the views based on the url/hash
			this.getRouter().initialize();
		},

		onOffline: function() {
			this.getModel("mobileDevice").setProperty("/isOffline", true);
			sap.m.MessageToast.show("You go offline, please come back soon!");
			console.log('onOffline()');
		},

		onOnline: function() {
			this.getModel("mobileDevice").setProperty("/isOffline", false);
			sap.m.MessageToast.show("Greate, you are back online");
			console.log('onOnline()');
		},

		destroy: function() {
			this.oListSelector.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		getContentDensityClass: function() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}

	});

});

function googleAapiLoaded() {
	gapi.load('client:auth2', googleApiLoaded2);
}

function googleApiLoaded2() {
	gapi.client.load('drive', 'v3');
}