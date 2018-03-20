/*global history */
sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter",
	"sap/ui/core/routing/History"
], function(BaseController, formatter, History) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.Visit", {

		formatter: formatter,

		onInit: function() {
			this.getRouter().getRoute("visit").attachPatternMatched(this._onObjectMatched, this);
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
			this.getView().bindElement({
				path: sObjectPath
			});
		}

	});

});