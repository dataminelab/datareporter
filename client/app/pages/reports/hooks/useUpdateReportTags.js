import { useCallback } from "react";
import useUpdateReport from "./useUpdateReport";
import recordEvent from "@/services/recordEvent";

export default function useUpdateReportTags(report, onChange) {
  const updateReport = useUpdateReport(report, onChange);

  return useCallback(
    tags => {
      recordEvent("edit_tags", "report", report.id);
      updateReport({ tags });
    },
    [report.id, updateReport]
  );
}
