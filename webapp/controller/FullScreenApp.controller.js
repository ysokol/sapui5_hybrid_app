sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.FullScreenApp", {

		onInit: function() {
			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}


	});

});