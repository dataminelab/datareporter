import { useCallback } from "react";
import useUpdateReport from "./useUpdateReport";
import recordEvent from "@/services/recordEvent";

export default function useUpdateReportDescription(report, onChange) {
  const updateReport = useUpdateReport(report, onChange);

  return useCallback(
    description => {
      recordEvent("edit_description", "report", report.id);
      updateReport({ description });
    },
    [report.id, updateReport]
  );
}
