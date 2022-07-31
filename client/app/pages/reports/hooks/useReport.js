import { useState, useMemo } from "react";
import useUpdateReport from "./useUpdateReport";
import navigateTo from "@/components/ApplicationArea/navigateTo";

export default function useReport(originalReport) {
  const [report, setReport] = useState(originalReport);
  const [originalReportSource, setOriginalReportSource] = useState(originalReport.report);
  console.log("originalReport:useReport:report", report)

  const updateReport = useUpdateReport(report, updatedReport => {
    // It's important to update URL first, and only then update state
    if (updatedReport.id !== report.id) {
      // Don't reload page when saving new report
      navigateTo(updatedReport.getUrl(true), true);
    }
    console.log("in updateReport report", report)
    console.log("in updateReport updatedReport", updatedReport)
    setReport(updatedReport);
    setOriginalReportSource(updatedReport.report);
  });

  return useMemo(
    () => ({
      report,
      setReport,
      isDirty: report.report !== originalReportSource,
      saveReport: () => updateReport(),
    }),
    [report, originalReportSource, updateReport]
  );
}
