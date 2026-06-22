
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "scheduler/ui/schedulerui/model/formatter",
    "sap/ui/export/Spreadsheet"
],
    function (
        Controller,
        JSONModel,
        MessageBox,
        MessageToast,
        formatter,
        Spreadsheet
    ) {
        "use strict";
        return Controller.extend(
            "scheduler.ui.schedulerui.controller.View1",
            {
                formatter: formatter,
                onInit: function () {

                    this.getView().setModel(
                        new sap.ui.model.json.JSONModel({
                            salesCount: 0,
                            productionCount: 0,
                            executedCount: 0,
                            pendingCount: 0
                        }),
                        "statsModel"
                    );

                    this.getView().setModel(
                        new sap.ui.model.json.JSONModel({
                            months: []
                        }),
                        "treeModel"
                    );

                    this.getView().setModel(
                        new sap.ui.model.json.JSONModel({}),
                        "detailModel"
                    );

                    this.getView().setModel(
                        new sap.ui.model.json.JSONModel({}),
                        "poDetailModel"
                    );

                    this.getView().setModel(
                        new sap.ui.model.json.JSONModel({
                            orders: []
                        }),
                        "productionModel"
                    );

                    this._loadSalesOrders();
                    this._loadProductionOrders();
                },

                _loadSalesOrders: function () {

                    var oModel =
                        this.getOwnerComponent().getModel();

                    oModel.read("/SalesOrderTypeSet", {

                        success: function (oData) {
                            console.log("SubbaReddy");

                            this._salesOrders =
                                oData.results;

                            this._buildMonthTree();

                        }.bind(this)

                    });

                },
                _buildMonthTree: function () {

                    if (!this._salesOrders) {
                        return;
                    }

                    var aPO = this._productionOrders || [];
                    var aMonths = [];

                    for (var i = 1; i <= 12; i++) {

                        var sMonth =
                            String(i).padStart(2, "0");

                        var aOrders =
                            this._salesOrders.filter(function (o) {
                                return Number(o.MonthID) === i;
                            });

                        aMonths.push({
                            title:
                                sMonth +
                                " " +
                                this._getMonthName(i) +
                                " (" +
                                aOrders.length +
                                ")",

                            nodes: aOrders.map(function (oSO) {

                                var bExecuted = aPO.some(function (oPO) {
                                    return oPO.SalesOrder === oSO.SalesOrder;
                                });

                                return {
                                    title: bExecuted
                                        ? "🟢 " + oSO.SalesOrder + " (Executed)"
                                        : oSO.SalesOrder,
                                    data: oSO
                                };

                            })
                        });
                    }

                    this.getView()
                        .getModel("treeModel")
                        .setProperty("/months", aMonths);

                    this._updateStatistics();
                },

                _loadProductionOrders: function () {

                    var oModel = this.getOwnerComponent().getModel();

                    oModel.read("/ProductionOrderTypeSet", {

                        success: function (oData) {

                            this._productionOrders =
                                oData.results;

                            this.getView()
                                .getModel("productionModel")
                                .setProperty(
                                    "/orders",
                                    oData.results
                                );

                            this._updateStatistics();
                            this._buildMonthTree();

                        }.bind(this)

                    });

                },

                success: function (oData) {

                    this._productionOrders = oData.results;

                    this.getView()
                        .getModel("productionModel")
                        .setProperty("/orders", oData.results);

                    this._buildMonthTree();

                    this._updateStatistics();

                }.bind(this),

                _updateStatistics: function () {

                    var iSales =
                        this._salesOrders ?
                            this._salesOrders.length : 0;

                    var iProduction =
                        this._productionOrders ?
                            this._productionOrders.length : 0;

                    var iExecuted =
                        this._productionOrders ?
                            this._productionOrders.filter(function (o) {
                                return o.Status === "Executed";
                            }).length : 0;

                    this.getView()
                        .getModel("statsModel")
                        .setData({

                            salesCount: iSales,

                            productionCount: iProduction,

                            executedCount: iExecuted,

                            pendingCount:
                                iSales - iExecuted

                        });

                },

                // _loadTree: async function () {
                //     var oModel = this.getOwnerComponent().getModel();
                //     try {
                //         const aMonthsContext =
                //             await oModel.bindList("/Months").requestContexts();
                //         const aSalesContext =
                //             await oModel.bindList("/SalesOrders").requestContexts();
                //         const aOrders =
                //             aSalesContext.map(o => o.getObject());
                //         const grouped = this._groupByMonth(aOrders);
                //         this.getView()
                //             .getModel("treeModel")
                //             .setProperty("/months", grouped);
                //         this._updateStatistics();
                //     }
                //     catch (error) {
                //         console.log(error);
                //     }
                // },

                _getMonthName: function (iMonth) {

                    return [

                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December"

                    ][iMonth - 1];

                },

                _groupByMonth: function (data) {
                    let result = [];
                    for (let m = 1; m <= 12; m++) {
                        let sMonth = String(m).padStart(2, "0");
                        let filtered = data.filter(x => x.MonthID === sMonth);
                        result.push({
                            MonthID: sMonth,
                            displayText:
                                `${sMonth} ${this._getMonthName(m)} (${filtered.length})`,
                            title:
                                `${sMonth} ${this._getMonthName(m)} (${filtered.length})`,
                            orderCount: filtered.length,
                            nodes: filtered.map(s => {

                                const aPO =
                                    this.getView()
                                        .getModel("productionModel")
                                        .getProperty("/orders") || [];

                                const bExecuted =
                                    aPO.some(
                                        p =>
                                            p.SalesOrder ===
                                            s.SalesOrder
                                    );

                                return {
                                    title:
                                        bExecuted
                                            ? "🟢 " + s.SalesOrder
                                            : s.SalesOrder,
                                    executed: bExecuted,
                                    data: s
                                };

                            })
                        });
                    }
                    return result;
                },

                onNodePress: function (oEvent) {

                    var oNode =
                        oEvent.getSource()
                            .getBindingContext("treeModel")
                            .getObject();

                    if (!oNode.data) {
                        return;
                    }

                    var oExisting =
                        this._isSalesOrderProcessed(
                            oNode.data.SalesOrder
                        );

                    if (oExisting) {

                        MessageBox.error(
                            "Sales Order " +
                            oNode.data.SalesOrder +
                            " already executed.\n\n" +
                            "Production Order : " +
                            oExisting.ProductionOrder
                        );

                        return;
                    }

                    this._loadCalendar(
                        oNode.data
                    );

                    MessageBox.confirm(

                        "Execute Production Order ?",

                        {

                            actions: [
                                "Execute",
                                "Cancel"
                            ],

                            onClose: function (sAction) {

                                if (sAction === "Execute") {

                                    this._createProductionOrder(
                                        oNode.data
                                    );

                                }

                            }.bind(this)

                        }

                    );

                },

                _convertTime: function (vTime) {

                    if (!vTime) {
                        return {
                            hour: 0,
                            minute: 0
                        };
                    }

                    if (typeof vTime === "object" && vTime.ms !== undefined) {

                        var iTotalMinutes = Math.floor(vTime.ms / 60000);

                        return {
                            hour: Math.floor(iTotalMinutes / 60),
                            minute: iTotalMinutes % 60
                        };
                    }

                    if (typeof vTime === "string") {

                        var aMatch = vTime.match(
                            /PT(\d+)H(\d+)M/
                        );

                        if (aMatch) {

                            return {
                                hour: parseInt(aMatch[1], 10),
                                minute: parseInt(aMatch[2], 10)
                            };
                        }
                    }

                    return {
                        hour: 0,
                        minute: 0
                    };
                },

                _loadCalendar: function (oSO) {

                    console.log("Date:", oDate);
                    console.log("Start:", oStart);
                    console.log("End:", oEnd);
                    console.log("Detail payload:", {
                        SalesOrder: oSO.SalesOrder,
                        startDate: oStart
                    });

                    console.log("Selected Order:", oSO);

                    var oFrom = this._convertTime(oSO.FromTime);
                    var oTo = this._convertTime(oSO.ToTime);

                    var oDate = oSO.Date;

                    if (!(oDate instanceof Date)) {
                        oDate = new Date(oDate);
                    }

                    var oStart = new Date(
                        oDate.getFullYear(),
                        oDate.getMonth(),
                        oDate.getDate(),
                        oFrom.hour,
                        oFrom.minute
                    );

                    var oEnd = new Date(
                        oDate.getFullYear(),
                        oDate.getMonth(),
                        oDate.getDate(),
                        oTo.hour,
                        oTo.minute
                    );

                    this.getView().getModel("detailModel").setData({

                        SalesOrder: oSO.SalesOrder,
                        Year: oSO.Year,
                        Date: oDate,
                        FromTime: oSO.FromTime,
                        ToTime: oSO.ToTime,

                        startDate: oStart,

                        rows: [{
                            title: oSO.SalesOrder,

                            appointments: [{
                                title: oSO.SalesOrder,

                                text:
                                    this.formatter.formatTime(oSO.FromTime) +
                                    " - " +
                                    this.formatter.formatTime(oSO.ToTime),

                                startDate: oStart,
                                endDate: oEnd
                            }]
                        }]
                    });
                },

                _createProductionOrder: function (oSO) {

                    var oModel = this.getOwnerComponent().getModel();

                    oModel.read("/ProductionOrderTypeSet", {

                        success: function (oData) {

                            var aOrders = oData.results;

                            var bExists = aOrders.some(function (oPO) {
                                return oPO.SalesOrder === oSO.SalesOrder;
                            });

                            if (bExists) {

                                MessageBox.error(
                                    "Sales Order already executed."
                                );

                                return;
                            }

                            var sPO = "PO" + (1001 + aOrders.length);

                            var oPayload = {

                                ProductionOrder: sPO,
                                SalesOrder: oSO.SalesOrder,
                                Year: oSO.Year,
                                MonthID: oSO.MonthID,
                                Date: oSO.Date,
                                FromTime: oSO.FromTime,
                                ToTime: oSO.ToTime,
                                Status: "Executed",
                                CreatedAt: new Date().toISOString()

                            };

                            oModel.create(
                                "/ProductionOrderTypeSet",
                                oPayload,
                                {

                                    success: function () {

                                        MessageToast.show(
                                            "Production Order Created"
                                        );

                                        this._loadProductionOrders();
                                        this._buildMonthTree();

                                    }.bind(this),

                                    error: function () {

                                        MessageBox.error(
                                            "Failed to create Production Order"
                                        );

                                    }

                                }
                            );

                        }.bind(this),

                        error: function () {

                            MessageBox.error(
                                "Failed to load Production Orders"
                            );

                        }

                    });

                },
                _isSalesOrderProcessed: function (sSalesOrder) {

                    var aOrders =
                        this.getView()
                            .getModel("productionModel")
                            .getProperty("/orders") || [];

                    return aOrders.find(
                        o => o.SalesOrder === sSalesOrder
                    );
                },

                onSearchSalesOrder: function (oEvent) {

                    var sValue =
                        oEvent.getParameter("newValue")
                            .toUpperCase();

                    var oTree =
                        this.byId("scheduleTree");

                    var aItems =
                        oTree.getItems();

                    aItems.forEach(function (oItem) {

                        var sTitle =
                            oItem.getTitle()
                                .toUpperCase();

                        oItem.setVisible(
                            sTitle.includes(sValue)
                        );

                    });

                },
                onSearch: function () {

                    var sStatus =
                        this.byId("selStatus").getSelectedKey();

                    var oTable =
                        this.byId("productionTable");

                    var oBinding =
                        oTable.getBinding("items");

                    var aFilters = [];

                    if (sStatus) {

                        aFilters.push(
                            new sap.ui.model.Filter(
                                "Status",
                                sap.ui.model.FilterOperator.EQ,
                                sStatus
                            )
                        );

                    }

                    oBinding.filter(aFilters);

                },
                onProductionSelect: function (oEvent) {

                    var oItem =
                        oEvent.getParameter("listItem");

                    var oData =
                        oItem.getBindingContext(
                            "productionModel"
                        ).getObject();

                    this.getView()
                        .getModel("poDetailModel")
                        .setData(oData);

                },

                onTreeItemPress: function (oEvent) {

                    var oItem = oEvent.getParameter("listItem");

                    if (!oItem) {
                        return;
                    }

                    var oNode = oItem
                        .getBindingContext("treeModel")
                        .getObject();

                    if (!oNode.data) {
                        return;
                    }

                    this._loadCalendar(oNode.data);

                    var oExisting = this._isSalesOrderProcessed(
                        oNode.data.SalesOrder
                    );

                    // NEW CODE
                    this.getView().getModel("poDetailModel").setData(
                        oExisting || {}
                    );

                    if (oExisting) {

                        MessageBox.error(
                            "Sales Order " +
                            oNode.data.SalesOrder +
                            " already executed.\n\n" +
                            "Production Order : " +
                            oExisting.ProductionOrder
                        );

                        return;
                    }

                    MessageBox.confirm(
                        "Execute Production Order?",
                        {
                            actions: [
                                MessageBox.Action.OK,
                                MessageBox.Action.CANCEL
                            ],

                            emphasizedAction: MessageBox.Action.OK,

                            onClose: function (sAction) {

                                if (sAction === MessageBox.Action.OK) {

                                    this._createProductionOrder(
                                        oNode.data
                                    );
                                }

                            }.bind(this)
                        }
                    );
                },
                onDownload: function () {

                    var aData =
                        this.getView()
                            .getModel("productionModel")
                            .getProperty("/orders");

                    var oSpreadsheet =
                        new Spreadsheet({

                            workbook: {

                                columns: [

                                    {
                                        label: "Production Order",
                                        property: "ProductionOrder"
                                    },

                                    {
                                        label: "Sales Order",
                                        property: "SalesOrder"
                                    },

                                    {
                                        label: "Status",
                                        property: "Status"
                                    },

                                    {
                                        label: "Date",
                                        property: "Date"
                                    },

                                    {
                                        label: "From Time",
                                        property: "FromTime"
                                    },

                                    {
                                        label: "To Time",
                                        property: "ToTime"
                                    }

                                ]

                            },

                            dataSource: aData,

                            fileName:
                                "Production_Planning_Report.xlsm"

                        });

                    oSpreadsheet.build();

                }
            });
    });
