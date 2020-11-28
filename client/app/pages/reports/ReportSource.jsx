import { find, map, extend, includes } from "lodash";
import React, { useState, useRef, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import { useDebouncedCallback } from "use-debounce";

import useMedia from "use-media";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import recordEvent from "@/services/recordEvent";
import routes from "@/services/routes";

import ReportPageHeader from "./components/ReportPageHeader";
import ReportSourceAlerts from "./components/ReportSourceAlerts";
import wrapReportPage from "./components/wrapReportPage";
import ReportExecutionMetadata from "./components/ReportExecutionMetadata";
import ReportEditor from "./components/ReportEditor";

import { getEditorComponents } from "@/components/reports/editor-components";
import useReport from "./hooks/useReport";
import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useAutocompleteFlags from "./hooks/useAutocompleteFlags";
import useReportExecute from "./hooks/useReportExecute";
import useReportResultData from "@/lib/useReportResultData";
import useReportDataSources from "./hooks/useReportDataSources";
import useReportFlags from "./hooks/useReportFlags";
import useReportParameters from "./hooks/useReportParameters";
import useEditScheduleDialog from "./hooks/useEditScheduleDialog";
import useEditVisualizationDialog from "./hooks/useEditVisualizationDialog";
import useUpdateReport from "./hooks/useUpdateReport";
import useUpdateReportDescription from "./hooks/useUpdateReportDescription";
import useUnsavedChangesAlert from "./hooks/useUnsavedChangesAlert";

import "./ReportSource.less";

function chooseDataSourceId(dataSourceIds, availableDataSources) {
  dataSourceIds = map(dataSourceIds, v => parseInt(v, 10));
  availableDataSources = map(availableDataSources, ds => ds.id);
  return find(dataSourceIds, id => includes(availableDataSources, id)) || null;
}

function ReportSource(props) {
  const { report, setReport, isDirty, saveReport } = useReport(props.report);
  const { dataSourcesLoaded, dataSources, dataSource } = useReportDataSources(report);
  const [schema, setSchema] = useState([]);
  const reportFlags = useReportFlags(report, dataSource);
  const [parameters, areParametersDirty, updateParametersDirtyFlag] = useReportParameters(report);
  const [selectedVisualization, setSelectedVisualization] = useVisualizationTabHandler(report.visualizations);
  const { SchemaBrowser } = getEditorComponents(dataSource && dataSource.type);
  const isMobile = !useMedia({ minWidth: 768 });
  const [colors, setColors] = useState({text: '', body: ''})

  useUnsavedChangesAlert(isDirty);

  const {
    reportResult,
    isExecuting: isReportExecuting,
  } = useReportExecute(report);

  const reportResultData = useReportResultData(reportResult);

  const editorRef = useRef(null);
  const [autocompleteAvailable, autocompleteEnabled, toggleAutocomplete] = useAutocompleteFlags(schema);

  const [handleReportEditorChange] = useDebouncedCallback(reportText => {
    setReport(extend(report.clone(), { report: reportText }));
  }, 100);

  useEffect(() => {
    // TODO: ignore new pages?
    recordEvent("view_source", "report", report.id);
  }, [report.id]);

  useEffect(() => {
    document.title = report.name;
  }, [report.name]);

  const updateReport = useUpdateReport(report, setReport);
  const updateReportDescription = useUpdateReportDescription(report, setReport);

  const handleDataSourceChange = useCallback(
    dataSourceId => {
      if (dataSourceId) {
        try {
          localStorage.setItem("lastSelectedDataSourceId", dataSourceId);
        } catch (e) {
          // `localStorage.setItem` may throw exception if there are no enough space - in this case it could be ignored
        }
      }
      if (report.data_source_id !== dataSourceId) {
        recordEvent("update_data_source", "report", report.id, { dataSourceId });
        const updates = {
          data_source_id: dataSourceId,
          latest_report_data_id: null,
          latest_report_data: null,
        };
        setReport(extend(report.clone(), updates));
        updateReport(updates, { successMessage: null }); // show message only on error
      }
    },
    [report, setReport, updateReport]
  );

  useEffect(() => {
    // choose data source id for new reports
    if (dataSourcesLoaded && reportFlags.isNew) {
      const firstDataSourceId = dataSources.length > 0 ? dataSources[0].id : null;
      handleDataSourceChange(
        chooseDataSourceId(
          [report.data_source_id, localStorage.getItem("lastSelectedDataSourceId"), firstDataSourceId],
          dataSources
        )
      );
    }
  }, [report.data_source_id, reportFlags.isNew, dataSourcesLoaded, dataSources, handleDataSourceChange]);

  const editSchedule = useEditScheduleDialog(report, setReport);


  const handleSchemaItemSelect = useCallback(schemaItem => {
    if (editorRef.current) {
      editorRef.current.paste(schemaItem);
    }
  }, []);


  const editVisualization = useEditVisualizationDialog(report, reportResult, newReport => setReport(newReport));

  return (
    <div className={cx("report-page-wrapper", { "report-fixed-layout": !isMobile })}>
      <ReportSourceAlerts report={report} dataSourcesAvailable={!dataSourcesLoaded || dataSources.length > 0} />
      <div className="container w-100 p-b-10">
        <ReportPageHeader
          report={report}
          dataSource={dataSource}
          sourceMode
          selectedVisualization={selectedVisualization}
          onChange={setReport}
        />
      </div>
      <main className="report-fullscreen">
        <div className="content turnilo-widget report-widget ">
          <div className="flex-fill p-relative">
            <div
              className="p-absolute d-flex flex-column p-l-15 p-r-15"
              style={{ left: 0, top: 0, right: 0, bottom: 0, overflow: "auto" }}>
              <ReportEditor />
            </div>
          </div>
          {reportResult && !reportResult.getError() && (
            <div className="bottom-controller-container">
              <ReportExecutionMetadata
                report={report}
                reportResult={reportResult}
                selectedVisualization={selectedVisualization}
                isReportExecuting={isReportExecuting}
                showEditVisualizationButton={!reportFlags.isNew && reportFlags.canEdit}
                onEditVisualization={editVisualization}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

ReportSource.propTypes = {
  report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const ReportSourcePage = wrapReportPage(ReportSource);

routes.register(
  "Reports.New",
  routeWithUserSession({
    path: "/reports/new",
    render: pageProps => <ReportSourcePage {...pageProps} />,
    headerBlock: <h1></h1>,
    bodyClass: "fixed-layout",
  })
);
routes.register(
  "Reports.Edit",
  routeWithUserSession({
    path: "/reports/:reportId/source",
    render: pageProps => <ReportSourcePage {...pageProps} />,
    headerBlock: <h1></h1>,
    bodyClass: "fixed-layout",
  })
);
