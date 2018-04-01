sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.NumberRangeService", {
		constructor: function(oODataModel) {
			this._oODataModel = oODataModel;
		},

		getNextNumber: function({
			sEntity,
			sProperty,
			sInitialValue,
			iStep
		}) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var sMaxNumber = sInitialValue;
				var mODataFilter = {
					"$top": "1",
					"$orderby": sProperty + " desc",
				};
				if (sMaxNumber.substring(0, 1) === "$") {
					mODataFilter["$filter"] = "startswith(" + sProperty + ", '$') eq true";
				}
				that._oODataModel.readExt("/" + sEntity, mODataFilter)
					.then(function(oData) {
						if (oData.results[0]) {
							sMaxNumber = oData.results[0][sProperty];
						}
						if (sMaxNumber.substring(0, 1) === "$") {
							resolve(sMaxNumber.replace(/(\d+)+/g, function (match, iNumber) {
								return parseInt(iNumber) + iStep;
							}));
						} else {
							resolve(that.stringPad(parseInt(sMaxNumber) + iStep, sMaxNumber.length));
						}

					});
			});
		},

		stringPad: function(a, b) {
			return (1e15 + a + "").slice(-b);
		}

	});
});