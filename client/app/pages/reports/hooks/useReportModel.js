import { filter, find, toString } from "lodash";
import { useState, useMemo, useEffect } from "react";
import Model from "@/services/model";

export default function useReportModels(report) {
  const [allModels, setAllModels] = useState([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const models = useMemo(() => filter(allModels, ds => !ds.view_only || ds.id === report.data_source_id), [
    allModels,
    report.data_source_id,
  ]);
  const model = useMemo(
    () => find(models, ds => toString(ds.id) === toString(report.data_source_id)) || null,
    [report.data_source_id, models]
  );

  useEffect(() => {
    let cancelModelLoading = false;
    if (report.data_source_id) {
      Model.query({data_source: report.data_source_id}).then(data => {
        if (!cancelModelLoading) {
          setModelsLoaded(true);
          setAllModels(data);
        }
      });
    }
    return () => {
      cancelModelLoading = true;
    };
  }, [report]);

  return useMemo(() => ({ modelsLoaded, models, model }), [modelsLoaded, models, model]);
}
