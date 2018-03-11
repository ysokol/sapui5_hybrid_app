sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.GoogleDriveStorageService", {

		_apiKey: 'AIzaSyD0r-4o-SYW6VFRZKi5H_o1jdRxs5JZafU',
		_clientId: '655021029955-rhoaknhgtf6vhs7mllqa1a4ghpmo3ndp.apps.googleusercontent.com',
		_scope: 'https://www.googleapis.com/auth/drive',
		_parentId: '1vxuDR9UWaY9tIyyaQ0hfLP259v-NtP5f',
		_isLoggedIn: false,

		constructor: function() {

		},

		init: function() {
			
		},

		clientInitAndLogin: function() {
			var that = this;
			return new Promise(function(resolve, reject) {
				if (that._isLoggedIn) {
					resolve();
				} else {
					debugger;
					gapi.client.init({
							'apiKey': that._apiLey,
							'clientId': that._clientId,
							'scope': that._scope,
							'offline': true, 
            				'cookiepolicy': 'none'
						})
						.then(gapi.auth2.getAuthInstance().signIn())
						.then(function() {
							that._isLoggedIn = true;
							resolve();
						})
						.catch(function(oException) {
							reject(new MyException("GoogleDriveStorageServiceException", "Failed clientInitAndLogin()", oException));
						});
				}
			});
		},

		publishFile: function(attachment, dataUrl) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.clientInitAndLogin().then(function() {
					var parentId = '1vxuDR9UWaY9tIyyaQ0hfLP259v-NtP5f'; //some parentId of a folder under which to create the new folder
					var fileMetadata = {
						'name': attachment.BusinessObject + '_' + attachment.Description,
						'mimeType': attachment.ContentType,
						'parents': [that._parentId]
					};

					var data = dataUrl.split(",").pop();

					var boundary = '-------314159265358979323846';
					var delimiter = "\r\n--" + boundary + "\r\n";
					var close_delim = "\r\n--" + boundary + "--";

					var multipartRequestBody = delimiter +
						'Content-Type: application/json\r\n\r\n' +
						JSON.stringify(fileMetadata) +
						delimiter +
						'Content-Type: ' + attachment.ContentType + '\r\n' +
						'Content-Transfer-Encoding: base64\r\n' +
						'\r\n' +
						data +
						close_delim;

					gapi.client.request({
						'path': '/upload/drive/v3/files',
						'method': 'POST',
						'params': {
							'uploadType': 'multipart'
						},
						'headers': {
							'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
						},
						'body': multipartRequestBody
					}).then(function(response) {
						resolve(response.result.id);
					}).catch(function(oException) {
						reject(new MyException("GoogleDriveStorageServiceException", "failed gapi.client.request()", oException));
					});
				}).catch(function(oException) {
					reject(oException);
				});
			});
		},

		removeFile: function(fileId) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.clientInitAndLogin().then(function() {
					gapi.client.request({
						'path': 'https://www.googleapis.com/drive/v2/files/' + fileId,
						'method': 'DELETE'
					}).then(function(response) {
						resolve();
					}).catch(function(oException) {
						reject(new MyException("GoogleDriveStorageServiceException", "failed gapi.client.request()", oException));
					});
				});
			});
		},

		getFileSrc: function(fileId) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.clientInitAndLogin().then(function() {
					gapi.client.request({
						'path': 'https://www.googleapis.com/drive/v3/files/' + fileId + "?alt=media",
						'method': 'GET'
					}).then(function(response) {
						var imgSrc = "data:" + response.headers["Content-Type"] + ";base64," + btoa(response.body);
						resolve(imgSrc);
					}).catch(function(oException) {
						reject(new MyException("GoogleDriveStorageServiceException", "failed gapi.client.request()", oException));
					});
				}).catch(function(oException) {
					reject(oException);
				});
			});
		}

	});
});