import { isArray, intersection } from "lodash";
import { useCallback } from "react";
import ScheduleDialog from "@/components/reports/ScheduleDialog";
import { clientConfig } from "@/services/auth";
import { policy } from "@/services/policy";
import useUpdateReport from "./useUpdateReport";
import useReportFlags from "./useReportFlags";
import recordEvent from "@/services/recordEvent";

export default function useEditScheduleDialog(report, onChange) {
  // We won't use flags that depend on data source
  const queryFlags = useReportFlags(report);

  const updateReport = useUpdateReport(report, onChange);

  return useCallback(() => {
    if (!queryFlags.canEdit || !queryFlags.canSchedule) {
      return;
    }

    const intervals = clientConfig.queryRefreshIntervals;
    const allowedIntervals = policy.getReportRefreshIntervals();
    const refreshOptions = isArray(allowedIntervals) ? intersection(intervals, allowedIntervals) : intervals;

    ScheduleDialog.showModal({
      schedule: report.schedule,
      refreshOptions,
    }).onClose(schedule => {
      recordEvent("edit_schedule", "report", report.id);
      updateReport({ schedule });
    });
  }, [report.id, report.schedule, queryFlags.canEdit, queryFlags.canSchedule, updateReport]);
}
