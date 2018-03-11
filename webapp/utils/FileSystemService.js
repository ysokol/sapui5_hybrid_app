sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.FileSystemService", {
		constructor: function() {

		},

		getDirectoryByLocalFileSystemUrl: function(localFileSystemUrl) {
			return new Promise(function(resolve, reject) {
				window.resolveLocalFileSystemURL(localFileSystemUrl, function(dirEntry) {
					resolve(dirEntry);
				}, function(error) {
					reject(error);
				});
			});
		},

		getFileEntryByFile: function(file) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.openFile("file:///storage/emulated/0/Pictures/", file.name).then(function(fileEntry) {
					resolve(fileEntry);
				}).catch(function(oException) {
					reject(new MyException("FileSystemService", "Failed openFile()", oException));
				});
			});
		},

		readFileAsBlob: function(fileEntry) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.readFileAsArrayBuffer(fileEntry).then(function(arrayBuffer) {
					var blob = new Blob([arrayBuffer], {
						type: 'application/octet-stream'
					});
					resolve(blob);
				}).catch(function(error) {
					reject("Failed readFileAsArrayBuffer, caused by: " + error);
				});
			});
		},

		readFileAsDataUrl: function(fileEntry) {
			return new Promise(function(resolve, reject) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function() {
						resolve(reader.result);
					};
					reader.readAsDataURL(file);
				}, function(error) {
					reject(error);
				});
			});
		},

		readFileAsArrayBuffer: function(fileEntry) {
			return new Promise(function(resolve, reject) {
				fileEntry.file(function(file) {
					var reader = new FileReader();
					reader.onloadend = function() {
						resolve(reader.result);
					};
					reader.readAsArrayBuffer(file);
				}, function(error) {
					reject(error);
				});
			});
		},

		createFile: function(dirEntry, fileName) {
			return new Promise(function(resolve, reject) {
				dirEntry.getFile(fileName, {
					create: true,
					exclusive: false
				}, function(fileEntry) {
					resolve(fileEntry);
				}, function(error) {
					reject(error);
				});
			});
		},

		writeFile2: function(fileEntry, dataObj) {
			return new Promise(function(resolve, reject) {
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function() {
						resolve();
					};
					fileWriter.onerror = function(error) {
						reject(error);
					};
					fileWriter.write(dataObj);
				});
			});
		},

		openFile: function(externalApplicationStorageDirectory, fileName) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.getDirectoryByLocalFileSystemUrl(externalApplicationStorageDirectory).then(function(dirEntry) {
					dirEntry.getFile(fileName, {
						create: false,
						exclusive: false
					}, function(fileEntry) {
						resolve(fileEntry);
					}, function(error) {
						reject(error);
					});
				}).catch(function(error) {
					reject("Failed getDirectoryByLocalFileSystemUrl, caused by: " + error);
				});
			});
		},

		remvoveFile: function(fileEntry) {
			return new Promise(function(resolve, reject) {
				fileEntry.remove(function() {
					resolve();
				}, function(error) {
					reject(error);
				});
			});
		}

	});
});