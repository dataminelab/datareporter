import { useState, useMemo } from "react";
import useUpdateReport from "./useUpdateReport";
import useSaveReport from "./useSaveReport";
import navigateTo from "@/components/ApplicationArea/navigateTo";

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
      expression: report.expression || report.hash,
      color_1: report.color_1,
      color_2: report.color_2,
    }
    useSaveReport(data);
  };

  return useMemo(
    () => ({
      report,
      setReport,
      isDirty: report.report !== originalReportSource,
      saveReport: () => updateReport(),
      saveAsReport: (name) => saveAsReport(name),
    }),
    [report, originalReportSource, updateReport]
  );
}
