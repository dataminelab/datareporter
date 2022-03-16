import { extend, get } from "lodash";
import { useCallback } from "react";
import { Report } from "@/services/report";
import notification from "@/services/notification";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useFormatReport(report, syntax, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    Report.format(syntax || "sql", report.report)
      .then(queryText => {
        handleChange(extend(report.clone(), { report: queryText }));
      })
      .catch(error =>
        notification.error(get(error, "response.data.message", "Failed to format report: unknown error."))
      );
  }, [report, syntax, handleChange]);
}
