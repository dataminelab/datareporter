import { useCallback } from "react";
import useUpdateReport from "./useUpdateReport";
import recordEvent from "@/services/recordEvent";

export default function useUnpublishReport(report, onChange) {
  const updateReport = useUpdateReport(report, onChange);

  return useCallback(() => {
    recordEvent("toggle_published", "report", report.id);
    updateReport({ is_draft: true });
  }, [report.id, updateReport]);
}
