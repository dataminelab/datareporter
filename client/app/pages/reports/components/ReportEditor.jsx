import React,  {  useState,  useEffect }  from 'react';
import PropTypes from "prop-types";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";
import "@/components/TurniloComponent/client/main.scss";
import "@/components/TurniloComponent/client/polyfills";
import {axios} from "@/services/axios";

function TurniloPage({ dashboardSlug, dashboardId, onError }) {
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

    return <turnilo-widget>
      <TurniloApplication
        version={version}
        appSettings={appSettings}
        initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
      />
    </turnilo-widget>;
  } else {
    return <div>
            Loading...
          </div>
  }
}

TurniloPage.propTypes = {
  dashboardSlug: PropTypes.string,
  dashboardId: PropTypes.string,
  onError: PropTypes.func,
};

TurniloPage.defaultProps = {
  dashboardSlug: null,
  dashboardId: null,
  onError: PropTypes.func,
};

export default TurniloPage;
