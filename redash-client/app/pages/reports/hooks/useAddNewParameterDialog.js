import { map } from "lodash";
import { useCallback } from "react";
import EditParameterSettingsDialog from "@/components/EditParameterSettingsDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useAddNewParameterDialog(report, onParameterAdded) {
  const handleParameterAdded = useImmutableCallback(onParameterAdded);

  return useCallback(() => {
    EditParameterSettingsDialog.showModal({
      parameter: {
        title: null,
        name: "",
        type: "text",
        value: null,
      },
      existingParams: map(report.getParameters().get(), p => p.name),
    }).onClose(param => {
      const newReport = report.clone();
      param = newReport.getParameters().add(param);
      handleParameterAdded(newReport, param);
    });
  }, [report, handleParameterAdded]);
}
