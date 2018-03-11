sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var MyException = Object.extend("my.sapui5_hybrid_app.utils.MyException", {
		constructor: function(sName, sMessage, oCausedBy) {
			Object.apply(this);
			if (arguments.length === 3) {
				this._sName = sName;
				this._sMessage = sMessage;
				this._oCausedBy = oCausedBy;
			} else {
				throw new Error("Illegal arguments for MyException.constructor()");
			}
		}
	});
	
	MyException.prototype.toString = function () {
		var sCausedBy = null;
		if ( this._oCausedBy instanceof MyException) {
			sCausedBy = this._oCausedBy.toString();
		} else if (typeof this._oCausedBy === 'string') {
			sCausedBy = this._oCausedBy;
		} else {
			sCausedBy = JSON.stringify(this._oCausedBy);
		}
		
		return this._sName + "\r\n" + this._sMessage + "\r\n" + "Caused by:\r\n" + sCausedBy;
	};
	
	MyException.prototype.alert = function () {
		alert(this.toString());
	};
	
	return MyException;
}, /* bExport= */ true);