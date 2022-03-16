import { useCallback } from "react";
import PermissionsEditorDialog from "@/components/PermissionsEditorDialog";

export default function usePermissionsEditorDialog(report) {
  return useCallback(() => {
    PermissionsEditorDialog.showModal({
      aclUrl: `api/reports/${report.id}/acl`,
      context: "report",
      author: report.user,
    });
  }, [report.id, report.user]);
}
