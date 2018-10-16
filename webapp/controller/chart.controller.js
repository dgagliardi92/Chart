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

			this.dialog = new sap.m.BusyDialog({
				id: 'dialog',
				text: 'Cargando...'
			});

			this.dialog.open();

			this.byId("iconTabBar").setModel(this.getOwnerComponent().getModel("Totales"));

			this.dibujargrafico(0, 0, "");
			this.mapingOData(1, 0, this.getView().byId("idcolumn"));

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

		onBeforeRendering: function (oEvent) {

			/*this.getOwnerComponent().getModel("Tickets2").attachEventOnce("batchRequestCompleted", this.onBatchRequestCompleted);
			this.getOwnerComponent().getModel("Tickets2").read("/TicketsAbiertosSet");
			this.getOwnerComponent().getModel("Tickets2").getProperty("/");*/
			//this.getOwnerComponent().getModel("Tickets2").att
		},

		batchRequestCompleted: function (oData) {
			//var datos = oModel.getData("Tickets2");
			//var oNewModel = oModel.getProperty("/TicketsAbiertosSet");
			//var metaModel = oModel.getMetaModel( );
			//this.setModel(oModel, "NUEVO");

		},

		OKAbonoSet: function (oData) {

			var Tickets = new sap.ui.model.json.JSONModel(oData.results);
			var oticket = Tickets.getProperty("/0/");

			this.dibujargrafico(oticket.Abono, oticket.Consumido, oticket.Periodo);

			var oModel = this.getView().byId("idcolumn").getModel();

			oticket.Consumido = 20;

			//oModel.setProperty("/Consumo/0/consumido", oticket.Consumido );
			//oModel.setProperty("/Consumo/0/restante", oticket.Abono - oticket.Consumido );

			/*this.getView().byId("idcolumn").setModel(oModel);*/

			var oModelConsumo = new JSONModel({
				'Consumo': [{
					nombre: "",
					consumido: oticket.Consumido,
					restante: oticket.Abono - oticket.Consumido
				}]
			});

			this.getView().byId("idcolumn").setModel(oModelConsumo);
		},

		onAfterRendering: function () {},

		cargartotales: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel("Tickets");
			ticketGlobal = this.getOwnerComponent().getModel("Tickets").getData("/");

			var listadoTickets = Object.getOwnPropertyNames(oModel.oData);
			var oModelCount = this.byId("iconTabBar").getModel();

			var oModelLados = {
				Cliente: 0,
				Softtek: 0,
				Otros: 0,
			};

			if (listadoTickets instanceof Array) {
				listadoTickets.forEach(jQuery.proxy(function (element) {
					var oTicket = oModel.oData[element];
					this.contarPorEstado(oTicket, oModelCount);
					this.contarPorLado(oTicket, oModelLados);
				}), this);
			}

			var oModelCount2 = new JSONModel({
				Total: oModelCount.Total,
				tsa: oModelCount.tsa,
				tep: oModelCount.tep,
				teer: oModelCount.teer,
				tpr: oModelCount.tpr
			});

			//Busco el abono del cliente
			oModel.read("/AbonoSet", {
				success: jQuery.proxy(function (oData, Response) {
					this.OKAbonoSet(oData);
				}, this),
				error: function (oEvent) {}
			});

			//Cargo el modelo Totales
			this.getView().byId("iconTabBar").setModel(oModelCount2, "Totales");

			this.dibujarBarra(oModelLados);

			this.dialog.close();
		},

		contarPorLado: function (oTicket, oModelLado) {

			if (!oModelLado.Cliente) {
				oModelLado.Cliente = 0;
				oModelLado.Softtek = 0;
				oModelLado.Otros = 0;
			}

			switch (oTicket.Lado) {
			case "Softtek":
				oModelLado.Softtek = oModelLado.Softtek + 1;
				break;
			case "Cliente":
				oModelLado.Cliente = oModelLado.Cliente + 1;
				break;
			default:
				oModelLado.Otros = oModelLado.Otros + 1;
				break;
			}
			return oModelLado;
		},
		contarPorEstado: function (oTicket, oModelCount) {

			if (!oModelCount.Total) {
				oModelCount.Total = 0;
				oModelCount.tsa = 0;
				oModelCount.tep = 0;
				oModelCount.teer = 0;
				oModelCount.tpr = 0;
			}

			oModelCount.Total = oModelCount.Total + 1;
			switch (oTicket.Estado) {

			case "Pendiente":
				oModelCount.tsa = oModelCount.tsa + 1;
				break;
			case "Propuesta Enviada":
				oModelCount.teer = oModelCount.teer + 1;
				break;
			case "Consulta Cliente":
				oModelCount.teer = oModelCount.teer + 1;
				break;
			case "Prueba Cliente":
				oModelCount.tpr = oModelCount.tpr + 1;
				break;
			case "Implementado":
				oModelCount.tpr = oModelCount.tpr + 1;
				break;
			default:
				oModelCount.tep = oModelCount.tep + 1;
				break;
			}
			return oModelCount;
		},

		dibujarBarra: function (oLados) {

			var oModel = new JSONModel({
				'Data': [{
					nombre: "Cliente",
					valor: oLados.Cliente,
					otro: 1
				}, {
					nombre: "Softtek",
					valor: oLados.Softtek,
					otro: 2
				}, {
					nombre: "Otros", //"SPS/PA/SAP",
					valor: oLados.Otros,
					otro: 3
				}]
			});

			this.getView().byId("idDonutChart").setModel(oModel);

		},

		dibujargrafico: function (total, consumido, periodo) {

			this.getView().byId("cont3").setTitle("Consumo Abono");

			var oModel = new JSONModel({
				"Titulo": "Periodo " + periodo
			});

			this.getView().byId("panel2").setModel(oModel);
			var restante = total - consumido;

			var vPorcentaje = 0;
			if (consumido > 0) {
				vPorcentaje = consumido * 100 / (total);
			}
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

			/*var oModel = this.getView().getModel();*/

			/*var someObj = oModel.oData;*/
			//var someObj = sap.ui.getCore().getModel().getProperty("ZSM_ANALYTICS_SRV");
			/*for (var i = 0; i < someObj.length; i++) {
				var obj = someObj[i];
			}*/

			/*oModel.getData("/TicketsAbiertosSet");
			var items = this.byId("/TicketsAbiertosSet").getItems();    
			
			for (var item_index = 0; item_index < items.length; item_index++) {
    			var item = items[item_index];
			}*/

		},

		mapingOData: function (vAbono, vConsumido, oFrame) {
			var vRestante = vAbono - vConsumido;

			var oModelConsumo = new JSONModel({
				'Consumo': [{
					nombre: "",
					consumido: vConsumido,
					restante: vRestante
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
				gap: {
					visible: true,
					type: "positive",
					positiveColor: 'sapUiChartPaletteSemanticGood'
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