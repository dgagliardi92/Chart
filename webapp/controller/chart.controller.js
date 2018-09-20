sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller,JSONModel) {
	"use strict";
	
	return Controller.extend("com.softtek.Chart.controller.chart", {

		onInit: function () {
			
			//this.mapingOData(this.getView().byId("idcolumn2"));
			this.mapingOData(this, this.getView().byId("idcolumn"));
			//this.maping(this.getView().byId("idcolumn"));

		},

		mapingOData: function (that, oFrame) {
			
			var vAbiertos = 38;
			var vCerrados = 62;

			var oModel = new JSONModel( { 'Data' : [ 
				{
					nombre: "Abiertos",
    				valor: vAbiertos,
    				otro: 1
				},
				{
					nombre: "Cerrados",
    				valor: vCerrados,
    				otro: 2
				}] } );
			
			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
					name: 'nombre',
					value: "{nombre}"
				}],

				measures : [{
					name: 'valor',
					value: '{valor}'
				}
				,
				{
					name: 'otro',
					value: '{otro}'
				}
				],
				data : {
					path: "/Data"
				}
			});
			
			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModel);
			this.getView().byId("idDonutChart").setModel(oModel);
			
			
			oFrame.setVizType('stacked_bar');
			

			oFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				},
				title: {
					visible: "true",
					text: "Tickets"

				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["valor","otro"]
			//'values': ["valor"]
			});

			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				'values': ["nombre"]
			});

			oFrame.addFeed(feedValueAxis);
			oFrame.addFeed(feedCategoryAxis);

		},

		maping: function (oFrame) {
			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Model',
					value: "{Model>Brand}"
				}],

				measures: [{
					name: 'Cars Bought',
					value: "{Model>Value}"
				}],
				data: {
					path: "Model>/Cars"
				}
			});
			oFrame.setDataset(oDataSet);
			oFrame.setVizType('bar');

			oFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				},
				title: {
					visible: "true",
					text: "TITULOSUPERCOOL"

				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Cars Bought"]
			});

			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				'values': ["Model"]
			});

			oFrame.addFeed(feedValueAxis);
			oFrame.addFeed(feedCategoryAxis);

		}
	});
});