import { isUndefined } from "lodash";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function useReportParameters(report) {
  const parameters = useMemo(() => report.getParametersDefs(), [report]);
  const [dirtyFlag, setDirtyFlag] = useState(report.getParameters().hasPendingValues());

  const updateDirtyFlag = useCallback(
    flag => {
      flag = isUndefined(flag) ? report.getParameters().hasPendingValues() : flag;
      setDirtyFlag(flag);
    },
    [report]
  );

  useEffect(() => {
    const updatedDirtyParameters = report.getParameters().hasPendingValues();
    if (updatedDirtyParameters !== dirtyFlag) {
      setDirtyFlag(updatedDirtyParameters);
    }
  }, [report, parameters, dirtyFlag]);

  return useMemo(() => [parameters, dirtyFlag, updateDirtyFlag], [parameters, dirtyFlag, updateDirtyFlag]);
}
