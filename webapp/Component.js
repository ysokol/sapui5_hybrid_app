sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"my/sapui5_hybrid_app/model/models",
	"my/sapui5_hybrid_app/controller/ListSelector",
	"my/sapui5_hybrid_app/controller/ErrorHandler",
	"my/sapui5_hybrid_app/localService/mockserver",
	"my/sapui5_hybrid_app/model/offlineStoreService"
], function(UIComponent, Device, models, ListSelector, ErrorHandler, MockServer, offlineStoreService) {
	"use strict";

	return UIComponent.extend("my.sapui5_hybrid_app.Component", {

		metadata: {
			manifest: "json"
		},

		init: function() {
			debugger;
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

		},

		deviceInit: function() {
			console.log('onDeviceReady()');

			if (sap.Logger) {
				sap.Logger.setLogLevel(sap.Logger.DEBUG); //enables the display of debug log messages from the Kapsel plugins.
				sap.Logger.debug("Log level set to DEBUG");
			}
			if (navigator.connection.type === Connection.NONE) {
				MockServer.init(); // start mock server in order to handle $metdata request which is not handled by Kapsel offline data 
				this.getModel("mobileDevice").setProperty("/isOffline", true);
			}

			var properties = {
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
			};
			//this._store = sap.OData.createOfflineStore(properties);
			//this._store.open($.proxy(this.storeOpenSuccess, this), $.proxy(this.storeOpenFailed, this));
			this._offlineStoreService = offlineStoreService;
			this._offlineStoreService.init(this);
			this._offlineStoreService.openStore();
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
		/*storeRefreshSuccess: function() {
			debugger;
			sap.m.MessageToast.show("Offline Data Refresh succeeded :)", {
				duration: 3000
			});
		},

		//Synchronization Failed
		storeRefreshFailed: function() {
			sap.m.MessageToast.show("Data Offline Data Refresh failed :(", {
				duration: 3000
			});
		},*/

		/**
		 * The component is destroyed by UI5 automatically.
		 * In this method, the ListSelector and ErrorHandler are destroyed.
		 * @public
		 * @override
		 */
		destroy: function() {
			this.oListSelector.destroy();
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 */
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