import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import cx from "classnames";
import useMedia from "use-media";
import Button from "antd/lib/button";
import Icon from "antd/lib/icon";

import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import EditInPlace from "@/components/EditInPlace";
import Parameters from "@/components/Parameters";

import DataSource from "@/services/data-source";
import { ExecutionStatus } from "@/services/report-result";
import routes from "@/services/routes";

import useReportResultData from "@/lib/useReportResultData";

import ReportPageHeader from "./components/ReportPageHeader";
import ReportVisualizationTabs from "./components/ReportVisualizationTabs";
import ReportExecutionStatus from "./components/ReportExecutionStatus";
import ReportMetadata from "./components/ReportMetadata";
import wrapReportPage from "./components/wrapReportPage";
import ReportViewButton from "./components/ReportViewButton";
import ReportExecutionMetadata from "./components/ReportExecutionMetadata";

import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useReportExecute from "./hooks/useReportExecute";
import useUpdateReportDescription from "./hooks/useUpdateReportDescription";
import useReportFlags from "./hooks/useReportFlags";
import useReportParameters from "./hooks/useReportParameters";
import useEditScheduleDialog from "./hooks/useEditScheduleDialog";
import useEditVisualizationDialog from "./hooks/useEditVisualizationDialog";
import useDeleteVisualization from "./hooks/useDeleteVisualization";
import useFullscreenHandler from "../../lib/hooks/useFullscreenHandler";

import "./ReportView.less";

function ReportView(props) {
  const [report, setReport] = useState(props.report);
  const [dataSource, setDataSource] = useState();
  const queryFlags = useReportFlags(report, dataSource);
  const [parameters, areParametersDirty, updateParametersDirtyFlag] = useReportParameters(report);
  const [selectedVisualization, setSelectedVisualization] = useVisualizationTabHandler(report.visualizations);
  const isDesktop = useMedia({ minWidth: 768 });
  const isFixedLayout = useMedia({ minHeight: 500 }) && isDesktop;
  const [fullscreen, toggleFullscreen] = useFullscreenHandler(isDesktop);
  const [addingDescription, setAddingDescription] = useState(false);
  
  const {
    queryResult,
    loadedInitialResults,
    isExecuting,
    executionStatus,
    executeReport,
    error: executionError,
    cancelCallback: cancelExecution,
    isCancelling: isExecutionCancelling,
    updatedAt,
  } = useReportExecute(report);

  const queryResultData = useReportResultData(queryResult);

  const updateReportDescription = useUpdateReportDescription(report, setReport);
  const editSchedule = useEditScheduleDialog(report, setReport);
  const addVisualization = useEditVisualizationDialog(report, queryResult, (newReport, visualization) => {
    setReport(newReport);
    setSelectedVisualization(visualization.id);
  });
  const editVisualization = useEditVisualizationDialog(report, queryResult, newReport => setReport(newReport));
  const deleteVisualization = useDeleteVisualization(report, setReport);

  const doExecuteReport = useCallback(
    (skipParametersDirtyFlag = false) => {
      if (!queryFlags.canExecute || (!skipParametersDirtyFlag && (areParametersDirty || isExecuting))) {
        return;
      }
      executeReport();
    },
    [areParametersDirty, executeReport, isExecuting, queryFlags.canExecute]
  );

  useEffect(() => {
    console.log("inside useEffect", report)
    document.title = report.name;
    // let updates = {name: document.title}
    // props.onChange(extend(report.clone(), updates));
    // updateReport(updates, { successMessage: null });
    // document.getElementsByClassName("editable")[0].innerText = document.title
  }, [report.name]);

  useEffect(() => {
    DataSource.get({ id: report.data_source_id }).then(setDataSource);
  }, [report.data_source_id]);

  return (
    <div
      className={cx("report-page-wrapper", {
        "report-view-fullscreen": fullscreen,
        "report-fixed-layout": isFixedLayout,
      })}>
      <div className="container w-100">
        <ReportPageHeader
          report={report}
          dataSource={dataSource}
          onChange={setReport}
          selectedVisualization={selectedVisualization}
          headerExtra={
            <ReportViewButton
              className="m-r-5"
              type="primary"
              shortcut="mod+enter, alt+enter, ctrl+enter"
              disabled={!queryFlags.canExecute || isExecuting || areParametersDirty}
              onClick={doExecuteReport}>
              Refresh
            </ReportViewButton>
          }
          tagsExtra={
            !report.description &&
            queryFlags.canEdit &&
            !addingDescription &&
            !fullscreen && (
              <a className="label label-tag hidden-xs" role="none" onClick={() => setAddingDescription(true)}>
                <i className="zmdi zmdi-plus m-r-5" />
                Add description
              </a>
            )
          }
        />
        {(report.description || addingDescription) && (
          <div className={cx("m-t-5", { hidden: fullscreen })}>
            <EditInPlace
              className="w-100"
              value={report.description}
              isEditable={queryFlags.canEdit}
              onDone={updateReportDescription}
              onStopEditing={() => setAddingDescription(false)}
              placeholder="Add description"
              ignoreBlanks={false}
              editorProps={{ autosize: { minRows: 2, maxRows: 4 } }}
              defaultEditing={addingDescription}
              multiline
            />
          </div>
        )}
      </div>
      <div className="report-view-content">
        {report.hasParameters() && (
          <div className={cx("bg-white tiled p-15 m-t-15 m-l-15 m-r-15", { hidden: fullscreen })}>
            <Parameters
              parameters={parameters}
              onValuesChange={() => {
                updateParametersDirtyFlag(false);
                doExecuteReport(true);
              }}
              onPendingValuesChange={() => updateParametersDirtyFlag()}
            />
          </div>
        )}
        <div className="report-results m-t-15">
          {loadedInitialResults && (
            <ReportVisualizationTabs
              queryResult={queryResult}
              visualizations={report.visualizations}
              showNewVisualizationButton={queryFlags.canEdit && queryResultData.status === ExecutionStatus.DONE}
              canDeleteVisualizations={queryFlags.canEdit}
              selectedTab={selectedVisualization}
              onChangeTab={setSelectedVisualization}
              onAddVisualization={addVisualization}
              onDeleteVisualization={deleteVisualization}
              refreshButton={
                <Button
                  type="primary"
                  disabled={!queryFlags.canExecute || areParametersDirty}
                  loading={isExecuting}
                  onClick={doExecuteReport}>
                  {!isExecuting && <i className="zmdi zmdi-refresh m-r-5" aria-hidden="true" />}
                  Refresh Now
                </Button>
              }
            />
          )}
          <div className="report-results-footer">
            {queryResult && !queryResult.getError() && (
              <ReportExecutionMetadata
                report={report}
                queryResult={queryResult}
                selectedVisualization={selectedVisualization}
                isReportExecuting={isExecuting}
                showEditVisualizationButton={queryFlags.canEdit}
                onEditVisualization={editVisualization}
                extraActions={
                  <ReportViewButton
                    className="icon-button m-r-5 hidden-xs"
                    title="Toggle Fullscreen"
                    type="default"
                    shortcut="alt+f"
                    onClick={toggleFullscreen}>
                    <Icon type={fullscreen ? "fullscreen-exit" : "fullscreen"} />
                  </ReportViewButton>
                }
              />
            )}
            {(executionError || isExecuting) && (
              <div className="report-execution-status">
                <ReportExecutionStatus
                  status={executionStatus}
                  error={executionError}
                  isCancelling={isExecutionCancelling}
                  onCancel={cancelExecution}
                  updatedAt={updatedAt}
                />
              </div>
            )}
          </div>
        </div>
        <div className={cx("p-t-15 p-r-15 p-l-15", { hidden: fullscreen })}>
          <ReportMetadata layout="horizontal" report={report} dataSource={dataSource} onEditSchedule={editSchedule} />
        </div>
      </div>
    </div>
  );
}

ReportView.propTypes = { report: PropTypes.object.isRequired }; // eslint-disable-line react/forbid-prop-types

const ReportViewPage = wrapReportPage(ReportView);

routes.register(
  "Reports.View",
  routeWithUserSession({
    path: "/reports/:queryId",
    render: pageProps => <ReportViewPage {...pageProps} />,
  })
);
