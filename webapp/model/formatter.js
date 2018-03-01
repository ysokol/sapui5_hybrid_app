sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		statusEditable: function(sValue) {
			switch (sValue) {
				case "DRAFT":
					return true;
				default:
					return true;
			}
		},
		statusDisplayChange: function(sValue) {
			switch (sValue) {
				case "DRAFT":
					return "Change";
				default:
					return "Display";
			}
		},
		statusUndoSubmissionAllowed: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return true;
				default:
					return false;
			}
		},
		statusState: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return sap.ui.core.ValueState.Success;
				case "DRAFT":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Warning;
			}
		},
		statusIcon: function(sValue) {
			switch (sValue) {
				case "SUBMITTED":
					return "sap-icon://accept";
				case "DRAFT":
					return "sap-icon://status-in-process";
				default:
					return sap.ui.core.ValueState.Warning;
			}
		}

	};

});