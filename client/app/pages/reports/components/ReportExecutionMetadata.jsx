import React from "react";
import PropTypes from "prop-types";
import TimeAgo from "@/components/TimeAgo";
import useAddToDashboardDialog from "../hooks/useAddToDashboardDialog";
import useEmbedDialog from "../hooks/useEmbedDialog";
import ReportControlDropdown from "@/components/EditVisualizationButton/ReportControlDropdown";
import EditVisualizationButton from "@/components/EditVisualizationButton";
import useReportResultData from "@/lib/useReportResultData";
import { durationHumanize, pluralize, prettySize } from "@/lib/utils";

import "./ReportExecutionMetadata.less";

export default function ReportExecutionMetadata({
  report,
  queryResult,
  isReportExecuting,
  selectedVisualization,
  showEditVisualizationButton,
  onEditVisualization,
  extraActions,
}) {
  const queryResultData = useReportResultData(queryResult);
  const openAddToDashboardDialog = useAddToDashboardDialog(report);
  const openEmbedDialog = useEmbedDialog(report);
  return (
    <div className="report-execution-metadata">
      <span className="m-r-5">
        <ReportControlDropdown
          report={report}
          queryResult={queryResult}
          queryExecuting={isReportExecuting}
          showEmbedDialog={openEmbedDialog}
          embed={false}
          apiKey={report.api_key}
          selectedTab={selectedVisualization}
          openAddToDashboardForm={openAddToDashboardDialog}
        />
      </span>
      {extraActions}
      {showEditVisualizationButton && (
        <EditVisualizationButton openVisualizationEditor={onEditVisualization} selectedTab={selectedVisualization} />
      )}
      <span className="m-l-5 m-r-10">
        <span>
          <strong>{queryResultData.rows.length}</strong> {pluralize("row", queryResultData.rows.length)}
        </span>
        <span className="m-l-5">
          {!isReportExecuting && (
            <React.Fragment>
              <strong>{durationHumanize(queryResultData.runtime)}</strong>
              <span className="hidden-xs"> runtime</span>
            </React.Fragment>
          )}
          {isReportExecuting && <span>Running&hellip;</span>}
        </span>
        {queryResultData.metadata.data_scanned && (
          <span className="m-l-5">
            Data Scanned
            <strong>{prettySize(queryResultData.metadata.data_scanned)}</strong>
          </span>
        )}
      </span>
      <div>
        <span className="m-r-10">
          <span className="hidden-xs">Refreshed </span>
          <strong>
            <TimeAgo date={queryResultData.retrievedAt} placeholder="-" />
          </strong>
        </span>
      </div>
    </div>
  );
}

ReportExecutionMetadata.propTypes = {
  report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  queryResult: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  isReportExecuting: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  showEditVisualizationButton: PropTypes.bool,
  onEditVisualization: PropTypes.func,
  extraActions: PropTypes.node,
};

ReportExecutionMetadata.defaultProps = {
  isReportExecuting: false,
  selectedVisualization: null,
  showEditVisualizationButton: false,
  onEditVisualization: () => {},
  extraActions: null,
};
