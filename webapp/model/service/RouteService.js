sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	var RouteService = Object.extend("my.sapui5_hybrid_app.model.service.RouteService", {
		constructor: function(oODataModel, oMapDataModel) {
			Object.apply(this);
			this._oODataModel = oODataModel;
			this._oMapDataModel = oMapDataModel;
		},

		recalcVisitCount: function(sRoutePath) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that._oODataModel.readExt(sRoutePath + "/VisitDetails")
					.then(function(oData) {
						var iClosedCount = 0;
						for (let oVisit of oData.results) {
							if (oVisit.Status === "CLOSED") {
								iClosedCount++;
							}
						}
						that._oODataModel.setProperty(sRoutePath + "/VisitsTotal", oData.results.length /*.toString()*/ );
						that._oODataModel.setProperty(sRoutePath + "/VisitsDone", iClosedCount /*.toString()*/ );
						if (oData.results.length !== 0 && iClosedCount === oData.results.length) {
							that._oODataModel.setProperty(sRoutePath + "/Status", "DONE");
						} else {
							that._oODataModel.setProperty(sRoutePath + "/Status", "EXEC");
						}
						resolve();
					})
					.catch(oException => reject(new MyException("RouteService", "Failed: recalcVisitCount", oException)));
			});
		},

		refreshMapDataModel: function(sRoutePath) {
			var that = this;
			return new Promise(function(resolve, reject) {
				that._oODataModel.readExt(sRoutePath + "/VisitDetails").then(function(oData) {
						var oFirstVisit = null;
						var oLastVisit = null;
						var iCounter = 0;
						var aWaypoints = [];
						if (oData.results.length >= 2) {
							oLastVisit = oData.results.pop();
							for (let oVisit of oData.results) {
								if (!oFirstVisit) {
									oFirstVisit = oVisit;
								} else {
									aWaypoints.push({
										location: oVisit.GeoPosition
									});
								}
							}

							that._oMapDataModel.setProperty("/lat", oFirstVisit.GeoPosition.split(',')[0].trim());
							that._oMapDataModel.setProperty("/lng", oFirstVisit.GeoPosition.split(',')[1].trim());

							that._oMapDataModel.setProperty("/start", oFirstVisit.GeoPosition);
							that._oMapDataModel.setProperty("/end", oLastVisit.GeoPosition);
							that._oMapDataModel.setProperty("/stops", aWaypoints);
							resolve();
						} else {
							that._oMapDataModel.setProperty("/lat", "42.324231");
							that._oMapDataModel.setProperty("/lng", "-71.052228");

							that._oMapDataModel.setProperty("/start", "42.324231, -71.052228");
							that._oMapDataModel.setProperty("/end", "42.324231, -71.052228");
							that._oMapDataModel.setProperty("/stops", []);
							resolve();
							//reject(new MyException("RouteService", "Failed to build route on map: less than two visits found."));
						}
					})
					.catch(function(oException) {
						that._oMapDataModel.setProperty("/lat", "42.324231");
						that._oMapDataModel.setProperty("/lng", "-71.052228");

						that._oMapDataModel.setProperty("/start", "42.324231, -71.052228");
						that._oMapDataModel.setProperty("/end", "42.324231, -71.052228");
						that._oMapDataModel.setProperty("/stops", []);
						resolve();
					});
			});
		}
	});

	return RouteService;
});