function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZSM_ANALYTICS_SRV/";
	var oModel = new sap.ui.model.odata.v2.ODataModel(sUrl, false);
	sap.ui.getCore().setModel(oModel);
}