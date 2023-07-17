import React from "react";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import { get } from "lodash";

export default function useSaveReport(data) {
  return Report.saveAs(data)
    .then(model => {
      navigateTo('/reports')
      notification.success(`Report saved as ${data.name}`);
    })
    .catch(error => {
      if (get(error, "response.status") === 400) {
        let message = get(error, "response.data.message")
        return Promise.reject(new SaveReportError(message));
      }
      return Promise.reject(new SaveReportError("Report could not be saved"));
    })
}
