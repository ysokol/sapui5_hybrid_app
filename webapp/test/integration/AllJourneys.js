/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 SalesOrders in the list
// * All 3 SalesOrders have at least one SalesOrderItemDetails

sap.ui.require([
	"sap/ui/test/Opa5",
	"my/sapui5_hybrid_app/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"my/sapui5_hybrid_app/test/integration/pages/App",
	"my/sapui5_hybrid_app/test/integration/pages/Browser",
	"my/sapui5_hybrid_app/test/integration/pages/Master",
	"my/sapui5_hybrid_app/test/integration/pages/Detail",
	"my/sapui5_hybrid_app/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "my.sapui5_hybrid_app.view."
	});

	sap.ui.require([
		"my/sapui5_hybrid_app/test/integration/MasterJourney",
		"my/sapui5_hybrid_app/test/integration/NavigationJourney",
		"my/sapui5_hybrid_app/test/integration/NotFoundJourney",
		"my/sapui5_hybrid_app/test/integration/BusyJourney",
		"my/sapui5_hybrid_app/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});