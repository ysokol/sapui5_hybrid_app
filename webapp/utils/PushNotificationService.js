sap.ui.define([
	"sap/ui/base/Object",
	"my/sapui5_hybrid_app/utils/MyException"
], function(Object, MyException) {
	"use strict";
	return Object.extend("my.sapui5_hybrid_app.utils.PushNotificationService", {

		constructor: function(oUiComponent) {
			this._oUiComponent = oUiComponent;
		},

		init: function() {
			var nTypes = sap.Push.notificationType.SOUNDS | sap.Push.notificationType.ALERT;
			var that = this
			sap.Push.registerForNotificationTypes(nTypes,
				/*pushRegistrationSuccess*/
				function(oResult) {
					//alert("pushRegistrationSuccess");
				},
				/*pushRegistrationFailure*/
				function(oError) {
					alert("Error while registering for Push.  " + JSON.stringify(oError));
				},
				/*processNotification*/
				$.proxy(that.onProcessNotification, that),
				null /* optional GCM Sender ID */ );
			sap.Push.initPush($.proxy(that.onProcessNotification, that));
		},

		sendNotificationAll: function(sTitle, sData) {
			var that = this;
			return new Promise(function(resolve, reject) {
				var mRequestData = {
					"alert": sTitle,
					"data": sData
				};
				
				var sRequestData = JSON.stringify(mRequestData);
				
				var oRequest = {
					"async": true,
					"crossDomain": true,
					"url": "https://hcpms-s0004431717trial.hanatrial.ondemand.com/restnotification/application/my.orders.hybrid/",
					"method": "POST",
					"headers": {
						"Authorization": "Basic czAwMDQ0MzE3MTc6WnNlNHJmdmcjMQ==",
						"Accept-Encoding": "gzip, deflate",
						"Accept": "*/*",
						"Content-Length": sRequestData.length,
						"Content-Type": "application/json",
						"Cache-Control": "no-cache"
					},
					"processData": false,
					"data": sRequestData
				};
				
				$.ajax(oRequest)
				.done(function(oData,  sTextStatus, oJqXHR) {
					resolve(oData);
				})
				.fail(function(oJqXHR, sTextStatus, oErrorThrown ) {
					reject(new MyException("PushNotificationService", "Failed setPushFeedbackStatus()", oErrorThrown));
				});
			});
		},

		onProcessNotification: function(oNotification) {
			var that = this;
			sap.m.MessageBox.confirm("New Notification: " + oNotification.title + ".\r\n" + "Navigate to Sales Order?", {
					onClose: function(oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							that._oUiComponent.getRouter().navTo("SalesOrder", {
								objectPath: oNotification.data
							});
						}
						that.setPushFeedbackStatus('consumed', oNotification.additionalData.notificationId);
					}
				});

			
			
			//oNotification = {
			//	additionalData: {
			//		foreground:true
			//		notificationId:"a298557d-2ba2-440e-8473-ae1bd439c5a5"
			//	}
			//	cdata:"data"
			//	data:"data"
			//	title:"alert"
			//}
			//this.getRouter().initialize();
			
			/*var that = this;
			var oDialog = new sap.m.Dialog({
				content: new sap.m.Text({
					text: "Notification received \r\n" +
						"title:\r\n" +
						oNotification.title +
						"\r\ndata:\r\n" +
						oNotification.data
				}),
				beginButton: new sap.m.Button({
					text: 'Confirm reception',
					press: function() {
						oDialog.close();
						that.setPushFeedbackStatus('consumed', oNotification.additionalData.notificationId);
					}
				}),
				afterClose: function() {
					oDialog.destroy();
				}
			});
			oDialog.open();*/

		},

		setPushFeedbackStatus: function(sStatus, sNotificationId) {
			return new Promise(function(resolve, reject) {
				sap.Push.setPushFeedbackStatus(sStatus, sNotificationId,
					function(sStatus) {
						resolve(sStatus);
					},
					function(oException) {
						reject(new MyException("PushNotificationService", "Failed setPushFeedbackStatus()", oException));
					});
			});
		}

	});
});