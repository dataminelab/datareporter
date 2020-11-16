import { find } from "lodash";
import { useCallback } from "react";
import EmbedReportDialog from "@/components/reports/EmbedReportDialog";

export default function useEmbedDialog(report) {
  console.log(report)
  return useCallback(
    () => {
      EmbedReportDialog.showModal({ report });
    },
    [report]
  );
}
