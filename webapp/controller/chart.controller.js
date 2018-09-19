sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("com.softtek.Chart.controller.chart", {
		onInit:function(){
			
			var oFrame = this.getView().byId("idcolumn");
				var oDataSet = new sap.viz.ui5.data.FlattenedDataset(
				{
						dimensions: [{
							name: 'Model',
							value: "{Model>Brand}" }],
							
						measures:[{
							name: 'Cars Bought',
							value:"{Model>Value}"
						}],
						data : {
							path:"Model>/Cars"
						}
				});
			oFrame.setDataset(oDataSet);
			oFrame.setVizType('bar');
			
			oFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				},
				title: {
					visible:"true",
					text:"TITULOSUPERCOOL"
					
				}
			}
			);
			
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