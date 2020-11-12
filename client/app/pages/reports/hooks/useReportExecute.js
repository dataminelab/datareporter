import { useReducer, useEffect, useRef } from "react";
import location from "@/services/location";
import recordEvent from "@/services/recordEvent";
import { ExecutionStatus } from "@/services/report-result";
import notifications from "@/services/notifications";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

function getMaxAge() {
  const { maxAge } = location.search;
  return maxAge !== undefined ? maxAge : -1;
}

const reducer = (prevState, updatedProperty) => ({
  ...prevState,
  ...updatedProperty,
});

// This is currently specific to a Report page, we can refactor
// it slightly to make it suitable for dashboard widgets instead of the other solution it
// has in there.
export default function useReportExecute(report) {
  const [executionState, setExecutionState] = useReducer(reducer, {
    queryResult: null,
    isExecuting: false,
    loadedInitialResults: false,
    executionStatus: null,
    isCancelling: false,
    cancelCallback: null,
    error: null,
  });

  const queryResultInExecution = useRef(null);
  // Clear executing queryResult when component is unmounted to avoid errors
  useEffect(() => {
    return () => {
      queryResultInExecution.current = null;
    };
  }, []);

  const executeReport = useImmutableCallback((maxAge = 0, queryExecutor) => {
    let newReportResult;
    if (queryExecutor) {
      newReportResult = queryExecutor();
    } else {
      newReportResult = report.getReportResult(maxAge);
    }

    recordEvent("execute", "report", report.id);
    notifications.getPermissions();

    queryResultInExecution.current = newReportResult;

    setExecutionState({
      updatedAt: newReportResult.getUpdatedAt(),
      executionStatus: newReportResult.getStatus(),
      isExecuting: true,
      cancelCallback: () => {
        recordEvent("cancel_execute", "report", report.id);
        setExecutionState({ isCancelling: true });
        newReportResult.cancelExecution();
      },
    });

    const onStatusChange = status => {
      if (queryResultInExecution.current === newReportResult) {
        setExecutionState({ updatedAt: newReportResult.getUpdatedAt(), executionStatus: status });
      }
    };

    newReportResult
      .toPromise(onStatusChange)
      .then(queryResult => {
        if (queryResultInExecution.current === newReportResult) {
          // TODO: this should probably belong in the ReportEditor page.
          if (queryResult && queryResult.query_result.report === report.report) {
            report.latest_query_data_id = queryResult.getId();
            report.queryResult = queryResult;
          }

          if (executionState.loadedInitialResults) {
            notifications.showNotification("Data reporter", `${report.name} updated.`);
          }

          setExecutionState({
            queryResult,
            loadedInitialResults: true,
            error: null,
            isExecuting: false,
            isCancelling: false,
            executionStatus: null,
          });
        }
      })
      .catch(queryResult => {
        if (queryResultInExecution.current === newReportResult) {
          if (executionState.loadedInitialResults) {
            notifications.showNotification("Data reporter", `${report.name} failed to run: ${queryResult.getError()}`);
          }

          setExecutionState({
            queryResult,
            loadedInitialResults: true,
            error: queryResult.getError(),
            isExecuting: false,
            isCancelling: false,
            executionStatus: ExecutionStatus.FAILED,
          });
        }
      });
  });

  const queryRef = useRef(report);
  queryRef.current = report;

  useEffect(() => {
    // TODO: this belongs on the report page?
    // loadedInitialResults can be removed if so
    if (queryRef.current.hasResult() || queryRef.current.paramsRequired()) {
      executeReport(getMaxAge());
    } else {
      setExecutionState({ loadedInitialResults: true });
    }
  }, [executeReport]);

  return { ...executionState, ...{ executeReport } };
}
