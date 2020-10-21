import React from "react";
import PropTypes from "prop-types";
import Menu from "antd/lib/menu";
import {TurniloApplication} from "@/components/TurniloComponent/client/applications/turnilo-application/turnilo-application-widget";
import Widget from "./Widget";
import {Timekeeper} from "@/components/TurniloComponent/common/models/timekeeper/timekeeper";
import {init as errorReporterInit} from "@/components/TurniloComponent/client/utils/error-reporter/error-reporter";
import {Ajax} from "@/components/TurniloComponent/client/utils/ajax/ajax";
import {AppSettings} from "@/components/TurniloComponent/common/models/app-settings/app-settings";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import location from "@/services/location";

function TurniloWidget(props) {
  const { widget, canEdit, config } = props;

  const turniloHash = '#' + widget.text.replace('[turnilo-widget]', '')
  const editTurnilo = () => {
    // eslint-disable-next-line no-restricted-globals
    let backUrl = location.url.split('/')[2];
    navigateTo(`/report/?back=${backUrl}&widgetId=${widget.id}&dashboardId=${widget.dashboard_id}${turniloHash}`);
  };

  const TurniloMenuOptions = [
    <Menu.Item key="edit" onClick={editTurnilo}>
      Edit
    </Menu.Item>,
  ];

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
      executorFactory: Ajax.queryUrlExecutorFactory
    });

    return (
      <Widget {...props} menuOptions={canEdit ? TurniloMenuOptions : null} className="widget-text">
        <turnilo-widget>
          <TurniloApplication
            version={version}
            hashWidget={turniloHash}
            appSettings={appSettings}
            initTimekeeper={Timekeeper.fromJS(config.timekeeper)}
          />
        </turnilo-widget>;
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
