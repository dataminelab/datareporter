import React, { useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Timekeeper } from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import { TurniloApplication } from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application";
import { init as errorReporterInit } from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import { Ajax } from "@/components/TurniloComponent/client/utils/ajax/ajax";
import { AppSettings } from "@/components/TurniloComponent/common/models/app-settings/app-settings";
import "@/components/TurniloComponent/client/main.scss";
import "@/components/TurniloComponent/client/polyfills";
import { Report } from "../../../services/report.js";

/**
 * @param {Object} props
 * @param {Report} props.report
 * @param {boolean} props.reportChanged
 * @param {Function} props.setReportChanged
 */
function ReportPage({ report, reportChanged, setReportChanged }) {
  const reportRef = useRef(report);
  reportRef.current = report;
  const getExecutionStatus = useCallback(
    () => reportRef.current.getExecutionStatus(),
    [],
  );

  if (!report.appSettings) {
    return (
      <div style={{ margin: "20px" }}>
        Please select data source and model...
      </div>
    );
  }

  if (report.appSettings.customization.sentryDSN) {
    errorReporterInit(
      report.appSettings.customization.sentryDSN,
      report.version,
    );
  }

  Ajax.version = report.version;
  const appSettings = AppSettings.fromJS(report.appSettings, {
    executorFactory: (
      dataCube,
      getEssence,
      statusCallback,
      getExecutionStatus,
    ) => {
      Ajax.model_id = report.model_id;
      Ajax.hash = report.hash;
      return Ajax.queryUrlExecutorFactory(
        dataCube,
        getEssence,
        statusCallback,
        getExecutionStatus,
      );
    },
    statusCallback: report.onExecutionStatusChange.bind(report),
    getExecutionStatus: getExecutionStatus,
  });

  const initTimekeeper = Timekeeper.fromJS({ timeTags: {} });

  return (
    <turnilo-widget>
      <TurniloApplication
        version={report.version} // get rid of the version prop in TurniloApplication
        report={report}
        reportChanged={reportChanged}
        setReportChanged={setReportChanged}
        appSettings={appSettings}
        initTimekeeper={initTimekeeper}
      />
    </turnilo-widget>
  );
}

ReportPage.propTypes = {
  report: PropTypes.instanceOf(Report),
  reportChanged: PropTypes.bool,
  setReportChanged: PropTypes.func,
  dashboardSlug: PropTypes.string,
  dashboardId: PropTypes.string,
  onError: PropTypes.func,
};

ReportPage.defaultProps = {
  report: {},
  reportChanged: false,
  setReportChanged: () => {},
  dashboardSlug: null,
  dashboardId: null,
  onError: null,
};

export default ReportPage;
