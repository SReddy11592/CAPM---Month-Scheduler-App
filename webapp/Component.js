sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "scheduler/ui/schedulerui/model/models"
], (UIComponent, Device, models) => {
    "use strict";

    return UIComponent.extend("scheduler.ui.schedulerui.Component", {
        metadata: {
            manifest: "json",
            interfaces: [
                "sap.ui.core.IAsyncContentCreation"
            ]
        },

        init() {
            UIComponent.prototype.init.apply(this, arguments);

            var oModel = new sap.ui.model.odata.v2.ODataModel(
                "/sap/opu/odata/sap/ZMONTH_SCHEDULER_SRV/",
                {
                    useBatch: false
                }
            );

            this.setModel(oModel);

            oModel.metadataLoaded().then(function () {
                console.log("Metadata Loaded Successfully");
            });

            oModel.attachMetadataFailed(function (oEvent) {
                console.error("Metadata Failed", oEvent);
            });

            this.setModel(models.createDeviceModel(), "device");

            this.getRouter().initialize();
        }
    });
});