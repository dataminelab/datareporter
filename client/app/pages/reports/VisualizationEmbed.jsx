import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import routeWithApiKeySession from "@/components/ApplicationArea/routeWithApiKeySession";

import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import Report from "@/services/reportFake";
import routes from "@/services/routes";

import ReportView from "@/components/ReportView";

function VisualizationEmbed({ reportId, visualizationId, apiKey, onError }) {
  const [report, setReport] = useState(null);

  const handleError = useImmutableCallback(onError);

  useEffect(() => {
    let isCancelled = false;
    Report.get({ id: reportId })
      .then(result => {
        if (!isCancelled) {
          setReport(result);
        }
      })
      .catch(handleError);

    return () => {
      isCancelled = true;
    };
  }, [reportId, handleError]);

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
  reportId: PropTypes.string.isRequired,
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
    path: "/embed/report/:reportId",
    render: pageProps => <VisualizationEmbed {...pageProps} />,
    getApiKey: () => 'some key',
  })
);
