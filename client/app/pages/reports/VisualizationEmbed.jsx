import { find, has } from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { markdown } from "markdown";

import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Icon from "antd/lib/icon";
import Menu from "antd/lib/menu";
import Tooltip from "antd/lib/tooltip";
import routeWithApiKeySession from "@/components/ApplicationArea/routeWithApiKeySession";
import Parameters from "@/components/Parameters";
import { Moment } from "@/components/proptypes";
import TimeAgo from "@/components/TimeAgo";
import Timer from "@/components/Timer";
import ReportResultsLink from "@/components/EditVisualizationButton/ReportResultsLink";
import VisualizationName from "@/components/visualizations/VisualizationName";
import VisualizationRenderer from "@/components/visualizations/VisualizationRenderer";

import { VisualizationType } from "@redash/viz/lib";
import HtmlContent from "@redash/viz/lib/components/HtmlContent";

import { formatDateTime } from "@/lib/utils";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import { Report } from "@/services/report";
import location from "@/services/location";
import routes from "@/services/routes";

import logoUrl from "@/assets/images/redash_icon_small.png";

function VisualizationEmbedHeader({ queryName, queryDescription, visualization }) {
  return (
    <div className="embed-heading p-b-10 p-r-15 p-l-15">
      <h3>
        <img src={logoUrl} alt="Redash Logo" style={{ height: "24px", verticalAlign: "text-bottom" }} />
        <VisualizationName visualization={visualization} /> {queryName}
        {queryDescription && (
          <small>
            <HtmlContent className="markdown text-muted">{markdown.toHTML(queryDescription || "")}</HtmlContent>
          </small>
        )}
      </h3>
    </div>
  );
}

VisualizationEmbedHeader.propTypes = {
  queryName: PropTypes.string.isRequired,
  queryDescription: PropTypes.string,
  visualization: VisualizationType.isRequired,
};

VisualizationEmbedHeader.defaultProps = { queryDescription: "" };

function VisualizationEmbedFooter({
  report,
  queryResults,
  updatedAt,
  refreshStartedAt,
  queryUrl,
  hideTimestamp,
  apiKey,
}) {
  const downloadMenu = (
    <Menu>
      <Menu.Item>
        <ReportResultsLink
          fileType="csv"
          report={report}
          queryResult={queryResults}
          apiKey={apiKey}
          disabled={!queryResults || !queryResults.getData || !queryResults.getData()}
          embed>
          <Icon type="file" /> Download as CSV File
        </ReportResultsLink>
      </Menu.Item>
      <Menu.Item>
        <ReportResultsLink
          fileType="tsv"
          report={report}
          queryResult={queryResults}
          apiKey={apiKey}
          disabled={!queryResults || !queryResults.getData || !queryResults.getData()}
          embed>
          <Icon type="file" /> Download as TSV File
        </ReportResultsLink>
      </Menu.Item>
      <Menu.Item>
        <ReportResultsLink
          fileType="xlsx"
          report={report}
          queryResult={queryResults}
          apiKey={apiKey}
          disabled={!queryResults || !queryResults.getData || !queryResults.getData()}
          embed>
          <Icon type="file-excel" /> Download as Excel File
        </ReportResultsLink>
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="tile__bottom-control">
      {!hideTimestamp && (
        <span>
          <a className="small hidden-print">
            <i className="zmdi zmdi-time-restore" />{" "}
            {refreshStartedAt ? <Timer from={refreshStartedAt} /> : <TimeAgo date={updatedAt} />}
          </a>
          <span className="small visible-print">
            <i className="zmdi zmdi-time-restore" /> {formatDateTime(updatedAt)}
          </span>
        </span>
      )}
      {queryUrl && (
        <span className="hidden-print">
          <Tooltip title="Open in Redash">
            <Button className="icon-button" href={queryUrl} target="_blank">
              <i className="fa fa-external-link" />
            </Button>
          </Tooltip>
          {!report.hasParameters() && (
            <Dropdown overlay={downloadMenu} disabled={!queryResults} trigger={["click"]} placement="topLeft">
              <Button loading={!queryResults && !!refreshStartedAt} className="m-l-5">
                Download Dataset
                <i className="fa fa-caret-up m-l-5" />
              </Button>
            </Dropdown>
          )}
        </span>
      )}
    </div>
  );
}

VisualizationEmbedFooter.propTypes = {
  report: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  queryResults: PropTypes.object, // eslint-disable-line react/forbid-prop-types
  updatedAt: PropTypes.string,
  refreshStartedAt: Moment,
  queryUrl: PropTypes.string,
  hideTimestamp: PropTypes.bool,
  apiKey: PropTypes.string,
};

VisualizationEmbedFooter.defaultProps = {
  queryResults: null,
  updatedAt: null,
  refreshStartedAt: null,
  queryUrl: null,
  hideTimestamp: false,
  apiKey: null,
};

function VisualizationEmbed({ queryId, visualizationId, apiKey, onError }) {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [refreshStartedAt, setRefreshStartedAt] = useState(null);
  const [queryResults, setReportResults] = useState(null);

  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    let isCancelled = false;
    Report.get({ id: queryId })
      .then(result => {
        if (!isCancelled) {
          setReport(result);
        }
      })
      .catch(handleError);

    return () => {
      isCancelled = true;
    };
  }, [queryId, handleError]);

  const refreshReportResults = useCallback(() => {
    if (report) {
      setError(null);
      setRefreshStartedAt(moment());
      report
        .getReportResultPromise()
        .then(result => {
          setReportResults(result);
        })
        .catch(err => {
          setError(err.getError());
        })
        .finally(() => setRefreshStartedAt(null));
    }
  }, [report]);

  useEffect(() => {
    document.querySelector("body").classList.add("headless");
    refreshReportResults();
  }, [refreshReportResults]);

  if (!report) {
    return null;
  }

  const hideHeader = has(location.search, "hide_header");
  const hideParametersUI = has(location.search, "hide_parameters");
  const hideReportLink = has(location.search, "hide_link");
  const hideTimestamp = has(location.search, "hide_timestamp");

  const showReportDescription = has(location.search, "showDescription");
  visualizationId = parseInt(visualizationId, 10);
  const visualization = find(report.visualizations, vis => vis.id === visualizationId);

  if (!visualization) {
    // call error handler async, otherwise it will destroy the component on render phase
    setTimeout(() => {
      onError(new Error("Visualization does not exist"));
    }, 10);
    return null;
  }

  return (
    <div className="tile m-t-10 m-l-10 m-r-10 p-t-10 embed__vis" data-test="VisualizationEmbed">
      {!hideHeader && (
        <VisualizationEmbedHeader
          queryName={report.name}
          queryDescription={showReportDescription ? report.description : null}
          visualization={visualization}
        />
      )}
      <div className="col-md-12 query__vis">
        {!hideParametersUI && report.hasParameters() && (
          <div className="p-t-15 p-b-10">
            <Parameters parameters={report.getParametersDefs()} onValuesChange={refreshReportResults} />
          </div>
        )}
        {error && <div className="alert alert-danger" data-test="ErrorMessage">{`Error: ${error}`}</div>}
        {!error && queryResults && (
          <VisualizationRenderer visualization={visualization} queryResult={queryResults} context="widget" />
        )}
        {!queryResults && refreshStartedAt && (
          <div className="d-flex justify-content-center">
            <div className="spinner">
              <i className="zmdi zmdi-refresh zmdi-hc-spin zmdi-hc-5x" />
            </div>
          </div>
        )}
      </div>
      <VisualizationEmbedFooter
        report={report}
        queryResults={queryResults}
        updatedAt={queryResults ? queryResults.getUpdatedAt() : undefined}
        refreshStartedAt={refreshStartedAt}
        queryUrl={!hideReportLink ? report.getUrl() : null}
        hideTimestamp={hideTimestamp}
        apiKey={apiKey}
      />
    </div>
  );
}

VisualizationEmbed.propTypes = {
  queryId: PropTypes.string.isRequired,
  visualizationId: PropTypes.string,
  apiKey: PropTypes.string.isRequired,
  onError: PropTypes.func,
};

VisualizationEmbed.defaultProps = {
  onError: () => {},
};

routes.register(
  "Visualizations.ViewShared",
  routeWithApiKeySession({
    path: "/embed/report/:queryId/visualization/:visualizationId",
    render: pageProps => <VisualizationEmbed {...pageProps} />,
    getApiKey: () => location.search.api_key,
  })
);
