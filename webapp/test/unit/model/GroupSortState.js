/*global QUnit*/

sap.ui.define([
	"my/sapui5_hybrid_app/model/GroupSortState",
	"sap/ui/model/json/JSONModel"
], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("OrderTotalGross").length, 1, "The sorting by OrderTotalGross returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("SalesOrder").length, 1, "The sorting by SalesOrder returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("OrderTotalGross").length, 1, "The group by OrderTotalGross returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});


	QUnit.test("Should set the sorting to OrderTotalGross if the user groupes by OrderTotalGross", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("OrderTotalGross");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "OrderTotalGross", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by SalesOrder and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "OrderTotalGross");

		this.oGroupSortState.sort("SalesOrder");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});