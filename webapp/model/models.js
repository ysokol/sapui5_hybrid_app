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
			var oDataModel = new ODataModel(
				"https://myorderss0004431717trial.hanatrial.ondemand.com/MyOrders/odata", {
					json: true,
					//useBatch: true,
					defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
					defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Put,
					loadMetadataAsync: false,
					tokenHandling: true
				}
			);
			
			oDataModel.attachPropertyChange(this.onODataModelPropertyChange, oDataModel);
			
			return oDataModel;
		},
		
		createODataModelMobile: function() { // oData model used for mobile application, it's proxied thru  HCP Mobile Services
			var oDataModel = new ODataModel(
				"https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata/", {
					json: true,
					useBatch: false,
					defaultBindingMode: sap.ui.model.BindingMode.TwoWay,
					defaultUpdateMethod: sap.ui.model.odata.UpdateMethod.Patch
					//loadMetadataAsync: false,
					//tokenHandling: true
				}
			);
			
			//oDataModel.attachPropertyChange(this.onODataModelPropertyChange, oDataModel);
			
			return oDataModel;
			
		},
		
		onODataModelPropertyChange: function (oEvent) {
            debugger;
            try {
            	// Conver number to string, Apache Olingo does not understand numbers :(
                if (oEvent.getParameters().path === "Quantity" && typeof oEvent.getParameters().value === "number") {
                	this.setProperty(oEvent.getParameters().context.getPath() + "/Quantity", oEvent.getParameters().value.toString());
                }
                // Trigger UpdateFlag property
                if (oEvent.getParameters().path !== "UpdateFlag") {
                    this.setProperty(oEvent.getParameters().context.getPath() + "/UpdateFlag", "");
                    for (var key in this.getProperty(oEvent.getParameters().context.getPath())) {
                        if (key !== "UpdateFlag") {
                            if (this.getOriginalProperty(oEvent.getParameters().context.getPath() + "/" + key) !==
                                    this.getProperty(oEvent.getParameters().context.getPath() + "/" + key)) {
                                this.setProperty(oEvent.getParameters().context.getPath() + "/UpdateFlag", "U");
                                break;
                            }
                        }
                    }
                }
            } catch (err) {
            	// Implement Error Handling
            }
        }
		
		
	};

});