/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"my/sapui5_hybrid_app/test/integration/NavigationJourneyPhone",
		"my/sapui5_hybrid_app/test/integration/NotFoundJourneyPhone",
		"my/sapui5_hybrid_app/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});