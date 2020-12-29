import { filter, find, toString } from "lodash";
import {useState, useMemo, useEffect, useCallback} from "react";
import Model from "@/services/model";

export default function useReportModel(report) {
  const [allModels, setAllModels] = useState([]);
  const [modelLoaded, setModelsLoaded] = useState(false);
  const models = useMemo(() => filter(allModels, ds => !ds.view_only || ds.id === report.modelId), [
    allModels,
    report.modelId,
  ]);
  console.log('models', allModels)
  console.log('report', report)
  const model = useMemo(
    () => find(models, ds => toString(ds.id) === toString(report.modelId)) || null,
    [report.modelId, models]
  );

  const getModels = useCallback((dataSourceId) => {
    if (dataSourceId) {
      let cancelModelLoading = false;
      Model.getByDataSource(dataSourceId).then(data => {
        if (!cancelModelLoading) {
          setModelsLoaded(true);
          setAllModels(data);
        }
      });
    }


    return () => {
      cancelModelLoading = true;
    };
  }, []);

  return useMemo(() => ({ getModels, modelLoaded, models, model }), [getModels, modelLoaded, models, model]);
}
