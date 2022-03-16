import { useCallback } from "react";
import useUpdateReport from "./useUpdateReport";
import recordEvent from "@/services/recordEvent";

export default function useChangeColorsReport(report, onChange) {
  const updateReport = useUpdateReport(report, onChange);

  return useCallback(
    (type, value) => {
      recordEvent("edit_color", "report", report.id);
      const changes = { [type]: value };
      const options = {
        successMessage: "Report color report edited."
      };

      updateReport(changes, options);
    },
    [report.id, updateReport]
  );
}
