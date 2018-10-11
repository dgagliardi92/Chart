sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator'
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";
	
	var ticketGlobal = [];
	
	return Controller.extend("com.softtek.Chart.controller.chart", {
		
		
		onInit: function () {

			this.mapingOData(this, this.getView().byId("idcolumn"));
			this.dibujargrafico(600, 400);

			//var oModel = this.getOwnerComponent().getModel("Tickets");
			//var oModel = this.getOwnerComponent().getModel("Tickets2");
			//var oModel = sap.ui.getCore().getModel();

			/*oModel.read("/TicketsAbiertosSet", { 
				//success: this.funco(this) ,
				async: false,
				success: jQuery.proxy(function (oData, Response) {
					var Tickets = new sap.ui.model.json.JSONModel(oData.results);
            		
				
					sap.ui.getCore().setModel(Tickets, "Tickets");
					this.getView().byId("Table").setModel(Tickets, "Tickets");
				}, this),
				
				error: function(oEvent){ var ble = 2; } 
			} );*/

		},
		
		onBeforeRendering: function(oEvent){
			
			/*this.getOwnerComponent().getModel("Tickets2").attachEventOnce("batchRequestCompleted", this.onBatchRequestCompleted);
			this.getOwnerComponent().getModel("Tickets2").read("/TicketsAbiertosSet");
			this.getOwnerComponent().getModel("Tickets2").getProperty("/");*/
			//this.getOwnerComponent().getModel("Tickets2").att
		},
		
		batchRequestCompleted: function (oData) {
			var ble = 2;
			//var datos = oModel.getData("Tickets2");
			//var oNewModel = oModel.getProperty("/TicketsAbiertosSet");
			//var metaModel = oModel.getMetaModel( );
			//this.setModel(oModel, "NUEVO");

		},

		/*funco: function (Tickets) {
			var ble = 1;

			var oTickets = Tickets;
			sap.ui.getCore().setModel(Tickets, "Tickets");
			this.getView().byId("Table").setModel(Tickets, "Tickets");

		},*/

		onAfterRendering: function () {},
		
		
		cargartotales: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel("Tickets2");
			
			ticketGlobal = this.getOwnerComponent().getModel("Tickets2").getData("/");
			this.getView().byId("Table").setModel(ticketGlobal, "Tickets");

			var listadoTickets = Object.getOwnPropertyNames(oModel.oData);
			
			var countTickets = 0,
				countTsa = 0,
				countTep = 0,
				countTeer = 0,
				countTpr = 0;

			countTickets = Object.getOwnPropertyNames(oModel.oData).lenght;
			
			/*for (var i = 0; i < countTickets; i += 1) {
				var Tickets = oModel.oData[listadoTickets[i]];
			}*/

			if (listadoTickets instanceof Array) {
				listadoTickets.forEach(function (element) {
					if (!countTickets) {
						countTickets = 0;
						countTsa = 0;
						countTep = 0;
						countTeer = 0;
						countTpr = 0;
					}
					var Tickets = oModel.oData[element];
					countTickets = countTickets + 1;
					switch (Tickets.Estado) {

					case "Pendiente":
						countTsa = countTsa + 1;
						break;
					case "Propuesta Enviada":
						countTeer = countTeer + 1;
						break;
					case "Consulta Cliente":
						countTeer = countTeer + 1;
						break;
					case "Prueba Cliente":
						countTpr = countTpr + 1;
						break;
					case "Implementado":
						countTpr = countTpr + 1;
						break;
					default:
						countTep = countTep + 1;
						break;
					}
				});

			}

			var oModelCount = new JSONModel({
				Total: countTickets,
				tsa: countTsa,
				tep: countTep,
				teer: countTeer,
				tpr: countTpr,
			});

			this.getView().byId("iconTabBar").setModel(oModelCount);

			
		},

		dibujargrafico: function (consumido, restante) {

			this.getView().byId("cont3").setTitle("Consumo Abono");

			var oModel = new JSONModel({
				"Titulo": "Periodo 09/2018"
			});

			this.getView().byId("panel2").setModel(oModel);

			var vPorcentaje = consumido * 100 / (consumido + restante);

			this.getView().byId("textcont").setText("Horas Contratadas: " + consumido);
			this.getView().byId("textcons").setText("Horas Consumidas: " + restante);

			this.getView().byId("radial").setPercentage(vPorcentaje);
			this.getView().byId("radial").setValueColor("Critical");
			this.getView().byId("radial").setTooltip("");

		},

		handleIconTabBarSelect: function (oEvent) {

			var oTable = this.getView().byId("Table");
			var //oBinding = this.getView().getModel()oData.getBinding(),
				sKey = oEvent.getParameter("key"),
				aFilters = [];

			switch (sKey) {
			case "tsa":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Pendiente"));
				break;
			case "tep":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "En Proceso"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, " "));
				break;
			case "teer":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Propuesta Enviada"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Consulta Cliente"));
				break;
			case "tpr":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Prueba Cliente"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Implementado"));
				break;
			}
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);

		},

		filtrar: function () {

			var oModel = this.getView().getModel();
			var someObj = oModel.oData;
			//var someObj = sap.ui.getCore().getModel().getProperty("ZSM_ANALYTICS_SRV");
			for (var i = 0; i < someObj.length; i++) {
				var obj = someObj[i];
			}

			/*oModel.getData("/TicketsAbiertosSet");
			var items = this.byId("/TicketsAbiertosSet").getItems();    
			
			for (var item_index = 0; item_index < items.length; item_index++) {
    			var item = items[item_index];
			}*/

		},

		mapingOData: function (that, oFrame) {

			var vCliente = 38;
			var vSofttek = 62;
			var vOtros = 62;

			var vConsumido = 60;
			var vRestante = 40;

			var oModelConsumo = new JSONModel({
				'Consumo': [{
					nombre: "",
					consumido: vConsumido,
					restante: vRestante
				}]
			});

			var oModel = new JSONModel({
				'Data': [{
					nombre: "Cliente",
					valor: vCliente,
					otro: 1
				}, {
					nombre: "Softtek",
					valor: vSofttek,
					otro: 2
				}, {
					nombre: "SPS/PA/SAP",
					valor: vOtros,
					otro: 3
				}]
			});

			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					axis: 1,
					name: 'Tickets',
					value: "{nombre}"
				}],

				measures: [{
					name: 'Consumido',
					value: '{consumido}'
				}, {
					name: 'Restante',
					value: '{restante}'
				}],
				data: {
					path: "/Consumo"
				}

			});

			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModelConsumo);
			this.getView().byId("idDonutChart").setModel(oModel);

			//oFrame.setVizType('stacked_bar');
			//oFrame.setVizType('vertical_bullet');
			oFrame.setVizType('bullet');

			oFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true
					},
					legend: {
						visible: true
					},
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
				'values': ["Consumido", "Restante"]
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

		mensaje: function () {
			sap.m.MessageBox.show("blabla");

		}
	});
});