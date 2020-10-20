import { find } from "lodash";
import { useCallback } from "react";
import EmbedReportDialog from "@/components/reports/EmbedReportDialog";

export default function useEmbedDialog(report) {
  return useCallback(
    (unusedReport, visualizationId) => {
      const visualization = find(report.visualizations, { id: visualizationId });
      EmbedReportDialog.showModal({ report, visualization });
    },
    [report]
  );
}
