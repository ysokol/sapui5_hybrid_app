sap.ui.define([
	"my/sapui5_hybrid_app/controller/BaseController",
	"my/sapui5_hybrid_app/model/formatter"
], function(BaseController, formatter) {
	"use strict";

	return BaseController.extend("my.sapui5_hybrid_app.controller.SalesOrder", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */
		onInit: function() {
			this.getRouter().getRoute("salesOrder").attachPatternMatched(this._onObjectMatched, this);
		},
		onSalesOrderItemAdd: function(oEvent) {
			//this.getComponentModel().	
			debugger;

			var currentSalesOrderPath = this.getView().getElementBinding().getPath();
			var salesOrderNum = this.getComponentModel().getProperty(currentSalesOrderPath).SalesOrder;
			var maxItem = "0000";
			var that = this;
			this.getComponentModel().read(currentSalesOrderPath + "/SalesOrderItemDetails", {
				success: function(oData) {
					for (let item of oData.results) {
						if (!isNaN(parseInt(item.SalesOrderItem)) && item.SalesOrderItem > maxItem) {
							maxItem = item.SalesOrderItem;
						}
					}
					that.getComponentModel().create(currentSalesOrderPath + "/SalesOrderItemDetails", {
						SalesOrder: salesOrderNum,
						SalesOrderItem: that._utils.stringPad(parseInt(maxItem) + 10, 4),
						SalesOrderDetails: {
							__metadata: {
								uri: currentSalesOrderPath.substring(1)
							}
						}
					});
				}
			});
		},

		onChangeDoc: function(oEvent) {
			debugger;

			var file = oEvent.getParameter("files")[0];
			if (!file) {
				alert("Choose a file first");
				return;
			}

			//var fileData = (new Buffer(value.data)).toString('binary');

			var fileData = new FormData();
			fileData.append('datafile', new Blob([file]));

			var reader = new FileReader();
			reader.onloadend = function() {
				debugger;
				var data = reader.result.split(",").pop();
				
				gapi.client.init({
					'apiKey': 'AIzaSyD0r-4o-SYW6VFRZKi5H_o1jdRxs5JZafU',
					'clientId': '655021029955-vcutm3d9kj4t93f2vanh2vs1nlfhmoqm.apps.googleusercontent.com',
					'scope': 'https://www.googleapis.com/auth/drive'
				}).then(function() {
					gapi.auth2.getAuthInstance().isSignedIn.listen(function() {
						alert("Signed IN");
					});
					gapi.auth2.getAuthInstance().signIn().then(function() {
						debugger;
						alert("Signed IN too");
						
						var contentType = file.type || 'application/octet-stream';
						
						var parentId = '1vxuDR9UWaY9tIyyaQ0hfLP259v-NtP5f'; //some parentId of a folder under which to create the new folder
						var fileMetadata = {
							'name': file.name,
							'title': file.name,
							'mimeType': contentType,
							'parents': [parentId]
						};

						/*gapi.client.request({
							'path': '/upload/drive/v3/files',
							'method': 'POST',
							'params': {
								'uploadType': 'media'
							},
							'headers': {
								'Content-Type': 'image/jpeg'
							},
							'body': data
						}).then(function(response) {
							console.log(response);
						});*/

						/*var request = gapi.client.drive.files.create({
							resource: fileMetadata
						});

						request.execute(function(response) {
							debugger;
							console.log(response);
							gapi.client.request({
								'path': '/upload/drive/v3/files/' + response.id,
								'method': 'POST',
								'headers': {
									'Content-Type': 'image/jpeg'
								},
								'body': data
							}).then(function(response) {
								console.log(response);
							});

						});*/
						
						
						
						const boundary = '-------314159265358979323846';
						const delimiter = "\r\n--" + boundary + "\r\n";
						const close_delim = "\r\n--" + boundary + "--";

						var multipartRequestBody = delimiter +
												   'Content-Type: application/json\r\n\r\n' + 
												   JSON.stringify(fileMetadata) + 
												   delimiter +
												   'Content-Type: ' + contentType + '\r\n' + 
												   'Content-Transfer-Encoding: base64\r\n' +
												   '\r\n' +
												   data + 
												   close_delim;
						// https://developers.google.com/drive/v3/web/multipart-upload
						gapi.client.request({
							'path': '/upload/drive/v3/files',
							'method': 'POST',
							'params': {
								'uploadType': 'multipart'
							},
							'headers': {
								'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
							},
							'body': multipartRequestBody
						}).then(function(response) {
							console.log(response);
						});

					});

				});

			}
			reader.readAsDataURL(new Blob([file]));

			//don't need type informations
			//data = data.split(",").pop();
		},

		onChangeDoc_old: function(oEvent) {
			debugger;
			alert("onChangeDoc");

			var file = oEvent.getParameter("files")[0];
			if (!file) {
				alert("Choose a file first");
				return;
			}

			var data = {
				'propertyId[0]': 'cmis:objectTypeId',
				'propertyValue[0]': 'cmis:document',
				'propertyId[1]': 'cmis:name',
				'propertyValue[1]': file.name,
				'cmisaction': 'createDocument'
			};

			var formData = new FormData();
			formData.append('datafile', new Blob([file]));
			jQuery.each(data, function(key, value) {
				formData.append(key, value);
			});

			//document.cookie =
			//	"JSESSIONID=A05168F505AAE5B1342D0B0B9BC274C68F114F128EDA78A0FA6C52E19906CF1E; JTENANTSESSIONID_7b1b1837-b36b-42de-b045-c9c3780d9766=xr6iFhkdUcgr%2FAmom%2FLzVtflapiY7IrMap54DViI588%3D; BIGipServer~jpaas_folder~mdocs.hanatrial.ondemand.com=!4t+x7Cn/w2lPLiywDhtcRsHHmTA76DQi4bntVx2RHCVYO226M/F3PjkXt6eI5SSzo9Jh2HRhAVitdA==; JTENANTSESSIONID_s0004431717trial=xErdlPP%2BTTW8pjWOuHMPoJwaza6N5r0hx71O8Pk9oRg%3D";
			//alert(document.cookie);

			// read repositoryInfos extract token and set it to following requests
			$.ajax("/sap_document_center/mcm/json", {
				type: "GET",
				contentType: 'application/json',
				dataType: 'json',
				xhrFields: {
					withCredentials: true
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('Access-Control-Allow-Credentials', 'true');
					xhr.setRequestHeader('X-CSRF-Token', 'fetch');
					//xhr.setRequestHeader('Authorization', 'Basic czAwMDQ0MzE3MTc6WnNlJDRyZnY=');
					//xhr.setRequestHeader('Authorization', 'Bearer 5f7d91c13a75b0164f821e417b3acc71');
				},
				complete: function(response) {
					console.log(response);

					/*jQuery.ajaxSetup({
						beforeSend: function(xhr) {
							xhr.setRequestHeader('Authorization', 'Basic czAwMDQ0MzE3MTc6WnNlJDRyZnY=');
							xhr.setRequestHeader("X-CSRF-Token", response.getResponseHeader('X-CSRFToken'));
						}
					});

					$.ajax('https://mdocs-s0004431717trial.hanatrial.ondemand.com/mcm/json/1e656e9d94788bc6fcb199a5', {
						type: 'POST',
						data: formData,
						cache: false,
						processData: false,
						contentType: false,
						success: function(response) {
							console.log(response);
							alert("File Uploaded Successfully");
						}.bind(this),
						error: function(error) {
							console.log(error);
							alert("File Uploaded Unsuccessfully. Save is not possible.");
						}
					});*/

				}
			});
		},

		onSalesOrderItemDelete: function(oEvent) {
			this.getComponentModel().remove(oEvent.getSource().getParent().getBindingContext().getPath());
		},

		onSalesOrderItemDetail: function(oEvent) {
			if (!this._oSalesOrderItemDialog) {
				this._oSalesOrderItemDialog = new sap.ui.xmlfragment("my.sapui5_hybrid_app.view.SalesOrderItem", this);
			}
			this._oSalesOrderItemDialog.bindObject(oEvent.getSource().getBindingContext().getPath());
			this._oSalesOrderItemDialog.open();
		},

		onSalesOrderItemConfirm: function(oEvent) {
			this._oSalesOrderItemDialog.close();
			this.getComponentModel().submitChanges();
		},

		onSalesOrderSave: function(oEvent) {
			this.getComponentModel().submitChanges();
		},

		onSalesOrderDelete: function(oEvent) {
			this.getComponentModel().remove(this.getView().getElementBinding().getPath());
		},

		_onObjectMatched: function(oEvent) {
			debugger;
			var objectPath = oEvent.getParameter("arguments").objectPath;
			this.getModel().metadataLoaded().then(function() {
				this._bindView("/" + objectPath); // Mobile Version
			}.bind(this));
		},

		_bindView: function(sObjectPath) {

			this.getView().bindElement({
				path: sObjectPath, // + "?$expand=SalesOrderItemDetails", // / - requried for web, for mobile not required
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function() {
						//oViewModel.setProperty("/busy", true);
					},
					dataReceived: function() {
						//oViewModel.setProperty("/busy", false);
					}
				}
			});
		},
		_onBindingChange: function() {
			/*var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.SalesOrder,
				sObjectName = oObject.SalesOrder,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));*/
		}

	});

});