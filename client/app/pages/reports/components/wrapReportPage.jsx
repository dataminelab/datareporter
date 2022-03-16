import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LoadingState from "@/components/items-list/components/LoadingState";
import { Report } from "@/services/report";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";

export default function wrapReportPage(WrappedComponent) {
  function ReportPageWrapper({ reportId, onError, ...props }) {
    const [report, setReport] = useState(null);

    const handleError = useImmutableCallback(onError);

    useEffect(() => {
      let isCancelled = false;
      const promise = reportId ? Report.get({ id: reportId }) : Promise.resolve(Report.newReport());
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
    }, [reportId, handleError]);

    if (!report) {
      return <LoadingState className="flex-fill" />;
    }

    return <WrappedComponent report={report} onError={onError} {...props} />;
  }

  ReportPageWrapper.propTypes = {
    reportId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  };

  ReportPageWrapper.defaultProps = {
    reportId: null,
  };

  return ReportPageWrapper;
}
