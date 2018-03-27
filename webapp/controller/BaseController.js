/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"my/sapui5_hybrid_app/utils/utils"
	], function (Controller, History, utils) {
		"use strict";
		return Controller.extend("my.sapui5_hybrid_app.controller.BaseController", {
			_utils: utils,
			
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},
			
			getUtils() {
				return this._utils;
			},
			
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			getComponentModel: function (sName) {
				return this.getOwnerComponent().getModel(sName);
			},
			
			getComponentOfflineStoreService: function () {
				return this.getOwnerComponent()._oOfflineStoreService;
			},
			
			getComponentAttachmentService: function () {
				return this.getOwnerComponent()._oAttachmentService;
			},
			
			getComponentPushNotificationService: function () {
				return this.getOwnerComponent()._oPushNotificationService;
			},
			
			getComponenetBarcodeScannerService: function () {
				return this.getOwnerComponent()._oBarcodeScannerService;
			},
			
			getComponentCaptureMediaService: function () {
				return this.getOwnerComponent()._oCaptureMediaService;
			},
			
			getNumberRangeService: function () {
				return this.getOwnerComponent()._oNumberRangeService;
			},
			
			isOffline: function() {
				if (!this.getComponentModel("mobileDevice")) {
					throw "Model mobileDeviceModel not defined";
				}
				if (!this.getComponentModel("mobileDevice").getProperty("/isMobileDevice")) {
					return true;
				}
				else {
					if(sap.smp && sap.smp.registration && sap.smp.registration.stores)
						return true;
					return false;
				}
			},
			
			isMobileDevice: function() {
				if (!this.getComponentModel("mobileDevice")) {
					throw "Model mobileDeviceModel not defined";
				}
				return this.getComponentModel("mobileDevice").getProperty("/isMobileDevice");
			},

		});

	}
);