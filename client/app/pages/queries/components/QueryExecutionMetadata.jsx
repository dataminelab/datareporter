import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import WarningTwoTone from "@ant-design/icons/WarningTwoTone";
import { BarChartOutlined, LoadingOutlined } from "@ant-design/icons";
import TimeAgo from "@/components/TimeAgo";
import Tooltip from "@/components/Tooltip";
import useAddToDashboardDialog from "../hooks/useAddToDashboardDialog";
import useEmbedDialog from "../hooks/useEmbedDialog";
import QueryControlDropdown from "@/components/EditVisualizationButton/QueryControlDropdown";
import EditVisualizationButton from "@/components/EditVisualizationButton";
import useQueryResultData from "@/lib/useQueryResultData";
import { durationHumanize, pluralize, prettySize } from "@/lib/utils";
import { isUndefined } from "lodash";
import Model from "@/services/model";
import notification from "@/services/notification";

import "./QueryExecutionMetadata.less";

export default function QueryExecutionMetadata({
  query,
  queryResult,
  isQueryExecuting,
  selectedVisualization,
  showEditVisualizationButton,
  onEditVisualization,
  extraActions,
}) {
  const queryResultData = useQueryResultData(queryResult);
  const openAddToDashboardDialog = useAddToDashboardDialog(query);
  const openEmbedDialog = useEmbedDialog(query);
  const [isCreatingModel, setIsCreatingModel] = useState(false);

  const handleExploreInOLAP = useCallback(() => {
    if (!query.id || !query.data_source_id || isCreatingModel) return;
    setIsCreatingModel(true);
    Model.createEphemeral({
      query_id: query.id,
      data_source_id: query.data_source_id,
    })
      .then(() => {
        window.location.href = "/report";
      })
      .catch(error => {
        const msg =
          error?.response?.data?.message || "Failed to create OLAP model";
        notification.error(msg);
      })
      .finally(() => {
        setIsCreatingModel(false);
      });
  }, [query.id, query.data_source_id, isCreatingModel]);

  return (
    <div className="query-execution-metadata">
      <span className="m-r-5">
        <QueryControlDropdown
          query={query}
          queryResult={queryResult}
          queryExecuting={isQueryExecuting}
          showEmbedDialog={openEmbedDialog}
          embed={false}
          apiKey={query.api_key}
          selectedTab={selectedVisualization}
          openAddToDashboardForm={openAddToDashboardDialog}
        />
      </span>
      {extraActions}
      {query.id && query.data_source_id && (
        <Tooltip title="Create an OLAP model and explore in Turnilo">
          <button
            className="explore-olap-btn m-r-5"
            onClick={handleExploreInOLAP}
            disabled={isCreatingModel}
          >
            {isCreatingModel ? <LoadingOutlined /> : <BarChartOutlined />}
            <span className="hidden-xs"> Explore in OLAP</span>
          </button>
        </Tooltip>
      )}
      {showEditVisualizationButton && (
        <EditVisualizationButton
          openVisualizationEditor={onEditVisualization}
          selectedTab={selectedVisualization}
        />
      )}
      <span className="m-l-5 m-r-10">
        <span>
          {queryResultData.truncated === true && (
            <span className="m-r-5">
              <Tooltip
                title={
                  "Result truncated to " +
                  queryResultData.rows.length +
                  " rows. Databricks may truncate query results that are unstably large."
                }
              >
                <WarningTwoTone twoToneColor="#FF9800" />
              </Tooltip>
            </span>
          )}
          <strong>{queryResultData.rows.length}</strong>{" "}
          {pluralize("row", queryResultData.rows.length)}
        </span>
        <span className="m-l-5">
          {!isQueryExecuting && (
            <React.Fragment>
              <strong>{durationHumanize(queryResultData.runtime)}</strong>
              <span className="hidden-xs"> runtime</span>
            </React.Fragment>
          )}
          {isQueryExecuting && <span>Running&hellip;</span>}
        </span>
        {!isUndefined(queryResultData.metadata.data_scanned) &&
          !isQueryExecuting && (
            <span className="m-l-5">
              Data Scanned{" "}
              <strong>
                {prettySize(queryResultData.metadata.data_scanned)}
              </strong>
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

QueryExecutionMetadata.propTypes = {
  query: PropTypes.object.isRequired,
  queryResult: PropTypes.object.isRequired,
  isQueryExecuting: PropTypes.bool,
  selectedVisualization: PropTypes.number,
  showEditVisualizationButton: PropTypes.bool,
  onEditVisualization: PropTypes.func,
  extraActions: PropTypes.node,
};

QueryExecutionMetadata.defaultProps = {
  isQueryExecuting: false,
  selectedVisualization: null,
  showEditVisualizationButton: false,
  onEditVisualization: () => {},
  extraActions: null,
};
