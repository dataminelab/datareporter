import React, { useEffect } from "react";
import PropTypes from "prop-types";
import cx from "classnames";

import useMedia from "use-media";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import recordEvent from "@/services/recordEvent";
import routes from "@/services/routes";

import ReportPageHeader from "./components/ReportPageHeader";
import wrapReportPage from "./components/wrapReportPage";
import ReportExecutionMetadata from "./components/ReportExecutionMetadata";
import ReportEditor from "./components/ReportEditor";

import useReport from "./hooks/useReport";
import useVisualizationTabHandler from "./hooks/useVisualizationTabHandler";
import useReportExecute from "./hooks/useReportExecute";
import useReportFlags from "./hooks/useReportFlags";
import useEditVisualizationDialog from "./hooks/useEditVisualizationDialog";
import useUnsavedChangesAlert from "./hooks/useUnsavedChangesAlert";

import "./ReportSource.less";


function ReportSource(props) {
  const { report, setReport, isDirty } = useReport(props.report);
  const reportFlags = useReportFlags(report, []);
  const [selectedVisualization] = useVisualizationTabHandler(report.visualizations);
  const isMobile = !useMedia({ minWidth: 768 });

  useUnsavedChangesAlert(isDirty);

  const {
    reportResult,
    isExecuting: isReportExecuting,
  } = useReportExecute(report);

  useEffect(() => {
    // TODO: ignore new pages?
    recordEvent("view_source", "report", report.id);
  }, [report.id]);

  useEffect(() => {
    document.title = report.name;
  }, [report.name]);


  const editVisualization = useEditVisualizationDialog(report, reportResult, newReport => setReport(newReport));

  return (
    <div className={cx("report-page-wrapper", { "report-fixed-layout": !isMobile })}>
      <div className="container w-100 p-b-10">
        <ReportPageHeader
          report={report}
          dataSource={[]}
          sourceMode
          selectedVisualization={selectedVisualization}
          onChange={setReport}
          onChangeDataSource={handleDataSourceChange}
        />
      </div>
      <main className="report-fullscreen">
        <div className="content turnilo-widget report-widget ">
          <div className="flex-fill p-relative">
            <div
              className="p-absolute d-flex flex-column p-l-15 p-r-15"
              style={{ left: 0, top: 0, right: 0, bottom: 0, overflow: "auto" }}>
              <ReportEditor report={report} />
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
