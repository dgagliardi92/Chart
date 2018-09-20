sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel"
], function (Controller,JSONModel) {
	"use strict";

	return Controller.extend("com.softtek.Chart.controller.chart", {
		onInit: function () {
			var vAbiertos = "pepe";
			var vCerrados = "2";
			
			var vData={ abiertos: "124", cerrados: "3" };
			
			//var oModel = new JSONModel({ "TicketsDG": [ { abiertos: "124", cerrados: 3 } ] });
            //oModel.setData(vData);
            //this.getView().setModel(oModel, "TicketsDG");
            
			//this.mapingOData(this.getView().byId("idcolumn2"));
			this.mapingOData(this.getView().byId("idcolumn"));
			//this.maping(this.getView().byId("idcolumn"));

		},

		mapingOData: function (oFrame) {
			
			//var oModel = new JSONModel( { "DAAATA": [ { 'abiertos': "124", 'cerrados': "3" } ] } );
			var oModel = new JSONModel( { 'Data' : [ 
				{
					nombre: "Parker",
    				valor: 5,
    				otro: 1
				},
				{
					nombre: "Spider",
    				valor: 3,
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
				/*,
				{
					name: 'otro',
					value: '{otro}'
				}*/
				],
				data : {
					path: "/Data"
				}
			});
			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModel);
			
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
				//'values': ["valor","otro"]
				'values': ["valor"]
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