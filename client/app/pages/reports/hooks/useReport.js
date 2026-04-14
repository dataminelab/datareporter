import { useState, useMemo, useCallback } from "react";
import { extend, get } from "lodash";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import ShareReportDialog from "../components/ShareReportDialog";
import useUpdateReport, { SaveReportError } from "./useUpdateReport";
import notification from "@/services/notification";
import { Report } from "@/services/report";

export default function useReport(originalReport) {
  const [report, setReport] = useState(originalReport);
  const [originalReportSource, setOriginalReportSource] = useState(
    originalReport.report,
  );

  const updateReport = useUpdateReport(report, updatedReport => {
    // It's important to update URL first, and only then update state
    if (updatedReport.id !== report.id) {
      // Don't reload page when saving new report
      navigateTo(updatedReport.getUrl(true), true);
    }
    setReport(updatedReport);
    setOriginalReportSource(updatedReport.report);
  });

  const saveReport = useCallback(data => {
    if (!data) return;

    return Report.saveAs(data)
      .then(() => {
        navigateTo("/reports");
        notification.success(`Report saved as ${data.name}`);
      })
      .catch(error => {
        if (get(error, "response.status") === 400) {
          const message = get(error, "response.data.message");
          return Promise.reject(new SaveReportError(message));
        }
        return Promise.reject(new SaveReportError("Report could not be saved"));
      });
  }, []);

  const saveAsReport = useCallback(
    name => {
      const reportCopy = extend({}, report);
      delete reportCopy.id;
      const data = {
        name: name,
        model_id: reportCopy.model_id,
        expression:
          window.location.hash.substring(
            window.location.hash.indexOf("4/") + 2,
          ) ||
          reportCopy.hash ||
          reportCopy.expression,
        color_1: reportCopy.color_1,
        color_2: reportCopy.color_2,
        data_source_id: reportCopy.data_source_id,
      };
      saveReport(data);
    },
    [report, saveReport],
  );

  const showShareReportDialog = useCallback(() => {
    const handleDialogClose = () =>
      setReport(currentReport =>
        extend({}, currentReport, { is_draft: false }),
      );

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
    [
      report,
      originalReportSource,
      saveAsReport,
      showShareReportDialog,
      updateReport,
    ],
  );
}
