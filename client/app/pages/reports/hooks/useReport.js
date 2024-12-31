import { useState, useMemo, useCallback } from "react";
import { extend, get } from "lodash";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import ShareReportDialog from "../components/ShareReportDialog";
import useUpdateReport, { SaveReportError } from "./useUpdateReport";
import notification from "@/services/notification";
import { Report } from "@/services/report";

export default function useReport(originalReport) {
  const [report, setReport] = useState(originalReport);
  const [originalReportSource, setOriginalReportSource] = useState(originalReport.report);

  const updateReport = useUpdateReport(report, updatedReport => {
    // It's important to update URL first, and only then update state
    if (updatedReport.id !== report.id) {
      // Don't reload page when saving new report
      navigateTo(updatedReport.getUrl(true), true);
    }
    setReport(updatedReport);
    setOriginalReportSource(updatedReport.report);
  });

  const saveReport = (data) => {
    if (!data) return;

    return Report.saveAs(data)
      .then(() => {
        navigateTo("/reports");
        notification.success(`Report saved as ${data.name}`);
      })
      .catch((error) => {
        if (get(error, "response.status") === 400) {
          let message = get(error, "response.data.message");
          return Promise.reject(new SaveReportError(message));
        }
        return Promise.reject(new SaveReportError("Report could not be saved"));
      });
  }


  const saveAsReport = (name) => {
    delete report.id;
    const data = {
      name: name,
      model_id: report.model_id,
      expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2) || report.hash || report.expression,
      color_1: report.color_1,
      color_2: report.color_2,
      data_source_id: report.data_source_id,
    }
    saveReport(data);
  };

  const showShareReportDialog = useCallback(() => {
    const handleDialogClose = () => setReport(currentReport => extend({}, currentReport, { is_draft: false }));

    ShareReportDialog.showModal({
      report,
      hasOnlySafeQueries: true,
    })
      .onClose(handleDialogClose)
      .onDismiss(handleDialogClose);
  }, [report]);

  return useMemo(
    () => ({
      report,
      setReport,
      isDirty: report.report !== originalReportSource,
      saveReport: () => updateReport(),
      saveAsReport,
      showShareReportDialog,
    }),
    [report, originalReportSource, updateReport]
  );
}
