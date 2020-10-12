import { find } from "lodash";
import { useCallback } from "react";
import AddToDashboardDialog from "@/components/reports/AddToDashboardDialog";

export default function useAddToDashboardDialog(report) {
  return useCallback(
    visualizationId => {
      const visualization = find(report.visualizations, { id: visualizationId });
      AddToDashboardDialog.showModal({ visualization });
    },
    [report.visualizations]
  );
}
