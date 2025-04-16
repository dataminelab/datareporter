import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LoadingState from "@/components/items-list/components/LoadingState";
import { Report } from "@/services/report";
import useImmutableCallback from "@/lib/hooks/useImmutableCallback";
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';

export default function wrapReportPage(WrappedComponent) {
  function ReportPageWrapper({ reportId, onError, ...props }) {
    const [report, setReport] = useState(null);

    const handleError = useImmutableCallback(onError);

    useEffect(() => {
      const controller = typeof AbortController !== 'undefined' ? new (require('abortcontroller-polyfill/dist/cjs-ponyfill').AbortController)() : null;
      const { signal } = controller;

      const fetchReport = async () => {
        try {
          const result = reportId
            ? await Report.get({ id: reportId, signal })
            : Report.newReport();
          setReport(result);
        } catch (error) {
          if (!signal.aborted) {
            handleError(error);
          }
        }
      };

      fetchReport();

      return () => controller.abort();
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
