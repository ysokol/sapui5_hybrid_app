/*global history */
sap.ui.define([
		"sap/ui/core/mvc/Controller",
		"sap/ui/core/routing/History",
		"my/sapui5_hybrid_app/utils/utils"
	], function (Controller, History, utils) {
		"use strict";
		return Controller.extend("my.sapui5_hybrid_app.controller.BaseController", {
			/**
			 * Convenience method for accessing the router in every controller of the application.
			 * @public
			 * @returns {sap.ui.core.routing.Router} the router for this component
			 */
			
			_utils: utils,
			
			getRouter : function () {
				return this.getOwnerComponent().getRouter();
			},

			/**
			 * Convenience method for getting the view model by name in every controller of the application.
			 * @public
			 * @param {string} sName the model name
			 * @returns {sap.ui.model.Model} the model instance
			 */
			getModel : function (sName) {
				return this.getView().getModel(sName);
			},

			/**
			 * Convenience method for setting the view model in every controller of the application.
			 * @public
			 * @param {sap.ui.model.Model} oModel the model instance
			 * @param {string} sName the model name
			 * @returns {sap.ui.mvc.View} the view instance
			 */
			setModel : function (oModel, sName) {
				return this.getView().setModel(oModel, sName);
			},

			/**
			 * Convenience method for getting the resource bundle.
			 * @public
			 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
			 */
			getResourceBundle : function () {
				return this.getOwnerComponent().getModel("i18n").getResourceBundle();
			},

			/**
			 * Event handler for navigating back.
			 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
			 * If not, it will replace the current entry of the browser history with the master route.
			 * @public
			 */
			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash(),
					oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

					if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
					history.go(-1);
				} else {
					this.getRouter().navTo("master", {}, true);
				}
			},
			
			getComponentModel : function (sName) {
				return this.getOwnerComponent().getModel(sName);
			},
			
			getComponentOfflineStoreService  : function () {
				return this.getOwnerComponent()._offlineStoreService;
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