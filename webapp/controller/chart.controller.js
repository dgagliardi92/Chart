sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	'sap/ui/model/Filter',
	'sap/ui/model/FilterOperator',
	'sap/viz/ui5/format/ChartFormatter',
	'sap/ui/core/util/Export',
	'sap/ui/core/util/ExportTypeCSV',
	'sap/m/MessageBox'
], function (Controller, JSONModel, Filter, FilterOperator, ChartFormatter, Export, ExportTypeCSV, MessageBox) {
	"use strict";

	return Controller.extend("com.softtek.Chart.controller.chart", {

		onInit: function () {

			this.dialog = new sap.m.BusyDialog({
				id: 'dialog',
				text: 'Cargando...'
			});

			this.dialog.open();

			this.byId("iconTabBar").setModel(this.getOwnerComponent().getModel("Totales"));

		},

		onBeforeRendering: function (oEvent) {

			this._initFilterView();

		},

		OKAbonoSet: function (oData, oPeriodo) {
			
			var Tickets = new sap.ui.model.json.JSONModel(oData.results);
			var oticket = Tickets.getProperty("/0/");

			if (oticket === undefined) {
				oticket = {
					Consumido: 0,
					AbonoReal: 0
				};
			}

			var oTitle = "Abono : " + oticket.AbonoReal + " hs. - " + String(oPeriodo).substring(0, 2) + "." + String(oPeriodo).substring(2);
			this.getView().byId("Cont1").setTitle(oTitle);

			var Restante = oticket.AbonoReal - oticket.Consumido;
			var tRestante = parseFloat(Restante).toFixed(2);

			//var Consumido = Math.fround(oticket.Consumido).toFixed(2);
			//var Consumido = oticket.Consumido.toFixed(2);
			var Consumido = parseFloat(oticket.Consumido).toFixed(2);

			var tConsumido = String(Consumido);

			var oModel = new JSONModel({
				'Consumo': [{
					nombre: "Consumido: " + tConsumido + " hs",
					valor: Consumido
				}, {
					nombre: "Restante: " + tRestante + " hs",
					valor: Restante.toFixed(2)
				}]
			});
			this.getView().byId("barTickets").setModel(oModel);

			//var oPorc = oticket.Consumido * 100 / oticket.AbonoReal;
			//var tPorcentaje = Math.floor(oPorc.toFixed(2));
			//var oTextoRef = oticket.Consumido + " hs " + " - " + tPorcentaje + "%";

			//this.getView().byId("barTickets").setTitle("Abono real: " + oticket.AbonoReal + "hs. - Consumido: " + oticket.AbonoReal + "hs");

			//this.setReferenceLine(this.getView().byId("barTickets"),
			//	oticket.Consumido, oTextoRef, oticket.AbonoReal, oticket.AbonoReal +
			//	"hs");

		},

		onAfterRendering: function () {},

		cargartotales: function (oEvent) {

			var oModel = this.getOwnerComponent().getModel("Tickets");

			var listadoTickets = Object.getOwnPropertyNames(oModel.getProperty("/"));
			var oModelCount = this.byId("iconTabBar").getModel();
			
			
			var oPeriodo = sap.ui.core.Fragment.byId("FilterDialogFragment", "Periodo").getSelectedKey();

			var aFilters = [];
			this.cargarFiltro(aFilters, "Periodo");

			//Busco el abono del cliente
			oModel.read("/AbonoSet", {
				filters: aFilters,
				success: jQuery.proxy(function (oData, Response) {
					this.OKAbonoSet(oData, oPeriodo);
				}, this),
				error: function (oEventError) {}
			});

			var oModelLados = {
				Cliente: 0,
				Softtek: 0,
				Otros: 0
			};

		

			if (listadoTickets instanceof Array) {
				var clear = true;
				listadoTickets.forEach(jQuery.proxy(function (element) {

					var oTicket = oModel.getProperty("/".concat([element], "/"));
					if (oTicket.Estado !== undefined) {
						this.contarPorEstado(oTicket, oModelCount, clear);
						this.contarPorLado(oTicket, oModelLados);
						this.acumularFiltros(oTicket, this._oFiltros, clear);
						clear = false;
					}
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

			this.getView().byId("pie").setModel(new sap.ui.model.json.JSONModel(this._oFiltros));


			//Cargo el modelo Totales
			this.getView().byId("iconTabBar").setModel(oModelCount2, "Totales");

			this.dibujarBarra(oModelLados);

			this.dialog.close();
		},

		acumularFiltros: function (oTicket, oFiltros, vClear) {

			if (vClear) {
				oFiltros.Prioridades = [];
				oFiltros.iPrioridades = [];
			}

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

			var index = oFiltros.iPrioridades.indexOf(oTicket.Prioridad);

			if (index < 0) {
				if (oFiltros.iPrioridades.lenght === undefined)
					vindex = 1;
				else
					vindex = oFiltros.iPrioridades.lenght + 1;

				oFiltros.iPrioridades.push(oTicket.Prioridad);
				oFiltros.Prioridades.push({
					nombre: oTicket.Prioridad,
					index: vindex,
					cont: 1
				});
			} else {
				oFiltros.Prioridades[index].cont = Number(oFiltros.Prioridades[index].cont) + 1;
			}

		},

		download: sap.m.Table.prototype.exportData || function () {

			var oModel = this.getOwnerComponent().getModel("Tickets");
			var listadoTickets = Object.getOwnPropertyNames(oModel.getProperty("/"));

			if (listadoTickets instanceof Array) {
				var oDatos = {
					Tickets: []
				};

				listadoTickets.forEach(jQuery.proxy(function (element) {
					var oTicket = oModel.getProperty("/".concat([element], "/"));
					oDatos.Tickets.push({
						Ticket: oTicket.Ticket,
						Descripcion: oTicket.Descripcion,
						Estado: oTicket.Estado,
						AgingUltEstadoDias: oTicket.AgingUltEstadoDias,
						AgingCreacionDias: oTicket.AgingCreacionDias
					});
				}));
				var datos = new JSONModel(oDatos);
			}

			var oExport = new Export({
				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: datos,

				rows: {
					path: "/Tickets"
				},

				columns: [{
					name: "Ticket",
					template: {
						content: "{Ticket}"
					}
				}, {
					name: "Descripcion",
					template: {
						content: "{Descripcion}"
					}
				}, {
					name: "Estado",
					template: {
						content: "{Estado}"
					}
				}, {
					name: "Aging Estado",
					template: {
						content: "{AgingUltEstadoDias}"
					}
				}, {
					name: "Aging Creacion Dias",
					template: {
						content: "{AgingCreacionDias}"
					}
				}]
			});
			oExport.saveFile("Tickets").catch(function (oError) {}).then(function () {});
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
			case "Consulta Cliente":
			case "Enviado a SAP/SPS":
			case "Stand By":
				oModelCount.teer = oModelCount.teer + 1;
				break;
			case "Prueba Cliente":
			case "Implementado":
			case "Solución Brindada":
				oModelCount.tpr = oModelCount.tpr + 1;
				break;
			case "En Proceso":
			case "En Análisis":
			case "Propuesta Rechazada":
			case "Propuesta Aprobada":
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
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "En Análisis"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Propuesta Rechazada"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Propuesta Aprobada"));
				break;
			case "teer":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Propuesta Enviada"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Consulta Cliente"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Enviado a SAP/SPS"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Stand By"));
				break;
			case "tpr":
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Prueba Cliente"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Solución Brindada"));
				aFilters.push(new Filter("Estado", FilterOperator.EQ, "Implementado"));
				break;
			}
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);

		},

		clearFilter: function () {

		},

		filtrar: function () {

			this._oViewSettingsDialog.open();

		},

		mapingOData: function (vAbono, vConsumido, oFrame, oType) {
			oFrame.setVizType(oType);

		},

		dibujarBar: function (Consumidas, Contratadas) {

			var oFrame = this.getView().byId("barTickets");

			this.getView().byId("chartContainBarTicket").setTitle("Abono: ");

			var oConsumidas = "Contratadas";
			var oTicket = " ";

			var oModelConsumo = new JSONModel({
				"Consumo": [{
					nombre: "",
					min: Consumidas,
					max: Contratadas
				}]
			});

			var oDataSet = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: oTicket,
					value: "{nombre}"
				}],
				measures: {
					name: oConsumidas,
					value: '{max}'
				},
				data: {
					path: "/Consumo"
				}
			});

			oFrame.setDataset(oDataSet);
			oFrame.setModel(oModelConsumo);
			//oFrame.setVizType("bar");
			oFrame.setVizType("donut");

			oFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						visible: false
					},
					legend: {
						visible: false
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

		onConfirm: function () {
			this.applyFilters();
			this._oViewSettingsDialog.close();

		},

		onClose: function () {
			this._oViewSettingsDialog.close();
		},

		applyFilters: function () {

			var aFilters = [];
			//this.cargarFiltro(aFilters,"Periodo");
			this.cargarFiltro(aFilters, "Prioridad");
			this.cargarFiltro(aFilters, "Lado");

			var oTable = this.getView().byId("Table");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters);

		},
		cargarFiltro: function (Filtros, Campo) {
			var oValor = sap.ui.core.Fragment.byId("FilterDialogFragment", Campo).getSelectedKey();
			if (oValor !== "")
				Filtros.push(new Filter(Campo, FilterOperator.EQ, oValor));
		},
		clearFiltro: function (Filtros, Campo) {
			var oValor = sap.ui.core.Fragment.byId("FilterDialogFragment", Campo).getSelectedKey();
			if (oValor !== "")
				Filtros.push(new Filter(Campo, FilterOperator.EQ, oValor));
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
					Periodo: [],
					itemsMeses: [],
					itemsAnios: []
				};
				this.cargarPeriodo();

			}
		},

		cargarPeriodo: function () {
			var añoAct = new Date().getFullYear();
			var mesAct = new Date().getMonth() + 1;

			var index = 0;
			var oPeriodo;

			do {
				index = index + 1;
				if (mesAct < 10)
					var periodo = "0" + String(mesAct).concat(String(añoAct));
				else
					periodo = String(mesAct).concat(String(añoAct));

				if (oPeriodo === undefined)
					oPeriodo = periodo;

				var tPeriodo = String(periodo).substring(0, 2) + "." + String(periodo).substring(2);

				this._oFiltros.Periodo.push({
					key: periodo,
					value: tPeriodo
				});

				mesAct = mesAct - 1;
				if (mesAct === 0) {
					mesAct = 12;
					añoAct = añoAct - 1;
				}
			} while (index !== 12);

			sap.ui.core.Fragment.byId("FilterDialogFragment", "Periodo").setSelectedKey(oPeriodo);

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