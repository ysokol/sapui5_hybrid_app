/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/GroupHeaderListItem",
	"sap/ui/Device",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, JSONModel, History, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.RouteListMaster", {

		formatter: formatter,

		onInit: function() {},

		onSelectionChange: function(oEvent) {
			var bReplace = !Device.system.phone;
			var oSelListItem = oEvent.getParameter("listItem") || oEvent.getSource();
			var sObjPath = oSelListItem.getBindingContext().getPath().substring(1);

			this.getRouter().navTo("Route", {
				objectPath: sObjPath
			}, bReplace);
		},

		onRefresh: function() {
			this.byId("RoutesListId").getBinding("items").refresh();
		},

		onUpdateFinished: function(oEvent) {
			// update the master list object counter after new data is loaded
			// hide pull to refresh if necessary
			this.byId("pullToRefresh").hide();
		},

		onNavToOfflineStore: function(oEvent) {
			this.getRouter().navTo("OfflineStore");
		},

		onLoginToMsGraph: function(oEvent) {
			// App Name: ys_msgraph_app
			var that = this;
			var authority = "https://login.microsoftonline.com/common",
				redirectUri = "https://login.microsoftonline.com/common/oauth2/nativeclient",
				resourceUri = "https://graph.microsoft.com",
				clientId = "665cff30-8767-4c7f-ab36-f2f4adab9a54",
				graphApiVersion = "v1";
			var authCompletedCallback = function(token) {
				alert(JSON.stringify(token, null, 4));

				$.ajax({
					type: "GET",
					url: "https://graph.microsoft.com/v1.0/me/",
					headers: {
						"Authorization": "Bearer " + token.accessToken
					}
				}).done(function(response) {
					alert(JSON.stringify(response, null, 4));
				}).fail(function() {
					alert("Fetching files from OneDrive failed.");
				});

			}

			that.context = new Microsoft.ADAL.AuthenticationContext(authority);
			that.context.tokenCache.readItems().then(function(items) {
				if (items.length > 0) {
					authority = items[0].authority;
					that.context = new Microsoft.ADAL.AuthenticationContext(authority);
				}
				// Attempt to authorize the user silently
				that.context.acquireTokenSilentAsync(resourceUri, clientId)
					.then(authCompletedCallback, function() {
						// We require user credentials, so this triggers the authentication dialog box
						that.context.acquireTokenAsync(resourceUri, clientId, redirectUri)
							.then(authCompletedCallback, function(err) {
								that.error("Failed to authenticate: " + err);
							});
					});
			});
		}

	});

});