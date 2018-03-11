sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.PushNotificationService", {

		constructor: function() {

		},

		init: function() {
			debugger;
			var nTypes = sap.Push.notificationType.SOUNDS | sap.Push.notificationType.ALERT;
			var that = this
			sap.Push.registerForNotificationTypes(nTypes,
				/*pushRegistrationSuccess*/
				function(oResult) {
					alert("pushRegistrationSuccess");
				},
				/*pushRegistrationFailure*/
				function(oError) {
					alert("Error while registering for Push.  " + JSON.stringify(oError));
				},
				/*processNotification*/
				$.proxy(that.processNotification, that),
				null /* optional GCM Sender ID */ );
			sap.Push.initPush($.proxy(that.processNotification, that));
		},

		processNotification: function(oNotification) {
			alert("in processNotification: " + JSON.stringify(oNotification));
			/*if (sap.Push.setPushFeedbackStatus && oNotification.additionalData) { //SP15 new feature
				sap.Push.setPushFeedbackStatus('consumed', notification.additionalData.notificationId, pushFeedbackStatusSuccessCallback,
					pushFeedbackStatusErrorCallback);
			}*/
		}

	});
});