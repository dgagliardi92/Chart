jQuery.sap.declare("com.softtek.Chart.Component");
/*jQuery.sap.declare("com.softtek.Chart.model.models");
jQuery.sap.declare("com.softtek.Chart.controller.ErrorHandler");*/

/*sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/softtek/Chart/model/models"
], function (UIComponent, Device, models) {
	"use strict";*/
sap.ui.core.UIComponent.extend("com.softtek.Chart.Component", {
	//return UIComponent.extend("com.softtek.Chart.Component", {

	metadata: {
		manifest: "json"
	},

	createContent: function () {
		// create root view
		this.view = sap.ui.view({
			id: "app",
			viewName: "com.softtek.Chart.view.chart",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: {
				component: this
			}
		});
		return this.view;
	},

	init: function () {

		sap.ui.core.UIComponent.prototype.init.apply(this, arguments);
		this.getRouter().initialize();
		//var Model = new com.softtek.Chart.model.models( );
		//this.setModel(Model.createDeviceModel(), "device");
		//this._oErrorHandler = new com.softtek.Chart.controller.ErrorHandler(this);
	},

	destroy: function () {

		//this._oErrorHandler.destroy();
		sap.ui.core.UIComponent.prototype.destroy.apply(this, arguments);
	}
});
/*});*/