sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/model/odata/v2/ODataModel"
], function(JSONModel, Device, ODataModel) {
	"use strict";

	return {
		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createFLPModel: function() {
			var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
				bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
				oModel = new JSONModel({
					isShareInJamActive: bIsShareInJamActive
				});
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createMobileDeviceModel: function() { // This model used to communicate mobile device status (online\offline etc.)
			var mobileDeviceModel = {
				isMobileDevice: false,
				isOffline: false
			};
			var oModel = new JSONModel(mobileDeviceModel);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createODataModelWeb: function() { // oData model used for web application
			return new ODataModel(
				"https://myorderss0004431717trial.hanatrial.ondemand.com/MyOrders/odata", {
					json: true,
					useBatch: true,
					defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
					defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
					loadMetadataAsync: false,
					tokenHandling: true
				}
			);
		},
		
		createODataModelMobile: function() { // oData model used for mobile application, it's proxied thru  HCP Mobile Services
			return new ODataModel(
				"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata/", {
					json: true,
					useBatch: false,
					defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
					defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put
					//loadMetadataAsync: false,
					//tokenHandling: true
				}
			);
		}
	};

});