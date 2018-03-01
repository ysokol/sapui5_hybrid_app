sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.SalesOrder", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			this.getRouter().getRoute("salesOrder").attachPatternMatched(this._onObjectMatched, this);
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
						if ( !isNaN(parseInt(item.SalesOrderItem)) && item.SalesOrderItem > maxItem) {
							maxItem = item.SalesOrderItem;
						}
					}
					that.getComponentModel().create(currentSalesOrderPath + "/SalesOrderItemDetails", {
		            	SalesOrder: salesOrderNum,
		            	SalesOrderItem: that._utils.stringPad(parseInt(maxItem) + 10, 4),
		                SalesOrderDetails: {__metadata: {uri: currentSalesOrderPath.substring(1) }} 
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
			debugger;
			var objectPath = oEvent.getParameter("arguments").objectPath;
			this.getModel().metadataLoaded().then(function() {
				this._bindView("/" + objectPath); // Mobile Version
			}.bind(this));
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