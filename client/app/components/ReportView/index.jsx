import React, {useEffect, useState} from "react";
import PropTypes from "prop-types";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application-widget";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";
import {axios} from "@/services/axios";

function ReportView(props) {
  const { hash } = props;

  const [config, setConfig] = useState({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect( () => {
    async function getConfigTurnilo() {
      const result =  await axios.get('/config-turnilo');
      setConfig(result);
    }
    getConfigTurnilo()
  }, []);
  if (config.appSettings) {
    if (config.appSettings.customization.sentryDSN) {
      errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
    }

    const version = config.version;

    Ajax.version = version;

    const appSettings = AppSettings.fromJS(config.appSettings, {
      executorFactory: Ajax.queryUrlExecutorFactory
    });

    return (
      <div className="report-widget">
        <turnilo-widget>
          <TurniloApplication
            version={version}
            hashWidget={hash}
            appSettings={appSettings}
            initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
          />
        </turnilo-widget>
      </div>
    );
  } else {
    return (
      <h4>Loading...</h4>
    );
  }

}

ReportView.propTypes = {
  hash: PropTypes.string
};

ReportView.defaultProps = {
  canEdit: false,
};

export default ReportView;
