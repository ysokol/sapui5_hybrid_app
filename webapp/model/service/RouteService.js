sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	var RouteService = Object.extend("my.sapui5_hybrid_app.model.service.RouteService", {
		constructor: function(oODataModel) {
			Object.apply(this);
			this._oODataModel = oODataModel;
		},

		recalcVisitCount: function(sRoutePath) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that._oODataModel.readExt(sRoutePath + "/VisitDetails")
				.then(function(oData) {
					var iClosedCount = 0;
					for (let oVisit of oData.results) {
						if(oVisit.Status === "CLOSED") {
							iClosedCount++;
						}
					}
					that._oODataModel.setProperty(sRoutePath + "/VisitsTotal", oData.results.length/*.toString()*/);
					that._oODataModel.setProperty(sRoutePath + "/VisitsDone", iClosedCount/*.toString()*/);
					resolve();
				})
				.catch(oException => reject(new MyException("RouteService", "Failed: recalcVisitCount", oException)));
			});
		}
	});

	return RouteService;
});