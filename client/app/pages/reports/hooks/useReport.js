import { useState, useMemo, useCallback } from "react";
import { extend } from "lodash";
import useUpdateReport from "./useUpdateReport";
import useSaveReport from "./useSaveReport";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import ShareReportDialog from "../components/ShareReportDialog";
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

  const saveAsReport = (name) => {
    delete report.id;
    const data = {
      name: name,
      model_id: report.model_id,
      expression: window.location.hash.substring(window.location.hash.indexOf("4/") + 2) || report.hash || report.expression,
      color_1: report.color_1,
      color_2: report.color_2,
    }
    useSaveReport(data);
  };

  const showShareReportDialog = useCallback(() => {
    const handleDialogClose = () => setReport(currentReport => extend({}, currentReport, { is_draft: false }));

    ShareReportDialog.showModal({
      report,
      hasOnlySafeQueries:true,
    })
      .onClose(handleDialogClose)
      .onDismiss(handleDialogClose);
  }, [report]);

  const doDeleteReport = (report) => {
    // use this for delete submissions
    return Report.delete({ id: report.id })
      .then(() => {
        notification.success("Report Deleted.");
        // clear saved meta price data
        localStorage.removeItem(`${window.location.pathname}-proceed_data`);
        localStorage.removeItem(`${window.location.pathname}-price`);

        return extend(report.clone(), { is_archived: true, schedule: null });
      })
      .catch(error => {
        notification.error("Report could not be deleted.");
        return Promise.reject(error);
      });
  }

  return useMemo(
    () => ({
      report,
      setReport,
      isDirty: report.report !== originalReportSource,
      saveReport: () => updateReport(),
      saveAsReport: (name) => saveAsReport(name),
      deleteReport: (report) => doDeleteReport(report),
      showShareReportDialog,
    }),
    [report, originalReportSource, updateReport]
  );
}
