sap.ui.define([
		"my/sapui5_hybrid_app/utils/utils"
	],
	function(Utils) {
		"use strict";

		return {

			_apiKey: 'AIzaSyD0r-4o-SYW6VFRZKi5H_o1jdRxs5JZafU',
			_clientId: '655021029955-ievv37ledj5u2ne8f2ovb5oo4mqtarpa.apps.googleusercontent.com',
			_scope: 'https://www.googleapis.com/auth/drive',
			_storageProvider: 'GOOGLE_DRIVE',
			_parentId: '1vxuDR9UWaY9tIyyaQ0hfLP259v-NtP5f',
			_uiComponent: null,
			_isLoggedIn: false,
			_utils: Utils,

			isMobileDevice: function() {
				return this._uiComponent.getModel("mobileDevice").getProperty("/isMobileDevice");
			},

			init: function(uiComponent) {
				this._uiComponent = uiComponent;
				//if (!this.isMobileDevice()) {
					window.addEventListener('load', function() {
						var script = document.createElement('script');
						script.type = 'text/javascript';
						script.src = 'https://apis.google.com/js/api.js?onload=googleAapiLoaded';
						document.body.appendChild(script);
					});
				//}
			},

			getNextAttachmentId: function(attachmentId) {
				var that = this;
				return new Promise(function(resolve, reject) {
					that._uiComponent.getModel().read("/Attachments?$top=1&$orderby=Attachment desc", {
						success: function(oData) {
							var maxAttachmentId = "0000000000";
							if (that.isMobileDevice()) {
								var maxAttachmentId = "TMP1";
							}
							for (let attachment of oData.results) {
								if (attachment.Attachment && attachment.Attachment > maxAttachmentId) {
									maxAttachmentId = attachment.Attachment;
								}
							}

							var nextAttachmentId;
							if (that.isMobileDevice()) {
								nextAttachmentId = maxAttachmentId.replace(/(\d+)+/g, function(match, number) {
									return parseInt(number) + 1;
								});
							} else {
								nextAttachmentId = that._utils.stringPad(parseInt(maxAttachmentId) + 1, 10);
							}

							resolve(nextAttachmentId);
						}
					});
				});
			},

			clientInitAndLogin: function() {
				var that = this;
				return new Promise(function(resolve, reject) {
					if (that._isLoggedIn) {
						resolve();
					} else {
						gapi.client.init({
							'apiKey': that._apiLey,
							'clientId': that._clientId,
							'scope': that._scope
						}).then(function() {
							gapi.auth2.getAuthInstance().signIn().then(function() {
								that._isLoggedIn = true;
								resolve();
							}).catch(function() {
								reject();
							});
						}).catch(function(oError) {
							reject();
						});
					}
				});
			},

			writeFile: function(fileEntry, dataObj, isAppend) {
				// Create a FileWriter object for our FileEntry (log.txt).
				fileEntry.createWriter(function(fileWriter) {
					fileWriter.onwriteend = function() {
						debugger;
						console.log("Successful file write...");
					};
					fileWriter.onerror = function(e) {
						debugger;
						console.log("Failed file write: " + e.toString());
					};
					fileWriter.write(dataObj);
				});
			},

			saveFile: function(dirEntry, fileData, fileName) {
				var that = this;
				dirEntry.getFile(fileName, {
					create: true,
					exclusive: false
				}, function(fileEntry) {
					debugger;
					that.writeFile(fileEntry, fileData);
				}, function(error) {
					debugger;
				});
			},

			readFileAsBlob: function(file) {
				var that = this;
				return new Promise(function(resolve, reject) {
					that.openFile("file:///storage/emulated/0/Pictures/", file.name).then(function(fileEntry){
						that.readFileAsArrayBuffer(fileEntry).then(function(arrayBuffer) {
							var blob = new Blob([arrayBuffer], {
								type: file.type || 'application/octet-stream'
							});
							resolve(blob);
						}).catch(function(error) {
							alert("Failed readFileAsArrayBuffer: " + error);
							reject(error);
						});
					}).catch(function(error) {
						alert("Failed readFileAsBlob: " + error);
						reject(error);
					});
				});

				/*return new Promise(function(resolve, reject) {
					var reader = new FileReader();
					debugger;
					reader.onloadend = function() {
						debugger;
						var blob = new Blob([reader.result], {
							type: file.type || 'application/octet-stream'
						});
						resolve(blob);
					}
					reader.readAsArrayBuffer(file);
				});*/
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
							resolve()
						};
						fileWriter.onerror = function(error) {
							reject(error)
						};
						fileWriter.write(dataObj);
					});
				});
			},

			readFileAsDataUrl: function(fileEntry) {
				return new Promise(function(resolve, reject) {
					fileEntry.file(function(file) {
						var reader = new FileReader();
						reader.onloadend = function() {
							var dataUrl = reader.result;
							resolve(dataUrl);
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
							var arrayBuffer = reader.result;
							resolve(arrayBuffer);
						};
						reader.readAsArrayBuffer(file);
					}, function(error) {
						reject(error);
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
						alert("Failed getDirectoryByLocalFileSystemUrl: " + error);
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
			},

			addAttachment: function(file, attachment) {
				var that = this;
				return new Promise(function(resolve, reject) {
					if (!file) {
						reject("file not provided");
						return;
					}
					debugger;
					if (that.isMobileDevice()) {
						attachment.ContentType = file.type || 'application/octet-stream';
						attachment.Description = file.name;
						attachment.LocalStoragePath = attachment.BusinessObject + "_" + file.name;
						attachment.StorageProvider = "";
						that.readFileAsBlob(file).then(function(blob) {
							that.getDirectoryByLocalFileSystemUrl(cordova.file.externalApplicationStorageDirectory).then(function(dirEntry) {
								that.createFile(dirEntry, attachment.LocalStoragePath).then(function(fileEntry) {
									that.writeFile2(fileEntry, blob).then(function() {
										that.getNextAttachmentId().then(function(nextAttachmentId) {
											attachment.Attachment = nextAttachmentId;
											resolve(attachment);
											//fileEntry.nativeURL file:///storage/emulated/0/Android/data/my.orders.hybrid/IMG_20180131_213001.jpg
											//fileEntry.fullPath /Android/data/my.orders.hybrid/IMG_20180131_213001.jpg
										}).catch(function(error) {
											alert("getNextAttachmentId: " + error);
										});
									}).catch(function(error) {
										alert("Failed writeFile: " + error);
									});
								}).catch(function(error) {
									alert("Failed createFile: " + error);
								});
							}).catch(function(error) {
								alert("Failed getDirectoryByLocalFileSystemUrl: " + error);
							});
						}).catch(function(error) {
							alert("Failed readFileAsBlob: " + error);
						});

						return;
					}

					var reader = new FileReader();
					reader.onloadend = function() {
						var data = reader.result.split(",").pop();

						that.clientInitAndLogin().then(function() {
							attachment.ContentType = file.type || 'application/octet-stream';
							attachment.Description = file.name;
							attachment.StorageProvider = that._storageProvider;

							var parentId = '1vxuDR9UWaY9tIyyaQ0hfLP259v-NtP5f'; //some parentId of a folder under which to create the new folder
							var fileMetadata = {
								'name': attachment.BusinessObject + "_" + file.name,
								'mimeType': attachment.ContentType,
								'parents': [that._parentId]
							};

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
								console.log(response);
								attachment.StorageId = response.result.id;
								that.getNextAttachmentId().then(function(nextAttachmentId) {
									attachment.Attachment = nextAttachmentId;
									resolve(attachment);
								});
							}).catch(function() {
								reject();
							});
						}).catch(function() {
							reject();
						});
					}
					reader.readAsDataURL(new Blob([file]));
				});
			},

			getImageSrc: function(attachment) {
				var that = this;
				if (that.isMobileDevice()) {
					return new Promise(function(resolve, reject) {
						that.openFile(cordova.file.externalApplicationStorageDirectory, attachment.LocalStoragePath).then(function(fileEntry) {
							that.readFileAsDataUrl(fileEntry).then(function(dataUrl) {
								//var imgSrc = "data:" + attachment.ContentType + ";base64," + dataUrl;
								resolve(dataUrl);
							}).catch(function(error) {
								alert("Failed readFileAsDataUrl: " + error);
							});
						}).catch(function(error) {
							alert("Failed openFile: " + error);
						});
					});
				}

				return new Promise(function(resolve, reject) {
					that.clientInitAndLogin().then(function() {
						gapi.client.request({
							'path': 'https://www.googleapis.com/drive/v3/files/' + attachment.StorageId + "?alt=media",
							'method': 'GET'
						}).then(function(response) {
							debugger;
							var imgSrc = "data:" + attachment.ContentType + ";base64," + btoa(response.body);
							resolve(imgSrc);
						});
					});
				});
			},

			removeAttachment: function(attachment) {
				var that = this;
				if (that.isMobileDevice()) {
					return new Promise(function(resolve, reject) {
						that.openFile(cordova.file.externalApplicationStorageDirectory, attachment.LocalStoragePath).then(function(fileEntry) {
							that.remvoveFile(fileEntry).then(function() {
								resolve();
							}).catch(function(error) {
								alert("Failed remvoveFile: " + error);
								reject(error);
							});
						}).catch(function(error) {
							alert("Failed openFile: " + error);
							reject(error);
						});
					});
				}
				return new Promise(function(resolve, reject) {
					that.clientInitAndLogin().then(function() {
						gapi.client.request({
							'path': 'https://www.googleapis.com/drive/v2/files/' + attachment.StorageId,
							'method': 'DELETE'
						}).then(function(response) {
							resolve();
						}).catch(function(error) {
							reject(error);
						});
					});
				});
			}

		};
	});

function googleAapiLoaded() {
	gapi.load('client:auth2', googleApiLoaded2);
}

function googleApiLoaded2() {
	gapi.client.load('drive', 'v3');
}