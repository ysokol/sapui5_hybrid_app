sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.CaptureMediaService", {
		constructor: function() {
		},
		captureSingleImage: function() {
			// start image capture
			return new Promise(function(resolve, reject) {
				navigator.device.capture.captureImage(
					function(aMediaFiles) {
						resolve(aMediaFiles);
					},
					function(oError) {
						reject(new MyException("CaptureMediaService", "Failed navigator.device.capture.captureImage()", oError));
					}, {
						limit: 1
					});
			});
		}

	});
});