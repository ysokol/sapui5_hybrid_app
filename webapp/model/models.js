sap.ui.define([
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/odata/v2/ODataModel"
	], function (JSONModel, Device, ODataModel) {
		"use strict";

		return {
			createDeviceModel : function () {
				var oModel = new JSONModel(Device);
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},

			createFLPModel : function () {
				var fnGetuser = jQuery.sap.getObject("sap.ushell.Container.getUser"),
					bIsShareInJamActive = fnGetuser ? fnGetuser().isJamActive() : false,
					oModel = new JSONModel({
						isShareInJamActive: bIsShareInJamActive
					});
				oModel.setDefaultBindingMode("OneWay");
				return oModel;
			},

			createODataModel : function () {
				var isCordovaApp = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1;
				var oDataModel;
				if (isCordovaApp) {
					oDataModel = new ODataModel(
						"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata/", {
						json: true,
                		useBatch: false
						}
					);
				} else {
					oDataModel = new ODataModel(
						"https://myorderss0004431717trial.hanatrial.ondemand.com/MyOrders/odata", {
						json: true,
                		useBatch: false
						}
					);
				}
				return oDataModel;
			}
		};

	}
);