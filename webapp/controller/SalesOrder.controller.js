function onFileInput() {
	alert("Hola");
}

sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"my/sapui5_hybrid_app/utils/MyException",
	"my/sapui5_hybrid_app/model/service/SalesOrderService",
	'sap/ui/model/json/JSONModel'
], function(BaseController, formatter, MyException, SalesOrderService, JSONModel) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.SalesOrder", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {

			this.getRouter().getRoute("SalesOrder").attachPatternMatched(this._onObjectMatched, this);
			this._oProcessFlowModel = new JSONModel();
			this.getView().setModel(this._oProcessFlowModel, "processFlow");

			this._oSalesOrderService = new SalesOrderService(this.getComponentModel(), this._oProcessFlowModel);
		},

		onRecalSalesOrderItem: function(oEvent) {
			var sSalesOrderItemPath = oEvent.getSource().getParent().getBindingContext().getPath();
			this._oSalesOrderService.recalcSalesOrderItem(sSalesOrderItemPath);
		},

		onSalesOrderItemAdd: function(oEvent) {
			var that = this;
			var sSalesOrderPath = oEvent.getSource().getParent().getBindingContext().getPath();
			var sSalesOrderNum = this.getComponentModel().getProperty(sSalesOrderPath).SalesOrder;

			that.getNumberRangeService().getNextNumber({
					sEntity: sSalesOrderPath.substring(1) + "/SalesOrderItemDetails",
					sProperty: "SalesOrderItem",
					sInitialValue: "0000",
					iStep: 10
				})
				.then((sNextNumber) =>
					that.getComponentModel().createExt(sSalesOrderPath + "/SalesOrderItemDetails", {
						SalesOrder: sSalesOrderNum,
						SalesOrderItem: sNextNumber,
						SalesOrderDetails: {
							__metadata: {
								uri: sSalesOrderPath.substring(1)
							}
						}
					})
				);
		},

		onSalesOrderItemDelete: function(oEvent) {
			var that = this;
			var currentSalesOrderPath = that.getView().getElementBinding().getPath()
			that.getComponentModel().removeExt(oEvent.getParameter("listItem").getBindingContext().getPath())
				/*.then(() => that.getComponentModel().readExt(currentSalesOrderPath, {
					"$expand": "SalesOrderItemDetails"
				}))*/
				.then(() => that._oSalesOrderService.recalcSalesOrder(currentSalesOrderPath))
				.then(() => that.getComponentModel().submitChanges());
		},

		onSalesOrderItemDetail: function(oEvent) {
			if (!this._oSalesOrderItemDialog) {
				this._oSalesOrderItemDialog = new sap.ui.xmlfragment("my.sapui5_hybrid_app.view.SalesOrderItem", this);
			}
			this._oSalesOrderItemDialog.bindObject(oEvent.getSource().getBindingContext().getPath());
			this._oSalesOrderItemDialog.open();
		},

		onMaterialSelected: function(oEvent) {
			var that = this;
			var sSalesOrderItemPath = oEvent.getSource().getParent().getBindingContext().getPath();

			that.getComponentModel().readExt(oEvent.getParameter("selectedItem").getBindingContext().getPath())
				.then(oData => that.getComponentModel().setProperty(sSalesOrderItemPath + "/Price", oData.Price));
		},

		onSalesOrderItemConfirm: function(oEvent) {
			this._oSalesOrderItemDialog.close();
			this._oSalesOrderService.recalcSalesOrder(this.getView().getElementBinding().getPath());
			//this.getComponentModel().submitChanges();

			/*that.getComponentModel().submitChangesExt()
				.then(() => that._oSalesOrderService.recalcSalesOrder(this.getView().getElementBinding().getPath()))
				.then(() => that.getComponentModel().submitChanges());*/
		},

		onSalesOrderItemCancel: function(oEvent) {
			this._oSalesOrderItemDialog.close();
		},

		onSalesOrderSave: function(oEvent) {
			this.getComponentModel().submitChanges();
		},

		onSalesOrderSubmit: function(oEvent) {
			var sSalesOrderPath = this.getView().getElementBinding().getPath();
			this.getComponentModel().setProperty(sSalesOrderPath + "/Status", "SUBMITTED");
			this.getComponentModel().submitChanges();
			this._oSalesOrderService.refreshStatusModel(sSalesOrderPath);
		},

		onSalesOrdeCancel: function(oEvent) {
			var sSalesOrderPath = this.getView().getElementBinding().getPath();
			this.getComponentModel().setProperty(sSalesOrderPath + "/Status", "DRAFT");
			this.getComponentModel().submitChanges();
			this._oSalesOrderService.refreshStatusModel(sSalesOrderPath);
		},

		onSalesOrderRelease: function(oEvent) {
			var that = this;
			var sSalesOrderPath = this.getView().getElementBinding().getPath();
			var sSalesOrderNum = this.getComponentModel().getProperty(sSalesOrderPath).SalesOrder;

			this.getComponentModel().setProperty(sSalesOrderPath + "/Status", "RELEASED");
			this.getComponentModel().submitChanges();
			this._oSalesOrderService.refreshStatusModel(sSalesOrderPath);

			this.getComponentPushNotificationService().sendNotificationAll("SalesOrder # " + sSalesOrderNum + " Released", sSalesOrderPath.substring(
					1))
				.then(oData => sap.m.MessageToast.show("Notification sent!", {
					duration: 3000
				}));

		},

		onSalesOrderDelete: function(oEvent) {
			this.getComponentModel().remove(this.getView().getElementBinding().getPath());
		},
		
		onRefresh: function() {
			this.getComponentModel().refresh(true);
			this.byId("pullToRefresh").hide();
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
				parameters: {
					"$expand": "SalesOrderItemDetails"
				},
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
			this._oSalesOrderService.refreshStatusModel(sObjectPath);
			//this.getComponentModel().readExt(sObjectPath, {
			//	"$expand": "SalesOrderItemDetails"
			//});
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

/*onSendNotification: function() {
			var that = this;
			var currentSalesOrderPath = this.getView().getElementBinding().getPath();
			var salesOrderNum = this.getComponentModel().getProperty(currentSalesOrderPath).SalesOrder;

			this.getComponentPushNotificationService().sendNotificationAll("Check update for Order #" + salesOrderNum, "navto: " +
					currentSalesOrderPath)
				.then(oData => sap.m.MessageToast.show("Notification sent!", {
					duration: 3000
				}));
		},

		onFileUploaderSet: function(oEvent) {
			debugger;
			var file = oEvent.getParameter("files")[0];
			if (!file) {
				alert("Choose a file first");
				return;
			}
			this._addAttachment(file);
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
						//path = mediaFiles[i].fullPath;
						aMediaFiles[i].isCamerShot = true;
						that._addAttachment(aMediaFiles[i]);
					}
				});
		},

		_addAttachment: function(file) {
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
		},*/