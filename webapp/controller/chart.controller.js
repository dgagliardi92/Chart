sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/viz/ui5/format/ChartFormatter',

], function (Controller, JSONModel, Filter, FilterOperator, ChartFormatter) {
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
			//this.mapingOData(1, 0, this.getView().byId("idcolumn"), "bullet");
			
			var oPopOver = this.getView().byId("idPopOver");
            oPopOver.connect(this.getView().byId("pie").getVizUid());
            oPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
			this.mapingOData(1, 0, this.getView().byId("pie"), "pie");
			
			
			this.dibujarBar(1, 0);

		},

		onBeforeRendering: function (oEvent) {

			this._initFilterView();

		},

		OKAbonoSet: function (oData) {

			var Tickets = new sap.ui.model.json.JSONModel(oData.results);
			var oticket = Tickets.getProperty("/0/");

			this.dibujargrafico(oticket.Abono, oticket.Consumido, oticket.Periodo);

			var oModelConsumo = new JSONModel({
				'Consumo': [{
					nombre: "",
					consumido: oticket.Consumido,
					restante: oticket.Abono - oticket.Consumido
				}]
			});

			//this.getView().byId("idcolumn").setModel(oModelConsumo);

			var oModel = new JSONModel({
				'Consumo': [{
					nombre: "",
					min: oticket.Consumido,
					max: oticket.Abono
				}]
			});
			this.getView().byId("barTickets").setModel(oModel);
			this.setReferenceLine(this.getView().byId("barTickets"), oticket.Consumido, oticket.Consumido + "hs", oticket.Abono, oticket.Abono +
				"hs");
		},

		onAfterRendering: function () {},

		cargartotales: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel("Tickets");
			ticketGlobal = this.getOwnerComponent().getModel("Tickets").getData("/");

			var listadoTickets = Object.getOwnPropertyNames(oModel.getProperty("/"));
			var oModelCount = this.byId("iconTabBar").getModel();

			var oModelLados = {
				Cliente: 0,
				Softtek: 0,
				Otros: 0
			};

			if (listadoTickets instanceof Array) {
				var clear = true;
				listadoTickets.forEach(jQuery.proxy(function (element) {
					var oTicket = oModel.getProperty("/".concat([element], "/"));
					this.contarPorEstado(oTicket, oModelCount, clear);
					this.contarPorLado(oTicket, oModelLados);
					this.acumularFiltros(oTicket, this._oFiltros);
					clear = false;
				}), this);
			}

			this._oViewSettingsDialog.setModel(new sap.ui.model.json.JSONModel(this._oFiltros), "Filtros");

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
				error: function (oEventError) {}
			});

			//Cargo el modelo Totales
			this.getView().byId("iconTabBar").setModel(oModelCount2, "Totales");

			this.dibujarBarra(oModelLados);

			this.dialog.close();
		},

		acumularFiltros: function (oTicket, oFiltros) {

			if (oTicket.Lado === "")
				oTicket.Lado = "Vacio";

			if (oFiltros.iLados.indexOf(oTicket.Lado) < 0) {

				var vindex = oFiltros.iLados.lenght + 1;

				oFiltros.iLados.push(oTicket.Lado);
				oFiltros.Lados.push({
					nombre: oTicket.Lado,
					index: vindex
				});

			}

			if (oFiltros.iPrioridades.indexOf(oTicket.Prioridad) < 0) {

				vindex = oFiltros.iPrioridades.lenght + 1;

				oFiltros.iPrioridades.push(oTicket.Prioridad);
				oFiltros.Prioridades.push({
					nombre: oTicket.Prioridad,
					index: vindex
				});

			}

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
		contarPorEstado: function (oTicket, oModelCount, vClear) {

			if (vClear) {
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
				"Data": [{
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

			var vPorcentaje = 0.00;
			if (consumido > 0) {
				vPorcentaje = consumido * 100 / (total);
			}
			var tPorcentaje = Math.floor(vPorcentaje.toFixed(2));

			this.getView().byId("textcont").setText("Horas Contratadas: " + consumido);
			this.getView().byId("textcons").setText("Horas Consumidas: " + restante);

			this.getView().byId("radial").setPercentage(tPorcentaje);
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

			this._oViewSettingsDialog.open();

		},

		mapingOData: function (vAbono, vConsumido, oFrame, oType) {
			//var vRestante = vAbono - vConsumido;

			/*var oModelConsumo = new JSONModel({
				"Consumo": [{
					nombre: "",
					consumido: vConsumido,
					restante: vRestante
				}]
			});
			*/
			var oModelConsumo = new JSONModel({
				"Consumo": [{
					nombre: "pepe",
					consumido: 300,
					restante: 400
				},{
					nombre: "bla",
					consumido: 100,
					restante: 400
				}
				]
			});

			/*var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					axis: 1,
					name: "Tickets",
					value: "{nombre}"
				}],

				measures: {
					name: "Consumido",
					value: '{consumido}'
				}
				/*, {
					name: 'Restante',
					value: '{restante}'
				}
				,
				data: {
					path: "/Consumo"
				}

			});*/

			//oFrame.setDataset(oDataSet);
			oFrame.setModel(oModelConsumo);

			//oFrame.setVizType('stacked_bar');
			//oFrame.setVizType('vertical_bullet');
			//oFrame.setVizType('bullet');
			oFrame.setVizType(oType);

			/*oFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: true,
						formatString: ChartFormatter.DefaultPattern.SHORTFLOAT_MFD2
					},
					legend: {
						visible: true
					},
					colorPalette: d3.scale.category20().range()
				},
				valueAxis: {
					label: {
						formatString: ChartFormatter.DefaultPattern.SHORTFLOAT
					},
					title: {
						visible: false
					}
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
			});*/

			/*var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				//'values': ["Consumido", "Restante"]
				'values': ["Consumido"]
					//'values': ["valor"]
			});

			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				//'values': ["nombre","otro"]
				'values': ["Tickets"]
			});

			oFrame.addFeed(feedValueAxis);
			oFrame.addFeed(feedCategoryAxis);*/

		},

		dibujarBar: function (Consumidas, Contratadas) {

			var oFrame = this.getView().byId("barTickets");

			var oConsumidas = "Contratadas";
			var oTicket = "Tickets";

			var oModelConsumo = new JSONModel({
				"Consumo": [{
					nombre: "",
					min: Consumidas,
					max: Contratadas
				}]
			});

			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					axis: 1,
					name: oTicket,
					value: "{nombre}"
				}],
				measures: [{
					name: oConsumidas,
					value: '{max}'
				}, {
					name: 'min',
					value: '{min}'
				}],
				data: {
					path: "/Consumo"
				}
			});

			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModelConsumo);
			oFrame.setVizType("bar");

			oFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: false
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
			
			this.setReferenceLine(oFrame, Consumidas, Consumidas + "hs", Contratadas, Contratadas + "hs");

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "valueAxis",
				'type': "Measure",
				'values': [oConsumidas]
			});

			var feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
				'uid': "categoryAxis",
				'type': "Dimension",
				'values': [oTicket]
			});

			oFrame.addFeed(feedValueAxis);
			oFrame.addFeed(feedCategoryAxis);

		},

		setReferenceLine: function (oFrame, valorRef, textoRef, valorTope, textoTope) {
			oFrame.setVizProperties({
				plotArea: {
					referenceLine: {
						line: {
							valueAxis: [{
								value: valorRef,
								visible: true,
								label: {
									text: textoRef,
									background: "sapUiPositiveElement",
									visible: true
								},
								color: "sapUiPositiveElement"
							}, {
								value: valorTope,
								visible: true,
								label: {
									text: textoTope,
									background: "sapUiNeutralElement",
									visible: true
								},
								color: "sapUiNeutralElement"
							}]
						}
					}
				}
			});

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
		onConfirm: function () {
			this.applyFilters();
			this._oViewSettingsDialog.close();

		},

		onClose: function () {
			this._oViewSettingsDialog.close();
		},

		applyFilters: function () {

		},

		_initFilterView: function () {
			if (!this._oViewSettingsDialog) {
				this._oViewSettingsDialog = sap.ui.xmlfragment("FilterDialogFragment", "com.softtek.Chart.view.filtros", this);
				this.getView().addDependent(this._oViewSettingsDialog);
				this._oFiltros = {
					iLados: [],
					Lados: [],
					iPrioridades: [],
					Prioridades: [],
					itemsMeses: [],
					itemsAnios: []
				};
				this.cargarMeses();
				this.cargarAños();

			}
		},
		cargarAños: function () {
			var añoAct = new Date().getFullYear();
			var año = añoAct - 10;
			var index = 0;
			do {
				index = index + 1;
				this._oFiltros.itemsAnios.push({
					key: index,
					value: añoAct
				});
				añoAct = añoAct - 1;
			} while (año !== añoAct);
		},

		cargarMeses: function () {

			this._oFiltros.itemsMeses = [{
				key: "01",
				value: "Enero"
			}, {
				key: "02",
				value: "Febrero"
			}, {
				key: "03",
				value: "Marzo"
			}, {
				key: "04",
				value: "Abril"
			}, {
				key: "05",
				value: "Mayo"
			}, {
				key: "06",
				value: "Junio"
			}, {
				key: "07",
				value: "Julio"
			}, {
				key: "08",
				value: "Agosto"
			}, {
				key: "09",
				value: "Septiembre"
			}, {
				key: "10",
				value: "Octubre"
			}, {
				key: "11",
				value: "Noviembre"
			}, {
				key: "12",
				value: "Diciembre"

			}];
		},

		mensaje: function () {
			sap.m.MessageBox.show("blabla");

		}
	});
});