function onFileInput() {
	alert("Hola");
}

sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"my/sapui5_hybrid_app/utils/AttachmentService",
	"my/sapui5_hybrid_app/utils/MyException"
], function(BaseController, formatter, AttachmentService, MyException) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.SalesOrder", {

		formatter: formatter,
		_attachmentService: null,
		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			this.getRouter().getRoute("salesOrder").attachPatternMatched(this._onObjectMatched, this);
			//this._attachmentService = new AttachmentService(this.getOwnerComponent(), this.getComponentModel());
		},
		
		onScanBarcode: function() {
			this.getComponenetBarcodeScannerService().scanBarcode().then(sText => alert(sText));
		},
		
		onSendNotification: function() {
			var that = this;
			var currentSalesOrderPath = this.getView().getElementBinding().getPath();
			var salesOrderNum = this.getComponentModel().getProperty(currentSalesOrderPath).SalesOrder;

			this.getComponentPushNotificationService().sendNotificationAll("Check update for Order #" + salesOrderNum, "navto: " +
					currentSalesOrderPath)
				.then(oData => sap.m.MessageToast.show("Notification sent!", {
					duration: 3000
				}));
		},

		onAddAttachment: function(oEvent) {
			var that = this;
			var fileSelector = document.createElement('input');
			fileSelector.setAttribute('type', 'file');
			fileSelector.setAttribute('accept', 'image/*');
			fileSelector.onchange = function(data) {
				that.addAttachment(fileSelector.files[0]);
			}
			fileSelector.click();
		},

		onAddPhoto: function(oEvent) {
			// capture callback
			var that = this;
			var captureSuccess = function(mediaFiles) {
				var i, path, len;
				for (i = 0, len = mediaFiles.length; i < len; i += 1) {
					path = mediaFiles[i].fullPath;
					mediaFiles[i].isCamerShot = true;
					that.addAttachment(mediaFiles[i]);
				}
			};

			// capture error callback
			var captureError = function(error) {
				navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
			};

			// start image capture
			navigator.device.capture.captureImage(captureSuccess, captureError, {
				limit: 1
			});
		},

		addAttachment: function(file) {
			var that = this;
			var currentSalesOrderPath = this.getView().getElementBinding().getPath();
			var salesOrderNum = this.getComponentModel().getProperty(currentSalesOrderPath).SalesOrder;

			that.getView().byId("AttachmentListId").setBusy(true);

			that.getComponentAttachmentService().addAttachment({
					BusinessObject: "SOH" + salesOrderNum,
					SalesOrder: salesOrderNum,
					SalesOrderDetails: {
						__metadata: {
							uri: currentSalesOrderPath.substring(1)
						}
					}
				},
				file
			).then(function(attachment_result) {
				that.getView().byId("AttachmentListId").setBusy(false);
			}).catch(function(oException) {
				that.getView().byId("AttachmentListId").setBusy(false);
				if (oException instanceof my.sapui5_hybrid_app.utils.MyException) {
					oException.alert();
				} else {
					alert(oException);
				}
			});

			/*this.getComponentAttachmentService().addAttachment(file, {
				BusinessObject: "SOH" + salesOrderNum,
				SalesOrder: salesOrderNum,
				SalesOrderDetails: {
					__metadata: {
						uri: currentSalesOrderPath.substring(1)
					}
				}
			}).then(function(attachment_result) {
				that.getComponentModel().create("/Attachments", attachment_result);
				that.getView().byId("AttachmentListId").setBusy(false);
			}).catch(function(error) {
				that.getView().byId("AttachmentListId").setBusy(false);
				alert("Failed to create file: " + error);
			});*/
		},

		onFileUploaderSet: function(oEvent) {
			debugger;
			var file = oEvent.getParameter("files")[0];
			if (!file) {
				alert("Choose a file first");
				return;
			}
			this.addAttachment(file);
		},

		onAttachmentDelete: function(oEVent) {
			var attachmentPath = oEVent.getSource().getParent().getBindingContext().getPath();
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

		onAttachmentViewImage: function(event) {
			var attachmentPath = event.getSource().getParent().getBindingContext().getPath();
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

		onSalesOrderItemAdd: function(oEvent) {
			//this.getComponentModel().	
			debugger;

			var currentSalesOrderPath = this.getView().getElementBinding().getPath();
			var salesOrderNum = this.getComponentModel().getProperty(currentSalesOrderPath).SalesOrder;
			var maxItem = "0000";
			var that = this;
			this.getComponentModel().read(currentSalesOrderPath + "/SalesOrderItemDetails", {
				success: function(oData) {
					for (let item of oData.results) {
						if (!isNaN(parseInt(item.SalesOrderItem)) && item.SalesOrderItem > maxItem) {
							maxItem = item.SalesOrderItem;
						}
					}
					that.getComponentModel().create(currentSalesOrderPath + "/SalesOrderItemDetails", {
						SalesOrder: salesOrderNum,
						SalesOrderItem: that._utils.stringPad(parseInt(maxItem) + 10, 4),
						SalesOrderDetails: {
							__metadata: {
								uri: currentSalesOrderPath.substring(1)
							}
						}
					});
				}
			});
		},

		onSalesOrderItemDelete: function(oEvent) {
			this.getComponentModel().remove(oEvent.getSource().getParent().getBindingContext().getPath());
		},

		onSalesOrderItemDetail: function(oEvent) {
			if (!this._oSalesOrderItemDialog) {
				this._oSalesOrderItemDialog = new sap.ui.xmlfragment("my.sapui5_hybrid_app.view.SalesOrderItem", this);
			}
			this._oSalesOrderItemDialog.bindObject(oEvent.getSource().getBindingContext().getPath());
			this._oSalesOrderItemDialog.open();
		},

		onSalesOrderItemConfirm: function(oEvent) {
			this._oSalesOrderItemDialog.close();
			this.getComponentModel().submitChanges();
		},

		onSalesOrderSave: function(oEvent) {
			this.getComponentModel().submitChanges();
		},

		onSalesOrderDelete: function(oEvent) {
			this.getComponentModel().remove(this.getView().getElementBinding().getPath());
		},

		_onObjectMatched: function(oEvent) {
			var objectPath = oEvent.getParameter("arguments").objectPath;
			var that = this;
			if (objectPath && objectPath !== "") {
				that.getModel().metadataLoaded()
					.then(function() {
						that._bindView("/" + objectPath); // Mobile Version
					} /*.bind(this)*/ )
					.catch(function() {
						// Metadata Not loaded :[o]
					});
			}
		},

		_bindView: function(sObjectPath) {

			this.getView().bindElement({
				path: sObjectPath, // + "?$expand=SalesOrderItemDetails", // / - requried for web, for mobile not required
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						//oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						//oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			/*var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.SalesOrder,
				sObjectName = oObject.SalesOrder,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));*/
		}

	});

});