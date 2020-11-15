import { find, has } from "lodash";
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { markdown } from "markdown";

import Icon from "antd/lib/icon";
import Menu from "antd/lib/menu";
import routeWithApiKeySession from "@/components/ApplicationArea/routeWithApiKeySession";
import { Moment } from "@/components/proptypes";
import ReportResultsLink from "@/components/EditVisualizationButton/ReportResultsLink";
import VisualizationName from "@/components/visualizations/VisualizationName";

import { VisualizationType } from "@redash/viz/lib";
import HtmlContent from "@redash/viz/lib/components/HtmlContent";

import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import Report from "@/services/reportFake";
import location from "@/services/location";
import routes from "@/services/routes";

import logoUrl from "@/assets/images/redash_icon_small.png";
import ReportView from "@/components/ReportView";

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
      <ReportView hash={report.return}  />
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

  if (!report) {
    return null;
  }

  return (
    <div className="tile m-t-10 m-l-10 m-r-10 p-t-10 embed__vis" data-test="VisualizationEmbed">
      <ReportView hash={report.report} />
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
  "ReportVisualizations.ViewShared",
  routeWithApiKeySession({
    path: "/embed/report/:queryId/visualization/:visualizationId",
    render: pageProps => <VisualizationEmbed {...pageProps} />,
    getApiKey: () => location.search.api_key,
  })
);
