sap.ui.define([
	"sap/ui/core/util/MockServer"
], function(MockServer) {
	"use strict";

	var oMockServer,
		_sAppModulePath = "my/sapui5_hybrid_app/",
		_sJsonFilesModulePath = _sAppModulePath + "localService/mockdata";

	return {
		/**
		 * Initializes the mock server.
		 * You can configure the delay with the URL parameter "serverDelay".
		 * The local mock data in this folder is returned instead of the real data for testing.
		 * @public
		 */

		init: function() {

			// create
			this._oMockServer = new MockServer({
				rootUri: "https://hcpms-s0004431717trial.hanatrial.ondemand.com:443/my_orders_odata/"
			});

			// simulate against the metadata and mock data
			var sPath = jQuery.sap.getModulePath("my.sapui5_hybrid_app.localService");
			console.log(sPath + "/metadata.xml");
			
			this._oMockServer.simulate(sPath + "/metadata.xml");

			// start
			this._oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");

			/*var oUriParameters = jQuery.sap.getUriParameters(),
				sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath),
				sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json"),
				sEntity = "SalesOrders",
				sErrorParam = oUriParameters.get("errorType"),
				iErrorCode = sErrorParam === "badRequest" ? 400 : 500,
				oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data,
				oMainDataSource = oManifest["sap.app"].dataSources.mainService,
				sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml"),
				// ensure there is a trailing slash
				sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";

			oMockServer = new MockServer({
				rootUri : sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond : true,
				autoRespondAfter : (oUriParameters.get("serverDelay") || 1000)
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl : sJsonFilesUrl,
				bGenerateMissingMockData : true
			});

			var aRequests = oMockServer.getRequests(),
				fnResponse = function (iErrCode, sMessage, aRequest) {
					aRequest.response = function(oXhr){
						oXhr.respond(iErrCode, {"Content-Type": "text/plain;charset=utf-8"}, sMessage);
					};
				};

			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach( function ( aEntry ) {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			// Handling request errors
			if (sErrorParam) {
				aRequests.forEach( function ( aEntry ) {
					if (aEntry.path.toString().indexOf(sEntity) > -1) {
						fnResponse(iErrorCode, sErrorParam, aEntry);
					}
				});
			}
			oMockServer.setRequests(aRequests);
			oMockServer.start();

			jQuery.sap.log.info("Running the app with mock data");*/
		},

		/**
		 * @public returns the mockserver of the app, should be used in integration tests
		 * @returns {sap.ui.core.util.MockServer} the mockserver instance
		 */
		getMockServer: function() {
			return this._oMockServer;
		}
	};

});