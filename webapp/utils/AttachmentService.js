sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/utils",
	"my/sapui5_hybrid_app/utils/FileSystemService",
	"my/sapui5_hybrid_app/utils/WebFileSystemService",
	"my/sapui5_hybrid_app/utils/GoogleDriveStorageService",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, Utils, FileSystemService, WebFileSystemService, GoogleDriveStorageService, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.AttachmentService", {

		_uiComponent: null,
		_oDataModel: null,
		_utils: null,
		_googleDriveStorageService: null,
		_webFileSystemService: null,

		constructor: function(uiComponent, oDataModel) {
			this._uiComponent = uiComponent;
			this._oDataModel = oDataModel;
			this._utils = Utils;
			this._googleDriveStorageService = new GoogleDriveStorageService();
			this._googleDriveStorageService.init();
			this._webFileSystemService = new WebFileSystemService();
			this._oFileSystemService = new FileSystemService();
		},

		addAttachment: function(attachment, file) {
			var that = this;
			return new Promise(function(resolve, reject) {
				// setting attachment attributes:
				attachment.ContentType = file.type;
				if (!attachment.Description) {
					attachment.Description = file.name;
				}

				// creating attachment:
				if (that._isMobileDevice()) {
					attachment.LocalStoragePath = attachment.BusinessObject + "_" + file.name;
					attachment.StorageProvider = "";
					if (file.isCamerShot) {
						Promise.all([
								that._oFileSystemService.openFile("file:///storage/emulated/0/Pictures/", file.name)
								.then(fileEntry => that._oFileSystemService.readFileAsBlob(fileEntry)),
								that._oFileSystemService.getDirectoryByLocalFileSystemUrl(cordova.file.externalApplicationStorageDirectory)
								.then(dirEntry => that._oFileSystemService.createFile(dirEntry, attachment.LocalStoragePath)),
								that._getNextAttachmentId()
							])
							.then(results => {
								var blob = results[0];
								var createdFileEntry = results[1];
								var nextAttachmentId = results[2];

								that._oFileSystemService.writeFile2(createdFileEntry, blob);
								attachment.Attachment = nextAttachmentId;
								that._oDataModel.create("/Attachments", attachment);

								resolve(attachment);
							})
							.catch(function(oException) {
								reject(new MyException("AttachmentServiceException", "Failed addAttachment()", oException));
							});
					} else {
						Promise.all([
								that._webFileSystemService.readFileAsBlob(file),
								that._oFileSystemService.getDirectoryByLocalFileSystemUrl(cordova.file.externalApplicationStorageDirectory)
								.then(dirEntry => that._oFileSystemService.createFile(dirEntry, attachment.LocalStoragePath)),
								that._getNextAttachmentId()
							])
							.then(results => {
								var blob = results[0];
								var createdFileEntry = results[1];
								var nextAttachmentId = results[2];

								that._oFileSystemService.writeFile2(createdFileEntry, blob);
								attachment.Attachment = nextAttachmentId;
								that._oDataModel.create("/Attachments", attachment);

								resolve(attachment);
							})
							.catch(function(oException) {
								reject(new MyException("AttachmentServiceException", "Failed addAttachment()", oException));
							});
					}
				} else {
					attachment.StorageProvider = "GOOGLE_DRIVE";
					Promise.all([
							that._webFileSystemService.readFileAsDataUrl(file)
							.then(dataUrl => that._googleDriveStorageService.publishFile(attachment, dataUrl)),
							that._getNextAttachmentId()
						]).then(results => {
							attachment.StorageId = results[0]; // googleDriveFileId
							attachment.Attachment = results[1]; // nextAttachmentId
							that._oDataModel.create("/Attachments", attachment);
							resolve(attachment);
						})
						.catch(function(oException) {
							reject(new MyException("AttachmentServiceException", "Failed addAttachment()", oException));
						});
				}
			});
		},

		removeAttachment: function(attachment, attachmentPath) {
			var that = this;
			if (that._isMobileDevice()) {
				return Promise.all([
					that._oDataModel.remove(attachmentPath),
					that._oFileSystemService.openFile(cordova.file.externalApplicationStorageDirectory, attachment.LocalStoragePath)
					.then(fileEntry => that._oFileSystemService.remvoveFile(fileEntry))
				]);
			} else {
				return Promise.all([
					that._oDataModel.remove(attachmentPath),
					that._googleDriveStorageService.removeFile(attachment.StorageId)
				]);
			}
		},

		pushToCloudStorage: function(attachment) {

		},

		pullFromCloudStorage: function(attachment) {

		},

		getAttachmentSrc: function(attachment) {
			var that = this;
			if (that._isMobileDevice()) {
				return that._oFileSystemService.openFile(cordova.file.externalApplicationStorageDirectory, attachment.LocalStoragePath)
					.then(fileEntry => that._oFileSystemService.readFileAsDataUrl(fileEntry));
			} else {
				return this._googleDriveStorageService.getFileSrc(attachment.StorageId);
			}
		},

		_isMobileDevice: function() {
			return this._uiComponent.getModel("mobileDevice").getProperty("/isMobileDevice");
		},

		_getNextAttachmentId: function(attachmentId) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that._oDataModel.readExt("/Attachments", {
					"$top": "1",
					"$orderby": "Attachment desc"
				})
				.then(function(oData) {
					var maxAttachmentId = "0000000000";
					if (that._isMobileDevice()) {
						var maxAttachmentId = "TMP1";
					}
					if (oData.results.length > 1) {
						reject(new MyException("AttachmentServiceException", "Failed _getNextAttachmentId()", "oData.results.length > 1"))
					} 
					if (oData.results[0]) {
						maxAttachmentId = oData.results[0].Attachment;
					}

					var nextAttachmentId;
					if (that._isMobileDevice()) {
						nextAttachmentId = maxAttachmentId.replace(/(\d+)+/g, function(match, number) {
							return parseInt(number) + 1;
						});
					} else {
						nextAttachmentId = that._utils.stringPad(parseInt(maxAttachmentId) + 1, 10);
					}

					resolve(nextAttachmentId);
				})
				.catch(oException => reject(new MyException("AttachmentServiceException", "Failed _getNextAttachmentId()", oException)));
			});
		}

	});
});