/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/core/routing/History",
	"my/sapui5_hybrid_app/model/service/RouteService"
], function(BaseController, formatter, History, RouteService) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Equipment", {

		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("Equipment").attachPatternMatched(this._onObjectMatched, this);
		},

		onAddAttachment: function(oEvent) {
			var that = this;
			var fileSelector = document.createElement('input');
			fileSelector.setAttribute('type', 'file');
			fileSelector.setAttribute('accept', 'image/*');
			fileSelector.onchange = function(data) {
				that._addAttachment(fileSelector.files[0]);
			}
			fileSelector.click();
		},

		onAddPhoto: function(oEvent) {
			var that = this;
			this.getComponentCaptureMediaService().captureSingleImage()
				.then(function(aMediaFiles) {
					var i, path, len;
					for (i = 0, len = aMediaFiles.length; i < len; i += 1) {
						aMediaFiles[i].isCamerShot = true;
						that._addAttachment(aMediaFiles[i]);
					}
				});
		},

		_addAttachment: function(file) {
			var that = this;
			var objectPath = that.getView().getElementBinding().getPath();
			var objectNumber = that.getComponentModel().getProperty(objectPath).Equipment;

			that.getView().byId("AttachmentListId").setBusy(true);

			that.getComponentAttachmentService().addAttachment({
					BusinessObject: "EQP" + objectNumber,
					Equipment: objectNumber,
					EquipmentDetails: {
						__metadata: {
							uri: objectPath.substring(1)
						}
					}
				},
				file
			).then(function(attachment_result) {

				sap.m.MessageBox.confirm("Set image as default equipment picture?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that.getComponentModel().setProperty(objectPath + "/Equipment", attachment_result.Attachment);
							that.getComponentModel().submitChanges();
						}
					}
				});

				that.getView().byId("AttachmentListId").setBusy(false);
			}).catch(function(oException) {
				that.getView().byId("AttachmentListId").setBusy(false);
				if (oException instanceof my.sapui5_hybrid_app.utils.MyException) {
					oException.alert();
				} else {
					alert(oException);
				}
			});
		},

		onAttachmentDelete: function(oEvent) {
			var attachmentPath = oEvent.getParameter("listItem").getBindingContext().getPath();
			var attachment = this.getComponentModel().getProperty(attachmentPath);
			var that = this;
			that.getView().byId("AttachmentListId").setBusy(true);
			that.getComponentAttachmentService().removeAttachment(attachment, attachmentPath).then(function() {
				that.getView().byId("AttachmentListId").setBusy(false);
			}).catch(function(error) {
				that.getView().byId("AttachmentListId").setBusy(false);
				alert("Failed to delete on Google Drive: " + error);
			});
		},

		onAttachmentViewImage: function(oEvent) {
			var oSelListItem = oEvent.getSource();
			var attachmentPath = oSelListItem.getBindingContext().getPath();
			var attachment = this.getComponentModel().getProperty(attachmentPath);
			var that = this;

			that.getView().byId("AttachmentListId").setBusy(true);
			that.getComponentAttachmentService().getAttachmentSrc(attachment).then(function(imageSrc) {
				var oDialog = new sap.m.Dialog({
					content: new sap.m.Image({
						src: imageSrc,
						width: "100%"
					}),
					beginButton: new sap.m.Button({
						text: 'Close',
						press: function() {
							oDialog.close();
							that.getView().byId("AttachmentListId").setBusy(false);
						}
					}),
					afterClose: function() {
						oDialog.destroy();
					}
				});
				oDialog.open();
			}).catch(function(error) {
				that.getView().byId("AttachmentListId").setBusy(false);
				alert("View Attachment Failed: " + error);
			});
		},
		
		onStatusInService: function(oEvent) {
			var that = this;
			var sObjectPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().setProperty(sObjectPath + "/Image", "In Service");
			that.getComponentModel().submitChangesExt();
		},
		
		onStatusNotWorking: function(oEvent) {
			var that = this;
			var sObjectPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().setProperty(sObjectPath + "/Image", "Not Working");
			that.getComponentModel().submitChangesExt();
		},

		onEquipmentSave: function(oEvent) {
			var that = this;
			that.getComponentModel().submitChangesExt();
		},

		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				oCrossAppNavigator.toExternal({
					target: {
						shellHash: "#Shell-home"
					}
				});
			}
		},

		_onObjectMatched: function(oEvent) {
			var objectPath = oEvent.getParameter("arguments").objectPath;
			var that = this;
			if (objectPath && objectPath !== "") {
				that.getModel().metadataLoaded()
					.then(function() {
						that._bindView("/" + objectPath); // Mobile Version
					})
					.catch(function() {
						// Metadata Not loaded :[o]
					});
			}
		},

		_bindView: function(sObjectPath) {
			debugger;
			this.getView().bindElement({
				path: sObjectPath
			});

		}

	});

});