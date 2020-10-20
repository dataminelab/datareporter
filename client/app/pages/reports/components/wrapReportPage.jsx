import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LoadingState from "@/components/items-list/components/LoadingState";
import { Report } from "@/services/report";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function wrapReportPage(WrappedComponent) {
  function ReportPageWrapper({ queryId, onError, ...props }) {
    const [report, setReport] = useState(null);

    const handleError = useImmutableCallback(onError);

    useEffect(() => {
      let isCancelled = false;
      const promise = queryId ? Report.get({ id: queryId }) : Promise.resolve(Report.newReport());
      promise
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
      return <LoadingState className="flex-fill" />;
    }

    return <WrappedComponent report={report} onError={onError} {...props} />;
  }

  ReportPageWrapper.propTypes = {
    queryId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  ReportPageWrapper.defaultProps = {
    queryId: null,
  };

  return ReportPageWrapper;
}
