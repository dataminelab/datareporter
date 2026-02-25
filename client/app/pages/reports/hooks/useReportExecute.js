import { useReducer, useEffect, useRef } from "react";
import location from "@/services/location";
import recordEvent from "@/services/recordEvent";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

// TODO add this into logic where we trigger ajax calls
function getMaxAge() {
  const { maxAge } = location.search;
  return maxAge !== undefined ? maxAge : -1;
}

const reducer = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

export default function useReportExecute(report) {
  const [executionState, setExecutionState] = useReducer(reducer, {
    // reportResult: null, // this is actually being pull from ajax.ts file
    isExecuting: false,
    loadedInitialResults: false,
    executionStatus: null,
    isCancelling: false,
    cancelCallback: null,
    error: null,
  });

  const triggerExecution = useImmutableCallback(async (data) => {
    report.setExecutionStatus(data.status);
    setExecutionState({
      ...data,
      isExecuting: data.isExecuting,
      executionError: null,
      executionStatus: data.status,
      cancelCallback: () => {
        recordEvent("cancel_execute", "report", report.id);
        setExecutionState({
          isCancelling: true,
          executionStatus: "cancelling",
          isExecutionCancelling: false,
        });
      },
      error:
        typeof data.error === "object" && data.error !== null
          ? data.error.message || data.error.toString()
          : data.error,
    });
  });

  const reportRef = useRef(report);
  reportRef.current = report;

  useEffect(() => {
    setExecutionState({
      loadedInitialResults: true,
      cancelCallback: () => {
        recordEvent("cancel_execute", "report", report.id);
        setExecutionState({
          isCancelling: true,
          executionStatus: "cancelling",
          isExecutionCancelling: false,
        });
      },
    });
    report.setExecutionStatus("processing");
  }, []);

  return { ...executionState, triggerExecution };
}
