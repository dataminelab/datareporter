import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import useMedia from "use-media";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import recordEvent from "@/services/recordEvent";
import routes from "@/services/routes";

import ReportPageHeader from "./components/ReportPageHeader";
import wrapReportPage from "./components/wrapReportPage";
import ReportEditor from "./components/ReportEditor";
import ReportMetadata from "./components/ReportMetadata";
import QueryExecutionStatus from "../queries/components/QueryExecutionStatus";

import useReport from "./hooks/useReport";
import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useReportExecute from "./hooks/useReportExecute";
import useReportDataSources from "./hooks/useReportDataSources";
import useReportFlags from "./hooks/useReportFlags";
import useEditScheduleDialog from "./hooks/useEditScheduleDialog";
import useUnsavedChangesAlert from "./hooks/useUnsavedChangesAlert";

import "./ReportSource.less";

function ReportSource(props) {
  const { report, setReport, isDirty } = useReport(props.report);
  const { dataSource } = useReportDataSources(report);
  const reportFlags = useReportFlags(report, dataSource);
  const [selectedVisualization] = useVisualizationTabHandler(
    report.visualizations,
  );
  const isMobile = !useMedia({ minWidth: 768 });
  const [reportChanged, setReportChanged] = useState(false);
  const editSchedule = useEditScheduleDialog(report, setReport);

  useUnsavedChangesAlert(isDirty);
  const {
    isExecuting,
    error: executionError,
    executionStatus,
    updatedAt,
    isCancelling: isExecutionCancelling,
    cancelCallback: cancelExecution,
    triggerExecution,
  } = useReportExecute(report);

  useEffect(() => {
    report.setTriggerExecution(triggerExecution);
    report.setExecutionStatus(executionStatus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    report.setExecutionStatus(executionStatus);
  }, [executionStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // TODO: ignore new pages?
    recordEvent("view_source", "report", report.id);
  }, [report.id]);

  useEffect(() => {
    document.title = report.name;
  }, [report.name]);

  return (
    <div
      className={cx("report-page-wrapper", {
        "report-fixed-layout": !isMobile,
      })}
    >
      <div className="container w-100 p-b-10">
        <ReportPageHeader
          reportChanged={reportChanged}
          setReportChanged={setReportChanged}
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
              style={{ left: 0, top: 0, right: 0, bottom: 0, overflow: "auto" }}
            >
              <ReportEditor
                report={report}
                reportChanged={reportChanged}
                setReportChanged={setReportChanged}
              />
              {!reportFlags.isNew && (
                <div className="report-source-metadata-overlay">
                  <ReportMetadata
                    layout="horizontal"
                    report={report}
                    dataSource={dataSource}
                    onEditSchedule={editSchedule}
                  />
                </div>
              )}
            </div>
          </div>
          {(executionError || isExecuting) && (
            <div className="query-alerts">
              <QueryExecutionStatus
                status={executionStatus}
                updatedAt={updatedAt}
                error={executionError}
                isCancelling={isExecutionCancelling}
                onCancel={cancelExecution}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

ReportSource.propTypes = {
  report: PropTypes.object.isRequired,
};

const ReportSourcePage = wrapReportPage(ReportSource);

routes.register(
  "Reports.New",
  routeWithUserSession({
    path: "/reports/new",
    render: pageProps => <ReportSourcePage {...pageProps} />,
    bodyClass: "fixed-layout",
  }),
);

routes.register(
  "Reports.Edit",
  routeWithUserSession({
    path: "/reports/:reportId/source",
    render: pageProps => <ReportSourcePage {...pageProps} />,
    bodyClass: "fixed-layout",
  }),
);

routes.register(
  "Reports.View",
  routeWithUserSession({
    path: "/reports/:reportId",
    render: pageProps => <ReportSourcePage {...pageProps} />,
  }),
);
