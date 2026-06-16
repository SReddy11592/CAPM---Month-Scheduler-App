sap.ui.define([
    "sap/ui/core/format/DateFormat"
], function (DateFormat) {
    "use strict";

    return {

        formatDateTime: function (sValue) {

            if (!sValue) {
                return "";
            }

            var oDate = new Date(sValue);

            return DateFormat.getDateTimeInstance({
                pattern: "dd-MM-yyyy HH:mm"
            }).format(oDate);
        },

        formatDate: function (sDate) {

            if (!sDate || sDate.length !== 8) {
                return "";
            }

            return sDate.substring(6, 8) + "-" +
                sDate.substring(4, 6) + "-" +
                sDate.substring(0, 4);
        },

        formatTime: function (vTime) {

            if (!vTime) {
                return "";
            }

            // Handle Edm.Time object
            if (typeof vTime === "object" && vTime.ms !== undefined) {

                var iTotalMinutes = Math.floor(vTime.ms / 60000);

                var iHours = Math.floor(iTotalMinutes / 60);
                var iMinutes = iTotalMinutes % 60;

                return String(iHours).padStart(2, "0") +
                    ":" +
                    String(iMinutes).padStart(2, "0");
            }

            // Handle duration string PT08H00M00S
            if (typeof vTime === "string") {

                var aMatch = vTime.match(
                    /PT(\d+)H(\d+)M(\d+)S/
                );

                if (aMatch) {

                    return aMatch[1].padStart(2, "0") +
                        ":" +
                        aMatch[2].padStart(2, "0");
                }
            }

            return "";
        }
    };
});