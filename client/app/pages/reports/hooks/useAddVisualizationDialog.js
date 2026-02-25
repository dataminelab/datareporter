import { useState, useCallback, useEffect } from "react";
import useReportFlags from "./useReportFlags";
import useEditVisualizationDialog from "./useEditVisualizationDialog";

export default function useAddVisualizationDialog(report, queryResult, saveReport, onChange) {
  const queryFlags = useReportFlags(report);
  const editVisualization = useEditVisualizationDialog(report, queryResult, onChange);
  const [shouldOpenDialog, setShouldOpenDialog] = useState(false);

  useEffect(() => {
    if (!queryFlags.isNew && shouldOpenDialog) {
      setShouldOpenDialog(false);
      editVisualization();
    }
  }, [queryFlags.isNew, shouldOpenDialog, editVisualization]);

  return useCallback(() => {
    if (queryFlags.isNew) {
      setShouldOpenDialog(true);
      saveReport();
    } else {
      editVisualization();
    }
  }, [queryFlags.isNew, saveReport, editVisualization]);
}
