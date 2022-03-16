import { extend, filter, find } from "lodash";
import { useCallback } from "react";
import EditVisualizationDialog from "@/components/visualizations/EditVisualizationDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useEditVisualizationDialog(report, queryResult, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(
    (visualizationId = null) => {
      const visualization = find(report.visualizations, { id: visualizationId }) || null;
      EditVisualizationDialog.showModal({
        report,
        visualization,
        queryResult,
      }).onClose(updatedVisualization => {
        const filteredVisualizations = filter(report.visualizations, v => v.id !== updatedVisualization.id);
        handleChange(
          extend(report.clone(), { visualizations: [...filteredVisualizations, updatedVisualization] }),
          updatedVisualization
        );
      });
    },
    [report, queryResult, handleChange]
  );
}
