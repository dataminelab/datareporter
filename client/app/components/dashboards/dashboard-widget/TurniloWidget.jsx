import React from "react";
import PropTypes from "prop-types";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application-widget";
import Widget from "./Widget";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";

function TurniloWidget(props) {
  const { widget, canEdit, config } = props;
  const turniloHash = config.hash || widget.text.replace('[turnilo-widget]', '');
  const TurniloMenuOptions = [];

  if (!widget.width) {
    return null;
  }

  if (config.appSettings) {
    if (config.appSettings.customization.sentryDSN) {
      errorReporterInit(config.appSettings.customization.sentryDSN, config.version);
    }

    const version = config.version;

    Ajax.version = version;

    const appSettings = AppSettings.fromJS(config.appSettings, {
      executorFactory: Ajax.queryUrlExecutorFactory.bind(config)
    });

    return ( 
      <Widget {...props} menuOptions={canEdit ? TurniloMenuOptions : null} className="widget-report">
        <turnilo-widget>
          <TurniloApplication
            config={config}
            version={version}
            hashWidget={turniloHash}
            appSettings={appSettings}
            initTimekeeper={config.timekeeper ? Timekeeper.fromJS(config.timekeeper) : new Timekeeper({ timeTags: [] })}
          />
        </turnilo-widget>
      </Widget>
    );
  } else {
    return (
      <Widget {...props} menuOptions={canEdit ? TurniloMenuOptions : null} className="widget-text">
        <h4>Loading...</h4>
      </Widget>
    );
  }

}

TurniloWidget.propTypes = {
  widget: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  canEdit: PropTypes.bool,
  config: PropTypes.object,
};

TurniloWidget.defaultProps = {
  canEdit: false,
};

export default TurniloWidget;
