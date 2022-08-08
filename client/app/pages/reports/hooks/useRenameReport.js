import { useCallback } from "react";
import useUpdateReport from "./useUpdateReport";
import recordEvent from "@/services/recordEvent";
import { clientConfig } from "@/services/auth";

export default function useRenameReport(report, onChange) {
  const updateReport = useUpdateReport(report, onChange);
  // this component doesnt work
  // had to write same one for ReportPageHeader.jsx

  return useCallback(
    async name => {
      recordEvent("edit_name", "report", report.id);
      const changes = { name };
      const options = {};

      if (report.is_draft && clientConfig.autoPublishNamedQueries && name !== "New Report") {
        changes.is_draft = false;
        options.successMessage = "Report saved and published";
      }

      updateReport(changes, options);
    },
    [report.id, report.is_draft, updateReport]
  );
}
