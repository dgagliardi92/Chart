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
	
			this.getView().byId("cont3").setTitle("Consumo Abono");
			
			var oModel = new JSONModel( { "Titulo" : "Periodo 09/2018" } );
			this.getView().byId("panel2").setModel(oModel);
													
			
			
			
			var vConsumido = 600;
			var vRestante = 400;
			
			var vPorcentaje =   vConsumido * 100 / ( vConsumido + vRestante );
			
			this.getView().byId("textcont").setText("Horas Contratadas: " + vConsumido);
			this.getView().byId("textcons").setText("Horas Consumidas: " + vRestante);
			
			this.getView().byId("radial").setPercentage(vPorcentaje);
			this.getView().byId("radial").setValueColor("Critical");
			this.getView().byId("radial").setTooltip("");
			
			
		/*	this.OnBeforeRendering( );*/
				
		},
		
		OnBeforeRendering: function(){
			
	
			
			var vModel = sap.ui.getCore().getModel();
			vModel.getData("/TicketsAbiertosSet");
			var items = this.byId("/TicketsAbiertosSet").getItems();    
			
			for (var item_index = 0; item_index < items.length; item_index++) {
    			var item = items[item_index];
			}
		},

		mapingOData: function (that, oFrame) {
			
			var vCliente = 38;
			var vSofttek = 62;
			var vOtros = 62;
			
			var vConsumido = 60;
			var vRestante = 40;
			
			var oModelConsumo = new JSONModel( { 'Consumo' : [ 
				{
					nombre: "",
    				consumido: vConsumido,
    				restante: vRestante
				} ] } );
			
			var oModel = new JSONModel( { 'Data' : [ 
				{
					nombre: "Cliente",
    				valor: vCliente,
    				otro: 1
				},
				{
					nombre: "Softtek",
    				valor: vSofttek,
    				otro: 2
				},
				{
					nombre: "SPS/PA/SAP",
    				valor: vOtros,
    				otro: 3
				}
				] } );
			
			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions : [{
					 axis : 1,
					name: 'Tickets',
					value: "{nombre}"
				}],

				measures : [{
					name: 'Consumido',
					value: '{consumido}'
				},{
					name: 'Restante',
					value: '{restante}'
				}],
				data : {
					path: "/Consumo"
				}
			
			} );
			
			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModelConsumo);
			this.getView().byId("idDonutChart").setModel(oModel);
			
			
			//oFrame.setVizType('stacked_bar');
			//oFrame.setVizType('vertical_bullet');
			oFrame.setVizType('bullet');
			
			

			oFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				},
				title: {
					visible: "false",
					text: "Tickets"

				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': ["Consumido","Restante"]
				//'values': ["valor"]
			});

			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				//'values': ["nombre","otro"]
				'values': ["Tickets"]
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

		},
		
		mensaje:function(){
			sap.m.MessageBox.show("blabla");
			
		}
	});
});