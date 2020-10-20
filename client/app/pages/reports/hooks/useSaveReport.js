import React from "react";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import Report from "@/services/reportFake";
import notification from "@/services/notification";

export default function useSaveReport(values) {
  Report.create(values)
    .then(model => {
      navigateTo('/reports')
      notification.success("Saved.");
    });

}
