import { isNil, isEmpty } from "lodash";
import { useMemo } from "react";
import { currentUser } from "@/services/auth";

export default function useReportFlags(report, dataSource = null) {
  dataSource = dataSource || { view_only: true };

  return useMemo(
    () => ({
      // state flags
      isNew: isNil(report.id),
      isDraft: report.is_draft,
      isArchived: report.is_archived,

      // permissions flags
      canCreate: currentUser.hasPermission("create_query"),
      canView: currentUser.hasPermission("view_query"),
      canEdit: currentUser.hasPermission("edit_query") && report.can_edit,
      canViewSource: currentUser.hasPermission("view_source"),
      canExecute:
        !isEmpty(report.report) &&
        (report.is_safe || (currentUser.hasPermission("execute_query") && !dataSource.view_only)),
      canFork: currentUser.hasPermission("edit_query") && !dataSource.view_only,
      canSchedule: currentUser.hasPermission("schedule_query"),
    }),
    [report, dataSource.view_only]
  );
}
