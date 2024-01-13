import React  from 'react';
import PropTypes from "prop-types";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";
import "@/components/TurniloComponent/client/main.scss";
import "@/components/TurniloComponent/client/polyfills";

function ReportPage({ report, reportChanged, setReportChanged }) {
  console.log("repoirt gere?", report)
  if (report.appSettings) {
    if (report.appSettings.customization.sentryDSN) {
      errorReporterInit(report.appSettings.customization.sentryDSN, report.version);
    }

    const version = report.version;

    Ajax.version = version;

    const appSettings = AppSettings.fromJS(report.appSettings, {
      executorFactory: Ajax.queryUrlExecutorFactory.bind(report)
    });

    return <turnilo-widget>
      <TurniloApplication
        version={version}
        report={report}
        reportChanged={reportChanged}
        setReportChanged={setReportChanged}
        appSettings={appSettings} 
        initTimekeeper={report.timekeeper ? Timekeeper.fromJS(report.timekeeper) : new Timekeeper({ timeTags: [] })}
      />
    </turnilo-widget>;
  } else {
    return <div style={{margin: '20px'}}>
            Please select data source and model...
          </div>
  }
}

ReportPage.propTypes = {
  dashboardSlug: PropTypes.string,
  dashboardId: PropTypes.string,
  onError: PropTypes.func,
};

ReportPage.defaultProps = {
  dashboardSlug: null,
  dashboardId: null,
  onError: PropTypes.func,
};

export default ReportPage;
