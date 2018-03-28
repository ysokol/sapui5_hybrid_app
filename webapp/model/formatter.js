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
		
		equipmentStatusIcon: function(sValue) {
			switch (sValue) {
				case "In Service":
					return "sap-icon://accept";
				case "Not Working":
					return "sap-icon://decline";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		equipmentStatusState: function(sValue) {
			switch (sValue) {
				case "In Service":
					return sap.ui.core.ValueState.Success;
				case "Not Working":
					return sap.ui.core.ValueState.Error;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		routeStatusIcon: function(sValue) {
			switch (sValue) {
				case "DONE":
					return "sap-icon://complete";
				case "EXEC":
					return "sap-icon://status-in-process";
				case "PLAN":
					return "sap-icon://future";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		routeStatusState: function(sValue) {
			switch (sValue) {
				case "DONE":
					return sap.ui.core.ValueState.Success;
				case "EXEC":
					return sap.ui.core.ValueState.Warning;
				case "PLAN":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
		visitStatusIcon: function(sValue) {
			switch (sValue) {
				case "CLOSED":
					return "sap-icon://complete";
				case "OPENED":
					return "sap-icon://status-in-process";
				case "PLAN":
					return "sap-icon://future";
				default:
					return "sap-icon://question-mark";
			}
		},
		
		visitStatusState: function(sValue) {
			switch (sValue) {
				case "CLOSED":
					return sap.ui.core.ValueState.Success;
				case "OPENED":
					return sap.ui.core.ValueState.Warning;
				case "PLAN":
					return sap.ui.core.ValueState.Warning;
				default:
					return sap.ui.core.ValueState.Error;
			}
		},
		
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