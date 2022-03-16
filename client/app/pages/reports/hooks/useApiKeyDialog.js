import { useCallback } from "react";
import ApiKeyDialog from "@/components/reports/ApiKeyDialog";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function useApiKeyDialog(report, onChange) {
  const handleChange = useImmutableCallback(onChange);

  return useCallback(() => {
    ApiKeyDialog.showModal({ report }).onClose(handleChange);
  }, [report, handleChange]);
}
