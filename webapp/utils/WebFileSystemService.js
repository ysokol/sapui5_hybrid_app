sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.WebFileSystemService", {
		constructor: function() {

		},

		readFileAsDataUrl: function(file) {
			return new Promise(function(resolve, reject) {
				var reader = new FileReader();
				reader.onloadend = function(event) {
					var error = event.target.error;
					if (error != null) {
						switch (error.code) {
							case error.ENCODING_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: Encoding error!");
								break;
							case error.NOT_FOUND_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: File not found!");
								break;
							case error.NOT_READABLE_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: File could not be read!");
								break;
							case error.SECURITY_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: Security issue with file!");
								break;
							default:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: I have no idea what's wrong!");
						}
					} else {
						resolve(event.target.result);
					}

				};
				reader.readAsDataURL(file);
			});
		},
		
		readFileAsBlob: function(file) {
			return new Promise(function(resolve, reject) {
				var reader = new FileReader();
				reader.onloadend = function(event) {
					var error = event.target.error;
					if (error != null) {
						switch (error.code) {
							case error.ENCODING_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: Encoding error!");
								break;
							case error.NOT_FOUND_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: File not found!");
								break;
							case error.NOT_READABLE_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: File could not be read!");
								break;
							case error.SECURITY_ERR:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: Security issue with file!");
								break;
							default:
								reject("Failed WebFileSystemService.readFileAsDataUrl, caused by: I have no idea what's wrong!");
						}
					} else {
						var blob = new Blob([event.target.result], {
							type: file.type || 'application/octet-stream'
						});
						resolve(blob);
					}

				};
				reader.readAsArrayBuffer(file);
			});
		}
	});
});