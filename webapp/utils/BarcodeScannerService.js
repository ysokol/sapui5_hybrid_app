sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.BarcodeScannerService", {

		constructor: function() {
			this._mOptions = {
				preferFrontCamera: false, // iOS and Android
				showFlipCameraButton: true, // iOS and Android
				showTorchButton: true, // iOS and Android
				torchOn: false, // Android, launch with the torch switched on (if available)
				prompt: "Place a barcode inside the scan area", // Android
				resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
				//formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
				orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
				disableAnimations: true // iOS
			};
		},

		scanBarcode: function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				cordova.plugins.barcodeScanner.scan(
					function(oResult) {
						resolve(oResult.text);
					},
					function(oException) {
						reject(new MyException("BarcodeScannerService", "Failed scanBarcode()", oException));
					},
					that._mOptions
				);
			});
		}

	});
});