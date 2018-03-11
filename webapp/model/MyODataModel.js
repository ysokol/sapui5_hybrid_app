sap.ui.define([
	"sap/ui/model/odata/v2/ODataModel",
	"my/sapui5_hybrid_app/utils/MyException"
], function(ODataModel, MyException) {
	"use strict";
	return ODataModel.extend("my.sapui5_hybrid_app.model.MyODataModel", {
		/*constructor: function() {
			ODataModel.call(this);
			
		},*/

		readExt: function(sPath, mUrlParameters) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.read(sPath, {
					urlParameters: mUrlParameters,
					success: function(oData) {
						resolve(oData);
					},
					error: function(oException) {
						reject(new MyException("MyODataModel", "Failed readExt", oException));
					}
				});
			});
		},

		createExt: function(sPath, oData) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that.create(sPath, oData, {
					success: function(oData) {
						resolve(oData);
					},
					error: function(oException) {
						reject(new MyException("MyODataModel", "Failed createExt", oException));
					}
				});
			});
		}

	});
});