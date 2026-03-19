import { filter } from "lodash";
import { useState, useMemo, useEffect } from "react";
import DataSource from "@/services/data-source";

export default function useReportDataSources(report) {
  const [allDataSources, setAllDataSources] = useState([]);
  const [dataSourcesLoaded, setDataSourcesLoaded] = useState(false);
  const dataSources = useMemo(
    () =>
      filter(
        allDataSources,
        ds => !ds.view_only || ds.id === report.data_source_id,
      ),
    [allDataSources, report.data_source_id],
  );
  const dataSource = useMemo(() => {
    if (!Array.isArray(dataSources)) return null;
    return dataSources.find(ds => {
      const dsId = String(ds.id);
      const reportId = String(report?.data_source_id);
      return dsId === reportId;
    }) || null;
  }, [report?.data_source_id, dataSources]);

  useEffect(() => {
    let cancelDataSourceLoading = false;
    DataSource.query().then(data => {
      if (!cancelDataSourceLoading) {
        setDataSourcesLoaded(true);
        setAllDataSources(data);
      }
    });

    return () => {
      cancelDataSourceLoading = true;
    };
  }, []);

  return useMemo(
    () => ({ dataSourcesLoaded, dataSources, dataSource }),
    [dataSourcesLoaded, dataSources, dataSource],
  );
}
